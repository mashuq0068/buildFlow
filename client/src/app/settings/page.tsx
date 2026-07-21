"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useMembersStore } from "@/lib/stores/members-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ApiError } from "@/lib/api-client";
import { ShieldCheck, User, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/types";

export default function SettingsPage() {
  const issues = useIssuesStore((s) => s.issues);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const members = useMembersStore((s) => s.members);
  const updateMemberRole = useMembersStore((s) => s.updateMemberRole);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const workspace = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  const [nameInput, setNameInput] = useState(workspace?.name ?? "");

  useEffect(() => {
    setNameInput(workspace?.name ?? "");
  }, [workspace?.id, workspace?.name]);

  const labels = Array.from(
    new Map(
      issues.flatMap((i) => i.labels ?? []).map((label) => [label.name, label])
    ).values()
  );

  const isAdmin = currentUser?.role === "admin";

  async function handleRoleChange(userId: string, role: Role) {
    if (!currentWorkspaceId) return;
    try {
      await updateMemberRole(currentWorkspaceId, userId, role);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  async function commitWorkspaceName() {
    const trimmed = nameInput.trim();
    if (!workspace || !trimmed || trimmed === workspace.name) {
      setNameInput(workspace?.name ?? "");
      return;
    }
    try {
      await updateWorkspace(workspace.id, { name: trimmed });
      toast.success("Workspace name updated");
    } catch (err) {
      setNameInput(workspace.name);
      toast.error(err instanceof ApiError ? err.message : "Failed to update workspace");
    }
  }

  if (!workspace) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Settings"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <section className="rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Workspace</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex-1">
                <label className="text-xs text-fg-secondary">Workspace name</label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={commitWorkspaceName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setNameInput(workspace.name);
                  }}
                  disabled={!isAdmin}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg outline-none disabled:opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-fg-secondary">Workspace URL</label>
                <input
                  value={`linear-clone.app/${workspace.slug}`}
                  disabled
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg outline-none disabled:opacity-50"
                />
              </div>
            </div>
            {!isAdmin && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-secondary">
                <Lock size={12} /> Only admins can edit workspace settings.
              </p>
            )}
          </section>

          <section className="mt-4 rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Members</h2>
            <div className="mt-3 overflow-hidden rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-fg-secondary">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((person) => {
                    const isCurrent = person.id === currentUser?.id;
                    const personRole: Role = person.role;
                    const canEdit = isAdmin && !isCurrent;
                    return (
                      <tr key={person.id} className="border-b border-border last:border-0">
                        <td className="flex items-center gap-2 px-3 py-2 text-fg">
                          <span className="flex size-5 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium ring-1 ring-border">
                            {person.initials}
                          </span>
                          {person.name}
                          {isCurrent && <span className="text-xs text-fg-secondary">(you)</span>}
                        </td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-1.5 text-xs text-fg-secondary">
                            {personRole === "admin" ? (
                              <ShieldCheck size={13} />
                            ) : (
                              <User size={13} />
                            )}
                            <span className="capitalize">{personRole}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() =>
                              handleRoleChange(person.id, personRole === "admin" ? "member" : "admin")
                            }
                            className="text-xs text-fg-secondary hover:text-fg disabled:opacity-30"
                          >
                            Make {personRole === "admin" ? "member" : "admin"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Labels</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {labels.map((label) => (
                <span
                  key={label.id}
                  className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-fg-secondary"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </span>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
