"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckSquare,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMembersStore } from "@/lib/stores/members-store";
import { uploadFile } from "@/lib/upload";
import { createMentionSuggestion } from "./mention-suggestion";
import { SlashCommand } from "./slash-command-extension";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  /** Enable slash-command menu + full block toolbar. Off by default for compact comment composers. */
  fullFeatured?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Add a description...",
  className,
  minHeight = 80,
  fullFeatured = false,
}: RichTextEditorProps) {
  const members = useMembersStore((s) => s.members);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension.configure({ HTMLAttributes: { class: "editor-image" } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: createMentionSuggestion(() => useMembersStore.getState().members),
      }),
      ...(fullFeatured ? [SlashCommand] : []),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-editor text-sm text-fg-secondary leading-relaxed focus:outline-none",
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith("image/")) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        uploadFile(file)
          .then((uploaded) => {
            if (!editor) return;
            const insertPos = pos ?? editor.state.selection.from;
            editor.chain().focus().insertContentAt(insertPos, { type: "image", attrs: { src: uploaded.url } }).run();
          })
          .catch(() => {});
        return true;
      },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/")
        );
        if (!file) return false;
        event.preventDefault();
        uploadFile(file)
          .then((uploaded) => {
            editor?.chain().focus().setImage({ src: uploaded.url }).run();
          })
          .catch(() => {});
        return true;
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;
  const ed = editor;

  async function handleImageButton() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const uploaded = await uploadFile(file);
        ed.chain().focus().setImage({ src: uploaded.url }).run();
      } catch {
        // no-op — no toast surface inside the editor itself
      }
    };
    input.click();
  }

  function handleLinkButton() {
    const previousUrl = ed.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    ed.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-2 flex flex-wrap items-center gap-0.5 border-b border-border pb-2">
        {fullFeatured && (
          <>
            <ToolbarButton
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              icon={Heading1}
              label="Heading 1"
            />
            <ToolbarButton
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              icon={Heading2}
              label="Heading 2"
            />
            <span className="mx-1 h-4 w-px bg-border" />
          </>
        )}
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={Bold}
          label="Bold"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={Italic}
          label="Italic"
        />
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={Strikethrough}
          label="Strikethrough"
        />
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={List}
          label="Bullet list"
        />
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrdered}
          label="Numbered list"
        />
        {fullFeatured && (
          <ToolbarButton
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            icon={CheckSquare}
            label="Checklist"
          />
        )}
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={Quote}
          label="Quote"
        />
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          icon={Code}
          label="Code block"
        />
        <ToolbarButton active={editor.isActive("link")} onClick={handleLinkButton} icon={LinkIcon} label="Link" />
        {fullFeatured && (
          <>
            <ToolbarButton
              active={false}
              onClick={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }
              icon={TableIcon}
              label="Table"
            />
            <ToolbarButton active={false} onClick={handleImageButton} icon={ImageIcon} label="Image" />
          </>
        )}
      </div>
      <EditorContent editor={editor} style={{ minHeight }} />
      {fullFeatured && (
        <p className="mt-2 text-[11px] text-fg-tertiary">
          Type <span className="font-mono">/</span> for blocks, <span className="font-mono">@</span> to
          mention someone, or drag &amp; drop an image.
        </p>
      )}
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      className={cn(
        "rounded p-1.5 transition-colors",
        active ? "bg-surface-hover text-fg" : "text-fg-tertiary hover:bg-surface-hover hover:text-fg"
      )}
    >
      <Icon size={13} />
    </button>
  );
}

export type { Editor };
