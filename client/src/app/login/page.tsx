"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, User, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ApiError } from "@/lib/api-client";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  DEFAULT_ADMIN_ACCOUNT,
  DEFAULT_MEMBER_ACCOUNT,
} from "@/lib/demo-accounts";
import { BrandLogo } from "@/components/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Role = "admin" | "member";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  function handleSelectRole(next: Role) {
    setRole(next);
    const account = next === "admin" ? DEFAULT_ADMIN_ACCOUNT : DEFAULT_MEMBER_ACCOUNT;
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
  }

  function handlePickAccount(accountEmail: string) {
    setEmail(accountEmail);
    setPassword(DEMO_PASSWORD);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setPending(true);
    try {
      await login(email.trim(), password);
      router.push("/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  const roleAccounts = DEMO_ACCOUNTS.filter((a) => a.role === role);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <BrandLogo className="flex-col gap-1.5" iconSize={20} badgeClassName="size-9" />
          <h1 className="text-base font-semibold text-fg">Sign in to BuildFlow</h1>
        </div>

        {role === null ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-xs text-fg-secondary">
              How would you like to sign in?
            </p>
            <button
              type="button"
              onClick={() => handleSelectRole("admin")}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-fg">
                <ShieldCheck size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">Login as Admin</p>
                <p className="text-xs text-fg-secondary">
                  Full workspace access — manage members, projects, and settings.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole("member")}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-fg">
                <User size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">Login as Member</p>
                <p className="text-xs text-fg-secondary">
                  Access your assigned projects and issues.
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setRole(null)}
              className="flex items-center gap-1 self-start text-xs text-fg-secondary hover:text-fg"
            >
              <ArrowLeft size={12} /> Back
            </button>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-fg-secondary">
                {role === "admin" ? <ShieldCheck size={13} /> : <User size={13} />}
                Signing in as {role === "admin" ? "an admin" : "a member"} — credentials below are
                pre-filled with a demo account, edit them for a different login.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "mt-1 flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                    pending && "opacity-60"
                  )}
                >
                  {pending && <Loader2 size={13} className="animate-spin" />}
                  Sign in
                </button>
              </form>
            </div>

            {roleAccounts.length > 1 && (
              <div>
                <p className="mb-1.5 text-xs text-fg-secondary">
                  Other {role} demo accounts:
                </p>
                <div className="flex flex-col gap-1">
                  {roleAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handlePickAccount(account.email)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-hover",
                        email === account.email && "bg-surface-hover"
                      )}
                    >
                      <Avatar person={account} size={28} className="text-fg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-fg">{account.name}</p>
                        <p className="truncate text-[11px] text-fg-secondary">{account.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-[11px] text-fg-tertiary">
              Demo password for every account: <span className="font-mono">{DEMO_PASSWORD}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
