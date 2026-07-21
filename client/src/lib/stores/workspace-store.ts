import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { mapWorkspace } from "@/lib/api/mappers";
import type { Workspace } from "@/lib/types";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "workspace"}-${Math.random().toString(36).slice(2, 6)}`;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  loaded: boolean;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, color?: string) => Promise<Workspace>;
  switchWorkspace: (id: string) => void;
  updateWorkspace: (id: string, patch: { name?: string; color?: string }) => Promise<void>;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspaceId: null,
      loaded: false,

      fetchWorkspaces: async () => {
        const raw = await api.get<Parameters<typeof mapWorkspace>[0][]>("/workspaces");
        const workspaces = raw.map(mapWorkspace);
        const current = get().currentWorkspaceId;
        const stillExists = current && workspaces.some((w) => w.id === current);
        set({
          workspaces,
          currentWorkspaceId: stillExists ? current : workspaces[0]?.id ?? null,
          loaded: true,
        });
      },

      createWorkspace: async (name, color) => {
        const raw = await api.post<Parameters<typeof mapWorkspace>[0]>("/workspaces", {
          name,
          slug: slugify(name),
          color,
        });
        const workspace = mapWorkspace({ ...raw, role: "ADMIN" });
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          currentWorkspaceId: workspace.id,
        }));
        return workspace;
      },

      switchWorkspace: (id) => set({ currentWorkspaceId: id }),

      updateWorkspace: async (id, patch) => {
        const raw = await api.patch<Parameters<typeof mapWorkspace>[0]>(`/workspaces/${id}`, patch);
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? mapWorkspace({ ...raw, role: w.role === "admin" ? "ADMIN" : "MEMBER" }) : w
          ),
        }));
      },

      reset: () => set({ workspaces: [], currentWorkspaceId: null, loaded: false }),
    }),
    { name: "workspace-store", partialize: (state) => ({ currentWorkspaceId: state.currentWorkspaceId }) }
  )
);
