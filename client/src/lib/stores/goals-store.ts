import { create } from "zustand";
import type { Goal } from "@/lib/types";
import { GOALS } from "@/lib/mock-data";

interface GoalsState {
  goals: Goal[];
  createGoal: (goal: Goal) => void;
}

export const useGoalsStore = create<GoalsState>()((set) => ({
  goals: GOALS,
  createGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
}));
