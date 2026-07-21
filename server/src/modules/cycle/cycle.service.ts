import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { safeUserSelect } from "../../lib/user-select";
import type { ICreateCycle, IUpdateCycle } from "./cycle.interface";

async function createCycle(userId: string, payload: ICreateCycle) {
  await requireProjectAccess(userId, payload.projectId);
  return prisma.cycle.create({
    data: {
      name: payload.name,
      description: payload.description,
      projectId: payload.projectId,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    },
  });
}

async function getCyclesForUser(userId: string, projectIds: string[]) {
  return prisma.cycle.findMany({
    where: { projectId: { in: projectIds } },
    include: { issues: { select: { id: true, status: true } } },
    orderBy: { startDate: "asc" },
  });
}

async function getCycleById(userId: string, id: string) {
  const cycle = await prisma.cycle.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, cycle.projectId);
  return prisma.cycle.findUniqueOrThrow({
    where: { id },
    include: {
      issues: {
        include: {
          assignee: { select: safeUserSelect },
          labels: { include: { label: true } },
        },
      },
    },
  });
}

async function updateCycle(userId: string, id: string, payload: IUpdateCycle) {
  const cycle = await prisma.cycle.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, cycle.projectId);
  return prisma.cycle.update({
    where: { id },
    data: {
      ...payload,
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
    },
  });
}

async function deleteCycle(userId: string, id: string) {
  const cycle = await prisma.cycle.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, cycle.projectId);
  return prisma.cycle.delete({ where: { id } });
}

export const cycleService = {
  createCycle,
  getCyclesForUser,
  getCycleById,
  updateCycle,
  deleteCycle,
};
