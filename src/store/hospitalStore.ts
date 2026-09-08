import { create } from 'zustand';
import {
  Hospital,
  HospitalStaff,
  HospitalPermission,
  PermissionDefinition,
  StaffRole,
  DoctorAffiliation,
  DoctorInviteCode,
  HospitalPatient,
} from '../types/hospital';

// ── Default Role Permissions Mapping ─────────────────────────────────────────
export const ROLE_DEFAULT_PERMISSIONS: Record<StaffRole, HospitalPermission[]> = {
  nurse: [
    'record_vitals',
    'view_triage',
    'view_ward_beds',
    'administer_prescriptions',
  ],
  receptionist: [
    'register_patients',
    'book_appointments',
    'queue_visits',
    'manage_intake',
  ],
  pharmacist: [
    'view_prescriptions',
    'dispense_medication',
    'inventory_records',
  ],
  lab_tech: [
    'view_lab_orders',
    'enter_test_results',
  ],
  billing_officer: [
    'create_invoices',
    'process_payments',
  ],
  records_officer: [
    'view_records',
    'manage_intake',
    'register_patients',
  ],
};

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'register_patients',
    label: 'Register Patients',
    description: 'Create new patient records during hospital check-in',
    category: 'front_desk',
  },
  {
    key: 'book_appointments',
    label: 'Schedule Appointments',
    description: 'Book and reschedule consultations with doctors',
    category: 'front_desk',
  },
  {
    key: 'queue_visits',
    label: 'Manage Patient Queue',
    description: 'Check in arrivals and manage waiting room sequence',
    category: 'front_desk',
  },
  {
    key: 'manage_intake',
    label: 'Intake and Triage Management',
    description: 'Process initial admission and triage queue',
    category: 'front_desk',
  },
  {
    key: 'record_vitals',
    label: 'Record Vital Signs',
    description: 'Log BP, pulse, temperature, SpO2, and weight',
    category: 'clinical',
  },
  {
    key: 'view_triage',
    label: 'View Triage Board',
    description: 'Monitor patient acuity levels and incoming emergencies',
    category: 'clinical',
  },
  {
    key: 'view_ward_beds',
    label: 'Ward and Bed Management',
    description: 'Check bed occupancy and assigned inpatient wards',
    category: 'clinical',
  },
  {
    key: 'administer_prescriptions',
    label: 'Administer Medications',
    description: 'Sign off on medication administration in wards',
    category: 'clinical',
  },
  {
    key: 'view_prescriptions',
    label: 'View Doctor Prescriptions',
    description: 'Inspect active prescriptions for verification',
    category: 'pharmacy',
  },
  {
    key: 'dispense_medication',
    label: 'Dispense Prescriptions',
    description: 'Mark prescription items as filled and dispensed',
    category: 'pharmacy',
  },
  {
    key: 'inventory_records',
    label: 'Pharmacy Stock and Inventory',
    description: 'Track medicine stock quantities and expiration dates',
    category: 'pharmacy',
  },
  {
    key: 'view_lab_orders',
    label: 'View Lab Test Requisitions',
    description: 'Inspect ordered laboratory diagnostics and panels',
    category: 'laboratory',
  },
  {
    key: 'enter_test_results',
    label: 'Upload and Enter Lab Results',
    description: 'Enter diagnostic findings and attach laboratory reports',
    category: 'laboratory',
  },
  {
    key: 'create_invoices',
    label: 'Generate Hospital Invoices',
    description: 'Create itemized hospital charges and bills',
    category: 'billing',
  },
  {
    key: 'process_payments',
    label: 'Process Payments and Receipts',
    description: 'Accept cash, POS, or HMO claims and issue receipts',
    category: 'billing',
  },
  {
    key: 'view_records',
    label: 'Access Medical Records Archive',
    description: 'Search and retrieve historic patient hospital charts',
    category: 'records',
  },
];

// ── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-evercare',
    name: 'Evercare Hospital Lekki',
    shortName: 'Evercare',
    licenseNumber: 'FMOH/LAG/TER/2021/0082',
    cacNumber: 'RC-1428571',
    address: 'Bisola Durosinmi Etti Drive, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos State',
    emergencyPhone: '+234 800 383 72273',
    adminEmail: 'admin@evercare.ng',
    adminName: 'Dr. Adeola Benson',
    status: 'active',
    tier: 'tertiary_teaching',
    departments: ['Cardiology', 'Internal Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynaecology'],
    registeredAt: '2023-01-15T08:00:00Z',
    isVerified: true,
  },
  {
    id: 'hosp-luth',
    name: 'Lagos University Teaching Hospital',
    shortName: 'LUTH',
    licenseNumber: 'FMOH/FED/TER/1988/0001',
    cacNumber: 'FED-000412',
    address: 'Ishaga Road, Idi-Araba, Surulere',
    city: 'Lagos',
    state: 'Lagos State',
    emergencyPhone: '+234 803 999 1122',
    adminEmail: 'clinical.director@luth.gov.ng',
    adminName: 'Prof. Olufemi Osinowo',
    status: 'active',
    tier: 'tertiary_teaching',
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Emergency Medicine', 'Dentistry'],
    registeredAt: '2022-06-10T10:00:00Z',
    isVerified: true,
  },
  {
    id: 'hosp-reddington',
    name: 'Reddington Hospital Victoria Island',
    shortName: 'Reddington',
    licenseNumber: 'FMOH/LAG/SPEC/2015/0431',
    cacNumber: 'RC-998241',
    address: '12 Idowu Martins Street, Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    emergencyPhone: '+234 1 271 5341',
    adminEmail: 'admin@reddingtonhospital.com',
    adminName: 'Dr. Charles Majekodunmi',
    status: 'active',
    tier: 'specialist',
    departments: ['Cardiology', 'Intensive Care', 'Orthopedics', 'Dermatology'],
    registeredAt: '2023-04-20T12:00:00Z',
    isVerified: true,
  },
];

