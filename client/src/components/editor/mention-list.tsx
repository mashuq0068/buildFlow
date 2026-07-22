"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import type { Person } from "@/lib/types";

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: Person[];
  command: (item: { id: string; label: string }) => void;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(function MentionList(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  function select(index: number) {
    const item = items[index];
    if (item) command({ id: item.id, label: item.name });
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
        No matching people
      </div>
    );
  }

  return (
    <div className="flex max-h-56 w-56 flex-col gap-0.5 overflow-y-auto rounded-md border border-border bg-bg p-1 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => select(index)}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
            index === selected ? "bg-surface-hover text-fg" : "text-fg-secondary"
          }`}
        >
          <Avatar person={item} size={20} />
          {item.name}
        </button>
      ))}
    </div>
  );
});
