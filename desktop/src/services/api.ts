/**
 * Omini Pulse Desktop — Live backend services (https://ominipulse.onrender.com/api)
 *
 * Maps the deployed Express contract onto the console's domain types. Every
 * fetcher falls back to `null` on failure (permission, network, cold start)
 * so pages can keep rendering their built-in demo data.
 */

import apiClient from './apiClient';
import type {
  DashboardStats,
  Doctor,
  Patient,
  Hospital,
  AIFlag,
  AuditLog,
  PaymentTransaction,
  Appointment,
} from '@/types';

// ─── Row shapes from the live backend ───────────────────────────────────────

interface ProfileRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  phone?: string | null;
  avatar_url?: string | null;
  verification_status?: string | null;
  is_active?: boolean | null;
  is_approved?: boolean | null;
  created_at: string;
}

interface HospitalRow {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  emergency_phone?: string | null;
  phone?: string | null;
  email: string | null;
  website: string | null;
  partner_status: string | null;
  created_at: string;
  logo_url?: string | null;
}

interface AiFlagRow {
  id: string;
  profile_id: string | null;
  prompt: string;
  reason: string | null;
  severity: string;
  status: string;
  created_at: string;
}

interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_role?: string | null;
  action: string;
  record_category: string | null;
  record_id: string | null;
  record_name: string | null;
  ip_address: string | null;
  device: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  reference: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  amount: number;
  currency: string;
  platform_fee: number | null;
  doctor_payout: number | null;
  status: string;
  method: string;
  escrow_released: boolean | null;
  created_at: string;
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
  created_at: string;
  doctor?: { id: string; specialization: string | null; profile?: { first_name: string | null; last_name: string | null } | null } | null;
  patient?: { id: string; profile?: { first_name: string | null; last_name: string | null } | null } | null;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

const fallbackName = (first: string | null, last: string | null) =>
  `${(first ?? '').trim()} ${(last ?? '').trim()}`.trim() || 'Unknown';

function mapDoctorFromUsers(user: ProfileRow): Doctor {
  return {
    id: user.id,
    firstName: user.first_name ?? 'Dr.',
    lastName: user.last_name ?? '',
    email: user.email,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatar_url ?? undefined,
    specialization: '—',
    licenseNo: '—',
    verificationStatus: (user.verification_status as Doctor['verificationStatus']) ?? 'pending',
    isApproved: user.is_approved ?? false,
    createdAt: user.created_at,
    documentsCount: 0,
  };
}

function mapPatient(user: ProfileRow): Patient {
  return {
    id: user.id,
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    email: user.email,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatar_url ?? undefined,
    createdAt: user.created_at,
    isActive: user.is_active ?? true,
  };
}

function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    name: row.name,
    address: [row.address, row.city, row.state].filter(Boolean).join(', '),
    city: row.city ?? '—',
    country: row.country ?? '—',
    phone: row.emergency_phone ?? row.phone ?? '—',
    email: row.email ?? '—',
    website: row.website ?? undefined,
    partnerStatus: (row.partner_status as Hospital['partnerStatus']) ?? 'pending',
    createdAt: row.created_at,
    logoUrl: row.logo_url ?? undefined,
  };
}

function mapAiFlag(row: AiFlagRow): AIFlag {
  return {
    id: row.id,
    userId: row.profile_id ?? 'unknown',
    userRole: 'patient',
    prompt: row.prompt,
    reason: row.reason ?? '—',
    severity: (row.severity as AIFlag['severity']) ?? 'low',
    status: (row.status as AIFlag['status']) ?? 'pending',
    createdAt: row.created_at,
  };
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    adminId: row.actor_id ?? 'system',
    adminName: row.actor_name ?? 'System',
    action: row.action,
    resource: row.record_category ?? '—',
    resourceId: row.record_id ?? undefined,
    ipAddress: row.ip_address ?? '—',
    userAgent: row.device ?? undefined,
    createdAt: row.created_at,
  };
}

function mapPayment(row: PaymentRow): PaymentTransaction {
  return {
    id: row.id,
    reference: row.reference,
    patientId: row.patient_id,
    patientName: 'Patient',
    doctorId: row.doctor_id,
    doctorName: 'Doctor',
    appointmentId: row.appointment_id ?? '—',
    serviceType: 'consultation',
    amount: row.amount,
    currency: row.currency,
    platformFee: row.platform_fee ?? 0,
    doctorPayout: row.doctor_payout ?? row.amount,
    status: (row.status as PaymentTransaction['status']) ?? 'pending',
    method: (row.method as PaymentTransaction['method']) ?? 'card',
    escrowReleased: row.escrow_released ?? row.status === 'released',
    createdAt: row.created_at,
  };
}

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patient: {
      id: row.patient?.id ?? row.patient_id,
      firstName: row.patient?.profile?.first_name ?? 'Unknown',
      lastName: row.patient?.profile?.last_name ?? '',
    },
    doctor: {
      id: row.doctor?.id ?? row.doctor_id,
      firstName: row.doctor?.profile?.first_name ?? 'Dr.',
      lastName: row.doctor?.profile?.last_name ?? '',
      specialization: row.doctor?.specialization ?? '—',
    },
    scheduledAt: row.scheduled_at,
    duration: row.duration ?? 30,
    type: (row.type as Appointment['type']) ?? 'video',
    status: (row.status as Appointment['status']) ?? 'pending',
    reason: row.reason ?? '',
    createdAt: row.created_at,
  };
}

