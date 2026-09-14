import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '@/types';

// ─── Auth Store ───────────────────────────────────────────────────────────────
// All authentication flows through the unified Supabase backend — there are no
// offline/demo admin presets.

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAdmin: (admin, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ominipulse_desktop_token', token);
        }
        set({ admin, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ominipulse_desktop_token');
        }
        // Sign out from the unified Supabase backend (best-effort)
        void import('@/services/supabaseAuthService').then((m) =>
          m.supabaseAuthService.logout().catch(() => undefined)
        );
        set({ admin: null, token: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
      login: async (email, password) => {
        const { supabaseAuthService } = await import('@/services/supabaseAuthService');
        const { admin, token } = await supabaseAuthService.login(email, password);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ominipulse_desktop_token', token);
        }
        set({ admin, token, isAuthenticated: true });
      },
      restoreSession: async () => {
        try {
          const { supabaseAuthService } = await import('@/services/supabaseAuthService');
          const session = await supabaseAuthService.restoreSession();
          if (session) {
            const { admin, token } = session;
            if (typeof window !== 'undefined') {
              localStorage.setItem('ominipulse_desktop_token', token);
            }
            set({ admin, token, isAuthenticated: true });
          }
        } catch {
          // No active Supabase session — stay logged out.
        }
      },
    }),
    {
      name: 'ominipulse-desktop-auth',
      partialize: (s) => ({
        admin: s.admin,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
