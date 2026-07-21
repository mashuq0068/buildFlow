"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/list/list-view";
import { ProjectAccessGuard } from "@/components/projects/project-access-guard";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useProjectsStore } from "@/lib/stores/projects-store";

function ProjectBoardContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") ?? "engineering";
  const projects = useProjectsStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);
  const allIssues = useIssuesStore((s) => s.issues);
  const issues = useMemo(
    () => allIssues.filter((i) => i.projectId === projectId),
    [allIssues, projectId]
  );

  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const openNewIssue = useUIStore((s) => s.openNewIssue);
  const boardView = useUIStore((s) => s.boardView);

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
            <Link
              href={`/projects/chat?id=${projectId}`}
              title={`${project?.name ?? "Project"} chat`}
              className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <MessageSquare size={15} />
            </Link>
          }
        />
        <ProjectAccessGuard project={project}>
          {boardView === "board" ? <KanbanBoard issues={issues} /> : <ListView issues={issues} />}
        </ProjectAccessGuard>
      </div>
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
