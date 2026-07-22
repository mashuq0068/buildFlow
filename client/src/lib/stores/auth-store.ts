import { create } from "zustand";
import { api, ApiError } from "@/lib/api-client";
import type { Person } from "@/lib/types";

export interface AuthUser extends Person {
  email: string;
  title?: string;
}

interface ServerAuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  title: string | null;
  avatarUrl?: string | null;
}

function mapAuthUser(u: ServerAuthUser): AuthUser {
  return {
    id: u.id,
    name: u.name,
    initials: u.initials,
    email: u.email,
    title: u.title ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
  };
}

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  fetchMe: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "idle",

  fetchMe: async () => {
    set({ status: "loading" });
    try {
      const user = await api.get<ServerAuthUser>("/auth/me");
      set({ user: mapAuthUser(user), status: "authenticated" });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        console.error("Failed to load session", err);
      }
      set({ user: null, status: "unauthenticated" });
      return false;
    }
  },

  login: async (email, password) => {
    const user = await api.post<ServerAuthUser>("/auth/login", { email, password });
    set({ user: mapAuthUser(user), status: "authenticated" });
  },

  register: async (name, email, password) => {
    const user = await api.post<ServerAuthUser>("/auth/register", { name, email, password });
    set({ user: mapAuthUser(user), status: "authenticated" });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
