"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirmStore } from "@/lib/stores/confirm-store";
import { cn } from "@/lib/utils";

export function ConfirmDialogHost() {
  const open = useConfirmStore((s) => s.open);
  const title = useConfirmStore((s) => s.title);
  const description = useConfirmStore((s) => s.description);
  const confirmLabel = useConfirmStore((s) => s.confirmLabel);
  const cancelLabel = useConfirmStore((s) => s.cancelLabel);
  const danger = useConfirmStore((s) => s.danger);
  const handleConfirm = useConfirmStore((s) => s.handleConfirm);
  const handleCancel = useConfirmStore((s) => s.handleCancel);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && handleCancel()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] bg-black/40"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.15 }}
                className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="px-5 py-4">
                  <Dialog.Title className="text-sm font-medium text-fg">{title}</Dialog.Title>
                  {description && (
                    <Dialog.Description className="mt-1.5 text-xs leading-relaxed text-fg-secondary">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    autoFocus
                    onClick={handleConfirm}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90",
                      danger ? "bg-[#e5484d] text-white" : "bg-accent text-accent-fg"
                    )}
                  >
                    {confirmLabel}
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
