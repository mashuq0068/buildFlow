import { create } from "zustand";
import type { Member, Role } from "@/lib/types";
import { PEOPLE } from "@/lib/mock-data";

const SEED_ROLES: Record<string, Role> = {
  "Maya Chen": "admin",
  "Priya Patel": "member",
  "Jordan Kim": "member",
  "Alex Rivera": "admin",
};

interface MembersState {
  members: Member[];
  addMember: (member: Member) => void;
  updateMemberRole: (name: string, role: Role) => void;
}

export const useMembersStore = create<MembersState>()((set) => ({
  members: Object.values(PEOPLE).map((person) => ({
    ...person,
    role: SEED_ROLES[person.name] ?? "member",
  })),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMemberRole: (name, role) =>
    set((state) => ({
      members: state.members.map((m) => (m.name === name ? { ...m, role } : m)),
    })),
}));
