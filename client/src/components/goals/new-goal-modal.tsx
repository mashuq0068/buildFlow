"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useGoalsStore } from "@/lib/stores/goals-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { ApiError } from "@/lib/api-client";
import type { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEFAULT_TARGET_DATE = "2026-09-01";

export function NewGoalModal({
  open,
  onOpenChange,
  editGoal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGoal?: Goal | null;
}) {
  const projects = useProjectsStore((s) => s.projects);
  const createGoal = useGoalsStore((s) => s.createGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const members = useMembersStore((s) => s.members);
  const isEditing = Boolean(editGoal);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [ownerId, setOwnerId] = useState("");
  const [targetDate, setTargetDate] = useState(DEFAULT_TARGET_DATE);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editGoal) {
      setTitle(editGoal.title);
      setDescription(editGoal.description ?? "");
      setProjectId(editGoal.projectId);
      setOwnerId(editGoal.owner?.id ?? "");
      setTargetDate(editGoal.targetDate);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editGoal]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setProjectId(projects[0]?.id ?? "");
    setOwnerId("");
    setTargetDate(DEFAULT_TARGET_DATE);
  }

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed || !projectId) return;

    setCreating(true);
    try {
      if (editGoal) {
        await updateGoal(editGoal.id, {
          title: trimmed,
          description: description.trim() || undefined,
          ownerId: ownerId || null,
          targetDate,
        });
        toast.success("Goal updated");
      } else {
        await createGoal({
          title: trimmed,
          description: description.trim() || undefined,
          projectId,
          ownerId: ownerId || undefined,
          targetDate,
        });
        toast.success("Goal created");
      }
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : `Failed to ${editGoal ? "update" : "create"} goal`
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!editGoal) return;
    if (!window.confirm(`Delete "${editGoal.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteGoal(editGoal.id);
      toast.success("Goal deleted");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete goal");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
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
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <Dialog.Title className="text-sm font-medium text-fg">
                    {isEditing ? "Edit goal" : "New goal"}
                  </Dialog.Title>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="Delete goal"
                      className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-[#e5484d] disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <Dialog.Description className="sr-only">
                  {isEditing ? "Edit this goal." : "Create a new goal tied to a project."}
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Title</label>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ship the onboarding redesign"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does success look like?"
                      rows={2}
                      className="mt-1 w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Project</label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        disabled={isEditing}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none disabled:opacity-50"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Owner</label>
                      <select
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      >
                        <option value="">Unassigned</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Target date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !projectId || creating}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      (!title.trim() || !projectId || creating) && "opacity-40"
                    )}
                  >
                    {isEditing ? "Save changes" : "Create goal"}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
