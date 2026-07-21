"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { StatTile } from "@/components/stat-tile";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useActivityStore } from "@/lib/stores/activity-store";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const issues = useIssuesStore((s) => s.issues);
  const recentActivity = useActivityStore((s) => s.recent);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const projects = useProjectsStore((s) => s.projects);

  const myIssues = issues.filter(
    (i) => i.assignee?.id === currentUser?.id || i.creator?.id === currentUser?.id
  );
  const myOpenIssues = myIssues.filter(
    (i) => i.status.category !== "completed" && i.status.category !== "canceled"
  );
  const myInProgress = myIssues.filter((i) => i.status.category === "started");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Dashboard"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <h1 className="text-lg font-semibold text-fg">
            Welcome back, {currentUser?.name.split(" ")[0] ?? ""}
          </h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Here&apos;s what&apos;s happening across your work.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="My open issues" value={myOpenIssues.length} />
            <StatTile label="My in progress" value={myInProgress.length} />
            <StatTile label="Projects" value={projects.length} />
            <StatTile label="Total work items" value={issues.length} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-fg">My issues</h2>
                <Link
                  href="/my-issues"
                  className="flex items-center gap-1 text-xs text-fg-secondary hover:text-fg"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {myIssues.length === 0 && (
                  <p className="text-xs text-fg-secondary">
                    No issues assigned to or created by you.
                  </p>
                )}
                {myIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 text-sm">
                    <span className="w-16 shrink-0 text-xs text-fg-secondary">
                      {issue.identifier}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-fg">{issue.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-fg">Projects</h2>
                <Link
                  href="/projects"
                  className="flex items-center gap-1 text-xs text-fg-secondary hover:text-fg"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {projects.length === 0 && (
                  <p className="text-xs text-fg-secondary">You&apos;re not on any projects yet.</p>
                )}
                {projects.map((project) => {
                  const projectIssues = issues.filter((i) => i.projectId === project.id);
                  const done = projectIssues.filter((i) => i.status.category === "completed").length;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/board?id=${project.id}`}
                      className="flex items-center gap-2 rounded-md px-1 py-1 text-sm transition-colors hover:bg-surface-hover"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="flex-1 text-fg">{project.name}</span>
                      <span className="text-xs text-fg-secondary">
                        {done}/{projectIssues.length} done
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Recent activity</h2>
            <div className="mt-3 flex flex-col gap-3">
              {recentActivity.length === 0 && (
                <p className="text-xs text-fg-secondary">No activity yet.</p>
              )}
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2.5 text-xs">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium text-fg ring-1 ring-border">
                    {entry.author.initials}
                  </span>
                  <p className="text-fg-secondary">
                    <span className="font-medium text-fg">{entry.author.name}</span>{" "}
                    {entry.message} on <span className="text-fg">{entry.issueIdentifier}</span>
                    <span className="ml-1.5 text-fg-secondary">· {timeAgo(entry.createdAt)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
