"use client";

import { useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { confirmAction } from "@/lib/stores/confirm-store";
import type { BoardColumn } from "@/components/board/kanban-board";
import type { Person } from "@/lib/types";

export function BulkActionBar({
  selectedIds,
  columns,
  members,
  onClear,
}: {
  selectedIds: string[];
  columns: BoardColumn[];
  members: Person[];
  onClear: () => void;
}) {
  const moveIssue = useIssuesStore((s) => s.moveIssue);
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const deleteIssue = useIssuesStore((s) => s.deleteIssue);
  const [pending, setPending] = useState(false);

  async function runBulk(label: string, fn: (id: string) => Promise<void>) {
    setPending(true);
    const results = await Promise.allSettled(selectedIds.map(fn));
    const failed = results.filter((r) => r.status === "rejected").length;
    setPending(false);
    if (failed === 0) {
      toast.success(`${label} for ${selectedIds.length} issue${selectedIds.length > 1 ? "s" : ""}`);
      onClear();
    } else {
      toast.error(`${label} failed for ${failed} of ${selectedIds.length} issues`);
    }
  }

  async function handleStatusChange(statusId: string) {
    if (!statusId) return;
    await runBulk("Status updated", (id) => moveIssue(id, statusId));
  }

  async function handleAssign(assigneeId: string) {
    await runBulk("Assignee updated", (id) => updateIssue(id, { assigneeId: assigneeId || null }));
  }

  async function handleDelete() {
    const ok = await confirmAction({
      title: `Delete ${selectedIds.length} issue${selectedIds.length > 1 ? "s" : ""}?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    await runBulk("Deleted", (id) => deleteIssue(id));
  }

  return (
    <div className="flex items-center gap-2 border-b border-border bg-bg-secondary px-3 py-2">
      <span className="text-xs font-medium text-fg">{selectedIds.length} selected</span>

      <select
        defaultValue=""
        disabled={pending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-fg outline-none disabled:opacity-50"
      >
        <option value="" disabled>
          Move to status...
        </option>
        {columns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        defaultValue=""
        disabled={pending}
        onChange={(e) => handleAssign(e.target.value)}
        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-fg outline-none disabled:opacity-50"
      >
        <option value="" disabled>
          Assign to...
        </option>
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#e5484d] transition-colors hover:bg-[#e5484d]/10 disabled:opacity-50"
      >
        <Trash2 size={12} />
        Delete
      </button>

      {pending && <Loader2 size={13} className="animate-spin text-fg-secondary" />}

      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
      >
        <X size={12} />
        Clear
      </button>
    </div>
  );
}
