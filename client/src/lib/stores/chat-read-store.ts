import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatReadState {
  lastSeenAt: Record<string, string>;
  markSeen: (projectId: string, at?: string) => void;
}

export const useChatReadStore = create<ChatReadState>()(
  persist(
    (set) => ({
      lastSeenAt: {},
      markSeen: (projectId, at) =>
        set((state) => ({
          lastSeenAt: { ...state.lastSeenAt, [projectId]: at ?? new Date().toISOString() },
        })),
    }),
    { name: "chat-read-store" }
  )
);
