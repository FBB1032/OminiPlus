/**
 * Patient API — live backend (https://ominipulse.onrender.com/api).
 *
 * Maps the deployed contract onto the app's domain types:
 *   GET  /patients/me                     → own patient profile
 *   GET  /appointments                     → appointments (RLS: own rows)
 *   POST /appointments                     → book (doctorId, patientId, scheduledAt, type, reason)
 *   PATCH /appointointments/:id            → cancel (status: 'cancelled')
 *   GET  /appointments/slots/:doctorId/:date → available slots
 *   GET  /patients/:id/records             → medical records
 *   GET  /doctors                          → doctor directory
 *   GET  /auth/me                          → notifications (via get_my_session)
 *
 * Response mappers keep screen-facing types unchanged.
 */

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
  AppointmentStatus,
} from '../types';

// ─── Row shapes returned by the live backend ─────────────────────────────────

interface DoctorRow {
  id: string;
  profile_id?: string;
  specialization: string;
  bio: string | null;
  experience_years: number | null;
  clinic_name: string | null;
  clinic_address: string | null;
  consultation_fee: number | null;
  rating: number | null;
  review_count: number | null;
  is_available: boolean | null;
  availability_status?: string | null;
  is_mdcn_verified?: boolean | null;
  profile?: { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null } | null;
  hospital?: { id: string; name: string; city: string | null; state: string | null } | null;
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
  cancellation_reason?: string | null;
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

interface RecordRow {
  id: string;
  patient_id: string;
  type: MedicalRecord['type'];
  title: string;
  description: string | null;
  date: string;
  doctor_name: string | null;
  attachment_url: string | null;
  created_at: string;
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
  created_at: string;
}

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapDoctor(row: DoctorRow): Doctor {
  const p = row.profile ?? { first_name: null, last_name: null, avatar_url: null, id: row.profile_id ?? row.id };
  return {
    id: row.id,
    userId: p.id,
    firstName: p.first_name ?? 'Dr.',
    lastName: p.last_name ?? '',
    email: '',
    specialization: row.specialization,
    licenseNumber: '',
    experience: row.experience_years ?? 0,
    bio: row.bio ?? undefined,
    clinicName: row.clinic_name ?? undefined,
    clinicAddress: row.clinic_address ?? undefined,
    consultationFee: row.consultation_fee ?? 0,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    isAvailable: row.is_available ?? true,
    availabilityStatus: (row.availability_status as Doctor['availabilityStatus']) ?? undefined,
    workingHours: [],
    verificationStatus: row.is_mdcn_verified ? 'approved' : 'pending',
    createdAt: '',
  };
}

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
    status: row.status as AppointmentStatus,
    type: row.type as Appointment['type'],
    reason: row.reason ?? '',
    paymentStatus: (row.payment_status as Appointment['paymentStatus']) ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    createdAt: row.created_at,
  };
}

function mapRecord(row: RecordRow): MedicalRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    type: row.type,
    title: row.title,
    description: row.description ?? '',
    date: row.date,
    doctorName: row.doctor_name ?? undefined,
    attachmentUrl: row.attachment_url ?? undefined,
    createdAt: row.created_at,
  };
}

