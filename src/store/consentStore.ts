import { create } from 'zustand';
import { ConsentGrant, ConsentScope } from '../types/consent';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'ominipulse_consent_grants';

interface ConsentStore {
  grants: ConsentGrant[];
  isLoading: boolean;
  
  // Actions
  loadGrants: () => Promise<void>;
  grantConsent: (scope: ConsentScope, targetName: string, targetId?: string) => Promise<ConsentGrant>;
  revokeConsent: (grantId: string) => Promise<void>;
  hasConsent: (scope: ConsentScope, targetId?: string) => boolean;
}

const DEFAULT_GRANTS: ConsentGrant[] = [
  {
    id: 'grant-1',
    scope: 'medical_history',
    title: 'Medical History Sharing',
    description: 'I agree to share my medical history with Dr. Musa Ahmed.',
    targetId: 'doc-1',
    targetName: 'Dr. Musa Ahmed',
    status: 'granted',
    grantedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'grant-2',
    scope: 'lab_report',
    title: 'Lab Report Access',
    description: 'I agree to share my blood test lab report with Dr. Musa Ahmed.',
    targetId: 'doc-1',
    targetName: 'Dr. Musa Ahmed',
    status: 'granted',
    grantedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'grant-3',
    scope: 'ai_analysis',
    title: 'AI Health Guidance Analysis',
    description: 'I agree to AI automated analysis of symptoms and health logs.',
    targetName: 'AI Diagnostic Assistant',
    status: 'granted',
    grantedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export const useConsentStore = create<ConsentStore>((set, get) => ({
  grants: DEFAULT_GRANTS,
  isLoading: false,

  loadGrants: async () => {
    set({ isLoading: true });
    try {
      const stored = await storageService.getObject<ConsentGrant[]>(STORAGE_KEY);
      if (stored && stored.length > 0) {
        set({ grants: stored });
      } else {
        await storageService.setObject(STORAGE_KEY, DEFAULT_GRANTS);
        set({ grants: DEFAULT_GRANTS });
      }
    } catch {
      set({ grants: DEFAULT_GRANTS });
    } finally {
      set({ isLoading: false });
    }
  },

  grantConsent: async (scope, targetName, targetId) => {
    const existing = get().grants.find(
      (g) => g.scope === scope && g.targetName === targetName && g.status === 'granted'
    );
    if (existing) return existing;

    const newGrant: ConsentGrant = {
      id: `grant-${Date.now()}`,
      scope,
      title: scope === 'medical_history' 
        ? 'Medical History Sharing' 
        : scope === 'lab_report' 
        ? 'Lab Report Access' 
        : scope === 'ai_analysis' 
        ? 'AI Health Guidance Analysis' 
        : 'Prescription Sharing',
      description: `I agree to share my ${scope.replace('_', ' ')} with ${targetName}.`,
      targetId,
      targetName,
      status: 'granted',
      grantedAt: new Date().toISOString(),
    };

    const updated = [newGrant, ...get().grants];
    set({ grants: updated });
    await storageService.setObject(STORAGE_KEY, updated);
    return newGrant;
  },

  revokeConsent: async (grantId) => {
    const updated = get().grants.map((g) => {
      if (g.id === grantId) {
        return {
          ...g,
          status: 'revoked' as const,
          revokedAt: new Date().toISOString(),
        };
      }
      return g;
    });
    set({ grants: updated });
    await storageService.setObject(STORAGE_KEY, updated);
  },

  hasConsent: (scope, targetId) => {
    const grants = get().grants;
    return grants.some(
      (g) => g.scope === scope && (targetId ? g.targetId === targetId : true) && g.status === 'granted'
    );
  },
}));
