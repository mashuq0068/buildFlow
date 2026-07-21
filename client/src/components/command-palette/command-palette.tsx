"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import {
  Plus,
  LayoutGrid,
  List,
  Sun,
  Moon,
  CircleDot,
  SignalLow,
  SignalMedium,
  SignalHigh,
  AlertTriangle,
  Minus,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useIssuesStore } from "@/lib/stores/issues-store";
import type { IssuePriority } from "@/lib/types";

const PRIORITY_ICON: Record<IssuePriority, React.ElementType> = {
  no_priority: Minus,
  low: SignalLow,
  medium: SignalMedium,
  high: SignalHigh,
  urgent: AlertTriangle,
};

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const setBoardView = useUIStore((s) => s.setBoardView);
  const openIssue = useUIStore((s) => s.openIssue);
  const issues = useIssuesStore((s) => s.issues);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  function runAndClose(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="fixed inset-0 z-50 bg-black/40"
      contentClassName="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-bg shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
      shouldFilter
    >
      <div className="flex items-center border-b border-border px-3">
        <Command.Input
          placeholder="Type a command or search issues..."
          className="w-full bg-transparent py-3 text-sm text-fg placeholder:text-fg-tertiary outline-none"
        />
        <kbd className="rounded border border-border-strong px-1.5 py-0.5 text-[10px] text-fg-tertiary">
          Esc
        </kbd>
      </div>

      <Command.List className="max-h-96 overflow-y-auto p-1.5">
        <Command.Empty className="py-6 text-center text-xs text-fg-tertiary">
          No results found.
        </Command.Empty>

        <Command.Group
          heading="Actions"
          className="px-2 py-1 text-[11px] font-medium text-fg-tertiary [&_[cmdk-group-items]]:mt-1"
        >
          <Command.Item
            onSelect={() => runAndClose(() => setNewIssueOpen(true))}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-fg data-[selected=true]:bg-surface-hover"
          >
            <Plus size={14} /> Create new issue
          </Command.Item>
          <Command.Item
            onSelect={() => runAndClose(() => setBoardView("board"))}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-fg data-[selected=true]:bg-surface-hover"
          >
            <LayoutGrid size={14} /> Switch to Board view
          </Command.Item>
          <Command.Item
            onSelect={() => runAndClose(() => setBoardView("list"))}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-fg data-[selected=true]:bg-surface-hover"
          >
            <List size={14} /> Switch to List view
          </Command.Item>
          <Command.Item
            onSelect={() =>
              runAndClose(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-fg data-[selected=true]:bg-surface-hover"
          >
            {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            Toggle theme
          </Command.Item>
        </Command.Group>

        <Command.Group
          heading="Issues"
          className="px-2 py-1 text-[11px] font-medium text-fg-tertiary [&_[cmdk-group-items]]:mt-1"
        >
          {issues.map((issue) => {
            const Icon = PRIORITY_ICON[issue.priority];
            return (
              <Command.Item
                key={issue.id}
                value={`${issue.identifier} ${issue.title}`}
                onSelect={() => runAndClose(() => openIssue(issue.id))}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-fg data-[selected=true]:bg-surface-hover"
              >
                <Icon size={13} className="shrink-0 text-fg-tertiary" />
                <span className="w-14 shrink-0 text-xs text-fg-tertiary">{issue.identifier}</span>
                <span className="truncate">{issue.title}</span>
              </Command.Item>
            );
          })}
          {issues.length === 0 && (
            <Command.Item disabled className="px-2 py-2 text-xs text-fg-tertiary">
              <CircleDot size={13} /> No issues yet
            </Command.Item>
          )}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
