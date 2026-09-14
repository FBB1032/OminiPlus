/**
 * Omini Pulse Desktop — Live backend services (https://ominipulse.onrender.com/api)
 *
 * Maps the deployed Express contract onto the console's domain types. All data
 * is fetched live from the Supabase-backed API. Failures throw (getApiErrorMessage)
 * so pages render explicit error states — there are no mock fallbacks.
 */

import apiClient, { getApiErrorMessage } from './apiClient';
import type {
  DashboardStats,
  Doctor,
  Patient,
  Hospital,
  AIFlag,
  AuditLog,
  AdminAuditLog,
  AIInteraction,
  Broadcast,
  PaymentTransaction,
  Appointment,
  IncidentReport,
} from '@/types';

// ─── Row shapes from the live backend ───────────────────────────────────────

export interface ProfileRow {
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
  last_login?: string | null;
  created_at: string;
}

/** Public alias for admin roster consumers (security console). */
export type ProfileUserRow = ProfileRow;

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
  escrow_released_at?: string | null;
  refund_reason?: string | null;
  refunded_at?: string | null;
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
  doctor?: { id: string; specialization: string | null; consultation_fee?: number | null; profile?: { first_name: string | null; last_name: string | null } | null } | null;
  patient?: { id: string; profile?: { first_name: string | null; last_name: string | null } | null } | null;
}

interface BroadcastRow {
  id: string;
  title: string;
  body: string;
  type: string;
  target_audience: string;
  status: string;
  recipient_count: number | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentRow {
  id: string;
  reporter_id: string | null;
  reporter_name: string | null;
  target_id: string | null;
  target_name: string | null;
  target_type: string;
  category: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  resolved_at: string | null;
}

// Raw blood donor registry rows (hospital/blood/donors).
export interface BloodDonorRow {
  id: string;
  profile_id: string | null;
  full_name: string;
  blood_group: string;
  genotype: string | null;
  city: string;
  region: string | null;
  phone: string;
  email: string | null;
  availability_status: string;
  partner_status: 'active' | 'pending' | 'suspended' | 'rejected';
  last_donation_date: string | null;
  donations_count: number;
  gender: string | null;
  verification_submitted_at: string | null;
  verification_reviewed_at: string | null;
  verification_reviewed_by: string | null;
  rejection_reason: string | null;
  donor_card_url: string | null;
  medical_check_url: string | null;
}

// Raw hospital operations rows (hospital/* endpoints).
export interface HospitalBedRow {
  id: string;
  hospital_id: string;
  ward: string;
  bed_number: string;
  status: string;
  patient_id: string | null;
  occupied_since: string | null;
}

export interface PharmacyOrderRow {
  id: string;
  prescription_id: string | null;
  patient_id: string | null;
  medication_id: string | null;
  quantity: number;
  status: string;
  created_at: string;
  dispensed_at: string | null;
}

export interface MedicationItemRow {
  id: string;
  hospital_id: string;
  name: string;
  form: string | null;
  strength: string | null;
  unit: string | null;
  stock_qty: number;
  reorder_level: number;
}

export interface LabOrderRow {
  id: string;
  patient_id: string | null;
  doctor_id: string | null;
  test_type: string;
  status: string;
  results_summary: string | null;
  findings: string | null;
  created_at: string;
  verified_at: string | null;
}

export interface BloodRequestRow {
  id: string;
  patient_id: string | null;
  patient_name: string;
  blood_group: string;
  units_needed: number;
  status: string;
  hospital_id: string | null;
  created_at: string;
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
    escrowReleasedAt: row.escrow_released_at ?? undefined,
    refundReason: row.refund_reason ?? undefined,
    refundedAt: row.refunded_at ?? undefined,
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
    consultationFee: row.doctor?.consultation_fee ?? undefined,
    createdAt: row.created_at,
  };
}

