import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = 18 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={cn("animate-spin text-fg-tertiary", className)} />;
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
      <Spinner size={22} />
      {label && <p className="text-xs text-fg-secondary">{label}</p>}
    </div>
  );
}
