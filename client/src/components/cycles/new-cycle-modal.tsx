"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useCyclesStore } from "@/lib/stores/cycles-store";
import { ApiError } from "@/lib/api-client";
import { confirmAction } from "@/lib/stores/confirm-store";
import type { Cycle } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEFAULT_START = "2026-07-29";
const DEFAULT_END = "2026-08-11";

export function NewCycleModal({
  open,
  onOpenChange,
  editCycle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCycle?: Cycle | null;
}) {
  const projects = useProjectsStore((s) => s.projects);
  const createCycle = useCyclesStore((s) => s.createCycle);
  const updateCycle = useCyclesStore((s) => s.updateCycle);
  const deleteCycle = useCyclesStore((s) => s.deleteCycle);
  const isEditing = Boolean(editCycle);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [startDate, setStartDate] = useState(DEFAULT_START);
  const [endDate, setEndDate] = useState(DEFAULT_END);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editCycle) {
      setName(editCycle.name);
      setDescription(editCycle.description ?? "");
      setProjectId(editCycle.projectId);
      setStartDate(editCycle.startDate);
      setEndDate(editCycle.endDate);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editCycle]);

  function resetForm() {
    setName("");
    setDescription("");
    setProjectId(projects[0]?.id ?? "");
    setStartDate(DEFAULT_START);
    setEndDate(DEFAULT_END);
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || !projectId) return;

    setCreating(true);
    try {
      if (editCycle) {
        await updateCycle(editCycle.id, {
          name: trimmed,
          description: description.trim() || undefined,
          startDate,
          endDate,
        });
        toast.success(`${trimmed} updated`);
      } else {
        await createCycle({
          name: trimmed,
          description: description.trim() || undefined,
          projectId,
          startDate,
          endDate,
        });
        toast.success(`${trimmed} created`);
      }
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : `Failed to ${editCycle ? "update" : "create"} cycle`
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!editCycle) return;
    const ok = await confirmAction({
      title: `Delete ${editCycle.name}?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteCycle(editCycle.id);
      toast.success(`${editCycle.name} deleted`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete cycle");
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
                    {isEditing ? "Edit cycle" : "New cycle"}
                  </Dialog.Title>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="Delete cycle"
                      className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-[#e5484d] disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <Dialog.Description className="sr-only">
                  {isEditing ? "Edit this cycle." : "Create a new cycle for planning a sprint."}
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Name</label>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Cycle 26"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this cycle focused on?"
                      rows={2}
                      className="mt-1 w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div>
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

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Start date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">End date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      />
                    </div>
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
                    disabled={!name.trim() || !projectId || creating}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      (!name.trim() || !projectId || creating) && "opacity-40"
                    )}
                  >
                    {isEditing ? "Save changes" : "Create cycle"}
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
