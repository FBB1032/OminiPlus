import { Appointment, Doctor, Prescription } from './doctor';

export interface PatientHome {
  upcomingAppointments: Appointment[];
  healthSummary: HealthSummary;
  recentPrescriptions: Prescription[];
  notifications: PatientNotification[];
}

export interface HealthSummary {
  bloodPressure?: string;
  heartRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  temperature?: number;
  lastUpdated?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'lab_result' | 'imaging' | 'diagnosis' | 'surgery' | 'vaccination' | 'allergy' | 'other';
  title: string;
  description: string;
  date: string;
  doctorName?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface BookAppointmentPayload {
  doctorId: string;
  scheduledAt: string;
  duration: number;
  type: 'in_person' | 'video' | 'phone';
  reason: string;
}

export type BookingStep = 'select_doctor' | 'select_time' | 'enter_reason' | 'confirm';

export interface BookingState {
  step: BookingStep;
  selectedDoctor: Doctor | null;
  selectedSlot: string | null;
  appointmentType: 'in_person' | 'video' | 'phone';
  reason: string;
}

export interface PatientNotification {
  id: string;
  type: 'appointment_reminder' | 'prescription_ready' | 'result_ready' | 'general';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AvailableSlot {
  date: string;
  slots: string[]; // HH:mm strings
}
