/**
 * Doctor API — live backend (https://ominipulse.onrender.com/api).
 *
 * Endpoints used (JWT-authenticated, RLS-scoped to the doctor):
 *   GET    /doctors/me                     → own doctor profile
 *   PUT    /doctors/me/working-hours        → availability
 *   GET    /appointments                    → schedule (role-scoped)
 *   PATCH  /appointments/:id               → approve / cancel / no-show
 *   POST   /appointments/:id/complete      → escrow release
 *   POST   /ai/soap                         → transcript → SOAP note
 *   POST   /ai/cds                          → clinical decision support
 *   GET    /patients/:id                   → patient lookup
 *   GET    /patients/:id/records            → medical history
 *   GET    /doctors/verification/pending   → (admin) pending MDCN queue
 *
 * Doctor dashboard aggregates /appointments + /patients/:id lookups.
 * Prescriptions: the live backend has no doctor-facing prescriptions CRUD
 * yet; medical_records + SOAP notes cover the clinical workflow, so those
 * adapters return graceful empty results until the endpoint ships.
 */

import apiClient from './client';
import { getSupabaseClient } from '../services/supabaseClient';
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

// ─── Row shapes ───────────────────────────────────────────────────────────────

interface DoctorProfileRow {
  id: string;
  profile_id: string;
  specialization: string;
  bio: string | null;
  experience_years: number | null;
  clinic_name: string | null;
  clinic_address: string | null;
  consultation_fee: number | null;
  rating: number | null;
  review_count: number | null;
  is_available: boolean | null;
}

interface AppointmentRow {
  id: string;
  doctor_id: string;
  patient_id: string;
  scheduled_at: string;
  duration: number | null;
  status: string;
  type: string;
  reason: string | null;
  payment_status: string | null;
  created_at: string;
  doctor?: {
    id: string;
    specialization: string | null;
    consultation_fee: number | null;
    profile?: { first_name: string | null; last_name: string | null } | null;
  } | null;
  patient?: {
    id: string;
    profile?: {
      first_name: string | null;
      last_name: string | null;
      avatar_url?: string | null;
      date_of_birth?: string | null;
      gender?: string | null;
    } | null;
  } | null;
}

interface PatientProfileRow {
  id: string;
  profile_id: string;
  date_of_birth: string | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  blood_type: string | null;
  blood_group: string | null;
  genotype: string | null;
  profile?: { first_name: string | null; last_name: string | null; email: string | null; phone: string | null } | null;
  created_at: string;
}

interface WorkingHoursRow {
  id: string;
  doctor_id: string;
  day: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  slot_duration: number | null;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapAppointment(row: AppointmentRow): Appointment {
  const docName = row.doctor?.profile;
  return {
    id: row.id,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    doctor: {
      id: row.doctor?.id ?? row.doctor_id,
      firstName: docName?.first_name ?? 'Dr.',
      lastName: docName?.last_name ?? '',
      specialization: row.doctor?.specialization ?? '',
      avatarUrl: undefined,
    },
    patient: {
      id: row.patient?.id ?? row.patient_id,
      firstName: row.patient?.profile?.first_name ?? '',
      lastName: row.patient?.profile?.last_name ?? '',
      avatarUrl: undefined,
      dateOfBirth: row.patient?.profile?.date_of_birth ?? '',
      gender: (row.patient?.profile?.gender as Appointment['patient']['gender']) ?? 'other',
    },
    scheduledAt: row.scheduled_at,
    duration: row.duration ?? 30,
    status: row.status as Appointment['status'],
    type: row.type as Appointment['type'],
    reason: row.reason ?? '',
    paymentStatus: (row.payment_status as Appointment['paymentStatus']) ?? undefined,
    createdAt: row.created_at,
  };
}

function mapPatient(row: PatientProfileRow): Patient {
  const p = row.profile;
  return {
    id: row.id,
    userId: row.profile_id,
    firstName: p?.first_name ?? '',
    lastName: p?.last_name ?? '',
    email: p?.email ?? '',
    phone: p?.phone ?? undefined,
    avatarUrl: undefined,
    dateOfBirth: row.date_of_birth ?? '',
    gender: (row.gender as Patient['gender']) ?? 'other',
    bloodType: row.blood_type ?? undefined,
    bloodGroup: row.blood_group ?? undefined,
    genotype: row.genotype ?? undefined,
    height: row.height_cm ?? undefined,
    weight: row.weight_kg ?? undefined,
    createdAt: row.created_at,
  };
}

function mapWorkingHours(row: WorkingHoursRow): WorkingHours {
  return {
    day: row.day as WorkingHours['day'],
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    isActive: row.is_active,
    slotDuration: row.slot_duration ?? 30,
  };
}

function paginate<T>(items: T[], params?: PaginationParams): PaginatedResponse<T> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return {
    data: slice,
    total: items.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
    hasNextPage: start + limit < items.length,
    hasPrevPage: page > 1,
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const doctorApi = {
  async getDashboard(): Promise<ApiResponse<DoctorDashboard>> {
    const { data } = await apiClient.get<{ appointments: AppointmentRow[] }>('/appointments');
    const appointments = (data.appointments ?? []).map(mapAppointment);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAppointments = appointments.filter((a) => a.scheduledAt.slice(0, 10) === todayStr);

    const patientIds = [...new Set(appointments.map((a) => a.patientId))];
    const recentPatients: Patient[] = [];
    for (const pid of patientIds.slice(0, 5)) {
      try {
        const { data: pdata } = await apiClient.get<{ patient: PatientProfileRow }>(`/patients/${pid}`);
        recentPatients.push(mapPatient(pdata.patient));
      } catch {
        // RLS may hide some rows — skip
      }
    }

    const stats = {
      todayAppointments: todayAppointments.length,
      totalPatients: patientIds.length,
      completedToday: todayAppointments.filter((a) => a.status === 'completed').length,
      pendingToday: todayAppointments.filter((a) => a.status === 'pending').length,
      weeklyRevenue: 0,
      monthlyAppointments: appointments.length,
    };

    return {
      data: { stats, todayAppointments, recentPatients },
      message: 'ok',
      success: true,
      statusCode: 200,
    };
  },

  async getAppointments(
    params?: PaginationParams & { status?: string; date?: string }
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    const { data } = await apiClient.get<{ appointments: AppointmentRow[] }>('/appointments', {
      params: { status: params?.status },
    });
    let appointments = (data.appointments ?? []).map(mapAppointment);
    if (params?.date) {
      appointments = appointments.filter((a) => a.scheduledAt.slice(0, 10) === params.date);
    }
    return { data: paginate(appointments, params), message: 'ok', success: true, statusCode: 200 };
  },

  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    const { data } = await apiClient.get<{ appointments: AppointmentRow[] }>('/appointments');
    const row = (data.appointments ?? []).find((a) => a.id === id);
    if (!row) {
      return { data: null as unknown as Appointment, message: 'Not found', success: false, statusCode: 404 };
    }
    return { data: mapAppointment(row), message: 'ok', success: true, statusCode: 200 };
  },

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    const { data } = await apiClient.patch<{ appointment: AppointmentRow }>(`/appointments/${id}`, {
      status,
    });
    return {
      data: mapAppointment(data.appointment),
      message: 'Appointment updated',
      success: true,
      statusCode: 200,
    };
  },

