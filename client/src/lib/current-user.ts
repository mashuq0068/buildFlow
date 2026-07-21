import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { Member } from "@/lib/types";

/** Client component hook — returns the logged-in member (with their role in the current workspace), or null. */
export function useCurrentUser(): Member | null {
  const user = useAuthStore((s) => s.user);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  if (!user) return null;
  const role = workspaces.find((w) => w.id === currentWorkspaceId)?.role ?? "member";
  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
    title: user.title,
    role,
  };
}
