"use client";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<Array<DonutDatum & { length: number; offset: number }>>(
    (acc, d) => {
      const length = (d.value / total) * circumference;
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0;
      acc.push({ ...d, length, offset });
      return acc;
    },
    []
  );

  return (
    <div className="flex items-center gap-6">
      <svg width={110} height={110} viewBox="0 0 110 110" className="shrink-0 -rotate-90">
        <circle
          cx={55}
          cy={55}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {segments.map((s) =>
          s.value > 0 ? (
            <circle
              key={s.label}
              cx={55}
              cy={55}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${s.length} ${circumference - s.length}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ) : null
        )}
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-fg-secondary">{d.label}</span>
            <span className="text-fg-secondary">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
