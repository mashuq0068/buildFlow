import { prisma } from "../../lib/prisma";
import { requireWorkspaceAdmin, requireWorkspaceMembership } from "../../lib/authz";
import { ICreateWorkspace, IUpdateWorkspace } from "./workspace.interface";

async function createWorkspace(userId: string, payload: ICreateWorkspace) {
  return prisma.workspace.create({
    data: {
      ...payload,
      members: { create: { userId, role: "ADMIN" } },
    },
  });
}

async function getWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({ ...m.workspace, role: m.role }));
}

async function getWorkspaceById(userId: string, id: string) {
  await requireWorkspaceMembership(userId, id);
  return prisma.workspace.findUniqueOrThrow({
    where: { id },
    include: { projects: true },
  });
}

async function updateWorkspace(userId: string, id: string, payload: IUpdateWorkspace) {
  await requireWorkspaceAdmin(userId, id);
  return prisma.workspace.update({ where: { id }, data: payload });
}

async function deleteWorkspace(userId: string, id: string) {
  await requireWorkspaceAdmin(userId, id);
  return prisma.workspace.delete({ where: { id } });
}

export const workspaceService = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};
