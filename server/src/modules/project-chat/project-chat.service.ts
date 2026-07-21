import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { notificationService } from "../notification/notification.service";
import { safeUserSelect } from "../../lib/user-select";

async function listMessages(userId: string, projectId: string) {
  await requireProjectAccess(userId, projectId);
  return prisma.projectChatMessage.findMany({
    where: { projectId },
    include: { author: { select: safeUserSelect } },
    orderBy: { createdAt: "asc" },
  });
}

async function createMessage(userId: string, projectId: string, body: string) {
  await requireProjectAccess(userId, projectId);

  const message = await prisma.projectChatMessage.create({
    data: { projectId, authorId: userId, body },
    include: { author: { select: safeUserSelect } },
  });

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  for (const member of members) {
    if (member.userId === userId) continue;
    await notificationService.createNotification(
      member.userId,
      userId,
      `posted in project chat: "${body.slice(0, 60)}${body.length > 60 ? "…" : ""}"`
    );
  }

  return message;
}

export const projectChatService = { listMessages, createMessage };
