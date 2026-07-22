"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { IssueCard } from "./issue-card";
import { STATUS_ICONS, DefaultStatusIcon } from "@/lib/status-icons";
import type { Issue } from "@/lib/types";

export function KanbanColumn({
  id,
  label,
  color,
  icon,
  issues,
  draggable = true,
}: {
  id: string;
  label: string;
  color?: string;
  icon?: string;
  issues: Issue[];
  draggable?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: !draggable });
  const ColumnIcon = icon ? STATUS_ICONS[icon] ?? DefaultStatusIcon : null;

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium text-fg-secondary">
        {ColumnIcon ? (
          <ColumnIcon size={13} className="shrink-0" style={{ color }} />
        ) : (
          color && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        )}
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
