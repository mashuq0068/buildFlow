"use client";

import { Search, Plus, Menu, LayoutGrid, List } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

export function AppTopbar({
  title,
  onNewIssue,
  onSearch,
  showViewSwitcher = false,
  rightExtra,
}: {
  title: string;
  onNewIssue?: () => void;
  onSearch?: () => void;
  showViewSwitcher?: boolean;
  rightExtra?: React.ReactNode;
}) {
  const { setMobileSidebarOpen, boardView, setBoardView } = useUIStore();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
          className="shrink-0 rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg md:hidden"
        >
          <Menu size={16} />
        </button>
        <h1 className="truncate text-sm font-medium text-fg">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {showViewSwitcher && (
          <div className="mr-1 hidden items-center gap-0.5 rounded-md border border-border p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setBoardView("board")}
              aria-label="Board view"
              className={cn(
                "rounded p-1 transition-colors",
                boardView === "board"
                  ? "bg-surface-hover text-fg"
                  : "text-fg-tertiary hover:text-fg"
              )}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setBoardView("list")}
              aria-label="List view"
              className={cn(
                "rounded p-1 transition-colors",
                boardView === "list" ? "bg-surface-hover text-fg" : "text-fg-tertiary hover:text-fg"
              )}
            >
              <List size={14} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onSearch}
          className="hidden items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg sm:flex"
        >
          <Search size={13} />
          <span>Search</span>
          <kbd className="ml-1 rounded border border-border-strong px-1 font-sans text-[10px] text-fg-tertiary">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="rounded-md p-1.5 text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg sm:hidden"
        >
          <Search size={15} />
        </button>

        {rightExtra}

        <NotificationBell />
        <ThemeToggle />

        <button
          type="button"
          onClick={onNewIssue}
          className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Issue</span>
        </button>
      </div>
    </header>
  );
}
