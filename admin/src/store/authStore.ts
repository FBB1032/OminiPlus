import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin, AdminRole } from '@/types';

// ─── Mock Admin Presets ───────────────────────────────────────────────────────
// MVP Freeze: collapsed from 6 roles to 2 (admin / doctor).

export const MOCK_ADMINS: Record<AdminRole, Admin> = {
  admin: {
    id: 'admin-1',
    email: 'admin@ominipulse.ai',
    firstName: 'Platform',
    lastName: 'Admin',
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
  hospital_admin: {
    id: 'hosp-admin-1',
    email: 'admin@xyzspecialist.ng',
    firstName: 'Dr. Ibrahim',
    lastName: 'Sani (Medical Director)',
    role: 'hospital_admin',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: true,
  },
  nurse: {
    id: 'hosp-nurse-1',
    email: 'a.yusuf@xyzspecialist.ng',
    firstName: 'Nurse Amina',
    lastName: 'Yusuf',
    role: 'nurse',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
  },
  receptionist: {
    id: 'hosp-rec-1',
    email: 'f.mohammed@xyzspecialist.ng',
    firstName: 'Fatima',
    lastName: 'Mohammed',
    role: 'receptionist',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
  },
  blood_officer: {
    id: 'hosp-bld-1',
    email: 'm.garba@xyzspecialist.ng',
    firstName: 'Musa',
    lastName: 'Garba',
    role: 'blood_officer',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
  },
  pharmacist: {
    id: 'hosp-phm-1',
    email: 'c.okonkwo@xyzspecialist.ng',
    firstName: 'Pharm. Chioma',
    lastName: 'Okonkwo',
    role: 'pharmacist',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
  },
  lab_technician: {
    id: 'hosp-lab-1',
    email: 'e.nnamdi@xyzspecialist.ng',
    firstName: 'MLS. Emeka',
    lastName: 'Nnamdi',
    role: 'lab_technician',
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: false,
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
