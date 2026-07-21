import { prisma } from "../../lib/prisma";
import { ICreateWorkspace, IUpdateWorkspace } from "./workspace.interface";

async function createWorkspace(payload: ICreateWorkspace) {
  return prisma.workspace.create({ data: payload });
}

async function getWorkspaces() {
  return prisma.workspace.findMany({ include: { teams: true } });
}

async function getWorkspaceById(id: string) {
  return prisma.workspace.findUniqueOrThrow({
    where: { id },
    include: { teams: { include: { projects: true } } },
  });
}

async function updateWorkspace(id: string, payload: IUpdateWorkspace) {
  return prisma.workspace.update({ where: { id }, data: payload });
}

async function deleteWorkspace(id: string) {
  return prisma.workspace.delete({ where: { id } });
}

export const workspaceService = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};
