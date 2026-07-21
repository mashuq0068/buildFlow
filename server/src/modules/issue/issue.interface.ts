import type { IssueStatus, IssuePriority } from "@prisma/client";

export interface ILabelInput {
  name: string;
  color: string;
}

export interface ICreateIssue {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  cycleId?: string;
  parentId?: string;
  labels?: ILabelInput[];
  aiSuggestedLabels?: string[];
  aiSuggestedReasoning?: string;
}

export interface IUpdateIssue {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  cycleId?: string | null;
  labels?: ILabelInput[];
}
