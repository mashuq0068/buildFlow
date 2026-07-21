import { prisma } from "../../lib/prisma";
import { safeUserSelect } from "../../lib/user-select";

async function listRecentForProjects(projectIds: string[], take = 10) {
  return prisma.activityLog.findMany({
    where: { issue: { projectId: { in: projectIds } } },
    include: {
      author: { select: safeUserSelect },
      issue: { include: { project: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export const activityService = { listRecentForProjects };
