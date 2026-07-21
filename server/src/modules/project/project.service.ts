import { prisma } from "../../lib/prisma";
import {
  requireWorkspaceMembership,
  requireWorkspaceAdmin,
  requireProjectAccess,
} from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import { safeUserSelect } from "../../lib/user-select";
import { ICreateProject, IUpdateProject } from "./project.interface";

const memberInclude = {
  members: { include: { user: { select: safeUserSelect } } },
  lead: { select: safeUserSelect },
} as const;

async function createProject(userId: string, payload: ICreateProject) {
  await requireWorkspaceMembership(userId, payload.workspaceId);

  const memberIds = new Set(payload.memberUserIds ?? []);
  memberIds.add(userId);

  return prisma.project.create({
    data: {
      name: payload.name,
      teamKey: payload.teamKey.toUpperCase(),
      color: payload.color,
      summary: payload.summary,
      status: payload.status,
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      targetDate: payload.targetDate ? new Date(payload.targetDate) : undefined,
      workspaceId: payload.workspaceId,
      leadId: payload.leadId,
      members: { create: Array.from(memberIds).map((uid) => ({ userId: uid })) },
    },
    include: memberInclude,
  });
}

async function getProjectsForUser(userId: string, workspaceId: string) {
  const role = await requireWorkspaceMembership(userId, workspaceId);

  const where =
    role === "ADMIN"
      ? { workspaceId }
      : { workspaceId, members: { some: { userId } } };

  return prisma.project.findMany({
    where,
    include: memberInclude,
    orderBy: { createdAt: "asc" },
  });
}

async function getProjectById(userId: string, id: string) {
  await requireProjectAccess(userId, id);
  return prisma.project.findUniqueOrThrow({
    where: { id },
    include: {
      ...memberInclude,
      issues: { orderBy: { createdAt: "desc" } },
      cycles: { orderBy: { startDate: "asc" } },
      goals: { orderBy: { targetDate: "asc" } },
    },
  });
}

async function updateProject(userId: string, id: string, payload: IUpdateProject) {
  await requireProjectAccess(userId, id);
  return prisma.project.update({
    where: { id },
    data: {
      ...payload,
      teamKey: payload.teamKey?.toUpperCase(),
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      targetDate: payload.targetDate ? new Date(payload.targetDate) : undefined,
    },
    include: memberInclude,
  });
}

async function deleteProject(userId: string, id: string) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id },
    select: { workspaceId: true },
  });
  await requireWorkspaceAdmin(userId, project.workspaceId);
  return prisma.project.delete({ where: { id } });
}

async function addMembers(userId: string, projectId: string, userIds: string[]) {
  await requireProjectAccess(userId, projectId);

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { workspaceId: true },
  });

  const validMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId: project.workspaceId, userId: { in: userIds } },
    select: { userId: true },
  });
  if (validMembers.length !== userIds.length) {
    throw new HttpError(400, "All members must belong to the project's workspace");
  }

  await prisma.projectMember.createMany({
    data: userIds.map((id) => ({ projectId, userId: id })),
    skipDuplicates: true,
  });

  return prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: memberInclude });
}

async function removeMember(userId: string, projectId: string, targetUserId: string) {
  await requireProjectAccess(userId, projectId);
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
}

export const projectService = {
  createProject,
  getProjectsForUser,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
};
