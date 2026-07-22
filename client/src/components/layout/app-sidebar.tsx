"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Inbox,
  LayoutGrid,
  Settings,
  ChevronsUpDown,
  Plus,
  CircleDot,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
  LayoutDashboard,
  ShieldCheck,
  User,
  Check,
  X,
  Star,
  FileEdit,
  RefreshCw,
  Map,
  Target,
  Users,
  Plug,
  HelpCircle,
  MessageSquare,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCurrentUser } from "@/lib/current-user";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { NewWorkspaceModal } from "@/components/workspace/new-workspace-modal";
import { BrandLogo } from "@/components/brand-logo";
import { Avatar } from "@/components/ui/avatar";

const NAV_SECTIONS = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Inbox", icon: Inbox, href: "/inbox" },
      { label: "My Issues", icon: CircleDot, href: "/my-issues" },
      { label: "Favorites", icon: Star, href: "/favorites" },
      { label: "Drafts", icon: FileEdit, href: "/drafts" },
    ],
  },
  {
    title: "Planning",
    items: [
      { label: "Projects", icon: LayoutGrid, href: "/projects" },
      { label: "Cycles", icon: RefreshCw, href: "/cycles" },
      { label: "Roadmap", icon: Map, href: "/roadmap" },
      { label: "Goals", icon: Target, href: "/goals" },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
      { label: "Members", icon: Users, href: "/members" },
      { label: "Permissions", icon: ShieldCheck, href: "/permissions" },
    ],
  },
];

