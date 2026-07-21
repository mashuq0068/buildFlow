"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { GitBranch, MessageSquare, PenTool, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    description: "Link pull requests to issues and auto-close on merge.",
    icon: GitBranch,
    defaultConnected: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified in a channel when issues change status.",
    icon: MessageSquare,
    defaultConnected: false,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Attach design files directly to issues.",
    icon: PenTool,
    defaultConnected: false,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sync cycle start/end dates to your calendar.",
    icon: Calendar,
    defaultConnected: false,
  },
];

export default function IntegrationsPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.defaultConnected]))
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          title="Integrations"
          onNewIssue={() => setNewIssueOpen(true)}
          onSearch={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-xs text-fg-secondary">
            Demo only — no real OAuth is wired up. Toggling here just updates local UI state.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const isConnected = connected[integration.id];
              const Icon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-surface p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-bg-secondary text-fg-secondary">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-medium text-fg">{integration.name}</h2>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          isConnected
                            ? "bg-[#4cb782]/15 text-[#4cb782]"
                            : "bg-surface-hover text-fg-secondary"
                        )}
                      >
                        {isConnected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-fg-secondary">
                      {integration.description}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setConnected((prev) => ({ ...prev, [integration.id]: !prev[integration.id] }))
                      }
                      className={cn(
                        "mt-3 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
                        isConnected
                          ? "text-fg-secondary hover:bg-surface-hover hover:text-fg"
                          : "bg-accent text-accent-fg hover:opacity-90"
                      )}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </button>
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
