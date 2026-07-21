import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapProject, projectStatusToServer } from "@/lib/api/mappers";
import type { Project, ProjectStatus } from "@/lib/types";

interface CreateProjectInput {
  name: string;
  teamKey: string;
  color?: string;
  summary?: string;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  workspaceId: string;
  leadId?: string;
  memberUserIds?: string[];
}

interface UpdateProjectInput {
  name?: string;
  teamKey?: string;
  color?: string;
  summary?: string;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  leadId?: string | null;
}

interface ProjectsState {
  projects: Project[];
  loaded: boolean;
  fetchProjects: (workspaceId: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, patch: UpdateProjectInput) => Promise<void>;
  addProjectMembers: (id: string, userIds: string[]) => Promise<void>;
  removeProjectMember: (id: string, userId: string) => Promise<void>;
  reset: () => void;
}

export const useProjectsStore = create<ProjectsState>()((set) => ({
  projects: [],
  loaded: false,

  fetchProjects: async (workspaceId) => {
    const raw = await api.get<Parameters<typeof mapProject>[0][]>(
      `/projects?workspaceId=${workspaceId}`
    );
    set({ projects: raw.map(mapProject), loaded: true });
  },

  createProject: async (input) => {
    const raw = await api.post<Parameters<typeof mapProject>[0]>("/projects", {
      ...input,
      status: projectStatusToServer(input.status),
    });
    const project = mapProject(raw);
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },

  updateProject: async (id, patch) => {
    const raw = await api.patch<Parameters<typeof mapProject>[0]>(`/projects/${id}`, {
      ...patch,
      status: patch.status ? projectStatusToServer(patch.status) : undefined,
    });
    const project = mapProject(raw);
    set((state) => ({ projects: state.projects.map((p) => (p.id === id ? project : p)) }));
  },

  addProjectMembers: async (id, userIds) => {
    const raw = await api.post<Parameters<typeof mapProject>[0]>(`/projects/${id}/members`, {
      userIds,
    });
    const project = mapProject(raw);
    set((state) => ({ projects: state.projects.map((p) => (p.id === id ? project : p)) }));
  },

  removeProjectMember: async (id, userId) => {
    await api.delete(`/projects/${id}/members/${userId}`);
    const raw = await api.get<Parameters<typeof mapProject>[0]>(`/projects/${id}`);
    const project = mapProject(raw);
    set((state) => ({ projects: state.projects.map((p) => (p.id === id ? project : p)) }));
  },

  reset: () => set({ projects: [], loaded: false }),
}));
