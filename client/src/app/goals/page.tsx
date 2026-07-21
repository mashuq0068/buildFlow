"use client";

import { useState } from "react";
import { Target, Plus, Pencil } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { NewGoalModal } from "@/components/goals/new-goal-modal";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useGoalsStore } from "@/lib/stores/goals-store";
import type { Goal } from "@/lib/types";

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function GoalsPage() {
  const issues = useIssuesStore((s) => s.issues);
  const projects = useProjectsStore((s) => s.projects);
  const goals = useGoalsStore((s) => s.goals);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setNewGoalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              New Goal
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {goals.map((goal) => {
              const project = projects.find((p) => p.id === goal.projectId);
              const projectIssues = issues.filter((i) => i.projectId === goal.projectId);
              const done = projectIssues.filter((i) => i.status === "done").length;
              const progress =
                projectIssues.length === 0 ? 0 : Math.round((done / projectIssues.length) * 100);
              const remaining = daysUntil(goal.targetDate);
              const onTrack = remaining < 0 ? progress === 100 : progress >= 100 - remaining * 3;

              return (
                <div key={goal.id} className="rounded-md border border-border bg-surface p-4">
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
                          onClick={() => setEditingGoal(goal)}
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
                            <span className="flex size-4 items-center justify-center rounded-full bg-surface-hover text-[9px] font-medium ring-1 ring-border">
                              {goal.owner.initials}
                            </span>
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
}
