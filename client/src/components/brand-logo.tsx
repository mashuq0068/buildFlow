import { Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  iconSize = 18,
  badgeClassName = "size-7",
  className,
  wordmarkClassName,
}: {
  iconSize?: number;
  badgeClassName?: string;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg",
          badgeClassName
        )}
      >
        <Workflow size={iconSize} strokeWidth={2.25} />
      </span>
      <span className={cn("truncate text-sm font-semibold text-fg", wordmarkClassName)}>
        BuildFlow
      </span>
    </div>
  );
}
