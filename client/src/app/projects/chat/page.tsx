"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, LayoutGrid, Users } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ProjectAccessGuard } from "@/components/projects/project-access-guard";
import { ManageMembersModal } from "@/components/projects/manage-members-modal";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useProjectChatStore } from "@/lib/stores/project-chat-store";
import { useCurrentUser } from "@/lib/current-user";
import { ApiError } from "@/lib/api-client";
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

function ProjectChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") ?? "";
  const projects = useProjectsStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);

  const messages = useProjectChatStore((s) => s.messages[projectId]) ?? [];
  const fetchMessages = useProjectChatStore((s) => s.fetchMessages);
  const addMessage = useProjectChatStore((s) => s.addMessage);
  const currentUser = useCurrentUser();
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const [draft, setDraft] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);

  useEffect(() => {
    if (project) fetchMessages(projectId).catch(() => toast.error("Failed to load chat"));
  }, [project, projectId, fetchMessages]);

  async function handleSubmit() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    try {
      await addMessage(projectId, body);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send message");
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title={`${project?.name ?? projectId} / Chat`}
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
          rightExtra={
            <>
              <button
                type="button"
                onClick={() => setMembersOpen(true)}
                title={`${project?.name ?? "Project"} members`}
                className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <Users size={15} />
              </button>
              <Link
                href={`/projects/board?id=${projectId}`}
                title={`${project?.name ?? "Project"} board`}
                className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <LayoutGrid size={15} />
              </Link>
            </>
          }
        />

        <ProjectAccessGuard project={project}>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {messages.length === 0 && (
                <p className="py-10 text-center text-sm text-fg-secondary">
                  No messages yet — say hello to the {project?.name} team.
                </p>
              )}
              {messages.map((message) => {
                const isMe = message.author.id === currentUser?.id;
                return (
                  <div
                    key={message.id}
                    className={cn("flex items-end gap-2.5", isMe && "flex-row-reverse")}
                  >
                    <span
                      title={message.author.name}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[11px] font-medium text-fg-secondary ring-1 ring-border"
                    >
                      {message.author.initials}
                    </span>
                    <div className={cn("flex max-w-[75%] flex-col gap-0.5", isMe && "items-end")}>
                      {!isMe && (
                        <span className="px-1 text-[11px] font-medium text-fg-secondary">
                          {message.author.name}
                        </span>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                          isMe
                            ? "rounded-br-sm bg-accent text-accent-fg"
                            : "rounded-bl-sm bg-surface-hover text-fg"
                        )}
                      >
                        {message.body}
                      </div>
                      <span className="px-1 text-[10px] text-fg-tertiary">
                        {timeAgo(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="mx-auto flex max-w-2xl items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={`Message #${project?.teamKey.toLowerCase() ?? "project"}`}
                rows={1}
                className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-border-strong"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!draft.trim()}
                aria-label="Send message"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
        </ProjectAccessGuard>
      </div>
      <ManageMembersModal
        project={membersOpen ? project ?? null : null}
        onOpenChange={(open) => setMembersOpen(open)}
      />
    </div>
  );
}

export default function ProjectChatPage() {
  return (
    <Suspense fallback={null}>
      <ProjectChatContent />
    </Suspense>
  );
}
