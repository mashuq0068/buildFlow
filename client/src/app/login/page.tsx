"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ApiError } from "@/lib/api-client";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [manualPending, setManualPending] = useState(false);

  async function handleLogin(loginEmail: string, loginPassword: string) {
    try {
      await login(loginEmail, loginPassword);
      router.push("/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed");
    }
  }

  async function handleDemoLogin(demoEmail: string) {
    setPendingEmail(demoEmail);
    await handleLogin(demoEmail, DEMO_PASSWORD);
    setPendingEmail(null);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setManualPending(true);
    await handleLogin(email.trim(), password);
    setManualPending(false);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-fg">
            L
          </span>
          <h1 className="text-base font-semibold text-fg">Sign in to Linear Clone</h1>
          <p className="text-center text-xs text-fg-secondary">
            Real authentication — pick a demo account below or sign in with any account.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              disabled={pendingEmail !== null}
              onClick={() => handleDemoLogin(account.email)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-surface-hover disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-xs font-medium text-fg ring-1 ring-border">
                {account.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{account.name}</p>
                <p className="truncate text-xs text-fg-secondary">{account.title}</p>
              </div>
              {pendingEmail === account.email && (
                <Loader2 size={14} className="shrink-0 animate-spin text-fg-tertiary" />
              )}
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-[11px] text-fg-tertiary">
          Demo password for every account: <span className="font-mono">{DEMO_PASSWORD}</span>
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowManualForm((v) => !v)}
            className="w-full text-center text-xs text-fg-secondary hover:text-fg"
          >
            {showManualForm ? "Hide manual sign in" : "Sign in with a different account"}
          </button>

          {showManualForm && (
            <form onSubmit={handleManualSubmit} className="mt-3 flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
              />
              <button
                type="submit"
                disabled={manualPending}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                  manualPending && "opacity-60"
                )}
              >
                {manualPending && <Loader2 size={13} className="animate-spin" />}
                Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
