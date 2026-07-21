"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Editor, Range } from "@tiptap/react";

export interface SlashCommandItem {
  label: string;
  description: string;
  icon: React.ElementType;
  run: (editor: Editor, range: Range) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  function SlashCommandList({ items, command }, ref) {
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [items]);

    function select(index: number) {
      const item = items[index];
      if (item) command(item);
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (items.length === 0) return false;
        if (event.key === "ArrowDown") {
          setSelected((s) => (s + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelected((s) => (s - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          select(selected);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="rounded-md border border-border bg-bg px-3 py-2 text-xs text-fg-tertiary shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          No matching blocks
        </div>
      );
    }

    return (
      <div className="flex max-h-72 w-64 flex-col gap-0.5 overflow-y-auto rounded-md border border-border bg-bg p-1 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => select(index)}
            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
              index === selected ? "bg-surface-hover" : ""
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-fg-secondary">
              <item.icon size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-fg">{item.label}</p>
              <p className="truncate text-[11px] text-fg-tertiary">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }
);
