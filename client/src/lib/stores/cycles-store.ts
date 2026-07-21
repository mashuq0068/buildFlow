import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapCycle } from "@/lib/api/mappers";
import type { Cycle } from "@/lib/types";

interface CreateCycleInput {
  name: string;
  description?: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

interface UpdateCycleInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface CyclesState {
  cycles: Cycle[];
  loaded: boolean;
  fetchCycles: (workspaceId: string) => Promise<void>;
  createCycle: (input: CreateCycleInput) => Promise<Cycle>;
  updateCycle: (id: string, patch: UpdateCycleInput) => Promise<Cycle>;
  deleteCycle: (id: string) => Promise<void>;
  reset: () => void;
}

export const useCyclesStore = create<CyclesState>()((set) => ({
  cycles: [],
  loaded: false,

  fetchCycles: async (workspaceId) => {
    const raw = await api.get<Parameters<typeof mapCycle>[0][]>(`/cycles?workspaceId=${workspaceId}`);
    set({ cycles: raw.map(mapCycle), loaded: true });
  },

  createCycle: async (input) => {
    const raw = await api.post<Parameters<typeof mapCycle>[0]>("/cycles", input);
    const cycle = mapCycle(raw);
    set((state) => ({ cycles: [...state.cycles, cycle] }));
    return cycle;
  },

  updateCycle: async (id, patch) => {
    const raw = await api.patch<Parameters<typeof mapCycle>[0]>(`/cycles/${id}`, patch);
    const cycle = mapCycle(raw);
    set((state) => ({ cycles: state.cycles.map((c) => (c.id === id ? cycle : c)) }));
    return cycle;
  },

  deleteCycle: async (id) => {
    await api.delete(`/cycles/${id}`);
    set((state) => ({ cycles: state.cycles.filter((c) => c.id !== id) }));
  },

  reset: () => set({ cycles: [], loaded: false }),
}));
