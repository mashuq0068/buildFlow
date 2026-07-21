"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface InviteDetails {
  email: string;
  role: "ADMIN" | "MEMBER";
  status: string;
  workspaceName: string;
  workspaceColor: string;
}

type LoadState = "loading" | "ready" | "error";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [invite, setInvite] = useState<InviteDetails | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get<InviteDetails>(`/invites/${token}`)
      .then((data) => {
        setInvite(data);
        setLoadState("ready");
      })
      .catch((err) => {
        setErrorMessage(err instanceof ApiError ? err.message : "Invitation not found");
        setLoadState("error");
      });
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setSubmitting(true);
    try {
      await api.post(`/invites/${token}/accept`, { name: name.trim(), password });
      await fetchMe();
      toast.success("Welcome aboard!");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to accept invitation");
    } finally {
      setSubmitting(false);
    }
  }

  const statusMessage: Record<string, string> = {
    ACCEPTED: "This invitation has already been accepted.",
    EXPIRED: "This invitation has expired — ask an admin to send a new one.",
    CANCELLED: "This invitation has been cancelled.",
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-fg">
            L
          </span>
          <h1 className="text-base font-semibold text-fg">Join your team on Linear Clone</h1>
        </div>

        {loadState === "loading" && (
          <div className="flex justify-center py-8">
            <Loader2 size={18} className="animate-spin text-fg-secondary" />
          </div>
        )}

        {loadState === "error" && (
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-sm text-fg">{errorMessage}</p>
          </div>
        )}

        {loadState === "ready" && invite && invite.status !== "PENDING" && (
          <div className="rounded-lg border border-border bg-surface p-4 text-center">
            <p className="text-sm text-fg">
              {statusMessage[invite.status] ?? "This invitation is no longer valid."}
            </p>
          </div>
        )}

        {loadState === "ready" && invite && invite.status === "PENDING" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: invite.workspaceColor }}
                >
                  {invite.workspaceName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{invite.workspaceName}</p>
                  <p className="flex items-center gap-1 text-xs text-fg-secondary">
                    {invite.role === "ADMIN" ? <ShieldCheck size={12} /> : <User size={12} />}
                    Invited as {invite.role === "ADMIN" ? "an admin" : "a member"}
                  </p>
                </div>
              </div>

              <p className="mb-3 text-xs text-fg-secondary">
                Create an account for <span className="text-fg">{invite.email}</span> to accept.
              </p>

              <form onSubmit={handleAccept} className="flex flex-col gap-2">
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-tertiary outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !password}
                  className={cn(
                    "mt-1 flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90",
                    (submitting || !name.trim() || !password) && "opacity-40"
                  )}
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  Accept invitation
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
