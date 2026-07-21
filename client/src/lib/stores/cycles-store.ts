import { create } from "zustand";
import type { Cycle } from "@/lib/types";
import { CYCLES } from "@/lib/mock-data";

interface CyclesState {
  cycles: Cycle[];
  createCycle: (cycle: Cycle) => void;
}

export const useCyclesStore = create<CyclesState>()((set) => ({
  cycles: CYCLES,
  createCycle: (cycle) => set((state) => ({ cycles: [...state.cycles, cycle] })),
}));
