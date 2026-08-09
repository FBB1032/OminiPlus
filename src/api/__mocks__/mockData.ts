/**
 * Omini Pulse AI — Offline / Development Mock Response Engine
 *
 * This file contains ALL mock fixtures for every API endpoint. It is the
 * single place to update when adding new endpoints or changing data shapes.
 *
 * BACKEND MIGRATION: When the real backend is ready, simply stop calling
 * getMockResponse() in the client interceptor (or delete this file entirely).
 * No other files need to change.
 */

import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ─── Shared Mock Fixtures ─────────────────────────────────────────────────────

const MOCK_AVAILABILITY = [
  { day: 'monday', startTime: '09:00', endTime: '17:00', isActive: true, slotDuration: 30 },
  { day: 'tuesday', startTime: '09:00', endTime: '17:00', isActive: true, slotDuration: 30 },
  { day: 'wednesday', startTime: '10:00', endTime: '14:00', isActive: true, slotDuration: 30 },
  { day: 'thursday', startTime: '09:00', endTime: '17:00', isActive: true, slotDuration: 30 },
  { day: 'friday', startTime: '09:00', endTime: '13:00', isActive: true, slotDuration: 30 },
  { day: 'saturday', startTime: '10:00', endTime: '12:00', isActive: false, slotDuration: 30 },
  { day: 'sunday', startTime: '09:00', endTime: '12:00', isActive: false, slotDuration: 30 },
];

const MOCK_DOCTOR_1 = {
  id: 'd-1',
  firstName: 'Babajide',
  lastName: 'Alabi',
  specialization: 'General Medicine',
  avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
  rating: 4.8,
  experienceYears: 12,
  clinicName: 'Omini Pulse Wellness Clinic',
  consultationFee: 150,
  isAvailable: true,
  workingHours: MOCK_AVAILABILITY,
};

const MOCK_DOCTOR_2 = {
  id: 'd-2',
  firstName: 'Chioma',
  lastName: 'Nwachukwu',
  specialization: 'Cardiology',
  avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=150',
  rating: 4.9,
  experienceYears: 15,
  clinicName: 'Omini Pulse Heart & Vascular',
  consultationFee: 200,
  isAvailable: true,
  workingHours: MOCK_AVAILABILITY,
};

const MOCK_PATIENT_1 = {
  id: 'p-1',
  firstName: 'Chioma',
  lastName: 'Egwu',
  email: 'chioma@egwu.com',
  avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
  dateOfBirth: '1985-11-10',
  gender: 'female',
  bloodType: 'O+',
  bloodGroup: 'O+',
  genotype: 'AA',
  phone: '+234 803 555 1234',
  height: 165,
  weight: 55,
  age: 40,
  allergies: ['Penicillin', 'Sulfa drugs'],
  chronicConditions: ['Type 2 Diabetes'],
  painLogs: [
    { bodyPartId: 'chest', severity: 6, notes: 'Tightness when walking fast' },
    { bodyPartId: 'head', severity: 3, notes: 'Mild morning headache' },
  ],
};

const MOCK_PATIENT_2 = {
  id: 'p-2',
  firstName: 'Chukwuma',
  lastName: 'Okoro',
  email: 'chukwuma.okoro@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  dateOfBirth: '1978-04-12',
  gender: 'male',
  bloodType: 'A-',
  bloodGroup: 'A-',
  genotype: 'AS',
  phone: '+234 812 555 9876',
  height: 180,
  weight: 75,
  age: 48,
  allergies: [],
  chronicConditions: [],
  painLogs: [],
};

const MOCK_SOAP_1 = {
  subjective:
    'Patient reports chronic fatigue and mild visual blurriness. Also mentions irregular blood glucose checks over the past week. No reports of chest discomfort or dyspnea.',
  objective:
    'Height: 165 cm, Weight: 55 kg, BMI: 20.2 (Normal). Latest blood glucose log reads 145 mg/dL. Pulse rate is 72 bpm.',
  assessment:
    'Type 2 Diabetes Mellitus under review. Mild symptoms suggest glycemic fluctuations. Cardiopulmonary signs are clear.',
  plan:
    '1. Review blood glucose logs and double-check insulin/oral med adherence.\n2. Advise regular hydration and scheduled carbohydrate intake.\n3. Review diabetic retinopathy screening recommendations during consult.',
};

