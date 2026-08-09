// Omini Pulse Admin — Shared TypeScript Types

// ─── Admin Roles & Permissions ───────────────────────────────────────────────
//
// MVP Freeze: 6-tier RBAC collapsed to 2 roles.
// Managing 6 permission tiers adds backend logic bloat before having active
// users. Full RBAC will be re-introduced in Phase 2 once user roles are
// established in production.
//
// Two roles:
//   'admin'  — full platform access (replaces super_admin + all specialist admins)
//   'doctor' — doctor workspace access only (isAdmin: false)

export type AdminRole = 'admin' | 'doctor';

export type Permission =
  | 'dashboard.view'
  | 'doctor_portal.view' | 'doctor_portal.manage'
  | 'doctors.view' | 'doctors.verify' | 'doctors.suspend'
  | 'hospitals.view' | 'hospitals.onboard' | 'hospitals.manage'
  | 'pharmacies.view' | 'pharmacies.onboard' | 'pharmacies.manage'
  | 'blood_donors.view' | 'blood_donors.manage'
  | 'appointments.view_overview' | 'appointments.resolve_issues'
  | 'ai_monitoring.view' | 'ai_monitoring.moderate'
  | 'notifications.view' | 'notifications.send'
  | 'reports.view' | 'reports.resolve'
  | 'audit_logs.view'
  | 'security.view' | 'security.manage_roles' | 'security.manage_sessions'
  | 'settings.view' | 'settings.manage';

export type UserRole = 'doctor' | 'patient' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'license_expired' | 'license_renewal_pending';
export type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled';
export type PartnerStatus = 'active' | 'pending' | 'inactive' | 'suspended' | 'rejected';

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  isTwoFactorEnabled: boolean;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  specialization: string;
  licenseNo: string;
  hospital?: string;
  yearsExp?: number;
  rating?: number;
  reviewCount?: number;
  consultationFee?: number;
  verificationStatus: VerificationStatus;
  isApproved: boolean;
  createdAt: string;

  // Verification documents (matches mobile RegisterScreen uploads)
  govIdUrl?: string;       // Government ID image (JPEG/PNG)
  licenseUrl?: string;     // Medical License doc (PDF/JPEG/PNG)
  selfieUrl?: string;      // Selfie / profile photo (JPEG/PNG)

  // Verification workflow metadata
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  rejectionReason?: string;
  documentsCount: number;  // e.g. 3 = all 3 uploaded
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  age?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  partnerStatus: PartnerStatus;
  doctorCount?: number;
  createdAt: string;
  logoUrl?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  licenseNo: string;
  partnerStatus: PartnerStatus;
  operationalStatus: 'open' | 'closed';
  createdAt: string;
}

export interface Appointment {
  id: string;
  patient: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  doctor: Pick<Doctor, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'specialization'>;
  scheduledAt: string;
  duration: number;
  type: 'in_person' | 'video' | 'phone';
  status: AppointmentStatus;
  reason: string;
  consultationFee?: number;
  createdAt: string;
}

export interface AIFlag {
  id: string;
  userId: string;
  userRole: UserRole;
  prompt: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export interface ReportEvidence {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'audio' | 'transcript';
  fileUrl: string;
  uploadedAt: string;
  sizeBytes: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  targetType: 'doctor' | 'patient' | 'pharmacy' | 'hospital';
  targetLicenseNo?: string;
  targetSpecialty?: string;
  targetHospital?: string;
  consultationId?: string;
  category: 'fake_credentials' | 'inappropriate_behavior' | 'fraud' | 'spam' | 'malpractice' | 'prescription_error' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'handover_to_board' | 'temp_suspended' | 'perm_suspended';
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidenceFiles?: ReportEvidence[];
  suspensionDurationDays?: number;
  disciplinaryActionNote?: string;
  boardHandoverAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'announcement' | 'reminder' | 'alert' | 'system';
  targetAudience: 'all' | 'doctors' | 'patients';
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  pendingVerifications: number;
  totalAppointments: number;
  totalHospitals: number;
  totalPharmacies: number;
  activeUsers: number;
  flaggedAIPrompts: number;
  securityAlerts: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: 'O-' | 'O+' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  genotype: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string;
  availabilityStatus: 'Available Anytime' | 'On-Call Emergency' | 'Temporarily Unavailable';
  isVerified: boolean;
  lastDonationDate: string;
  donationsCount: number;
  gender: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospitalName: string;
  city: string;
  contactPhone: string;
  status: 'urgent' | 'fulfilled' | 'cancelled';
  createdAt: string;
}
