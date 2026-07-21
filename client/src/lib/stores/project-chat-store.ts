import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapChatMessage } from "@/lib/api/mappers";
import type { ChatMessage } from "@/lib/types";
import type { UploadedFile } from "@/lib/upload";

interface ProjectChatState {
  messages: Record<string, ChatMessage[]>;
  loadedProjectIds: string[];
  fetchMessages: (projectId: string) => Promise<void>;
  addMessage: (
    projectId: string,
    body: string,
    parentId?: string,
    attachments?: UploadedFile[]
  ) => Promise<void>;
  updateMessage: (projectId: string, messageId: string, body: string) => Promise<void>;
  deleteMessage: (projectId: string, messageId: string) => Promise<void>;
  toggleMessageReaction: (projectId: string, messageId: string, emoji: string) => Promise<void>;
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

  addMessage: async (projectId, body, parentId, attachments) => {
    const raw = await api.post<Parameters<typeof mapChatMessage>[0]>(`/projects/${projectId}/chat`, {
      body,
      parentId,
      attachments,
    });
    const message = mapChatMessage(raw);
    set((state) => ({
      messages: { ...state.messages, [projectId]: [...(state.messages[projectId] ?? []), message] },
    }));
  },

  updateMessage: async (projectId, messageId, body) => {
    const raw = await api.patch<Parameters<typeof mapChatMessage>[0]>(
      `/projects/${projectId}/chat/${messageId}`,
      { body }
    );
    const message = mapChatMessage(raw);
    set((state) => ({
      messages: {
        ...state.messages,
        [projectId]: (state.messages[projectId] ?? []).map((m) => (m.id === messageId ? message : m)),
      },
    }));
  },

  deleteMessage: async (projectId, messageId) => {
    await api.delete(`/projects/${projectId}/chat/${messageId}`);
    set((state) => ({
      messages: {
        ...state.messages,
        [projectId]: (state.messages[projectId] ?? []).filter((m) => m.id !== messageId),
      },
    }));
  },

  toggleMessageReaction: async (projectId, messageId, emoji) => {
    const raw = await api.post<Parameters<typeof mapChatMessage>[0]>(
      `/projects/${projectId}/chat/${messageId}/reactions`,
      { emoji }
    );
    const message = mapChatMessage(raw);
    set((state) => ({
      messages: {
        ...state.messages,
        [projectId]: (state.messages[projectId] ?? []).map((m) => (m.id === messageId ? message : m)),
      },
    }));
  },

  reset: () => set({ messages: {}, loadedProjectIds: [] }),
}));
