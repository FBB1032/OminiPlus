import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin, AdminRole } from '@/types';

// ─── Mock Admin Presets (one per role for testing) ────────────────────────────

export const MOCK_ADMINS: Record<AdminRole, Admin> = {
  super_admin: {
    id: 'admin-1',
    email: 'admin@ominiplus.ai',
    firstName: 'Admin',
    lastName: 'User',
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: true,
  },
  verification_admin: {
    id: 'admin-2',
    email: 'verify@ominiplus.ai',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'verification_admin',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: true,
  },
  support_admin: {
    id: 'admin-3',
    email: 'support@ominiplus.ai',
    firstName: 'Mark',
    lastName: 'Davis',
    role: 'support_admin',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
  },
  security_admin: {
    id: 'admin-4',
    email: 'security@ominiplus.ai',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'security_admin',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: true,
  },
  moderator: {
    id: 'admin-5',
    email: 'mod@ominiplus.ai',
    firstName: 'Felix',
    lastName: 'Okafor',
    role: 'moderator',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
  },
  doctor: {
    id: 'doc-admin-1',
    email: 'doctor@ominiplus.ai',
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
          localStorage.setItem('ominiplus_admin_token', token);
        }
        set({ admin, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ominiplus_admin_token');
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
      name: 'ominiplus-admin-auth',
      partialize: (s) => ({
        admin: s.admin,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
