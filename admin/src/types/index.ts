// OminiPlus Admin — Shared TypeScript Types

// ─── Admin Roles & Permissions ────────────────────────────────────────────────

export type AdminRole =
  | 'super_admin'
  | 'verification_admin'
  | 'support_admin'
  | 'security_admin'
  | 'moderator'
  | 'doctor';

export type Permission =
  | 'dashboard.view'
  | 'doctor_portal.view' | 'doctor_portal.manage'
  | 'doctors.view' | 'doctors.verify' | 'doctors.suspend'
  | 'hospitals.view' | 'hospitals.onboard' | 'hospitals.manage'
  | 'pharmacies.view' | 'pharmacies.onboard' | 'pharmacies.manage'
  | 'appointments.view_overview' | 'appointments.resolve_issues'
  | 'ai_monitoring.view' | 'ai_monitoring.moderate'
  | 'notifications.view' | 'notifications.send'
  | 'reports.view' | 'reports.resolve'
  | 'audit_logs.view'
  | 'security.view' | 'security.manage_roles' | 'security.manage_sessions'
  | 'settings.view' | 'settings.manage';

export type UserRole = 'doctor' | 'patient' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
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

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: string;
  targetType: 'doctor' | 'patient' | 'pharmacy' | 'hospital';
  category: 'fake_credentials' | 'inappropriate_behavior' | 'fraud' | 'spam' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
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