function mapBroadcast(row: BroadcastRow): Broadcast {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: (row.type as Broadcast['type']) ?? 'announcement',
    targetAudience: (row.target_audience as Broadcast['targetAudience']) ?? 'all',
    status: (row.status as Broadcast['status']) ?? 'draft',
    recipientCount: row.recipient_count ?? 0,
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapIncident(row: IncidentRow): IncidentReport {
  return {
    id: row.id,
    reporterId: row.reporter_id ?? '—',
    reporterName: row.reporter_name ?? 'Anonymous',
    targetId: row.target_id ?? '—',
    targetName: row.target_name ?? 'Unknown',
    targetType: (row.target_type as IncidentReport['targetType']) ?? 'doctor',
    category: (row.category as IncidentReport['category']) ?? 'other',
    description: row.description,
    status: (row.status as IncidentReport['status']) ?? 'pending',
    severity: (row.severity as IncidentReport['severity']) ?? 'low',
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
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

async function requireGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<T>(path, { params });
  return data;
}

export const liveApi = {
  /** Platform KPI counts. */
  async getDashboardStats(): Promise<DashboardStats> {
    const data = await requireGet<{ totals: Record<string, number>; pendingDoctorVerifications: number }>(
      '/admin/dashboard'
    );
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

  async getDoctors(): Promise<Doctor[]> {
    const [users, directory] = await Promise.all([
      requireGet<{ users: ProfileRow[] }>('/admin/users', { role: 'doctor' }),
      requireGet<{ doctors: DoctorDirectoryRow[] | null }>('/doctors'),
    ]);

    const dirByProfileId = new Map(
      (directory?.doctors ?? []).map((d) => [d.profile?.id ?? '', d])
    );

    return (users?.users ?? []).map((u) => {
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
  },

  async getPatients(): Promise<Patient[]> {
    const data = await requireGet<{ users: ProfileRow[] }>('/admin/users', { role: 'patient' });
    return data.users.map(mapPatient);
  },

  /** Administrator roster (security console). */
  async getAdminUsers(): Promise<ProfileRow[]> {
    const data = await requireGet<{ users: ProfileRow[] }>('/admin/users', { role: 'admin' });
    return data.users ?? [];
  },

  async getHospitals(): Promise<Hospital[]> {
    const data = await requireGet<{ hospitals: HospitalRow[] }>('/admin/hospitals');
    return (data.hospitals ?? []).map(mapHospital);
  },

  async getAIFlags(): Promise<AIFlag[]> {
    const data = await requireGet<{ flags: AiFlagRow[] }>('/admin/ai-flags');
    return (data.flags ?? []).map(mapAiFlag);
  },

  async updateAIFlagStatus(id: string, status: 'reviewed' | 'dismissed'): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/ai-flags/${id}`, { status });
      return true;
    } catch (err) {
      console.warn(`[liveApi] PATCH /admin/ai-flags/${id} failed: ${getApiErrorMessage(err)}`);
      return false;
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const data = await requireGet<{ logs: AuditLogRow[] }>('/admin/audit-logs');
    return (data.logs ?? []).map(mapAuditLog);
  },

  async getPayments(): Promise<PaymentTransaction[]> {
    const data = await requireGet<{ payments: PaymentRow[] }>('/admin/payments');
    return (data.payments ?? []).map(mapPayment);
  },

  async getAppointments(): Promise<Appointment[]> {
    const data = await requireGet<{ appointments: AppointmentRow[] }>('/appointments');
    return (data.appointments ?? []).map(mapAppointment);
  },

  async setUserStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/users/${id}/status`, { isActive });
      return true;
    } catch (err) {
      console.warn(`[liveApi] PATCH /admin/users/${id}/status failed: ${getApiErrorMessage(err)}`);
      return false;
    }
  },

  /** Super-admin doctor verification decision (approve | reject). */
  async verifyDoctor(id: string, decision: 'approve' | 'reject', reason?: string): Promise<boolean> {
    try {
      await apiClient.post(`/admin/users/${id}/verify`, { decision, reason });
      return true;
    } catch (err) {
      console.warn(`[liveApi] POST /admin/users/${id}/verify failed: ${getApiErrorMessage(err)}`);
      return false;
    }
  },

  /** Incident reports (Reports console). */
  async getIncidents(params?: { status?: string }): Promise<IncidentReport[]> {
    const data = await requireGet<{ incidents: IncidentRow[] }>('/admin/incidents', params);
    return (data.incidents ?? []).map(mapIncident);
  },

  async updateIncidentStatus(id: string, status: IncidentReport['status']): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/incidents/${id}`, { status });
      return true;
    } catch (err) {
      console.warn(`[liveApi] PATCH /admin/incidents/${id} failed: ${getApiErrorMessage(err)}`);
      return false;
    }
  },

  /** Blood donor registry (Blood Donor verification console). */
  async getBloodDonors(params?: { status?: string }): Promise<BloodDonorRow[]> {
    const data = await requireGet<{ donors: BloodDonorRow[] }>('/hospital/blood/donors', params);
    return data.donors ?? [];
  },

  async updateBloodDonorStatus(
    id: string,
    partnerStatus: 'active' | 'pending' | 'suspended' | 'rejected',
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      await apiClient.patch(`/hospital/blood/donors/${id}/status`, { partnerStatus, rejectionReason });
      return true;
    } catch (err) {
      console.warn(`[liveApi] PATCH /hospital/blood/donors/${id}/status failed: ${getApiErrorMessage(err)}`);
      return false;
    }
  },

  /** Hospital portal operations (beds, pharmacy, lab, blood requests). */
  async getHospitalBeds(): Promise<HospitalBedRow[]> {
    const data = await requireGet<{ beds: HospitalBedRow[] }>('/hospital/beds');
    return data.beds ?? [];
  },

  async getPharmacyQueue(): Promise<PharmacyOrderRow[]> {
    const data = await requireGet<{ orders: PharmacyOrderRow[] }>('/hospital/pharmacy/queue');
    return data.orders ?? [];
  },

  async getPharmacyInventory(): Promise<MedicationItemRow[]> {
    const data = await requireGet<{ items: MedicationItemRow[] }>('/hospital/pharmacy/inventory');
    return data.items ?? [];
  },

  async getLabOrders(): Promise<LabOrderRow[]> {
    const data = await requireGet<{ orders: LabOrderRow[] }>('/hospital/lab/orders');
    return data.orders ?? [];
  },

  async getBloodRequests(): Promise<BloodRequestRow[]> {
    const data = await requireGet<{ requests: BloodRequestRow[] }>('/hospital/blood/requests');
    return data.requests ?? [];
  },

  /** Hash-chained administrative action trail (compliance). */
  async getAdminAuditLogs(params?: { action?: string; actorId?: string; limit?: number }): Promise<AdminAuditLog[]> {
    const data = await requireGet<{ logs: AdminAuditLog[] }>('/admin/admin-audit-logs', params);
    return (data.logs ?? []).map((row) => ({
      ...row,
      actorId: row.actorId ?? (row as unknown as { actor_id?: string }).actor_id ?? null,
      actorName: row.actorName ?? (row as unknown as { actor_name?: string }).actor_name ?? 'System',
      actorRole: row.actorRole ?? (row as unknown as { actor_role?: string }).actor_role ?? 'system',
      targetType: row.targetType ?? (row as unknown as { target_type?: string }).target_type ?? 'user',
      targetId: row.targetId ?? (row as unknown as { target_id?: string }).target_id ?? null,
      targetLabel: row.targetLabel ?? (row as unknown as { target_label?: string }).target_label ?? null,
      ipAddress: row.ipAddress ?? (row as unknown as { ip_address?: string }).ip_address ?? null,
      userAgent: row.userAgent ?? (row as unknown as { user_agent?: string }).user_agent ?? null,
      prevHash: row.prevHash ?? (row as unknown as { prev_hash?: string }).prev_hash ?? null,
      entryHash: row.entryHash ?? (row as unknown as { entry_hash?: string }).entry_hash ?? '—',
    }));
  },

  /** User↔AI prompt/response interaction logs (admin review). */
  async getAIInteractions(params?: { feature?: string; search?: string; limit?: number }): Promise<AIInteraction[]> {
    const data = await requireGet<{ interactions: AIInteraction[] }>('/admin/ai-interactions', params);
    return (data.interactions ?? []).map((row) => ({
      ...row,
      profileId: row.profileId ?? (row as unknown as { profile_id?: string }).profile_id ?? null,
      profileRole: row.profileRole ?? (row as unknown as { profile_role?: string }).profile_role ?? null,
      conversationId: row.conversationId ?? (row as unknown as { conversation_id?: string }).conversation_id ?? null,
      createdAt: row.createdAt ?? (row as unknown as { created_at?: string }).created_at ?? '',
    }));
  },

  // ─── Broadcast Center ────────────────────────────────────────────────────────

  async getBroadcasts(): Promise<Broadcast[]> {
    const data = await requireGet<{ broadcasts: BroadcastRow[] }>('/broadcasts');
    return (data.broadcasts ?? []).map((row) => mapBroadcast(row));
  },

  async createBroadcast(payload: {
    title: string;
    body: string;
    type?: 'announcement' | 'reminder' | 'alert' | 'system';
    targetAudience?: 'all' | 'doctors' | 'patients' | 'staff';
    scheduledAt?: string;
  }): Promise<Broadcast> {
    const { data } = await apiClient.post<{ broadcast: BroadcastRow }>('/broadcasts', payload);
    return mapBroadcast(data.broadcast);
  },

  async dispatchBroadcast(id: string): Promise<{ recipients: number }> {
    const { data } = await apiClient.post<{ broadcastId: string; recipients: number }>(`/broadcasts/${id}/dispatch`);
    return { recipients: data.recipients };
  },

  async deleteBroadcast(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/broadcasts/${id}`);
      return true;
    } catch (err) {
      console.warn(`[liveApi] DELETE /broadcasts/${id} failed: ${getApiErrorMessage(err)}`);
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

export { getApiErrorMessage };
