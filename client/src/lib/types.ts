export type IssueStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "canceled";
export type IssuePriority = "no_priority" | "low" | "medium" | "high" | "urgent";

export interface Person {
  name: string;
  initials: string;
}

export interface Label {
  name: string;
  color: string;
}

export interface Attachment {
  name: string;
  size: string;
}

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: Person;
  labels?: Label[];
  attachments?: Attachment[];
  parentId?: string;
  projectId: string;
  cycleId?: string;
  aiSuggested?: {
    labels?: string[];
    reasoning: string;
  };
}

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export interface Project {
  id: string;
  name: string;
  teamKey: string;
  color: string;
  summary: string;
  lead?: Person;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  memberNames?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Cycle {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface Draft {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  priority: IssuePriority;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  owner?: Person;
  targetDate: string;
}

export type Role = "admin" | "member";

export interface Member extends Person {
  role: Role;
  email?: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  author: Person;
  body: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: Person;
  body: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  author: Person;
  message: string;
  createdAt: string;
}

export const STATUS_COLUMNS: { id: IssueStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
];

export const PRIORITY_LABEL: Record<IssuePriority, string> = {
  no_priority: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
