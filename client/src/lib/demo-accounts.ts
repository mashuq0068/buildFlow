// Display-only info for the login screen's quick-pick cards. The password shown
// here is the real credential seeded on these accounts by prisma/seed.ts — signing
// in still performs a genuine POST /auth/login, this just saves demo users a typed
// password on a portfolio project.
export const DEMO_PASSWORD = "Demo1234!";

function avatar(photoId: string) {
  return `https://images.unsplash.com/photo-${photoId}?w=256&h=256&fit=crop&crop=faces&q=80`;
}

export const DEMO_ACCOUNTS = [
  {
    name: "Maya Chen",
    email: "maya@acme.dev",
    initials: "MC",
    title: "Platform Engineer",
    role: "admin" as const,
    avatarUrl: avatar("1494790108377-be9c29b29330"),
  },
  {
    name: "Alex Rivera",
    email: "alex@acme.dev",
    initials: "AR",
    title: "Engineering Lead",
    role: "admin" as const,
    avatarUrl: avatar("1507003211169-0a1dd7228f2d"),
  },
  {
    name: "Nadia Rahman",
    email: "nadia@acme.dev",
    initials: "NR",
    title: "Frontend Engineer",
    role: "member" as const,
    avatarUrl: avatar("1573496359142-b8d87734a5a2"),
  },
  {
    name: "Jordan Kim",
    email: "jordan@acme.dev",
    initials: "JK",
    title: "Product Designer",
    role: "member" as const,
    avatarUrl: avatar("1519085360753-af0119f7cbe7"),
  },
  {
    name: "Fahim Hasan",
    email: "fahim@acme.dev",
    initials: "FH",
    title: "Backend Engineer",
    role: "member" as const,
    avatarUrl: avatar("1500648767791-00dcc994a43e"),
  },
  {
    name: "Emily Carter",
    email: "emily@acme.dev",
    initials: "EC",
    title: "Marketing Lead",
    role: "member" as const,
    avatarUrl: avatar("1544005313-94ddf0286df2"),
  },
  {
    name: "Tanvir Ahmed",
    email: "tanvir@acme.dev",
    initials: "TA",
    title: "Mobile Engineer",
    role: "member" as const,
    avatarUrl: avatar("1531123897727-8f129e1688ce"),
  },
  {
    name: "Olivia Turner",
    email: "olivia@acme.dev",
    initials: "OT",
    title: "QA Engineer",
    role: "member" as const,
    avatarUrl: avatar("1580489944761-15a19d654956"),
  },
  {
    name: "Sadia Islam",
    email: "sadia@acme.dev",
    initials: "SI",
    title: "UX Researcher",
    role: "member" as const,
    avatarUrl: avatar("1500917293891-ef795e70e1f6"),
  },
  {
    name: "Ethan Brooks",
    email: "ethan@acme.dev",
    initials: "EB",
    title: "DevOps Engineer",
    role: "member" as const,
    avatarUrl: avatar("1472099645785-5658abf4ff4e"),
  },
  {
    name: "Rafiq Chowdhury",
    email: "rafiq@acme.dev",
    initials: "RC",
    title: "Growth Marketer",
    role: "member" as const,
    avatarUrl: avatar("1552058544-f2b08422138a"),
  },
  {
    name: "Grace Coleman",
    email: "grace@acme.dev",
    initials: "GC",
    title: "Mobile Designer",
    role: "member" as const,
    avatarUrl: avatar("1508214751196-bcfd4ca60f91"),
  },
];

export const DEFAULT_ADMIN_ACCOUNT = DEMO_ACCOUNTS.find((a) => a.role === "admin")!;
export const DEFAULT_MEMBER_ACCOUNT = DEMO_ACCOUNTS.find((a) => a.role === "member")!;
