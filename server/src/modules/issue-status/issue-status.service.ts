import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import type { ICreateStatusOption, IUpdateStatusOption } from "./issue-status.interface";

async function listForProject(userId: string, projectId: string) {
  await requireProjectAccess(userId, projectId);
  return prisma.issueStatusOption.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
  });
}

async function createStatusOption(
  userId: string,
  projectId: string,
  payload: ICreateStatusOption
) {
  await requireProjectAccess(userId, projectId);

  const existing = await prisma.issueStatusOption.findUnique({
    where: { projectId_name: { projectId, name: payload.name } },
  });
  if (existing) {
    throw new HttpError(409, "A status with that name already exists on this project");
  }

  const position = await prisma.issueStatusOption.count({ where: { projectId } });
  return prisma.issueStatusOption.create({
    data: {
      name: payload.name,
      color: payload.color,
      icon: payload.icon ?? "Circle",
      category: payload.category,
      projectId,
      position,
    },
  });
}

async function updateStatusOption(
  userId: string,
  projectId: string,
  statusId: string,
  payload: IUpdateStatusOption
) {
  await requireProjectAccess(userId, projectId);
  const status = await prisma.issueStatusOption.findUniqueOrThrow({ where: { id: statusId } });
  if (status.projectId !== projectId) {
    throw new HttpError(400, "Status does not belong to this project");
  }

  return prisma.issueStatusOption.update({
    where: { id: statusId },
    data: payload,
  });
}

async function deleteStatusOption(userId: string, projectId: string, statusId: string) {
  await requireProjectAccess(userId, projectId);
  const status = await prisma.issueStatusOption.findUniqueOrThrow({ where: { id: statusId } });
  if (status.projectId !== projectId) {
    throw new HttpError(400, "Status does not belong to this project");
  }

  const totalStatuses = await prisma.issueStatusOption.count({ where: { projectId } });
  if (totalStatuses <= 1) {
    throw new HttpError(400, "A project must have at least one status");
  }

  const issueCount = await prisma.issue.count({ where: { statusId } });
  if (issueCount > 0) {
    throw new HttpError(
      400,
      `${issueCount} issue${issueCount === 1 ? "" : "s"} ${issueCount === 1 ? "is" : "are"} using this status — move them first`
    );
  }

  await prisma.issueStatusOption.delete({ where: { id: statusId } });
}

async function reorderStatusOptions(userId: string, projectId: string, orderedIds: string[]) {
  await requireProjectAccess(userId, projectId);

  const statuses = await prisma.issueStatusOption.findMany({
    where: { projectId },
    select: { id: true },
  });
  const validIds = new Set(statuses.map((s) => s.id));
  if (orderedIds.length !== validIds.size || !orderedIds.every((id) => validIds.has(id))) {
    throw new HttpError(400, "orderedIds must match exactly the statuses on this project");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.issueStatusOption.update({ where: { id }, data: { position: index } })
    )
  );

  return prisma.issueStatusOption.findMany({ where: { projectId }, orderBy: { position: "asc" } });
}

export const issueStatusService = {
  listForProject,
  createStatusOption,
  updateStatusOption,
  deleteStatusOption,
  reorderStatusOptions,
};
