import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapNotification, type NotificationItem } from "@/lib/api/mappers";

export type { NotificationItem };

interface NotificationsState {
  notifications: NotificationItem[];
  loaded: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  loaded: false,

  fetchNotifications: async () => {
    const raw = await api.get<Parameters<typeof mapNotification>[0][]>("/notifications");
    set({ notifications: raw.map(mapNotification), loaded: true });
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    await api.patch(`/notifications/${id}/read`);
  },

  markAllRead: async () => {
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }));
    await api.patch("/notifications/read-all");
  },

  reset: () => set({ notifications: [], loaded: false }),
}));
