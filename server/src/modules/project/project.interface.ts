import type { ProjectStatus } from "@prisma/client";

export interface ICreateProject {
  name: string;
  teamKey: string;
  color?: string;
  summary?: string;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  workspaceId: string;
  leadId?: string;
  memberUserIds?: string[];
}

export interface IUpdateProject {
  name?: string;
  teamKey?: string;
  color?: string;
  summary?: string;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  leadId?: string | null;
}
