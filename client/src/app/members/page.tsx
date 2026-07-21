"use client";

import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AddMemberModal } from "@/components/members/add-member-modal";
import { InviteMemberModal } from "@/components/members/invite-member-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useInvitesStore, type InviteStatus } from "@/lib/stores/invites-store";
import { ApiError } from "@/lib/api-client";
import { confirmAction } from "@/lib/stores/confirm-store";
import { ShieldCheck, User, Plus, Mail, RotateCw, X, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const STATUS_BADGE: Record<InviteStatus, string> = {
  pending: "text-fg-secondary",
  accepted: "text-[#4cb782]",
  expired: "text-fg-tertiary",
  cancelled: "text-fg-tertiary",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function MembersPage() {
  const issues = useIssuesStore((s) => s.issues);
  const projects = useProjectsStore((s) => s.projects);
  const members = useMembersStore((s) => s.members);
  const updateMemberRole = useMembersStore((s) => s.updateMemberRole);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const invites = useInvitesStore((s) => s.invites);
  const fetchInvites = useInvitesStore((s) => s.fetchInvites);
  const resendInvite = useInvitesStore((s) => s.resendInvite);
  const cancelInvite = useInvitesStore((s) => s.cancelInvite);

  const isAdmin = currentUser?.role === "admin";

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((person) => {
      if (roleFilter !== "all" && person.role !== roleFilter) return false;
      if (!q) return true;
      return (
        person.name.toLowerCase().includes(q) ||
        person.email?.toLowerCase().includes(q) ||
        person.title?.toLowerCase().includes(q)
      );
    });
  }, [members, search, roleFilter]);

  useEffect(() => {
    if (isAdmin && currentWorkspaceId) {
      fetchInvites(currentWorkspaceId).catch(() => toast.error("Failed to load invitations"));
    }
  }, [isAdmin, currentWorkspaceId, fetchInvites]);

  async function handleRoleChange(userId: string, role: Role) {
    if (!currentWorkspaceId) return;
    try {
      await updateMemberRole(currentWorkspaceId, userId, role);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  async function handleResend(inviteId: string) {
    if (!currentWorkspaceId) return;
    try {
      await resendInvite(currentWorkspaceId, inviteId);
      toast.success("Invitation resent");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to resend invitation");
    }
  }

  async function handleCancel(inviteId: string, email: string) {
    if (!currentWorkspaceId) return;
    const ok = await confirmAction({
      title: `Cancel invitation to ${email}?`,
      description: "They will no longer be able to use this invite link.",
      confirmLabel: "Cancel invitation",
      danger: true,
    });
    if (!ok) return;
    try {
      await cancelInvite(currentWorkspaceId, inviteId);
      toast.success("Invitation cancelled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to cancel invitation");
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Members"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-fg-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-52 rounded-md border border-border bg-surface py-1.5 pl-7 pr-2 text-xs text-fg placeholder:text-fg-tertiary outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
            >
              <option value="all">Any role</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            {isAdmin && (
              <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-hover"
              >
                <Mail size={13} />
                Invite Member
              </button>
              <button
                type="button"
                onClick={() => setAddMemberOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                <Plus size={13} />
                Add Member
              </button>
              </div>
            )}
          </div>

          {filteredMembers.length === 0 ? (
            <EmptyState icon={Search} title="No members match your search" />
          ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((person) => {
              const isCurrent = person.id === currentUser?.id;
              const personRole: Role = person.role;
              const assigned = issues.filter((i) => i.assignee?.id === person.id);
              const done = assigned.filter((i) => i.status.category === "completed").length;
              const projectIds = Array.from(new Set(assigned.map((i) => i.projectId)));
              const memberProjects = projects.filter((p) => projectIds.includes(p.id));
              const canEditRole = isAdmin && !isCurrent;

              return (
                <div key={person.id} className="rounded-md border border-border bg-surface p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-surface-hover text-xs font-medium text-fg ring-1 ring-border">
                      {person.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {person.name} {isCurrent && <span className="text-fg-secondary">(you)</span>}
                      </p>
                      {canEditRole ? (
                        <select
                          value={personRole}
                          onChange={(e) => handleRoleChange(person.id, e.target.value as Role)}
                          className="mt-0.5 rounded border border-border bg-bg px-1.5 py-0.5 text-xs capitalize text-fg-secondary outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-fg-secondary">
                          {personRole === "admin" ? <ShieldCheck size={12} /> : <User size={12} />}
                          <span className="capitalize">{personRole}</span>
                          {isCurrent && <span className="text-fg-tertiary">· that&apos;s you</span>}
                        </span>
                      )}
                    </div>
                  </div>

                  {(person.title || person.email) && (
                    <p className="mt-2 truncate text-xs text-fg-secondary">
                      {person.title}
                      {person.title && person.email && " · "}
                      {person.email}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-fg-secondary">
                    <span>{assigned.length} assigned</span>
                    <span>{done} completed</span>
                  </div>

                  {memberProjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {memberProjects.map((p) => (
                        <span
                          key={p.id}
                          className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-secondary"
                        >
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}

          {!isAdmin && (
            <p className="mt-4 text-xs text-fg-tertiary">
              Only admins can change member roles or add new members.
            </p>
          )}

          {isAdmin && invites.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-medium text-fg">Invitations</h2>
              <div className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-fg-secondary">
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Sent</th>
                      <th className="px-3 py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-fg">{invite.email}</td>
                        <td className="px-3 py-2 capitalize text-fg-secondary">{invite.role}</td>
                        <td className={cn("px-3 py-2 capitalize", STATUS_BADGE[invite.status])}>
                          {invite.status}
                        </td>
                        <td className="px-3 py-2 text-fg-secondary">{timeAgo(invite.createdAt)}</td>
                        <td className="px-3 py-2 text-right">
                          {(invite.status === "pending" || invite.status === "expired") && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleResend(invite.id)}
                                title="Resend"
                                className="rounded p-1 text-fg-secondary hover:bg-surface-hover hover:text-fg"
                              >
                                <RotateCw size={13} />
                              </button>
                              {invite.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleCancel(invite.id, invite.email)}
                                  title="Cancel"
                                  className="rounded p-1 text-fg-secondary hover:bg-surface-hover hover:text-[#e5484d]"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
      <AddMemberModal open={addMemberOpen} onOpenChange={setAddMemberOpen} />
      <InviteMemberModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
