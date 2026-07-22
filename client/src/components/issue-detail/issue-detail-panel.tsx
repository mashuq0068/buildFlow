"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  X,
  Paperclip,
  Sparkles,
  MessageSquare,
  History as HistoryIcon,
  Star,
  MoreHorizontal,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useCyclesStore } from "@/lib/stores/cycles-store";
import { useCurrentUser } from "@/lib/current-user";
import { ApiError } from "@/lib/api-client";
import { confirmAction } from "@/lib/stores/confirm-store";
import { PRIORITY_LABEL, type IssuePriority } from "@/lib/types";
import { DiscussionThread } from "@/components/discussion/discussion-thread";
import { ActivityTab } from "./activity-tab";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useProjectStatusColumns } from "@/lib/hooks/use-project-status-columns";
import { useIssueRoom } from "@/lib/hooks/use-live-room";
import { STATUS_ICONS, DefaultStatusIcon } from "@/lib/status-icons";
import { cn } from "@/lib/utils";

const PRIORITIES: IssuePriority[] = ["no_priority", "low", "medium", "high", "urgent", "critical"];
const EMPTY_COMMENTS: never[] = [];

export function IssueDetailPanel() {
  const selectedIssueId = useUIStore((s) => s.selectedIssueId);
  const closeIssue = useUIStore((s) => s.closeIssue);
  const issue = useIssuesStore((s) => s.issues.find((i) => i.id === selectedIssueId));
  const moveIssue = useIssuesStore((s) => s.moveIssue);
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const loadIssueDetail = useIssuesStore((s) => s.loadIssueDetail);
  const comments = useIssuesStore((s) => s.comments[selectedIssueId ?? ""] ?? EMPTY_COMMENTS);
  const addComment = useIssuesStore((s) => s.addComment);
  const updateComment = useIssuesStore((s) => s.updateComment);
  const deleteComment = useIssuesStore((s) => s.deleteComment);
  const toggleCommentReaction = useIssuesStore((s) => s.toggleCommentReaction);
  const isFavorite = useIssuesStore((s) => s.favoriteIds.includes(selectedIssueId ?? ""));
  const toggleFavorite = useIssuesStore((s) => s.toggleFavorite);
  const deleteIssue = useIssuesStore((s) => s.deleteIssue);
  const archiveIssue = useIssuesStore((s) => s.archiveIssue);
  const duplicateIssue = useIssuesStore((s) => s.duplicateIssue);
  const members = useMembersStore((s) => s.members);
  const cycles = useCyclesStore((s) => s.cycles);
  const allIssues = useIssuesStore((s) => s.issues);
  const currentUser = useCurrentUser();
  const statusColumns = useProjectStatusColumns(issue?.projectId);

  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const open = Boolean(issue);

  useIssueRoom(selectedIssueId ?? undefined);

  const isOverdue = Boolean(
    issue?.dueDate &&
      new Date(issue.dueDate) < new Date() &&
      issue.status.category !== "completed" &&
      issue.status.category !== "canceled"
  );

  const blockerCandidates = issue
    ? allIssues.filter((i) => i.projectId === issue.projectId && i.id !== issue.id)
    : [];

  const StatusIcon = issue ? STATUS_ICONS[issue.status.icon] ?? DefaultStatusIcon : DefaultStatusIcon;
  const projectCycles = issue ? cycles.filter((c) => c.projectId === issue.projectId) : [];

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

  async function handleMove(statusId: string) {
    if (!issue) return;
    try {
      await moveIssue(issue.id, statusId);
      loadIssueDetail(issue.id).catch(() => {});
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to move issue");
    }
  }

  async function handleDuplicate() {
    if (!issue) return;
    try {
      const copy = await duplicateIssue(issue.id);
      toast.success(`Duplicated as ${copy.identifier}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to duplicate issue");
    }
  }

  async function handleArchiveToggle() {
    if (!issue) return;
    const archiving = !issue.archived;
    if (archiving) {
      const ok = await confirmAction({
        title: `Archive ${issue.identifier}?`,
        description: "Archived issues are hidden from boards and lists. You can restore it later.",
        confirmLabel: "Archive",
      });
      if (!ok) return;
    }
    try {
      await archiveIssue(issue.id, archiving);
      toast.success(archiving ? "Issue archived" : "Issue restored");
      if (archiving) closeIssue();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update issue");
    }
  }

  async function handleDelete() {
    if (!issue) return;
    const ok = await confirmAction({
      title: `Delete ${issue.identifier}?`,
      description: "This issue and all its comments and activity will be permanently deleted.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteIssue(issue.id);
      toast.success("Issue deleted");
      closeIssue();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete issue");
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l border-border bg-bg sm:max-w-2xl"
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
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      aria-label="More actions"
                      className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={6}
                      className="z-50 w-44 overflow-hidden rounded-md border border-border bg-bg p-1 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                    >
                      <DropdownMenu.Item
                        onSelect={handleDuplicate}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-fg outline-none data-[highlighted]:bg-surface-hover"
                      >
                        <Copy size={13} /> Duplicate
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={handleArchiveToggle}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-fg outline-none data-[highlighted]:bg-surface-hover"
                      >
                        {issue.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                        {issue.archived ? "Restore from archive" : "Archive"}
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        onSelect={handleDelete}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-[#e5484d] outline-none data-[highlighted]:bg-[#e5484d]/10"
                      >
                        <Trash2 size={13} /> Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
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
                minHeight={120}
                fullFeatured
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
                  <div className="flex items-center gap-1.5">
                    <StatusIcon size={14} style={{ color: issue.status.color }} />
                    <select
                      value={issue.status.id}
                      onChange={(e) => handleMove(e.target.value)}
                      className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none"
                    >
                      {statusColumns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
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

                <PropertyRow label="Cycle">
                  <select
                    value={issue.cycleId ?? ""}
                    onChange={(e) => handleUpdate({ cycleId: e.target.value || null })}
                    disabled={projectCycles.length === 0}
                    className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none disabled:opacity-50"
                  >
                    <option value="">No cycle</option>
                    {projectCycles.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </option>
                    ))}
                  </select>
                </PropertyRow>

                <PropertyRow label="Due date">
                  <div className="flex items-center gap-1.5">
                    {isOverdue && (
                      <span className="text-[10px] font-medium text-[#e5484d]">Overdue</span>
                    )}
                    <input
                      type="date"
                      value={issue.dueDate?.slice(0, 10) ?? ""}
                      onChange={(e) =>
                        handleUpdate({ dueDate: e.target.value ? e.target.value : null })
                      }
                      className="rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none"
                    />
                  </div>
                </PropertyRow>

                <PropertyRow label="Blocked by">
                  <select
                    value={issue.blockedById ?? ""}
                    onChange={(e) => handleUpdate({ blockedById: e.target.value || null })}
                    className="max-w-[60%] rounded border border-border bg-surface px-2 py-1 text-xs text-fg outline-none"
                  >
                    <option value="">Not blocked</option>
                    {blockerCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.identifier} — {candidate.title}
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
                  label={`Comments${comments.length ? ` (${comments.length})` : ""}`}
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
                  <DiscussionThread
                    items={comments}
                    currentUserId={currentUser?.id}
                    onSubmit={(body, parentId, attachments) =>
                      addComment(issue.id, body, parentId, attachments)
                    }
                    onEdit={(commentId, body) => updateComment(issue.id, commentId, body)}
                    onDelete={(commentId) => deleteComment(issue.id, commentId)}
                    onToggleReaction={(commentId, emoji) =>
                      toggleCommentReaction(issue.id, commentId, emoji)
                    }
                    emptyMessage="No comments yet — start the conversation."
                    placeholder="Leave a comment... use @ to mention someone"
                  />
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
