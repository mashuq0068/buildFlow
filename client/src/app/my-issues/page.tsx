"use client";

import { useMemo } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/list/list-view";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";

export default function MyIssuesPage() {
  const currentUser = useCurrentUser();
  const allIssues = useIssuesStore((s) => s.issues);
  const issues = useMemo(
    () =>
      allIssues.filter(
        (i) => i.assignee?.id === currentUser?.id || i.creator?.id === currentUser?.id
      ),
    [allIssues, currentUser?.id]
  );
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const boardView = useUIStore((s) => s.boardView);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="My Issues"
          showViewSwitcher
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        {issues.length === 0 ? (
          <p className="p-6 text-center text-sm text-fg-secondary">
            No issues assigned to or created by you yet.
          </p>
        ) : boardView === "board" ? (
          <KanbanBoard issues={issues} />
        ) : (
          <ListView issues={issues} />
        )}
      </div>
    </div>
  );
}