const MOCK_SOAP_2 = {
  subjective:
    'Patient reports mild chest discomfort and fatigue following cardiovascular surgery 4 weeks ago. Symptoms are occasional, exacerbated by heavy lifting.',
  objective:
    'Height: 180 cm, Weight: 75 kg, BMI: 23.1 (Normal). Blood pressure reads 135/85 mmHg. Heart rate is 78 bpm.',
  assessment:
    'Post-operative cardiovascular recovery. Blood pressure is slightly elevated. Discomfort is likely musculoskeletal but requires anginal screening.',
  plan:
    '1. Advise strict avoidance of heavy lifting (>10 lbs) for another 2 weeks.\n2. Initiate blood pressure tracking protocol (twice daily).\n3. Join video session to review medication adherence (beta-blockers) and wound healing.',
};


const PAGINATED_META = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

// ─── Response Builder ─────────────────────────────────────────────────────────

function buildResponse(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return {
    data: {
      data,
      message: 'Success (Mock Fallback)',
      success: true,
      statusCode: 200,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config as AxiosResponse['config'],
  };
}

function parsePayload(raw: unknown): Record<string, unknown> {
  try {
    if (!raw) return {};
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as Record<string, unknown>);
  } catch {
    return {};
  }
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

type Handler = (config: InternalAxiosRequestConfig) => unknown;

const routes: Array<{
  method: string;
  test: (path: string) => boolean;
  handle: Handler;
}> = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    method: 'post',
    test: (p) => p === '/auth/login',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const email = ((payload.email as string) || '').toLowerCase().trim();

      // ── Seed: verified doctor account ──────────────────────────────────────
      if (email === 'doctor@ominipulse.ai') {
        return {
          user: VERIFIED_DOCTOR_USER,
          tokens: {
            accessToken: 'mock-access-token-doctor-verified',
            refreshToken: 'mock-refresh-token-doctor-verified',
            expiresAt: Date.now() + 3600 * 1000,
          },
        };
      }

      // ── Generic role detection (legacy) ────────────────────────────────────
      const role = email.includes('doctor') ? 'doctor' : 'patient';
      return {
        user: {
          id: `mock-user-${Date.now()}`,
          email,
          firstName: role === 'doctor' ? 'Babajide' : 'Alex',
          lastName: role === 'doctor' ? 'Alabi' : 'Opara',
          role,
          phone: '+234 803 555 1234',
          createdAt: new Date().toISOString(),
          isApproved: role === 'doctor' ? !email.includes('unapproved') : true,
          verificationStatus: role === 'doctor'
            ? (email.includes('unapproved') ? 'pending' : 'approved')
            : undefined,
          avatarUrl:
            role === 'doctor'
              ? MOCK_DOCTOR_1.avatarUrl
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          height: role === 'patient' ? 172 : undefined,
          weight: role === 'patient' ? 68.5 : undefined,
          bloodGroup: role === 'patient' ? 'O+' : undefined,
          genotype: role === 'patient' ? 'AA' : undefined,
          age: role === 'patient' ? 32 : undefined,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600 * 1000,
        },
      };
    },
  },
  {
    method: 'post',
    test: (p) => p === '/auth/register',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const role = (payload.role as string) || 'patient';
      return {
        user: {
          id: `mock-user-${Date.now()}`,
          email: payload.email || 'user@ominipulse.ai',
          firstName: payload.firstName || 'User',
          lastName: payload.lastName || 'Name',
          role,
          phone: payload.phone,
          createdAt: new Date().toISOString(),
          isApproved: role === 'doctor' ? false : true,
          avatarUrl:
            role === 'doctor'
              ? MOCK_DOCTOR_1.avatarUrl
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          height: payload.height ? parseFloat(payload.height as string) : undefined,
          weight: payload.weight ? parseFloat(payload.weight as string) : undefined,
          bloodGroup: (payload.bloodGroup as string) || 'O+',
          genotype: (payload.genotype as string) || 'AA',
          dateOfBirth: payload.dateOfBirth as string | undefined,
          age: (() => {
            if (!payload.dateOfBirth) return undefined;
            const birthDate = new Date(payload.dateOfBirth as string);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--;
            }
            return calculatedAge;
          })(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600 * 1000,
        },
      };
    },
  },
  {
    method: 'patch',
    test: (p) => p === '/auth/profile',
    handle: (config) => {
      const payload = parsePayload(config.data);
      return {
        id: 'mock-user-123',
        email: 'patient@ominipulse.ai',
        firstName: 'Alex',
        lastName: 'Opara',
        role: 'patient',
        createdAt: new Date().toISOString(),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '+234 803 555 1234',
        height: 172,
        weight: 68.5,
        bloodGroup: 'O+',
        genotype: 'AA',
        ...payload,
        dateOfBirth: payload.dateOfBirth as string | undefined,
        age: (() => {
          if (payload.dateOfBirth) {
            const birthDate = new Date(payload.dateOfBirth as string);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              calculatedAge--;
            }
            return calculatedAge;
          }
          return payload.age ? parseInt(payload.age as string, 10) : undefined;
        })(),
      };
    },
  },
  {
    method: 'post',
    test: (p) => p === '/auth/forgot-password',
    handle: () => ({ message: 'OTP sent' }),
  },
  {
    method: 'post',
    test: (p) => p === '/auth/verify-otp',
    handle: () => ({ verified: true }),
  },
  {
    method: 'post',
    test: (p) => p === '/auth/reset-password',
    handle: () => ({ message: 'Password reset successful' }),
  },
  {
    method: 'post',
    test: (p) => p === '/auth/logout',
    handle: () => null,
  },
  {
    method: 'get',
    test: (p) => p === '/auth/me',
    handle: () => VERIFIED_DOCTOR_USER,
  },

  // ── Doctor Dashboard ────────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/doctor/dashboard',
    handle: () => ({
      stats: {
        todayAppointments: 3,
        totalPatients: 14,
        completedToday: 5,
        patientsAttended: 5,
        pendingPrescriptions: 1,
        vitalsAlerts: 1,
        weeklyRevenue: 180000,
      },
      todayAppointments: [
        {
          id: 'appt-1',
          patient: MOCK_PATIENT_1,
          scheduledAt: new Date().toISOString(),
          duration: 30,
          type: 'video',
          status: 'completed',
          reason: 'Regular diabetes follow-up consultation',
        },
        {
          id: 'appt-2',
          patient: MOCK_PATIENT_2,
          scheduledAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          duration: 45,
          type: 'in_person',
          status: 'approved',
          reason: 'Post-surgery cardiovascular checkup',
        },
        {
          id: 'appt-3',
          patient: MOCK_PATIENT_1,
          scheduledAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
          duration: 30,
          type: 'in_person',
          status: 'completed',
          reason: 'Hypertension medication review',
        },
      ],
      recentPatients: [MOCK_PATIENT_1, MOCK_PATIENT_2],
    }),
  },

  // ── Doctor Appointments ─────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/doctor/appointments',
    handle: () => ({
      data: [
        {
          id: 'appt-1',
          patient: MOCK_PATIENT_1,
          doctor: MOCK_DOCTOR_1,
          scheduledAt: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
          duration: 30,
          type: 'video',
          status: 'pending',
          fee: 15000,
          reason: 'Regular diabetes follow-up consultation',
          soapSummary: MOCK_SOAP_1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'appt-2',
          patient: MOCK_PATIENT_2,
          doctor: MOCK_DOCTOR_1,
          scheduledAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          duration: 45,
          type: 'in_person',
          status: 'scheduled',
          fee: 10000,
          reason: 'Post-surgery cardiovascular checkup',
          soapSummary: MOCK_SOAP_2,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'appt-3',
          patient: MOCK_PATIENT_1,
          doctor: MOCK_DOCTOR_1,
          scheduledAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          duration: 30,
          type: 'phone',
          status: 'completed',
          fee: 8000,
          reason: 'Hypertension medication review and dosage adjustment',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'appt-4',
          patient: MOCK_PATIENT_2,
          doctor: MOCK_DOCTOR_1,
          scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          duration: 30,
          type: 'chat',
          status: 'pending',
          fee: 8000,
          reason: 'Follow-up on cholesterol management plan and lab results review',
          createdAt: new Date().toISOString(),
        },
      ],
      ...PAGINATED_META,
      total: 4,
    }),
  },
  {
    method: 'patch',
    test: (p) => /^\/doctor\/appointments\/[^/]+\/status$/.test(p),
    handle: (config) => {
      const payload = parsePayload(config.data);
      const segments = (config.url ?? '').split('/');
      return { id: segments[3] ?? 'appt-1', status: payload.status };
    },
  },

  // ── Doctor Patients ─────────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/doctor/patients',
    handle: () => ({
      data: [MOCK_PATIENT_1, MOCK_PATIENT_2],
      ...PAGINATED_META,
      total: 2,
    }),
  },
  {
    method: 'get',
    test: (p) => /^\/doctor\/patients\/[^/]+\/prescriptions$/.test(p),
    handle: (config) => {
      const pId = (config.url ?? '').split('/')[3] ?? 'p-1';
      return [
        {
          id: 'pr-1',
          patientId: pId,
          doctorId: 'd-1',
          appointmentId: 'appt-1',
          diagnosis: 'Type 2 Diabetes Mellitus',
          medications: [
            {
              name: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '90 days',
              instructions: 'Take with meals',
            },
          ],
          notes: 'Monitor blood sugar levels twice daily.',
          issuedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        },
      ];
    },
  },
  {
    method: 'get',
    test: (p) => /^\/doctor\/patients\/[^/]+$/.test(p),
    handle: (config) => {
      const pId = (config.url ?? '').split('/').pop() ?? 'p-1';
      return pId === 'p-2' ? MOCK_PATIENT_2 : MOCK_PATIENT_1;
    },
  },

  // ── Doctor Prescriptions ────────────────────────────────────────────────────
  {
    method: 'post',
    test: (p) => p === '/doctor/prescriptions',
    handle: (config) => {
      const payload = parsePayload(config.data);
      return {
        id: `pr-${Date.now()}`,
        patientId: payload.patientId || 'p-1',
        doctorId: 'd-1',
        appointmentId: payload.appointmentId || 'appt-1',
        diagnosis: payload.diagnosis || 'Diagnosis',
        medications: payload.medications || [],
        notes: payload.notes || '',
        issuedAt: new Date().toISOString(),
      };
    },
  },
  {
    method: 'get',
    test: (p) => /^\/doctor\/prescriptions\/[^/]+$/.test(p),
    handle: (config) => ({
      id: (config.url ?? '').split('/').pop(),
      patientId: 'p-1',
      doctorId: 'd-1',
      appointmentId: 'appt-1',
      diagnosis: 'Hypertension',
      medications: [
        {
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in evening',
        },
      ],
      notes: 'Follow up in 4 weeks',
      issuedAt: new Date().toISOString(),
    }),
  },

  // ── Doctor Availability ─────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/doctor/availability',
    handle: () => MOCK_AVAILABILITY,
  },
  {
    method: 'put',
    test: (p) => p === '/doctor/availability',
    handle: (config) => {
      const payload = parsePayload(config.data);
      return Array.isArray(payload) ? payload : MOCK_AVAILABILITY;
    },
  },

  // ── Doctor SOAP ─────────────────────────────────────────────────────────────
  {
    method: 'post',
    test: (p) => /^\/doctor\/appointments\/[^/]+\/soap$/.test(p),
    handle: (config) => {
      const payload = parsePayload(config.data);
      return { ...payload, savedAt: new Date().toISOString() };
    },
  },

  // ── Patient Home ────────────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/home',
    handle: () => ({
      upcomingAppointments: [
        {
          id: 'appt-10',
          doctor: MOCK_DOCTOR_1,
          scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          duration: 30,
          type: 'video',
          status: 'approved',
          reason: 'Symptom check and follow-up',
          soapSummary: {
            subjective:
              'Patient checking in for routine follow-up. Reports mild allergy symptoms over the last 3 days.',
            objective: 'Height: 172 cm, Weight: 68.5 kg, BMI: 23.2 (Normal). Temperature is 36.6°C.',
            assessment: 'Allergic rhinitis vs mild seasonal upper respiratory reaction.',
            plan: '1. Review environmental allergy triggers.\n2. Advise symptom tracking.\n3. Review OTC antihistamine options.',
          },
        },
      ],
      healthSummary: {
        bloodPressure: '120/80',
        heartRate: 72,
        weight: 68.5,
        height: 172,
        bmi: 23.2,
        temperature: 36.6,
        lastUpdated: new Date().toISOString(),
      },
      recentPrescriptions: [
        {
          id: 'pr-1',
          diagnosis: 'Mild hypertension',
          issuedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          doctor: { firstName: 'Babajide', lastName: 'Alabi' },
          medications: [
            {
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              instructions: 'Take in the morning',
            },
          ],
        },
      ],
      notifications: [
        {
          id: 'n-1',
          type: 'appointment_reminder',
          title: 'Upcoming Appointment',
          body: 'You have a video consultation with Dr. Alabi tomorrow at 10:00 AM.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  },

  // ── Patient Appointments ────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/appointments',
    handle: () => ({
      data: [
        {
          id: 'appt-10',
          doctor: MOCK_DOCTOR_1,
          scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          duration: 30,
          type: 'video',
          status: 'approved',
          reason: 'Symptom check and follow-up',
          createdAt: new Date().toISOString(),
        },
      ],
      ...PAGINATED_META,
      total: 1,
    }),
  },
  {
    method: 'post',
    test: (p) => p === '/patient/appointments',
    handle: (config) => {
      const payload = parsePayload(config.data);
      return {
        id: `appt-${Date.now()}`,
        scheduledAt: payload.scheduledAt || new Date().toISOString(),
        duration: payload.duration || 30,
        type: payload.type || 'video',
        status: 'pending',
        reason: payload.reason || '',
        doctor: { ...MOCK_DOCTOR_1, id: (payload.doctorId as string) || MOCK_DOCTOR_1.id },
        createdAt: new Date().toISOString(),
      };
    },
  },
  {
    method: 'patch',
    test: (p) => /^\/patient\/appointments\/[^/]+\/cancel$/.test(p),
    handle: (config) => ({
      id: (config.url ?? '').split('/')[3] ?? 'appt-10',
      status: 'cancelled',
    }),
  },

  // ── Patient Records ─────────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/records',
    handle: () => ({
      data: [
        {
          id: 'rec-1',
          patientId: 'p-1',
          type: 'lab_result',
          title: 'Full Blood Count Report',
          description: 'Hemoglobin and white blood cell levels are in normal range.',
          date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
          doctorName: 'Dr. Babajide Alabi',
          attachmentUrl: 'https://example.com/pdf/report.pdf',
          createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        },
      ],
      ...PAGINATED_META,
      total: 1,
    }),
  },

  // ── Patient Prescriptions ───────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/prescriptions',
    handle: () => ({
      data: [
        {
          id: 'pr-1',
          diagnosis: 'Mild hypertension',
          issuedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          doctor: { firstName: 'Babajide', lastName: 'Alabi' },
          medications: [
            {
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              instructions: 'Take in the morning',
            },
          ],
        },
      ],
      ...PAGINATED_META,
      total: 1,
    }),
  },

  // ── Patient Doctors ─────────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/doctors',
    handle: () => ({
      data: [MOCK_DOCTOR_1, MOCK_DOCTOR_2],
      ...PAGINATED_META,
      total: 2,
    }),
  },
  {
    method: 'get',
    test: (p) => /^\/patient\/doctors\/[^/]+\/slots$/.test(p),
    handle: () => [
      {
        date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
        slots: ['09:00', '09:30', '10:00', '11:00', '14:00', '15:00', '15:30'],
      },
      {
        date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
        slots: ['09:30', '10:00', '10:30', '13:00', '14:00', '16:00'],
      },
    ],
  },

  // ── Patient Notifications ───────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/notifications',
    handle: () => [
      {
        id: 'n-1',
        type: 'appointment_reminder',
        title: 'Upcoming Appointment',
        body: 'You have a video consultation with Dr. Alabi tomorrow at 10:00 AM.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    method: 'patch',
    test: (p) => /^\/patient\/notifications\/[^/]+\/read$/.test(p),
    handle: () => null,
  },

  // ── Patient Symptoms ────────────────────────────────────────────────────────
  {
    method: 'post',
    test: (p) => p === '/patient/symptoms',
    handle: (config) => {
      const payload = parsePayload(config.data);
      return {
        id: `symptom-${Date.now()}`,
        ...payload,
        submittedAt: new Date().toISOString(),
      };
    },
  },
];

