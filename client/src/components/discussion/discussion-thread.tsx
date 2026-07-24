"use client";

import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Send, Paperclip, Smile, Pencil, Trash2, X, FileText, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Avatar } from "@/components/ui/avatar";
import { sanitizeHtml } from "@/lib/sanitize";
import { uploadFile, type UploadedFile } from "@/lib/upload";
import { isEmptyHtml } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/lib/stores/confirm-store";
import type { Comment, ChatMessage, ReactionSummary } from "@/lib/types";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "👀", "🚀"];

type DiscussionItem = Comment | ChatMessage;

interface DiscussionThreadProps {
  items: DiscussionItem[];
  currentUserId?: string;
  onSubmit: (body: string, parentId?: string, attachments?: UploadedFile[]) => Promise<void>;
  onEdit: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleReaction: (id: string, emoji: string) => Promise<void>;
  emptyMessage: string;
  placeholder?: string;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function DiscussionThread({
  items,
  currentUserId,
  onSubmit,
  onEdit,
  onDelete,
  onToggleReaction,
  emptyMessage,
  placeholder = "Write a message...",
}: DiscussionThreadProps) {
  const topLevel = useMemo(() => items.filter((i) => !i.parentId), [items]);
  const repliesByParent = useMemo(() => {
    const map = new Map<string, DiscussionItem[]>();
    for (const item of items) {
      if (!item.parentId) continue;
      map.set(item.parentId, [...(map.get(item.parentId) ?? []), item]);
    }
    return map;
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {topLevel.length === 0 && (
          <p className="py-6 text-center text-xs text-fg-tertiary">{emptyMessage}</p>
        )}
        {topLevel.map((item) => (
          <ThreadItem
            key={item.id}
            item={item}
            replies={repliesByParent.get(item.id) ?? []}
            currentUserId={currentUserId}
            onSubmit={onSubmit}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleReaction={onToggleReaction}
          />
        ))}
      </div>

      <Composer onSubmit={(body, attachments) => onSubmit(body, undefined, attachments)} placeholder={placeholder} />
    </div>
  );
}

function ThreadItem({
  item,
  replies,
  currentUserId,
  onSubmit,
  onEdit,
  onDelete,
  onToggleReaction,
}: {
  item: DiscussionItem;
  replies: DiscussionItem[];
  currentUserId?: string;
  onSubmit: DiscussionThreadProps["onSubmit"];
  onEdit: DiscussionThreadProps["onEdit"];
  onDelete: DiscussionThreadProps["onDelete"];
  onToggleReaction: DiscussionThreadProps["onToggleReaction"];
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Bubble
        item={item}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleReaction={onToggleReaction}
        onReply={() => setReplying((v) => !v)}
      />
      {replies.length > 0 && (
        <div className="ml-8 flex flex-col gap-2 border-l border-border pl-3">
          {replies.map((reply) => (
            <Bubble
              key={reply.id}
              item={reply}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleReaction={onToggleReaction}
            />
          ))}
        </div>
      )}
      {replying && (
        <div className="ml-8">
          <Composer
            compact
            placeholder="Reply..."
            onSubmit={async (body, attachments) => {
              await onSubmit(body, item.id, attachments);
              setReplying(false);
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}

function Bubble({
  item,
  currentUserId,
  onEdit,
  onDelete,
  onToggleReaction,
  onReply,
}: {
  item: DiscussionItem;
  currentUserId?: string;
  onEdit: DiscussionThreadProps["onEdit"];
  onDelete: DiscussionThreadProps["onDelete"];
  onToggleReaction: DiscussionThreadProps["onToggleReaction"];
  onReply?: () => void;
}) {
  const isMe = item.author.id === currentUserId;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.body);
  const [saving, setSaving] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);

  async function handleSaveEdit() {
    if (isEmptyHtml(draft)) return;
    setSaving(true);
    try {
      await onEdit(item.id, draft);
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = await confirmAction({
      title: "Delete this message?",
      description: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await onDelete(item.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  async function handleReact(emoji: string) {
    setReactionPickerOpen(false);
    try {
      await onToggleReaction(item.id, emoji);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to react");
    }
  }

  return (
    <div className={cn("group flex items-end gap-2", isMe && "flex-row-reverse")}>
      <Avatar person={item.author} size={24} />
      <div className={cn("flex max-w-[80%] flex-col gap-1", isMe && "items-end")}>
        {!isMe && <span className="px-1 text-[11px] font-medium text-fg-secondary">{item.author.name}</span>}

        {editing ? (
          <div className="w-72 rounded-2xl border border-border bg-surface p-2">
            <RichTextEditor value={draft} onChange={setDraft} minHeight={40} />
            <div className="mt-2 flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(item.body);
                }}
                className="rounded-md px-2 py-1 text-xs text-fg-secondary hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-fg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "prose-editor rounded-2xl px-3 py-2 text-sm leading-relaxed",
              isMe ? "rounded-br-sm bg-accent/10 text-fg" : "rounded-bl-sm bg-surface-hover text-fg"
            )}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }}
          />
        )}

        {item.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.attachments.map((a) =>
              a.isImage ? (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.name} className="max-h-40 rounded-md border border-border" />
                </a>
              ) : (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs text-fg-secondary hover:bg-surface-hover"
                >
                  <FileText size={12} />
                  {a.name}
                  <span className="text-fg-tertiary">({a.size})</span>
                </a>
              )
            )}
          </div>
        )}

        {item.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.reactions.map((r: ReactionSummary) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => handleReact(r.emoji)}
                title={r.userNames.join(", ")}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px]",
                  r.reactedByMe
                    ? "border-fg bg-surface-hover text-fg"
                    : "border-border text-fg-secondary hover:bg-surface-hover"
                )}
              >
                <span>{r.emoji}</span>
                <span>{r.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 px-1 text-[10px] text-fg-tertiary opacity-60 transition-opacity group-hover:opacity-100">
          <span>
            {timeAgo(item.createdAt)}
            {item.editedAt && " · edited"}
          </span>
          <Popover.Root open={reactionPickerOpen} onOpenChange={setReactionPickerOpen}>
            <Popover.Trigger asChild>
              <button type="button" className="hover:text-fg" aria-label="Add reaction">
                <Smile size={11} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                sideOffset={4}
                className="z-50 flex gap-1 rounded-md border border-border bg-bg p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReact(emoji)}
                    className="rounded p-1 text-sm hover:bg-surface-hover"
                  >
                    {emoji}
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {onReply && (
            <button type="button" onClick={onReply} className="flex items-center gap-0.5 hover:text-fg">
              <CornerDownRight size={11} /> Reply
            </button>
          )}
          {isMe && !editing && (
            <>
              <button type="button" onClick={() => setEditing(true)} className="hover:text-fg">
                <Pencil size={11} />
              </button>
              <button type="button" onClick={handleDelete} className="hover:text-[#e5484d]">
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Composer({
  onSubmit,
  onCancel,
  placeholder = "Write a message...",
  compact = false,
}: {
  onSubmit: (body: string, attachments?: UploadedFile[]) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleFilePick() {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const uploaded = await uploadFile(file);
        setPendingFiles((prev) => [...prev, uploaded]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function handleSubmit() {
    if (isEmptyHtml(body) && pendingFiles.length === 0) return;
    setSending(true);
    try {
      await onSubmit(body, pendingFiles.length ? pendingFiles : undefined);
      setBody("");
      setPendingFiles([]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn("border-t border-border pt-3", compact && "border-t-0 pt-0")}>
      <div className="rounded-2xl border border-border bg-surface px-3 py-2">
        <RichTextEditor value={body} onChange={setBody} placeholder={placeholder} minHeight={compact ? 32 : 48} />
        {pendingFiles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pendingFiles.map((f, i) => (
              <span
                key={`${f.url}-${i}`}
                className="flex items-center gap-1 rounded-md border border-border bg-bg px-2 py-1 text-xs text-fg-secondary"
              >
                {f.name}
                <button
                  type="button"
                  onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-fg-tertiary hover:text-fg"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleFilePick}
            disabled={uploading}
            aria-label="Attach file"
            className="rounded-md p-1.5 text-fg-tertiary transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40"
          >
            <Paperclip size={14} />
          </button>
          <div className="flex items-center gap-1.5">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md px-2 py-1 text-xs text-fg-secondary hover:bg-surface-hover"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending || (isEmptyHtml(body) && pendingFiles.length === 0)}
              aria-label="Send message"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
