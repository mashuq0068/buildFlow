import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { hashToken } from "../src/lib/jwt";
import { DEFAULT_STATUS_TEMPLATE } from "../src/lib/default-statuses";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234!";

const STATUS_CYCLE = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Done", "Canceled"];
const PRIORITY_CYCLE = ["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"] as const;
const DUE_DATES = [
  "2026-07-05",
  "2026-07-10",
  "2026-07-15",
  "2026-07-18",
  "2026-07-20",
  "2026-07-25",
  "2026-07-28",
  "2026-08-02",
  "2026-08-10",
  "2026-08-20",
  "2026-09-01",
];

async function reset() {
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.commentReaction.deleteMany();
  await prisma.commentAttachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.issueLabel.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.issueStatusOption.deleteMany();
  await prisma.projectChatReaction.deleteMany();
  await prisma.projectChatAttachment.deleteMany();
  await prisma.projectChatMessage.deleteMany();
  await prisma.draft.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.workspaceInvite.deleteMany();
  await prisma.project.deleteMany();
  await prisma.label.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
}

async function createDefaultStatuses(projectId: string) {
  const statusByName = new Map<string, string>();
  for (let i = 0; i < DEFAULT_STATUS_TEMPLATE.length; i++) {
    const template = DEFAULT_STATUS_TEMPLATE[i];
    const status = await prisma.issueStatusOption.create({
      data: { ...template, position: i, projectId },
    });
    statusByName.set(template.name, status.id);
  }
  return statusByName;
}

function mention(user: { id: string; name: string }) {
  return `<span data-type="mention" data-id="${user.id}">@${user.name}</span>`;
}

interface IssueSpec {
  title: string;
  description?: string;
}

interface SeedProjectIssuesArgs {
  project: { id: string };
  teamKey: string;
  statusByName: Map<string, string>;
  labelByName: Map<string, string>;
  specs: IssueSpec[];
  creatorId: string;
  assigneeIds: string[];
  labelPool: string[][];
  startIdentifier: number;
}

async function seedProjectIssues({
  project,
  statusByName,
  labelByName,
  specs,
  creatorId,
  assigneeIds,
  labelPool,
  startIdentifier,
}: SeedProjectIssuesArgs) {
  const createdIds: string[] = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const statusName = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const priority = PRIORITY_CYCLE[(i + 2) % PRIORITY_CYCLE.length];
    const assignee = assigneeIds[i % assigneeIds.length];
    const labels = labelPool[i % labelPool.length];
    const dueDate = i % 2 === 0 ? new Date(DUE_DATES[i % DUE_DATES.length]) : undefined;
    const blockedById =
      statusName === "Blocked" && createdIds.length > 0
        ? createdIds[createdIds.length - 1]
        : undefined;

    const issue = await prisma.issue.create({
      data: {
        identifier: startIdentifier + i,
        title: spec.title,
        description: spec.description,
        statusId: statusByName.get(statusName)!,
        priority,
        projectId: project.id,
        creatorId,
        assigneeId: i % 5 === 0 ? undefined : assignee,
        dueDate,
        blockedById,
        parentId: i === specs.length - 1 ? createdIds[0] : undefined,
        aiSuggestedLabels: i % 6 === 0 ? labels : undefined,
        aiSuggestedReasoning:
          i % 6 === 0
            ? `Similar past issue titles in this project were tagged ${labels.join(", ")}.`
            : undefined,
        attachments:
          i % 4 === 0 ? { create: [{ name: "spec-notes.pdf", size: "480 KB" }] } : undefined,
        labels: { create: labels.map((l) => ({ labelId: labelByName.get(l)! })) },
      },
    });
    createdIds.push(issue.id);
  }
  return createdIds;
}

interface ThreadEntry {
  authorId: string;
  body: string;
  createdAt: string;
  replyToFirst?: boolean;
  reactions?: { userId: string; emoji: string }[];
}

async function seedCommentThread(issueId: string, entries: ThreadEntry[]) {
  let firstId: string | undefined;
  for (const e of entries) {
    const comment = await prisma.comment.create({
      data: {
        issueId,
        authorId: e.authorId,
        body: e.body,
        parentId: e.replyToFirst ? firstId : undefined,
        createdAt: new Date(e.createdAt),
      },
    });
    if (!firstId) firstId = comment.id;
    for (const r of e.reactions ?? []) {
      await prisma.commentReaction.create({
        data: { commentId: comment.id, userId: r.userId, emoji: r.emoji },
      });
    }
  }
}

