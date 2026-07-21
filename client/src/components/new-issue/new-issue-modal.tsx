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
import {
  STATUS_COLUMNS,
  PRIORITY_LABEL,
  type Issue,
  type Project,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/types";
import { cn, isEmptyHtml } from "@/lib/utils";

const PRIORITIES: IssuePriority[] = ["no_priority", "low", "medium", "high", "urgent"];

function nextIdentifier(issues: Issue[], projects: Project[], projectId: string) {
  const project = projects.find((p) => p.id === projectId);
  const prefix = project?.teamKey ?? "ENG";
  const max = issues
    .filter((i) => i.projectId === projectId)
    .reduce((acc, issue) => {
      const match = issue.identifier.match(/-(\d+)$/);
      return match ? Math.max(acc, Number(match[1])) : acc;
    }, 0);
  return `${prefix}-${max + 1}`;
}

export function NewIssueModal() {
  const open = useUIStore((s) => s.newIssueOpen);
  const setOpen = useUIStore((s) => s.setNewIssueOpen);
  const newIssueProjectId = useUIStore((s) => s.newIssueProjectId);
  const issues = useIssuesStore((s) => s.issues);
  const createIssue = useIssuesStore((s) => s.createIssue);
  const saveDraft = useIssuesStore((s) => s.saveDraft);
  const projects = useProjectsStore((s) => s.projects);
  const ASSIGNEE_OPTIONS = useMembersStore((s) => s.members);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("backlog");
  const [priority, setPriority] = useState<IssuePriority>("no_priority");
  const [assigneeName, setAssigneeName] = useState<string>("");
  const [createMore, setCreateMore] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ labels: string[]; reasoning: string } | null>(
    null
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("backlog");
    setPriority("no_priority");
    setAssigneeName("");
    setAiSuggestion(null);
  }

  function handleAiSuggest() {
    if (!title.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    window.setTimeout(() => {
      const guessedLabels = /ci|pipeline|deploy|infra/i.test(title)
        ? ["Infra", "CI/CD"]
        : /ui|frontend|component|design/i.test(title)
          ? ["Frontend"]
          : /api|server|database|schema/i.test(title)
            ? ["Backend"]
            : ["Product"];
      setAiSuggestion({
        labels: guessedLabels,
        reasoning: `Based on similar past issue titles, this looks like a ${guessedLabels.join(
          "/"
        )} issue. Suggested priority: ${title.length > 40 ? "Medium" : "Low"}.`,
      });
      setAiLoading(false);
    }, 700);
  }

  function handleSaveDraft() {
    const trimmed = title.trim();
    if (!trimmed) return;

    saveDraft({
      id: Math.random().toString(36).slice(2, 10),
      title: trimmed,
      description: isEmptyHtml(description) ? undefined : description,
      projectId: newIssueProjectId,
      priority,
      updatedAt: new Date().toISOString(),
    });

    toast.success("Saved to drafts");
    resetForm();
    setOpen(false);
  }

  function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const assignee = ASSIGNEE_OPTIONS.find((p) => p.name === assigneeName);
    const identifier = nextIdentifier(issues, projects, newIssueProjectId);

    createIssue({
      id: Math.random().toString(36).slice(2, 10),
      identifier,
      title: trimmed,
      description: isEmptyHtml(description) ? undefined : description,
      status,
      priority,
      projectId: newIssueProjectId,
      assignee,
      labels: aiSuggestion ? aiSuggestion.labels.map((name) => ({ name, color: "#8b8fa3" })) : undefined,
    });

    toast.success(`${identifier} created`);

    if (createMore) {
      resetForm();
    } else {
      resetForm();
      setOpen(false);
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
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <Dialog.Title className="text-xs font-medium text-fg-secondary">
                    New issue ·{" "}
                    {projects.find((p) => p.id === newIssueProjectId)?.name ?? "Engineering"}
                  </Dialog.Title>
                  <span className="text-xs text-fg-secondary">
                    {nextIdentifier(issues, projects, newIssueProjectId)}
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
                      minHeight={72}
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
                        value={status}
                        onChange={(e) => setStatus(e.target.value as IssueStatus)}
                        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-fg outline-none"
                      >
                        {STATUS_COLUMNS.map((c) => (
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
                        value={assigneeName}
                        onChange={(e) => setAssigneeName(e.target.value)}
                        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-fg outline-none"
                      >
                        <option value="">Unassigned</option>
                        {ASSIGNEE_OPTIONS.map((p) => (
                          <option key={p.name} value={p.name}>
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
                      disabled={!title.trim()}
                      className={cn(
                        "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                        !title.trim() && "opacity-40"
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
