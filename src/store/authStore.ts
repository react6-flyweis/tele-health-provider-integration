import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { isTokenExpired } from "@/lib/token";
import type { ProviderProfile } from "@/types/auth";

interface AuthState {
  token: string | null;
  provider: ProviderProfile | null;
  hasHydrated: boolean;
  setAuth: (params: { token: string; provider: ProviderProfile }) => void;
  clearAuth: () => void;
  validateStoredToken: () => void;
  setHydrated: (value: boolean) => void;
}

let sessionExpiryAlertShown = false;

function notifyAndClear(message: string, clear: () => void) {
  if (!sessionExpiryAlertShown) {
    sessionExpiryAlertShown = true;
    window.alert(message);
  }
  clear();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      provider: null,
      hasHydrated: false,
      setAuth: ({ token, provider }) => {
        sessionExpiryAlertShown = false;
        set({ token, provider });
      },
      clearAuth: () => {
        set({ token: null, provider: null });
      },
      validateStoredToken: () => {
        const token = get().token;
        if (!token) {
          return;
        }

        if (isTokenExpired(token)) {
          notifyAndClear(
            "Your previous login session has expired. Please log in again.",
            () => get().clearAuth(),
          );
        }
      },
      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "provider-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        provider: state.provider,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

function redirectToProviderLogin() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/provider-login") {
    window.location.replace("/provider-login");
  }
}

export function forceLogoutWithAlert(message: string) {
  const state = useAuthStore.getState();
  notifyAndClear(message, state.clearAuth);
  redirectToProviderLogin();
}
