import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { notificationService } from "../notification/notification.service";
import { HttpError } from "../../lib/http-error";
import { safeUserSelect } from "../../lib/user-select";
import type { ICreateIssue, IUpdateIssue, ILabelInput } from "./issue.interface";
import type { IssueStatus } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELED: "Canceled",
};

const projectSelect = {
  select: { id: true, name: true, teamKey: true, color: true },
};

const detailInclude = {
  assignee: { select: safeUserSelect },
  creator: { select: safeUserSelect },
  project: projectSelect,
  labels: { include: { label: true } },
  attachments: true,
  comments: {
    include: { author: { select: safeUserSelect } },
    orderBy: { createdAt: "asc" as const },
  },
  activity: {
    include: { author: { select: safeUserSelect } },
    orderBy: { createdAt: "desc" as const },
  },
  subIssues: true,
};

const listInclude = {
  assignee: { select: safeUserSelect },
  creator: { select: safeUserSelect },
  project: projectSelect,
  labels: { include: { label: true } },
  attachments: true,
};

const listOrderBy = [{ position: "asc" as const }, { createdAt: "asc" as const }];

async function resolveLabelIds(workspaceId: string, labels: ILabelInput[]) {
  const ids: string[] = [];
  for (const label of labels) {
    const row = await prisma.label.upsert({
      where: { workspaceId_name: { workspaceId, name: label.name } },
      update: { color: label.color },
      create: { workspaceId, name: label.name, color: label.color },
    });
    ids.push(row.id);
  }
  return ids;
}

async function nextIdentifier(projectId: string) {
  const last = await prisma.issue.findFirst({
    where: { projectId },
    orderBy: { identifier: "desc" },
    select: { identifier: true },
  });
  return (last?.identifier ?? 0) + 1;
}

async function logActivity(issueId: string, authorId: string, message: string) {
  return prisma.activityLog.create({ data: { issueId, authorId, message } });
}

async function createIssue(userId: string, payload: ICreateIssue) {
  await requireProjectAccess(userId, payload.projectId);

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: payload.projectId },
    select: { workspaceId: true, teamKey: true },
  });

  const identifier = await nextIdentifier(payload.projectId);
  const labelIds = payload.labels
    ? await resolveLabelIds(project.workspaceId, payload.labels)
    : [];
  const status = payload.status ?? "BACKLOG";
  const position = await prisma.issue.count({ where: { projectId: payload.projectId, status } });

  const issue = await prisma.issue.create({
    data: {
      identifier,
      title: payload.title,
      description: payload.description,
      status,
      priority: payload.priority,
      position,
      projectId: payload.projectId,
      cycleId: payload.cycleId,
      assigneeId: payload.assigneeId,
      creatorId: userId,
      parentId: payload.parentId,
      aiSuggestedLabels: payload.aiSuggestedLabels ?? [],
      aiSuggestedReasoning: payload.aiSuggestedReasoning,
      labels: { create: labelIds.map((labelId) => ({ labelId })) },
    },
    include: listInclude,
  });

  await logActivity(issue.id, userId, "created this issue");

  if (payload.assigneeId) {
    await notificationService.createNotification(
      payload.assigneeId,
      userId,
      "assigned you to an issue",
      `${project.teamKey}-${identifier}`
    );
  }

  return issue;
}

async function getIssuesByProject(userId: string, projectId: string) {
  await requireProjectAccess(userId, projectId);
  return prisma.issue.findMany({
    where: { projectId },
    include: listInclude,
    orderBy: listOrderBy,
  });
}

async function getIssuesForProjects(projectIds: string[]) {
  return prisma.issue.findMany({
    where: { projectId: { in: projectIds } },
    include: listInclude,
    orderBy: listOrderBy,
  });
}

async function getIssueById(userId: string, id: string) {
  const issue = await prisma.issue.findUniqueOrThrow({
    where: { id },
    select: { projectId: true },
  });
  await requireProjectAccess(userId, issue.projectId);
  return prisma.issue.findUniqueOrThrow({ where: { id }, include: detailInclude });
}

