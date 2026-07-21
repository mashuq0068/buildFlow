import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { requireWorkspaceAdmin } from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import { hashToken } from "../../lib/jwt";
import { hashPassword } from "../../lib/password";
import { initialsFor } from "../../lib/initials";
import { safeUserSelect } from "../../lib/user-select";
import { sendMail, inviteEmailHtml } from "../../lib/mailer";
import { signAccessToken, signRefreshToken, refreshExpiryDate } from "../../lib/jwt";
import { config } from "../../config";
import type { ICreateInvite, IAcceptInvite } from "./invite.interface";

function generateRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

// tokenHash must never leave the server — it's the only thing standing between
// a leaked API response and someone accepting an invite that isn't theirs.
const safeInviteSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  workspaceId: true,
  invitedById: true,
  expiresAt: true,
  acceptedAt: true,
  createdAt: true,
} as const;

async function expirePastDue(workspaceId?: string) {
  await prisma.workspaceInvite.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
      ...(workspaceId ? { workspaceId } : {}),
    },
    data: { status: "EXPIRED" },
  });
}

async function dispatchInviteEmail(
  email: string,
  rawToken: string,
  inviterName: string,
  workspaceName: string,
  role: string
) {
  const acceptUrl = `${config.clientOrigin}/invite/${rawToken}`;
  await sendMail(
    email,
    `You're invited to join ${workspaceName}`,
    inviteEmailHtml({ inviterName, workspaceName, role, acceptUrl })
  );
}

async function createInvite(userId: string, workspaceId: string, payload: ICreateInvite) {
  await requireWorkspaceAdmin(userId, workspaceId);

  const [workspace, inviter, existingMember] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
    prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email: payload.email } },
    }),
  ]);
  if (existingMember) {
    throw new HttpError(409, "This person is already a member of the workspace");
  }

  await expirePastDue(workspaceId);

  // Superseding an existing pending invite to the same email keeps history clean —
  // there is only ever one live invite per (workspace, email) at a time.
  await prisma.workspaceInvite.updateMany({
    where: { workspaceId, email: payload.email, status: "PENDING" },
    data: { status: "CANCELLED" },
  });

  const rawToken = generateRawToken();
  const invite = await prisma.workspaceInvite.create({
    data: {
      email: payload.email,
      role: payload.role ?? "MEMBER",
      tokenHash: hashToken(rawToken),
      workspaceId,
      invitedById: userId,
      expiresAt: new Date(Date.now() + config.inviteTokenTtlDays * 24 * 60 * 60 * 1000),
    },
    select: safeInviteSelect,
  });

  await dispatchInviteEmail(payload.email, rawToken, inviter.name, workspace.name, invite.role);

  return invite;
}

async function listInvites(userId: string, workspaceId: string) {
  await requireWorkspaceAdmin(userId, workspaceId);
  await expirePastDue(workspaceId);
  return prisma.workspaceInvite.findMany({
    where: { workspaceId },
    select: { ...safeInviteSelect, invitedBy: { select: safeUserSelect } },
    orderBy: { createdAt: "desc" },
  });
}

async function resendInvite(userId: string, workspaceId: string, inviteId: string) {
  await requireWorkspaceAdmin(userId, workspaceId);

  const invite = await prisma.workspaceInvite.findUniqueOrThrow({ where: { id: inviteId } });
  if (invite.workspaceId !== workspaceId) {
    throw new HttpError(400, "Invite does not belong to this workspace");
  }
  if (invite.status === "ACCEPTED") {
    throw new HttpError(400, "This invitation has already been accepted");
  }

  const [workspace, inviter] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
  ]);

  const rawToken = generateRawToken();
  const updated = await prisma.workspaceInvite.update({
    where: { id: inviteId },
    data: {
      tokenHash: hashToken(rawToken),
      status: "PENDING",
      expiresAt: new Date(Date.now() + config.inviteTokenTtlDays * 24 * 60 * 60 * 1000),
    },
    select: safeInviteSelect,
  });

  await dispatchInviteEmail(invite.email, rawToken, inviter.name, workspace.name, invite.role);

  return updated;
}

async function cancelInvite(userId: string, workspaceId: string, inviteId: string) {
  await requireWorkspaceAdmin(userId, workspaceId);
  const invite = await prisma.workspaceInvite.findUniqueOrThrow({ where: { id: inviteId } });
  if (invite.workspaceId !== workspaceId) {
    throw new HttpError(400, "Invite does not belong to this workspace");
  }
  if (invite.status !== "PENDING") {
    throw new HttpError(400, "Only pending invitations can be cancelled");
  }
  await prisma.workspaceInvite.update({ where: { id: inviteId }, data: { status: "CANCELLED" } });
}

async function getInviteByToken(rawToken: string) {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { workspace: { select: { name: true, color: true } } },
  });
  if (!invite) throw new HttpError(404, "Invitation not found");
  if (invite.status === "PENDING" && invite.expiresAt < new Date()) {
    await prisma.workspaceInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    invite.status = "EXPIRED";
  }
  return invite;
}

async function acceptInvite(rawToken: string, payload: IAcceptInvite) {
  const invite = await getInviteByToken(rawToken);
  if (invite.status !== "PENDING") {
    throw new HttpError(400, `This invitation is ${invite.status.toLowerCase()}`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existingUser) {
    throw new HttpError(
      409,
      "An account with this email already exists — log in, then ask an admin to add you to the workspace."
    );
  }

  if (!payload.name?.trim() || !payload.password) {
    throw new HttpError(400, "Name and password are required to accept this invitation");
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name.trim(),
      email: invite.email,
      initials: initialsFor(payload.name.trim()),
      passwordHash: await hashPassword(payload.password),
    },
    select: safeUserSelect,
  });

  await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId: invite.workspaceId, role: invite.role },
  });

  await prisma.workspaceInvite.update({
    where: { id: invite.id },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });
  const refreshToken = signRefreshToken({ sub: user.id });
  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: refreshExpiryDate() },
  });

  return { user, accessToken, refreshToken };
}

export const inviteService = {
  createInvite,
  listInvites,
  resendInvite,
  cancelInvite,
  getInviteByToken,
  acceptInvite,
};
