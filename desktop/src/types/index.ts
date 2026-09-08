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

export type AdminRole = 'admin' | 'doctor' | 'hospital_admin' | 'nurse' | 'receptionist' | 'blood_officer' | 'pharmacist' | 'lab_technician';

export type Permission =
  | 'dashboard.view'
  | 'hospital_portal.view' | 'hospital_portal.manage'
  | 'doctor_portal.view' | 'doctor_portal.manage'
  | 'doctors.view' | 'doctors.verify' | 'doctors.suspend'
  | 'patients.view' | 'patients.manage'
  | 'payments.view' | 'payments.manage'
  | 'billing.view' | 'billing.manage'
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
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  genotype?: string;
  totalAppointments?: number;
  lastVisitAt?: string;
  isActive: boolean;
  createdAt: string;
}

export type PaymentStatus = 'completed' | 'escrowed' | 'pending' | 'refunded' | 'failed';
export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd' | 'wallet';

export interface PaymentTransaction {
  id: string;
  reference: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  serviceType: string;
  amount: number;
  currency: string;
  platformFee: number;
  doctorPayout: number;
  status: PaymentStatus;
  method: PaymentMethod;
  escrowReleased: boolean;
  escrowReleasedAt?: string;
  refundReason?: string;
  refundedAt?: string;
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

// ─── Hospital Portal & Multi-Role Staff Models ──────────────────────────────

export type HospitalStaffRole = 'hospital_admin' | 'doctor' | 'nurse' | 'receptionist' | 'blood_officer' | 'pharmacist' | 'lab_technician';

export interface HospitalStaffMember {
  id: string;
  name: string;
  role: HospitalStaffRole;
  email: string;
  phone: string;
  department: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface HospitalDoctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  licenseNo: string;
  isMdcnVerified: boolean; // Platform admin MDCN verification status
  facilityStatus: 'active' | 'on_call' | 'on_leave' | 'suspended';
  availabilityDays: string[];
  shifts: string;
  syncWithMobileApp: boolean; // Indicates real-time sync with mobile edition for video/calls
  phone: string;
}

export type BloodRequestUrgency = 'routine' | 'urgent' | 'emergency';
export type BloodRequestStatus =
  | 'pending_hospital_confirmation'
  | 'hospital_confirmed'
  | 'ominipulse_verified'
  | 'donors_notified'
  | 'screening_scheduled'
  | 'fulfilled'
  | 'closed';

export interface HospitalBloodRequest {
  id: string;
  patientRef: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  unitsCollected: number;
  urgency: BloodRequestUrgency;
  requiredBy: string;
  status: BloodRequestStatus;
  hospitalNotes?: string;
  requestedBy: string;
  hospitalConfirmedAt?: string;
  ominipulseVerifiedAt?: string;
  createdAt: string;
}

export interface HospitalEmergencyRequest {
  id: string;
  type: 'blood_critical' | 'icu_bed' | 'emergency_admission' | 'trauma_surge';
  title: string;
  details: string;
  severity: 'critical' | 'high' | 'moderate';
  availableSlots?: number;
  status: 'active' | 'managed' | 'resolved';
  createdAt: string;
}

export interface HospitalAuditEntry {
  id: string;
  timestamp: string;
  staffName: string;
  staffRole: HospitalStaffRole;
  action: string;
  target: string;
  ipAddress?: string;
  badgeId?: string;
  department?: string;
  category?: 'ehr' | 'pharmacy' | 'laboratory' | 'staff_access' | 'emergency' | 'billing';
  severity?: 'critical' | 'warning' | 'info';
  hashDigest?: string;
  details?: string;
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

// ─── Hospital Ward & Bed Management ─────────────────────────────────────────
export type HospitalWardType = 'icu' | 'male_surgical' | 'female_medical' | 'pediatric' | 'maternity' | 'emergency';
export type HospitalBedStatus = 'available' | 'occupied' | 'cleaning_required' | 'maintenance';

export interface HospitalBed {
  id: string;
  bedNumber: string;
  ward: HospitalWardType;
  wardLabel: string;
  status: HospitalBedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female';
  admissionDate?: string;
  attendingDoctor?: string;
  diagnosis?: string;
  assignedNurse?: string;
  lastCleanedAt?: string;
}

// ─── Hospital Internal Pharmacy & Dispensary ────────────────────────────────
export type MedicationStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon';

export interface HospitalMedicationItem {
  id: string;
  name: string;
  category: 'Antibiotics' | 'Analgesics' | 'IV Fluids' | 'Cardiovascular' | 'Consumables' | 'Emergency';
  dosageForm: string;
  batchNumber: string;
  stockQuantity: number;
  minimumThreshold: number;
  unitPrice: number;
  expiryDate: string;
  status: MedicationStockStatus;
}

export interface HospitalPrescriptionOrder {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  prescribedAt: string;
  medications: {
    drugName: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  status: 'pending' | 'dispensed' | 'cancelled';
  dispensedBy?: string;
  dispensedAt?: string;
}

// ─── Hospital Laboratory & Diagnostics ──────────────────────────────────────
export type LabOrderStatus = 'sample_pending' | 'sample_collected' | 'in_testing' | 'results_ready' | 'verified';

export interface HospitalLabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  testName: string;
  testCategory: 'Hematology' | 'Parasitology' | 'Biochemistry' | 'Microbiology' | 'Urinalysis';
  sampleType: 'Blood' | 'Urine' | 'Stool' | 'Swab' | 'CSF';
  urgency: 'routine' | 'urgent' | 'stat_emergency';
  orderedAt: string;
  status: LabOrderStatus;
  resultsSummary?: string;
  normalRange?: string;
  findings?: string;
  technicianName?: string;
  verifiedAt?: string;
}

