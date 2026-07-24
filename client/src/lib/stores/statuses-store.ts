import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapStatusOption, categoryToServer } from "@/lib/api/mappers";
import type { IssueStatusOption, StatusCategory } from "@/lib/types";

interface CreateStatusInput {
  name: string;
  color: string;
  icon?: string;
  category: StatusCategory;
}

interface UpdateStatusInput {
  name?: string;
  color?: string;
  icon?: string;
  category?: StatusCategory;
}

interface StatusesState {
  byProject: Record<string, IssueStatusOption[]>;
  loadedProjectIds: string[];
  fetchStatuses: (projectId: string) => Promise<void>;
  createStatus: (projectId: string, input: CreateStatusInput) => Promise<IssueStatusOption>;
  updateStatus: (
    projectId: string,
    statusId: string,
    patch: UpdateStatusInput
  ) => Promise<IssueStatusOption>;
  deleteStatus: (projectId: string, statusId: string) => Promise<void>;
  reorderStatuses: (projectId: string, orderedIds: string[]) => Promise<void>;
  reset: () => void;
}

export const useStatusesStore = create<StatusesState>()((set, get) => ({
  byProject: {},
  loadedProjectIds: [],

  fetchStatuses: async (projectId) => {
    const raw = await api.get<Parameters<typeof mapStatusOption>[0][]>(
      `/projects/${projectId}/statuses`
    );
    set((state) => ({
      byProject: { ...state.byProject, [projectId]: raw.map(mapStatusOption) },
      loadedProjectIds: get().loadedProjectIds.includes(projectId)
        ? state.loadedProjectIds
        : [...state.loadedProjectIds, projectId],
    }));
  },

  createStatus: async (projectId, input) => {
    const raw = await api.post<Parameters<typeof mapStatusOption>[0]>(
      `/projects/${projectId}/statuses`,
      { ...input, category: categoryToServer(input.category) }
    );
    const status = mapStatusOption(raw);
    set((state) => ({
      byProject: {
        ...state.byProject,
        [projectId]: [...(state.byProject[projectId] ?? []), status],
      },
    }));
    return status;
  },

  updateStatus: async (projectId, statusId, patch) => {
    const raw = await api.patch<Parameters<typeof mapStatusOption>[0]>(
      `/projects/${projectId}/statuses/${statusId}`,
      { ...patch, category: patch.category ? categoryToServer(patch.category) : undefined }
    );
    const status = mapStatusOption(raw);
    set((state) => ({
      byProject: {
        ...state.byProject,
        [projectId]: (state.byProject[projectId] ?? []).map((s) => (s.id === statusId ? status : s)),
      },
    }));
    return status;
  },

  deleteStatus: async (projectId, statusId) => {
    await api.delete(`/projects/${projectId}/statuses/${statusId}`);
    set((state) => ({
      byProject: {
        ...state.byProject,
        [projectId]: (state.byProject[projectId] ?? []).filter((s) => s.id !== statusId),
      },
    }));
  },

  reorderStatuses: async (projectId, orderedIds) => {
    const raw = await api.patch<Parameters<typeof mapStatusOption>[0][]>(
      `/projects/${projectId}/statuses/reorder`,
      { orderedIds }
    );
    set((state) => ({ byProject: { ...state.byProject, [projectId]: raw.map(mapStatusOption) } }));
  },

  reset: () => set({ byProject: {}, loadedProjectIds: [] }),
}));
