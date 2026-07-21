"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IssueCard } from "./issue-card";
import type { Issue } from "@/lib/types";

export function KanbanColumn({
  id,
  label,
  color,
  issues,
  draggable = true,
}: {
  id: string;
  label: string;
  color?: string;
  issues: Issue[];
  draggable?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !draggable });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium text-fg-secondary">
        {color && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
        <span>{label}</span>
        <span className="text-fg-secondary">{issues.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
          isOver ? "bg-surface-hover" : ""
        }`}
      >
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} draggable={draggable} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
