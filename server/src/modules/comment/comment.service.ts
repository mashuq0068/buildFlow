import { prisma } from "../../lib/prisma";
import { requireProjectAccess, requireWorkspaceMembership } from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import { safeUserSelect } from "../../lib/user-select";
import { extractMentionedUserIds } from "../../lib/mentions";
import { aggregateReactions } from "../../lib/reactions";
import { notificationService } from "../notification/notification.service";
import { emitToRoom } from "../../lib/socket";

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

function serialize(comment: {
  id: string;
  body: string;
  issueId: string;
  authorId: string;
  parentId: string | null;
  editedAt: Date | null;
  createdAt: Date;
  author: unknown;
  attachments: unknown;
  reactions: { emoji: string; userId: string; user: { name: string } }[];
}, currentUserId: string) {
  const { reactions, ...rest } = comment;
  return { ...rest, reactions: aggregateReactions(reactions, currentUserId) };
}

async function listByIssue(userId: string, issueId: string) {
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id: issueId },
    select: { projectId: true },
  });
  await requireProjectAccess(userId, issue.projectId);
  const comments = await prisma.comment.findMany({
    where: { issueId },
    include,
    orderBy: { createdAt: "asc" },
  });
  return comments.map((c) => serialize(c, userId));
}

async function resolveValidMentions(workspaceId: string, mentionedIds: string[]) {
  if (mentionedIds.length === 0) return [];
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, userId: { in: mentionedIds } },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

async function createComment(
  userId: string,
  issueId: string,
  body: string,
  parentId?: string,
  attachments?: AttachmentInput[]
) {
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: { project: { select: { teamKey: true, workspaceId: true } } },
  });
  await requireProjectAccess(userId, issue.projectId);

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.issueId !== issueId) {
      throw new HttpError(400, "Parent comment does not belong to this issue");
    }
  }

  const mentionedUserIds = await resolveValidMentions(
    issue.project.workspaceId,
    extractMentionedUserIds(body)
  );

  const comment = await prisma.comment.create({
    data: {
      issueId,
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

  const identifierLabel = `${issue.project.teamKey}-${issue.identifier}`;
  const recipients = new Map<string, string>();
  if (issue.assigneeId) recipients.set(issue.assigneeId, "commented on an issue assigned to you");
  recipients.set(issue.creatorId, "commented on your issue");
  for (const mentionedId of mentionedUserIds) {
    recipients.set(mentionedId, "mentioned you in a comment");
  }
  recipients.delete(userId);

  for (const [recipientId, message] of recipients) {
    await notificationService.createNotification(recipientId, userId, message, identifierLabel);
  }

  const result = serialize(comment, userId);
  emitToRoom(`issue:${issueId}`, "comment:created", { issueId, comment: result });
  return result;
}

async function updateComment(userId: string, commentId: string, body: string) {
  const existing = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: { issue: { select: { projectId: true, project: { select: { workspaceId: true } } } } },
  });
  if (existing.authorId !== userId) {
    throw new HttpError(403, "You can only edit your own comments");
  }

  const mentionedUserIds = await resolveValidMentions(
    existing.issue.project.workspaceId,
    extractMentionedUserIds(body)
  );

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { body, mentionedUserIds, editedAt: new Date() },
    include,
  });
  const result = serialize(comment, userId);
  emitToRoom(`issue:${existing.issueId}`, "comment:updated", {
    issueId: existing.issueId,
    comment: result,
  });
  return result;
}

async function deleteComment(userId: string, commentId: string) {
  const existing = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: { issue: { select: { projectId: true, project: { select: { workspaceId: true } } } } },
  });

  if (existing.authorId !== userId) {
    const role = await requireWorkspaceMembership(userId, existing.issue.project.workspaceId);
    if (role !== "ADMIN") {
      throw new HttpError(403, "You can only delete your own comments");
    }
  }

  await prisma.comment.delete({ where: { id: commentId } });
  emitToRoom(`issue:${existing.issueId}`, "comment:deleted", {
    issueId: existing.issueId,
    commentId,
  });
}

async function toggleReaction(userId: string, commentId: string, emoji: string) {
  const existing = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    select: { issueId: true, issue: { select: { projectId: true } } },
  });
  await requireProjectAccess(userId, existing.issue.projectId);

  const existingReaction = await prisma.commentReaction.findUnique({
    where: { commentId_userId_emoji: { commentId, userId, emoji } },
  });

  if (existingReaction) {
    await prisma.commentReaction.delete({ where: { id: existingReaction.id } });
  } else {
    await prisma.commentReaction.create({ data: { commentId, userId, emoji } });
  }

  const comment = await prisma.comment.findUniqueOrThrow({ where: { id: commentId }, include });
  const result = serialize(comment, userId);
  emitToRoom(`issue:${existing.issueId}`, "comment:updated", {
    issueId: existing.issueId,
    comment: result,
  });
  return result;
}

export const commentService = {
  listByIssue,
  createComment,
  updateComment,
  deleteComment,
  toggleReaction,
};
