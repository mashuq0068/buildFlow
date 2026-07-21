"use client";

import { Lock } from "lucide-react";
import { useCurrentUser } from "@/lib/current-user";
import { isProjectVisible } from "@/lib/project-visibility";
import type { Project } from "@/lib/types";

export function ProjectAccessGuard({
  project,
  children,
}: {
  project: Project | undefined;
  children: React.ReactNode;
}) {
  const currentUser = useCurrentUser();

  if (project && !isProjectVisible(project, currentUser?.name, currentUser?.role)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-surface-hover text-fg-secondary">
          <Lock size={16} />
        </span>
        <p className="text-sm font-medium text-fg">You don&apos;t have access to this project</p>
        <p className="max-w-xs text-xs text-fg-secondary">
          Ask an admin to add you as a member of {project.name} to see its issues and chat.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
