import { prisma } from "../../lib/prisma";
import { requireWorkspaceMembership } from "../../lib/authz";

async function listByWorkspace(userId: string, workspaceId: string) {
  await requireWorkspaceMembership(userId, workspaceId);
  return prisma.label.findMany({ where: { workspaceId }, orderBy: { name: "asc" } });
}

export const labelService = { listByWorkspace };
