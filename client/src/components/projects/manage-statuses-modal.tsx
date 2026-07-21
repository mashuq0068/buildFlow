"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import { useStatusesStore } from "@/lib/stores/statuses-store";
import { STATUS_ICONS, STATUS_ICON_NAMES, DefaultStatusIcon } from "@/lib/status-icons";
import { ApiError } from "@/lib/api-client";
import { confirmAction } from "@/lib/stores/confirm-store";
import {
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  type Project,
  type StatusCategory,
  type IssueStatusOption,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  "#6e79d6",
  "#e8a53f",
  "#4cb782",
  "#5e9bd6",
  "#c25b8f",
  "#9b6bd6",
  "#e5484d",
  "#6b7280",
  "#8b8fa3",
  "#f2994a",
];

interface FormState {
  name: string;
  color: string;
  icon: string;
  category: StatusCategory;
}

const EMPTY_FORM: FormState = { name: "", color: COLOR_OPTIONS[0], icon: "Circle", category: "unstarted" };

export function ManageStatusesModal({
  project,
  onOpenChange,
}: {
  project: Project | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = Boolean(project);
  const statuses = useStatusesStore((s) => (project ? s.byProject[project.id] : undefined)) ?? [];
  const fetchStatuses = useStatusesStore((s) => s.fetchStatuses);
  const createStatus = useStatusesStore((s) => s.createStatus);
  const updateStatus = useStatusesStore((s) => s.updateStatus);
  const deleteStatus = useStatusesStore((s) => s.deleteStatus);
  const reorderStatuses = useStatusesStore((s) => s.reorderStatuses);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const sorted = statuses.slice().sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (project) fetchStatuses(project.id).catch(() => toast.error("Failed to load statuses"));
  }, [project, fetchStatuses]);

  function startEdit(status: IssueStatusOption) {
    setCreating(false);
    setEditingId(status.id);
    setForm({ name: status.name, color: status.color, icon: status.icon, category: status.category });
  }

  function startCreate() {
    setEditingId(null);
    setCreating(true);
    setForm(EMPTY_FORM);
  }

  function cancelForm() {
    setEditingId(null);
    setCreating(false);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!project || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateStatus(project.id, editingId, form);
        toast.success("Status updated");
      } else {
        await createStatus(project.id, form);
        toast.success("Status created");
      }
      cancelForm();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save status");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(status: IssueStatusOption) {
    if (!project) return;
    const ok = await confirmAction({
      title: `Delete "${status.name}"?`,
      description: "Issues using this status must be moved first.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteStatus(project.id, status.id);
      toast.success("Status deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete status");
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    if (!project) return;
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const reordered = sorted.map((s) => s.id);
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try {
      await reorderStatuses(project.id, reordered);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reorder statuses");
    }
  }

  const showForm = creating || editingId !== null;

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
                className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <Dialog.Title className="text-sm font-medium text-fg">
                    {project.name} statuses
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
                  Create, edit, reorder, and delete this project's issue statuses.
                </Dialog.Description>

                <div className="flex flex-col gap-1 px-5 py-4">
                  {sorted.map((status, index) => {
                    const Icon = STATUS_ICONS[status.icon] ?? DefaultStatusIcon;
                    return (
                      <div
                        key={status.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover"
                      >
                        <div className="flex shrink-0 flex-col">
                          <button
                            type="button"
                            onClick={() => handleMove(index, -1)}
                            disabled={index === 0}
                            className="text-fg-tertiary hover:text-fg disabled:opacity-20"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 1)}
                            disabled={index === sorted.length - 1}
                            className="text-fg-tertiary hover:text-fg disabled:opacity-20"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <span style={{ color: status.color }}>
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-fg">{status.name}</span>
                        <span className="shrink-0 text-[10px] text-fg-tertiary">
                          {CATEGORY_LABEL[status.category]}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(status)}
                          className="shrink-0 rounded p-1 text-fg-tertiary hover:bg-surface-hover hover:text-fg"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(status)}
                          className="shrink-0 rounded p-1 text-fg-tertiary hover:bg-surface-hover hover:text-[#e5484d]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}

                  {!showForm && (
                    <button
                      type="button"
                      onClick={startCreate}
                      className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
                    >
                      <Plus size={13} /> New status
                    </button>
                  )}

                  {showForm && (
                    <div className="mt-2 flex flex-col gap-3 rounded-md border border-border p-3">
                      <input
                        autoFocus
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Status name"
                        className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                      />

                      <div>
                        <label className="text-xs text-fg-secondary">Category</label>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, category: e.target.value as StatusCategory }))
                          }
                          className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg outline-none"
                        >
                          {CATEGORY_ORDER.map((c) => (
                            <option key={c} value={c}>
                              {CATEGORY_LABEL[c]}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[11px] text-fg-tertiary">
                          Determines progress-bar and &quot;done&quot; behavior across the app.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-fg-secondary">Color</label>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              aria-label={`Color ${c}`}
                              onClick={() => setForm((f) => ({ ...f, color: c }))}
                              className={cn(
                                "size-6 rounded-full ring-offset-2 ring-offset-bg transition-shadow",
                                form.color === c && "ring-2 ring-fg"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-fg-secondary">Icon</label>
                        <div className="mt-1.5 grid grid-cols-8 gap-1">
                          {STATUS_ICON_NAMES.map((name) => {
                            const Icon = STATUS_ICONS[name];
                            return (
                              <button
                                key={name}
                                type="button"
                                aria-label={name}
                                onClick={() => setForm((f) => ({ ...f, icon: name }))}
                                className={cn(
                                  "flex size-8 items-center justify-center rounded-md border transition-colors",
                                  form.icon === name
                                    ? "border-fg text-fg"
                                    : "border-border text-fg-tertiary hover:bg-surface-hover"
                                )}
                              >
                                <Icon size={14} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelForm}
                          className="rounded-md border border-border px-3 py-1.5 text-xs text-fg-secondary hover:bg-surface-hover"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={!form.name.trim() || saving}
                          className={cn(
                            "rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                            (!form.name.trim() || saving) && "opacity-40"
                          )}
                        >
                          {editingId ? "Save changes" : "Create status"}
                        </button>
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
