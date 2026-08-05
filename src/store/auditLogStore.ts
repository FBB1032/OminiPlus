import { create } from 'zustand';
import { AuditLogEntry, AuditAction, ActorRole } from '../types/auditLog';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'ominipulse_audit_logs';

interface AuditLogStore {
  logs: AuditLogEntry[];
  isLoading: boolean;
  
  // Actions
  loadLogs: () => Promise<void>;
  logEvent: (params: {
    patientId?: string;
    patientName?: string;
    actorId?: string;
    actorName: string;
    actorRole: ActorRole;
    actorTitle?: string;
    action: AuditAction;
    recordId: string;
    recordName: string;
    recordCategory: 'lab_report' | 'prescription' | 'medical_history' | 'vitals' | 'ai_chat';
  }) => Promise<AuditLogEntry>;
  clearLogs: () => Promise<void>;
}

const DEFAULT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-101',
    patientId: 'pat-1',
    patientName: 'John Doe',
    actorId: 'doc-1',
    actorName: 'Dr. Musa Ahmed',
    actorRole: 'doctor',
    actorTitle: 'Cardiologist',
    action: 'view',
    recordId: 'rec-1',
    recordName: 'Blood Test Results.pdf',
    recordCategory: 'lab_report',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    ipAddress: '192.168.1.45',
    device: 'Hospital Workstation - Room 302',
  },
  {
    id: 'log-102',
    patientId: 'pat-1',
    patientName: 'John Doe',
    actorId: 'doc-1',
    actorName: 'Dr. Musa Ahmed',
    actorRole: 'doctor',
    actorTitle: 'Cardiologist',
    action: 'download',
    recordId: 'rec-2',
    recordName: 'Prescription_Amoxicillin.pdf',
    recordCategory: 'prescription',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
    ipAddress: '192.168.1.45',
    device: 'Hospital Tablet',
  },
  {
    id: 'log-103',
    patientId: 'pat-1',
    patientName: 'John Doe',
    actorId: 'adm-99',
    actorName: 'System Security Admin',
    actorRole: 'admin',
    actorTitle: 'Compliance Officer (Logged & Audited)',
    action: 'view',
    recordId: 'rec-3',
    recordName: 'Patient Profile & Medical History Summary',
    recordCategory: 'medical_history',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    ipAddress: '10.0.4.12',
    device: 'Admin Console - Secure Audit Mode',
  },
  {
    id: 'log-104',
    patientId: 'pat-1',
    patientName: 'John Doe',
    actorId: 'ai-core',
    actorName: 'Omini AI Diagnostic Engine',
    actorRole: 'system_ai',
    actorTitle: 'Clinical Assistant AI',
    action: 'view',
    recordId: 'rec-4',
    recordName: 'Symptom History & Vitals Log',
    recordCategory: 'vitals',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    ipAddress: '127.0.0.1',
    device: 'AI Processing Pipeline',
  },
];

export const useAuditLogStore = create<AuditLogStore>((set, get) => ({
  logs: DEFAULT_LOGS,
  isLoading: false,

  loadLogs: async () => {
    set({ isLoading: true });
    try {
      const stored = await storageService.getObject<AuditLogEntry[]>(STORAGE_KEY);
      if (stored && stored.length > 0) {
        set({ logs: stored });
      } else {
        await storageService.setObject(STORAGE_KEY, DEFAULT_LOGS);
        set({ logs: DEFAULT_LOGS });
      }
    } catch {
      set({ logs: DEFAULT_LOGS });
    } finally {
      set({ isLoading: false });
    }
  },

  logEvent: async (params) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId: params.patientId || 'pat-1',
      patientName: params.patientName || 'John Doe',
      actorId: params.actorId || 'usr-active',
      actorName: params.actorName,
      actorRole: params.actorRole,
      actorTitle: params.actorTitle || (params.actorRole === 'doctor' ? 'Healthcare Provider' : 'System Actor'),
      action: params.action,
      recordId: params.recordId,
      recordName: params.recordName,
      recordCategory: params.recordCategory,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      device: 'Mobile Application',
    };

    const updated = [newEntry, ...get().logs];
    set({ logs: updated });
    await storageService.setObject(STORAGE_KEY, updated);
    return newEntry;
  },

  clearLogs: async () => {
    set({ logs: [] });
    await storageService.remove(STORAGE_KEY);
  },
}));
