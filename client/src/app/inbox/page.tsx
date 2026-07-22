"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function InboxPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const { notifications, markRead, markAllRead } = useNotificationsStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Inbox"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs text-fg-secondary">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-xs text-fg-secondary hover:text-fg disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-hover",
                !n.read && "bg-bg-secondary"
              )}
            >
              <Avatar person={n.actor} size={24} className="text-fg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg">
                  <span className="font-medium">{n.actor.name}</span> {n.message}{" "}
                  {n.issueIdentifier && (
                    <span className="text-fg-secondary">{n.issueIdentifier}</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-fg-secondary">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
