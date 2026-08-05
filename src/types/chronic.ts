export type ChronicConditionType = 'hypertension' | 'diabetes' | 'asthma' | 'pregnancy';

export interface BPReading {
  id: string;
  systolic: number; // mmHg
  diastolic: number; // mmHg
  pulse?: number; // bpm
  notes?: string;
  category: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  recordedAt: string; // ISO date
}

export interface SugarReading {
  id: string;
  glucoseLevel: number; // mg/dL
  type: 'fasting' | 'post_meal' | 'random';
  category: 'normal' | 'prediabetes' | 'high';
  notes?: string;
  recordedAt: string;
}

export interface AsthmaReading {
  id: string;
  peakFlow: number; // L/min
  inhalerPuffs: number;
  symptoms: string[];
  recordedAt: string;
}

export interface PregnancyLog {
  id: string;
  currentWeek: number;
  weightKg: number;
  fetalKicksCount?: number;
  symptoms?: string[];
  recordedAt: string;
}

export interface DoctorFollowUp {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  scheduledDate: string; // ISO date
  reason: string;
  location: string;
  isConfirmed: boolean;
}

export interface ChronicConditionSummary {
  condition: ChronicConditionType;
  title: string;
  statusText: string;
  adherencePercentage: number; // 0 - 100%
  lastReadingText: string;
  nextFollowUpDate: string;
}
