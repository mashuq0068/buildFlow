"use client";

import { useMemo, useState } from "react";
import { Target, Plus, Pencil, Flag } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { GoalDetailPanel } from "@/components/goals/goal-detail-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useGoalsStore } from "@/lib/stores/goals-store";
import { useMilestonesStore } from "@/lib/stores/milestones-store";
import type { Goal } from "@/lib/types";

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function GoalsPage() {
  const issues = useIssuesStore((s) => s.issues);
  const projects = useProjectsStore((s) => s.projects);
  const goals = useGoalsStore((s) => s.goals);
  const milestones = useMilestonesStore((s) => s.milestones);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState<"all" | "on_track" | "at_risk">("all");

  const goalsWithMeta = useMemo(
    () =>
      goals.map((goal) => {
        const projectIssues = issues.filter((i) => i.projectId === goal.projectId);
        const done = projectIssues.filter((i) => i.status.category === "completed").length;
        const progress =
          projectIssues.length === 0 ? 0 : Math.round((done / projectIssues.length) * 100);
        const remaining = daysUntil(goal.targetDate);
        const onTrack = remaining < 0 ? progress === 100 : progress >= 100 - remaining * 3;
        return { goal, progress, remaining, onTrack };
      }),
    [goals, issues]
  );

  const filteredGoals = goalsWithMeta.filter(({ goal, onTrack }) => {
    if (projectFilter !== "all" && goal.projectId !== projectFilter) return false;
    if (trackFilter === "on_track" && !onTrack) return false;
    if (trackFilter === "at_risk" && onTrack) return false;
    return true;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Goals"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
              >
                <option value="all">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value as "all" | "on_track" | "at_risk")}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none"
              >
                <option value="all">Any status</option>
                <option value="on_track">On track</option>
                <option value="at_risk">At risk</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setNewGoalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              New Goal
            </button>
          </div>
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Goals tie a project's progress to a target date so everyone can see what's on track."
              action={
                <button
                  type="button"
                  onClick={() => setNewGoalOpen(true)}
                  className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
                >
                  Create your first goal
                </button>
              }
            />
          ) : filteredGoals.length === 0 ? (
            <EmptyState icon={Target} title="No goals match your filters" />
          ) : (
          <div className="flex flex-col gap-3">
            {filteredGoals.map(({ goal, progress, remaining, onTrack }) => {
              const project = projects.find((p) => p.id === goal.projectId);
              const projectMilestones = milestones
                .filter((m) => m.projectId === goal.projectId && !m.completed)
                .slice(0, 3);

              return (
                <div
                  key={goal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedGoal(goal)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedGoal(goal);
                  }}
                  className="cursor-pointer rounded-md border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-bg-secondary text-fg-secondary">
                      <Target size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-fg">{goal.title}</p>
                        <button
                          type="button"
                          aria-label="Edit goal"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGoal(goal);
                          }}
                          className="shrink-0 rounded p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                      {goal.description && (
                        <p className="mt-0.5 text-xs leading-relaxed text-fg-secondary">
                          {goal.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-fg-secondary">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: project?.color }}
                        />
                        <span>{project?.name}</span>
                        <span>·</span>
                        <span>
                          {remaining >= 0 ? `${remaining} days left` : "Target date passed"}
                        </span>
                        <span className={onTrack ? "text-[#4cb782]" : "text-[#e5484d]"}>
                          · {onTrack ? "On track" : "At risk"}
                        </span>
                        {goal.owner && (
                          <span className="flex items-center gap-1">
                            ·
                            <Avatar person={goal.owner} size={16} />
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                        <div
                          className="h-full rounded-full bg-fg transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-fg-secondary">
                        {progress}% of {project?.name} work items complete
                      </p>
                      {projectMilestones.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {projectMilestones.map((m) => (
                            <span
                              key={m.id}
                              title={new Date(m.targetDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                              className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-fg-secondary"
                            >
                              <Flag size={9} className="text-[#e8a53f]" fill="currentColor" />
                              {m.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </main>
      </div>
      <NewGoalModal open={newGoalOpen} onOpenChange={setNewGoalOpen} />
      <NewGoalModal
        open={Boolean(editingGoal)}
        onOpenChange={(open) => {
          if (!open) setEditingGoal(null);
        }}
        editGoal={editingGoal}
      />
      <GoalDetailPanel goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
    </div>
  );
}
