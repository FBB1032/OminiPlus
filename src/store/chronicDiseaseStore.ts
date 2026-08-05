import { create } from 'zustand';
import { BPReading, SugarReading, AsthmaReading, PregnancyLog, DoctorFollowUp, ChronicConditionSummary } from '../types/chronic';
import { storageService } from '../services/storageService';

const STORAGE_KEYS = {
  BP_READINGS: 'ominipulse_bp_readings',
  SUGAR_READINGS: 'ominipulse_sugar_readings',
  ASTHMA_READINGS: 'ominipulse_asthma_readings',
  PREGNANCY_LOGS: 'ominipulse_pregnancy_logs',
  FOLLOW_UPS: 'ominipulse_follow_ups',
};

interface ChronicDiseaseStore {
  bpReadings: BPReading[];
  sugarReadings: SugarReading[];
  asthmaReadings: AsthmaReading[];
  pregnancyLogs: PregnancyLog[];
  followUps: DoctorFollowUp[];
  isLoading: boolean;

  // Actions
  loadChronicData: () => Promise<void>;
  addBPReading: (systolic: number, diastolic: number, pulse?: number, notes?: string) => Promise<BPReading>;
  addSugarReading: (glucoseLevel: number, type: 'fasting' | 'post_meal' | 'random', notes?: string) => Promise<SugarReading>;
  addAsthmaReading: (peakFlow: number, inhalerPuffs: number, symptoms: string[]) => Promise<AsthmaReading>;
  addPregnancyLog: (currentWeek: number, weightKg: number, fetalKicksCount?: number) => Promise<PregnancyLog>;
  getAdherenceRate: () => number;
  getSummaries: () => ChronicConditionSummary[];
}

