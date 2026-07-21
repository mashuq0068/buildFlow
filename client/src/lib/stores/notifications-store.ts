import { create } from "zustand";
import type { NotificationItem } from "@/lib/mock-data";
import { INITIAL_NOTIFICATIONS } from "@/lib/mock-data";

interface NotificationsState {
  notifications: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
}));
