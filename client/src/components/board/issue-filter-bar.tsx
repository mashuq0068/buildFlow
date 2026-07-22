"use client";

import { useMemo } from "react";
import { Search, X, Download } from "lucide-react";
import type { Issue, Person } from "@/lib/types";
import { PRIORITY_LABEL, type IssuePriority } from "@/lib/types";
import type { UseIssueFiltersResult, IssueSort } from "@/lib/hooks/use-issue-filters";
import { exportIssuesToCsv } from "@/lib/csv-export";

const PRIORITIES: IssuePriority[] = ["critical", "urgent", "high", "medium", "low", "no_priority"];

export function IssueFilterBar({
  filters,
  issues,
  members,
}: {
  filters: UseIssueFiltersResult;
  issues: Issue[];
  members: Person[];
}) {
  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const issue of issues) {
      for (const label of issue.labels ?? []) map.set(label.id, label.name);
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [issues]);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
      <div className="relative">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-fg-tertiary" />
        <input
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
          placeholder="Search issues..."
          className="w-44 rounded-md border border-border bg-surface py-1.5 pl-7 pr-2 text-xs text-fg placeholder:text-fg-tertiary outline-none"
        />
      </div>

      <select
        value={filters.assigneeId}
        onChange={(e) => filters.setAssigneeId(e.target.value)}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
      >
        <option value="all">Any assignee</option>
        <option value="unassigned">Unassigned</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) => filters.setPriority(e.target.value as IssuePriority | "all")}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
      >
        <option value="all">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>

      {labels.length > 0 && (
        <select
          value={filters.labelId}
          onChange={(e) => filters.setLabelId(e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
        >
          <option value="all">Any label</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      )}

      <select
        value={filters.sort}
        onChange={(e) => filters.setSort(e.target.value as IssueSort)}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
      >
        <option value="manual">Sort: Manual</option>
        <option value="priority">Sort: Priority</option>
        <option value="title">Sort: Title</option>
      </select>

      {filters.isFiltering && (
        <button
          type="button"
          onClick={filters.clear}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <X size={12} />
          Clear
        </button>
      )}

      <button
        type="button"
        onClick={() => exportIssuesToCsv(filters.filtered)}
        title="Export visible issues to CSV"
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
      >
        <Download size={12} />
        Export CSV
      </button>

      <span className="ml-auto text-xs text-fg-tertiary">
        {filters.filtered.length} of {issues.length}
      </span>
    </div>
  );
}
