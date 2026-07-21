export type IssuePriority = "no_priority" | "low" | "medium" | "high" | "urgent";

export type StatusCategory = "backlog" | "unstarted" | "started" | "completed" | "canceled";

export interface IssueStatusOption {
  id: string;
  name: string;
  color: string;
  icon: string;
  category: StatusCategory;
  position: number;
  isDefault: boolean;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
}

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  status: IssueStatusOption;
  priority: IssuePriority;
  assignee?: Person;
  creator?: Person;
  labels?: Label[];
  attachments?: Attachment[];
  parentId?: string;
  projectId: string;
  cycleId?: string;
  archived: boolean;
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
  memberIds?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  color: string;
  role?: Role;
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

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  userNames: string[];
}

export interface DiscussionAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  isImage: boolean;
}

export interface ChatMessage {
  id: string;
  author: Person;
  body: string;
  createdAt: string;
  editedAt?: string;
  parentId?: string;
  attachments: DiscussionAttachment[];
  reactions: ReactionSummary[];
}

export interface Comment {
  id: string;
  author: Person;
  body: string;
  createdAt: string;
  editedAt?: string;
  parentId?: string;
  attachments: DiscussionAttachment[];
  reactions: ReactionSummary[];
}

export interface ActivityEntry {
  id: string;
  author: Person;
  message: string;
  createdAt: string;
}

export const CATEGORY_ORDER: StatusCategory[] = [
  "backlog",
  "unstarted",
  "started",
  "completed",
  "canceled",
];

export const CATEGORY_LABEL: Record<StatusCategory, string> = {
  backlog: "Backlog",
  unstarted: "Todo",
  started: "In Progress",
  completed: "Done",
  canceled: "Canceled",
};

export const CATEGORY_COLOR: Record<StatusCategory, string> = {
  backlog: "#8b8fa3",
  unstarted: "#6e79d6",
  started: "#e8a53f",
  completed: "#4cb782",
  canceled: "#6b7280",
};

export const PRIORITY_LABEL: Record<IssuePriority, string> = {
  no_priority: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
