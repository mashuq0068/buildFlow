"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { ApiError } from "@/lib/api-client";
import type { Project } from "@/lib/types";

export function ManageMembersModal({
  project,
  onOpenChange,
}: {
  project: Project | null;
  onOpenChange: (open: boolean) => void;
}) {
  const workspaceMembers = useMembersStore((s) => s.members);
  const addProjectMembers = useProjectsStore((s) => s.addProjectMembers);
  const removeProjectMember = useProjectsStore((s) => s.removeProjectMember);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const open = Boolean(project);
  const memberIds = new Set(project?.memberIds ?? []);
  const nonMembers = workspaceMembers.filter((m) => !memberIds.has(m.id));

  async function handleAdd(userId: string) {
    if (!project) return;
    setPendingId(userId);
    try {
      await addProjectMembers(project.id, [userId]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add member");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(userId: string) {
    if (!project) return;
    setPendingId(userId);
    try {
      await removeProjectMember(project.id, userId);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove member");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && project && (
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
                    {project.name} members
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Close"
                      className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg"
                    >
                      <X size={15} />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Add or remove members from this project.
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-fg-secondary">
                      On this project ({workspaceMembers.filter((m) => memberIds.has(m.id)).length})
                    </p>
                    <div className="flex flex-col gap-1">
                      {workspaceMembers
                        .filter((m) => memberIds.has(m.id))
                        .map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium ring-1 ring-border">
                              {m.initials}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-fg">{m.name}</span>
                            {project.lead?.id === m.id ? (
                              <span className="shrink-0 text-[10px] text-fg-tertiary">Lead</span>
                            ) : (
                              <button
                                type="button"
                                disabled={pendingId === m.id}
                                onClick={() => handleRemove(m.id)}
                                className="shrink-0 text-xs text-fg-secondary hover:text-[#e5484d] disabled:opacity-40"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {nonMembers.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-fg-secondary">Add members</p>
                      <div className="flex flex-col gap-1">
                        {nonMembers.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium ring-1 ring-border">
                              {m.initials}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-fg">{m.name}</span>
                            <button
                              type="button"
                              disabled={pendingId === m.id}
                              onClick={() => handleAdd(m.id)}
                              className="shrink-0 text-xs text-fg-secondary hover:text-fg disabled:opacity-40"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
