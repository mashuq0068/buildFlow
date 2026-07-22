"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { Avatar } from "@/components/ui/avatar";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NotificationBell() {
  const { notifications, markRead } = useNotificationsStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const preview = notifications.slice(0, 5);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-[#e5484d] text-[9px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-80 overflow-hidden rounded-md border border-border bg-bg shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
        >
          <div className="border-b border-border px-3 py-2 text-xs font-medium text-fg-secondary">
            Notifications
          </div>
          {preview.length === 0 && (
            <p className="p-4 text-center text-xs text-fg-secondary">You&apos;re all caught up.</p>
          )}
          {preview.map((n) => (
            <DropdownMenu.Item
              key={n.id}
              onSelect={() => markRead(n.id)}
              className="flex cursor-pointer items-start gap-2.5 border-b border-border px-3 py-2.5 outline-none last:border-0 data-[highlighted]:bg-surface-hover"
            >
              <Avatar person={n.actor} size={20} className="text-fg" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-fg">
                  <span className="font-medium">{n.actor.name}</span> {n.message}
                </p>
                <p className="mt-0.5 text-[11px] text-fg-secondary">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />}
            </DropdownMenu.Item>
          ))}
          <Link
            href="/inbox"
            className="block px-3 py-2 text-center text-xs text-fg-secondary hover:bg-surface-hover hover:text-fg"
          >
            View all in Inbox
          </Link>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