const FOOTER_ITEMS = [
  { label: "Integrations", icon: Plug, href: "/integrations" },
  { label: "Help", icon: HelpCircle, href: "/help" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setNewProjectOpen,
  } = useUIStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProjectId = searchParams.get("id");
  const router = useRouter();

  const currentUser = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);

  const projects = useProjectsStore((s) => s.projects);

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const switchWorkspace = useWorkspaceStore((s) => s.switchWorkspace);
  const workspace = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!workspace) return null;

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-bg-secondary transition-all duration-200 ease-out",
          "md:static md:z-auto md:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "md:w-14" : "md:w-60"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center px-3 pt-3",
            sidebarCollapsed && "md:justify-center md:px-0"
          )}
        >
          <BrandLogo wordmarkClassName={cn(sidebarCollapsed && "md:hidden")} />
        </div>

        <div className="flex shrink-0 items-center gap-1 px-3 py-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                title={workspace.name}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-fg transition-colors hover:bg-surface-hover",
                  sidebarCollapsed && "md:justify-center md:px-0"
                )}
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold text-accent-fg"
                  style={{ backgroundColor: workspace.color }}
                >
                  {workspace.name[0]?.toUpperCase()}
                </span>
                <span className={cn("flex-1 truncate", sidebarCollapsed && "md:hidden")}>
                  {workspace.name}
                </span>
                <ChevronsUpDown
                  size={13}
                  className={cn("shrink-0 text-fg-tertiary", sidebarCollapsed && "md:hidden")}
                />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={6}
                className="z-50 w-56 rounded-md border border-border bg-bg p-1 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
              >
                <div className="px-2 py-1.5 text-[11px] font-medium text-fg-secondary">
                  Workspaces
                </div>
                {workspaces.map((w) => (
                  <DropdownMenu.Item
                    key={w.id}
                    onSelect={() => switchWorkspace(w.id)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg outline-none data-[highlighted]:bg-surface-hover"
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-accent-fg"
                      style={{ backgroundColor: w.color }}
                    >
                      {w.name[0]?.toUpperCase()}
                    </span>
                    <span className="flex-1 truncate">{w.name}</span>
                    {w.id === workspace.id && <Check size={13} className="shrink-0" />}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onSelect={() => setNewWorkspaceOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg outline-none data-[highlighted]:bg-surface-hover"
                >
                  <Building2 size={14} className="shrink-0" />
                  Create workspace
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="hidden shrink-0 rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg md:flex"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            className="shrink-0 rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg md:hidden"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-2">
              <div
                className={cn(
                  "px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-fg-tertiary",
                  sidebarCollapsed && "md:hidden"
                )}
              >
                {section.title}
              </div>
              <nav className="flex flex-col gap-0.5 px-2">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover hover:text-fg",
                        active ? "bg-surface-hover text-fg" : "text-fg-secondary",
                        sidebarCollapsed && "md:justify-center md:px-0"
                      )}
                    >
                      <item.icon size={15} strokeWidth={2} className="shrink-0" />
                      <span className={cn(sidebarCollapsed && "md:hidden")}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          <div
            className={cn(
              "flex items-center justify-between px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-fg-tertiary",
              sidebarCollapsed && "md:hidden"
            )}
          >
            <span>Your Projects</span>
            <button
              type="button"
              onClick={() => setNewProjectOpen(true)}
              aria-label="Add project"
              className="rounded p-0.5 normal-case hover:bg-surface-hover hover:text-fg"
            >
              <Plus size={13} />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5 px-2 pb-2">
            {projects.length === 0 && !sidebarCollapsed && (
              <p className="px-2 py-1.5 text-xs text-fg-tertiary">
                No projects yet — ask an admin to add you to one.
              </p>
            )}
            {projects.map((project) => {
              const href = `/projects/board?id=${project.id}`;
              const chatHref = `/projects/chat?id=${project.id}`;
              const active = pathname === "/projects/board" && activeProjectId === project.id;
              const chatActive = pathname === "/projects/chat" && activeProjectId === project.id;
              return (
                <div key={project.id} className="group flex items-center gap-0.5">
                  <Link
                    href={href}
                    title={project.name}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover hover:text-fg",
                      active ? "bg-surface-hover text-fg" : "text-fg-secondary",
                      sidebarCollapsed && "md:justify-center md:px-0"
                    )}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className={cn("truncate", sidebarCollapsed && "md:hidden")}>
                      {project.name}
                    </span>
                  </Link>
                  {!sidebarCollapsed && (
                    <Link
                      href={chatHref}
                      title={`${project.name} discussion — chat, mentions, replies`}
                      className={cn(
                        "shrink-0 rounded-md p-1.5 transition-colors hover:bg-surface-hover hover:text-fg",
                        chatActive ? "bg-surface-hover text-fg" : "text-fg-tertiary"
                      )}
                    >
                      <MessageSquare size={13} />
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 flex-col gap-0.5 border-t border-border px-2 py-2">
          {FOOTER_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover hover:text-fg",
                  active ? "bg-surface-hover text-fg" : "text-fg-secondary",
                  sidebarCollapsed && "md:justify-center md:px-0"
                )}
              >
                <item.icon size={15} strokeWidth={2} className="shrink-0" />
                <span className={cn(sidebarCollapsed && "md:hidden")}>{item.label}</span>
              </Link>
            );
          })}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                title={`${currentUser?.name ?? ""} · ${currentUser?.role === "admin" ? "Admin" : "Member"}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg",
                  sidebarCollapsed && "md:justify-center md:px-0"
                )}
              >
                <Avatar person={currentUser ?? { name: "", initials: "" }} size={20} className="text-fg" />
                <span className={cn("flex min-w-0 flex-1 flex-col", sidebarCollapsed && "md:hidden")}>
                  <span className="truncate text-xs font-medium text-fg">{currentUser?.name}</span>
                  <span className="truncate text-[11px] text-fg-secondary">
                    {currentUser?.role === "admin" ? "Admin" : "Member"}
                  </span>
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="top"
                align="start"
                sideOffset={6}
                className="z-50 w-60 rounded-md border border-border bg-bg p-1 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
              >
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-fg">{currentUser?.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-fg-secondary">
                    {currentUser?.role === "admin" ? (
                      <ShieldCheck size={11} />
                    ) : (
                      <User size={11} />
                    )}
                    <span className="capitalize">{currentUser?.role}</span>
                  </p>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg outline-none data-[highlighted]:bg-surface-hover"
                >
                  <LogOut size={14} className="shrink-0" />
                  Log out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </aside>
      <NewWorkspaceModal open={newWorkspaceOpen} onOpenChange={setNewWorkspaceOpen} />
    </>
  );
}
