"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useCurrentUser } from "@/lib/current-user";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/types";

const EMPTY_COMMENTS: Comment[] = [];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CommentThread({ issueId }: { issueId: string }) {
  const comments = useIssuesStore((s) => s.comments[issueId] ?? EMPTY_COMMENTS);
  const addComment = useIssuesStore((s) => s.addComment);
  const currentUser = useCurrentUser();
  const [draft, setDraft] = useState("");

  function handleSubmit() {
    const body = draft.trim();
    if (!body) return;
    addComment(issueId, body);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="py-6 text-center text-xs text-fg-tertiary">
            No messages yet — start the conversation.
          </p>
        )}
        {comments.map((comment) => {
          const isMe = comment.author.name === currentUser?.name;
          return (
            <div key={comment.id} className={cn("flex items-end gap-2", isMe && "flex-row-reverse")}>
              <span
                title={comment.author.name}
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium text-fg-secondary ring-1 ring-border"
              >
                {comment.author.initials}
              </span>
              <div className={cn("flex max-w-[80%] flex-col gap-0.5", isMe && "items-end")}>
                {!isMe && <span className="px-1 text-[11px] font-medium text-fg-secondary">{comment.author.name}</span>}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    isMe
                      ? "rounded-br-sm bg-accent text-accent-fg"
                      : "rounded-bl-sm bg-surface-hover text-fg"
                  )}
                >
                  {comment.body}
                </div>
                <span className="px-1 text-[10px] text-fg-tertiary">{timeAgo(comment.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-end gap-2 border-t border-border pt-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Message the team..."
          rows={1}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-border-strong"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
