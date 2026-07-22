import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import type { ICreateMilestone, IUpdateMilestone } from "./milestone.interface";

async function createMilestone(userId: string, payload: ICreateMilestone) {
  await requireProjectAccess(userId, payload.projectId);
  return prisma.milestone.create({
    data: {
      title: payload.title,
      description: payload.description,
      projectId: payload.projectId,
      targetDate: new Date(payload.targetDate),
    },
  });
}

async function getMilestonesForUser(userId: string, projectIds: string[]) {
  return prisma.milestone.findMany({
    where: { projectId: { in: projectIds } },
    orderBy: { targetDate: "asc" },
  });
}

async function updateMilestone(userId: string, id: string, payload: IUpdateMilestone) {
  const milestone = await prisma.milestone.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, milestone.projectId);
  return prisma.milestone.update({
    where: { id },
    data: {
      ...payload,
      targetDate: payload.targetDate ? new Date(payload.targetDate) : undefined,
    },
  });
}

async function deleteMilestone(userId: string, id: string) {
  const milestone = await prisma.milestone.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, milestone.projectId);
  return prisma.milestone.delete({ where: { id } });
}

export const milestoneService = {
  createMilestone,
  getMilestonesForUser,
  updateMilestone,
  deleteMilestone,
};
