"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Target, Flag } from "lucide-react";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useMilestonesStore } from "@/lib/stores/milestones-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectStatusColumns } from "@/lib/hooks/use-project-status-columns";
import { STATUS_ICONS, DefaultStatusIcon } from "@/lib/status-icons";
import type { Goal } from "@/lib/types";

export function GoalDetailPanel({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const issues = useIssuesStore((s) => s.issues);
  const milestones = useMilestonesStore((s) => s.milestones);
  const projects = useProjectsStore((s) => s.projects);
  const openIssue = useUIStore((s) => s.openIssue);
  const statusColumns = useProjectStatusColumns(goal?.projectId);

  const open = Boolean(goal);
  const project = goal ? projects.find((p) => p.id === goal.projectId) : undefined;
  const projectIssues = goal ? issues.filter((i) => i.projectId === goal.projectId) : [];
  const projectMilestones = goal ? milestones.filter((m) => m.projectId === goal.projectId) : [];

  return (
    <AnimatePresence>
      {open && goal && (
        <>
          <motion.div
            key="goal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/30"
          />
          <motion.div
            key="goal-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-[35] flex w-full max-w-full flex-col border-l border-border bg-bg sm:max-w-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-fg-secondary">
                <Target size={13} /> Goal
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h2 className="text-base font-semibold text-fg">{goal.title}</h2>
              {goal.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">
                  {goal.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-fg-secondary">
                <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
                <span>{project?.name}</span>
                <span>·</span>
                <span>
                  Target{" "}
                  {new Date(goal.targetDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {projectMilestones.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-medium text-fg-secondary">Milestones</h3>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {projectMilestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs text-fg-secondary">
                        <Flag
                          size={12}
                          className={m.completed ? "text-[#4cb782]" : "text-[#e8a53f]"}
                          fill="currentColor"
                        />
                        <span className="flex-1 truncate text-fg">{m.title}</span>
                        <span>
                          {new Date(m.targetDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="text-xs font-medium text-fg-secondary">
                  {project?.name ?? "Project"} issues ({projectIssues.length})
                </h3>
                <div className="mt-2 flex flex-col gap-3">
                  {statusColumns.map((column) => {
                    const columnIssues = projectIssues.filter((i) => i.status.id === column.id);
                    if (columnIssues.length === 0) return null;
                    const ColumnIcon = column.icon
                      ? STATUS_ICONS[column.icon] ?? DefaultStatusIcon
                      : DefaultStatusIcon;
                    return (
                      <div key={column.id}>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-fg-secondary">
                          <ColumnIcon size={12} style={{ color: column.color }} />
                          <span>{column.label}</span>
                          <span>{columnIssues.length}</span>
                        </div>
                        <div className="mt-1 flex flex-col">
                          {columnIssues.map((issue) => (
                            <button
                              key={issue.id}
                              type="button"
                              onClick={() => openIssue(issue.id)}
                              className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-surface-hover"
                            >
                              <span className="w-14 shrink-0 text-fg-tertiary">
                                {issue.identifier}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-fg">{issue.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {projectIssues.length === 0 && (
                    <p className="text-xs text-fg-secondary">
                      This project has no issues yet — progress will track once some exist.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
