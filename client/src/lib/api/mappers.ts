import type {
  Person,
  Label,
  Attachment,
  Issue,
  IssueStatus,
  IssuePriority,
  Project,
  ProjectStatus,
  Workspace,
  Cycle,
  Draft,
  Goal,
  Member,
  ChatMessage,
  Comment,
  ActivityEntry,
} from "@/lib/types";

const STATUS_FROM_SERVER: Record<string, IssueStatus> = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  DONE: "done",
  CANCELED: "canceled",
};
const STATUS_TO_SERVER: Record<IssueStatus, string> = {
  backlog: "BACKLOG",
  todo: "TODO",
  in_progress: "IN_PROGRESS",
  in_review: "IN_REVIEW",
  done: "DONE",
  canceled: "CANCELED",
};

const PRIORITY_FROM_SERVER: Record<string, IssuePriority> = {
  NO_PRIORITY: "no_priority",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};
const PRIORITY_TO_SERVER: Record<IssuePriority, string> = {
  no_priority: "NO_PRIORITY",
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  urgent: "URGENT",
};

const PROJECT_STATUS_FROM_SERVER: Record<string, ProjectStatus> = {
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
};
const PROJECT_STATUS_TO_SERVER: Record<ProjectStatus, string> = {
  planning: "PLANNING",
  active: "ACTIVE",
  on_hold: "ON_HOLD",
  completed: "COMPLETED",
};

export function statusFromServer(status: string): IssueStatus {
  return STATUS_FROM_SERVER[status] ?? "backlog";
}
export function statusToServer(status: IssueStatus): string {
  return STATUS_TO_SERVER[status];
}
export function priorityFromServer(priority: string): IssuePriority {
  return PRIORITY_FROM_SERVER[priority] ?? "no_priority";
}
export function priorityToServer(priority: IssuePriority): string {
  return PRIORITY_TO_SERVER[priority];
}
export function projectStatusFromServer(status?: string | null): ProjectStatus | undefined {
  return status ? PROJECT_STATUS_FROM_SERVER[status] : undefined;
}
export function projectStatusToServer(status?: ProjectStatus): string | undefined {
  return status ? PROJECT_STATUS_TO_SERVER[status] : undefined;
}

interface ServerUser {
  id: string;
  name: string;
  email?: string;
  initials: string;
  title?: string | null;
}

export function mapPerson(user: ServerUser): Person {
  return { id: user.id, name: user.name, initials: user.initials };
}

export function mapMember(user: ServerUser, role: string): Member {
  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
    title: user.title ?? undefined,
    role: role === "ADMIN" ? "admin" : "member",
  };
}

export function mapLabel(label: { id: string; name: string; color: string }): Label {
  return { id: label.id, name: label.name, color: label.color };
}

export function mapAttachment(a: { id: string; name: string; size: string }): Attachment {
  return { id: a.id, name: a.name, size: a.size };
}

interface ServerIssue {
  id: string;
  identifier: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  projectId: string;
  cycleId?: string | null;
  parentId?: string | null;
  assignee?: ServerUser | null;
  creator?: ServerUser | null;
  project?: { teamKey: string } | null;
  labels?: { label: { id: string; name: string; color: string } }[];
  attachments?: { id: string; name: string; size: string }[];
  aiSuggestedLabels?: string[];
  aiSuggestedReasoning?: string | null;
}

export function mapIssue(issue: ServerIssue, teamKeyFallback = "ISSUE"): Issue {
  const teamKey = issue.project?.teamKey ?? teamKeyFallback;
  return {
    id: issue.id,
    identifier: `${teamKey}-${issue.identifier}`,
    title: issue.title,
    description: issue.description ?? undefined,
    status: statusFromServer(issue.status),
    priority: priorityFromServer(issue.priority),
    projectId: issue.projectId,
    cycleId: issue.cycleId ?? undefined,
    parentId: issue.parentId ?? undefined,
    assignee: issue.assignee ? mapPerson(issue.assignee) : undefined,
    creator: issue.creator ? mapPerson(issue.creator) : undefined,
    labels: issue.labels?.map((l) => mapLabel(l.label)),
    attachments: issue.attachments?.map(mapAttachment),
    aiSuggested:
      issue.aiSuggestedLabels && issue.aiSuggestedLabels.length > 0
        ? { labels: issue.aiSuggestedLabels, reasoning: issue.aiSuggestedReasoning ?? "" }
        : undefined,
  };
}

interface ServerProject {
  id: string;
  name: string;
  teamKey: string;
  color: string;
  summary?: string | null;
  status?: string;
  startDate?: string | Date | null;
  targetDate?: string | Date | null;
  leadId?: string | null;
  lead?: ServerUser | null;
  members?: { user: ServerUser }[];
}

