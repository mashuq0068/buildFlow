"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ApiError } from "@/lib/api-client";
import { PRIORITY_LABEL, type Draft, type IssuePriority } from "@/lib/types";
import { cn, isEmptyHtml } from "@/lib/utils";

const PRIORITIES: IssuePriority[] = ["no_priority", "low", "medium", "high", "urgent"];

export function EditDraftModal({
  draft,
  onOpenChange,
}: {
  draft: Draft | null;
  onOpenChange: (open: boolean) => void;
}) {
  const updateDraft = useIssuesStore((s) => s.updateDraft);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("no_priority");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setDescription(draft.description ?? "");
      setPriority(draft.priority);
    }
  }, [draft]);

  const open = Boolean(draft);

  async function handleSave() {
    if (!draft) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await updateDraft(draft.id, {
        title: trimmed,
        description: isEmptyHtml(description) ? undefined : description,
        priority,
      });
      toast.success("Draft updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update draft");
    } finally {
      setSaving(false);
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
                className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="border-b border-border px-5 py-3">
                  <Dialog.Title className="text-sm font-medium text-fg">Edit draft</Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">Edit this draft issue.</Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
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
                    minHeight={72}
                    fullFeatured
                  />
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                    <span className="text-xs text-fg-secondary">Priority</span>
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
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      (!title.trim() || saving) && "opacity-40"
                    )}
                  >
                    Save changes
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