  async submitSOAPNote(
    appointmentId: string,
    soap: { subjective: string; objective: string; assessment: string; plan: string }
  ): Promise<ApiResponse<void>> {
    const transcript = `Subjective: ${soap.subjective}\nObjective: ${soap.objective}\nAssessment: ${soap.assessment}\nPlan: ${soap.plan}`;
    await apiClient.post('/ai/soap', { appointmentId, transcript });
    return { data: undefined as unknown as void, message: 'SOAP note saved', success: true, statusCode: 200 };
  },

  async getPatients(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Patient>>> {
    // Patients visible to this doctor = those with shared appointments.
    const { data } = await apiClient.get<{ appointments: AppointmentRow[] }>('/appointments');
    const rows = data.appointments ?? [];
    const patientIds = [...new Set(rows.map((a) => a.patient_id))];

    const patients: Patient[] = [];
    for (const pid of patientIds) {
      try {
        const { data: pdata } = await apiClient.get<{ patient: PatientProfileRow }>(`/patients/${pid}`);
        patients.push(mapPatient(pdata.patient));
      } catch {
        // skip rows hidden by RLS
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      const filtered = patients.filter(
        (p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
      return { data: paginate(filtered, params), message: 'ok', success: true, statusCode: 200 };
    }
    return { data: paginate(patients, params), message: 'ok', success: true, statusCode: 200 };
  },

  async getPatientById(id: string): Promise<ApiResponse<Patient>> {
    const { data } = await apiClient.get<{ patient: PatientProfileRow }>(`/patients/${id}`);
    return { data: mapPatient(data.patient), message: 'ok', success: true, statusCode: 200 };
  },

  async getPatientPrescriptions(_patientId: string): Promise<ApiResponse<Prescription[]>> {
    // No doctor-facing prescriptions endpoint on the live backend yet.
    return { data: [], message: 'ok', success: true, statusCode: 200 };
  },

  async createPrescription(_payload: CreatePrescriptionPayload): Promise<ApiResponse<Prescription>> {
    // No doctor-facing prescriptions endpoint on the live backend yet —
    // SOAP notes via /ai/soap are the clinical documentation path.
    return {
      data: null as unknown as Prescription,
      message: 'Prescriptions are handled via SOAP notes on the live backend',
      success: false,
      statusCode: 501,
    };
  },

  async getPrescriptionById(_id: string): Promise<ApiResponse<Prescription>> {
    return { data: null as unknown as Prescription, message: 'Not available', success: false, statusCode: 501 };
  },

  async getAvailability(): Promise<ApiResponse<WorkingHours[]>> {
    const supabase = getSupabaseClient();
    const { data: doctor } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    if (!doctor) {
      return { data: [], message: 'No doctor profile', success: true, statusCode: 200 };
    }
    const { data: rows } = await supabase
      .from('doctor_working_hours')
      .select('*')
      .eq('doctor_id', doctor.id);
    return {
      data: (rows ?? []).map(mapWorkingHours),
      message: 'ok',
      success: true,
      statusCode: 200,
    };
  },

  async updateAvailability(availability: WorkingHours[]): Promise<ApiResponse<WorkingHours[]>> {
    const { data } = await apiClient.put<{ workingHours: WorkingHoursRow[] }>(
      '/doctors/me/working-hours',
      { entries: availability }
    );
    return {
      data: (data.workingHours ?? []).map(mapWorkingHours),
      message: 'Availability updated',
      success: true,
      statusCode: 200,
    };
  },
};
