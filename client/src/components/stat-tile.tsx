"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/lib/hooks/use-count-up";

export function StatTile({ label, value }: { label: string; value: number | string }) {
  const match = typeof value === "string" ? value.match(/^(\d+)(.*)$/) : null;
  const numericPart = typeof value === "number" ? value : match ? Number(match[1]) : null;
  const suffix = typeof value === "number" ? "" : match ? match[2] : "";
  const animated = useCountUp(numericPart ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-md border border-border bg-surface p-3"
    >
      <p className="text-xs text-fg-tertiary">{label}</p>
      <p className="mt-1 text-xl font-semibold text-fg">
        {numericPart !== null ? `${animated}${suffix}` : value}
      </p>
    </motion.div>
  );
}
