import type { Issue, Comment, ActivityEntry, Project, Cycle, Draft, Goal, ChatMessage, Workspace } from "./types";

export const PEOPLE = {
  maya: { name: "Maya Chen", initials: "MC", email: "maya@acme.dev", title: "Platform Engineer" },
  alex: { name: "Alex Rivera", initials: "AR", email: "alex@acme.dev", title: "Engineering Lead" },
  priya: { name: "Priya Patel", initials: "PP", email: "priya@acme.dev", title: "Frontend Engineer" },
  jordan: { name: "Jordan Kim", initials: "JK", email: "jordan@acme.dev", title: "Product Designer" },
};

// Fallback author used only if a store action fires before anyone is logged in.
export const CURRENT_USER = PEOPLE.alex;

export const WORKSPACES: Workspace[] = [
  { id: "acme", name: "Acme Inc", slug: "acme", color: "#6e79d6" },
];

export const PROJECTS: Project[] = [
  {
    id: "engineering",
    name: "Engineering",
    teamKey: "ENG",
    color: "#6e79d6",
    summary: "Core product engineering — API, infra, and app features.",
    lead: PEOPLE.alex,
    status: "active",
    startDate: "2026-07-01",
    targetDate: "2026-08-11",
    memberNames: [PEOPLE.alex.name, PEOPLE.maya.name, PEOPLE.priya.name],
  },
  {
    id: "design",
    name: "Design",
    teamKey: "DES",
    color: "#e8a53f",
    summary: "Design system, product design, and research.",
    lead: PEOPLE.jordan,
    status: "active",
    startDate: "2026-07-10",
    targetDate: "2026-08-25",
    memberNames: [PEOPLE.jordan.name],
  },
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: "1",
    identifier: "ENG-128",
    title: "Define workspace onboarding flow",
    description:
      "New workspaces currently drop the user straight onto an empty board. We need a short guided setup: create first team, invite members, create first project.",
    status: "backlog",
    priority: "low",
    projectId: "engineering",
    labels: [{ name: "Product", color: "#8b8fa3" }],
  },
  {
    id: "2",
    identifier: "ENG-135",
    title: "Evaluate Redis vs Postgres LISTEN/NOTIFY for realtime",
    description:
      "Spike to compare a Redis pub/sub layer against Postgres LISTEN/NOTIFY for pushing live board updates to connected clients.",
    status: "backlog",
    priority: "no_priority",
    projectId: "engineering",
    labels: [{ name: "Infra", color: "#5e9bd6" }],
  },
  {
    id: "3",
    identifier: "ENG-142",
    title: "Set up CI pipeline for preview deployments",
    description: "Every PR should get a preview deployment URL posted as a comment.",
    status: "todo",
    priority: "medium",
    projectId: "engineering",
    assignee: PEOPLE.maya,
    labels: [{ name: "Infra", color: "#5e9bd6" }],
    aiSuggested: {
      labels: ["Infra", "CI/CD"],
      reasoning:
        "Similar past issues mentioning 'pipeline' and 'deployment' were labeled Infra + CI/CD by this team.",
    },
  },
  {
    id: "4",
    identifier: "ENG-139",
    title: "Migrate auth session storage to Redis",
    status: "todo",
    priority: "low",
    projectId: "engineering",
    labels: [{ name: "Infra", color: "#5e9bd6" }],
  },
  {
    id: "5",
    identifier: "ENG-151",
    title: "Kanban board drag-and-drop with optimistic updates",
    description:
      "Board should support cross-column drag, in-column reordering, and a drag overlay preview. Status changes should feel instant.",
    status: "in_progress",
    priority: "high",
    projectId: "engineering",
    cycleId: "eng-24",
    assignee: PEOPLE.alex,
    labels: [
      { name: "Frontend", color: "#e8a53f" },
      { name: "Feature", color: "#4cb782" },
    ],
    attachments: [{ name: "board-spec.fig", size: "1.2 MB" }],
  },
  {
    id: "6",
    identifier: "ENG-147",
    title: "Command palette fuzzy search",
    status: "in_progress",
    priority: "urgent",
    projectId: "engineering",
    cycleId: "eng-24",
    assignee: PEOPLE.alex,
    labels: [{ name: "Frontend", color: "#e8a53f" }],
    aiSuggested: {
      labels: ["Frontend", "DX"],
      reasoning: "Issues mentioning 'command palette' or '⌘K' are consistently tagged DX by this team.",
    },
  },
  {
    id: "7",
    identifier: "ENG-133",
    title: "Issue detail panel with comment thread",
    description: "Slide-over panel: description, properties, Activity/Comments/History tabs.",
    status: "in_review",
    priority: "medium",
    projectId: "engineering",
    cycleId: "eng-24",
    assignee: PEOPLE.priya,
    labels: [{ name: "Frontend", color: "#e8a53f" }],
  },
  {
    id: "8",
    identifier: "ENG-130",
    title: "Workspace + team CRUD API",
    status: "done",
    priority: "medium",
    projectId: "engineering",
    cycleId: "eng-23",
    assignee: PEOPLE.alex,
    labels: [{ name: "Backend", color: "#c25b8f" }],
  },
  {
    id: "9",
    identifier: "ENG-121",
    title: "Prisma schema for issues, labels, comments",
    status: "done",
    priority: "high",
    projectId: "engineering",
    cycleId: "eng-23",
    assignee: PEOPLE.alex,
    labels: [{ name: "Backend", color: "#c25b8f" }],
  },
  {
    id: "10",
    identifier: "DES-12",
    title: "Design system tokens for dark + light theme",
    description: "Define spacing scale, radius scale, and monochrome color tokens for the shared design system.",
    status: "in_progress",
    priority: "high",
    projectId: "design",
    assignee: PEOPLE.jordan,
    labels: [{ name: "Design System", color: "#e8a53f" }],
  },
  {
    id: "11",
    identifier: "DES-9",
    title: "Icon set audit — replace mixed icon sources with Lucide",
    status: "todo",
    priority: "medium",
    projectId: "design",
    assignee: PEOPLE.jordan,
    labels: [{ name: "Design System", color: "#e8a53f" }],
  },
  {
    id: "12",
    identifier: "DES-4",
    title: "User research: onboarding drop-off interviews",
    status: "backlog",
    priority: "low",
    projectId: "design",
    labels: [{ name: "Research", color: "#8b8fa3" }],
  },
];

