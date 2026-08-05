export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'no_show';

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  specialization: string;
  licenseNumber: string;
  experience: number; // years
  bio?: string;
  clinicName?: string;
  clinicAddress?: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  availabilityStatus?: 'available' | 'busy' | 'offline';
  estimatedWaitTime?: string; // e.g. "Available Now", "~15 mins wait", "Next slot: Tomorrow 9:00 AM"
  workingHours: WorkingHours[];
  verificationStatus?: 'pending' | 'approved' | 'suspended' | 'license_expired' | 'license_renewal_pending';
  licenseExpiryDate?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  verificationDocuments?: DoctorVerificationDocument[];
  createdAt: string;
}

export interface DoctorVerificationDocument {
  id: string;
  type: 'mdcn_license' | 'national_id' | 'specialty_certificate' | 'employment_letter' | 'passport_photo';
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface WorkingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // HH:mm
  endTime: string;
  isActive: boolean;
  slotDuration?: number; // minutes per slot, e.g. 30
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  doctor: Pick<Doctor, 'id' | 'firstName' | 'lastName' | 'specialization' | 'avatarUrl'>;
  patient: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'dateOfBirth' | 'gender' | 'height' | 'weight' | 'bloodType' | 'bloodGroup' | 'genotype' | 'painLogs'>;
  scheduledAt: string; // ISO date string
  duration: number; // minutes
  status: AppointmentStatus;
  type: 'in_person' | 'video' | 'phone';
  reason: string;
  notes?: string;
  prescription?: Prescription;
  soapSummary?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  isDoctorApproved?: boolean;
  doctorApprovedAt?: string;
  paymentStatus?: 'held' | 'released' | 'refunded' | 'pending';
  paymentHeldAt?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  completedToday: number;
  patientsAttended?: number;
  pendingToday: number;
  weeklyRevenue: number;
  monthlyAppointments: number;
}

export interface DoctorDashboard {
  stats: DashboardStats;
  todayAppointments: Appointment[];
  recentPatients: Patient[];
}

export interface PainLog {
  bodyPartId: string;
  severity: number; // 1-10
  notes?: string;
}

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  bloodGroup?: string;
  genotype?: string;
  painLogs?: PainLog[];
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: EmergencyContact;
  address?: string;
  height?: number;
  weight?: number;
  age?: number;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctor: Pick<Doctor, 'id' | 'firstName' | 'lastName' | 'specialization'>;
  medications: Medication[];
  diagnosis: string;
  instructions?: string;
  followUpDate?: string;
  issuedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreatePrescriptionPayload {
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  medications: Medication[];
  instructions?: string;
  followUpDate?: string;
}
