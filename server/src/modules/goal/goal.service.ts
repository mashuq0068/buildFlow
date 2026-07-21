import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { safeUserSelect } from "../../lib/user-select";
import type { ICreateGoal, IUpdateGoal } from "./goal.interface";

async function createGoal(userId: string, payload: ICreateGoal) {
  await requireProjectAccess(userId, payload.projectId);
  return prisma.goal.create({
    data: {
      title: payload.title,
      description: payload.description,
      projectId: payload.projectId,
      ownerId: payload.ownerId,
      targetDate: new Date(payload.targetDate),
    },
    include: { owner: { select: safeUserSelect } },
  });
}

async function getGoalsForUser(userId: string, projectIds: string[]) {
  return prisma.goal.findMany({
    where: { projectId: { in: projectIds } },
    include: { owner: { select: safeUserSelect } },
    orderBy: { targetDate: "asc" },
  });
}

async function updateGoal(userId: string, id: string, payload: IUpdateGoal) {
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, goal.projectId);
  return prisma.goal.update({
    where: { id },
    data: {
      ...payload,
      targetDate: payload.targetDate ? new Date(payload.targetDate) : undefined,
    },
    include: { owner: { select: safeUserSelect } },
  });
}

async function deleteGoal(userId: string, id: string) {
  const goal = await prisma.goal.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, goal.projectId);
  return prisma.goal.delete({ where: { id } });
}

export const goalService = { createGoal, getGoalsForUser, updateGoal, deleteGoal };
