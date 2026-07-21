import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  selectedIssueId: string | null;
  openIssue: (id: string) => void;
  closeIssue: () => void;

  newIssueOpen: boolean;
  newIssueProjectId: string;
  openNewIssue: (projectId?: string) => void;
  setNewIssueOpen: (open: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  boardView: "board" | "list";
  setBoardView: (view: "board" | "list") => void;

  newProjectOpen: boolean;
  setNewProjectOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      selectedIssueId: null,
      openIssue: (id) => set({ selectedIssueId: id }),
      closeIssue: () => set({ selectedIssueId: null }),

      newIssueOpen: false,
      newIssueProjectId: "",
      openNewIssue: (projectId = "") => set({ newIssueOpen: true, newIssueProjectId: projectId }),
      setNewIssueOpen: (open) => set({ newIssueOpen: open }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      boardView: "board",
      setBoardView: (view) => set({ boardView: view }),

      newProjectOpen: false,
      setNewProjectOpen: (open) => set({ newProjectOpen: open }),
    }),
    { name: "ui-store", partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }) }
  )
);
