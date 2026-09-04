import { create } from 'zustand';
import type { AdminRole, Permission } from '@/types';
import { useAuthStore } from './authStore';

// ─── MVP Freeze: 6-Tier RBAC → 2 Roles ───────────────────────────────────────
//
// The original 6-tier system (super_admin, verification_admin, support_admin,
// security_admin, moderator, doctor) is frozen for MVP launch.
// Managing that many permission tiers adds backend logic bloat before we have
// active users to justify it.
//
// Phase 2 will restore granular roles once production user volumes are
// established and the backend RBAC layer is in place.
//
// MVP roles:
//   'admin'  — full access to everything (isAdmin: true)
//   'doctor' — doctor workspace only (isAdmin: false)

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  // ── 1. Platform Admin: Complete platform oversight across all services ──
  admin: [
    'dashboard.view',
    'doctors.view', 'doctors.verify', 'doctors.suspend',
    'patients.view', 'patients.manage',
    'payments.view', 'payments.manage',
    'billing.view', 'billing.manage',
    'hospitals.view', 'hospitals.onboard', 'hospitals.manage',
    'pharmacies.view', 'pharmacies.onboard', 'pharmacies.manage',
    'blood_donors.view', 'blood_donors.manage',
    'appointments.view_overview', 'appointments.resolve_issues',
    'ai_monitoring.view', 'ai_monitoring.moderate',
    'notifications.view', 'notifications.send',
    'reports.view', 'reports.resolve',
    'audit_logs.view',
    'security.view', 'security.manage_roles', 'security.manage_sessions',
    'settings.view', 'settings.manage',
  ],

  // ── 2. Doctor: Clinical patient care, SOAP notes, consultations ONLY ──
  doctor: [
    'doctor_portal.view', 'doctor_portal.manage',
    'notifications.view',
    'settings.view',
  ],

  // ── 3. Hospital Admin: Manages the hospital facility, staff, beds, services, blood ──
  hospital_admin: [
    'hospital_portal.view', 'hospital_portal.manage',
    'notifications.view',
    'settings.view',
  ],

  // ── 4. Nurse: Inpatient care, vitals, triage queue ONLY ──
  nurse: [
    'hospital_portal.view',
    'notifications.view',
  ],

  // ── 5. Receptionist: Queue check-in & patient registration ONLY ──
  receptionist: [
    'hospital_portal.view',
    'notifications.view',
  ],

  // ── 6. Blood Officer: Hospital blood bank inventory & donor screenings ONLY ──
  blood_officer: [
    'hospital_portal.view',
    'notifications.view',
  ],

  // ── 7. Pharmacist: Hospital internal pharmacy & prescription dispensing ONLY ──
  pharmacist: [
    'hospital_portal.view',
    'notifications.view',
  ],

  // ── 8. Lab Technician: Hospital diagnostic orders & test results entry ONLY ──
  lab_technician: [
    'hospital_portal.view',
    'notifications.view',
  ],
};

// ─── Navigation Sections ──────────────────────────────────────────────────────

export type NavSection = {
  label: string;
  items: { key: string; label: string; href: string; icon: string; permission: Permission }[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard',    label: 'Dashboard',        href: '/dashboard',               icon: 'LayoutDashboard', permission: 'dashboard.view' },
      { key: 'doctor-portal',label: 'Doctor Workspace', href: '/dashboard/doctor-portal', icon: 'Stethoscope',     permission: 'doctor_portal.view' },
    ],
  },
  {
    label: 'Management',
    items: [
      { key: 'doctors',      label: 'Doctors',       href: '/dashboard/doctors',       icon: 'Stethoscope', permission: 'doctors.view' },
      { key: 'hospitals',    label: 'Hospitals',     href: '/dashboard/hospitals',     icon: 'Building2',   permission: 'hospitals.view' },
      { key: 'pharmacies',   label: 'Pharmacies',    href: '/dashboard/pharmacies',    icon: 'Pill',        permission: 'pharmacies.view' },
      { key: 'appointments', label: 'Appointments',  href: '/dashboard/appointments',  icon: 'Calendar',    permission: 'appointments.view_overview' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { key: 'ai-monitoring', label: 'AI Monitoring', href: '/dashboard/ai-monitoring', icon: 'Bot',      permission: 'ai_monitoring.view' },
      { key: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell',     permission: 'notifications.view' },
      { key: 'reports',       label: 'Reports',       href: '/dashboard/reports',       icon: 'BarChart3', permission: 'reports.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'audit-logs', label: 'Audit Logs', href: '/dashboard/audit-logs', icon: 'ScrollText',  permission: 'audit_logs.view' },
      { key: 'security',   label: 'Security',   href: '/dashboard/security',   icon: 'ShieldCheck', permission: 'security.view' },
      { key: 'settings',   label: 'Settings',   href: '/dashboard/settings',   icon: 'Settings',    permission: 'settings.view' },
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

// Inline permission check helper
export function checkPermission(perm: Permission): boolean {
  const admin = useAuthStore.getState().admin;
  if (!admin) return false;
  return (ROLE_PERMISSIONS[admin.role] || []).includes(perm);
}

// Role display labels
export const ROLE_LABELS: Record<AdminRole, string> = {
  admin:          'Platform Admin',
  doctor:         'Doctor',
  hospital_admin: 'Hospital Admin',
  nurse:          'Nurse',
  receptionist:   'Receptionist',
  blood_officer:  'Blood Officer',
  pharmacist:     'Pharmacist',
  lab_technician: 'Lab Scientist',
};

export const ROLE_COLORS: Record<AdminRole, { bg: string; color: string }> = {
  admin:          { bg: '#faf5ff', color: '#7c3aed' },
  doctor:         { bg: '#e6f4f4', color: '#0f6e6e' },
  hospital_admin: { bg: '#eff6ff', color: '#2563eb' },
  nurse:          { bg: '#f0fdf4', color: '#16a34a' },
  receptionist:   { bg: '#fffbeb', color: '#d97706' },
  blood_officer:  { bg: '#fef2f2', color: '#dc2626' },
  pharmacist:     { bg: '#f0fdfa', color: '#0d9488' },
  lab_technician: { bg: '#fdf4ff', color: '#c026d3' },
};