async function updateIssue(userId: string, id: string, payload: IUpdateIssue) {
  const existing = await prisma.issue.findUniqueOrThrow({
    where: { id },
    include: { project: { select: { teamKey: true } } },
  });
  await requireProjectAccess(userId, existing.projectId);

  const data: Record<string, unknown> = {
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    assigneeId: payload.assigneeId,
    cycleId: payload.cycleId,
  };

  if (payload.status && payload.status !== existing.status) {
    data.status = payload.status;
  }

  if (payload.labels) {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: existing.projectId },
      select: { workspaceId: true },
    });
    const labelIds = await resolveLabelIds(project.workspaceId, payload.labels);
    await prisma.issueLabel.deleteMany({ where: { issueId: id } });
    data.labels = { create: labelIds.map((labelId) => ({ labelId })) };
  }

  const issue = await prisma.issue.update({ where: { id }, data, include: listInclude });

  if (payload.status && payload.status !== existing.status) {
    await logActivity(
      id,
      userId,
      `moved this issue from ${STATUS_LABEL[existing.status]} to ${STATUS_LABEL[payload.status]}`
    );
  }
  if (payload.priority && payload.priority !== existing.priority) {
    await logActivity(
      id,
      userId,
      `set priority to ${payload.priority.replace("_", " ").toLowerCase()}`
    );
  }
  if (payload.assigneeId !== undefined && payload.assigneeId !== existing.assigneeId) {
    if (payload.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: payload.assigneeId },
        select: { name: true },
      });
      await logActivity(id, userId, `assigned this issue to ${assignee?.name ?? "someone"}`);
      await notificationService.createNotification(
        payload.assigneeId,
        userId,
        "assigned you to an issue",
        `${existing.project.teamKey}-${existing.identifier}`
      );
    } else {
      await logActivity(id, userId, "unassigned this issue");
    }
  }

  return issue;
}

async function updateStatus(userId: string, id: string, status: IssueStatus) {
  const existing = await prisma.issue.findUniqueOrThrow({ where: { id } });
  await requireProjectAccess(userId, existing.projectId);
  if (status === existing.status) return existing;

  const position = await prisma.issue.count({
    where: { projectId: existing.projectId, status },
  });

  const issue = await prisma.issue.update({
    where: { id },
    data: { status, position },
    include: listInclude,
  });
  await logActivity(
    id,
    userId,
    `moved this issue from ${STATUS_LABEL[existing.status]} to ${STATUS_LABEL[status]}`
  );
  return issue;
}

async function reorderColumn(
  userId: string,
  projectId: string,
  status: IssueStatus,
  orderedIds: string[]
) {
  await requireProjectAccess(userId, projectId);

  // orderedIds is the desired order for a SUBSET of the column (callers may be
  // rendering a filtered board — My Issues, Favorites, a single cycle — so the
  // full column can contain more issues than are visible). We stable-merge the
  // requested subset back into the full column: issues not part of the reorder
  // keep their slot, the reordered ones take on the requested relative order.
  const columnIssues = await prisma.issue.findMany({
    where: { projectId, status },
    select: { id: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  const fullOrder = columnIssues.map((i) => i.id);
  const fullSet = new Set(fullOrder);
  if (!orderedIds.every((id) => fullSet.has(id))) {
    throw new HttpError(400, "orderedIds must only contain issues currently in that column");
  }

  const involved = new Set(orderedIds);
  const queue = [...orderedIds];
  const newOrder = fullOrder.map((id) => (involved.has(id) ? queue.shift()! : id));

  await prisma.$transaction(
    newOrder.map((issueId, index) =>
      prisma.issue.update({ where: { id: issueId }, data: { position: index } })
    )
  );

  return prisma.issue.findMany({
    where: { projectId, status },
    include: listInclude,
    orderBy: listOrderBy,
  });
}

async function deleteIssue(userId: string, id: string) {
  const existing = await prisma.issue.findUniqueOrThrow({
    where: { id },
    select: { projectId: true },
  });
  await requireProjectAccess(userId, existing.projectId);
  return prisma.issue.delete({ where: { id } });
}

function suggestLabelsForTitle(title: string) {
  const t = title.toLowerCase();
  let labels: string[];
  if (/ci|pipeline|deploy|infra/.test(t)) labels = ["Infra", "CI/CD"];
  else if (/ui|frontend|component|design/.test(t)) labels = ["Frontend"];
  else if (/api|server|database|schema|backend/.test(t)) labels = ["Backend"];
  else labels = ["Product"];

  return {
    labels,
    reasoning: `Based on similar past issue titles, this looks like a ${labels.join(
      "/"
    )} issue. Suggested priority: ${title.length > 40 ? "Medium" : "Low"}.`,
  };
}

export const issueService = {
  createIssue,
  getIssuesByProject,
  getIssuesForProjects,
  getIssueById,
  updateIssue,
  updateStatus,
  reorderColumn,
  deleteIssue,
  suggestLabelsForTitle,
};
