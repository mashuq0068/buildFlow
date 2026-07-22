import { useMemo } from "react";
import { useProjectChatStore } from "@/lib/stores/project-chat-store";
import { useChatReadStore } from "@/lib/stores/chat-read-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { useCurrentUser } from "@/lib/current-user";

export function useProjectUnreadCount(projectId: string) {
  const messages = useProjectChatStore((s) => s.messages[projectId]);
  const lastSeenAt = useChatReadStore((s) => s.lastSeenAt[projectId]);
  const currentUser = useCurrentUser();

  return useMemo(() => {
    if (!messages || !currentUser) return 0;
    return messages.filter((m) => m.author.id !== currentUser.id && (!lastSeenAt || m.createdAt > lastSeenAt))
      .length;
  }, [messages, lastSeenAt, currentUser]);
}

export function useTotalUnreadChatCount() {
  const projects = useProjectsStore((s) => s.projects);
  const messages = useProjectChatStore((s) => s.messages);
  const lastSeenAt = useChatReadStore((s) => s.lastSeenAt);
  const currentUser = useCurrentUser();

  return useMemo(() => {
    if (!currentUser) return 0;
    return projects.reduce((total, project) => {
      const projectMessages = messages[project.id];
      if (!projectMessages) return total;
      const seenAt = lastSeenAt[project.id];
      const unread = projectMessages.filter(
        (m) => m.author.id !== currentUser.id && (!seenAt || m.createdAt > seenAt)
      ).length;
      return total + unread;
    }, 0);
  }, [projects, messages, lastSeenAt, currentUser]);
}
