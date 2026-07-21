"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useMembersStore } from "@/lib/stores/members-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useCyclesStore } from "@/lib/stores/cycles-store";
import { useGoalsStore } from "@/lib/stores/goals-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useActivityStore } from "@/lib/stores/activity-store";

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg">
      <div className="size-5 animate-spin rounded-full border-2 border-border-strong border-t-fg" />
    </div>
  );
}

function FullScreenError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-bg p-4 text-center">
      <p className="text-sm font-medium text-fg">Couldn&apos;t load your workspace</p>
      <p className="max-w-sm text-xs text-fg-secondary">
        Something went wrong reaching the server. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [workspaceDataLoaded, setWorkspaceDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        await useWorkspaceStore.getState().fetchWorkspaces();
        if (cancelled) return;
        if (!useWorkspaceStore.getState().currentWorkspaceId) setWorkspaceDataLoaded(true);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setWorkspaceDataLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, retryCount]);

  useEffect(() => {
    if (status !== "authenticated" || !currentWorkspaceId) return;
    let cancelled = false;
    setWorkspaceDataLoaded(false);
    setLoadError(false);
    Promise.all([
      useMembersStore.getState().fetchMembers(currentWorkspaceId),
      useProjectsStore.getState().fetchProjects(currentWorkspaceId),
      useIssuesStore.getState().fetchIssues(currentWorkspaceId),
      useCyclesStore.getState().fetchCycles(currentWorkspaceId),
      useGoalsStore.getState().fetchGoals(currentWorkspaceId),
      useIssuesStore.getState().fetchFavorites(),
      useIssuesStore.getState().fetchDrafts(currentWorkspaceId),
      useNotificationsStore.getState().fetchNotifications(),
      useActivityStore.getState().fetchRecent(currentWorkspaceId),
    ])
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setWorkspaceDataLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [status, currentWorkspaceId, retryCount]);

  const isPublicPath = pathname === "/login" || pathname.startsWith("/invite/");

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicPath) {
      router.replace("/login");
    } else if (status === "authenticated" && pathname === "/login") {
      router.replace("/");
    }
  }, [status, pathname, isPublicPath, router]);

  if (status === "idle" || status === "loading") return <FullScreenSpinner />;
  if (status === "unauthenticated") return isPublicPath ? <>{children}</> : null;
  if (pathname === "/login") return null;
  if (pathname.startsWith("/invite/")) return <>{children}</>;
  if (!workspaceDataLoaded) return <FullScreenSpinner />;
  if (loadError) return <FullScreenError onRetry={() => setRetryCount((c) => c + 1)} />;

  return <>{children}</>;
}
