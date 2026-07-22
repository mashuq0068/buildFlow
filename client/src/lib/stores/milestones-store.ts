import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapMilestone } from "@/lib/api/mappers";
import type { Milestone } from "@/lib/types";

interface CreateMilestoneInput {
  title: string;
  description?: string;
  projectId: string;
  targetDate: string;
}

interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  targetDate?: string;
  completed?: boolean;
}

interface MilestonesState {
  milestones: Milestone[];
  loaded: boolean;
  fetchMilestones: (workspaceId: string) => Promise<void>;
  createMilestone: (input: CreateMilestoneInput) => Promise<Milestone>;
  updateMilestone: (id: string, patch: UpdateMilestoneInput) => Promise<Milestone>;
  deleteMilestone: (id: string) => Promise<void>;
  reset: () => void;
}

export const useMilestonesStore = create<MilestonesState>()((set) => ({
  milestones: [],
  loaded: false,

  fetchMilestones: async (workspaceId) => {
    const raw = await api.get<Parameters<typeof mapMilestone>[0][]>(
      `/milestones?workspaceId=${workspaceId}`
    );
    set({ milestones: raw.map(mapMilestone), loaded: true });
  },

  createMilestone: async (input) => {
    const raw = await api.post<Parameters<typeof mapMilestone>[0]>("/milestones", input);
    const milestone = mapMilestone(raw);
    set((state) => ({ milestones: [...state.milestones, milestone] }));
    return milestone;
  },

  updateMilestone: async (id, patch) => {
    const raw = await api.patch<Parameters<typeof mapMilestone>[0]>(`/milestones/${id}`, patch);
    const milestone = mapMilestone(raw);
    set((state) => ({ milestones: state.milestones.map((m) => (m.id === id ? milestone : m)) }));
    return milestone;
  },

  deleteMilestone: async (id) => {
    await api.delete(`/milestones/${id}`);
    set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
  },

  reset: () => set({ milestones: [], loaded: false }),
}));
