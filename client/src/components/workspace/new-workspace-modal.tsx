"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = ["#6e79d6", "#e8a53f", "#4cb782", "#5e9bd6", "#c25b8f", "#9b6bd6"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewWorkspaceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  function resetForm() {
    setName("");
    setColor(COLOR_OPTIONS[0]);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    let id = slugify(trimmed);
    if (!id) id = `workspace-${Date.now()}`;
    let suffix = 2;
    while (workspaces.some((w) => w.id === id)) {
      id = `${slugify(trimmed)}-${suffix}`;
      suffix += 1;
    }

    createWorkspace({ id, name: trimmed, slug: id, color });
    toast.success(`${trimmed} workspace created`);
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
                  <Dialog.Title className="text-sm font-medium text-fg">
                    Create workspace
                  </Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">
                  Create a new workspace to organize a separate set of projects and teams.
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Workspace name</label>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Acme Studio"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                    {name.trim() && (
                      <p className="mt-1 text-[11px] text-fg-tertiary">
                        linear-clone.app/{slugify(name)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Color</label>
                    <div className="mt-1.5 flex gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Color ${c}`}
                          onClick={() => setColor(c)}
                          className={cn(
                            "size-6 rounded-full ring-offset-2 ring-offset-bg transition-shadow",
                            color === c && "ring-2 ring-fg"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
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
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      !name.trim() && "opacity-40"
                    )}
                  >
                    Create workspace
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
