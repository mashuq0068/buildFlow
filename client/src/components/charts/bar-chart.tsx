"use client";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-4 px-1 pt-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-fg">{d.value}</span>
          <div className="flex h-32 w-full items-end rounded-sm bg-surface-hover">
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: d.color ?? "var(--fg)",
                minHeight: d.value > 0 ? 4 : 0,
              }}
            />
          </div>
          <span className="text-[11px] text-fg-tertiary">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
