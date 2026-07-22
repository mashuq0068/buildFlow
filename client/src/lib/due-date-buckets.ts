function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BUCKETS = 10;

export function buildWeeklyDueBuckets(dueDates: string[]) {
  if (dueDates.length === 0) return [];

  const weekTimes = dueDates.map((d) => startOfWeek(new Date(d)).getTime());
  const min = Math.min(...weekTimes);
  const max = Math.max(...weekTimes);
  const bucketCount = Math.min(MAX_BUCKETS, Math.round((max - min) / WEEK_MS) + 1);

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const time = min + i * WEEK_MS;
    return {
      time,
      label: new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: 0,
    };
  });

  for (const time of weekTimes) {
    const bucket = buckets.find((b) => b.time === time);
    if (bucket) bucket.value += 1;
  }

  return buckets;
}
