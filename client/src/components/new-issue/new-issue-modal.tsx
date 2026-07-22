"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { api, ApiError } from "@/lib/api-client";
import { PRIORITY_LABEL, type IssuePriority } from "@/lib/types";
import { useProjectStatusColumns } from "@/lib/hooks/use-project-status-columns";
import { cn, isEmptyHtml } from "@/lib/utils";

const PRIORITIES: IssuePriority[] = ["no_priority", "low", "medium", "high", "urgent", "critical"];
const LABEL_COLOR: Record<string, string> = {
  Infra: "#5e9bd6",
  "CI/CD": "#5e9bd6",
  Frontend: "#e8a53f",
  Backend: "#c25b8f",
  Product: "#8b8fa3",
};

export function NewIssueModal() {
  const open = useUIStore((s) => s.newIssueOpen);
  const setOpen = useUIStore((s) => s.setNewIssueOpen);
  const requestedProjectId = useUIStore((s) => s.newIssueProjectId);
  const createIssue = useIssuesStore((s) => s.createIssue);
  const saveDraft = useIssuesStore((s) => s.saveDraft);
  const projects = useProjectsStore((s) => s.projects);
  const ASSIGNEE_OPTIONS = useMembersStore((s) => s.members);

  const newIssueProjectId = projects.some((p) => p.id === requestedProjectId)
    ? requestedProjectId
    : projects[0]?.id ?? "";
  const statusColumns = useProjectStatusColumns(newIssueProjectId || undefined);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("no_priority");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [createMore, setCreateMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ labels: string[]; reasoning: string } | null>(
    null
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatusId("");
    setPriority("no_priority");
    setAssigneeId("");
    setAiSuggestion(null);
  }

  async function handleAiSuggest() {
    if (!title.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await api.post<{ labels: string[]; reasoning: string }>("/issues/ai-suggest", {
        title,
      });
      setAiSuggestion(result);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to get AI suggestion");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSaveDraft() {
    const trimmed = title.trim();
    if (!trimmed || !newIssueProjectId) return;

    try {
      await saveDraft({
        title: trimmed,
        description: isEmptyHtml(description) ? undefined : description,
        projectId: newIssueProjectId,
        priority,
      });
      toast.success("Saved to drafts");
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save draft");
    }
  }

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed || !newIssueProjectId) return;

    setSubmitting(true);
    try {
      const issue = await createIssue({
        title: trimmed,
        description: isEmptyHtml(description) ? undefined : description,
        statusId: statusId || undefined,
        priority,
        projectId: newIssueProjectId,
        assigneeId: assigneeId || undefined,
        labels: aiSuggestion
          ? aiSuggestion.labels.map((name) => ({ name, color: LABEL_COLOR[name] ?? "#8b8fa3" }))
          : undefined,
        aiSuggestedLabels: aiSuggestion?.labels,
        aiSuggestedReasoning: aiSuggestion?.reasoning,
      });

      toast.success(`${issue.identifier} created`);

      if (createMore) {
        resetForm();
      } else {
        resetForm();
        setOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/40"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.15 }}
                className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <Dialog.Title className="text-xs font-medium text-fg-secondary">
                    New issue ·{" "}
                    {projects.find((p) => p.id === newIssueProjectId)?.name ?? "Engineering"}
                  </Dialog.Title>
                  <span className="text-xs text-fg-secondary">
                    {projects.find((p) => p.id === newIssueProjectId)?.teamKey ?? ""}
                  </span>
                </div>
                <Dialog.Description className="sr-only">
                  Fill in the details to create a new issue.
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Issue title"
                      className="w-full border-none bg-transparent text-lg font-medium text-fg placeholder:text-fg-tertiary outline-none"
                    />
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Add a description..."
                      className="mt-4"
                      minHeight={140}
                      fullFeatured
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAiSuggest}
                      disabled={!title.trim() || aiLoading}
                      className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40"
                    >
                      {aiLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      Suggest labels with AI
                    </button>

                    {aiSuggestion && (
                      <div className="mt-2 flex items-start gap-2 rounded-md border border-border bg-bg-secondary p-3">
                        <Sparkles size={13} className="mt-0.5 shrink-0 text-fg-secondary" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-fg">
                            Suggested labels: {aiSuggestion.labels.join(", ")}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-fg-secondary">
                            {aiSuggestion.reasoning}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 rounded-md border border-border p-3">
                    <PropertyField label="Status">
                      <select
                        value={statusId || statusColumns[0]?.id || ""}
                        onChange={(e) => setStatusId(e.target.value)}
                        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-fg outline-none"
                      >
                        {statusColumns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </PropertyField>

                    <PropertyField label="Priority">
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as IssuePriority)}
                        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-fg outline-none"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {PRIORITY_LABEL[p]}
                          </option>
                        ))}
                      </select>
                    </PropertyField>

                    <PropertyField label="Assignee">
                      <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-fg outline-none"
                      >
                        <option value="">Unassigned</option>
                        {ASSIGNEE_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </PropertyField>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <label className="flex items-center gap-1.5 text-xs text-fg-secondary">
                    <input
                      type="checkbox"
                      checked={createMore}
                      onChange={(e) => setCreateMore(e.target.checked)}
                      className="size-3.5 rounded border-border-strong accent-[var(--fg)]"
                    />
                    Create more
                  </label>

                  <div className="flex items-center gap-2">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
                      >
                        Discard
                      </button>
                    </Dialog.Close>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={!title.trim()}
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40"
                    >
                      Save as draft
                    </button>
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={!title.trim() || submitting}
                      className={cn(
                        "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                        (!title.trim() || submitting) && "opacity-40"
                      )}
                    >
                      Create issue
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function PropertyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-fg-secondary">{label}</span>
      {children}
    </div>
  );
}
