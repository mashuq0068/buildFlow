"use client";

import { motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { StatTile } from "@/components/stat-tile";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { Avatar } from "@/components/ui/avatar";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useCurrentUser } from "@/lib/current-user";
import { useMembersStore } from "@/lib/stores/members-store";
import { buildWeeklyDueBuckets } from "@/lib/due-date-buckets";
import {
  PRIORITY_LABEL,
  PRIORITY_CHART_COLOR,
  CATEGORY_ORDER,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  type Issue,
  type IssuePriority,
} from "@/lib/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function personStats(issues: Issue[], personId: string) {
  const owned = issues.filter((i) => i.assignee?.id === personId);
  const done = owned.filter((i) => i.status.category === "completed").length;
  return { total: owned.length, done };
}

export default function AnalyticsPage() {
  const issues = useIssuesStore((s) => s.issues);
  const projects = useProjectsStore((s) => s.projects);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const currentUser = useCurrentUser();
  const role = currentUser?.role ?? "member";
  const members = useMembersStore((s) => s.members);

  const myIssues = issues.filter((i) => i.assignee?.id === currentUser?.id);
  const myDone = myIssues.filter((i) => i.status.category === "completed").length;
  const myInProgress = myIssues.filter((i) => i.status.category === "started").length;

  const priorities: IssuePriority[] = ["critical", "urgent", "high", "medium", "low", "no_priority"];
  const priorityData = priorities.map((p) => ({
    label: PRIORITY_LABEL[p],
    value: myIssues.filter((i) => i.priority === p).length,
    color: PRIORITY_CHART_COLOR[p],
  }));

  const statusData = CATEGORY_ORDER.map((category) => ({
    label: CATEGORY_LABEL[category],
    value: myIssues.filter((i) => i.status.category === category).length,
    color: CATEGORY_COLOR[category],
  }));

  const projectData = projects
    .map((p) => ({
      label: p.name,
      value: issues.filter((i) => i.projectId === p.id).length,
      color: p.color,
    }))
    .filter((d) => d.value > 0);

  const labelCounts = new Map<string, { name: string; color: string; count: number }>();
  for (const issue of issues) {
    for (const label of issue.labels ?? []) {
      const entry = labelCounts.get(label.id) ?? { name: label.name, color: label.color, count: 0 };
      entry.count += 1;
      labelCounts.set(label.id, entry);
    }
  }
  const labelData = Array.from(labelCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((l) => ({ label: l.name, value: l.count, color: l.color }));

  const teamRows = members.map((person) => ({
    person,
    ...personStats(issues, person.id),
  }));

  const dueBuckets = buildWeeklyDueBuckets(issues.filter((i) => i.dueDate).map((i) => i.dueDate!));

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

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mt-4 grid gap-4 lg:grid-cols-2"
          >
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
          </motion.div>

          <h2 className="mt-6 text-sm font-medium text-fg">Workspace overview</h2>
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-3 grid gap-4 lg:grid-cols-2"
          >
            <div className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-sm font-medium text-fg">Issues by project</h3>
              {projectData.length > 0 ? (
                <BarChart data={projectData} />
              ) : (
                <p className="mt-3 text-xs text-fg-secondary">No issues yet.</p>
              )}
            </div>
            <div className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-sm font-medium text-fg">Top labels</h3>
              {labelData.length > 0 ? (
                <div className="mt-3">
                  <DonutChart data={labelData} />
                </div>
              ) : (
                <p className="mt-3 text-xs text-fg-secondary">No labeled issues yet.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mt-4 rounded-md border border-border bg-surface p-4"
          >
            <h3 className="text-sm font-medium text-fg">Upcoming deadlines</h3>
            {dueBuckets.length > 0 ? (
              <div className="mt-3">
                <AreaChart data={dueBuckets} color="#7c3aed" />
              </div>
            ) : (
              <p className="mt-3 text-xs text-fg-secondary">No issues have a due date yet.</p>
            )}
          </motion.div>

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
                          <Avatar person={row.person} size={20} />
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
