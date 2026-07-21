"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { StatTile } from "@/components/stat-tile";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useMembersStore } from "@/lib/stores/members-store";
import {
  PRIORITY_LABEL,
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  type Issue,
  type IssuePriority,
} from "@/lib/types";

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  urgent: "#e5484d",
  high: "var(--fg)",
  medium: "var(--fg-secondary)",
  low: "var(--fg-tertiary)",
  no_priority: "var(--border-strong)",
};

const CATEGORY_CHART_COLORS: Record<string, string> = {
  backlog: "var(--fg-tertiary)",
  unstarted: "var(--fg-secondary)",
  started: "#e8a53f",
  completed: "#4cb782",
  canceled: "var(--border-strong)",
};

function personStats(issues: Issue[], personId: string) {
  const owned = issues.filter((i) => i.assignee?.id === personId);
  const done = owned.filter((i) => i.status.category === "completed").length;
  return { total: owned.length, done };
}

export default function AnalyticsPage() {
  const issues = useIssuesStore((s) => s.issues);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const role = currentUser?.role ?? "member";
  const members = useMembersStore((s) => s.members);

  const myIssues = issues.filter((i) => i.assignee?.id === currentUser?.id);
  const myDone = myIssues.filter((i) => i.status.category === "completed").length;
  const myInProgress = myIssues.filter((i) => i.status.category === "started").length;

  const priorities: IssuePriority[] = ["urgent", "high", "medium", "low", "no_priority"];
  const priorityData = priorities.map((p) => ({
    label: PRIORITY_LABEL[p],
    value: myIssues.filter((i) => i.priority === p).length,
    color: PRIORITY_COLORS[p],
  }));

  const statusData = CATEGORY_ORDER.map((category) => ({
    label: CATEGORY_LABEL[category],
    value: myIssues.filter((i) => i.status.category === category).length,
    color: CATEGORY_CHART_COLORS[category],
  }));

  const teamRows = members.map((person) => ({
    person,
    ...personStats(issues, person.id),
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Analytics"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <h2 className="text-sm font-medium text-fg">Your performance</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Assigned to you" value={myIssues.length} />
            <StatTile label="Completed" value={myDone} />
            <StatTile label="In progress" value={myInProgress} />
            <StatTile
              label="Completion rate"
              value={myIssues.length ? `${Math.round((myDone / myIssues.length) * 100)}%` : "—"}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-sm font-medium text-fg">Your issues by priority</h3>
              <BarChart data={priorityData} />
            </div>
            <div className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-sm font-medium text-fg">Your issues by state</h3>
              <div className="mt-3">
                <DonutChart data={statusData} />
              </div>
            </div>
          </div>

          {role === "admin" && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-fg">Team performance</h2>
              <p className="mt-1 text-xs text-fg-secondary">
                Visible to admins only — individual contributors see their own performance above.
              </p>
              <div className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-fg-secondary">
                      <th className="px-3 py-2 font-medium">Member</th>
                      <th className="px-3 py-2 font-medium">Assigned</th>
                      <th className="px-3 py-2 font-medium">Completed</th>
                      <th className="px-3 py-2 font-medium">Completion rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamRows.map((row) => (
                      <tr key={row.person.id} className="border-b border-border last:border-0">
                        <td className="flex items-center gap-2 px-3 py-2 text-fg">
                          <span className="flex size-5 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium ring-1 ring-border">
                            {row.person.initials}
                          </span>
                          {row.person.name}
                        </td>
                        <td className="px-3 py-2 text-fg-secondary">{row.total}</td>
                        <td className="px-3 py-2 text-fg-secondary">{row.done}</td>
                        <td className="px-3 py-2 text-fg-secondary">
                          {row.total ? `${Math.round((row.done / row.total) * 100)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
