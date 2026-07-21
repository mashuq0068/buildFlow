"use client";

import { useEffect, useState } from "react";
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

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [workspaceDataLoaded, setWorkspaceDataLoaded] = useState(false);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      await useWorkspaceStore.getState().fetchWorkspaces();
      if (cancelled) return;
      if (!useWorkspaceStore.getState().currentWorkspaceId) setWorkspaceDataLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !currentWorkspaceId) return;
    let cancelled = false;
    setWorkspaceDataLoaded(false);
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
    ]).finally(() => {
      if (!cancelled) setWorkspaceDataLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [status, currentWorkspaceId]);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      router.replace("/login");
    } else if (status === "authenticated" && pathname === "/login") {
      router.replace("/");
    }
  }, [status, pathname, router]);

  if (status === "idle" || status === "loading") return <FullScreenSpinner />;
  if (status === "unauthenticated") return pathname === "/login" ? <>{children}</> : null;
  if (pathname === "/login") return null;
  if (!workspaceDataLoaded) return <FullScreenSpinner />;

  return <>{children}</>;
}
