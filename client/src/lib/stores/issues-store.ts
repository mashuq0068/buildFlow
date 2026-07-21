import { create } from "zustand";
import { api } from "@/lib/api-client";
import {
  mapIssue,
  mapComment,
  mapActivity,
  mapDraft,
  statusToServer,
  priorityToServer,
} from "@/lib/api/mappers";
import type { Issue, IssueStatus, IssuePriority, Comment, ActivityEntry, Draft } from "@/lib/types";

type ServerIssue = Parameters<typeof mapIssue>[0];

interface CreateIssueInput {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  cycleId?: string;
  labels?: { name: string; color: string }[];
  aiSuggestedLabels?: string[];
  aiSuggestedReasoning?: string;
}

interface UpdateIssueInput {
  title?: string;
  description?: string;
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

  moveIssue: (issueId: string, status: IssueStatus) => Promise<void>;
  reorderWithinStatus: (projectId: string, status: IssueStatus, orderedIds: string[]) => Promise<void>;
  addComment: (issueId: string, body: string) => Promise<void>;
  updateIssue: (issueId: string, patch: UpdateIssueInput) => Promise<void>;
  createIssue: (input: CreateIssueInput) => Promise<Issue>;
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

  moveIssue: async (issueId, status) => {
    const issue = get().issues.find((i) => i.id === issueId);
    if (!issue || issue.status === status) return;
    const raw = await api.patch<ServerIssue>(`/issues/${issueId}/status`, {
      status: statusToServer(status),
    });
    const updated = mapIssue(raw);
    set((state) => ({ issues: state.issues.map((i) => (i.id === issueId ? updated : i)) }));
  },

  reorderWithinStatus: async (projectId, status, orderedIds) => {
    // The server returns the FULL column in its new order (it may contain issues
    // outside this view's filtered subset), so splice the whole thing back in.
    const raw = await api.patch<ServerIssue[]>("/issues/reorder", {
      projectId,
      status: statusToServer(status),
      orderedIds,
    });
    const updated = raw.map((i) => mapIssue(i));
    const updatedIds = new Set(updated.map((i) => i.id));
    set((state) => {
      const others = state.issues.filter((i) => !updatedIds.has(i.id));
      return { issues: [...others, ...updated] };
    });
  },

  addComment: async (issueId, body) => {
    const raw = await api.post<Parameters<typeof mapComment>[0]>(`/issues/${issueId}/comments`, {
      body,
    });
    const comment = mapComment(raw);
    set((state) => ({
      comments: { ...state.comments, [issueId]: [...(state.comments[issueId] ?? []), comment] },
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
      status: input.status ? statusToServer(input.status) : undefined,
      priority: input.priority ? priorityToServer(input.priority) : undefined,
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
