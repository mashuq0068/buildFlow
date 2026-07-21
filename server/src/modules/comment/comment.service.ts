import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { notificationService } from "../notification/notification.service";
import { safeUserSelect } from "../../lib/user-select";

async function listByIssue(userId: string, issueId: string) {
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id: issueId },
    select: { projectId: true },
  });
  await requireProjectAccess(userId, issue.projectId);
  return prisma.comment.findMany({
    where: { issueId },
    include: { author: { select: safeUserSelect } },
    orderBy: { createdAt: "asc" },
  });
}

async function createComment(userId: string, issueId: string, body: string) {
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: { project: { select: { teamKey: true } } },
  });
  await requireProjectAccess(userId, issue.projectId);

  const comment = await prisma.comment.create({
    data: { issueId, authorId: userId, body },
    include: { author: { select: safeUserSelect } },
  });

  const identifierLabel = `${issue.project.teamKey}-${issue.identifier}`;
  const recipients = new Set<string>();
  if (issue.assigneeId) recipients.add(issue.assigneeId);
  recipients.add(issue.creatorId);
  recipients.delete(userId);

  for (const recipientId of recipients) {
    await notificationService.createNotification(
      recipientId,
      userId,
      `commented: "${body.slice(0, 60)}${body.length > 60  ? "…" : ""}"`,
      identifierLabel
    );
  }

  return comment;
}

export const commentService = { listByIssue, createComment };
