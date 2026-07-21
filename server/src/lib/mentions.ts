/** Extracts user ids from Tiptap Mention nodes rendered as <span data-type="mention" data-id="...">. */
export function extractMentionedUserIds(html: string): string[] {
  const ids = new Set<string>();
  const tagRegex = /<span\b[^>]*>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html))) {
    const tag = match[0];
    if (!/data-type="mention"/.test(tag)) continue;
    const idMatch = /data-id="([^"]+)"/.exec(tag);
    if (idMatch) ids.add(idMatch[1]);
  }
  return Array.from(ids);
}
