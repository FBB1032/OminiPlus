import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  DoctorDashboard,
  Appointment,
  Patient,
  Prescription,
  CreatePrescriptionPayload,
  WorkingHours,
} from '../types';

export const doctorApi = {
  // ── Dashboard ───────────────────────────────────────────────────────────────
  getDashboard: () =>
    apiClient.get<ApiResponse<DoctorDashboard>>('/doctor/dashboard').then((r) => r.data),

  // ── Appointments ────────────────────────────────────────────────────────────
  getAppointments: (params?: PaginationParams & { status?: string; date?: string }) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<Appointment>>>('/doctor/appointments', { params })
      .then((r) => r.data),

  getAppointmentById: (id: string) =>
    apiClient.get<ApiResponse<Appointment>>(`/doctor/appointments/${id}`).then((r) => r.data),

  updateAppointmentStatus: (id: string, status: string) =>
    apiClient
      .patch<ApiResponse<Appointment>>(`/doctor/appointments/${id}/status`, { status })
      .then((r) => r.data),

  submitSOAPNote: (
    appointmentId: string,
    soap: { subjective: string; objective: string; assessment: string; plan: string }
  ) =>
    apiClient
      .post<ApiResponse<void>>(`/doctor/appointments/${appointmentId}/soap`, soap)
      .then((r) => r.data),

  // ── Patients ────────────────────────────────────────────────────────────────
  getPatients: (params?: PaginationParams) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<Patient>>>('/doctor/patients', { params })
      .then((r) => r.data),

  getPatientById: (id: string) =>
    apiClient.get<ApiResponse<Patient>>(`/doctor/patients/${id}`).then((r) => r.data),

  getPatientPrescriptions: (patientId: string) =>
    apiClient
      .get<ApiResponse<Prescription[]>>(`/doctor/patients/${patientId}/prescriptions`)
      .then((r) => r.data),

  // ── Prescriptions ───────────────────────────────────────────────────────────
  createPrescription: (payload: CreatePrescriptionPayload) =>
    apiClient
      .post<ApiResponse<Prescription>>('/doctor/prescriptions', payload)
      .then((r) => r.data),

  getPrescriptionById: (id: string) =>
    apiClient.get<ApiResponse<Prescription>>(`/doctor/prescriptions/${id}`).then((r) => r.data),

  // ── Availability ────────────────────────────────────────────────────────────
  getAvailability: () =>
    apiClient.get<ApiResponse<WorkingHours[]>>('/doctor/availability').then((r) => r.data),

  updateAvailability: (availability: WorkingHours[]) =>
    apiClient
      .put<ApiResponse<WorkingHours[]>>('/doctor/availability', availability)
      .then((r) => r.data),
};
