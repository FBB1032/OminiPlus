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

// ─── Stateful In-Memory Collections (Cross-Role & Cross-Screen) ─────────────
export const ACTIVE_APPOINTMENTS: any[] = [
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
  {
    id: 'appt-10',
    patient: MOCK_PATIENT_1,
    doctor: MOCK_DOCTOR_1,
    scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    duration: 30,
    type: 'video',
    status: 'approved',
    reason: 'Symptom check and follow-up',
    createdAt: new Date().toISOString(),
  },
];

export const ACTIVE_PRESCRIPTIONS: any[] = [
  {
    id: 'pr-1',
    patientId: 'p-1',
    doctorId: 'd-1',
    appointmentId: 'appt-1',
    diagnosis: 'Type 2 Diabetes Mellitus & Mild Hypertension',
    doctor: { firstName: 'Babajide', lastName: 'Alabi' },
    medications: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '90 days',
        instructions: 'Take with meals',
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning',
      },
    ],
    notes: 'Monitor blood glucose and blood pressure twice weekly.',
    issuedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

// ─── Response Builder ─────────────────────────────────────────────────────────

function buildResponse(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  // Mirrors the live Express contract: the resource object/array is the body
  // itself ({ appointments: [...] }, { patient: {...} }), not wrapped in an
  // extra { data: ... } envelope.
  return {
    data,
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

      // ── Seed: verified patient account (Chioma Egwu) ────────────────────────
      if (email === 'patient@ominipulse.ai') {
        return {
          user: {
            ...MOCK_PATIENT_1,
            email: 'patient@ominipulse.ai',
            role: 'patient',
          },
          tokens: {
            accessToken: 'mock-access-token-patient-verified',
            refreshToken: 'mock-refresh-token-patient-verified',
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
    handle: (config) => {
      const status = config?.params?.status;
      const data = status ? ACTIVE_APPOINTMENTS.filter((a) => a.status === status) : ACTIVE_APPOINTMENTS;
      return {
        data,
        ...PAGINATED_META,
        total: data.length,
      };
    },
  },
  {
    method: 'patch',
    test: (p) => /^\/doctor\/appointments\/[^/]+\/status$/.test(p),
    handle: (config) => {
      const payload = parsePayload(config.data);
      const segments = (config.url ?? '').split('/');
      const apptId = segments[3] ?? 'appt-1';
      const found = ACTIVE_APPOINTMENTS.find((a) => a.id === apptId);
      if (found && payload.status) {
        found.status = payload.status;
      }
      return { id: apptId, status: payload.status };
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
      return ACTIVE_PRESCRIPTIONS.filter((p) => p.patientId === pId || !p.patientId);
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
      const newPrescription = {
        id: `pr-${Date.now()}`,
        patientId: payload.patientId || 'p-1',
        doctorId: 'd-1',
        doctor: { firstName: 'Babajide', lastName: 'Alabi' },
        appointmentId: payload.appointmentId || 'appt-1',
        diagnosis: payload.diagnosis || 'Clinical Assessment',
        medications: payload.medications || [],
        instructions: payload.instructions || '',
        notes: payload.notes || payload.instructions || '',
        issuedAt: new Date().toISOString(),
      };
      ACTIVE_PRESCRIPTIONS.unshift(newPrescription);
      return newPrescription;
    },
  },
  {
    method: 'get',
    test: (p) => /^\/doctor\/prescriptions\/[^/]+$/.test(p),
    handle: (config) => {
      const prId = (config.url ?? '').split('/').pop();
      return ACTIVE_PRESCRIPTIONS.find((p) => p.id === prId) || ACTIVE_PRESCRIPTIONS[0];
    },
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
      const segments = (config.url ?? '').split('/');
      const apptId = segments[3];
      const found = ACTIVE_APPOINTMENTS.find((a) => a.id === apptId);
      if (found) {
        found.soapSummary = {
          subjective: payload.subjective,
          objective: payload.objective,
          assessment: payload.assessment,
          plan: payload.plan,
        };
      }
      return { ...payload, savedAt: new Date().toISOString() };
    },
  },

  // ── Patient Home ────────────────────────────────────────────────────────────
  {
    method: 'get',
    test: (p) => p === '/patient/home',
    handle: () => ({
      upcomingAppointments: ACTIVE_APPOINTMENTS.filter(
        (a) => a.status !== 'cancelled' && a.status !== 'rejected'
      ).slice(0, 3),
      healthSummary: {
        bloodPressure: '120/80',
        heartRate: 72,
        weight: 68.5,
        height: 172,
        bmi: 23.2,
        temperature: 36.6,
        lastUpdated: new Date().toISOString(),
      },
      recentPrescriptions: ACTIVE_PRESCRIPTIONS.slice(0, 3),
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
    handle: (config) => {
      const status = config?.params?.status;
      const data = status ? ACTIVE_APPOINTMENTS.filter((a) => a.status === status) : ACTIVE_APPOINTMENTS;
      return {
        data,
        ...PAGINATED_META,
        total: data.length,
      };
    },
  },
  {
    method: 'post',
    test: (p) => p === '/patient/appointments',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const chosenDoctor = payload.doctorId === 'd-2' ? MOCK_DOCTOR_2 : MOCK_DOCTOR_1;
      const newAppt = {
        id: `appt-${Date.now()}`,
        patient: MOCK_PATIENT_1,
        doctor: { ...chosenDoctor, id: (payload.doctorId as string) || chosenDoctor.id },
        scheduledAt: payload.scheduledAt || new Date().toISOString(),
        duration: payload.duration || 30,
        type: payload.type || 'video',
        status: 'pending',
        fee: payload.fee || (chosenDoctor.consultationFee ? chosenDoctor.consultationFee * 100 : 15000),
        reason: payload.reason || 'General medical follow-up',
        createdAt: new Date().toISOString(),
      };
      ACTIVE_APPOINTMENTS.unshift(newAppt);
      return newAppt;
    },
  },
  {
    method: 'patch',
    test: (p) => /^\/patient\/appointments\/[^/]+\/cancel$/.test(p),
    handle: (config) => {
      const id = (config.url ?? '').split('/')[3] ?? 'appt-10';
      const found = ACTIVE_APPOINTMENTS.find((a) => a.id === id);
      if (found) {
        found.status = 'cancelled';
      }
      return {
        id,
        status: 'cancelled',
      };
    },
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
      data: ACTIVE_PRESCRIPTIONS,
      ...PAGINATED_META,
      total: ACTIVE_PRESCRIPTIONS.length,
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

// ─── Live-Backend Contract Mocks (https://ominipulse.onrender.com/api) ────────
// These mirror the deployed Express shapes ({ appointments: [...] } etc.) so the
// offline fallback in src/api/client.ts keeps working with the live adapters.

const LIVE_APPOINTMENT_ROWS: any[] = ACTIVE_APPOINTMENTS.map((a, i) => ({
  id: a.id,
  doctor_id: a.doctor.id,
  patient_id: a.patient.id,
  scheduled_at: a.scheduledAt,
  duration: a.duration,
  status: a.status,
  type: a.type,
  reason: a.reason,
  payment_status: 'held',
  cancellation_reason: null,
  created_at: a.createdAt,
  doctor: {
    id: a.doctor.id,
    specialization: a.doctor.specialization,
    consultation_fee: a.doctor.consultationFee,
    profile: { first_name: a.doctor.firstName, last_name: a.doctor.lastName },
  },
  patient: {
    id: a.patient.id,
    profile: {
      first_name: a.patient.firstName,
      last_name: a.patient.lastName,
      date_of_birth: a.patient.dateOfBirth,
      gender: a.patient.gender,
    },
  },
  _mockIndex: i,
}));

const LIVE_DOCTOR_ROWS = [MOCK_DOCTOR_1, MOCK_DOCTOR_2].map((d) => ({
  id: d.id,
  profile_id: `u-${d.id}`,
  specialization: d.specialization,
  bio: null,
  experience_years: d.experienceYears,
  clinic_name: d.clinicName,
  clinic_address: null,
  consultation_fee: d.consultationFee,
  rating: d.rating,
  review_count: 124,
  is_available: d.isAvailable,
  availability_status: 'available',
  is_mdcn_verified: true,
  profile: {
    id: `u-${d.id}`,
    first_name: d.firstName,
    last_name: d.lastName,
    avatar_url: d.avatarUrl,
  },
  hospital: null,
}));

const LIVE_RECORD_ROWS = [
  {
    id: 'rec-1',
    patient_id: 'p-1',
    type: 'lab_result',
    title: 'Fasting Blood Glucose Panel',
    description: '145 mg/dL — above target range. Repeat in 3 months.',
    date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    doctor_name: 'Dr. Babajide Alabi',
    attachment_url: null,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rec-2',
    patient_id: 'p-1',
    type: 'diagnosis',
    title: 'Type 2 Diabetes Mellitus',
    description: 'Diagnosed; metformin started, lifestyle modification advised.',
    date: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    doctor_name: 'Dr. Babajide Alabi',
    attachment_url: null,
    created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rec-3',
    patient_id: 'p-1',
    type: 'vaccination',
    title: 'Influenza Vaccine',
    description: 'Annual flu shot administered.',
    date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    doctor_name: 'Dr. Chioma Nwachukwu',
    attachment_url: null,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
];

const LIVE_VITALS_READINGS: any[] = [];

const LIVE_NOTIFICATION_ROWS = [
  {
    id: 'notif-1',
    type: 'appointment_reminder',
    title: 'Upcoming appointment',
    body: 'You have a video consultation with Dr. Babajide Alabi tomorrow.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    type: 'general',
    title: 'Vitals check reminder',
    body: 'Remember to log your blood pressure reading today.',
    is_read: false,
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

routes.push(
  // GET /appointments
  {
    method: 'get',
    test: (p) => p === '/appointments',
    handle: (config) => {
      const status = config?.params?.status;
      const upcoming = config?.params?.upcoming === 'true';
      let rows = LIVE_APPOINTMENT_ROWS;
      if (status) rows = rows.filter((r) => r.status === status);
      if (upcoming) {
        const now = new Date().toISOString();
        rows = rows.filter((r) => r.scheduled_at >= now);
      }
      return { appointments: rows };
    },
  },
  // POST /appointments
  {
    method: 'post',
    test: (p) => p === '/appointments',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const row = {
        id: `appt-${Date.now()}`,
        doctor_id: payload.doctorId,
        patient_id: payload.patientId,
        scheduled_at: payload.scheduledAt,
        duration: 30,
        status: 'pending',
        type: payload.type ?? 'video',
        reason: payload.reason,
        payment_status: 'held',
        cancellation_reason: null,
        created_at: new Date().toISOString(),
        doctor: LIVE_DOCTOR_ROWS.find((d) => d.id === payload.doctorId) ?? LIVE_DOCTOR_ROWS[0],
        patient: {
          id: payload.patientId,
          profile: { first_name: MOCK_PATIENT_1.firstName, last_name: MOCK_PATIENT_1.lastName },
        },
      };
      LIVE_APPOINTMENT_ROWS.push(row);
      return { appointment: row };
    },
  },
  // PATCH /appointments/:id
  {
    method: 'patch',
    test: (p) => /^\/appointments\/[^/]+$/.test(p),
    handle: (config) => {
      const id = (config.url ?? '').split('/').pop();
      const payload = parsePayload(config.data);
      const row = LIVE_APPOINTMENT_ROWS.find((r) => r.id === id);
      if (row) {
        row.status = payload.status ?? row.status;
        if (payload.cancellationReason) row.cancellation_reason = payload.cancellationReason;
      }
      return { appointment: row ?? LIVE_APPOINTMENT_ROWS[0] };
    },
  },
  // GET /appointments/slots/:doctorId/:date
  {
    method: 'get',
    test: (p) => /^\/appointments\/slots\/[^/]+\/[^/]+$/.test(p),
    handle: () => ({
      slots: ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30', '15:00'],
    }),
  },
  // GET /doctors
  {
    method: 'get',
    test: (p) => p === '/doctors',
    handle: (config) => {
      const specialization = config?.params?.specialization;
      let rows = LIVE_DOCTOR_ROWS;
      if (specialization) rows = rows.filter((d) => d.specialization === specialization);
      return { doctors: rows };
    },
  },
  // GET /patients/me
  {
    method: 'get',
    test: (p) => p === '/patients/me',
    handle: () => ({
      patient: {
        id: 'p-1',
        profile_id: 'doctor-seed-001',
        date_of_birth: MOCK_PATIENT_1.dateOfBirth,
        gender: MOCK_PATIENT_1.gender,
        height_cm: MOCK_PATIENT_1.height,
        weight_kg: MOCK_PATIENT_1.weight,
        blood_type: MOCK_PATIENT_1.bloodType,
        blood_group: MOCK_PATIENT_1.bloodGroup,
        genotype: MOCK_PATIENT_1.genotype,
        created_at: '2024-01-15T08:00:00.000Z',
      },
    }),
  },
  // GET /patients/:id
  {
    method: 'get',
    test: (p) => /^\/patients\/[^/]+$/.test(p),
    handle: (config) => {
      const id = (config.url ?? '').split('/').pop();
      const base = id === 'p-2' ? MOCK_PATIENT_2 : MOCK_PATIENT_1;
      return {
        patient: {
          id: base.id,
          profile_id: `u-${base.id}`,
          date_of_birth: base.dateOfBirth,
          gender: base.gender,
          height_cm: base.height,
          weight_kg: base.weight,
          blood_type: base.bloodType,
          blood_group: base.bloodGroup,
          genotype: base.genotype,
          profile: { first_name: base.firstName, last_name: base.lastName, email: base.email, phone: base.phone },
          created_at: '2024-01-15T08:00:00.000Z',
        },
      };
    },
  },
  // GET /patients/:id/records
  {
    method: 'get',
    test: (p) => /^\/patients\/[^/]+\/records$/.test(p),
    handle: () => ({ records: LIVE_RECORD_ROWS }),
  },
  // GET/POST /vitals
  {
    method: 'post',
    test: (p) => p === '/vitals',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const row = {
        id: `v-${Date.now()}`,
        patient_id: payload.patientId,
        condition: payload.condition ?? null,
        reading_type: payload.readingType,
        systolic: payload.systolic ?? null,
        diastolic: payload.diastolic ?? null,
        pulse: payload.pulse ?? null,
        value: payload.value ?? null,
        category: payload.category ?? null,
        notes: payload.notes ?? null,
        recorded_at: payload.recordedAt ?? new Date().toISOString(),
      };
      LIVE_VITALS_READINGS.unshift(row);
      return {
        reading: row,
        sentinelAlerts:
          Number(payload.systolic) >= 180 || Number(payload.diastolic) >= 120
            ? [{ severity: 'critical', message: 'Blood pressure is in the crisis range. Seek urgent care.' }]
            : [],
      };
    },
  },
  {
    method: 'get',
    test: (p) => p === '/vitals',
    handle: (config) => {
      const patientId = config?.params?.patientId;
      const type = config?.params?.type;
      let rows = LIVE_VITALS_READINGS;
      if (patientId) rows = rows.filter((r) => r.patient_id === patientId);
      if (type) rows = rows.filter((r) => r.reading_type === type);
      return { readings: rows };
    },
  },
  // POST /ai/chat
  {
    method: 'post',
    test: (p) => p === '/ai/chat',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const messages = (payload.messages as Array<{ role: string; content: string }>) ?? [];
      const last = messages[messages.length - 1];
      return {
        conversationId: (payload.conversationId as string) ?? `conv-${Date.now()}`,
        reply: `This is a mock AI reply (offline). You said: "${last?.content?.slice(0, 120)}". Please try again when back online for a real response.`,
        provider: 'mock',
        model: 'offline-fallback',
        urgency: 'routine',
      };
    },
  },
  // POST /ai/triage
  {
    method: 'post',
    test: (p) => p === '/ai/triage',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const reply = `Mock triage (offline): review of "${String(payload.symptoms).slice(0, 80)}" suggests a routine consultation.`;
      return {
        reply,
        triage: reply,
        urgency: 'see-doctor-within-48h',
        advice: ['Monitor your symptoms', 'Stay hydrated', 'See a doctor if symptoms worsen'],
        provider: 'mock',
        model: 'offline-fallback',
      };
    },
  },
  // POST /ai/soap
  {
    method: 'post',
    test: (p) => p === '/ai/soap',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const soap = `Subjective: ${String(payload.transcript).slice(0, 400)}\nObjective: mock offline data.\nAssessment: pending live review.\nPlan: mock plan.`;
      return {
        soap,
        reply: soap,
        provider: 'mock',
        model: 'offline-fallback',
      };
    },
  },
  // POST /ai/cds
  {
    method: 'post',
    test: (p) => p === '/ai/cds',
    handle: () => ({
      reply:
        'Differential (mock, offline): 1) Unspecified viral illness — most likely; 2) Bacterial infection — consider basic panel; Safety netting: return if symptoms worsen.',
      provider: 'mock',
      model: 'offline-fallback',
    }),
  },
  // GET /auth/me — session shape with notifications
  {
    method: 'get',
    test: (p) => p === '/auth/me',
    handle: () => ({
      profile: { id: 'doctor-seed-001', role: 'patient', email: 'patient@ominipulse.ai' },
      notifications: LIVE_NOTIFICATION_ROWS,
    }),
  },
  // PUT /doctors/me/working-hours
  {
    method: 'put',
    test: (p) => p === '/doctors/me/working-hours',
    handle: (config) => {
      const payload = parsePayload(config.data);
      const entries = (payload.entries as any[]) ?? [];
      return {
        workingHours: entries.map((e) => ({
          id: `wh-${e.day}`,
          doctor_id: 'd-1',
          day: e.day,
          start_time: e.startTime,
          end_time: e.endTime,
          is_active: e.isActive ?? true,
          slot_duration: e.slotDuration ?? 30,
        })),
      };
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
