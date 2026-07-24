"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { toast } from "sonner";
import {
  SiGithub,
  SiSlack,
  SiFigma,
  SiNotion,
  SiLinear,
  SiJira,
  SiGooglecalendar,
} from "react-icons/si";

const INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    description: "Link pull requests to issues and auto-close on merge.",
    icon: SiGithub,
    iconColor: "#ffffff",
    tileClassName: "bg-[#181717]",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified in a channel when issues change status.",
    icon: SiSlack,
    iconColor: "#4A154B",
    tileClassName: "bg-white border border-neutral-200",
  },
  {
    id: "figma",
    name: "Figma",
    description: "Attach design files directly to issues.",
    icon: SiFigma,
    iconColor: "#F24E1E",
    tileClassName: "bg-white border border-neutral-200",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Turn Notion docs into issues, and link back to specs.",
    icon: SiNotion,
    iconColor: "#ffffff",
    tileClassName: "bg-black",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Two-way sync issues and statuses with a Linear team.",
    icon: SiLinear,
    iconColor: "#ffffff",
    tileClassName: "bg-[#5E6AD2]",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Import epics and stories, keep both trackers in sync.",
    icon: SiJira,
    iconColor: "#2684FF",
    tileClassName: "bg-white border border-neutral-200",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sync cycle start/end dates to your calendar.",
    icon: SiGooglecalendar,
    iconColor: "#4285F4",
    tileClassName: "bg-white border border-neutral-200",
  },
];

export default function IntegrationsPage() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

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
            More integrations are on the way — connect below to get notified when one launches.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-surface p-4"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md ${integration.tileClassName}`}
                  >
                    <Icon size={20} color={integration.iconColor} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-medium text-fg">{integration.name}</h2>
                      <span className="shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-fg-secondary">
                        Not connected
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-fg-secondary">
                      {integration.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => toast(`${integration.name} integration is coming soon`)}
                      className="mt-3 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                    >
                      Connect
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