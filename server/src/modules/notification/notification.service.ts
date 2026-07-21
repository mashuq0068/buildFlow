import { prisma } from "../../lib/prisma";
import { safeUserSelect } from "../../lib/user-select";

async function createNotification(
  recipientId: string,
  actorId: string,
  message: string,
  issueIdentifier?: string
) {
  if (recipientId === actorId) return null;
  return prisma.notification.create({
    data: { recipientId, actorId, message, issueIdentifier },
  });
}

async function listForUser(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    include: { actor: { select: safeUserSelect } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

async function markRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, recipientId: userId },
    data: { readAt: new Date() },
  });
}

async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export const notificationService = { createNotification, listForUser, markRead, markAllRead };