async function seedChatThread(projectId: string, entries: ThreadEntry[]) {
  let firstId: string | undefined;
  for (const e of entries) {
    const message = await prisma.projectChatMessage.create({
      data: {
        projectId,
        authorId: e.authorId,
        body: e.body,
        parentId: e.replyToFirst ? firstId : undefined,
        createdAt: new Date(e.createdAt),
      },
    });
    if (!firstId) firstId = message.id;
    for (const r of e.reactions ?? []) {
      await prisma.projectChatReaction.create({
        data: { messageId: message.id, userId: r.userId, emoji: r.emoji },
      });
    }
  }
}

async function main() {
  console.log("Resetting database...");
  await reset();

  console.log("Seeding users...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  function unsplashAvatar(photoId: string) {
    return `https://images.unsplash.com/photo-${photoId}?w=256&h=256&fit=crop&crop=faces&q=80`;
  }

  async function makeUser(
    name: string,
    email: string,
    initials: string,
    title: string,
    photoId: string
  ) {
    return prisma.user.create({
      data: { name, email, initials, title, passwordHash, avatarUrl: unsplashAvatar(photoId) },
    });
  }

  const maya = await makeUser("Maya Chen", "maya@acme.dev", "MC", "Platform Engineer", "1494790108377-be9c29b29330");
  const alex = await makeUser("Alex Rivera", "alex@acme.dev", "AR", "Engineering Lead", "1507003211169-0a1dd7228f2d");
  const nadia = await makeUser("Nadia Rahman", "nadia@acme.dev", "NR", "Frontend Engineer", "1573496359142-b8d87734a5a2");
  const jordan = await makeUser("Jordan Kim", "jordan@acme.dev", "JK", "Product Designer", "1519085360753-af0119f7cbe7");
  const fahim = await makeUser("Fahim Hasan", "fahim@acme.dev", "FH", "Backend Engineer", "1500648767791-00dcc994a43e");
  const emily = await makeUser("Emily Carter", "emily@acme.dev", "EC", "Marketing Lead", "1544005313-94ddf0286df2");
  const tanvir = await makeUser("Tanvir Ahmed", "tanvir@acme.dev", "TA", "Mobile Engineer", "1531123897727-8f129e1688ce");
  const olivia = await makeUser("Olivia Turner", "olivia@acme.dev", "OT", "QA Engineer", "1580489944761-15a19d654956");
  const sadia = await makeUser("Sadia Islam", "sadia@acme.dev", "SI", "UX Researcher", "1500917293891-ef795e70e1f6");
  const ethan = await makeUser("Ethan Brooks", "ethan@acme.dev", "EB", "DevOps Engineer", "1472099645785-5658abf4ff4e");
  const rafiq = await makeUser("Rafiq Chowdhury", "rafiq@acme.dev", "RC", "Growth Marketer", "1552058544-f2b08422138a");
  const grace = await makeUser("Grace Coleman", "grace@acme.dev", "GC", "Mobile Designer", "1508214751196-bcfd4ca60f91");

  console.log("Seeding workspace...");
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Inc",
      slug: "acme",
      color: "#6e79d6",
      members: {
        create: [
          { userId: maya.id, role: "ADMIN" },
          { userId: alex.id, role: "ADMIN" },
          { userId: nadia.id, role: "MEMBER" },
          { userId: jordan.id, role: "MEMBER" },
          { userId: fahim.id, role: "MEMBER" },
          { userId: emily.id, role: "MEMBER" },
          { userId: tanvir.id, role: "MEMBER" },
          { userId: olivia.id, role: "MEMBER" },
          { userId: sadia.id, role: "MEMBER" },
          { userId: ethan.id, role: "MEMBER" },
          { userId: rafiq.id, role: "MEMBER" },
          { userId: grace.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("Seeding projects...");
  const engineering = await prisma.project.create({
    data: {
      name: "Engineering",
      teamKey: "ENG",
      color: "#6e79d6",
      summary: "Core product engineering — API, infra, and app features.",
      status: "ACTIVE",
      startDate: new Date("2026-07-01"),
      targetDate: new Date("2026-08-11"),
      workspaceId: workspace.id,
      leadId: alex.id,
      members: {
        create: [
          { userId: alex.id },
          { userId: maya.id },
          { userId: nadia.id },
          { userId: fahim.id },
          { userId: ethan.id },
        ],
      },
    },
  });
  const design = await prisma.project.create({
    data: {
      name: "Design",
      teamKey: "DES",
      color: "#e8a53f",
      summary: "Design system, product design, and research.",
      status: "ACTIVE",
      startDate: new Date("2026-07-10"),
      targetDate: new Date("2026-08-25"),
      workspaceId: workspace.id,
      leadId: jordan.id,
      members: { create: [{ userId: jordan.id }, { userId: sadia.id }, { userId: grace.id }] },
    },
  });
  const marketing = await prisma.project.create({
    data: {
      name: "Marketing",
      teamKey: "MKT",
      color: "#4cb782",
      summary: "Launch campaigns, content, and growth experiments.",
      status: "PLANNING",
      startDate: new Date("2026-07-15"),
      targetDate: new Date("2026-09-01"),
      workspaceId: workspace.id,
      leadId: emily.id,
      members: { create: [{ userId: emily.id }, { userId: rafiq.id }] },
    },
  });
  const mobile = await prisma.project.create({
    data: {
      name: "Mobile",
      teamKey: "MOB",
      color: "#c25b8f",
      summary: "Native iOS and Android app.",
      status: "ACTIVE",
      startDate: new Date("2026-07-05"),
      targetDate: new Date("2026-08-30"),
      workspaceId: workspace.id,
      leadId: tanvir.id,
      members: { create: [{ userId: tanvir.id }, { userId: grace.id }, { userId: olivia.id }] },
    },
  });

  console.log("Seeding issue statuses...");
  const engStatus = await createDefaultStatuses(engineering.id);
  const desStatus = await createDefaultStatuses(design.id);
  const mktStatus = await createDefaultStatuses(marketing.id);
  const mobStatus = await createDefaultStatuses(mobile.id);

  console.log("Seeding cycles...");
  const cycle23 = await prisma.cycle.create({
    data: {
      name: "Cycle 23",
      description: "Backend foundations: workspace API, Prisma schema, CRUD endpoints.",
      projectId: engineering.id,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-14"),
    },
  });
  const cycle24 = await prisma.cycle.create({
    data: {
      name: "Cycle 24",
      description: "Board UX: drag-and-drop, command palette, issue detail panel.",
      projectId: engineering.id,
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-07-28"),
    },
  });
  await prisma.cycle.create({
    data: {
      name: "Cycle 25",
      description: "Polish pass: analytics, roadmap, chat, and permissions.",
      projectId: engineering.id,
      startDate: new Date("2026-07-29"),
      endDate: new Date("2026-08-11"),
    },
  });
  await prisma.cycle.create({
    data: {
      name: "Design Sprint 7",
      description: "Design system tokens and accessibility pass.",
      projectId: design.id,
      startDate: new Date("2026-07-10"),
      endDate: new Date("2026-07-24"),
    },
  });
  await prisma.cycle.create({
    data: {
      name: "Mobile Sprint 3",
      description: "Offline mode and biometric login.",
      projectId: mobile.id,
      startDate: new Date("2026-07-08"),
      endDate: new Date("2026-07-22"),
    },
  });

  console.log("Seeding goals...");
  await prisma.goal.create({
    data: {
      title: "Ship a fully functional Linear-style board with realtime-feeling UX",
      description: "Drag-and-drop, keyboard shortcuts, and command palette should all feel instant.",
      projectId: engineering.id,
      ownerId: alex.id,
      targetDate: new Date("2026-08-01"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Ship real-time collaboration across comments and chat",
      description: "Socket.IO push updates for comments, chat, reactions, and mentions.",
      projectId: engineering.id,
      ownerId: maya.id,
      targetDate: new Date("2026-08-05"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Establish a monochrome design system used across every screen",
      description: "One accent color, consistent radius scale, light + dark parity everywhere.",
      projectId: design.id,
      ownerId: jordan.id,
      targetDate: new Date("2026-07-25"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Reduce onboarding drop-off by shipping a guided first-run flow",
      description: "Guide new workspaces through creating their first team and project.",
      projectId: engineering.id,
      ownerId: maya.id,
      targetDate: new Date("2026-08-15"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Launch Q3 campaign with a 15% trial signup lift",
      description: "Landing page, nurture sequence, and paid social push.",
      projectId: marketing.id,
      ownerId: emily.id,
      targetDate: new Date("2026-09-01"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Reach feature parity between iOS and Android",
      description: "Offline drafts, biometric login, and push notifications on both platforms.",
      projectId: mobile.id,
      ownerId: tanvir.id,
      targetDate: new Date("2026-08-20"),
    },
  });

  console.log("Seeding milestones...");
  await prisma.milestone.create({
    data: {
      title: "Realtime infrastructure live",
      description: "Socket.IO rooms for issue comments and project chat shipped to all users.",
      projectId: engineering.id,
      targetDate: new Date("2026-07-25"),
      completed: true,
    },
  });
  await prisma.milestone.create({
    data: {
      title: "Public beta",
      description: "Open the workspace up to the first external pilot customers.",
      projectId: engineering.id,
      targetDate: new Date("2026-08-15"),
      completed: false,
    },
  });
  await prisma.milestone.create({
    data: {
      title: "Design system v1 frozen",
      description: "Tokens, components, and accessibility pass locked for the quarter.",
      projectId: design.id,
      targetDate: new Date("2026-07-28"),
      completed: false,
    },
  });
  await prisma.milestone.create({
    data: {
      title: "Q3 campaign launch",
      projectId: marketing.id,
      targetDate: new Date("2026-09-01"),
      completed: false,
    },
  });
  await prisma.milestone.create({
    data: {
      title: "App Store submission",
      description: "Submit the 2.0 build with offline mode and biometric login.",
      projectId: mobile.id,
      targetDate: new Date("2026-08-25"),
      completed: false,
    },
  });

  console.log("Seeding labels...");
  const labelSeeds = [
    { name: "Product", color: "#8b8fa3" },
    { name: "Infra", color: "#5e9bd6" },
    { name: "Frontend", color: "#e8a53f" },
    { name: "Feature", color: "#4cb782" },
    { name: "Backend", color: "#c25b8f" },
    { name: "Design System", color: "#e8a53f" },
    { name: "Research", color: "#8b8fa3" },
    { name: "Bug", color: "#e5484d" },
    { name: "Marketing", color: "#4cb782" },
    { name: "Mobile", color: "#c25b8f" },
    { name: "Tech Debt", color: "#6b7280" },
    { name: "DX", color: "#5e9bd6" },
  ];
  const labelByName = new Map<string, string>();
  for (const l of labelSeeds) {
    const row = await prisma.label.create({ data: { ...l, workspaceId: workspace.id } });
    labelByName.set(l.name, row.id);
  }

  console.log("Seeding issues...");

  const engIssues = await seedProjectIssues({
    project: engineering,
    teamKey: "ENG",
    statusByName: engStatus,
    labelByName,
    creatorId: alex.id,
    assigneeIds: [alex.id, maya.id, nadia.id, fahim.id, ethan.id],
    startIdentifier: 100,
    labelPool: [
      ["Product"],
      ["Infra"],
      ["Backend"],
      ["Frontend", "Feature"],
      ["Tech Debt"],
      ["DX"],
      ["Bug"],
    ],
    specs: [
      {
        title: "Define workspace onboarding flow",
        description:
          "New workspaces currently drop the user straight onto an empty board. We need a short guided setup: create first team, invite members, create first project.",
      },
      {
        title: "Evaluate Redis vs Postgres LISTEN/NOTIFY for realtime",
        description: "Spike comparing a Redis pub/sub layer against Postgres LISTEN/NOTIFY — resolved in favor of Socket.IO directly on the API server.",
      },
      {
        title: "Set up CI pipeline for preview deployments",
        description: "Every PR should get a preview deployment URL posted as a comment.",
      },
      { title: "Migrate auth session storage to Redis" },
      {
        title: "Kanban board drag-and-drop with optimistic updates",
        description:
          "Board should support cross-column drag, in-column reordering, and a drag overlay preview. Status changes should feel instant.",
      },
      { title: "Command palette fuzzy search" },
      {
        title: "Issue detail panel with comment thread",
        description: "Slide-over panel: description, properties, Activity/Comments/History tabs.",
      },
      { title: "Workspace + team CRUD API" },
      { title: "Prisma schema for issues, labels, comments" },
      { title: "Rate limit the public invite-accept endpoint" },
      { title: "Add database connection pooling for prod" },
      {
        title: "Socket.IO reconnect storm when VPN drops",
        description: "Clients on flaky VPNs reconnect in a tight loop instead of backing off.",
      },
      { title: "Nightly backup job silently failing since June" },
      { title: "Refactor issue reorder endpoint to a single transaction" },
      { title: "Add Sentry error tracking to the API" },
      { title: "Support bulk CSV import for issues" },
      { title: "Load test the Socket.IO server under 500 concurrent connections" },
      { title: "Add database read replicas for the analytics queries" },
    ],
  });

  const desIssues = await seedProjectIssues({
    project: design,
    teamKey: "DES",
    statusByName: desStatus,
    labelByName,
    creatorId: jordan.id,
    assigneeIds: [jordan.id, sadia.id, grace.id, maya.id, alex.id],
    startIdentifier: 40,
    labelPool: [["Design System"], ["Research"], ["Frontend"], ["Bug"]],
    specs: [
      {
        title: "Design system tokens for dark + light theme",
        description: "Define spacing scale, radius scale, and monochrome color tokens for the shared design system.",
      },
      { title: "Icon set audit — replace mixed icon sources with Lucide" },
      { title: "User research: onboarding drop-off interviews" },
      { title: "Redesign empty states across the app" },
      { title: "Component library: button variants and states" },
      { title: "Accessibility audit — color contrast pass" },
      { title: "New issue modal visual polish" },
      { title: "Motion guidelines for panel transitions" },
      { title: "Dark mode QA pass on all charts" },
      { title: "Onboarding illustration set" },
      { title: "Design review: mobile card layout" },
      { title: "Typography scale audit" },
      { title: "Figma-to-code handoff checklist" },
      { title: "Rebrand exploration — accent color options" },
      { title: "Review Engineering's realtime UI states for visual consistency" },
      { title: "Audit chart color palette for accessibility contrast" },
      { title: "Empty-state illustration set for zero-data screens" },
      { title: "Design QA pass on the new Roadmap timeline" },
    ],
  });

  const mktIssues = await seedProjectIssues({
    project: marketing,
    teamKey: "MKT",
    statusByName: mktStatus,
    labelByName,
    creatorId: emily.id,
    assigneeIds: [emily.id, rafiq.id, maya.id, alex.id],
    startIdentifier: 10,
    labelPool: [["Marketing"], ["Research"], ["Product"]],
    specs: [
      { title: "Q3 launch landing page copy" },
      { title: "Case study: Acme workspace migration story" },
      { title: "Email nurture sequence for trial signups" },
      { title: "SEO audit of docs site" },
      { title: "Partner co-marketing webinar planning" },
      { title: "Rebrand social media templates" },
      { title: "Customer testimonial video shoot" },
      { title: "Pricing page A/B test results" },
      { title: "Conference booth design brief" },
      { title: "Blog editorial calendar for August" },
      { title: "Referral program launch checklist" },
      { title: "Analytics dashboard for campaign ROI" },
      { title: "Draft press release for the realtime collaboration launch" },
      { title: "Competitor feature comparison one-pager" },
      { title: "Set up UTM tracking for the Q3 campaign" },
      { title: "Customer advisory board recruitment" },
    ],
  });

  const mobIssues = await seedProjectIssues({
    project: mobile,
    teamKey: "MOB",
    statusByName: mobStatus,
    labelByName,
    creatorId: tanvir.id,
    assigneeIds: [tanvir.id, grace.id, olivia.id, maya.id, alex.id],
    startIdentifier: 20,
    labelPool: [["Mobile"], ["Bug"], ["Feature"], ["Design System"]],
    specs: [
      { title: "Push notification permission flow" },
      { title: "Offline mode for issue drafts" },
      { title: "Biometric login (Face ID / fingerprint)" },
      {
        title: "Crash on cold start — Android 14",
        description: "Reproducible on Pixel 8 running Android 14 QPR2. Stack trace points at the notification listener service.",
      },
      { title: "Dark mode parity with web app" },
      { title: "Swipe gestures for issue list" },
      { title: "App Store screenshots refresh" },
      { title: "Deep linking to a specific issue" },
      { title: "Background sync reliability" },
      { title: "iPad split-view layout" },
      { title: "In-app update prompt" },
      { title: "Performance: reduce cold start time" },
      { title: "Socket reconnect handling when the app resumes from background" },
      { title: "Shared component library sync with the web design system" },
      { title: "Accessibility pass: VoiceOver labels on the board view" },
      { title: "Widget: today's assigned issues on the home screen" },
    ],
  });

  console.log("Seeding comment threads...");
  await seedCommentThread(engIssues[6], [
    {
      authorId: nadia.id,
      body: "First pass is up — panel slides in from the right, matches the board's monochrome theme.",
      createdAt: "2026-07-17T10:12:00Z",
      reactions: [{ userId: alex.id, emoji: "👍" }],
    },
    {
      authorId: alex.id,
      body: `Nice. Can we add the activity tab before this ships? ${mention(maya)} reviewers will want to see status history.`,
      createdAt: "2026-07-17T11:03:00Z",
    },
    {
      authorId: nadia.id,
      body: "Added — Activity tab now shows status changes, priority changes, and assignment changes.",
      createdAt: "2026-07-17T14:20:00Z",
      replyToFirst: true,
      reactions: [
        { userId: alex.id, emoji: "🎉" },
        { userId: maya.id, emoji: "🚀" },
      ],
    },
  ]);
  await seedCommentThread(engIssues[4], [
    {
      authorId: alex.id,
      body: "Cross-column drag works. Still need to persist order within a column on drop.",
      createdAt: "2026-07-16T09:40:00Z",
    },
    {
      authorId: maya.id,
      body: "Order-within-column is in now via the reorder endpoint — single transaction, no more flicker.",
      createdAt: "2026-07-16T16:10:00Z",
      replyToFirst: true,
    },
  ]);
  await seedCommentThread(engIssues[11], [
    {
      authorId: fahim.id,
      body: `${mention(ethan)} seeing reconnect storms in the logs whenever a client's VPN drops mid-session — looks like the client isn't backing off between attempts.`,
      createdAt: "2026-07-19T13:05:00Z",
    },
    {
      authorId: ethan.id,
      body: "Confirmed — default socket.io-client reconnection delay is fine, this looks like a proxy timeout closing idle connections early. Investigating the load balancer config.",
      createdAt: "2026-07-19T14:30:00Z",
      replyToFirst: true,
      reactions: [{ userId: fahim.id, emoji: "👀" }],
    },
  ]);
  await seedCommentThread(desIssues[0], [
    {
      authorId: sadia.id,
      body: "Contrast ratios for the tertiary text token are borderline in light mode — recommend bumping from #6b6b72 to something a touch darker.",
      createdAt: "2026-07-14T09:00:00Z",
    },
    {
      authorId: jordan.id,
      body: "Agreed, updating the token now.",
      createdAt: "2026-07-14T10:15:00Z",
      replyToFirst: true,
      reactions: [{ userId: sadia.id, emoji: "✅" }],
    },
  ]);
  await seedCommentThread(mobIssues[3], [
    {
      authorId: olivia.id,
      body: `Repro'd on a fresh Pixel 8 — crash happens before the splash screen even renders. ${mention(tanvir)} can you take a look at the notification listener init order?`,
      createdAt: "2026-07-20T08:45:00Z",
    },
    {
      authorId: tanvir.id,
      body: "On it — looks like we're registering the listener before the app context is ready on API 34+.",
      createdAt: "2026-07-20T09:30:00Z",
      replyToFirst: true,
      reactions: [{ userId: olivia.id, emoji: "🙏" }],
    },
  ]);

  console.log("Seeding activity log...");
  const activitySeeds: { issueId: string; authorId: string; message: string; createdAt: string }[] = [
    { issueId: engIssues[6], authorId: nadia.id, message: "moved this issue from Todo to In Review", createdAt: "2026-07-17T09:55:00Z" },
    { issueId: engIssues[6], authorId: nadia.id, message: "set priority to medium", createdAt: "2026-07-16T14:20:00Z" },
    { issueId: engIssues[4], authorId: alex.id, message: "moved this issue from Todo to In Progress", createdAt: "2026-07-15T16:00:00Z" },
    { issueId: engIssues[7], authorId: alex.id, message: "moved this issue from In Progress to Done", createdAt: "2026-07-14T12:00:00Z" },
    { issueId: engIssues[8], authorId: alex.id, message: "moved this issue from In Review to Done", createdAt: "2026-07-13T15:30:00Z" },
    { issueId: engIssues[11], authorId: fahim.id, message: "moved this issue from Todo to Blocked", createdAt: "2026-07-19T13:00:00Z" },
    { issueId: engIssues[11], authorId: fahim.id, message: "set priority to critical", createdAt: "2026-07-19T13:02:00Z" },
    { issueId: desIssues[0], authorId: jordan.id, message: "assigned this issue to Jordan Kim", createdAt: "2026-07-11T10:00:00Z" },
    { issueId: desIssues[3], authorId: sadia.id, message: "moved this issue from Backlog to Todo", createdAt: "2026-07-12T11:00:00Z" },
    { issueId: mktIssues[0], authorId: emily.id, message: "created this issue", createdAt: "2026-07-16T09:00:00Z" },
    { issueId: mobIssues[3], authorId: olivia.id, message: "set priority to critical", createdAt: "2026-07-20T08:40:00Z" },
    { issueId: mobIssues[2], authorId: tanvir.id, message: "moved this issue from Todo to In Progress", createdAt: "2026-07-18T09:00:00Z" },
  ];
  for (const a of activitySeeds) {
    await prisma.activityLog.create({ data: { ...a, createdAt: new Date(a.createdAt) } });
  }

  console.log("Seeding favorites...");
  await prisma.favorite.create({ data: { userId: alex.id, issueId: engIssues[4] } });
  await prisma.favorite.create({ data: { userId: alex.id, issueId: engIssues[6] } });
  await prisma.favorite.create({ data: { userId: maya.id, issueId: engIssues[11] } });
  await prisma.favorite.create({ data: { userId: jordan.id, issueId: desIssues[0] } });
  await prisma.favorite.create({ data: { userId: tanvir.id, issueId: mobIssues[3] } });

  console.log("Seeding drafts...");
  await prisma.draft.create({
    data: {
      title: "Explore keyboard-first navigation (j/k to move between issues)",
      description: "Similar to Linear's list navigation — arrow/vim keys to move focus, Enter to open.",
      projectId: engineering.id,
      priority: "LOW",
      authorId: alex.id,
      updatedAt: new Date("2026-07-18T20:00:00Z"),
    },
  });
  await prisma.draft.create({
    data: {
      title: "Add a public status page for uptime",
      projectId: engineering.id,
      priority: "MEDIUM",
      authorId: maya.id,
      updatedAt: new Date("2026-07-19T11:00:00Z"),
    },
  });
  await prisma.draft.create({
    data: {
      title: "Referral landing page draft copy",
      description: "First pass at hero copy and CTA for the referral program launch.",
      projectId: marketing.id,
      priority: "LOW",
      authorId: emily.id,
      updatedAt: new Date("2026-07-20T15:00:00Z"),
    },
  });

  console.log("Seeding project chat...");
  await seedChatThread(engineering.id, [
    { authorId: alex.id, body: "Kicking off Cycle 25 — focus is analytics, roadmap, and realtime chat this round.", createdAt: "2026-07-18T09:00:00Z" },
    { authorId: maya.id, body: "Sounds good, I'll pick up the Socket.IO auth handshake.", createdAt: "2026-07-18T09:12:00Z", reactions: [{ userId: alex.id, emoji: "👍" }] },
    { authorId: nadia.id, body: "I can take the discussion panel UI once the events are wired up.", createdAt: "2026-07-18T09:15:00Z" },
    { authorId: fahim.id, body: `${mention(ethan)} once the reconnect fix lands, want to pair on load-testing the socket server?`, createdAt: "2026-07-19T15:00:00Z" },
    { authorId: ethan.id, body: "Yep, let's do it after standup tomorrow.", createdAt: "2026-07-19T15:05:00Z", replyToFirst: false },
  ]);
  await seedChatThread(design.id, [
    { authorId: jordan.id, body: "Design system tokens are in review — should be ready for the Engineering team to consume by Friday.", createdAt: "2026-07-17T15:30:00Z" },
    { authorId: sadia.id, body: "Research interviews for onboarding drop-off are scheduled for next week, 6 participants confirmed.", createdAt: "2026-07-18T10:00:00Z", reactions: [{ userId: jordan.id, emoji: "🎉" }] },
    { authorId: grace.id, body: "Mobile card layout mockups are up in Figma, would love a look before Thursday's review.", createdAt: "2026-07-19T13:20:00Z" },
  ]);
  await seedChatThread(marketing.id, [
    { authorId: emily.id, body: "Q3 landing page copy first draft is in the doc, feedback welcome.", createdAt: "2026-07-19T09:00:00Z" },
    { authorId: rafiq.id, body: "Referral program checklist is about 60% done — waiting on legal sign-off for terms.", createdAt: "2026-07-20T11:00:00Z", reactions: [{ userId: emily.id, emoji: "👀" }] },
  ]);
  await seedChatThread(mobile.id, [
    { authorId: tanvir.id, body: "Biometric login is behind a feature flag on TestFlight now — please test on real devices, not simulator.", createdAt: "2026-07-20T08:00:00Z" },
    { authorId: olivia.id, body: "Will run the full regression pass today and report back.", createdAt: "2026-07-20T08:10:00Z", replyToFirst: true, reactions: [{ userId: tanvir.id, emoji: "🙏" }] },
    { authorId: grace.id, body: "Dark mode parity screenshots attached in the design doc for reference.", createdAt: "2026-07-20T14:00:00Z" },
  ]);

  console.log("Seeding notifications...");
  const notificationSeeds = [
    { recipientId: alex.id, actorId: nadia.id, message: "mentioned you in a comment", issueIdentifier: "ENG-107", createdAt: "2026-07-19T08:10:00Z" },
    { recipientId: alex.id, actorId: maya.id, message: "assigned you to an issue", issueIdentifier: "ENG-102", createdAt: "2026-07-18T16:45:00Z" },
    { recipientId: alex.id, actorId: jordan.id, message: "requested review on", issueIdentifier: "DES-40", createdAt: "2026-07-18T09:00:00Z", readAt: "2026-07-18T09:30:00Z" },
    { recipientId: alex.id, actorId: nadia.id, message: "moved an issue you're watching to Done", issueIdentifier: "ENG-107", createdAt: "2026-07-16T11:20:00Z", readAt: "2026-07-16T12:00:00Z" },
    { recipientId: ethan.id, actorId: fahim.id, message: "mentioned you in project chat", createdAt: "2026-07-19T15:00:00Z" },
    { recipientId: tanvir.id, actorId: olivia.id, message: "mentioned you in a comment", issueIdentifier: "MOB-23", createdAt: "2026-07-20T08:45:00Z" },
    { recipientId: emily.id, actorId: rafiq.id, message: "posted in project chat", createdAt: "2026-07-20T11:00:00Z", readAt: "2026-07-20T11:30:00Z" },
  ];
  for (const n of notificationSeeds) {
    await prisma.notification.create({
      data: {
        ...n,
        createdAt: new Date(n.createdAt),
        readAt: n.readAt ? new Date(n.readAt) : undefined,
      },
    });
  }

  console.log("Seeding a pending invite...");
  const rawToken = crypto.randomBytes(32).toString("hex");
  await prisma.workspaceInvite.create({
    data: {
      email: "hasan.dev@gmail.com",
      role: "MEMBER",
      tokenHash: hashToken(rawToken),
      workspaceId: workspace.id,
      invitedById: alex.id,
      expiresAt: new Date("2026-07-29"),
    },
  });

  console.log("\nSeed complete.");
  console.log(`Demo accounts (all share the password "${DEMO_PASSWORD}"):`);
  console.log("  maya@acme.dev    (admin)");
  console.log("  alex@acme.dev    (admin)");
  console.log("  nadia@acme.dev   (member)");
  console.log("  jordan@acme.dev  (member)");
  console.log("  fahim@acme.dev   (member)");
  console.log("  emily@acme.dev   (member)");
  console.log("  tanvir@acme.dev  (member)");
  console.log("  olivia@acme.dev  (member)");
  console.log("  sadia@acme.dev   (member)");
  console.log("  ethan@acme.dev   (member)");
  console.log("  rafiq@acme.dev   (member)");
  console.log("  grace@acme.dev   (member)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
