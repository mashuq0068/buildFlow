"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { STATUS_COLUMNS, type Issue } from "@/lib/types";
import { IssueRow } from "./issue-row";
import { cn } from "@/lib/utils";

export function ListView({ issues }: { issues: Issue[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex-1 overflow-y-auto">
      {STATUS_COLUMNS.map((column) => {
        const columnIssues = issues.filter((i) => i.status === column.id);
        const isCollapsed = collapsed[column.id];

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
              <span>{column.label}</span>
              <span className="text-fg-secondary">{columnIssues.length}</span>
            </button>
            {!isCollapsed &&
              columnIssues.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
          </div>
        );
      })}
    </div>
  );
}
