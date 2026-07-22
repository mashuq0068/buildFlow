"use client";

import { ShieldCheck, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useMembersStore } from "@/lib/stores/members-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { ApiError } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";
import type { Role } from "@/lib/types";

const ROLE_INFO: Record<Role, { title: string; description: string }> = {
  admin: {
    title: "Admin",
    description:
      "Full access — manage workspace settings, invite and remove members, change roles, and edit or delete any project, issue, or status.",
  },
  member: {
    title: "Member",
    description:
      "Standard access — create and edit issues, comment, and participate in projects they're on. Can't change workspace settings or other members' roles.",
  },
};

export default function PermissionsPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const members = useMembersStore((s) => s.members);
  const updateMemberRole = useMembersStore((s) => s.updateMemberRole);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const isAdmin = currentUser?.role === "admin";

  async function handleRoleChange(userId: string, role: Role) {
    if (!currentWorkspaceId) return;
    try {
      await updateMemberRole(currentWorkspaceId, userId, role);
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Permissions"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(ROLE_INFO) as Role[]).map((role) => (
              <div key={role} className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-fg">
                  {role === "admin" ? <ShieldCheck size={15} /> : <User size={15} />}
                  {ROLE_INFO[role].title}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-secondary">
                  {ROLE_INFO[role].description}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-4 rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Member roles</h2>
            {!isAdmin && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-secondary">
                <Lock size={12} /> Only admins can change member roles.
              </p>
            )}
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
                          <Avatar person={person} size={20} />
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
        </main>
      </div>
    </div>
  );
}
