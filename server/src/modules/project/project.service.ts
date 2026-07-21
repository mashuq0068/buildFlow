import { prisma } from "../../lib/prisma";
import { ICreateProject, IUpdateProject } from "./project.interface";

async function createProject(payload: ICreateProject) {
  return prisma.project.create({ data: payload });
}

async function getProjectsByTeam(teamId: string) {
  return prisma.project.findMany({ where: { teamId } });
}

async function getProjectById(id: string) {
  return prisma.project.findUniqueOrThrow({
    where: { id },
    include: { issues: { orderBy: { createdAt: "desc" } } },
  });
}

async function updateProject(id: string, payload: IUpdateProject) {
  return prisma.project.update({ where: { id }, data: payload });
}

async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export const projectService = {
  createProject,
  getProjectsByTeam,
  getProjectById,
  updateProject,
  deleteProject,
};
