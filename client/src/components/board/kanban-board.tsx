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
import { STATUS_COLUMNS, type Issue, type IssueStatus } from "@/lib/types";

export function KanbanBoard({ issues }: { issues: Issue[] }) {
  const moveIssue = useIssuesStore((s) => s.moveIssue);
  const reorderWithinStatus = useIssuesStore((s) => s.reorderWithinStatus);

  const issuesById = useMemo(() => Object.fromEntries(issues.map((i) => [i.id, i])), [issues]);
  const itemsByColumn = useMemo(() => {
    const grouped = {} as Record<IssueStatus, string[]>;
    for (const column of STATUS_COLUMNS) grouped[column.id] = [];
    for (const issue of issues) grouped[issue.status].push(issue.id);
    return grouped;
  }, [issues]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewColumn, setPreviewColumn] = useState<Record<IssueStatus, string[]> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const columns = previewColumn ?? itemsByColumn;

  function findContainer(id: string): IssueStatus | undefined {
    if (id in columns) return id as IssueStatus;
    return STATUS_COLUMNS.find((column) => columns[column.id].includes(id))?.id;
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

    const originalContainer = STATUS_COLUMNS.find((c) =>
      itemsByColumn[c.id].includes(active.id as string)
    )?.id;
    const finalContainer = Object.keys(finalColumns).find((key) =>
      finalColumns[key as IssueStatus].includes(active.id as string)
    ) as IssueStatus | undefined;

    if (!originalContainer || !finalContainer) return;

    const movedIssue = issuesById[active.id as string];
    if (!movedIssue) return;

    try {
      if (originalContainer !== finalContainer) {
        await moveIssue(active.id as string, finalContainer);
        await reorderWithinStatus(
          movedIssue.projectId,
          finalContainer,
          finalColumns[finalContainer]
        );
        return;
      }

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
        {STATUS_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            issues={columns[column.id].map((id) => issuesById[id])}
          />
        ))}
      </main>
      <DragOverlay>{activeIssue ? <IssueCardOverlay issue={activeIssue} /> : null}</DragOverlay>
    </DndContext>
  );
}
