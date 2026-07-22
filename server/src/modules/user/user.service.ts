import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/password";
import { requireWorkspaceAdmin, requireWorkspaceMembership } from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import { safeUserSelect } from "../../lib/user-select";
import { initialsFor } from "../../lib/initials";
import type { Role } from "@prisma/client";
import type { IAddMemberInput } from "./user.interface";

const DEFAULT_TEMP_PASSWORD = "Welcome123!";

async function listWorkspaceMembers(requesterId: string, workspaceId: string) {
  await requireWorkspaceMembership(requesterId, workspaceId);
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: safeUserSelect } },
    orderBy: { createdAt: "asc" },
  });
  return members.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    initials: m.user.initials,
    title: m.user.title,
    avatarUrl: m.user.avatarUrl,
    role: m.role,
  }));
}

async function addMember(requesterId: string, workspaceId: string, input: IAddMemberInput) {
  await requireWorkspaceAdmin(requesterId, workspaceId);

  let user = await prisma.user.findUnique({
    where: { email: input.email },
    select: safeUserSelect,
  });
  let tempPassword: string | null = null;

  if (!user) {
    tempPassword = DEFAULT_TEMP_PASSWORD;
    user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        title: input.title,
        initials: initialsFor(input.name),
        passwordHash: await hashPassword(tempPassword),
      },
      select: safeUserSelect,
    });
  }

  const existingMembership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  });
  if (existingMembership) {
    throw new HttpError(409, "This person is already a member of the workspace");
  }

  const membership = await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId, role: input.role ?? "MEMBER" },
    include: { user: { select: safeUserSelect } },
  });

  return {
    userId: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    initials: membership.user.initials,
    title: membership.user.title,
    avatarUrl: membership.user.avatarUrl,
    role: membership.role,
    tempPassword,
  };
}

async function updateMemberRole(
  requesterId: string,
  workspaceId: string,
  targetUserId: string,
  role: Role
) {
  await requireWorkspaceAdmin(requesterId, workspaceId);
  if (requesterId === targetUserId) {
    throw new HttpError(400, "You can't change your own role");
  }

  const membership = await prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { role },
    include: { user: { select: safeUserSelect } },
  });

  return {
    userId: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    initials: membership.user.initials,
    title: membership.user.title,
    avatarUrl: membership.user.avatarUrl,
    role: membership.role,
  };
}

export const userService = { listWorkspaceMembers, addMember, updateMemberRole };
