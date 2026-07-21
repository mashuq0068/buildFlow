import { IssueStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateIssue, IUpdateIssue } from "./issue.interface";

async function createIssue(payload: ICreateIssue) {
  return prisma.issue.create({ data: payload });
}

async function getIssuesByProject(projectId: string) {
  return prisma.issue.findMany({
    where: { projectId },
    include: { assignee: true, labels: { include: { label: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function getIssueById(id: string) {
  return prisma.issue.findUniqueOrThrow({
    where: { id },
    include: {
      assignee: true,
      creator: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      labels: { include: { label: true } },
      subIssues: true,
    },
  });
}

async function updateIssue(id: string, payload: IUpdateIssue) {
  return prisma.issue.update({ where: { id }, data: payload });
}

async function updateIssueStatus(id: string, status: IssueStatus) {
  return prisma.issue.update({ where: { id }, data: { status } });
}

async function deleteIssue(id: string) {
  return prisma.issue.delete({ where: { id } });
}

export const issueService = {
  createIssue,
  getIssuesByProject,
  getIssueById,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
};
