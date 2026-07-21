"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, Settings2, Inbox } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/list/list-view";
import { IssueFilterBar } from "@/components/board/issue-filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectAccessGuard } from "@/components/projects/project-access-guard";
import { ManageMembersModal } from "@/components/projects/manage-members-modal";
import { ManageStatusesModal } from "@/components/projects/manage-statuses-modal";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useProjectStatusColumns } from "@/lib/hooks/use-project-status-columns";
import { useIssueFilters } from "@/lib/hooks/use-issue-filters";
import { getStatusColumnId } from "@/lib/board-columns";

function ProjectBoardContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") ?? "";
  const projects = useProjectsStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);
  const allIssues = useIssuesStore((s) => s.issues);
  const issues = useMemo(
    () => allIssues.filter((i) => i.projectId === projectId),
    [allIssues, projectId]
  );
  const members = useMembersStore((s) => s.members);
  const filters = useIssueFilters(issues);

  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const openNewIssue = useUIStore((s) => s.openNewIssue);
  const boardView = useUIStore((s) => s.boardView);
  const [membersOpen, setMembersOpen] = useState(false);
  const [statusesOpen, setStatusesOpen] = useState(false);
  const columns = useProjectStatusColumns(projectId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title={`${project?.name ?? projectId} / Board`}
          showViewSwitcher
          onNewIssue={() => openNewIssue(projectId)}
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
                href={`/projects/chat?id=${projectId}`}
                title={`${project?.name ?? "Project"} chat`}
                className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <MessageSquare size={15} />
              </Link>
            </>
          }
        />
        <ProjectAccessGuard project={project}>
          <div className="relative flex flex-1 flex-col overflow-hidden">
            {issues.length > 0 && (
              <IssueFilterBar filters={filters} issues={issues} members={members} />
            )}
            <div className="relative flex flex-1 overflow-hidden">
              {issues.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No issues yet"
                  description="Create the first issue for this project."
                />
              ) : filters.filtered.length === 0 ? (
                <EmptyState icon={Inbox} title="No issues match your filters" />
              ) : boardView === "board" ? (
                <KanbanBoard
                  issues={filters.filtered}
                  columns={columns}
                  getColumnId={getStatusColumnId}
                />
              ) : (
                <ListView
                  issues={filters.filtered}
                  columns={columns}
                  getColumnId={getStatusColumnId}
                  selectable
                  members={members}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setStatusesOpen(true)}
              title="Manage statuses"
              aria-label="Manage statuses"
              className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </ProjectAccessGuard>
      </div>
      <ManageMembersModal
        project={membersOpen ? project ?? null : null}
        onOpenChange={(open) => setMembersOpen(open)}
      />
      {project && (
        <ManageStatusesModal
          project={statusesOpen ? project : null}
          onOpenChange={(open) => setStatusesOpen(open)}
        />
      )}
    </div>
  );
}

export default function ProjectBoardPage() {
  return (
    <Suspense fallback={null}>
      <ProjectBoardContent />
    </Suspense>
  );
}
