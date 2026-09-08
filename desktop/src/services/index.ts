import apiClient from './apiClient';
import type {
  Admin, Doctor, Patient, Hospital, Pharmacy, Appointment,
  AIFlag, AuditLog, Report, Notification, DashboardStats,
  PaginatedResponse, ApiResponse, VerificationStatus
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: Admin; token: string }>>('/admin/auth/login', { email, password }).then(r => r.data.data),
  logout: async () =>
    apiClient.post('/admin/auth/logout'),
  me: async () =>
    apiClient.get<ApiResponse<Admin>>('/admin/auth/me').then(r => r.data.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: async () =>
    apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats').then(r => r.data.data),
  getActivity: async () =>
    apiClient.get<ApiResponse<AuditLog[]>>('/admin/dashboard/activity').then(r => r.data.data),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctorsService = {
  list: async (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Doctor>>>('/admin/doctors', { params }).then(r => r.data.data),
  getById: async (id: string) =>
    apiClient.get<ApiResponse<Doctor>>(`/admin/doctors/${id}`).then(r => r.data.data),
  updateStatus: async (id: string, status: VerificationStatus) =>
    apiClient.patch<ApiResponse<Doctor>>(`/admin/doctors/${id}/status`, { status }).then(r => r.data.data),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientsService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Patient>>>('/admin/patients', { params }).then(r => r.data.data),
  getById: async (id: string) =>
    apiClient.get<ApiResponse<Patient>>(`/admin/patients/${id}`).then(r => r.data.data),
  toggleStatus: async (id: string, isActive: boolean) =>
    apiClient.patch<ApiResponse<Patient>>(`/admin/patients/${id}/status`, { isActive }).then(r => r.data.data),
};

// ─── Hospitals ────────────────────────────────────────────────────────────────
export const hospitalsService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Hospital>>>('/admin/hospitals', { params }).then(r => r.data.data),
  create: async (data: Partial<Hospital>) =>
    apiClient.post<ApiResponse<Hospital>>('/admin/hospitals', data).then(r => r.data.data),
  updateStatus: async (id: string, partnerStatus: string) =>
    apiClient.patch<ApiResponse<Hospital>>(`/admin/hospitals/${id}/status`, { partnerStatus }).then(r => r.data.data),
};

// ─── Pharmacies ───────────────────────────────────────────────────────────────
export const pharmaciesService = {
  list: async (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Pharmacy>>>('/admin/pharmacies', { params }).then(r => r.data.data),
  create: async (data: Partial<Pharmacy>) =>
    apiClient.post<ApiResponse<Pharmacy>>('/admin/pharmacies', data).then(r => r.data.data),
  updateStatus: async (id: string, partnerStatus: string) =>
    apiClient.patch<ApiResponse<Pharmacy>>(`/admin/pharmacies/${id}/status`, { partnerStatus }).then(r => r.data.data),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsService = {
  list: async (params?: { page?: number; limit?: number; status?: string; date?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>('/admin/appointments', { params }).then(r => r.data.data),
};

// ─── AI Monitoring ────────────────────────────────────────────────────────────
export const aiService = {
  getFlags: async (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<AIFlag>>>('/admin/ai/flags', { params }).then(r => r.data.data),
  updateFlag: async (id: string, status: string) =>
    apiClient.patch<ApiResponse<AIFlag>>(`/admin/ai/flags/${id}`, { status }).then(r => r.data.data),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsService = {
  list: async () =>
    apiClient.get<ApiResponse<Notification[]>>('/admin/notifications').then(r => r.data.data),
  send: async (data: Partial<Notification>) =>
    apiClient.post<ApiResponse<Notification>>('/admin/notifications', data).then(r => r.data.data),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsService = {
  list: async (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Report>>>('/admin/reports', { params }).then(r => r.data.data),
  updateStatus: async (id: string, status: string) =>
    apiClient.patch<ApiResponse<Report>>(`/admin/reports/${id}/status`, { status }).then(r => r.data.data),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditService = {
  list: async (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<AuditLog>>>('/admin/audit-logs', { params }).then(r => r.data.data),
};
