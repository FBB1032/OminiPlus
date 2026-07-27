export const QUERY_KEYS = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  currentUser: ['currentUser'] as const,

  // ── Doctor ──────────────────────────────────────────────────────────────────
  doctorDashboard: ['doctor', 'dashboard'] as const,
  doctorAppointments: (params?: object) => ['doctor', 'appointments', params] as const,
  doctorPatients: (params?: object) => ['doctor', 'patients', params] as const,
  doctorAvailability: ['doctor', 'availability'] as const,

  // Patient (doctor-side)
  patientDetail: (patientId: string) => ['doctor', 'patient', patientId] as const,
  patientPrescriptions: (patientId: string) =>
    ['doctor', 'patient', patientId, 'prescriptions'] as const,

  // Prescriptions
  prescription: (id: string) => ['prescription', id] as const,

  // ── Patient ─────────────────────────────────────────────────────────────────
  patientHome: ['patient', 'home'] as const,
  patientAppointments: (params?: object) => ['patient', 'appointments', params] as const,
  patientMedicalRecords: (params?: object) => ['patient', 'records', params] as const,
  patientPrescriptionHistory: (params?: object) => ['patient', 'prescriptions', params] as const,
  availableSlots: (doctorId: string, date: string) => ['slots', doctorId, date] as const,
  doctorList: (params?: object) => ['doctors', params] as const,

  // ── Shared ──────────────────────────────────────────────────────────────────
  notifications: ['notifications'] as const,
  profile: ['profile'] as const,
} as const;
