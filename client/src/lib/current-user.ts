import { useAuthStore } from "@/lib/stores/auth-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { CURRENT_USER } from "@/lib/mock-data";
import type { Member } from "@/lib/types";

const FALLBACK_MEMBER: Member = { ...CURRENT_USER, role: "member" };

/** Client component hook — returns the logged-in member, or null if nobody is logged in. */
export function useCurrentUser(): Member | null {
  const currentUserName = useAuthStore((s) => s.currentUserName);
  const members = useMembersStore((s) => s.members);
  if (!currentUserName) return null;
  return members.find((m) => m.name === currentUserName) ?? null;
}

/** Non-hook, point-in-time read for use inside Zustand store actions. */
export function getCurrentUserSync(): Member {
  const currentUserName = useAuthStore.getState().currentUserName;
  const members = useMembersStore.getState().members;
  const found = currentUserName ? members.find((m) => m.name === currentUserName) : undefined;
  return found ?? FALLBACK_MEMBER;
}
