"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AddMemberModal } from "@/components/members/add-member-modal";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { ShieldCheck, User, Plus } from "lucide-react";
import type { Role } from "@/lib/types";

export default function MembersPage() {
  const issues = useIssuesStore((s) => s.issues);
  const projects = useProjectsStore((s) => s.projects);
  const members = useMembersStore((s) => s.members);
  const updateMemberRole = useMembersStore((s) => s.updateMemberRole);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

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
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              Add Member
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((person) => {
              const isCurrent = person.name === currentUser?.name;
              const personRole: Role = person.role;
              const assigned = issues.filter((i) => i.assignee?.name === person.name);
              const done = assigned.filter((i) => i.status === "done").length;
              const projectIds = Array.from(new Set(assigned.map((i) => i.projectId)));
              const memberProjects = projects.filter((p) => projectIds.includes(p.id));
              const canEditRole = isAdmin && !isCurrent;

              return (
                <div key={person.name} className="rounded-md border border-border bg-surface p-4">
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
                          onChange={(e) => updateMemberRole(person.name, e.target.value as Role)}
                          className="mt-0.5 rounded border border-border bg-bg px-1.5 py-0.5 text-xs capitalize text-fg-secondary outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-fg-secondary">
                          {personRole === "admin" ? <ShieldCheck size={12} /> : <User size={12} />}
                          <span className="capitalize">{personRole}</span>
                          {isCurrent && (
                            <span className="text-fg-tertiary">
                              · change via profile menu
                            </span>
                          )}
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

          {!isAdmin && (
            <p className="mt-4 text-xs text-fg-tertiary">
              Only admins can change other members&apos; roles. Switch users from the profile
              menu in the sidebar to sign in as an admin.
            </p>
          )}
        </main>
      </div>
      <AddMemberModal open={addMemberOpen} onOpenChange={setAddMemberOpen} />
    </div>
  );
}