export const INITIAL_COMMENTS: Record<string, Comment[]> = {
  "7": [
    {
      id: "c1",
      author: PEOPLE.priya,
      body: "First pass is up — panel slides in from the right, matches the board's monochrome theme.",
      createdAt: "2026-07-17T10:12:00Z",
    },
    {
      id: "c2",
      author: PEOPLE.alex,
      body: "Nice. Can we add the activity tab before this ships? Reviewers will want to see status history.",
      createdAt: "2026-07-17T11:03:00Z",
    },
  ],
  "5": [
    {
      id: "c3",
      author: PEOPLE.alex,
      body: "Cross-column drag works. Still need to persist order within a column on drop.",
      createdAt: "2026-07-16T09:40:00Z",
    },
  ],
};

export const INITIAL_ACTIVITY: Record<string, ActivityEntry[]> = {
  "7": [
    {
      id: "a1",
      author: PEOPLE.priya,
      message: "moved this issue from Todo to In Review",
      createdAt: "2026-07-17T09:55:00Z",
    },
    {
      id: "a2",
      author: PEOPLE.priya,
      message: "set priority to Medium",
      createdAt: "2026-07-16T14:20:00Z",
    },
  ],
  "5": [
    {
      id: "a3",
      author: PEOPLE.alex,
      message: "moved this issue from Todo to In Progress",
      createdAt: "2026-07-15T16:00:00Z",
    },
  ],
  "8": [
    {
      id: "a4",
      author: PEOPLE.alex,
      message: "moved this issue from In Progress to Done",
      createdAt: "2026-07-14T12:00:00Z",
    },
  ],
  "9": [
    {
      id: "a5",
      author: PEOPLE.alex,
      message: "moved this issue from In Review to Done",
      createdAt: "2026-07-13T15:30:00Z",
    },
  ],
};

