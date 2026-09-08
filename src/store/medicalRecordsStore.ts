import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { MedicalRecord } from '../types';

interface MedicalRecordsStore {
  customRecords: MedicalRecord[];
  isLoading: boolean;
  loadCustomRecords: () => Promise<void>;
  addRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => Promise<MedicalRecord>;
  deleteRecord: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'ominipulse_custom_records';

export const useMedicalRecordsStore = create<MedicalRecordsStore>((set, get) => ({
  customRecords: [],
  isLoading: false,

  loadCustomRecords: async () => {
    set({ isLoading: true });
    try {
      const stored = await storageService.getItem<MedicalRecord[]>(STORAGE_KEY);
      set({ customRecords: stored || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addRecord: async (recordData) => {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...get().customRecords];
    set({ customRecords: updated });
    await storageService.setItem(STORAGE_KEY, updated);
    return newRecord;
  },

  deleteRecord: async (id) => {
    const updated = get().customRecords.filter((r) => r.id !== id);
    set({ customRecords: updated });
    await storageService.setItem(STORAGE_KEY, updated);
  },
}));
