import { prisma } from "../../lib/prisma";
import { ICreateTeam, IUpdateTeam } from "./team.interface";

async function createTeam(payload: ICreateTeam) {
  return prisma.team.create({ data: payload });
}

async function getTeamsByWorkspace(workspaceId: string) {
  return prisma.team.findMany({ where: { workspaceId }, include: { projects: true } });
}

async function getTeamById(id: string) {
  return prisma.team.findUniqueOrThrow({ where: { id }, include: { projects: true } });
}

async function updateTeam(id: string, payload: IUpdateTeam) {
  return prisma.team.update({ where: { id }, data: payload });
}

async function deleteTeam(id: string) {
  return prisma.team.delete({ where: { id } });
}

export const teamService = {
  createTeam,
  getTeamsByWorkspace,
  getTeamById,
  updateTeam,
  deleteTeam,
};
