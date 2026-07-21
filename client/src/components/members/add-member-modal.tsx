"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useMembersStore } from "@/lib/stores/members-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AddMemberModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const members = useMembersStore((s) => s.members);
  const addMember = useMembersStore((s) => s.addMember);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<Role>("member");

  function resetForm() {
    setName("");
    setEmail("");
    setTitle("");
    setRole("member");
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("A member with that name already exists");
      return;
    }

    addMember({
      name: trimmed,
      initials: initialsFor(trimmed),
      role,
      email: email.trim() || undefined,
      title: title.trim() || undefined,
    });
    toast.success(`${trimmed} added to the workspace`);
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
                  <Dialog.Title className="text-sm font-medium text-fg">Add member</Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">
                  Invite a new member to the workspace (demo only, no email is sent).
                </Dialog.Description>

                <div className="flex flex-col gap-4 px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Full name</label>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sam Okafor"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sam@acme.dev"
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Job title</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Backend Engineer"
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm capitalize text-fg outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <p className="text-[11px] leading-relaxed text-fg-tertiary">
                    Demo only — this adds a local member record, no invite email is sent.
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
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      !name.trim() && "opacity-40"
                    )}
                  >
                    Add member
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
