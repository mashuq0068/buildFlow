import { create } from "zustand";
import { api } from "@/lib/api-client";
import { mapIssue, mapComment, mapActivity, mapDraft, priorityToServer } from "@/lib/api/mappers";
import type { Issue, IssuePriority, Comment, ActivityEntry, Draft } from "@/lib/types";
import type { UploadedFile } from "@/lib/upload";

type ServerIssue = Parameters<typeof mapIssue>[0];

interface CreateIssueInput {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  statusId?: string;
  priority?: IssuePriority;
  cycleId?: string;
  labels?: { name: string; color: string }[];
  aiSuggestedLabels?: string[];
  aiSuggestedReasoning?: string;
}

interface UpdateIssueInput {
  title?: string;
  description?: string;
  statusId?: string;
  priority?: IssuePriority;
  assigneeId?: string | null;
  cycleId?: string | null;
}

interface CreateDraftInput {
  title: string;
  description?: string;
  projectId: string;
  priority: IssuePriority;
}

interface IssuesState {
  issues: Issue[];
  loaded: boolean;
  comments: Record<string, Comment[]>;
  activity: Record<string, ActivityEntry[]>;
  favoriteIds: string[];
  drafts: Draft[];

  fetchIssues: (workspaceId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  fetchDrafts: (workspaceId: string) => Promise<void>;
  loadIssueDetail: (issueId: string) => Promise<void>;

  moveIssue: (issueId: string, statusId: string) => Promise<void>;
  reorderWithinStatus: (projectId: string, statusId: string, orderedIds: string[]) => Promise<void>;
  addComment: (
    issueId: string,
    body: string,
    parentId?: string,
    attachments?: UploadedFile[]
  ) => Promise<void>;
  updateComment: (issueId: string, commentId: string, body: string) => Promise<void>;
  deleteComment: (issueId: string, commentId: string) => Promise<void>;
  toggleCommentReaction: (issueId: string, commentId: string, emoji: string) => Promise<void>;
  updateIssue: (issueId: string, patch: UpdateIssueInput) => Promise<void>;
  createIssue: (input: CreateIssueInput) => Promise<Issue>;
  deleteIssue: (issueId: string) => Promise<void>;
  archiveIssue: (issueId: string, archived: boolean) => Promise<void>;
  duplicateIssue: (issueId: string) => Promise<Issue>;
  toggleFavorite: (issueId: string) => Promise<void>;
  saveDraft: (input: CreateDraftInput) => Promise<void>;
  updateDraft: (draftId: string, patch: Partial<CreateDraftInput>) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  publishDraft: (draftId: string) => Promise<Issue>;
  reset: () => void;
}

export const useIssuesStore = create<IssuesState>()((set, get) => ({
  issues: [],
  loaded: false,
  comments: {},
  activity: {},
  favoriteIds: [],
  drafts: [],

  fetchIssues: async (workspaceId) => {
    const raw = await api.get<ServerIssue[]>(`/issues?workspaceId=${workspaceId}`);
    set({ issues: raw.map((i) => mapIssue(i)), loaded: true });
  },

  fetchFavorites: async () => {
    const ids = await api.get<string[]>("/favorites");
    set({ favoriteIds: ids });
  },

  fetchDrafts: async (workspaceId) => {
    const raw = await api.get<Parameters<typeof mapDraft>[0][]>(`/drafts?workspaceId=${workspaceId}`);
    set({ drafts: raw.map(mapDraft) });
  },

  loadIssueDetail: async (issueId) => {
    const raw = await api.get<
      ServerIssue & {
        comments: Parameters<typeof mapComment>[0][];
        activity: Parameters<typeof mapActivity>[0][];
      }
    >(`/issues/${issueId}`);
    set((state) => ({
      comments: { ...state.comments, [issueId]: raw.comments.map(mapComment) },
      activity: { ...state.activity, [issueId]: raw.activity.map(mapActivity) },
    }));
  },

  moveIssue: async (issueId, statusId) => {
    const issue = get().issues.find((i) => i.id === issueId);
    if (!issue || issue.status.id === statusId) return;
    const raw = await api.patch<ServerIssue>(`/issues/${issueId}/status`, { statusId });
    const updated = mapIssue(raw);
    set((state) => ({ issues: state.issues.map((i) => (i.id === issueId ? updated : i)) }));
  },

  reorderWithinStatus: async (projectId, statusId, orderedIds) => {
    // The server returns the FULL column in its new order (it may contain issues
    // outside this view's filtered subset), so splice the whole thing back in.
    const raw = await api.patch<ServerIssue[]>("/issues/reorder", {
      projectId,
      statusId,
      orderedIds,
    });
    const updated = raw.map((i) => mapIssue(i));
    const updatedIds = new Set(updated.map((i) => i.id));
    set((state) => {
      const others = state.issues.filter((i) => !updatedIds.has(i.id));
      return { issues: [...others, ...updated] };
    });
  },

  addComment: async (issueId, body, parentId, attachments) => {
    const raw = await api.post<Parameters<typeof mapComment>[0]>(`/issues/${issueId}/comments`, {
      body,
      parentId,
      attachments,
    });
    const comment = mapComment(raw);
    set((state) => ({
      comments: { ...state.comments, [issueId]: [...(state.comments[issueId] ?? []), comment] },
    }));
  },

  updateComment: async (issueId, commentId, body) => {
    const raw = await api.patch<Parameters<typeof mapComment>[0]>(
      `/issues/${issueId}/comments/${commentId}`,
      { body }
    );
    const comment = mapComment(raw);
    set((state) => ({
      comments: {
        ...state.comments,
        [issueId]: (state.comments[issueId] ?? []).map((c) => (c.id === commentId ? comment : c)),
      },
    }));
  },

  deleteComment: async (issueId, commentId) => {
    await api.delete(`/issues/${issueId}/comments/${commentId}`);
    set((state) => ({
      comments: {
        ...state.comments,
        [issueId]: (state.comments[issueId] ?? []).filter((c) => c.id !== commentId),
      },
    }));
  },

  toggleCommentReaction: async (issueId, commentId, emoji) => {
    const raw = await api.post<Parameters<typeof mapComment>[0]>(
      `/issues/${issueId}/comments/${commentId}/reactions`,
      { emoji }
    );
    const comment = mapComment(raw);
    set((state) => ({
      comments: {
        ...state.comments,
        [issueId]: (state.comments[issueId] ?? []).map((c) => (c.id === commentId ? comment : c)),
      },
    }));
  },

  updateIssue: async (issueId, patch) => {
    const raw = await api.patch<ServerIssue>(`/issues/${issueId}`, {
      ...patch,
      priority: patch.priority ? priorityToServer(patch.priority) : undefined,
    });
    const updated = mapIssue(raw);
    set((state) => ({ issues: state.issues.map((i) => (i.id === issueId ? updated : i)) }));
  },

  createIssue: async (input) => {
    const raw = await api.post<ServerIssue>("/issues", {
      ...input,
      priority: input.priority ? priorityToServer(input.priority) : undefined,
    });
    const issue = mapIssue(raw);
    set((state) => ({ issues: [issue, ...state.issues] }));
    return issue;
  },

  deleteIssue: async (issueId) => {
    await api.delete(`/issues/${issueId}`);
    set((state) => ({ issues: state.issues.filter((i) => i.id !== issueId) }));
  },

  archiveIssue: async (issueId, archived) => {
    const raw = await api.patch<ServerIssue>(`/issues/${issueId}/archive`, { archived });
    const updated = mapIssue(raw);
    set((state) => ({
      issues: archived
        ? state.issues.filter((i) => i.id !== issueId)
        : state.issues.map((i) => (i.id === issueId ? updated : i)),
    }));
  },

  duplicateIssue: async (issueId) => {
    const source = get().issues.find((i) => i.id === issueId);
    if (!source) throw new Error("Issue not found");
    const raw = await api.post<ServerIssue>("/issues", {
      title: `${source.title} (copy)`,
      description: source.description,
      projectId: source.projectId,
      assigneeId: source.assignee?.id,
      statusId: source.status.id,
      priority: priorityToServer(source.priority),
      cycleId: source.cycleId,
      labels: source.labels?.map((l) => ({ name: l.name, color: l.color })),
    });
    const issue = mapIssue(raw);
    set((state) => ({ issues: [issue, ...state.issues] }));
    return issue;
  },

  toggleFavorite: async (issueId) => {
    const isFavorite = get().favoriteIds.includes(issueId);
    set((state) => ({
      favoriteIds: isFavorite
        ? state.favoriteIds.filter((id) => id !== issueId)
        : [...state.favoriteIds, issueId],
    }));
    try {
      if (isFavorite) {
        await api.delete(`/issues/${issueId}/favorite`);
      } else {
        await api.post(`/issues/${issueId}/favorite`);
      }
    } catch (err) {
      set((state) => ({
        favoriteIds: isFavorite
          ? [...state.favoriteIds, issueId]
          : state.favoriteIds.filter((id) => id !== issueId),
      }));
      throw err;
    }
  },

  saveDraft: async (input) => {
    const raw = await api.post<Parameters<typeof mapDraft>[0]>("/drafts", {
      ...input,
      priority: priorityToServer(input.priority),
    });
    const draft = mapDraft(raw);
    set((state) => ({ drafts: [draft, ...state.drafts] }));
  },

  updateDraft: async (draftId, patch) => {
    const raw = await api.patch<Parameters<typeof mapDraft>[0]>(`/drafts/${draftId}`, {
      ...patch,
      priority: patch.priority ? priorityToServer(patch.priority) : undefined,
    });
    const draft = mapDraft(raw);
    set((state) => ({ drafts: state.drafts.map((d) => (d.id === draftId ? draft : d)) }));
  },

  deleteDraft: async (draftId) => {
    await api.delete(`/drafts/${draftId}`);
    set((state) => ({ drafts: state.drafts.filter((d) => d.id !== draftId) }));
  },

  publishDraft: async (draftId) => {
    const raw = await api.post<ServerIssue>(`/drafts/${draftId}/publish`);
    const issue = mapIssue(raw);
    set((state) => ({
      issues: [issue, ...state.issues],
      drafts: state.drafts.filter((d) => d.id !== draftId),
    }));
    return issue;
  },

  reset: () =>
    set({ issues: [], loaded: false, comments: {}, activity: {}, favoriteIds: [], drafts: [] }),
}));
