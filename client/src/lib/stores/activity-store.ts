import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapActivityFeedEntry, type ActivityFeedEntry } from "@/lib/api/mappers";

interface ActivityState {
  recent: ActivityFeedEntry[];
  loaded: boolean;
  fetchRecent: (workspaceId: string) => Promise<void>;
  reset: () => void;
}

export const useActivityStore = create<ActivityState>()((set) => ({
  recent: [],
  loaded: false,

  fetchRecent: async (workspaceId) => {
    const raw = await api.get<Parameters<typeof mapActivityFeedEntry>[0][]>(
      `/activity?workspaceId=${workspaceId}`
    );
    set({ recent: raw.map(mapActivityFeedEntry), loaded: true });
  },

  reset: () => set({ recent: [], loaded: false }),
}));
