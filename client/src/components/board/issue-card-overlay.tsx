"use client";

import { SignalLow, SignalMedium, SignalHigh, AlertTriangle, Minus } from "lucide-react";
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

export function IssueCardOverlay({ issue }: { issue: Issue }) {
  const Icon = PRIORITY_ICON[issue.priority];

  return (
    <div className="w-72 rotate-2 cursor-grabbing rounded-md border border-border-strong bg-surface p-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <p className="text-sm leading-snug text-fg">{issue.title}</p>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-tertiary">{issue.identifier}</span>
          <Icon size={13} className={PRIORITY_COLOR[issue.priority]} />
        </div>
        {issue.assignee ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium text-fg-secondary ring-1 ring-border">
            {issue.assignee.initials}
          </span>
        ) : (
          <span className="size-5 rounded-full border border-dashed border-border-strong" />
        )}
      </div>
    </div>
  );
}
