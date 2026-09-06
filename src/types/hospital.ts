export type HospitalStatus = 'active' | 'pending_verification' | 'suspended';

export type HospitalTier = 'general' | 'specialist' | 'tertiary_teaching' | 'private_clinic';

export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  licenseNumber: string; // State or Federal Ministry of Health License
  cacNumber: string; // Corporate Affairs Commission registration
  address: string;
  city: string;
  state: string;
  emergencyPhone: string;
  adminEmail: string;
  adminName: string;
  status: HospitalStatus;
  tier: HospitalTier;
  departments: string[];
  registeredAt: string;
  isVerified: boolean;
}

export type StaffRole =
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'lab_tech'
  | 'billing_officer'
  | 'records_officer';

export type HospitalPermission =
  | 'register_patients'
  | 'book_appointments'
  | 'queue_visits'
  | 'record_vitals'
  | 'view_triage'
  | 'view_ward_beds'
  | 'administer_prescriptions'
  | 'view_prescriptions'
  | 'dispense_medication'
  | 'inventory_records'
  | 'view_lab_orders'
  | 'enter_test_results'
  | 'create_invoices'
  | 'process_payments'
  | 'view_records'
  | 'manage_intake';

export interface PermissionDefinition {
  key: HospitalPermission;
  label: string;
  description: string;
  category: 'clinical' | 'front_desk' | 'pharmacy' | 'laboratory' | 'billing' | 'records';
}

export interface HospitalStaff {
  id: string;
  hospitalId: string;
  hospitalName: string;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  permissions: HospitalPermission[];
  status: 'active' | 'suspended';
  joinedAt: string;
}

export interface DoctorAffiliation {
  doctorId: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  department: string;
  status: 'active' | 'pending' | 'revoked';
  linkedAt: string;
  linkedViaCode: string;
}

export interface DoctorInviteCode {
  code: string; // 6-digit e.g. "492817"
  hospitalId: string;
  hospitalName: string;
  department: string;
  generatedByAdminName: string;
  expiresAt: string; // ISO timestamp
  isUsed: boolean;
  usedByDoctorId?: string;
  createdAt: string;
}

export interface HospitalPatient {
  id: string;
  hospitalId: string;
  hospitalName: string;
  fullName: string;
  email?: string;
  phone: string;
  mrn: string; // Medical Record Number
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  department: string;
  isAppUser: boolean; // true if registered on OmniPlus, false if in-hospital only
  lastVisit: string;
  notes?: string;
}
