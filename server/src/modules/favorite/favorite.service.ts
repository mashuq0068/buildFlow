import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";

async function addFavorite(userId: string, issueId: string) {
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id: issueId },
    select: { projectId: true },
  });
  await requireProjectAccess(userId, issue.projectId);
  return prisma.favorite.upsert({
    where: { userId_issueId: { userId, issueId } },
    update: {},
    create: { userId, issueId },
  });
}

async function removeFavorite(userId: string, issueId: string) {
  await prisma.favorite.deleteMany({ where: { userId, issueId } });
}

async function listFavoriteIssueIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { issueId: true },
  });
  return favorites.map((f) => f.issueId);
}

export const favoriteService = { addFavorite, removeFavorite, listFavoriteIssueIds };
