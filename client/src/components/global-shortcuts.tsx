"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/stores/ui-store";

function isTypingInField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function GlobalShortcuts() {
  const setNewIssueOpen = useUIStore((s) => s.setNewIssueOpen);
  const newIssueOpen = useUIStore((s) => s.newIssueOpen);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingInField(e.target)) return;
      if (newIssueOpen || commandPaletteOpen) return;

      if (e.key === "c") {
        e.preventDefault();
        setNewIssueOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setNewIssueOpen, newIssueOpen, commandPaletteOpen]);

  return null;
}
