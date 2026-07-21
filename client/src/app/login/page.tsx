"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, User } from "lucide-react";
import { useMembersStore } from "@/lib/stores/members-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export default function LoginPage() {
  const router = useRouter();
  const members = useMembersStore((s) => s.members);
  const login = useAuthStore((s) => s.login);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const workspace = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];

  function handleLogin(name: string) {
    login(name);
    router.push("/");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-fg">
            L
          </span>
          <h1 className="text-base font-semibold text-fg">Sign in to {workspace.name}</h1>
          <p className="text-center text-xs text-fg-secondary">
            Demo auth — pick a member to sign in as. No password needed.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2">
          {members.map((member) => (
            <button
              key={member.name}
              type="button"
              onClick={() => handleLogin(member.name)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-xs font-medium text-fg ring-1 ring-border">
                {member.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{member.name}</p>
                <p className="truncate text-xs text-fg-secondary">
                  {member.title ?? member.email ?? "Member"}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-fg-tertiary">
                {member.role === "admin" ? <ShieldCheck size={13} /> : <User size={13} />}
                <span className="capitalize">{member.role}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-fg-tertiary">
          Portfolio project — this "login" just picks which demo user you're viewing the app as.
        </p>
      </div>
    </div>
  );
}
