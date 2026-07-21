import DOMPurify from "dompurify";

/**
 * Comment/chat bodies are stored as raw Tiptap HTML and rendered via
 * dangerouslySetInnerHTML — unlike the editor itself (which sanitizes through
 * ProseMirror's schema-aware parser), this bypasses that, so it needs its own
 * sanitization pass before hitting the DOM.
 */
export function sanitizeHtml(html: string) {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "u",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "a",
      "img",
      "span",
      "div",
      "label",
      "input",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "class",
      "data-type",
      "data-id",
      "data-checked",
      "type",
      "checked",
      "disabled",
      "colspan",
      "rowspan",
    ],
  });
}
