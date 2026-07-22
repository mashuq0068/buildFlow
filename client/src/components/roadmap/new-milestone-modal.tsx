"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMilestonesStore } from "@/lib/stores/milestones-store";
import { ApiError } from "@/lib/api-client";
import { confirmAction } from "@/lib/stores/confirm-store";
import type { Milestone } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEFAULT_TARGET_DATE = "2026-09-01";

export function NewMilestoneModal({
  open,
  onOpenChange,
  editMilestone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMilestone?: Milestone | null;
}) {
  const projects = useProjectsStore((s) => s.projects);
  const createMilestone = useMilestonesStore((s) => s.createMilestone);
  const updateMilestone = useMilestonesStore((s) => s.updateMilestone);
  const deleteMilestone = useMilestonesStore((s) => s.deleteMilestone);
  const isEditing = Boolean(editMilestone);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [targetDate, setTargetDate] = useState(DEFAULT_TARGET_DATE);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editMilestone) {
      setTitle(editMilestone.title);
      setDescription(editMilestone.description ?? "");
      setProjectId(editMilestone.projectId);
      setTargetDate(editMilestone.targetDate);
      setCompleted(editMilestone.completed);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editMilestone]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setProjectId(projects[0]?.id ?? "");
    setTargetDate(DEFAULT_TARGET_DATE);
    setCompleted(false);
  }

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed || !projectId) return;

    setSaving(true);
    try {
      if (editMilestone) {
        await updateMilestone(editMilestone.id, {
          title: trimmed,
          description: description.trim() || undefined,
          targetDate,
          completed,
        });
        toast.success("Milestone updated");
      } else {
        await createMilestone({
          title: trimmed,
          description: description.trim() || undefined,
          projectId,
          targetDate,
        });
        toast.success("Milestone created");
      }
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : `Failed to ${editMilestone ? "update" : "create"} milestone`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editMilestone) return;
    const ok = await confirmAction({
      title: `Delete "${editMilestone.title}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteMilestone(editMilestone.id);
      toast.success("Milestone deleted");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete milestone");
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
                    {isEditing ? "Edit milestone" : "New milestone"}
                  </Dialog.Title>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="Delete milestone"
                      className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-[#e5484d] disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <Dialog.Description className="sr-only">
                  {isEditing ? "Edit this milestone." : "Create a new milestone tied to a project."}
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Title</label>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Public beta launch"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does this checkpoint mark?"
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
                      <label className="text-xs text-fg-secondary">Target date</label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <label className="flex items-center gap-2 text-xs text-fg-secondary">
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => setCompleted(e.target.checked)}
                        className="size-3.5 accent-accent"
                      />
                      Reached
                    </label>
                  )}
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
                    disabled={!title.trim() || !projectId || saving}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      (!title.trim() || !projectId || saving) && "opacity-40"
                    )}
                  >
                    {isEditing ? "Save changes" : "Create milestone"}
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
