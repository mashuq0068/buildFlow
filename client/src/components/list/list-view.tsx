"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Issue, Person } from "@/lib/types";
import type { BoardColumn } from "@/components/board/kanban-board";
import { IssueRow } from "./issue-row";
import { BulkActionBar } from "./bulk-action-bar";
import { STATUS_ICONS, DefaultStatusIcon } from "@/lib/status-icons";
import { cn } from "@/lib/utils";

export function ListView({
  issues,
  columns,
  getColumnId,
  selectable = false,
  members = [],
}: {
  issues: Issue[];
  columns: BoardColumn[];
  getColumnId: (issue: Issue) => string;
  selectable?: boolean;
  members?: Person[];
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const validIds = useMemo(() => new Set(issues.map((i) => i.id)), [issues]);
  const selectedIds = useMemo(
    () => Array.from(selected).filter((id) => validIds.has(id)),
    [selected, validIds]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {selectable && selectedIds.length > 0 && (
        <BulkActionBar
          selectedIds={selectedIds}
          columns={columns}
          members={members}
          onClear={() => setSelected(new Set())}
        />
      )}
      <div className="flex-1 overflow-y-auto">
      {columns.map((column) => {
        const columnIssues = issues.filter((i) => getColumnId(i) === column.id);
        const isCollapsed = collapsed[column.id];
        const ColumnIcon = column.icon ? STATUS_ICONS[column.icon] ?? DefaultStatusIcon : null;

        return (
          <div key={column.id}>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => ({ ...prev, [column.id]: !prev[column.id] }))}
              className="flex w-full items-center gap-2 border-b border-border bg-bg-secondary px-3 py-2 text-left text-xs font-medium text-fg-secondary"
            >
              <ChevronDown
                size={13}
                className={cn("transition-transform", isCollapsed && "-rotate-90")}
              />
              {ColumnIcon ? (
                <ColumnIcon size={13} className="shrink-0" style={{ color: column.color }} />
              ) : (
                column.color && (
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                )
              )}
              <span>{column.label}</span>
              <span className="text-fg-secondary">{columnIssues.length}</span>
            </button>
            {!isCollapsed &&
              columnIssues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  selectable={selectable}
                  selected={selected.has(issue.id)}
                  onToggleSelect={() => toggle(issue.id)}
                />
              ))}
          </div>
        );
      })}
      </div>
    </div>
  );
}
