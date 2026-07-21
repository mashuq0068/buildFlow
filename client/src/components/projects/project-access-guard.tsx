"use client";

import { Lock } from "lucide-react";
import type { Project } from "@/lib/types";

export function ProjectAccessGuard({
  project,
  children,
}: {
  project: Project | undefined;
  children: React.ReactNode;
}) {
  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-surface-hover text-fg-secondary">
          <Lock size={16} />
        </span>
        <p className="text-sm font-medium text-fg">You don&apos;t have access to this project</p>
        <p className="max-w-xs text-xs text-fg-secondary">
          This project doesn&apos;t exist, or you&apos;re not a member of it yet — ask an admin to
          add you.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
