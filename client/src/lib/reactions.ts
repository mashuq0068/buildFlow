import type { ReactionSummary } from "@/lib/types";

/** Optimistically add/remove the current user from an emoji's reaction bucket —
 * mirrors the server's aggregation shape so the UI updates before the request resolves. */
export function toggleReactionLocally(
  reactions: ReactionSummary[],
  emoji: string,
  userId: string,
  userName: string
): ReactionSummary[] {
  const existing = reactions.find((r) => r.emoji === emoji);

  if (!existing) {
    return [...reactions, { emoji, count: 1, reactedByMe: true, userNames: [userName], userIds: [userId] }];
  }

  if (existing.reactedByMe) {
    const count = existing.count - 1;
    if (count <= 0) return reactions.filter((r) => r.emoji !== emoji);
    return reactions.map((r) =>
      r.emoji === emoji
        ? {
            ...r,
            count,
            reactedByMe: false,
            userIds: r.userIds.filter((id) => id !== userId),
            userNames: r.userNames.filter((name) => name !== userName),
          }
        : r
    );
  }

  return reactions.map((r) =>
    r.emoji === emoji
      ? { ...r, count: r.count + 1, reactedByMe: true, userIds: [...r.userIds, userId], userNames: [...r.userNames, userName] }
      : r
  );
}
