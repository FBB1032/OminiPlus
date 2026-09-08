export const APP_NAME = 'Omini Pulse Admin';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { key: 'doctors', label: 'Doctors', href: '/dashboard/doctors', icon: 'Stethoscope' },
  { key: 'patients', label: 'Patients', href: '/dashboard/patients', icon: 'Users' },
  { key: 'hospitals', label: 'Hospitals', href: '/dashboard/hospitals', icon: 'Building2' },
  { key: 'pharmacies', label: 'Pharmacies', href: '/dashboard/pharmacies', icon: 'Pill' },
  { key: 'blood-donors', label: 'Blood Donors', href: '/dashboard/blood-donors', icon: 'Droplet' },
  { key: 'appointments', label: 'Appointments', href: '/dashboard/appointments', icon: 'Calendar' },
  { key: 'ai-monitoring', label: 'AI Monitoring', href: '/dashboard/ai-monitoring', icon: 'Bot' },
  { key: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: 'Bell' },
  { key: 'reports', label: 'Reports', href: '/dashboard/reports', icon: 'Flag' },
  { key: 'audit-logs', label: 'Audit Logs', href: '/dashboard/audit-logs', icon: 'FileText' },
  { key: 'security', label: 'Security', href: '/dashboard/security', icon: 'Shield' },
  { key: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const;

export const VERIFICATION_STATUS_MAP = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  suspended: { label: 'Suspended', color: 'error' },
} as const;

export const APPOINTMENT_STATUS_MAP = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
} as const;

export const PARTNER_STATUS_MAP = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  inactive: { label: 'Inactive', color: 'neutral' },
  suspended: { label: 'Suspended', color: 'error' },
} as const;

export const PAGE_SIZE = 10;
