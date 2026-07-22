"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/list/list-view";
import { IssueFilterBar } from "@/components/board/issue-filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useIssueFilters } from "@/lib/hooks/use-issue-filters";
import { CATEGORY_COLUMNS, getCategoryColumnId } from "@/lib/board-columns";
import { resolveStatusIdForCategory } from "@/lib/resolve-category-drop";
import type { StatusCategory } from "@/lib/types";

export default function FavoritesPage() {
  const allIssues = useIssuesStore((s) => s.issues);
  const favoriteIds = useIssuesStore((s) => s.favoriteIds);
  const members = useMembersStore((s) => s.members);
  const issues = useMemo(
    () => allIssues.filter((i) => favoriteIds.includes(i.id)),
    [allIssues, favoriteIds]
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
          title="Favorites"
          showViewSwitcher
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        {issues.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No favorites yet"
            description="Star an issue from the board or its detail panel to pin it here."
          />
        ) : (
          <>
            <IssueFilterBar filters={filters} issues={issues} members={members} />
            {filters.filtered.length === 0 ? (
              <EmptyState icon={Star} title="No issues match your filters" />
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
