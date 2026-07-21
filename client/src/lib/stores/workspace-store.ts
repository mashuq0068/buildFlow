import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "@/lib/types";
import { WORKSPACES } from "@/lib/mock-data";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  createWorkspace: (workspace: Workspace) => void;
  switchWorkspace: (id: string) => void;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: WORKSPACES,
      currentWorkspaceId: WORKSPACES[0].id,
      createWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          currentWorkspaceId: workspace.id,
        })),
      switchWorkspace: (id) => set({ currentWorkspaceId: id }),
      updateWorkspace: (id, patch) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),
    }),
    { name: "workspace-store" }
  )
);
