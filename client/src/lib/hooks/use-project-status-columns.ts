"use client";

import { useEffect } from "react";
import { useStatusesStore } from "@/lib/stores/statuses-store";
import type { BoardColumn } from "@/components/board/kanban-board";

export function useProjectStatusColumns(projectId: string | undefined): BoardColumn[] {
  const statuses = useStatusesStore((s) => (projectId ? s.byProject[projectId] : undefined));
  const fetchStatuses = useStatusesStore((s) => s.fetchStatuses);

  useEffect(() => {
    if (projectId) fetchStatuses(projectId).catch(() => {});
  }, [projectId, fetchStatuses]);

  return (statuses ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => ({ id: s.id, label: s.name, color: s.color, icon: s.icon }));
}
