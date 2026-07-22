import { io, type Socket } from "socket.io-client";
import { useIssuesStore } from "@/lib/stores/issues-store";
import { useProjectChatStore } from "@/lib/stores/project-chat-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { mapComment, mapChatMessage } from "@/lib/api/mappers";
import type { ReactionSummary } from "@/lib/types";

let socket: Socket | null = null;

function socketBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

// Server aggregates reactedByMe relative to whichever user triggered the mutation —
// fine for that user's own REST response, wrong for everyone else receiving the same
// payload over the socket. Recompute it locally from the raw userIds it also sends.
function fixReactedByMe(reactions: ReactionSummary[]): ReactionSummary[] {
  const currentUserId = useAuthStore.getState().user?.id;
  return reactions.map((r) => ({
    ...r,
    reactedByMe: currentUserId ? r.userIds.includes(currentUserId) : false,
  }));
}

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(socketBaseUrl(), { withCredentials: true });

  socket.on("comment:created", ({ issueId, comment }) => {
    const mapped = mapComment(comment);
    useIssuesStore.getState().upsertComment(issueId, { ...mapped, reactions: fixReactedByMe(mapped.reactions) });
  });
  socket.on("comment:updated", ({ issueId, comment }) => {
    const mapped = mapComment(comment);
    useIssuesStore.getState().upsertComment(issueId, { ...mapped, reactions: fixReactedByMe(mapped.reactions) });
  });
  socket.on("comment:deleted", ({ issueId, commentId }) => {
    useIssuesStore.getState().removeComment(issueId, commentId);
  });

  socket.on("chat:created", ({ projectId, message }) => {
    const mapped = mapChatMessage(message);
    useProjectChatStore
      .getState()
      .upsertMessage(projectId, { ...mapped, reactions: fixReactedByMe(mapped.reactions) });
  });
  socket.on("chat:updated", ({ projectId, message }) => {
    const mapped = mapChatMessage(message);
    useProjectChatStore
      .getState()
      .upsertMessage(projectId, { ...mapped, reactions: fixReactedByMe(mapped.reactions) });
  });
  socket.on("chat:deleted", ({ projectId, messageId }) => {
    useProjectChatStore.getState().removeMessage(projectId, messageId);
  });

  return socket;
}

export function joinIssueRoom(issueId: string) {
  getSocket().emit("join:issue", issueId);
}
export function leaveIssueRoom(issueId: string) {
  getSocket().emit("leave:issue", issueId);
}
export function joinProjectRoom(projectId: string) {
  getSocket().emit("join:project", projectId);
}
export function leaveProjectRoom(projectId: string) {
  getSocket().emit("leave:project", projectId);
}
