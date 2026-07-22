"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Open command palette — jump to any issue or action" },
  { keys: ["C"], description: "Create a new issue (when not typing in a field)" },
  { keys: ["Esc"], description: "Close the open panel, modal, or command palette" },
];

export default function HelpPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Help"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-xl rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">Keyboard shortcuts</h2>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <span className="text-sm text-fg-secondary">{shortcut.description}</span>
                  <span className="flex shrink-0 gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="rounded border border-border-strong bg-bg-secondary px-1.5 py-0.5 text-xs text-fg"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 max-w-xl rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-medium text-fg">About BuildFlow</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
              BuildFlow is where your team plans, tracks, and ships work — boards and lists for
              issues, threaded discussions with live updates, cycles for time-boxed planning,
              goals and milestones for the bigger picture, and analytics to see how it&apos;s all
              trending.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