function mapNotification(row: NotificationRow): PatientNotification {
  return {
    id: row.id,
    type: (['appointment_reminder', 'prescription_ready', 'result_ready', 'general'].includes(row.type)
      ? row.type
      : 'general') as PatientNotification['type'],
    title: row.title,
    body: row.body ?? '',
    isRead: row.is_read,
    createdAt: row.created_at,
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

// ─── Cached patient context (own patient profile row) ─────────────────────────

let ownPatientRow: PatientProfileRow | null = null;

async function getOwnPatientId(): Promise<string> {
  if (ownPatientRow) return ownPatientRow.id;
  const { data } = await apiClient.get<{ patient: PatientProfileRow }>('/patients/me');
  ownPatientRow = data.patient;
  return data.patient.id;
}

export function __clearPatientCache() {
  ownPatientRow = null;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const patientApi = {
  async getHome(): Promise<ApiResponse<PatientHome>> {
    const patientId = await getOwnPatientId();
    const [apptsRes, recordsRes, notifsRes] = await Promise.all([
      apiClient.get<{ appointments: AppointmentRow[] }>('/appointments', {
        params: { upcoming: 'true' },
      }),
      apiClient.get<{ records: RecordRow[] }>(`/patients/${patientId}/records`),
      apiClient.get<{ notifications: NotificationRow[] }>('/auth/me').catch(() => null),
    ]);

    const appointments = (apptsRes.data.appointments ?? []).map(mapAppointment);
    const nowIso = new Date().toISOString();
    const upcoming = appointments
      .filter((a) => a.scheduledAt >= nowIso && a.status !== 'cancelled')
      .slice(0, 5);

    const profile = ownPatientRow;
    const healthSummary = {
      bloodPressure: undefined,
      heartRate: undefined,
      weight: profile?.weight_kg ?? undefined,
      height: profile?.height_cm ?? undefined,
      bmi:
        profile?.weight_kg && profile?.height_cm
          ? Number((profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1))
          : undefined,
      lastUpdated: nowIso,
    };

    const notifications = ((notifsRes?.data as unknown as { notifications?: NotificationRow[] })?.notifications ?? []).map(
      mapNotification
    );

    return {
      data: {
        upcomingAppointments: upcoming,
        healthSummary,
        recentPrescriptions: [],
        notifications,
      },
      message: 'ok',
      success: true,
      statusCode: 200,
    };
  },

  async getAppointments(
    params?: PaginationParams & { status?: string }
  ): Promise<ApiResponse<PaginatedResponse<Appointment>>> {
    const { data } = await apiClient.get<{ appointments: AppointmentRow[] }>('/appointments', {
      params: { status: params?.status },
    });
    const appointments = (data.appointments ?? []).map(mapAppointment);
    return { data: paginate(appointments, params), message: 'ok', success: true, statusCode: 200 };
  },

  async bookAppointment(payload: BookAppointmentPayload): Promise<ApiResponse<Appointment>> {
    const patientId = await getOwnPatientId();
    const { data } = await apiClient.post<{ appointment: AppointmentRow }>('/appointments', {
      doctorId: payload.doctorId,
      patientId,
      scheduledAt: payload.scheduledAt,
      type: payload.type,
      reason: payload.reason,
    });
    return {
      data: mapAppointment(data.appointment),
      message: 'Appointment booked',
      success: true,
      statusCode: 201,
    };
  },

  async cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
    const { data } = await apiClient.patch<{ appointment: AppointmentRow }>(`/appointments/${id}`, {
      status: 'cancelled',
      cancellationReason: 'Cancelled by patient',
    });
    return {
      data: mapAppointment(data.appointment),
      message: 'Appointment cancelled',
      success: true,
      statusCode: 200,
    };
  },

  async getMedicalRecords(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<MedicalRecord>>> {
    const patientId = await getOwnPatientId();
    const { data } = await apiClient.get<{ records: RecordRow[] }>(`/patients/${patientId}/records`);
    const records = (data.records ?? []).map(mapRecord);
    return { data: paginate(records, params), message: 'ok', success: true, statusCode: 200 };
  },

  async getPrescriptionHistory(_params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Prescription>>> {
    // The live backend does not expose a patient-facing prescriptions list yet;
    // return an empty page until that endpoint ships (medical records cover it).
    return {
      data: paginate<Prescription>([], _params),
      message: 'ok',
      success: true,
      statusCode: 200,
    };
  },

  async getDoctors(
    params?: PaginationParams & { specialization?: string }
  ): Promise<ApiResponse<PaginatedResponse<Doctor>>> {
    const { data } = await apiClient.get<{ doctors: DoctorRow[] }>('/doctors', {
      params: { specialization: params?.specialization },
    });
    let doctors = (data.doctors ?? []).map(mapDoctor);
    if (params?.search) {
      const q = params.search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q)
      );
    }
    return { data: paginate(doctors, params), message: 'ok', success: true, statusCode: 200 };
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<ApiResponse<AvailableSlot[]>> {
    const { data } = await apiClient.get<{ slots: string[] }>(`/appointments/slots/${doctorId}/${date}`);
    return { data: [{ date, slots: data.slots ?? [] }], message: 'ok', success: true, statusCode: 200 };
  },

  async getNotifications(): Promise<ApiResponse<PatientNotification[]>> {
    const { data } = await apiClient.get<{ notifications: NotificationRow[] }>('/auth/me');
    const rows = (data as unknown as { notifications?: NotificationRow[] }).notifications ?? [];
    return {
      data: rows.map(mapNotification),
      message: 'ok',
      success: true,
      statusCode: 200,
    };
  },

  async markNotificationRead(_id: string): Promise<ApiResponse<null>> {
    // No dedicated endpoint on the live backend yet — treated as a local ack.
    return { data: null, message: 'ok', success: true, statusCode: 200 };
  },

  async submitSymptomCheck(payload: {
    painLogs: Array<{ bodyPartId: string; severity: number; notes?: string }>;
  }): Promise<ApiResponse<{ triageSummary?: string; urgency?: string }>> {
    const symptoms = payload.painLogs
      .map((l) => `Body part: ${l.bodyPartId}, severity ${l.severity}/10${l.notes ? ` — ${l.notes}` : ''}`)
      .join('; ');
    const { data } = await apiClient.post<{ reply: string; urgency: string }>('/ai/triage', {
      symptoms,
    });
    return {
      data: { triageSummary: data.reply, urgency: data.urgency },
      message: 'ok',
      success: true,
      statusCode: 200,
    };
  },
};