const INITIAL_INVITE_CODES: DoctorInviteCode[] = [
  {
    code: '492817',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    department: 'Cardiology',
    generatedByAdminName: 'Dr. Adeola Benson',
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    isUsed: false,
    createdAt: new Date().toISOString(),
  },
  {
    code: '715392',
    hospitalId: 'hosp-luth',
    hospitalName: 'Lagos University Teaching Hospital',
    department: 'Cardiology',
    generatedByAdminName: 'Prof. Olufemi Osinowo',
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    isUsed: false,
    createdAt: new Date().toISOString(),
  },
  {
    code: '830146',
    hospitalId: 'hosp-reddington',
    hospitalName: 'Reddington Hospital Victoria Island',
    department: 'Internal Medicine',
    generatedByAdminName: 'Dr. Charles Majekodunmi',
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    isUsed: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_STAFF: HospitalStaff[] = [
  {
    id: 'staff-1',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Blessing Okoro, RN',
    email: 'b.okoro@evercare.ng',
    phone: '+234 802 345 6789',
    role: 'nurse',
    department: 'Cardiology Inpatient Ward',
    permissions: ROLE_DEFAULT_PERMISSIONS['nurse'],
    status: 'active',
    joinedAt: '2023-03-01T09:00:00Z',
  },
  {
    id: 'staff-2',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Chinedu Eze',
    email: 'c.eze@evercare.ng',
    phone: '+234 813 456 7890',
    role: 'receptionist',
    department: 'Main Outpatient Clinic',
    permissions: ROLE_DEFAULT_PERMISSIONS['receptionist'],
    status: 'active',
    joinedAt: '2023-04-12T08:30:00Z',
  },
  {
    id: 'staff-3',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Pharm. Fatima Bello',
    email: 'f.bello@evercare.ng',
    phone: '+234 805 678 9012',
    role: 'pharmacist',
    department: 'Central Hospital Pharmacy',
    permissions: ROLE_DEFAULT_PERMISSIONS['pharmacist'],
    status: 'active',
    joinedAt: '2023-02-18T10:00:00Z',
  },
  {
    id: 'staff-4',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'David Adebayo',
    email: 'd.adebayo@evercare.ng',
    phone: '+234 809 112 2334',
    role: 'billing_officer',
    department: 'Revenue & Accounts',
    permissions: ROLE_DEFAULT_PERMISSIONS['billing_officer'],
    status: 'active',
    joinedAt: '2023-05-10T11:00:00Z',
  },
];

const INITIAL_HOSPITAL_PATIENTS: HospitalPatient[] = [
  {
    id: 'hp-1',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Amara Obi',
    email: 'amara.obi@example.com',
    phone: '+234 803 112 3344',
    mrn: 'EVR-2024-0089',
    dateOfBirth: '1988-04-12',
    gender: 'female',
    bloodGroup: 'O+',
    department: 'Cardiology',
    isAppUser: true, // Registered on OmniPlus app
    lastVisit: '2026-08-28',
    notes: 'Hypertension follow-up. Teleconsultation synced via OmniPlus.',
  },
  {
    id: 'hp-2',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Alhaji Ibrahim Danladi',
    email: undefined,
    phone: '+234 802 555 7891',
    mrn: 'EVR-2023-1492',
    dateOfBirth: '1961-11-20',
    gender: 'male',
    bloodGroup: 'B+',
    department: 'Cardiology',
    isAppUser: false, // NOT registered on app: offline hospital patient
    lastVisit: '2026-08-15',
    notes: 'Paper chart archive. Attends physical clinic appointments only.',
  },
  {
    id: 'hp-3',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Folashade Adeleke',
    email: 'fola.adeleke@corporate.ng',
    phone: '+234 814 777 9022',
    mrn: 'EVR-2024-0311',
    dateOfBirth: '1995-09-03',
    gender: 'female',
    bloodGroup: 'A+',
    department: 'Cardiology',
    isAppUser: true, // Registered on OmniPlus app
    lastVisit: '2026-09-02',
    notes: 'Holter monitor scheduled. Digital reports sent through OmniPlus.',
  },
  {
    id: 'hp-4',
    hospitalId: 'hosp-evercare',
    hospitalName: 'Evercare Hospital Lekki',
    fullName: 'Emmanuel Okafor',
    email: undefined,
    phone: '+234 806 888 3311',
    mrn: 'EVR-2024-0552',
    dateOfBirth: '1974-06-18',
    gender: 'male',
    bloodGroup: 'O-',
    department: 'Cardiology',
    isAppUser: false, // NOT registered on app: offline hospital patient
    lastVisit: '2026-07-30',
    notes: 'In-hospital post-op check. Phone number on file for hospital reception contact.',
  },
];

// Initial Doctor Affiliation (empty by default to demonstrate independent status)
const INITIAL_AFFILIATIONS: Record<string, DoctorAffiliation> = {};

interface HospitalState {
  hospitals: Hospital[];
  staff: HospitalStaff[];
  inviteCodes: DoctorInviteCode[];
  hospitalPatients: HospitalPatient[];
  doctorAffiliations: Record<string, DoctorAffiliation>;

  // Platform Admin
  registerHospital: (payload: Omit<Hospital, 'id' | 'registeredAt' | 'isVerified'>) => Hospital;
  updateHospitalStatus: (hospitalId: string, status: Hospital['status']) => void;

  // Hospital Admin
  createStaff: (payload: {
    hospitalId: string;
    fullName: string;
    email: string;
    phone: string;
    role: StaffRole;
    department: string;
    customPermissions?: HospitalPermission[];
  }) => HospitalStaff;
  toggleStaffPermission: (staffId: string, permission: HospitalPermission) => void;
  removeStaff: (staffId: string) => void;
  generateDoctorInviteCode: (hospitalId: string, department: string, adminName: string) => DoctorInviteCode;
  intakeHospitalPatient: (payload: Omit<HospitalPatient, 'id'>) => HospitalPatient;

  // Doctor Linking
  verifyAndLinkDoctorCode: (
    code: string,
    doctorId: string
  ) => { success: boolean; message: string; affiliation?: DoctorAffiliation };
  disconnectHospital: (doctorId: string) => void;

  // Selectors / Helpers
  getDoctorAffiliation: (doctorId?: string) => DoctorAffiliation | null;
  getHospitalById: (hospitalId: string) => Hospital | undefined;
  getHospitalStaff: (hospitalId: string) => HospitalStaff[];
  getHospitalPatients: (hospitalId: string) => HospitalPatient[];
  getHospitalInviteCodes: (hospitalId: string) => DoctorInviteCode[];
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  hospitals: INITIAL_HOSPITALS,
  staff: INITIAL_STAFF,
  inviteCodes: INITIAL_INVITE_CODES,
  hospitalPatients: INITIAL_HOSPITAL_PATIENTS,
  doctorAffiliations: INITIAL_AFFILIATIONS,

  // Platform Admin: Register Hospital
  registerHospital: (payload) => {
    const id = `hosp-${Date.now()}`;
    const newHospital: Hospital = {
      ...payload,
      id,
      registeredAt: new Date().toISOString(),
      isVerified: payload.status === 'active',
    };
    set((state) => ({ hospitals: [newHospital, ...state.hospitals] }));
    return newHospital;
  },

  updateHospitalStatus: (hospitalId, status) => {
    set((state) => ({
      hospitals: state.hospitals.map((h) =>
        h.id === hospitalId ? { ...h, status, isVerified: status === 'active' } : h
      ),
    }));
  },

  // Hospital Admin: Create Staff
  createStaff: (payload) => {
    const hospital = get().hospitals.find((h) => h.id === payload.hospitalId);
    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[payload.role] || [];
    const newStaff: HospitalStaff = {
      id: `staff-${Date.now()}`,
      hospitalId: payload.hospitalId,
      hospitalName: hospital ? hospital.name : 'Hospital Facility',
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      department: payload.department,
      permissions: payload.customPermissions || defaultPermissions,
      status: 'active',
      joinedAt: new Date().toISOString(),
    };
    set((state) => ({ staff: [newStaff, ...state.staff] }));
    return newStaff;
  },

  toggleStaffPermission: (staffId, permission) => {
    set((state) => ({
      staff: state.staff.map((s) => {
        if (s.id !== staffId) return s;
        const exists = s.permissions.includes(permission);
        const updatedPermissions = exists
          ? s.permissions.filter((p) => p !== permission)
          : [...s.permissions, permission];
        return { ...s, permissions: updatedPermissions };
      }),
    }));
  },

  removeStaff: (staffId) => {
    set((state) => ({
      staff: state.staff.filter((s) => s.id !== staffId),
    }));
  },

  generateDoctorInviteCode: (hospitalId, department, adminName) => {
    const hospital = get().hospitals.find((h) => h.id === hospitalId);
    // Generate secure 6-digit numeric code
    const rawNum = Math.floor(100000 + Math.random() * 900000).toString();
    const newCode: DoctorInviteCode = {
      code: rawNum,
      hospitalId,
      hospitalName: hospital ? hospital.name : 'Hospital Facility',
      department,
      generatedByAdminName: adminName,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ inviteCodes: [newCode, ...state.inviteCodes] }));
    return newCode;
  },

  intakeHospitalPatient: (payload) => {
    const newPatient: HospitalPatient = {
      ...payload,
      id: `hp-${Date.now()}`,
    };
    set((state) => ({ hospitalPatients: [newPatient, ...state.hospitalPatients] }));
    return newPatient;
  },

  // Doctor Linking via 6-digit code
  verifyAndLinkDoctorCode: (code, doctorId) => {
    const cleanCode = code.trim().replace(/\D/g, '');
    const foundInvite = get().inviteCodes.find(
      (inv) => inv.code === cleanCode && !inv.isUsed
    );

    if (!foundInvite) {
      return {
        success: false,
        message: 'Invalid or expired 6-digit code. Please check with your hospital admin.',
      };
    }

    const hospital = get().hospitals.find((h) => h.id === foundInvite.hospitalId);
    if (!hospital || hospital.status !== 'active') {
      return {
        success: false,
        message: 'The hospital organization is not active or verified on OmniPlus.',
      };
    }

    // Check expiration
    if (new Date(foundInvite.expiresAt) < new Date()) {
      return {
        success: false,
        message: 'This 6-digit invitation code has expired. Please request a new code.',
      };
    }

    const affiliation: DoctorAffiliation = {
      doctorId,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      hospitalAddress: `${hospital.address}, ${hospital.city}`,
      department: foundInvite.department,
      status: 'active',
      linkedAt: new Date().toISOString(),
      linkedViaCode: cleanCode,
    };

    set((state) => ({
      inviteCodes: state.inviteCodes.map((inv) =>
        inv.code === cleanCode
          ? { ...inv, isUsed: true, usedByDoctorId: doctorId }
          : inv
      ),
      doctorAffiliations: {
        ...state.doctorAffiliations,
        [doctorId]: affiliation,
      },
    }));

    return {
      success: true,
      message: `Successfully affiliated with ${hospital.name}`,
      affiliation,
    };
  },

  disconnectHospital: (doctorId) => {
    set((state) => {
      const updated = { ...state.doctorAffiliations };
      delete updated[doctorId];
      return { doctorAffiliations: updated };
    });
  },

  // Helpers
  getDoctorAffiliation: (doctorId = 'current_doctor') => {
    const aff = get().doctorAffiliations[doctorId];
    return aff || null;
  },

  getHospitalById: (hospitalId) => {
    return get().hospitals.find((h) => h.id === hospitalId);
  },

  getHospitalStaff: (hospitalId) => {
    return get().staff.filter((s) => s.hospitalId === hospitalId);
  },

  getHospitalPatients: (hospitalId) => {
    return get().hospitalPatients.filter((p) => p.hospitalId === hospitalId);
  },

  getHospitalInviteCodes: (hospitalId) => {
    return get().inviteCodes.filter((c) => c.hospitalId === hospitalId && !c.isUsed);
  },
}));
