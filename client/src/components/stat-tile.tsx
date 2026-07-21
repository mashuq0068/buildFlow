export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <p className="text-xs text-fg-tertiary">{label}</p>
      <p className="mt-1 text-xl font-semibold text-fg">{value}</p>
    </div>
  );
}
