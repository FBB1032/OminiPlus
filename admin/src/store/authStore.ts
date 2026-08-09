import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin, AdminRole } from '@/types';

// ─── Mock Admin Presets ───────────────────────────────────────────────────────
// MVP Freeze: collapsed from 6 roles to 2 (admin / doctor).

export const MOCK_ADMINS: Record<AdminRole, Admin> = {
  admin: {
    id: 'admin-1',
    email: 'admin@ominipulse.ai',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: true,
  },
  doctor: {
    id: 'doc-admin-1',
    email: 'doctor@ominipulse.ai',
    firstName: 'Dr. Folake',
    lastName: 'Ademola',
    role: 'doctor',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: true,
  },
};

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  switchRole: (role: AdminRole) => void;
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
          localStorage.setItem('ominipulse_admin_token', token);
        }
        set({ admin, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ominipulse_admin_token');
        }
        set({ admin: null, token: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
      switchRole: (role: AdminRole) => {
        const mockAdmin = MOCK_ADMINS[role];
        set({ admin: mockAdmin, isAuthenticated: true, token: `mock-token-${role}` });
      },
    }),
    {
      name: 'ominipulse-admin-auth',
      partialize: (s) => ({
        admin: s.admin,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
