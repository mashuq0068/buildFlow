import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapMember } from "@/lib/api/mappers";
import type { Member, Role } from "@/lib/types";

interface ServerMember {
  userId: string;
  name: string;
  email: string;
  initials: string;
  title: string | null;
  avatarUrl?: string | null;
  role: string;
}

function toMember(m: ServerMember): Member {
  return mapMember(
    { id: m.userId, name: m.name, email: m.email, initials: m.initials, title: m.title, avatarUrl: m.avatarUrl },
    m.role
  );
}

interface AddMemberInput {
  name: string;
  email: string;
  title?: string;
  role?: Role;
}

interface MembersState {
  members: Member[];
  loaded: boolean;
  fetchMembers: (workspaceId: string) => Promise<void>;
  addMember: (workspaceId: string, input: AddMemberInput) => Promise<{ member: Member; tempPassword: string | null }>;
  updateMemberRole: (workspaceId: string, userId: string, role: Role) => Promise<void>;
  reset: () => void;
}

export const useMembersStore = create<MembersState>()((set) => ({
  members: [],
  loaded: false,

  fetchMembers: async (workspaceId) => {
    const raw = await api.get<ServerMember[]>(`/workspaces/${workspaceId}/members`);
    set({ members: raw.map(toMember), loaded: true });
  },

  addMember: async (workspaceId, input) => {
    const raw = await api.post<ServerMember & { tempPassword: string | null }>(
      `/workspaces/${workspaceId}/members`,
      { ...input, role: input.role === "admin" ? "ADMIN" : "MEMBER" }
    );
    const member = toMember(raw);
    set((state) => ({ members: [...state.members, member] }));
    return { member, tempPassword: raw.tempPassword };
  },

  updateMemberRole: async (workspaceId, userId, role) => {
    const raw = await api.patch<ServerMember>(`/workspaces/${workspaceId}/members/${userId}/role`, {
      role: role === "admin" ? "ADMIN" : "MEMBER",
    });
    const member = toMember(raw);
    set((state) => ({ members: state.members.map((m) => (m.id === userId ? member : m)) }));
  },

  reset: () => set({ members: [], loaded: false }),
}));
