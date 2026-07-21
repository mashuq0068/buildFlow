import { Extension, ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table as TableIcon,
  Image as ImageIcon,
} from "lucide-react";
import { SlashCommandList, type SlashCommandListRef, type SlashCommandItem } from "./slash-command-list";
import { uploadFile } from "@/lib/upload";

function pickAndUploadImage(onUploaded: (url: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file);
      onUploaded(uploaded.url);
    } catch {
      // swallow — the editor has no toast surface; upload failures just leave nothing inserted
    }
  };
  input.click();
}

const ALL_ITEMS: SlashCommandItem[] = [
  {
    label: "Heading 1",
    description: "Big section heading",
    icon: Heading1,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    label: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    label: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    label: "Bullet list",
    description: "Simple unordered list",
    icon: List,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    description: "Ordered list with numbers",
    icon: ListOrdered,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    label: "Checklist",
    description: "Track tasks with checkboxes",
    icon: CheckSquare,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    label: "Quote",
    description: "Capture a quote",
    icon: Quote,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    label: "Code block",
    description: "Syntax-highlighted code",
    icon: Code,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    label: "Table",
    description: "3x3 table",
    icon: TableIcon,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    label: "Divider",
    description: "Horizontal divider line",
    icon: Minus,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    label: "Image",
    description: "Upload and embed an image",
    icon: ImageIcon,
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      pickAndUploadImage((url) => {
        editor.chain().focus().setImage({ src: url }).run();
      });
    },
  },
];

const suggestionOptions: Omit<SuggestionOptions<SlashCommandItem>, "editor"> = {
  char: "/",
  items: ({ query }) => {
    const q = query.toLowerCase();
    return ALL_ITEMS.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 10);
  },
  command: ({ editor, range, props }) => {
    props.run(editor, range);
  },
  render: () => {
    let component: ReactRenderer<SlashCommandListRef>;
    let popup: TippyInstance[];

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandList, {
          props: { items: props.items, command: props.command },
          editor: props.editor,
        });
        if (!props.clientRect) return;
        popup = tippy("body", {
          getReferenceClientRect: () => props.clientRect!()!,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate(props) {
        component.updateProps({ items: props.items, command: props.command });
        if (!props.clientRect) return;
        popup[0]?.setProps({ getReferenceClientRect: () => props.clientRect!()! });
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },
      onExit() {
        popup[0]?.destroy();
        component.destroy();
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return { suggestion: suggestionOptions };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
