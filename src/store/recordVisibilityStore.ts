import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { RecordVisibility } from '../types/medicalRecord';

const VISIBILITY_STORAGE_KEY = 'ominipulse_medical_record_visibility';

interface RecordVisibilityState {
  visibilities: Record<string, RecordVisibility>;
  isLoading: boolean;
  loadVisibilities: () => Promise<void>;
  toggleVisibility: (recordId: string) => Promise<RecordVisibility>;
  getVisibility: (recordId: string) => RecordVisibility;
}

export const useRecordVisibilityStore = create<RecordVisibilityState>((set, get) => ({
  visibilities: {},
  isLoading: false,

  loadVisibilities: async () => {
    set({ isLoading: true });
    try {
      const raw = await storageService.get(VISIBILITY_STORAGE_KEY);
      if (raw) {
        const stored = typeof raw === 'string' ? JSON.parse(raw) : raw;
        set({ visibilities: stored });
      }
    } catch (e) {
      console.error('[RecordVisibilityStore] Load error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleVisibility: async (recordId: string) => {
    const current = get().getVisibility(recordId);
    const next: RecordVisibility = current === 'all' ? 'patient_only' : 'all';
    
    const updated = {
      ...get().visibilities,
      [recordId]: next,
    };
    
    set({ visibilities: updated });
    await storageService.set(VISIBILITY_STORAGE_KEY, JSON.stringify(updated));
    return next;
  },

  getVisibility: (recordId: string) => {
    return get().visibilities[recordId] || 'all';
  },
}));
