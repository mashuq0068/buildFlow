import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { DEFAULT_STATUS_TEMPLATE } from "../src/lib/default-statuses";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234!";

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

async function main() {
  console.log("Resetting database...");
  await reset();

  console.log("Seeding users...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const maya = await prisma.user.create({
    data: {
      name: "Maya Chen",
      email: "maya@acme.dev",
      initials: "MC",
      title: "Platform Engineer",
      passwordHash,
    },
  });
  const alex = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@acme.dev",
      initials: "AR",
      title: "Engineering Lead",
      passwordHash,
    },
  });
  const priya = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@acme.dev",
      initials: "PP",
      title: "Frontend Engineer",
      passwordHash,
    },
  });
  const jordan = await prisma.user.create({
    data: {
      name: "Jordan Kim",
      email: "jordan@acme.dev",
      initials: "JK",
      title: "Product Designer",
      passwordHash,
    },
  });

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
          { userId: priya.id, role: "MEMBER" },
          { userId: jordan.id, role: "MEMBER" },
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
        create: [{ userId: alex.id }, { userId: maya.id }, { userId: priya.id }],
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
      members: { create: [{ userId: jordan.id }] },
    },
  });

  console.log("Seeding issue statuses...");
  const engStatus = await createDefaultStatuses(engineering.id);
  const desStatus = await createDefaultStatuses(design.id);

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

  console.log("Seeding labels...");
  const labelSeeds = [
    { name: "Product", color: "#8b8fa3" },
    { name: "Infra", color: "#5e9bd6" },
    { name: "Frontend", color: "#e8a53f" },
    { name: "Feature", color: "#4cb782" },
    { name: "Backend", color: "#c25b8f" },
    { name: "Design System", color: "#e8a53f" },
    { name: "Research", color: "#8b8fa3" },
  ];
  const labelByName = new Map<string, string>();
  for (const l of labelSeeds) {
    const row = await prisma.label.create({ data: { ...l, workspaceId: workspace.id } });
    labelByName.set(l.name, row.id);
  }

  function labelIds(names: string[]) {
    return names.map((n) => ({ labelId: labelByName.get(n)! }));
  }

  console.log("Seeding issues...");
  const issuesByMockId = new Map<string, string>();

  async function createIssue(
    mockId: string,
    data: Parameters<typeof prisma.issue.create>[0]["data"]
  ) {
    const issue = await prisma.issue.create({ data });
    issuesByMockId.set(mockId, issue.id);
    return issue;
  }

  await createIssue("1", {
    identifier: 128,
    title: "Define workspace onboarding flow",
    description:
      "New workspaces currently drop the user straight onto an empty board. We need a short guided setup: create first team, invite members, create first project.",
    statusId: engStatus.get("Backlog")!,
    priority: "LOW",
    projectId: engineering.id,
    creatorId: alex.id,
    labels: { create: labelIds(["Product"]) },
  });

  await createIssue("2", {
    identifier: 135,
    title: "Evaluate Redis vs Postgres LISTEN/NOTIFY for realtime",
    description:
      "Spike to compare a Redis pub/sub layer against Postgres LISTEN/NOTIFY for pushing live board updates to connected clients.",
    statusId: engStatus.get("Backlog")!,
    priority: "NO_PRIORITY",
    projectId: engineering.id,
    creatorId: alex.id,
    labels: { create: labelIds(["Infra"]) },
  });

  await createIssue("3", {
    identifier: 142,
    title: "Set up CI pipeline for preview deployments",
    description: "Every PR should get a preview deployment URL posted as a comment.",
    statusId: engStatus.get("Todo")!,
    priority: "MEDIUM",
    projectId: engineering.id,
    creatorId: alex.id,
    assigneeId: maya.id,
    labels: { create: labelIds(["Infra"]) },
    aiSuggestedLabels: ["Infra", "CI/CD"],
    aiSuggestedReasoning:
      "Similar past issues mentioning 'pipeline' and 'deployment' were labeled Infra + CI/CD by this team.",
  });

  await createIssue("4", {
    identifier: 139,
    title: "Migrate auth session storage to Redis",
    statusId: engStatus.get("Todo")!,
    priority: "LOW",
    projectId: engineering.id,
    creatorId: alex.id,
    labels: { create: labelIds(["Infra"]) },
  });

  await createIssue("5", {
    identifier: 151,
    title: "Kanban board drag-and-drop with optimistic updates",
    description:
      "Board should support cross-column drag, in-column reordering, and a drag overlay preview. Status changes should feel instant.",
    statusId: engStatus.get("In Progress")!,
    priority: "HIGH",
    projectId: engineering.id,
    cycleId: cycle24.id,
    creatorId: alex.id,
    assigneeId: alex.id,
    labels: { create: labelIds(["Frontend", "Feature"]) },
    attachments: { create: [{ name: "board-spec.fig", size: "1.2 MB" }] },
  });

  await createIssue("6", {
    identifier: 147,
    title: "Command palette fuzzy search",
    statusId: engStatus.get("In Progress")!,
    priority: "URGENT",
    projectId: engineering.id,
    cycleId: cycle24.id,
    creatorId: alex.id,
    assigneeId: alex.id,
    labels: { create: labelIds(["Frontend"]) },
    aiSuggestedLabels: ["Frontend", "DX"],
    aiSuggestedReasoning:
      "Issues mentioning 'command palette' or '⌘K' are consistently tagged DX by this team.",
  });

  await createIssue("7", {
    identifier: 133,
    title: "Issue detail panel with comment thread",
    description: "Slide-over panel: description, properties, Activity/Comments/History tabs.",
    statusId: engStatus.get("In Review")!,
    priority: "MEDIUM",
    projectId: engineering.id,
    cycleId: cycle24.id,
    creatorId: alex.id,
    assigneeId: priya.id,
    labels: { create: labelIds(["Frontend"]) },
  });

  await createIssue("8", {
    identifier: 130,
    title: "Workspace + team CRUD API",
    statusId: engStatus.get("Done")!,
    priority: "MEDIUM",
    projectId: engineering.id,
    cycleId: cycle23.id,
    creatorId: alex.id,
    assigneeId: alex.id,
    labels: { create: labelIds(["Backend"]) },
  });

  await createIssue("9", {
    identifier: 121,
    title: "Prisma schema for issues, labels, comments",
    statusId: engStatus.get("Done")!,
    priority: "HIGH",
    projectId: engineering.id,
    cycleId: cycle23.id,
    creatorId: alex.id,
    assigneeId: alex.id,
    labels: { create: labelIds(["Backend"]) },
  });

  await createIssue("10", {
    identifier: 12,
    title: "Design system tokens for dark + light theme",
    description:
      "Define spacing scale, radius scale, and monochrome color tokens for the shared design system.",
    statusId: desStatus.get("In Progress")!,
    priority: "HIGH",
    projectId: design.id,
    creatorId: jordan.id,
    assigneeId: jordan.id,
    labels: { create: labelIds(["Design System"]) },
  });

  await createIssue("11", {
    identifier: 9,
    title: "Icon set audit — replace mixed icon sources with Lucide",
    statusId: desStatus.get("Todo")!,
    priority: "MEDIUM",
    projectId: design.id,
    creatorId: jordan.id,
    assigneeId: jordan.id,
    labels: { create: labelIds(["Design System"]) },
  });

  await createIssue("12", {
    identifier: 4,
    title: "User research: onboarding drop-off interviews",
    statusId: desStatus.get("Backlog")!,
    priority: "LOW",
    projectId: design.id,
    creatorId: jordan.id,
    labels: { create: labelIds(["Research"]) },
  });

  console.log("Seeding comments...");
  await prisma.comment.create({
    data: {
      issueId: issuesByMockId.get("7")!,
      authorId: priya.id,
      body: "First pass is up — panel slides in from the right, matches the board's monochrome theme.",
      createdAt: new Date("2026-07-17T10:12:00Z"),
    },
  });
  await prisma.comment.create({
    data: {
      issueId: issuesByMockId.get("7")!,
      authorId: alex.id,
      body: "Nice. Can we add the activity tab before this ships? Reviewers will want to see status history.",
      createdAt: new Date("2026-07-17T11:03:00Z"),
    },
  });
  await prisma.comment.create({
    data: {
      issueId: issuesByMockId.get("5")!,
      authorId: alex.id,
      body: "Cross-column drag works. Still need to persist order within a column on drop.",
      createdAt: new Date("2026-07-16T09:40:00Z"),
    },
  });

  console.log("Seeding activity log...");
  await prisma.activityLog.create({
    data: {
      issueId: issuesByMockId.get("7")!,
      authorId: priya.id,
      message: "moved this issue from Todo to In Review",
      createdAt: new Date("2026-07-17T09:55:00Z"),
    },
  });
  await prisma.activityLog.create({
    data: {
      issueId: issuesByMockId.get("7")!,
      authorId: priya.id,
      message: "set priority to Medium",
      createdAt: new Date("2026-07-16T14:20:00Z"),
    },
  });
  await prisma.activityLog.create({
    data: {
      issueId: issuesByMockId.get("5")!,
      authorId: alex.id,
      message: "moved this issue from Todo to In Progress",
      createdAt: new Date("2026-07-15T16:00:00Z"),
    },
  });
  await prisma.activityLog.create({
    data: {
      issueId: issuesByMockId.get("8")!,
      authorId: alex.id,
      message: "moved this issue from In Progress to Done",
      createdAt: new Date("2026-07-14T12:00:00Z"),
    },
  });
  await prisma.activityLog.create({
    data: {
      issueId: issuesByMockId.get("9")!,
      authorId: alex.id,
      message: "moved this issue from In Review to Done",
      createdAt: new Date("2026-07-13T15:30:00Z"),
    },
  });

  console.log("Seeding favorites...");
  await prisma.favorite.create({ data: { userId: alex.id, issueId: issuesByMockId.get("5")! } });
  await prisma.favorite.create({ data: { userId: alex.id, issueId: issuesByMockId.get("7")! } });

  console.log("Seeding drafts...");
  await prisma.draft.create({
    data: {
      title: "Explore keyboard-first navigation (j/k to move between issues)",
      description:
        "Similar to Linear's list navigation — arrow/vim keys to move focus, Enter to open.",
      projectId: engineering.id,
      priority: "LOW",
      authorId: alex.id,
      updatedAt: new Date("2026-07-18T20:00:00Z"),
    },
  });

  console.log("Seeding project chat...");
  await prisma.projectChatMessage.create({
    data: {
      projectId: engineering.id,
      authorId: alex.id,
      body: "Kicking off Cycle 25 — focus is analytics, roadmap, and chat this round.",
      createdAt: new Date("2026-07-18T09:00:00Z"),
    },
  });
  await prisma.projectChatMessage.create({
    data: {
      projectId: engineering.id,
      authorId: maya.id,
      body:
        "Sounds good. I'll pick up the roadmap date wiring once the project model supports start/target dates.",
      createdAt: new Date("2026-07-18T09:12:00Z"),
    },
  });
  await prisma.projectChatMessage.create({
    data: {
      projectId: engineering.id,
      authorId: priya.id,
      body: "I can take the project-level chat UI if that's still open.",
      createdAt: new Date("2026-07-18T09:15:00Z"),
    },
  });
  await prisma.projectChatMessage.create({
    data: {
      projectId: design.id,
      authorId: jordan.id,
      body:
        "Design system tokens are in review — should be ready for the Engineering team to consume by Friday.",
      createdAt: new Date("2026-07-17T15:30:00Z"),
    },
  });

  console.log("Seeding notifications...");
  await prisma.notification.create({
    data: {
      recipientId: alex.id,
      actorId: priya.id,
      message: "mentioned you in a comment",
      issueIdentifier: "ENG-133",
      createdAt: new Date("2026-07-19T08:10:00Z"),
    },
  });
  await prisma.notification.create({
    data: {
      recipientId: alex.id,
      actorId: maya.id,
      message: "assigned you to an issue",
      issueIdentifier: "ENG-142",
      createdAt: new Date("2026-07-18T16:45:00Z"),
    },
  });
  await prisma.notification.create({
    data: {
      recipientId: alex.id,
      actorId: jordan.id,
      message: "requested review on",
      issueIdentifier: "DES-12",
      createdAt: new Date("2026-07-18T09:00:00Z"),
      readAt: new Date("2026-07-18T09:30:00Z"),
    },
  });
  await prisma.notification.create({
    data: {
      recipientId: alex.id,
      actorId: priya.id,
      message: "moved an issue you're watching to Done",
      issueIdentifier: "ENG-130",
      createdAt: new Date("2026-07-16T11:20:00Z"),
      readAt: new Date("2026-07-16T12:00:00Z"),
    },
  });

  console.log("\nSeed complete.");
  console.log(`Demo accounts (all share the password "${DEMO_PASSWORD}"):`);
  console.log("  maya@acme.dev   (admin)");
  console.log("  alex@acme.dev   (admin)");
  console.log("  priya@acme.dev  (member)");
  console.log("  jordan@acme.dev (member)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
