import type { IssuePriority } from "@prisma/client";

export interface ILabelInput {
  name: string;
  color: string;
}

export interface ICreateIssue {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  statusId?: string;
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
  statusId?: string;
  priority?: IssuePriority;
  assigneeId?: string | null;
  cycleId?: string | null;
  labels?: ILabelInput[];
}
