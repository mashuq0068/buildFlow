import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapGoal } from "@/lib/api/mappers";
import type { Goal } from "@/lib/types";

interface CreateGoalInput {
  title: string;
  description?: string;
  projectId: string;
  ownerId?: string;
  targetDate: string;
}

interface UpdateGoalInput {
  title?: string;
  description?: string;
  ownerId?: string | null;
  targetDate?: string;
}

interface GoalsState {
  goals: Goal[];
  loaded: boolean;
  fetchGoals: (workspaceId: string) => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, patch: UpdateGoalInput) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  reset: () => void;
}

export const useGoalsStore = create<GoalsState>()((set) => ({
  goals: [],
  loaded: false,

  fetchGoals: async (workspaceId) => {
    const raw = await api.get<Parameters<typeof mapGoal>[0][]>(`/goals?workspaceId=${workspaceId}`);
    set({ goals: raw.map(mapGoal), loaded: true });
  },

  createGoal: async (input) => {
    const raw = await api.post<Parameters<typeof mapGoal>[0]>("/goals", input);
    const goal = mapGoal(raw);
    set((state) => ({ goals: [...state.goals, goal] }));
    return goal;
  },

  updateGoal: async (id, patch) => {
    const raw = await api.patch<Parameters<typeof mapGoal>[0]>(`/goals/${id}`, patch);
    const goal = mapGoal(raw);
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? goal : g)) }));
    return goal;
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  reset: () => set({ goals: [], loaded: false }),
}));
