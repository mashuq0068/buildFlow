"use client";

export interface AreaDatum {
  label: string;
  value: number;
}

export function AreaChart({ data, color = "#5e9bd6" }: { data: AreaDatum[]; color?: string }) {
  const width = 320;
  const height = 120;
  const pad = 10;
  const max = Math.max(1, ...data.map((d) => d.value));
  const gradientId = `area-gradient-${color.replace("#", "")}`;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? pad + (i / (data.length - 1)) * (width - pad * 2) : width / 2;
    const y = height - pad - (d.value / max) * (height - pad * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${height - pad} L${points[0].x},${height - pad} Z`
      : "";

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {points.length > 0 && (
          <>
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
            ))}
          </>
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-fg-tertiary">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
