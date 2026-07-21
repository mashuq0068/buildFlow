import type { IssuePriority } from "@prisma/client";

export interface ICreateDraft {
  title: string;
  description?: string;
  projectId: string;
  priority?: IssuePriority;
}

export interface IUpdateDraft {
  title?: string;
  description?: string;
  priority?: IssuePriority;
}
