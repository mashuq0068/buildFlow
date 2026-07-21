"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { AddToRoadmapModal } from "@/components/roadmap/add-to-roadmap-modal";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useGoalsStore } from "@/lib/stores/goals-store";

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
  const projects = useProjectsStore((s) => s.projects);
  const goals = useGoalsStore((s) => s.goals);
  const [addToRoadmapOpen, setAddToRoadmapOpen] = useState(false);

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
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setAddToRoadmapOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              Add to Roadmap
            </button>
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
                      </div>
                      <span className="text-xs text-fg-secondary">
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
                        className="absolute inset-y-1 rounded"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: project.color,
                        }}
                      />
                      {projectGoals.map((goal) => (
                        <div
                          key={goal.id}
                          title={goal.title}
                          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-bg bg-fg"
                          style={{ left: `${toPercent(goal.targetDate)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-fg-secondary">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rotate-45 border border-bg bg-fg" />
                Goal target date (hover for details)
              </span>
            </div>
          </div>
        </main>
      </div>
      <AddToRoadmapModal open={addToRoadmapOpen} onOpenChange={setAddToRoadmapOpen} />
    </div>
  );
}
