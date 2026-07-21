"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useGoalsStore } from "@/lib/stores/goals-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useCurrentUser } from "@/lib/current-user";
import { isProjectVisible } from "@/lib/project-visibility";
import { cn } from "@/lib/utils";

export function NewGoalModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const currentUser = useCurrentUser();
  const allProjects = useProjectsStore((s) => s.projects);
  const projects = allProjects.filter((p) =>
    isProjectVisible(p, currentUser?.name, currentUser?.role)
  );
  const goals = useGoalsStore((s) => s.goals);
  const createGoal = useGoalsStore((s) => s.createGoal);
  const members = useMembersStore((s) => s.members);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [ownerName, setOwnerName] = useState("");
  const [targetDate, setTargetDate] = useState("2026-09-01");

  function resetForm() {
    setTitle("");
    setDescription("");
    setProjectId(projects[0]?.id ?? "");
    setOwnerName("");
    setTargetDate("2026-09-01");
  }

  function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed || !projectId) return;

    let id = `goal-${Date.now()}`;
    while (goals.some((g) => g.id === id)) id = `goal-${Date.now()}-${Math.random()}`;

    const owner = members.find((m) => m.name === ownerName);

    createGoal({
      id,
      title: trimmed,
      description: description.trim() || undefined,
      projectId,
      owner,
      targetDate,
    });
    toast.success("Goal created");
    resetForm();
    onOpenChange(false);
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
                <div className="border-b border-border px-5 py-3">
                  <Dialog.Title className="text-sm font-medium text-fg">New goal</Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">
                  Create a new goal tied to a project.
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
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
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
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      >
                        <option value="">Unassigned</option>
                        {members.map((m) => (
                          <option key={m.name} value={m.name}>
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
                    onClick={handleCreate}
                    disabled={!title.trim() || !projectId}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      (!title.trim() || !projectId) && "opacity-40"
                    )}
                  >
                    Create goal
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
