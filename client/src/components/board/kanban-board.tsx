"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { KanbanColumn } from "./kanban-column";
import { IssueCardOverlay } from "./issue-card-overlay";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { ApiError } from "@/lib/api-client";
import type { Issue } from "@/lib/types";

export interface BoardColumn {
  id: string;
  label: string;
  color?: string;
  icon?: string;
}

interface KanbanBoardProps {
  issues: Issue[];
  columns: BoardColumn[];
  getColumnId: (issue: Issue) => string;
  draggable?: boolean;
  /** When set, columnId is not a real statusId (e.g. cross-project category
   * columns) — resolve it to the dropped issue's own project's real status. */
  resolveDropStatusId?: (issue: Issue, columnId: string) => Promise<string | null>;
}

export function KanbanBoard({
  issues,
  columns,
  getColumnId,
  draggable = true,
  resolveDropStatusId,
}: KanbanBoardProps) {
  const moveIssue = useIssuesStore((s) => s.moveIssue);
  const reorderWithinStatus = useIssuesStore((s) => s.reorderWithinStatus);

  const issuesById = useMemo(() => Object.fromEntries(issues.map((i) => [i.id, i])), [issues]);
  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    for (const column of columns) grouped[column.id] = [];
    for (const issue of issues) {
      const columnId = getColumnId(issue);
      (grouped[columnId] ??= []).push(issue.id);
    }
    return grouped;
  }, [issues, columns, getColumnId]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewColumn, setPreviewColumn] = useState<Record<string, string[]> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const columnsState = previewColumn ?? itemsByColumn;

  function findContainer(id: string): string | undefined {
    if (id in columnsState) return id;
    return columns.find((column) => columnsState[column.id]?.includes(id))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setPreviewColumn(itemsByColumn);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !previewColumn) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setPreviewColumn((prev) => {
      if (!prev) return prev;
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const overIndex = overItems.indexOf(over.id as string);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;

      return {
        ...prev,
        [activeContainer]: activeItems.filter((id) => id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          active.id as string,
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const finalColumns = previewColumn;
    setActiveId(null);
    setPreviewColumn(null);
    if (!over || !finalColumns) return;

    const originalContainer = columns.find((c) =>
      itemsByColumn[c.id]?.includes(active.id as string)
    )?.id;
    const finalContainer = Object.keys(finalColumns).find((key) =>
      finalColumns[key].includes(active.id as string)
    );

    if (!originalContainer || !finalContainer) return;

    const movedIssue = issuesById[active.id as string];
    if (!movedIssue) return;

    try {
      if (originalContainer !== finalContainer) {
        if (resolveDropStatusId) {
          const realStatusId = await resolveDropStatusId(movedIssue, finalContainer);
          if (!realStatusId) {
            toast.error("That project has no status in this category");
            return;
          }
          await moveIssue(active.id as string, realStatusId);
          return;
        }
        await moveIssue(active.id as string, finalContainer);
        await reorderWithinStatus(movedIssue.projectId, finalContainer, finalColumns[finalContainer]);
        return;
      }

      // Cross-project category columns mix issues from different projects —
      // there's no single-project reorder call that makes sense here, so skip it.
      if (resolveDropStatusId) return;

      const overContainer = findContainer(over.id as string) ?? finalContainer;
      if (overContainer !== finalContainer) return;

      const activeIndex = finalColumns[finalContainer].indexOf(active.id as string);
      const overIndex = finalColumns[finalContainer].indexOf(over.id as string);
      if (activeIndex !== overIndex && overIndex >= 0) {
        await reorderWithinStatus(
          movedIssue.projectId,
          finalContainer,
          arrayMove(finalColumns[finalContainer], activeIndex, overIndex)
        );
      } else {
        await reorderWithinStatus(movedIssue.projectId, finalContainer, finalColumns[finalContainer]);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update the board");
    }
  }

  const activeIssue = activeId ? issuesById[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <main className="flex flex-1 gap-4 overflow-x-auto p-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            color={column.color}
            icon={column.icon}
            draggable={draggable}
            issues={(columnsState[column.id] ?? []).map((id) => issuesById[id]).filter(Boolean)}
          />
        ))}
      </main>
      <DragOverlay>{activeIssue ? <IssueCardOverlay issue={activeIssue} /> : null}</DragOverlay>
    </DndContext>
  );
}
