import { create } from "zustand";
import { api } from "@/lib/api-client";
import type { Person, Role } from "@/lib/types";

export type InviteStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Invite {
  id: string;
  email: string;
  role: Role;
  status: InviteStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  invitedBy: Person;
}

interface ServerInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  invitedBy: { id: string; name: string; initials: string };
}

function mapInvite(i: ServerInvite): Invite {
  return {
    id: i.id,
    email: i.email,
    role: i.role === "ADMIN" ? "admin" : "member",
    status: i.status.toLowerCase() as InviteStatus,
    expiresAt: i.expiresAt,
    acceptedAt: i.acceptedAt ?? undefined,
    createdAt: i.createdAt,
    invitedBy: { id: i.invitedBy.id, name: i.invitedBy.name, initials: i.invitedBy.initials },
  };
}

interface InvitesState {
  invites: Invite[];
  loaded: boolean;
  fetchInvites: (workspaceId: string) => Promise<void>;
  createInvite: (workspaceId: string, email: string, role: Role) => Promise<void>;
  resendInvite: (workspaceId: string, inviteId: string) => Promise<void>;
  cancelInvite: (workspaceId: string, inviteId: string) => Promise<void>;
  reset: () => void;
}

export const useInvitesStore = create<InvitesState>()((set) => ({
  invites: [],
  loaded: false,

  fetchInvites: async (workspaceId) => {
    const raw = await api.get<ServerInvite[]>(`/workspaces/${workspaceId}/invites`);
    set({ invites: raw.map(mapInvite), loaded: true });
  },

  createInvite: async (workspaceId, email, role) => {
    const raw = await api.post<ServerInvite>(`/workspaces/${workspaceId}/invites`, {
      email,
      role: role === "admin" ? "ADMIN" : "MEMBER",
    });
    const invite = mapInvite(raw);
    set((state) => ({ invites: [invite, ...state.invites.filter((i) => i.email !== email)] }));
  },

  resendInvite: async (workspaceId, inviteId) => {
    const raw = await api.post<ServerInvite>(`/workspaces/${workspaceId}/invites/${inviteId}/resend`);
    const invite = mapInvite(raw);
    set((state) => ({ invites: state.invites.map((i) => (i.id === inviteId ? invite : i)) }));
  },

  cancelInvite: async (workspaceId, inviteId) => {
    await api.delete(`/workspaces/${workspaceId}/invites/${inviteId}`);
    set((state) => ({
      invites: state.invites.map((i) => (i.id === inviteId ? { ...i, status: "cancelled" } : i)),
    }));
  },

  reset: () => set({ invites: [], loaded: false }),
}));
