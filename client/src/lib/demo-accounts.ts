// Display-only info for the login screen's quick-pick cards. The password shown
// here is the real credential seeded on these accounts by prisma/seed.ts — signing
// in still performs a genuine POST /auth/login, this just saves demo users a typed
// password on a portfolio project.
export const DEMO_PASSWORD = "Demo1234!";

export const DEMO_ACCOUNTS = [
  {
    name: "Maya Chen",
    email: "maya@acme.dev",
    initials: "MC",
    title: "Platform Engineer",
    role: "admin" as const,
  },
  {
    name: "Alex Rivera",
    email: "alex@acme.dev",
    initials: "AR",
    title: "Engineering Lead",
    role: "admin" as const,
  },
  {
    name: "Priya Patel",
    email: "priya@acme.dev",
    initials: "PP",
    title: "Frontend Engineer",
    role: "member" as const,
  },
  {
    name: "Jordan Kim",
    email: "jordan@acme.dev",
    initials: "JK",
    title: "Product Designer",
    role: "member" as const,
  },
];

export const DEFAULT_ADMIN_ACCOUNT = DEMO_ACCOUNTS.find((a) => a.role === "admin")!;
export const DEFAULT_MEMBER_ACCOUNT = DEMO_ACCOUNTS.find((a) => a.role === "member")!;
