"use client";

import { History } from "lucide-react";
import { useIssuesStore } from "@/lib/stores/issues-store";
import type { ActivityEntry } from "@/lib/types";

const EMPTY_ACTIVITY: ActivityEntry[] = [];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function ActivityTab({ issueId }: { issueId: string }) {
  const activity = useIssuesStore((s) => s.activity[issueId] ?? EMPTY_ACTIVITY);

  if (activity.length === 0) {
    return <p className="py-6 text-center text-xs text-fg-tertiary">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {activity.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2.5 text-xs">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-hover text-fg-tertiary">
            <History size={11} />
          </span>
          <p className="text-fg-secondary">
            <span className="font-medium text-fg">{entry.author.name}</span> {entry.message}
            <span className="ml-1.5 text-fg-tertiary">· {timeAgo(entry.createdAt)}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
