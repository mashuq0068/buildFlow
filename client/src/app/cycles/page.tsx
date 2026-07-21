"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { NewCycleModal } from "@/components/cycles/new-cycle-modal";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useCyclesStore } from "@/lib/stores/cycles-store";
import { useCurrentUser } from "@/lib/current-user";
import { isProjectVisible } from "@/lib/project-visibility";

function formatRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${new Date(start).toLocaleDateString("en-US", opts)} – ${new Date(end).toLocaleDateString("en-US", opts)}`;
}

export default function CyclesPage() {
  const issues = useIssuesStore((s) => s.issues);
  const allProjects = useProjectsStore((s) => s.projects);
  const currentUser = useCurrentUser();
  const projects = allProjects.filter((p) =>
    isProjectVisible(p, currentUser?.name, currentUser?.role)
  );
  const visibleProjectIds = new Set(projects.map((p) => p.id));
  const allCycles = useCyclesStore((s) => s.cycles);
  const cycles = allCycles.filter((c) => visibleProjectIds.has(c.projectId));
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const [newCycleOpen, setNewCycleOpen] = useState(false);

  const today = "2026-07-19";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Cycles"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setNewCycleOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              New Cycle
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cycles.map((cycle) => {
              const project = projects.find((p) => p.id === cycle.projectId);
              const cycleIssues = issues.filter((i) => i.cycleId === cycle.id);
              const done = cycleIssues.filter((i) => i.status === "done").length;
              const progress =
                cycleIssues.length === 0 ? 0 : Math.round((done / cycleIssues.length) * 100);
              const isActive = today >= cycle.startDate && today <= cycle.endDate;

              return (
                <Link
                  key={cycle.id}
                  href={`/cycles/board?id=${cycle.id}`}
                  className="flex flex-col rounded-md border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-fg">{cycle.name}</h2>
                    {isActive && (
                      <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-fg">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-fg-secondary">
                    {project?.name} · {formatRange(cycle.startDate, cycle.endDate)}
                  </p>
                  {cycle.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-fg-secondary">
                      {cycle.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-fg-secondary">
                    <span>{cycleIssues.length} work items</span>
                    <span>{progress}% done</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-fg transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
      <NewCycleModal open={newCycleOpen} onOpenChange={setNewCycleOpen} />
    </div>
  );
}
