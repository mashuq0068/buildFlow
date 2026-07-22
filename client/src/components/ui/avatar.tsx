import { cn } from "@/lib/utils";
import type { Person } from "@/lib/types";

export function Avatar({
  person,
  size = 20,
  className,
  ringClassName = "ring-1 ring-border",
}: {
  person: Pick<Person, "name" | "initials" | "avatarUrl">;
  size?: number;
  className?: string;
  ringClassName?: string;
}) {
  if (person.avatarUrl) {
    return (
      <img
        src={person.avatarUrl}
        alt={person.name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", ringClassName, className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      title={person.name}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-surface-hover font-medium text-fg-secondary",
        ringClassName,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.42)) }}
    >
      {person.initials}
    </span>
  );
}