// Mocked notifications feed for the Inbox page + topbar bell dropdown.
export interface NotificationItem {
  id: string;
  actor: { name: string; initials: string };
  message: string;
  issueIdentifier?: string;
  createdAt: string;
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    actor: PEOPLE.priya,
    message: "mentioned you in a comment",
    issueIdentifier: "ENG-133",
    createdAt: "2026-07-19T08:10:00Z",
    read: false,
  },
  {
    id: "n2",
    actor: PEOPLE.maya,
    message: "assigned you to an issue",
    issueIdentifier: "ENG-142",
    createdAt: "2026-07-18T16:45:00Z",
    read: false,
  },
  {
    id: "n3",
    actor: PEOPLE.jordan,
    message: "requested review on",
    issueIdentifier: "DES-12",
    createdAt: "2026-07-18T09:00:00Z",
    read: true,
  },
  {
    id: "n4",
    actor: PEOPLE.priya,
    message: "moved an issue you're watching to Done",
    issueIdentifier: "ENG-130",
    createdAt: "2026-07-16T11:20:00Z",
    read: true,
  },
];

export const CYCLES: Cycle[] = [
  {
    id: "eng-23",
    projectId: "engineering",
    name: "Cycle 23",
    description: "Backend foundations: workspace API, Prisma schema, CRUD endpoints.",
    startDate: "2026-07-01",
    endDate: "2026-07-14",
  },
  {
    id: "eng-24",
    projectId: "engineering",
    name: "Cycle 24",
    description: "Board UX: drag-and-drop, command palette, issue detail panel.",
    startDate: "2026-07-15",
    endDate: "2026-07-28",
  },
  {
    id: "eng-25",
    projectId: "engineering",
    name: "Cycle 25",
    description: "Polish pass: analytics, roadmap, chat, and permissions.",
    startDate: "2026-07-29",
    endDate: "2026-08-11",
  },
];

export const GOALS: Goal[] = [
  {
    id: "g1",
    title: "Ship a fully functional Linear-style board with realtime-feeling UX",
    description: "Drag-and-drop, keyboard shortcuts, and command palette should all feel instant.",
    owner: PEOPLE.alex,
    projectId: "engineering",
    targetDate: "2026-08-01",
  },
  {
    id: "g2",
    title: "Establish a monochrome design system used across every screen",
    description: "One accent color, consistent radius scale, light + dark parity everywhere.",
    owner: PEOPLE.jordan,
    projectId: "design",
    targetDate: "2026-07-25",
  },
  {
    id: "g3",
    title: "Reduce onboarding drop-off by shipping a guided first-run flow",
    description: "Guide new workspaces through creating their first team and project.",
    owner: PEOPLE.maya,
    projectId: "engineering",
    targetDate: "2026-08-15",
  },
];

export const INITIAL_DRAFTS: Draft[] = [
  {
    id: "d1",
    title: "Explore keyboard-first navigation (j/k to move between issues)",
    description: "Similar to Linear's list navigation — arrow/vim keys to move focus, Enter to open.",
    projectId: "engineering",
    priority: "low",
    updatedAt: "2026-07-18T20:00:00Z",
  },
];

export const INITIAL_FAVORITE_IDS: string[] = ["5", "7"];

export const INITIAL_PROJECT_CHAT: Record<string, ChatMessage[]> = {
  engineering: [
    {
      id: "pc1",
      author: PEOPLE.alex,
      body: "Kicking off Cycle 25 — focus is analytics, roadmap, and chat this round.",
      createdAt: "2026-07-18T09:00:00Z",
    },
    {
      id: "pc2",
      author: PEOPLE.maya,
      body: "Sounds good. I'll pick up the roadmap date wiring once the project model supports start/target dates.",
      createdAt: "2026-07-18T09:12:00Z",
    },
    {
      id: "pc3",
      author: PEOPLE.priya,
      body: "I can take the project-level chat UI if that's still open.",
      createdAt: "2026-07-18T09:15:00Z",
    },
  ],
  design: [
    {
      id: "pc4",
      author: PEOPLE.jordan,
      body: "Design system tokens are in review — should be ready for the Engineering team to consume by Friday.",
      createdAt: "2026-07-17T15:30:00Z",
    },
  ],
};
