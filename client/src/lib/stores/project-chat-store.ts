import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapChatMessage } from "@/lib/api/mappers";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toggleReactionLocally } from "@/lib/reactions";
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
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      author: currentUser,
      body,
      createdAt: new Date().toISOString(),
      parentId,
      attachments: (attachments ?? []).map((a, i) => ({ id: `${tempId}-att-${i}`, ...a })),
      reactions: [],
    };
    get().upsertMessage(projectId, optimistic);

    try {
      const raw = await api.post<Parameters<typeof mapChatMessage>[0]>(`/projects/${projectId}/chat`, {
        body,
        parentId,
        attachments,
      });
      get().removeMessage(projectId, tempId);
      get().upsertMessage(projectId, mapChatMessage(raw));
    } catch (err) {
      get().removeMessage(projectId, tempId);
      throw err;
    }
  },

  updateMessage: async (projectId, messageId, body) => {
    const previous = (get().messages[projectId] ?? []).find((m) => m.id === messageId);
    if (!previous) return;
    get().upsertMessage(projectId, { ...previous, body, editedAt: new Date().toISOString() });

    try {
      const raw = await api.patch<Parameters<typeof mapChatMessage>[0]>(
        `/projects/${projectId}/chat/${messageId}`,
        { body }
      );
      get().upsertMessage(projectId, mapChatMessage(raw));
    } catch (err) {
      get().upsertMessage(projectId, previous);
      throw err;
    }
  },

  deleteMessage: async (projectId, messageId) => {
    const previous = (get().messages[projectId] ?? []).find((m) => m.id === messageId);
    get().removeMessage(projectId, messageId);

    try {
      await api.delete(`/projects/${projectId}/chat/${messageId}`);
    } catch (err) {
      if (previous) get().upsertMessage(projectId, previous);
      throw err;
    }
  },

  toggleMessageReaction: async (projectId, messageId, emoji) => {
    const currentUser = useAuthStore.getState().user;
    const previous = (get().messages[projectId] ?? []).find((m) => m.id === messageId);
    if (!previous || !currentUser) return;

    get().upsertMessage(projectId, {
      ...previous,
      reactions: toggleReactionLocally(previous.reactions, emoji, currentUser.id, currentUser.name),
    });

    try {
      const raw = await api.post<Parameters<typeof mapChatMessage>[0]>(
        `/projects/${projectId}/chat/${messageId}/reactions`,
        { emoji }
      );
      get().upsertMessage(projectId, mapChatMessage(raw));
    } catch (err) {
      get().upsertMessage(projectId, previous);
      throw err;
    }
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
