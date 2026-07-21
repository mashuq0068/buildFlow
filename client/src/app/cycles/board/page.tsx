"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/list/list-view";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useCyclesStore } from "@/lib/stores/cycles-store";

function CycleBoardContent() {
  const searchParams = useSearchParams();
  const cycles = useCyclesStore((s) => s.cycles);
  const cycleId = searchParams.get("id") ?? cycles[0]?.id;
  const cycle = cycles.find((c) => c.id === cycleId);
  const allIssues = useIssuesStore((s) => s.issues);
  const issues = useMemo(
    () => allIssues.filter((i) => i.cycleId === cycleId),
    [allIssues, cycleId]
  );

  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const boardView = useUIStore((s) => s.boardView);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title={`${cycle?.name ?? cycleId} / Board`}
          showViewSwitcher
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        {issues.length === 0 ? (
          <p className="p-6 text-center text-sm text-fg-secondary">
            No issues are scheduled in this cycle yet.
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

export default function CycleBoardPage() {
  return (
    <Suspense fallback={null}>
      <CycleBoardContent />
    </Suspense>
  );
}
