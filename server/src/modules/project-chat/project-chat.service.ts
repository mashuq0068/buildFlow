import { prisma } from "../../lib/prisma";
import { requireProjectAccess, requireWorkspaceMembership } from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import { safeUserSelect } from "../../lib/user-select";
import { extractMentionedUserIds } from "../../lib/mentions";
import { aggregateReactions } from "../../lib/reactions";
import { notificationService } from "../notification/notification.service";
import { getIO } from "../../lib/socket";

interface AttachmentInput {
  name: string;
  url: string;
  size: string;
  isImage?: boolean;
}

const include = {
  author: { select: safeUserSelect },
  attachments: true,
  reactions: { include: { user: { select: { name: true } } } },
};

function serialize(
  message: {
    id: string;
    body: string;
    projectId: string;
    authorId: string;
    parentId: string | null;
    editedAt: Date | null;
    createdAt: Date;
    author: unknown;
    attachments: unknown;
    reactions: { emoji: string; userId: string; user: { name: string } }[];
  },
  currentUserId: string
) {
  const { reactions, ...rest } = message;
  return { ...rest, reactions: aggregateReactions(reactions, currentUserId) };
}

async function listMessages(userId: string, projectId: string) {
  await requireProjectAccess(userId, projectId);
  const messages = await prisma.projectChatMessage.findMany({
    where: { projectId },
    include,
    orderBy: { createdAt: "asc" },
  });
  return messages.map((m) => serialize(m, userId));
}

async function resolveValidMentions(workspaceId: string, mentionedIds: string[]) {
  if (mentionedIds.length === 0) return [];
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, userId: { in: mentionedIds } },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

async function createMessage(
  userId: string,
  projectId: string,
  body: string,
  parentId?: string,
  attachments?: AttachmentInput[]
) {
  await requireProjectAccess(userId, projectId);
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { workspaceId: true },
  });

  if (parentId) {
    const parent = await prisma.projectChatMessage.findUnique({ where: { id: parentId } });
    if (!parent || parent.projectId !== projectId) {
      throw new HttpError(400, "Parent message does not belong to this project");
    }
  }

  const mentionedUserIds = await resolveValidMentions(
    project.workspaceId,
    extractMentionedUserIds(body)
  );

  const message = await prisma.projectChatMessage.create({
    data: {
      projectId,
      authorId: userId,
      body,
      parentId,
      mentionedUserIds,
      attachments: attachments?.length
        ? { create: attachments.map((a) => ({ ...a, isImage: a.isImage ?? false })) }
        : undefined,
    },
    include,
  });

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const recipients = new Map<string, string>();
  for (const member of members) {
    recipients.set(member.userId, "posted in project chat");
  }
  for (const mentionedId of mentionedUserIds) {
    recipients.set(mentionedId, "mentioned you in project chat");
  }
  recipients.delete(userId);

  for (const [recipientId, notificationMessage] of recipients) {
    await notificationService.createNotification(recipientId, userId, notificationMessage);
  }

  const result = serialize(message, userId);
  getIO().to(`project:${projectId}`).emit("chat:created", { projectId, message: result });
  return result;
}

async function updateMessage(userId: string, messageId: string, body: string) {
  const existing = await prisma.projectChatMessage.findUniqueOrThrow({
    where: { id: messageId },
    include: { project: { select: { workspaceId: true } } },
  });
  if (existing.authorId !== userId) {
    throw new HttpError(403, "You can only edit your own messages");
  }

  const mentionedUserIds = await resolveValidMentions(
    existing.project.workspaceId,
    extractMentionedUserIds(body)
  );

  const message = await prisma.projectChatMessage.update({
    where: { id: messageId },
    data: { body, mentionedUserIds, editedAt: new Date() },
    include,
  });
  const result = serialize(message, userId);
  getIO().to(`project:${existing.projectId}`).emit("chat:updated", {
    projectId: existing.projectId,
    message: result,
  });
  return result;
}

async function deleteMessage(userId: string, messageId: string) {
  const existing = await prisma.projectChatMessage.findUniqueOrThrow({
    where: { id: messageId },
    include: { project: { select: { workspaceId: true } } },
  });

  if (existing.authorId !== userId) {
    const role = await requireWorkspaceMembership(userId, existing.project.workspaceId);
    if (role !== "ADMIN") {
      throw new HttpError(403, "You can only delete your own messages");
    }
  }

  await prisma.projectChatMessage.delete({ where: { id: messageId } });
  getIO().to(`project:${existing.projectId}`).emit("chat:deleted", {
    projectId: existing.projectId,
    messageId,
  });
}

async function toggleReaction(userId: string, messageId: string, emoji: string) {
  const existing = await prisma.projectChatMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: { projectId: true },
  });
  await requireProjectAccess(userId, existing.projectId);

  const existingReaction = await prisma.projectChatReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
  });

  if (existingReaction) {
    await prisma.projectChatReaction.delete({ where: { id: existingReaction.id } });
  } else {
    await prisma.projectChatReaction.create({ data: { messageId, userId, emoji } });
  }

  const message = await prisma.projectChatMessage.findUniqueOrThrow({
    where: { id: messageId },
    include,
  });
  const result = serialize(message, userId);
  getIO().to(`project:${existing.projectId}`).emit("chat:updated", {
    projectId: existing.projectId,
    message: result,
  });
  return result;
}

export const projectChatService = {
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  toggleReaction,
};
