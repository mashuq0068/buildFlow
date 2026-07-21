import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapChatMessage } from "@/lib/api/mappers";
import type { ChatMessage } from "@/lib/types";

interface ProjectChatState {
  messages: Record<string, ChatMessage[]>;
  loadedProjectIds: string[];
  fetchMessages: (projectId: string) => Promise<void>;
  addMessage: (projectId: string, body: string) => Promise<void>;
  reset: () => void;
}

export const useProjectChatStore = create<ProjectChatState>()((set) => ({
  messages: {},
  loadedProjectIds: [],

  fetchMessages: async (projectId) => {
    const raw = await api.get<Parameters<typeof mapChatMessage>[0][]>(`/projects/${projectId}/chat`);
    set((state) => ({
      messages: { ...state.messages, [projectId]: raw.map(mapChatMessage) },
      loadedProjectIds: [...state.loadedProjectIds, projectId],
    }));
  },

  addMessage: async (projectId, body) => {
    const raw = await api.post<Parameters<typeof mapChatMessage>[0]>(`/projects/${projectId}/chat`, {
      body,
    });
    const message = mapChatMessage(raw);
    set((state) => ({
      messages: { ...state.messages, [projectId]: [...(state.messages[projectId] ?? []), message] },
    }));
  },

  reset: () => set({ messages: {}, loadedProjectIds: [] }),
}));
