import {
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  type Issue,
  type StatusCategory,
} from "@/lib/types";
import type { BoardColumn } from "@/components/board/kanban-board";

const CATEGORY_ICON: Record<StatusCategory, string> = {
  backlog: "Circle",
  unstarted: "CircleDot",
  started: "Loader",
  blocked: "Ban",
  completed: "CheckCircle2",
  canceled: "XCircle",
};

/** Fixed super-columns used for cross-project boards (My Issues, Favorites) where
 * issues may come from projects with entirely different custom status sets — a
 * unified board there can only group by the shared status category, not the
 * exact per-project status. */
export const CATEGORY_COLUMNS: BoardColumn[] = CATEGORY_ORDER.map((category) => ({
  id: category,
  label: CATEGORY_LABEL[category],
  color: CATEGORY_COLOR[category],
  icon: CATEGORY_ICON[category],
}));

export function getCategoryColumnId(issue: Issue) {
  return issue.status.category;
}

export function getStatusColumnId(issue: Issue) {
  return issue.status.id;
}
