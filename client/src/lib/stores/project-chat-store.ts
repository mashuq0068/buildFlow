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
  upsertMessage: (projectId: string, message: ChatMessage) => void;
  removeMessage: (projectId: string, messageId: string) => void;
  reset: () => void;
}

export const useProjectChatStore = create<ProjectChatState>()((set, get) => ({
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
    get().upsertMessage(projectId, mapChatMessage(raw));
  },

  updateMessage: async (projectId, messageId, body) => {
    const raw = await api.patch<Parameters<typeof mapChatMessage>[0]>(
      `/projects/${projectId}/chat/${messageId}`,
      { body }
    );
    get().upsertMessage(projectId, mapChatMessage(raw));
  },

  deleteMessage: async (projectId, messageId) => {
    await api.delete(`/projects/${projectId}/chat/${messageId}`);
    get().removeMessage(projectId, messageId);
  },

  toggleMessageReaction: async (projectId, messageId, emoji) => {
    const raw = await api.post<Parameters<typeof mapChatMessage>[0]>(
      `/projects/${projectId}/chat/${messageId}/reactions`,
      { emoji }
    );
    get().upsertMessage(projectId, mapChatMessage(raw));
  },

  upsertMessage: (projectId, message) => {
    set((state) => {
      const existing = state.messages[projectId] ?? [];
      const index = existing.findIndex((m) => m.id === message.id);
      const next =
        index === -1
          ? [...existing, message]
          : existing.map((m) => (m.id === message.id ? message : m));
      return { messages: { ...state.messages, [projectId]: next } };
    });
  },

  removeMessage: (projectId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [projectId]: (state.messages[projectId] ?? []).filter((m) => m.id !== messageId),
      },
    }));
  },

  reset: () => set({ messages: {}, loadedProjectIds: [] }),
}));
