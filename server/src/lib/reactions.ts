interface RawReaction {
  emoji: string;
  userId: string;
  user: { name: string };
}

export interface AggregatedReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  userNames: string[];
}

export function aggregateReactions(
  reactions: RawReaction[],
  currentUserId: string
): AggregatedReaction[] {
  const map = new Map<string, AggregatedReaction>();
  for (const r of reactions) {
    const entry = map.get(r.emoji) ?? {
      emoji: r.emoji,
      count: 0,
      reactedByMe: false,
      userNames: [],
    };
    entry.count += 1;
    if (r.userId === currentUserId) entry.reactedByMe = true;
    entry.userNames.push(r.user.name);
    map.set(r.emoji, entry);
  }
  return Array.from(map.values());
}
