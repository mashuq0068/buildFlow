import { create } from "zustand";
import type { ChatMessage } from "@/lib/types";
import { INITIAL_PROJECT_CHAT } from "@/lib/mock-data";
import { getCurrentUserSync } from "@/lib/current-user";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

interface ProjectChatState {
  messages: Record<string, ChatMessage[]>;
  addMessage: (projectId: string, body: string) => void;
}

export const useProjectChatStore = create<ProjectChatState>()((set) => ({
  messages: INITIAL_PROJECT_CHAT,
  addMessage: (projectId, body) => {
    const message: ChatMessage = {
      id: id(),
      author: getCurrentUserSync(),
      body,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [projectId]: [...(state.messages[projectId] ?? []), message],
      },
    }));
  },
}));
