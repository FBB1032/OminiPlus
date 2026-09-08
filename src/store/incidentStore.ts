import { create } from 'zustand';
import { storageService } from '../services/storageService';

export interface IncidentReport {
  id: string;
  doctorName: string;
  consultationId: string;
  category: string;
  categoryLabel: string;
  severity: string;
  severityLabel: string;
  incidentDate: string;
  narrative: string;
  attachedFiles: string[];
  status: 'Under Review' | 'Investigating' | 'Escalated to MDCN' | 'Resolved';
  filedAt: string;
}

interface IncidentStore {
  reports: IncidentReport[];
  isLoading: boolean;
  loadReports: () => Promise<void>;
  addReport: (
    report: Omit<IncidentReport, 'id' | 'status' | 'filedAt'>
  ) => Promise<IncidentReport>;
}

const STORAGE_KEY = 'ominipulse_incident_reports';

const INITIAL_REPORTS: IncidentReport[] = [
  {
    id: 'REP-7241',
    doctorName: 'Dr. Babajide Alabi',
    consultationId: 'APT-2026-1044',
    category: 'prescription',
    categoryLabel: 'Prescription Error / Wrong Dosage',
    severity: 'high',
    severityLabel: 'High Violation',
    incidentDate: '2026-06-01',
    narrative:
      'Prescribed medication dosage exceeded safe clinical protocol for pediatric weight. Consulted pharmacist who flagged the discrepancy.',
    attachedFiles: ['prescription_copy_err.pdf'],
    status: 'Investigating',
    filedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  reports: INITIAL_REPORTS,
  isLoading: false,

  loadReports: async () => {
    set({ isLoading: true });
    try {
      const stored = await storageService.getItem<IncidentReport[]>(STORAGE_KEY);
      set({
        reports: stored && stored.length > 0 ? stored : INITIAL_REPORTS,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addReport: async (reportData) => {
    const newReport: IncidentReport = {
      ...reportData,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Under Review',
      filedAt: new Date().toISOString(),
    };

    const updated = [newReport, ...get().reports];
    set({ reports: updated });
    await storageService.setItem(STORAGE_KEY, updated);
    return newReport;
  },
}));
