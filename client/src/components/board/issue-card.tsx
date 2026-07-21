"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SignalLow, SignalMedium, SignalHigh, AlertTriangle, Minus, Paperclip, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import type { Issue, IssuePriority } from "@/lib/types";

const PRIORITY_ICON: Record<IssuePriority, React.ElementType> = {
  no_priority: Minus,
  low: SignalLow,
  medium: SignalMedium,
  high: SignalHigh,
  urgent: AlertTriangle,
};

const PRIORITY_COLOR: Record<IssuePriority, string> = {
  no_priority: "text-fg-tertiary",
  low: "text-fg-tertiary",
  medium: "text-fg-secondary",
  high: "text-fg",
  urgent: "text-[#e5484d]",
};

export function IssueCard({ issue }: { issue: Issue }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: { type: "issue", issue },
  });
  const openIssue = useUIStore((s) => s.openIssue);
  const isFavorite = useIssuesStore((s) => s.favoriteIds.includes(issue.id));
  const toggleFavorite = useIssuesStore((s) => s.toggleFavorite);

  const Icon = PRIORITY_ICON[issue.priority];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openIssue(issue.id)}
      className={cn(
        "cursor-grab touch-none rounded-md border border-border bg-surface p-3 shadow-[var(--shadow-elevation)] transition-colors active:cursor-grabbing hover:bg-surface-hover",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug text-fg">{issue.title}</p>
        <button
          type="button"
          aria-label={isFavorite ? "Unstar issue" : "Star issue"}
          onPointerDown={(e) => e.stopPropagation()}
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
      </div>

      {issue.labels && issue.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
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

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-secondary">{issue.identifier}</span>
          <Icon size={13} className={PRIORITY_COLOR[issue.priority]} />
          {issue.attachments && issue.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-fg-tertiary">
              <Paperclip size={11} />
              <span className="text-[10px]">{issue.attachments.length}</span>
            </span>
          )}
        </div>
        {issue.assignee ? (
          <span
            title={issue.assignee.name}
            className="flex size-5 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium text-fg-secondary ring-1 ring-border"
          >
            {issue.assignee.initials}
          </span>
        ) : (
          <span className="size-5 rounded-full border border-dashed border-border-strong" />
        )}
      </div>
    </div>
  );
}
