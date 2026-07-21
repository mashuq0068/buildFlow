"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { PRIORITY_LABEL, type Issue, type Project } from "@/lib/types";
import { stripHtml } from "@/lib/utils";
import { Trash2, Send } from "lucide-react";

function nextIdentifier(issues: Issue[], projects: Project[], projectId: string) {
  const project = projects.find((p) => p.id === projectId);
  const prefix = project?.teamKey ?? "ENG";
  const max = issues
    .filter((i) => i.projectId === projectId)
    .reduce((acc, issue) => {
      const match = issue.identifier.match(/-(\d+)$/);
      return match ? Math.max(acc, Number(match[1])) : acc;
    }, 0);
  return `${prefix}-${max + 1}`;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function DraftsPage() {
  const drafts = useIssuesStore((s) => s.drafts);
  const issues = useIssuesStore((s) => s.issues);
  const publishDraft = useIssuesStore((s) => s.publishDraft);
  const deleteDraft = useIssuesStore((s) => s.deleteDraft);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const projects = useProjectsStore((s) => s.projects);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Drafts"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          {drafts.length === 0 && (
            <p className="text-center text-sm text-fg-secondary">
              No drafts. Start a new issue and choose &quot;Save as draft&quot; to keep it here
              until you&apos;re ready to publish.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {drafts.map((draft) => {
              const project = projects.find((p) => p.id === draft.projectId);
              return (
                <div key={draft.id} className="rounded-md border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg">{draft.title}</p>
                      {draft.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-secondary">
                          {stripHtml(draft.description)}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-fg-secondary">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: project?.color }}
                        />
                        <span>{project?.name}</span>
                        <span>·</span>
                        <span>{PRIORITY_LABEL[draft.priority]}</span>
                        <span>·</span>
                        <span>Updated {timeAgo(draft.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => deleteDraft(draft.id)}
                        aria-label="Delete draft"
                        className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const identifier = nextIdentifier(issues, projects, draft.projectId);
                          publishDraft(draft.id, {
                            id: Math.random().toString(36).slice(2, 10),
                            identifier,
                            title: draft.title,
                            description: draft.description,
                            projectId: draft.projectId,
                            priority: draft.priority,
                            status: "backlog",
                          });
                        }}
                        className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
                      >
                        <Send size={12} />
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
