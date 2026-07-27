import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  PatientHome,
  Appointment,
  MedicalRecord,
  Prescription,
  BookAppointmentPayload,
  AvailableSlot,
  Doctor,
  PatientNotification,
} from '../types';

export const patientApi = {
  getHome: () =>
    apiClient.get<ApiResponse<PatientHome>>('/patient/home').then((r) => r.data),

  getAppointments: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>('/patient/appointments', { params }).then((r) => r.data),

  bookAppointment: (payload: BookAppointmentPayload) =>
    apiClient.post<ApiResponse<Appointment>>('/patient/appointments', payload).then((r) => r.data),

  cancelAppointment: (id: string) =>
    apiClient.patch<ApiResponse<Appointment>>(`/patient/appointments/${id}/cancel`).then((r) => r.data),

  getMedicalRecords: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<MedicalRecord>>>('/patient/records', { params }).then((r) => r.data),

  getPrescriptionHistory: (params?: PaginationParams) =>
    apiClient
      .get<ApiResponse<PaginatedResponse<Prescription>>>('/patient/prescriptions', { params })
      .then((r) => r.data),

  getDoctors: (params?: PaginationParams & { specialization?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Doctor>>>('/patient/doctors', { params }).then((r) => r.data),

  getAvailableSlots: (doctorId: string, date: string) =>
    apiClient
      .get<ApiResponse<AvailableSlot[]>>(`/patient/doctors/${doctorId}/slots`, { params: { date } })
      .then((r) => r.data),

  getNotifications: () =>
    apiClient.get<ApiResponse<PatientNotification[]>>('/patient/notifications').then((r) => r.data),

  markNotificationRead: (id: string) =>
    apiClient.patch<ApiResponse<null>>(`/patient/notifications/${id}/read`).then((r) => r.data),

  submitSymptomCheck: (payload: { painLogs: Array<{ bodyPartId: string; severity: number; notes?: string }> }) =>
    apiClient.post<ApiResponse<any>>('/patient/symptoms', payload).then((r) => r.data),
};
