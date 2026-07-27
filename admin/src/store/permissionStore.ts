import { create } from 'zustand';
import type { AdminRole, Permission } from '@/types';
import { useAuthStore } from './authStore';

// ─── Role → Permissions Map ───────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'doctors.view', 'doctors.verify', 'doctors.suspend',
    'hospitals.view', 'hospitals.onboard', 'hospitals.manage',
    'pharmacies.view', 'pharmacies.onboard', 'pharmacies.manage',
    'appointments.view_overview', 'appointments.resolve_issues',
    'ai_monitoring.view', 'ai_monitoring.moderate',
    'notifications.view', 'notifications.send',
    'reports.view', 'reports.resolve',
    'audit_logs.view',
    'security.view', 'security.manage_roles', 'security.manage_sessions',
    'settings.view', 'settings.manage',
  ],

  verification_admin: [
    'dashboard.view',
    'doctors.view', 'doctors.verify', 'doctors.suspend',
    'hospitals.view', 'hospitals.onboard', 'hospitals.manage',
    'pharmacies.view', 'pharmacies.onboard', 'pharmacies.manage',
    'appointments.view_overview', 'appointments.resolve_issues',
  ],

  support_admin: [
    'dashboard.view',
    'appointments.view_overview', 'appointments.resolve_issues',
    'notifications.view', 'notifications.send',
    'reports.view', 'reports.resolve',
  ],

  security_admin: [
    'dashboard.view',
    'ai_monitoring.view', 'ai_monitoring.moderate',
    'audit_logs.view',
    'security.view', 'security.manage_roles', 'security.manage_sessions',
  ],

  moderator: [
    'dashboard.view',
    'ai_monitoring.view', 'ai_monitoring.moderate',
    'reports.view', 'reports.resolve',
  ],

  doctor: [
    'dashboard.view',
    'doctor_portal.view', 'doctor_portal.manage',
    'appointments.view_overview', 'appointments.resolve_issues',
    'notifications.view',
    'settings.view',
  ],
};

// ─── Navigation Items per Section ─────────────────────────────────────────────

export type NavSection = {
  label: string;
  items: { key: string; label: string; href: string; icon: string; permission: Permission }[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', permission: 'dashboard.view' },
      { key: 'doctor-portal', label: 'Doctor Workspace', href: '/dashboard/doctor-portal', icon: 'Stethoscope', permission: 'doctor_portal.view' },
    ],
  },
  {
    label: 'Management',
    items: [
      { key: 'doctors', label: 'Doctors', href: '/dashboard/doctors', icon: 'Stethoscope', permission: 'doctors.view' },
      { key: 'hospitals', label: 'Hospitals', href: '/dashboard/hospitals', icon: 'Building2', permission: 'hospitals.view' },
      { key: 'pharmacies', label: 'Pharmacies', href: '/dashboard/pharmacies', icon: 'Pill', permission: 'pharmacies.view' },
      { key: 'appointments', label: 'Appointments', href: '/dashboard/appointments', icon: 'Calendar', permission: 'appointments.view_overview' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { key: 'ai-monitoring', label: 'AI Monitoring', href: '/dashboard/ai-monitoring', icon: 'Bot', permission: 'ai_monitoring.view' },
      { key: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell', permission: 'notifications.view' },
      { key: 'reports', label: 'Reports', href: '/dashboard/reports', icon: 'BarChart3', permission: 'reports.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'audit-logs', label: 'Audit Logs', href: '/dashboard/audit-logs', icon: 'ScrollText', permission: 'audit_logs.view' },
      { key: 'security', label: 'Security', href: '/dashboard/security', icon: 'ShieldCheck', permission: 'security.view' },
      { key: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'Settings', permission: 'settings.view' },
    ],
  },
];

// ─── Permission Hook ──────────────────────────────────────────────────────────

interface PermissionState {
  permissions: Permission[];
  hasPermission: (perm: Permission) => boolean;
  hasAnyPermission: (perms: Permission[]) => boolean;
  getFilteredNavSections: () => NavSection[];
}

export const usePermissions = create<PermissionState>(() => ({
  permissions: [],

  hasPermission: (perm: Permission) => {
    const admin = useAuthStore.getState().admin;
    if (!admin) return false;
    const rolePerms = ROLE_PERMISSIONS[admin.role] || [];
    return rolePerms.includes(perm);
  },

  hasAnyPermission: (perms: Permission[]) => {
    const admin = useAuthStore.getState().admin;
    if (!admin) return false;
    const rolePerms = ROLE_PERMISSIONS[admin.role] || [];
    return perms.some((p) => rolePerms.includes(p));
  },

  getFilteredNavSections: () => {
    const admin = useAuthStore.getState().admin;
    if (!admin) return [];
    const rolePerms = ROLE_PERMISSIONS[admin.role] || [];
    return NAV_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => rolePerms.includes(item.permission)),
      }))
      .filter((section) => section.items.length > 0);
  },
}));

// Helper for inline permission checks
export function checkPermission(perm: Permission): boolean {
  const admin = useAuthStore.getState().admin;
  if (!admin) return false;
  return (ROLE_PERMISSIONS[admin.role] || []).includes(perm);
}

// Role display labels
export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  verification_admin: 'Verification Admin',
  support_admin: 'Support Admin',
  security_admin: 'Security Admin',
  moderator: 'Moderator',
  doctor: 'Doctor (Web Portal)',
};

export const ROLE_COLORS: Record<AdminRole, { bg: string; color: string }> = {
  super_admin: { bg: '#faf5ff', color: '#7c3aed' },
  verification_admin: { bg: '#eff6ff', color: '#2563eb' },
  support_admin: { bg: '#ecfeff', color: '#0891b2' },
  security_admin: { bg: '#fef2f2', color: '#dc2626' },
  moderator: { bg: '#f0fdf4', color: '#16a34a' },
  doctor: { bg: '#e6f4f4', color: '#0f6e6e' },
};