// ─── Blood Donors Fixtures ───────────────────────────────────────────────────

export const MOCK_BLOOD_DONORS = [
  {
    id: 'bd-1',
    name: 'Samuel Okon',
    bloodGroup: 'O-',
    genotype: 'AA',
    city: 'Lagos (Ikeja)',
    latitude: 6.6018,
    longitude: 3.3515,
    distanceKm: 1.2,
    phone: '+234 802 345 6789',
    availabilityStatus: 'Available Anytime',
    isVerified: true,
    lastDonationDate: '2025-11-10',
    donationsCount: 6,
    gender: 'Male',
  },
  {
    id: 'bd-2',
    name: 'Grace Nwosu',
    bloodGroup: 'O+',
    genotype: 'AA',
    city: 'Lagos (Victoria Island)',
    latitude: 6.4281,
    longitude: 3.4219,
    distanceKm: 3.8,
    phone: '+234 803 987 6543',
    availabilityStatus: 'Available Anytime',
    isVerified: true,
    lastDonationDate: '2025-12-01',
    donationsCount: 4,
    gender: 'Female',
  },
  {
    id: 'bd-3',
    name: 'Emmanuel Adebayo',
    bloodGroup: 'A+',
    genotype: 'AS',
    city: 'Lagos (Yaba)',
    latitude: 6.5095,
    longitude: 3.3711,
    distanceKm: 4.5,
    phone: '+234 812 444 5555',
    availabilityStatus: 'On-Call Emergency',
    isVerified: true,
    lastDonationDate: '2025-09-15',
    donationsCount: 9,
    gender: 'Male',
  },
  {
    id: 'bd-4',
    name: 'Kemi Fatimah',
    bloodGroup: 'B+',
    genotype: 'AA',
    city: 'Lagos (Surulere)',
    latitude: 6.4969,
    longitude: 3.3533,
    distanceKm: 6.1,
    phone: '+234 809 111 2233',
    availabilityStatus: 'Available Anytime',
    isVerified: true,
    lastDonationDate: '2025-10-20',
    donationsCount: 3,
    gender: 'Female',
  },
  {
    id: 'bd-5',
    name: 'David Chidi',
    bloodGroup: 'AB+',
    genotype: 'AA',
    city: 'Lagos (Lekki)',
    latitude: 6.4698,
    longitude: 3.5852,
    distanceKm: 8.4,
    phone: '+234 701 555 7788',
    availabilityStatus: 'Available Anytime',
    isVerified: false,
    lastDonationDate: '2025-08-05',
    donationsCount: 2,
    gender: 'Male',
  },
  {
    id: 'bd-6',
    name: 'Chinedu Eze',
    bloodGroup: 'O-',
    genotype: 'AA',
    city: 'Abuja (Maitama)',
    latitude: 9.0882,
    longitude: 7.4934,
    distanceKm: 2.1,
    phone: '+234 805 777 8899',
    availabilityStatus: 'Available Anytime',
    isVerified: true,
    lastDonationDate: '2025-12-14',
    donationsCount: 11,
    gender: 'Male',
  },
  {
    id: 'bd-7',
    name: 'Aisha Bello',
    bloodGroup: 'A-',
    genotype: 'AA',
    city: 'Abuja (Garki)',
    latitude: 9.0343,
    longitude: 7.4878,
    distanceKm: 4.0,
    phone: '+234 818 222 3344',
    availabilityStatus: 'On-Call Emergency',
    isVerified: true,
    lastDonationDate: '2025-11-28',
    donationsCount: 5,
    gender: 'Female',
  },
  {
    id: 'bd-8',
    name: 'Tunde Olawale',
    bloodGroup: 'B-',
    genotype: 'AS',
    city: 'Ibadan (Bodija)',
    latitude: 7.4216,
    longitude: 3.9056,
    distanceKm: 3.2,
    phone: '+234 803 333 4455',
    availabilityStatus: 'Available Anytime',
    isVerified: true,
    lastDonationDate: '2025-10-10',
    donationsCount: 7,
    gender: 'Male',
  },
  {
    id: 'bd-9',
    name: 'Ngozi Okafor',
    bloodGroup: 'AB-',
    genotype: 'AA',
    city: 'Port Harcourt (GRA)',
    latitude: 4.8156,
    longitude: 7.0498,
    distanceKm: 5.3,
    phone: '+234 806 666 9988',
    availabilityStatus: 'On-Call Emergency',
    isVerified: true,
    lastDonationDate: '2025-07-30',
    donationsCount: 8,
    gender: 'Female',
  },
];

