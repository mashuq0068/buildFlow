"use client";

import { useMemo, useState } from "react";
import { Plus, Flag } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AddToRoadmapModal } from "@/components/roadmap/add-to-roadmap-modal";
import { NewMilestoneModal } from "@/components/roadmap/new-milestone-modal";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useGoalsStore } from "@/lib/stores/goals-store";
import { useMilestonesStore } from "@/lib/stores/milestones-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_COLOR,
  type ProjectStatus,
  type Milestone,
} from "@/lib/types";

const TIMELINE_START = new Date("2026-07-01").getTime();
const TIMELINE_END = new Date("2026-09-30").getTime();
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

const MONTHS = [
  { label: "July", date: "2026-07-01" },
  { label: "August", date: "2026-08-01" },
  { label: "September", date: "2026-09-01" },
];

const DEFAULT_RANGE = { start: "2026-07-15", end: "2026-08-15" };

function toPercent(dateStr: string) {
  const t = new Date(dateStr).getTime();
  return Math.min(100, Math.max(0, ((t - TIMELINE_START) / TIMELINE_SPAN) * 100));
}

export default function RoadmapPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const allProjects = useProjectsStore((s) => s.projects);
  const goals = useGoalsStore((s) => s.goals);
  const milestones = useMilestonesStore((s) => s.milestones);
  const issues = useIssuesStore((s) => s.issues);
  const [addToRoadmapOpen, setAddToRoadmapOpen] = useState(false);
  const [newMilestoneOpen, setNewMilestoneOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");

  const projects = useMemo(
    () =>
      statusFilter === "all" ? allProjects : allProjects.filter((p) => p.status === statusFilter),
    [allProjects, statusFilter]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Roadmap"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | ProjectStatus)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
            >
              <option value="all">Any status</option>
              {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewMilestoneOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-hover"
              >
                <Flag size={13} />
                New Milestone
              </button>
              <button
                type="button"
                onClick={() => setAddToRoadmapOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                <Plus size={13} />
                Add to Roadmap
              </button>
            </div>
          </div>

          <div className="min-w-[640px] rounded-md border border-border bg-surface p-4">
            <div className="relative mb-2 flex text-xs text-fg-secondary">
              {MONTHS.map((m) => (
                <div key={m.label} style={{ left: `${toPercent(m.date)}%` }} className="absolute">
                  {m.label}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-5">
              {projects.map((project) => {
                const start = project.startDate ?? DEFAULT_RANGE.start;
                const end = project.targetDate ?? DEFAULT_RANGE.end;
                const left = toPercent(start);
                const width = toPercent(end) - left;
                const projectGoals = goals.filter((g) => g.projectId === project.id);
                const projectMilestones = milestones.filter((m) => m.projectId === project.id);
                const projectIssues = issues.filter((i) => i.projectId === project.id);
                const done = projectIssues.filter((i) => i.status.category === "completed").length;
                const progress =
                  projectIssues.length === 0
                    ? 0
                    : Math.round((done / projectIssues.length) * 100);
                const status = project.status ?? "planning";

                return (
                  <div key={project.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm text-fg">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                        {project.lead && (
                          <span className="text-xs text-fg-secondary">· {project.lead.name}</span>
                        )}
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${PROJECT_STATUS_COLOR[status]}1a`,
                            color: PROJECT_STATUS_COLOR[status],
                          }}
                        >
                          {PROJECT_STATUS_LABEL[status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-fg-secondary">
                        <span>{progress}% complete</span>
                        <span>
                          {new Date(start).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {" – "}
                          {new Date(end).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 rounded-md bg-bg-secondary">
                      <div
                        className="absolute inset-y-0 rounded-md"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: project.color,
                          opacity: 0.35,
                        }}
                      />
                      <div
                        className="absolute inset-y-1 overflow-hidden rounded"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <div
                          className="h-full"
                          style={{ width: `${progress}%`, backgroundColor: project.color }}
                        />
                      </div>
                      {projectGoals.map((goal) => (
                        <div
                          key={goal.id}
                          title={`Goal: ${goal.title}`}
                          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-bg bg-fg"
                          style={{ left: `${toPercent(goal.targetDate)}%` }}
                        />
                      ))}
                      {projectMilestones.map((milestone) => (
                        <button
                          key={milestone.id}
                          type="button"
                          title={`Milestone: ${milestone.title}${milestone.completed ? " (reached)" : ""}`}
                          onClick={() => setEditingMilestone(milestone)}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-0.5 transition-transform hover:scale-125"
                          style={{ left: `${toPercent(milestone.targetDate)}%` }}
                        >
                          <Flag
                            size={13}
                            className={milestone.completed ? "text-[#4cb782]" : "text-[#e8a53f]"}
                            fill="currentColor"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <p className="py-8 text-center text-sm text-fg-secondary">
                  No projects match this filter.
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-fg-secondary">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rotate-45 border border-bg bg-fg" />
                Goal target date
              </span>
              <span className="flex items-center gap-1.5">
                <Flag size={12} className="text-[#e8a53f]" fill="currentColor" />
                Milestone (upcoming)
              </span>
              <span className="flex items-center gap-1.5">
                <Flag size={12} className="text-[#4cb782]" fill="currentColor" />
                Milestone (reached)
              </span>
            </div>
          </div>
        </main>
      </div>
      <AddToRoadmapModal open={addToRoadmapOpen} onOpenChange={setAddToRoadmapOpen} />
      <NewMilestoneModal open={newMilestoneOpen} onOpenChange={setNewMilestoneOpen} />
      <NewMilestoneModal
        open={Boolean(editingMilestone)}
        onOpenChange={(open) => {
          if (!open) setEditingMilestone(null);
        }}
        editMilestone={editingMilestone}
      />
    </div>
  );
}
