/**
 * Vitals API — live backend (https://ominipulse.onrender.com/api).
 *
 *   POST /vitals   → record a reading (server runs the rule-based sentinel
 *                    and returns any alerts; critical ones also become
 *                    notifications)
 *   GET  /vitals   → readings (patientId / type filters)
 *
 * Maps chronic-disease screen types (BPReading, SugarReading, …) onto the
 * vitals_readings contract.
 */

import apiClient from './client';
import { BPReading, SugarReading, AsthmaReading, ChronicConditionType } from '../types';

export interface VitalsReadingRow {
  id: string;
  patient_id: string;
  condition: string | null;
  reading_type: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  value: number | null;
  category: string | null;
  notes: string | null;
  recorded_at: string;
}

export interface SentinelAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  rule?: string;
}

export interface RecordVitalsPayload {
  patientId: string;
  condition?: ChronicConditionType | null;
  readingType:
    | 'blood_pressure'
    | 'blood_glucose'
    | 'peak_flow'
    | 'pregnancy_log'
    | 'heart_rate'
    | 'spo2'
    | 'weight';
  systolic?: number | null;
  diastolic?: number | null;
  pulse?: number | null;
  value?: number | null;
  category?: string;
  notes?: string;
  recordedAt?: string;
}

function bpCategory(systolic: number, diastolic: number): BPReading['category'] {
  if (systolic >= 180 || diastolic >= 120) return 'crisis';
  if (systolic >= 140 || diastolic >= 90) return 'stage2';
  if (systolic >= 130 || diastolic >= 80) return 'stage1';
  if (systolic >= 120) return 'elevated';
  return 'normal';
}

function glucoseCategory(level: number): SugarReading['category'] {
  if (level >= 200) return 'high';
  if (level >= 140) return 'prediabetes';
  return 'normal';
}

export const vitalsApi = {
  /** Record a blood-pressure reading for the hypertension tracker. */
  async logBloodPressure(
    patientId: string,
    reading: Omit<BPReading, 'id' | 'category' | 'recordedAt'> & { recordedAt?: string }
  ): Promise<{ reading: BPReading; sentinelAlerts: SentinelAlert[] }> {
    const { data } = await apiClient.post<{ reading: VitalsReadingRow; sentinelAlerts: SentinelAlert[] }>(
      '/vitals',
      {
        patientId,
        condition: 'hypertension',
        readingType: 'blood_pressure',
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        pulse: reading.pulse ?? null,
        category: bpCategory(reading.systolic, reading.diastolic),
        notes: reading.notes,
        recordedAt: reading.recordedAt,
      } satisfies RecordVitalsPayload
    );
    return {
      reading: {
        id: data.reading.id,
        systolic: data.reading.systolic ?? reading.systolic,
        diastolic: data.reading.diastolic ?? reading.diastolic,
        pulse: data.reading.pulse ?? reading.pulse,
        notes: data.reading.notes ?? reading.notes,
        category: (data.reading.category as BPReading['category']) ?? 'normal',
        recordedAt: data.reading.recorded_at,
      },
      sentinelAlerts: data.sentinelAlerts ?? [],
    };
  },

  /** Record a glucose reading for the diabetes tracker. */
  async logBloodSugar(
    patientId: string,
    reading: { glucoseLevel: number; type: SugarReading['type']; notes?: string; recordedAt?: string }
  ): Promise<{ reading: SugarReading; sentinelAlerts: SentinelAlert[] }> {
    const { data } = await apiClient.post<{ reading: VitalsReadingRow; sentinelAlerts: SentinelAlert[] }>(
      '/vitals',
      {
        patientId,
        condition: 'diabetes',
        readingType: 'blood_glucose',
        value: reading.glucoseLevel,
        category: `${reading.type}/${glucoseCategory(reading.glucoseLevel)}`,
        notes: reading.notes,
        recordedAt: reading.recordedAt,
      } satisfies RecordVitalsPayload
    );
    return {
      reading: {
        id: data.reading.id,
        glucoseLevel: data.reading.value ?? reading.glucoseLevel,
        type: reading.type,
        category: (data.reading.category?.split('/')[1] as SugarReading['category']) ?? 'normal',
        notes: data.reading.notes ?? reading.notes,
        recordedAt: data.reading.recorded_at,
      },
      sentinelAlerts: data.sentinelAlerts ?? [],
    };
  },

  /** Record a peak-flow reading for the asthma tracker. */
  async logPeakFlow(
    patientId: string,
    reading: Omit<AsthmaReading, 'id' | 'recordedAt'> & { recordedAt?: string }
  ): Promise<{ reading: AsthmaReading; sentinelAlerts: SentinelAlert[] }> {
    const { data } = await apiClient.post<{ reading: VitalsReadingRow; sentinelAlerts: SentinelAlert[] }>(
      '/vitals',
      {
        patientId,
        condition: 'asthma',
        readingType: 'peak_flow',
        value: reading.peakFlow,
        notes: reading.inhalerPuffs
          ? `Inhaler puffs: ${reading.inhalerPuffs}${reading.symptoms?.length ? `; symptoms: ${reading.symptoms.join(', ')}` : ''}`
          : reading.symptoms?.join(', '),
        recordedAt: reading.recordedAt,
      } satisfies RecordVitalsPayload
    );
    return {
      reading: {
        id: data.reading.id,
        peakFlow: data.reading.value ?? reading.peakFlow,
        inhalerPuffs: reading.inhalerPuffs,
        symptoms: reading.symptoms ?? [],
        recordedAt: data.reading.recorded_at,
      },
      sentinelAlerts: data.sentinelAlerts ?? [],
    };
  },

  /** Fetch historical BP readings for the hypertension tracker. */
  async getBloodPressureHistory(patientId: string): Promise<BPReading[]> {
    const { data } = await apiClient.get<{ readings: VitalsReadingRow[] }>('/vitals', {
      params: { patientId, type: 'blood_pressure' },
    });
    return (data.readings ?? [])
      .filter((r) => r.systolic != null && r.diastolic != null)
      .map((r) => ({
        id: r.id,
        systolic: r.systolic!,
        diastolic: r.diastolic!,
        pulse: r.pulse ?? undefined,
        notes: r.notes ?? undefined,
        category: (r.category as BPReading['category']) ?? 'normal',
        recordedAt: r.recorded_at,
      }));
  },

  /** Fetch historical glucose readings for the diabetes tracker. */
  async getBloodSugarHistory(patientId: string): Promise<SugarReading[]> {
    const { data } = await apiClient.get<{ readings: VitalsReadingRow[] }>('/vitals', {
      params: { patientId, type: 'blood_glucose' },
    });
    return (data.readings ?? [])
      .filter((r) => r.value != null)
      .map((r) => ({
        id: r.id,
        glucoseLevel: r.value!,
        type: (r.category?.split('/')[0] as SugarReading['type']) || 'random',
        category: (r.category?.split('/')[1] as SugarReading['category']) ?? 'normal',
        notes: r.notes ?? undefined,
        recordedAt: r.recorded_at,
      }));
  },
};