routes.push(
  {
    method: 'get',
    test: (p) => p === '/blood-donors',
    handle: () => MOCK_BLOOD_DONORS,
  },
  {
    method: 'post',
    test: (p) => p === '/blood-donors/register',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const newDonor = {
        id: `bd-${Date.now()}`,
        name: (payload.name as string) || 'Anonymous Donor',
        bloodGroup: (payload.bloodGroup as string) || 'O+',
        genotype: (payload.genotype as string) || 'AA',
        city: (payload.city as string) || 'Lagos',
        latitude: 6.5244,
        longitude: 3.3792,
        distanceKm: 0.5,
        phone: (payload.phone as string) || '+234 800 000 0000',
        availabilityStatus: (payload.availabilityStatus as string) || 'Available Anytime',
        isVerified: true,
        lastDonationDate: new Date().toISOString().split('T')[0],
        donationsCount: 1,
        gender: (payload.gender as string) || 'Male',
      };
      MOCK_BLOOD_DONORS.unshift(newDonor);
      return newDonor;
    },
  }
);

// ─── Verified Doctor Seed Account ────────────────────────────────────────────
// Login: doctor@ominipulse.ai / any password
// Full MDCN-verified profile, approved, cardiology specialist.

const VERIFIED_DOCTOR_USER = {
  id: 'doctor-seed-001',
  email: 'doctor@ominipulse.ai',
  firstName: 'Folake',
  lastName: 'Ademola',
  role: 'doctor',
  phone: '+234 803 111 9988',
  createdAt: '2024-01-15T08:00:00.000Z',
  isApproved: true,
  verificationStatus: 'approved',
  specialization: 'Cardiology',
  licenseNumber: 'MDCN-LIC-98754-C3',
  clinicName: 'OmniPulse Heart & Wellness Clinic',
  experienceYears: 12,
  rating: 4.9,
  avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=300',
  gender: 'female',
};



export function getMockResponse(
  config: InternalAxiosRequestConfig | undefined
): AxiosResponse | null {
  if (!config) return null;

  let path = config.url ?? '';
  if (config.baseURL && path.startsWith(config.baseURL)) {
    path = path.substring(config.baseURL.length);
  }
  path = path.split('?')[0];
  const method = (config.method ?? 'get').toLowerCase();

  const route = routes.find((r) => r.method === method && r.test(path));
  if (!route) return null;

  const mockData = route.handle(config);
  return buildResponse(config, mockData);
}