interface DoctorDirectoryRow {
  id: string;
  specialization: string;
  experience_years: number | null;
  rating: number | null;
  review_count: number | null;
  consultation_fee: number | null;
  is_mdcn_verified: boolean | null;
  clinic_name: string | null;
  profile: { first_name: string | null; last_name: string | null; avatar_url: string | null; id: string } | null;
}

// ─── Services ─────────────────────────────────────────────────────────────────

async function safeGet<T>(path: string, params?: Record<string, unknown>): Promise<T | null> {
  try {
    const { data } = await apiClient.get<T>(path, { params });
    return data;
  } catch {
    return null; // network / 403 / cold start — caller falls back to demo data
  }
}

export const liveApi = {
  /** Platform KPI counts. Returns null if unreachable (page falls back). */
  async getDashboardStats(): Promise<DashboardStats | null> {
    const data = await safeGet<{ totals: Record<string, number>; pendingDoctorVerifications: number }>(
      '/admin/dashboard'
    );
    if (!data) return null;
    const t = data.totals ?? {};
    return {
      totalDoctors: 0,
      totalPatients: 0,
      pendingVerifications: data.pendingDoctorVerifications ?? 0,
      totalAppointments: t.appointments ?? 0,
      totalHospitals: t.hospitals ?? 0,
      totalPharmacies: 0,
      activeUsers: t.profiles ?? 0,
      flaggedAIPrompts: t.ai_flags ?? 0,
      securityAlerts: t.incident_reports ?? 0,
    };
  },

  async getDoctors(): Promise<Doctor[] | null> {
    const [users, directory] = await Promise.all([
      safeGet<{ users: ProfileRow[] }>('/admin/users', { role: 'doctor' }),
      safeGet<{ doctors: DoctorDirectoryRow[] | null }>('/doctors'),
    ]);
    if (!users && !directory) return null;

    const dirByProfileId = new Map(
      (directory?.doctors ?? []).map((d) => [d.profile?.id ?? '', d])
    );

    const mapped = (users?.users ?? []).map((u) => {
      const doctor = mapDoctorFromUsers(u);
      const dir = dirByProfileId.get(u.id);
      if (dir) {
        return {
          ...doctor,
          specialization: dir.specialization ?? doctor.specialization,
          yearsExp: dir.experience_years ?? undefined,
          rating: dir.rating ?? undefined,
          reviewCount: dir.review_count ?? undefined,
          consultationFee: dir.consultation_fee ?? undefined,
          hospital: dir.clinic_name ?? undefined,
          verificationStatus: dir.is_mdcn_verified ? ('approved' as const) : doctor.verificationStatus,
        };
      }
      return doctor;
    });
    return mapped;
  },

  async getPatients(): Promise<Patient[] | null> {
    const data = await safeGet<{ users: ProfileRow[] }>('/admin/users', { role: 'patient' });
    if (!data) return null;
    return data.users.map(mapPatient);
  },

  async getHospitals(): Promise<Hospital[] | null> {
    const data = await safeGet<{ hospitals: HospitalRow[] }>('/admin/hospitals');
    if (!data) return null;
    return (data.hospitals ?? []).map(mapHospital);
  },

  async getAIFlags(): Promise<AIFlag[] | null> {
    const data = await safeGet<{ flags: AiFlagRow[] }>('/admin/ai-flags');
    if (!data) return null;
    return (data.flags ?? []).map(mapAiFlag);
  },

  async updateAIFlagStatus(id: string, status: 'reviewed' | 'dismissed'): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/ai-flags/${id}`, { status });
      return true;
    } catch {
      return false;
    }
  },

  async getAuditLogs(): Promise<AuditLog[] | null> {
    const data = await safeGet<{ logs: AuditLogRow[] }>('/admin/audit-logs');
    if (!data) return null;
    return (data.logs ?? []).map(mapAuditLog);
  },

  async getPayments(): Promise<PaymentTransaction[] | null> {
    const data = await safeGet<{ payments: PaymentRow[] }>('/admin/payments');
    if (!data) return null;
    return (data.payments ?? []).map(mapPayment);
  },

  async getAppointments(): Promise<Appointment[] | null> {
    const data = await safeGet<{ appointments: AppointmentRow[] }>('/appointments');
    if (!data) return null;
    return (data.appointments ?? []).map(mapAppointment);
  },

  async setUserStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/users/${id}/status`, { isActive });
      return true;
    } catch {
      return false;
    }
  },

  /** Backend uptime probe (also warms the free-tier Render instance). */
  async checkHealth(): Promise<boolean> {
    try {
      const { API_BASE_URL } = await import('@/constants');
      const healthUrl = API_BASE_URL.replace(/\/api\/?$/, '') + '/health';
      await apiClient.get(healthUrl, { timeout: 60000 });
      return true;
    } catch {
      return false;
    }
  },
};