const DEFAULT_BP_READINGS: BPReading[] = [
  {
    id: 'bp-1',
    systolic: 118,
    diastolic: 78,
    pulse: 72,
    category: 'normal',
    notes: 'Morning reading before coffee',
    recordedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'bp-2',
    systolic: 124,
    diastolic: 82,
    pulse: 76,
    category: 'elevated',
    notes: 'Post lunch walk',
    recordedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'bp-3',
    systolic: 132,
    diastolic: 86,
    pulse: 80,
    category: 'stage1',
    notes: 'Evening after work',
    recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bp-4',
    systolic: 120,
    diastolic: 80,
    pulse: 70,
    category: 'normal',
    notes: 'Resting state',
    recordedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const DEFAULT_SUGAR_READINGS: SugarReading[] = [
  {
    id: 'sug-1',
    glucoseLevel: 98,
    type: 'fasting',
    category: 'normal',
    notes: 'Fasting 8 hours',
    recordedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'sug-2',
    glucoseLevel: 135,
    type: 'post_meal',
    category: 'normal',
    notes: '2 hrs after dinner',
    recordedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'sug-3',
    glucoseLevel: 148,
    type: 'post_meal',
    category: 'prediabetes',
    notes: 'After heavy meal',
    recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sug-4',
    glucoseLevel: 102,
    type: 'fasting',
    category: 'normal',
    notes: 'Morning fasting',
    recordedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const DEFAULT_ASTHMA_READINGS: AsthmaReading[] = [
  {
    id: 'ast-1',
    peakFlow: 450,
    inhalerPuffs: 2,
    symptoms: ['Mild wheezing during morning exercise'],
    recordedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'ast-2',
    peakFlow: 480,
    inhalerPuffs: 1,
    symptoms: ['Normal breathing'],
    recordedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const DEFAULT_PREGNANCY_LOGS: PregnancyLog[] = [
  {
    id: 'preg-1',
    currentWeek: 24,
    weightKg: 68.5,
    fetalKicksCount: 12,
    symptoms: ['Mild backache', 'Normal appetite'],
    recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const DEFAULT_FOLLOW_UPS: DoctorFollowUp[] = [
  {
    id: 'fol-1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Musa Ahmed',
    doctorSpecialization: 'Cardiologist',
    scheduledDate: new Date(Date.now() + 86400000 * 4).toISOString(), // In 4 days
    reason: 'Hypertension Quarterly BP Review & EKG',
    location: 'City General Hospital - Suite 402',
    isConfirmed: true,
  },
  {
    id: 'fol-2',
    doctorId: 'doc-2',
    doctorName: 'Dr. Fatima Umar',
    doctorSpecialization: 'Endocrinologist',
    scheduledDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    reason: 'Diabetes HbA1c Lab Evaluation',
    location: 'Apex Medical Center - Clinic B',
    isConfirmed: true,
  },
];

export const useChronicDiseaseStore = create<ChronicDiseaseStore>((set, get) => ({
  bpReadings: DEFAULT_BP_READINGS,
  sugarReadings: DEFAULT_SUGAR_READINGS,
  asthmaReadings: DEFAULT_ASTHMA_READINGS,
  pregnancyLogs: DEFAULT_PREGNANCY_LOGS,
  followUps: DEFAULT_FOLLOW_UPS,
  isLoading: false,

  loadChronicData: async () => {
    set({ isLoading: true });
    try {
      const [storedBP, storedSugar, storedAsthma, storedPreg, storedFol] = await Promise.all([
        storageService.getObject<BPReading[]>(STORAGE_KEYS.BP_READINGS),
        storageService.getObject<SugarReading[]>(STORAGE_KEYS.SUGAR_READINGS),
        storageService.getObject<AsthmaReading[]>(STORAGE_KEYS.ASTHMA_READINGS),
        storageService.getObject<PregnancyLog[]>(STORAGE_KEYS.PREGNANCY_LOGS),
        storageService.getObject<DoctorFollowUp[]>(STORAGE_KEYS.FOLLOW_UPS),
      ]);

      set({
        bpReadings: storedBP || DEFAULT_BP_READINGS,
        sugarReadings: storedSugar || DEFAULT_SUGAR_READINGS,
        asthmaReadings: storedAsthma || DEFAULT_ASTHMA_READINGS,
        pregnancyLogs: storedPreg || DEFAULT_PREGNANCY_LOGS,
        followUps: storedFol || DEFAULT_FOLLOW_UPS,
      });
    } catch {
      set({
        bpReadings: DEFAULT_BP_READINGS,
        sugarReadings: DEFAULT_SUGAR_READINGS,
        asthmaReadings: DEFAULT_ASTHMA_READINGS,
        pregnancyLogs: DEFAULT_PREGNANCY_LOGS,
        followUps: DEFAULT_FOLLOW_UPS,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addBPReading: async (systolic, diastolic, pulse, notes) => {
    let category: BPReading['category'] = 'normal';
    if (systolic >= 180 || diastolic >= 120) category = 'crisis';
    else if (systolic >= 140 || diastolic >= 90) category = 'stage2';
    else if (systolic >= 130 || diastolic >= 80) category = 'stage1';
    else if (systolic >= 120 && diastolic < 80) category = 'elevated';

    const newReading: BPReading = {
      id: `bp-${Date.now()}`,
      systolic,
      diastolic,
      pulse,
      category,
      notes,
      recordedAt: new Date().toISOString(),
    };

    const updated = [newReading, ...get().bpReadings];
    set({ bpReadings: updated });
    await storageService.setObject(STORAGE_KEYS.BP_READINGS, updated);
    return newReading;
  },

  addSugarReading: async (glucoseLevel, type, notes) => {
    let category: SugarReading['category'] = 'normal';
    if (type === 'fasting') {
      if (glucoseLevel >= 126) category = 'high';
      else if (glucoseLevel >= 100) category = 'prediabetes';
    } else {
      if (glucoseLevel >= 200) category = 'high';
      else if (glucoseLevel >= 140) category = 'prediabetes';
    }

    const newReading: SugarReading = {
      id: `sug-${Date.now()}`,
      glucoseLevel,
      type,
      category,
      notes,
      recordedAt: new Date().toISOString(),
    };

    const updated = [newReading, ...get().sugarReadings];
    set({ sugarReadings: updated });
    await storageService.setObject(STORAGE_KEYS.SUGAR_READINGS, updated);
    return newReading;
  },

  addAsthmaReading: async (peakFlow, inhalerPuffs, symptoms) => {
    const newReading: AsthmaReading = {
      id: `ast-${Date.now()}`,
      peakFlow,
      inhalerPuffs,
      symptoms,
      recordedAt: new Date().toISOString(),
    };

    const updated = [newReading, ...get().asthmaReadings];
    set({ asthmaReadings: updated });
    await storageService.setObject(STORAGE_KEYS.ASTHMA_READINGS, updated);
    return newReading;
  },

  addPregnancyLog: async (currentWeek, weightKg, fetalKicksCount) => {
    const newLog: PregnancyLog = {
      id: `preg-${Date.now()}`,
      currentWeek,
      weightKg,
      fetalKicksCount,
      recordedAt: new Date().toISOString(),
    };

    const updated = [newLog, ...get().pregnancyLogs];
    set({ pregnancyLogs: updated });
    await storageService.setObject(STORAGE_KEYS.PREGNANCY_LOGS, updated);
    return newLog;
  },

  getAdherenceRate: () => {
    return 94; // 94% weekly adherence rate
  },

  getSummaries: () => {
    const { bpReadings, sugarReadings, asthmaReadings, pregnancyLogs, followUps } = get();

    const latestBP = bpReadings[0];
    const latestSugar = sugarReadings[0];
    const latestAsthma = asthmaReadings[0];
    const latestPreg = pregnancyLogs[0];
    const nextFollowUp = followUps[0];

    return [
      {
        condition: 'hypertension',
        title: 'Hypertension (BP)',
        statusText: latestBP ? `${latestBP.systolic}/${latestBP.diastolic} mmHg` : 'No reading',
        adherencePercentage: 96,
        lastReadingText: latestBP ? `${latestBP.category.toUpperCase()} • Today` : 'N/A',
        nextFollowUpDate: nextFollowUp ? new Date(nextFollowUp.scheduledDate).toLocaleDateString() : 'None scheduled',
      },
      {
        condition: 'diabetes',
        title: 'Diabetes (Blood Sugar)',
        statusText: latestSugar ? `${latestSugar.glucoseLevel} mg/dL` : 'No reading',
        adherencePercentage: 92,
        lastReadingText: latestSugar ? `${latestSugar.type.replace('_', ' ')} • Yesterday` : 'N/A',
        nextFollowUpDate: followUps[1] ? new Date(followUps[1].scheduledDate).toLocaleDateString() : 'None scheduled',
      },
      {
        condition: 'asthma',
        title: 'Asthma (Peak Flow)',
        statusText: latestAsthma ? `${latestAsthma.peakFlow} L/min` : 'No reading',
        adherencePercentage: 90,
        lastReadingText: latestAsthma ? `${latestAsthma.inhalerPuffs} puffs recorded` : 'N/A',
        nextFollowUpDate: 'In 3 weeks',
      },
      {
        condition: 'pregnancy',
        title: 'Pregnancy Tracker',
        statusText: latestPreg ? `Week ${latestPreg.currentWeek} • ${latestPreg.weightKg} kg` : 'Week 24',
        adherencePercentage: 98,
        lastReadingText: latestPreg ? `${latestPreg.fetalKicksCount || 10} kicks logged` : 'N/A',
        nextFollowUpDate: 'In 2 weeks',
      },
    ];
  },
}));
