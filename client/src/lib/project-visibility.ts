import type { Project, Role } from "@/lib/types";

/** Admins see every project; members only see projects they're a member of. */
export function isProjectVisible(
  project: Project,
  userName: string | undefined,
  role: Role | undefined
) {
  if (role === "admin") return true;
  if (!userName) return false;
  return project.memberNames?.includes(userName) ?? false;
}
