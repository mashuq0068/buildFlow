"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function AddToRoadmapModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const projects = useProjectsStore((s) => s.projects);
  const updateProject = useProjectsStore((s) => s.updateProject);

  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [startDate, setStartDate] = useState("2026-07-15");
  const [targetDate, setTargetDate] = useState("2026-08-15");

  const selected = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!open) return;
    const project = projects.find((p) => p.id === projectId) ?? projects[0];
    if (project) {
      setProjectId(project.id);
      setStartDate(project.startDate ?? "2026-07-15");
      setTargetDate(project.targetDate ?? "2026-08-15");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [open]);

  function handleProjectChange(id: string) {
    setProjectId(id);
    const project = projects.find((p) => p.id === id);
    setStartDate(project?.startDate ?? "2026-07-15");
    setTargetDate(project?.targetDate ?? "2026-08-15");
  }

  async function handleSave() {
    if (!projectId) return;
    try {
      await updateProject(projectId, { startDate, targetDate });
      toast.success(`${selected?.name ?? "Project"} added to roadmap`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update project");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                <div className="border-b border-border px-5 py-3">
                  <Dialog.Title className="text-sm font-medium text-fg">
                    Add to roadmap
                  </Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">
                  Set a project's timeframe so it appears on the roadmap.
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Project</label>
                    <select
                      value={projectId}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
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
                      <label className="text-xs text-fg-secondary">Target date</label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-fg-tertiary">
                    This updates the project&apos;s own start/target dates — the same dates shown
                    on its project page.
                  </p>
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
                    onClick={handleSave}
                    disabled={!projectId}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      !projectId && "opacity-40"
                    )}
                  >
                    Save to roadmap
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
