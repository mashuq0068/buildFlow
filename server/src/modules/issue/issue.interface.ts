import { IssuePriority, IssueStatus } from "@prisma/client";

export interface ICreateIssue {
  title: string;
  description?: string;
  projectId: string;
  creatorId: string;
  assigneeId?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  parentId?: string;
}

export interface IUpdateIssue {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
}
