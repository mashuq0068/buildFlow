"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  async function handleChangePassword() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated — please sign in again");
      await logout().catch(() => {});
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

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
          <section className="max-w-md rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Theme</h2>
            <p className="mt-1 text-xs text-fg-secondary">
              Choose how BuildFlow looks on this device.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-md border px-3 py-3 text-xs transition-colors",
                      active
                        ? "border-fg bg-surface-hover text-fg"
                        : "border-border text-fg-secondary hover:bg-surface-hover hover:text-fg"
                    )}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-4 max-w-md rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Password</h2>
            <p className="mt-1 text-xs text-fg-secondary">
              You&apos;ll be signed out on this device after changing your password.
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <label className="text-xs text-fg-secondary">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-fg-secondary">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-1 w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-fg-secondary">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "mt-1 w-full rounded-md border bg-bg px-2.5 py-1.5 text-sm text-fg outline-none",
                    mismatch ? "border-[#e5484d]" : "border-border"
                  )}
                />
                {mismatch && (
                  <p className="mt-1 text-[11px] text-[#e5484d]">Passwords don&apos;t match.</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={!canSubmit || saving}
                className={cn(
                  "flex items-center justify-center gap-1.5 self-start rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                  (!canSubmit || saving) && "opacity-40"
                )}
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                Update password
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