export function mapProject(p: ServerProject): Project {
  return {
    id: p.id,
    name: p.name,
    teamKey: p.teamKey,
    color: p.color,
    summary: p.summary ?? "",
    status: projectStatusFromServer(p.status),
    startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : undefined,
    targetDate: p.targetDate ? new Date(p.targetDate).toISOString().slice(0, 10) : undefined,
    lead: p.lead ? mapPerson(p.lead) : undefined,
    memberNames: p.members?.map((m) => m.user.name),
    memberIds: p.members?.map((m) => m.user.id),
  };
}

interface ServerWorkspace {
  id: string;
  name: string;
  slug: string;
  color: string;
  role?: string;
}

export function mapWorkspace(w: ServerWorkspace): Workspace {
  return {
    id: w.id,
    name: w.name,
    slug: w.slug,
    color: w.color,
    role: w.role === "ADMIN" ? "admin" : w.role === "MEMBER" ? "member" : undefined,
  };
}

interface ServerCycle {
  id: string;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  projectId: string;
}

export function mapCycle(c: ServerCycle): Cycle {
  return {
    id: c.id,
    projectId: c.projectId,
    name: c.name,
    description: c.description ?? undefined,
    startDate: new Date(c.startDate).toISOString().slice(0, 10),
    endDate: new Date(c.endDate).toISOString().slice(0, 10),
  };
}

interface ServerGoal {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  targetDate: string | Date;
  owner?: ServerUser | null;
}

export function mapGoal(g: ServerGoal): Goal {
  return {
    id: g.id,
    title: g.title,
    description: g.description ?? undefined,
    projectId: g.projectId,
    owner: g.owner ? mapPerson(g.owner) : undefined,
    targetDate: new Date(g.targetDate).toISOString().slice(0, 10),
  };
}

interface ServerDraft {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  projectId: string;
  updatedAt: string | Date;
}

export function mapDraft(d: ServerDraft): Draft {
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? undefined,
    projectId: d.projectId,
    priority: priorityFromServer(d.priority),
    updatedAt: new Date(d.updatedAt).toISOString(),
  };
}

interface ServerAuthored {
  id: string;
  body: string;
  author: ServerUser;
  createdAt: string | Date;
}

export function mapComment(c: ServerAuthored): Comment {
  return {
    id: c.id,
    author: mapPerson(c.author),
    body: c.body,
    createdAt: new Date(c.createdAt).toISOString(),
  };
}

export function mapChatMessage(m: ServerAuthored): ChatMessage {
  return {
    id: m.id,
    author: mapPerson(m.author),
    body: m.body,
    createdAt: new Date(m.createdAt).toISOString(),
  };
}

interface ServerActivity {
  id: string;
  message: string;
  author: ServerUser;
  createdAt: string | Date;
}

export function mapActivity(a: ServerActivity): ActivityEntry {
  return {
    id: a.id,
    author: mapPerson(a.author),
    message: a.message,
    createdAt: new Date(a.createdAt).toISOString(),
  };
}

export interface NotificationItem {
  id: string;
  actor: Person;
  message: string;
  issueIdentifier?: string;
  createdAt: string;
  read: boolean;
}

interface ServerNotification {
  id: string;
  actor: ServerUser;
  message: string;
  issueIdentifier?: string | null;
  readAt?: string | Date | null;
  createdAt: string | Date;
}

export function mapNotification(n: ServerNotification): NotificationItem {
  return {
    id: n.id,
    actor: mapPerson(n.actor),
    message: n.message,
    issueIdentifier: n.issueIdentifier ?? undefined,
    createdAt: new Date(n.createdAt).toISOString(),
    read: Boolean(n.readAt),
  };
}

export interface ActivityFeedEntry {
  id: string;
  author: Person;
  message: string;
  createdAt: string;
  issueId: string;
  issueIdentifier: string;
  projectName: string;
}

interface ServerActivityFeedEntry {
  id: string;
  message: string;
  author: ServerUser;
  createdAt: string | Date;
  issueId: string;
  issue: { identifier: number; project: { teamKey: string; name: string } };
}

export function mapActivityFeedEntry(a: ServerActivityFeedEntry): ActivityFeedEntry {
  return {
    id: a.id,
    author: mapPerson(a.author),
    message: a.message,
    createdAt: new Date(a.createdAt).toISOString(),
    issueId: a.issueId,
    issueIdentifier: `${a.issue.project.teamKey}-${a.issue.identifier}`,
    projectName: a.issue.project.name,
  };
}
