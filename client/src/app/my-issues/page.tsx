"use client";

import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/list/list-view";
import { IssueFilterBar } from "@/components/board/issue-filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useCurrentUser } from "@/lib/current-user";
import { useIssueFilters } from "@/lib/hooks/use-issue-filters";
import { CATEGORY_COLUMNS, getCategoryColumnId } from "@/lib/board-columns";
import { resolveStatusIdForCategory } from "@/lib/resolve-category-drop";
import type { StatusCategory } from "@/lib/types";

export default function MyIssuesPage() {
  const currentUser = useCurrentUser();
  const allIssues = useIssuesStore((s) => s.issues);
  const members = useMembersStore((s) => s.members);
  const issues = useMemo(
    () =>
      allIssues.filter(
        (i) => i.assignee?.id === currentUser?.id || i.creator?.id === currentUser?.id
      ),
    [allIssues, currentUser?.id]
  );
  const filters = useIssueFilters(issues);
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
          <EmptyState
            icon={CheckCircle2}
            title="No issues yet"
            description="Issues assigned to you or created by you will show up here."
          />
        ) : (
          <>
            <IssueFilterBar filters={filters} issues={issues} members={members} />
            {filters.filtered.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="No issues match your filters" />
            ) : boardView === "board" ? (
              <KanbanBoard
                issues={filters.filtered}
                columns={CATEGORY_COLUMNS}
                getColumnId={getCategoryColumnId}
                resolveDropStatusId={(issue, columnId) =>
                  resolveStatusIdForCategory(issue.projectId, columnId as StatusCategory)
                }
              />
            ) : (
              <ListView
                issues={filters.filtered}
                columns={CATEGORY_COLUMNS}
                getColumnId={getCategoryColumnId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
