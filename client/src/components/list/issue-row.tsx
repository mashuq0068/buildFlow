"use client";

import {
  SignalLow,
  SignalMedium,
  SignalHigh,
  AlertTriangle,
  Flame,
  Minus,
  Paperclip,
  Star,
  CalendarClock,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { cn, isIssueOverdue, formatDueDate } from "@/lib/utils";
import { STATUS_ICONS, DefaultStatusIcon } from "@/lib/status-icons";
import { Avatar } from "@/components/ui/avatar";
import type { Issue, IssuePriority } from "@/lib/types";

const PRIORITY_ICON: Record<IssuePriority, React.ElementType> = {
  no_priority: Minus,
  low: SignalLow,
  medium: SignalMedium,
  high: SignalHigh,
  urgent: AlertTriangle,
  critical: Flame,
};

const PRIORITY_COLOR: Record<IssuePriority, string> = {
  no_priority: "text-fg-tertiary",
  low: "text-fg-tertiary",
  medium: "text-fg-secondary",
  high: "text-fg",
  urgent: "text-[#e5484d]",
  critical: "text-[#dc2626]",
};

export function IssueRow({
  issue,
  selectable,
  selected,
  onToggleSelect,
}: {
  issue: Issue;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const openIssue = useUIStore((s) => s.openIssue);
  const isFavorite = useIssuesStore((s) => s.favoriteIds.includes(issue.id));
  const toggleFavorite = useIssuesStore((s) => s.toggleFavorite);
  const Icon = PRIORITY_ICON[issue.priority];
  const StatusIcon = STATUS_ICONS[issue.status.icon] ?? DefaultStatusIcon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openIssue(issue.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openIssue(issue.id);
      }}
      className="flex w-full cursor-pointer items-center gap-3 border-b border-border px-3 py-2 text-left transition-colors hover:bg-surface-hover"
    >
      {selectable && (
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onClick={(e) => e.stopPropagation()}
          onChange={onToggleSelect}
          className="size-3.5 shrink-0 cursor-pointer accent-accent"
        />
      )}
      <button
        type="button"
        aria-label={isFavorite ? "Unstar issue" : "Star issue"}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(issue.id);
        }}
        className={cn(
          "shrink-0 rounded p-0.5 text-fg-tertiary transition-colors hover:text-fg",
          isFavorite && "text-[#e8a53f]"
        )}
      >
        <Star size={13} fill={isFavorite ? "currentColor" : "none"} />
      </button>
      <Icon size={13} className={`shrink-0 ${PRIORITY_COLOR[issue.priority]}`} />
      <span title={issue.status.name} className="shrink-0" style={{ color: issue.status.color }}>
        <StatusIcon size={13} />
      </span>
      <span className="w-16 shrink-0 text-xs text-fg-secondary">{issue.identifier}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-fg">{issue.title}</span>

      {issue.labels && issue.labels.length > 0 && (
        <div className="hidden shrink-0 gap-1 sm:flex">
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-secondary"
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
            </span>
          ))}
        </div>
      )}

      {issue.attachments && issue.attachments.length > 0 && (
        <span className="hidden shrink-0 items-center gap-0.5 text-fg-tertiary sm:flex">
          <Paperclip size={11} />
          <span className="text-[10px]">{issue.attachments.length}</span>
        </span>
      )}

      {issue.dueDate && (
        <span
          className={cn(
            "hidden shrink-0 items-center gap-0.5 text-[10px] sm:flex",
            isIssueOverdue(issue.dueDate, issue.status.category)
              ? "text-[#e5484d]"
              : "text-fg-tertiary"
          )}
        >
          <CalendarClock size={11} />
          {formatDueDate(issue.dueDate)}
        </span>
      )}

      {issue.assignee ? (
        <Avatar person={issue.assignee} size={20} />
      ) : (
        <span className="size-5 shrink-0 rounded-full border border-dashed border-border-strong" />
      )}
    </div>
  );
}
