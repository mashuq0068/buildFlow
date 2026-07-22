"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useProjectChatStore } from "@/lib/stores/project-chat-store";
import { useChatReadStore } from "@/lib/stores/chat-read-store";
import { useCurrentUser } from "@/lib/current-user";
import { stripHtml } from "@/lib/utils";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function ChatsPage() {
  const projects = useProjectsStore((s) => s.projects);
  const messagesByProject = useProjectChatStore((s) => s.messages);
  const lastSeenAt = useChatReadStore((s) => s.lastSeenAt);
  const markSeen = useChatReadStore((s) => s.markSeen);
  const currentUser = useCurrentUser();
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const rows = useMemo(() => {
    return projects
      .map((project) => {
        const messages = messagesByProject[project.id] ?? [];
        const last = messages[messages.length - 1];
        const seenAt = lastSeenAt[project.id];
        const unread = currentUser
          ? messages.filter((m) => m.author.id !== currentUser.id && (!seenAt || m.createdAt > seenAt))
              .length
          : 0;
        return { project, last, unread };
      })
      .sort((a, b) => {
        if (!a.last && !b.last) return a.project.name.localeCompare(b.project.name);
        if (!a.last) return 1;
        if (!b.last) return -1;
        return new Date(b.last.createdAt).getTime() - new Date(a.last.createdAt).getTime();
      });
  }, [projects, messagesByProject, lastSeenAt, currentUser]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Chats"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          {rows.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No project chats yet"
              description="Chats show up here once you're added to a project."
            />
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col overflow-hidden rounded-md border border-border">
              {rows.map(({ project, last, unread }) => (
                <Link
                  key={project.id}
                  href={`/projects/chat?id=${project.id}`}
                  onClick={() => markSeen(project.id)}
                  className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 transition-colors last:border-0 hover:bg-surface-hover"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-fg">{project.name}</p>
                      {last && (
                        <span className="shrink-0 text-[11px] text-fg-tertiary">
                          {timeAgo(last.createdAt)}
                        </span>
                      )}
                    </div>
                    {last ? (
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-secondary">
                        <Avatar person={last.author} size={14} />
                        <p className="truncate">
                          <span className="font-medium">{last.author.name}:</span>{" "}
                          {stripHtml(last.body) || "Sent an attachment"}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-0.5 truncate text-xs text-fg-tertiary">
                        No messages yet — say hello to the team.
                      </p>
                    )}
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-fg">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
