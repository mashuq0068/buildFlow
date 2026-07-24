"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { useUIStore } from "@/lib/stores/ui-store";
import { toast } from "sonner";
import {
  siGithub,
  siFigma,
  siNotion,
  siLinear,
  siJira,
  siGooglecalendar,
} from "simple-icons";

function BrandIcon({ icon, color }: { icon: { path: string; title: string }; color: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={20} height={20} fill={color}>
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}


// Slack's icon isn't in simple-icons (see simple-icons/simple-icons#14140),
// so it's drawn manually here using the logo's actual geometric construction.
function SlackLogo() {
  return (
    <svg viewBox="0 0 60 60" width={20} height={20} role="img">
      <title>Slack</title>
      <path
        fill="#36C5F0"
        d="M22,12 a6,6 0 1 1 6,-6 v6z M22,16 a6,6 0 0 1 0,12 h-16 a6,6 0 1 1 0,-12"
      />
      <path
        fill="#2EB67D"
        d="M48,22 a6,6 0 1 1 6,6 h-6z M32,6 a6,6 0 1 1 12,0v16a6,6 0 0 1 -12,0z"
      />
      <path
        fill="#ECB22E"
        d="M38,48 a6,6 0 1 1 -6,6 v-6z M54,32 a6,6 0 0 1 0,12 h-16 a6,6 0 1 1 0,-12"
      />
      <path
        fill="#E01E5A"
        d="M12,38 a6,6 0 1 1 -6,-6 h6z M16,38 a6,6 0 1 1 12,0v16a6,6 0 0 1 -12,0z"
      />
    </svg>
  );
}

const FigmaLogo = () => (
  <svg width="22" height="22" viewBox="0 0 38 57" fill="none">
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" fill="#1ABCFE" />
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0Z" fill="#0ACF83" />
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19Z" fill="#FF7262" />
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5Z" fill="#F24E1E" />
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5Z" fill="#A259FF" />
  </svg>
);
const INTEGRATIONS = [
  {
    id: "github",
    name: "GitHub",
    description: "Link pull requests to issues and auto-close on merge.",
    render: () => <BrandIcon icon={siGithub} color="#ffffff" />,
    tileClassName: "bg-[#181717]",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified in a channel when issues change status.",
    render: () => <SlackLogo />,
    tileClassName: "bg-white border border-neutral-200",
  },
  {
    id: "figma",
    name: "Figma",
    description: "Attach design files directly to issues.",
    render: () => <FigmaLogo />,
    tileClassName: "bg-white border border-neutral-200",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Turn Notion docs into issues, and link back to specs.",
    render: () => <BrandIcon icon={siNotion} color="#ffffff" />,
    tileClassName: "bg-black",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Two-way sync issues and statuses with a Linear team.",
    render: () => <BrandIcon icon={siLinear} color="#ffffff" />,
    tileClassName: "bg-[#5E6AD2]",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Import epics and stories, keep both trackers in sync.",
    render: () => <BrandIcon icon={siJira} color="#2684FF" />,
    tileClassName: "bg-white border border-neutral-200",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sync cycle start/end dates to your calendar.",
    render: () => <BrandIcon icon={siGooglecalendar} color="#4285F4" />,
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
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.id}
                className="flex items-start gap-3 rounded-md border border-border bg-surface p-4"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${integration.tileClassName}`}
                >
                  {integration.render()}
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
                    className="mt-3 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-fg transition-colors hover:opacity-90"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}