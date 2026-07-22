import { useMemo, useState } from "react";
import type { Issue, IssuePriority } from "@/lib/types";

export type IssueSort = "manual" | "priority" | "title";

const PRIORITY_RANK: Record<IssuePriority, number> = {
  critical: 0,
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
  no_priority: 5,
};

export function useIssueFilters(issues: Issue[]) {
  const [search, setSearch] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("all");
  const [priority, setPriority] = useState<IssuePriority | "all">("all");
  const [labelId, setLabelId] = useState<string>("all");
  const [sort, setSort] = useState<IssueSort>("manual");

  const filtered = useMemo(() => {
    let result = issues;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.identifier.toLowerCase().includes(q)
      );
    }
    if (assigneeId !== "all") {
      result =
        assigneeId === "unassigned"
          ? result.filter((i) => !i.assignee)
          : result.filter((i) => i.assignee?.id === assigneeId);
    }
    if (priority !== "all") {
      result = result.filter((i) => i.priority === priority);
    }
    if (labelId !== "all") {
      result = result.filter((i) => i.labels?.some((l) => l.id === labelId));
    }

    if (sort !== "manual") {
      result = [...result].sort((a, b) => {
        if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        return a.title.localeCompare(b.title);
      });
    }

    return result;
  }, [issues, search, assigneeId, priority, labelId, sort]);

  const isFiltering =
    search.trim() !== "" || assigneeId !== "all" || priority !== "all" || labelId !== "all";

  function clear() {
    setSearch("");
    setAssigneeId("all");
    setPriority("all");
    setLabelId("all");
    setSort("manual");
  }

  return {
    filtered,
    isFiltering,
    search,
    setSearch,
    assigneeId,
    setAssigneeId,
    priority,
    setPriority,
    labelId,
    setLabelId,
    sort,
    setSort,
    clear,
  };
}

export type UseIssueFiltersResult = ReturnType<typeof useIssueFilters>;
