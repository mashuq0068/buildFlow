import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  currentUserName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUserName: null,
      login: (name) => set({ currentUserName: name }),
      logout: () => set({ currentUserName: null }),
    }),
    { name: "auth-store" }
  )
);
