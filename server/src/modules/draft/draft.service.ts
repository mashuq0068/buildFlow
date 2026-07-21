import { prisma } from "../../lib/prisma";
import { requireProjectAccess } from "../../lib/authz";
import { HttpError } from "../../lib/http-error";
import { issueService } from "../issue/issue.service";
import type { ICreateDraft, IUpdateDraft } from "./draft.interface";

async function createDraft(userId: string, payload: ICreateDraft) {
  await requireProjectAccess(userId, payload.projectId);
  return prisma.draft.create({
    data: {
      title: payload.title,
      description: payload.description,
      projectId: payload.projectId,
      priority: payload.priority,
      authorId: userId,
    },
  });
}

async function listForUser(userId: string, workspaceId: string) {
  return prisma.draft.findMany({
    where: { authorId: userId, project: { workspaceId } },
    include: { project: true },
    orderBy: { updatedAt: "desc" },
  });
}

async function updateDraft(userId: string, id: string, payload: IUpdateDraft) {
  const draft = await prisma.draft.findUniqueOrThrow({ where: { id } });
  if (draft.authorId !== userId) throw new HttpError(403, "You can only edit your own drafts");
  return prisma.draft.update({ where: { id }, data: payload });
}

async function deleteDraft(userId: string, id: string) {
  const draft = await prisma.draft.findUniqueOrThrow({ where: { id } });
  if (draft.authorId !== userId) throw new HttpError(403, "You can only delete your own drafts");
  return prisma.draft.delete({ where: { id } });
}

async function publishDraft(userId: string, id: string) {
  const draft = await prisma.draft.findUniqueOrThrow({ where: { id } });
  if (draft.authorId !== userId) throw new HttpError(403, "You can only publish your own drafts");

  const issue = await issueService.createIssue(userId, {
    title: draft.title,
    description: draft.description ?? undefined,
    projectId: draft.projectId,
    priority: draft.priority,
  });

  await prisma.draft.delete({ where: { id } });
  return issue;
}

export const draftService = { createDraft, listForUser, updateDraft, deleteDraft, publishDraft };
