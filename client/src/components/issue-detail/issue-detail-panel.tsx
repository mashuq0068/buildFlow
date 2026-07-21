"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Paperclip, Sparkles, MessageSquare, History as HistoryIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { ApiError } from "@/lib/api-client";
import { STATUS_COLUMNS, PRIORITY_LABEL, type IssuePriority, type IssueStatus } from "@/lib/types";
import { CommentThread } from "./comment-thread";
import { ActivityTab } from "./activity-tab";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { cn } from "@/lib/utils";

const PRIORITIES: IssuePriority[] = ["no_priority", "low", "medium", "high", "urgent"];

export function IssueDetailPanel() {
  const selectedIssueId = useUIStore((s) => s.selectedIssueId);
  const closeIssue = useUIStore((s) => s.closeIssue);
  const issue = useIssuesStore((s) => s.issues.find((i) => i.id === selectedIssueId));
  const moveIssue = useIssuesStore((s) => s.moveIssue);
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const loadIssueDetail = useIssuesStore((s) => s.loadIssueDetail);
  const commentCount = useIssuesStore((s) => s.comments[selectedIssueId ?? ""]?.length ?? 0);
  const isFavorite = useIssuesStore((s) => s.favoriteIds.includes(selectedIssueId ?? ""));
  const toggleFavorite = useIssuesStore((s) => s.toggleFavorite);
  const members = useMembersStore((s) => s.members);

  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const open = Boolean(issue);

  useEffect(() => {
    if (selectedIssueId) {
      loadIssueDetail(selectedIssueId).catch(() => {
        toast.error("Failed to load issue details");
      });
    }
  }, [selectedIssueId, loadIssueDetail]);

  async function handleUpdate(patch: Parameters<typeof updateIssue>[1]) {
    if (!issue) return;
    try {
      await updateIssue(issue.id, patch);
      // priority/assignee changes log server-side activity — refresh so the Activity tab reflects it live
      if ("priority" in patch || "assigneeId" in patch) {
        loadIssueDetail(issue.id).catch(() => {});
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update issue");
    }
  }

  async function handleMove(status: IssueStatus) {
    if (!issue) return;
    try {
      await moveIssue(issue.id, status);
      loadIssueDetail(issue.id).catch(() => {});
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to move issue");
    }
  }

  return (
    <AnimatePresence>
      {open && issue && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeIssue}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l border-border bg-bg sm:max-w-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-medium text-fg-secondary">{issue.identifier}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleFavorite(issue.id)}
                  aria-label={isFavorite ? "Unstar issue" : "Star issue"}
                  className={cn(
                    "rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg",
                    isFavorite && "text-[#e8a53f]"
                  )}
                >
                  <Star size={15} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={closeIssue}
                  aria-label="Close"
                  className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <input
                value={issue.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
                className="w-full border-none bg-transparent text-lg font-semibold text-fg outline-none"
              />

              <RichTextEditor
                value={issue.description ?? ""}
                onChange={(html) => handleUpdate({ description: html })}
                placeholder="Add a description..."
                className="mt-4"
                minHeight={60}
              />

              {issue.aiSuggested && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-bg-secondary p-2.5">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-fg-secondary" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-fg">
                      AI suggested labels: {issue.aiSuggested.labels?.join(", ")}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-fg-tertiary">
                      {issue.aiSuggested.reasoning}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 rounded-md border border-border p-3">
                <PropertyRow label="Status">
                  <select
                    value={issue.status}
                    onChange={(e) => handleMove(e.target.value as IssueStatus)}
                    className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none"
                  >
                    {STATUS_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </PropertyRow>

                <PropertyRow label="Priority">
                  <select
                    value={issue.priority}
                    onChange={(e) => handleUpdate({ priority: e.target.value as IssuePriority })}
                    className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </PropertyRow>

                <PropertyRow label="Assignee">
                  <select
                    value={issue.assignee?.id ?? ""}
                    onChange={(e) => handleUpdate({ assigneeId: e.target.value || null })}
                    className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </PropertyRow>

                {issue.labels && issue.labels.length > 0 && (
                  <PropertyRow label="Labels">
                    <div className="flex flex-wrap justify-end gap-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label.id}
                          className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-secondary"
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </PropertyRow>
                )}

                {issue.attachments && issue.attachments.length > 0 && (
                  <PropertyRow label="Attachments">
                    <div className="flex flex-col items-end gap-1">
                      {issue.attachments.map((attachment) => (
                        <span
                          key={attachment.id}
                          className="flex items-center gap-1.5 text-xs text-fg-secondary"
                        >
                          <Paperclip size={12} />
                          {attachment.name}
                          <span className="text-fg-tertiary">({attachment.size})</span>
                        </span>
                      ))}
                    </div>
                  </PropertyRow>
                )}
              </div>

              <div className="mt-4 flex gap-1 border-b border-border">
                <TabButton
                  active={tab === "comments"}
                  onClick={() => setTab("comments")}
                  icon={MessageSquare}
                  label={`Chat${commentCount ? ` (${commentCount})` : ""}`}
                />
                <TabButton
                  active={tab === "activity"}
                  onClick={() => setTab("activity")}
                  icon={HistoryIcon}
                  label="Activity"
                />
              </div>

              <div className="pt-4">
                {tab === "comments" ? (
                  <CommentThread issueId={issue.id} />
                ) : (
                  <ActivityTab issueId={issue.id} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-fg-tertiary">{label}</span>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-2 pb-2 text-xs font-medium transition-colors",
        active
          ? "border-fg text-fg"
          : "border-transparent text-fg-tertiary hover:text-fg-secondary"
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
