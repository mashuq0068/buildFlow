"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IssueCard } from "./issue-card";
import type { Issue, IssueStatus } from "@/lib/types";

export function KanbanColumn({
  id,
  label,
  issues,
}: {
  id: IssueStatus;
  label: string;
  issues: Issue[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium text-fg-secondary">
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
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
