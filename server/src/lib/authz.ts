import { prisma } from "./prisma";
import { HttpError } from "./http-error";

export async function getWorkspaceRole(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  return membership?.role ?? null;
}

export async function requireWorkspaceMembership(userId: string, workspaceId: string) {
  const role = await getWorkspaceRole(userId, workspaceId);
  if (!role) throw new HttpError(403, "You are not a member of this workspace");
  return role;
}

export async function requireWorkspaceAdmin(userId: string, workspaceId: string) {
  const role = await requireWorkspaceMembership(userId, workspaceId);
  if (role !== "ADMIN") throw new HttpError(403, "This action requires an admin role");
  return role;
}

export async function isProjectMember(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return Boolean(membership);
}

/** Admins of the project's workspace can always see/act on a project; members only if they're on it. */
export async function requireProjectAccess(userId: string, projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  const role = await requireWorkspaceMembership(userId, project.workspaceId);
  if (role === "ADMIN") return { role, workspaceId: project.workspaceId };

  const member = await isProjectMember(userId, projectId);
  if (!member) throw new HttpError(403, "You don't have access to this project");
  return { role, workspaceId: project.workspaceId };
}
