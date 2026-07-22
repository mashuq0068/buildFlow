/** Safe, public-facing subset of the User model — never include passwordHash. */
export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  initials: true,
  title: true,
  avatarUrl: true,
} as const;
