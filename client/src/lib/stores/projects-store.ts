import { create } from "zustand";
import type { Project } from "@/lib/types";
import { PROJECTS } from "@/lib/mock-data";

interface ProjectsState {
  projects: Project[];
  createProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
}

export const useProjectsStore = create<ProjectsState>()((set) => ({
  projects: PROJECTS,
  createProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, patch) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
}));
