import { create } from "zustand";
import type { Issue, IssueStatus, Comment, ActivityEntry, Person, Draft } from "@/lib/types";
import { STATUS_COLUMNS } from "@/lib/types";
import {
  INITIAL_ISSUES,
  INITIAL_COMMENTS,
  INITIAL_ACTIVITY,
  INITIAL_DRAFTS,
  INITIAL_FAVORITE_IDS,
} from "@/lib/mock-data";
import { getCurrentUserSync } from "@/lib/current-user";

function statusLabel(status: IssueStatus) {
  return STATUS_COLUMNS.find((c) => c.id === status)?.label ?? status;
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

function nowIso() {
  return new Date().toISOString();
}

interface IssuesState {
  issues: Issue[];
  comments: Record<string, Comment[]>;
  activity: Record<string, ActivityEntry[]>;
  favoriteIds: string[];
  drafts: Draft[];
  moveIssue: (issueId: string, status: IssueStatus, atIndex?: number) => void;
  reorderWithinStatus: (status: IssueStatus, orderedIds: string[]) => void;
  addComment: (issueId: string, body: string) => void;
  updateIssue: (issueId: string, patch: Partial<Issue>) => void;
  createIssue: (issue: Issue) => void;
  logActivity: (issueId: string, message: string, author?: Person) => void;
  toggleFavorite: (issueId: string) => void;
  saveDraft: (draft: Draft) => void;
  updateDraft: (draftId: string, patch: Partial<Draft>) => void;
  deleteDraft: (draftId: string) => void;
  publishDraft: (draftId: string, issue: Issue) => void;
}

export const useIssuesStore = create<IssuesState>()((set, get) => ({
  issues: INITIAL_ISSUES,
  comments: INITIAL_COMMENTS,
  activity: INITIAL_ACTIVITY,
  favoriteIds: INITIAL_FAVORITE_IDS,
  drafts: INITIAL_DRAFTS,

  moveIssue: (issueId, status) => {
    const issue = get().issues.find((i) => i.id === issueId);
    if (!issue || issue.status === status) return;
    const fromLabel = statusLabel(issue.status);
    const toLabel = statusLabel(status);
    set((state) => ({
      issues: state.issues.map((i) => (i.id === issueId ? { ...i, status } : i)),
    }));
    get().logActivity(issueId, `moved this issue from ${fromLabel} to ${toLabel}`);
  },

  reorderWithinStatus: (status, orderedIds) => {
    set((state) => {
      const rest = state.issues.filter((i) => i.status !== status);
      const reordered = orderedIds
        .map((id) => state.issues.find((i) => i.id === id))
        .filter((i): i is Issue => Boolean(i));
      return { issues: [...rest, ...reordered] };
    });
  },

  addComment: (issueId, body) => {
    const comment: Comment = {
      id: id(),
      author: getCurrentUserSync(),
      body,
      createdAt: nowIso(),
    };
    set((state) => ({
      comments: {
        ...state.comments,
        [issueId]: [...(state.comments[issueId] ?? []), comment],
      },
    }));
  },

  updateIssue: (issueId, patch) => {
    set((state) => ({
      issues: state.issues.map((i) => (i.id === issueId ? { ...i, ...patch } : i)),
    }));
  },

  createIssue: (issue) => {
    set((state) => ({ issues: [issue, ...state.issues] }));
  },

  logActivity: (issueId, message, author = getCurrentUserSync()) => {
    const entry: ActivityEntry = { id: id(), author, message, createdAt: nowIso() };
    set((state) => ({
      activity: {
        ...state.activity,
        [issueId]: [entry, ...(state.activity[issueId] ?? [])],
      },
    }));
  },

  toggleFavorite: (issueId) => {
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(issueId)
        ? state.favoriteIds.filter((id) => id !== issueId)
        : [...state.favoriteIds, issueId],
    }));
  },

  saveDraft: (draft) => {
    set((state) => ({ drafts: [draft, ...state.drafts] }));
  },

  updateDraft: (draftId, patch) => {
    set((state) => ({
      drafts: state.drafts.map((d) => (d.id === draftId ? { ...d, ...patch } : d)),
    }));
  },

  deleteDraft: (draftId) => {
    set((state) => ({ drafts: state.drafts.filter((d) => d.id !== draftId) }));
  },

  publishDraft: (draftId, issue) => {
    set((state) => ({
      issues: [issue, ...state.issues],
      drafts: state.drafts.filter((d) => d.id !== draftId),
    }));
  },
}));
