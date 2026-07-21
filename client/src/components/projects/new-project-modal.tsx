"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useCurrentUser } from "@/lib/current-user";
import { ApiError } from "@/lib/api-client";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  "#6e79d6",
  "#e8a53f",
  "#4cb782",
  "#5e9bd6",
  "#c25b8f",
  "#9b6bd6",
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

export function NewProjectModal() {
  const open = useUIStore((s) => s.newProjectOpen);
  const setOpen = useUIStore((s) => s.setNewProjectOpen);
  const createProject = useProjectsStore((s) => s.createProject);
  const members = useMembersStore((s) => s.members);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const currentUser = useCurrentUser();

  const [name, setName] = useState("");
  const [teamKey, setTeamKey] = useState("");
  const [summary, setSummary] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [leadId, setLeadId] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [startDate, setStartDate] = useState("2026-07-29");
  const [targetDate, setTargetDate] = useState("2026-08-25");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && currentUser) {
      setMemberIds((prev) => (prev.length === 0 ? [currentUser.id] : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleMember(id: string) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function resetForm() {
    setName("");
    setTeamKey("");
    setSummary("");
    setColor(COLOR_OPTIONS[0]);
    setLeadId("");
    setStatus("planning");
    setStartDate("2026-07-29");
    setTargetDate("2026-08-25");
    setMemberIds(currentUser ? [currentUser.id] : []);
  }

  async function handleCreate() {
    const trimmedName = name.trim();
    if (!trimmedName || !currentWorkspaceId) return;

    setCreating(true);
    try {
      const project = await createProject({
        name: trimmedName,
        teamKey: teamKey.trim().toUpperCase() || trimmedName.slice(0, 3).toUpperCase(),
        color,
        summary: summary.trim() || "No summary yet.",
        leadId: leadId || undefined,
        status,
        startDate,
        targetDate,
        workspaceId: currentWorkspaceId,
        memberUserIds: memberIds,
      });
      toast.success(`${project.name} project created`);
      resetForm();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
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
                className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="shrink-0 border-b border-border px-5 py-3">
                  <Dialog.Title className="text-sm font-medium text-fg">New project</Dialog.Title>
                </div>
                <Dialog.Description className="sr-only">
                  Create a new project for your workspace.
                </Dialog.Description>

                <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
                  <div>
                    <label className="text-xs text-fg-secondary">Name</label>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mobile App"
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Team key</label>
                      <input
                        value={teamKey}
                        onChange={(e) => setTeamKey(e.target.value.toUpperCase().slice(0, 5))}
                        placeholder="MOB"
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm uppercase text-fg placeholder:text-fg-tertiary outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-fg-secondary">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Summary</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="What is this project about?"
                      rows={2}
                      className="mt-1 w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-fg-secondary">Lead</label>
                    <select
                      value={leadId}
                      onChange={(e) => setLeadId(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                    >
                      <option value="">No lead yet</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
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

                  <div>
                    <label className="text-xs text-fg-secondary">Team members</label>
                    <div className="mt-1.5 flex flex-col gap-1 rounded-md border border-border p-2">
                      {members.map((m) => (
                        <label
                          key={m.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm text-fg hover:bg-surface-hover"
                        >
                          <input
                            type="checkbox"
                            checked={memberIds.includes(m.id)}
                            onChange={() => toggleMember(m.id)}
                            className="size-3.5 rounded border-border-strong accent-fg"
                          />
                          <span className="flex size-5 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium ring-1 ring-border">
                            {m.initials}
                          </span>
                          {m.name}
                        </label>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-fg-tertiary">
                      Only members and admins can see and access this project.
                    </p>
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

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-3">
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
                    disabled={!name.trim() || creating}
                    className={cn(
                      "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                      (!name.trim() || creating) && "opacity-40"
                    )}
                  >
                    Create project
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
