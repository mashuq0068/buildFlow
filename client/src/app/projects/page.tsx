"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useCurrentUser } from "@/lib/current-user";
import { isProjectVisible } from "@/lib/project-visibility";

export default function ProjectsPage() {
  const issues = useIssuesStore((s) => s.issues);
  const allProjects = useProjectsStore((s) => s.projects);
  const currentUser = useCurrentUser();
  const projects = allProjects.filter((p) =>
    isProjectVisible(p, currentUser?.name, currentUser?.role)
  );
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setNewProjectOpen = useUIStore((s) => s.setNewProjectOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Projects"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setNewProjectOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              New Project
            </button>
          </div>
          {projects.length === 0 && (
            <p className="text-sm text-fg-secondary">You&apos;re not on any projects yet.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const projectIssues = issues.filter((i) => i.projectId === project.id);
              const done = projectIssues.filter((i) => i.status === "done").length;
              const progress =
                projectIssues.length === 0 ? 0 : Math.round((done / projectIssues.length) * 100);

              return (
                <Link
                  key={project.id}
                  href={`/projects/board?id=${project.id}`}
                  className="flex flex-col rounded-md border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <h2 className="text-sm font-medium text-fg">{project.name}</h2>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-fg-secondary">
                    {project.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-fg-secondary">
                    <span>{projectIssues.length} work items</span>
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
    </div>
  );
}
