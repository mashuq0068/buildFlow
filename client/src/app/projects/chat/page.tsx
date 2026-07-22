"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Users } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ProjectAccessGuard } from "@/components/projects/project-access-guard";
import { ManageMembersModal } from "@/components/projects/manage-members-modal";
import { DiscussionThread } from "@/components/discussion/discussion-thread";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useProjectChatStore } from "@/lib/stores/project-chat-store";
import { useChatReadStore } from "@/lib/stores/chat-read-store";
import { useCurrentUser } from "@/lib/current-user";
import { useProjectRoom } from "@/lib/hooks/use-live-room";

function ProjectChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") ?? "";
  const projects = useProjectsStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);

  const messages = useProjectChatStore((s) => s.messages[projectId]) ?? [];
  const fetchMessages = useProjectChatStore((s) => s.fetchMessages);
  const addMessage = useProjectChatStore((s) => s.addMessage);
  const updateMessage = useProjectChatStore((s) => s.updateMessage);
  const deleteMessage = useProjectChatStore((s) => s.deleteMessage);
  const toggleMessageReaction = useProjectChatStore((s) => s.toggleMessageReaction);
  const markSeen = useChatReadStore((s) => s.markSeen);
  const currentUser = useCurrentUser();
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  const [membersOpen, setMembersOpen] = useState(false);

  useProjectRoom(projectId || undefined);

  useEffect(() => {
    if (project) fetchMessages(projectId).catch(() => toast.error("Failed to load discussion"));
  }, [project, projectId, fetchMessages]);

  useEffect(() => {
    if (!projectId) return;
    markSeen(projectId);
  }, [projectId, messages.length, markSeen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title={`${project?.name ?? projectId} / Discussion`}
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-2xl">
              <DiscussionThread
                items={messages}
                currentUserId={currentUser?.id}
                onSubmit={(body, parentId, attachments) =>
                  addMessage(projectId, body, parentId, attachments)
                }
                onEdit={(messageId, body) => updateMessage(projectId, messageId, body)}
                onDelete={(messageId) => deleteMessage(projectId, messageId)}
                onToggleReaction={(messageId, emoji) =>
                  toggleMessageReaction(projectId, messageId, emoji)
                }
                emptyMessage={`No messages yet — say hello to the ${project?.name ?? "project"} team.`}
                placeholder={`Message #${project?.teamKey.toLowerCase() ?? "project"} — use @ to mention someone`}
              />
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
