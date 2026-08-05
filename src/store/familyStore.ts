import { create } from 'zustand';
import { FamilyMemberProfile, RelationshipType } from '../types/family';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'ominipulse_family_profiles';
const ACTIVE_KEY = 'ominipulse_active_family_member';

interface FamilyStore {
  members: FamilyMemberProfile[];
  activeMember: FamilyMemberProfile;
  isLoading: boolean;

  // Actions
  loadMembers: () => Promise<void>;
  setActiveMember: (memberId: string) => Promise<void>;
  addMember: (params: {
    firstName: string;
    lastName: string;
    relationship: RelationshipType;
    relationshipLabel: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    bloodGroup?: string;
    genotype?: string;
    chronicConditions?: string[];
  }) => Promise<FamilyMemberProfile>;
  deleteMember: (memberId: string) => Promise<void>;
}

const DEFAULT_MEMBERS: FamilyMemberProfile[] = [
  {
    id: 'fam-primary',
    firstName: 'John',
    lastName: 'Doe',
    relationship: 'self',
    relationshipLabel: 'Self (Primary)',
    dateOfBirth: '1988-04-12',
    gender: 'male',
    bloodGroup: 'O+',
    genotype: 'AA',
    isPrimary: true,
    chronicConditions: ['Hypertension'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fam-wife',
    firstName: 'Aisha',
    lastName: 'Doe',
    relationship: 'spouse',
    relationshipLabel: 'Wife',
    dateOfBirth: '1990-09-20',
    gender: 'female',
    bloodGroup: 'A+',
    genotype: 'AA',
    isPrimary: false,
    chronicConditions: ['Pregnancy'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fam-kid',
    firstName: 'Leo',
    lastName: 'Doe',
    relationship: 'child',
    relationshipLabel: 'Son (Kid)',
    dateOfBirth: '2018-06-15',
    gender: 'male',
    bloodGroup: 'O+',
    genotype: 'AA',
    isPrimary: false,
    chronicConditions: ['Asthma'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fam-parent',
    firstName: 'Ibrahim',
    lastName: 'Doe',
    relationship: 'parent',
    relationshipLabel: 'Father (Elderly)',
    dateOfBirth: '1955-11-03',
    gender: 'male',
    bloodGroup: 'B+',
    genotype: 'AS',
    isPrimary: false,
    chronicConditions: ['Diabetes', 'Hypertension'],
    createdAt: new Date().toISOString(),
  },
];

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  members: DEFAULT_MEMBERS,
  activeMember: DEFAULT_MEMBERS[0],
  isLoading: false,

  loadMembers: async () => {
    set({ isLoading: true });
    try {
      const storedMembers = await storageService.getObject<FamilyMemberProfile[]>(STORAGE_KEY);
      const storedActiveId = await storageService.get(ACTIVE_KEY);

      const members = storedMembers && storedMembers.length > 0 ? storedMembers : DEFAULT_MEMBERS;
      if (!storedMembers) {
        await storageService.setObject(STORAGE_KEY, DEFAULT_MEMBERS);
      }

      const activeMember = members.find((m) => m.id === storedActiveId) || members[0];
      set({ members, activeMember });
    } catch {
      set({ members: DEFAULT_MEMBERS, activeMember: DEFAULT_MEMBERS[0] });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveMember: async (memberId) => {
    const member = get().members.find((m) => m.id === memberId);
    if (member) {
      set({ activeMember: member });
      await storageService.set(ACTIVE_KEY, memberId);
    }
  },

  addMember: async (params) => {
    const newMember: FamilyMemberProfile = {
      id: `fam-${Date.now()}`,
      firstName: params.firstName,
      lastName: params.lastName,
      relationship: params.relationship,
      relationshipLabel: params.relationshipLabel,
      dateOfBirth: params.dateOfBirth,
      gender: params.gender,
      bloodGroup: params.bloodGroup,
      genotype: params.genotype,
      chronicConditions: params.chronicConditions || [],
      isPrimary: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...get().members, newMember];
    set({ members: updated });
    await storageService.setObject(STORAGE_KEY, updated);
    return newMember;
  },

  deleteMember: async (memberId) => {
    const target = get().members.find((m) => m.id === memberId);
    if (target?.isPrimary) return; // Cannot delete primary profile

    const updated = get().members.filter((m) => m.id !== memberId);
    let active = get().activeMember;
    if (active.id === memberId) {
      active = updated[0];
      await storageService.set(ACTIVE_KEY, active.id);
    }

    set({ members: updated, activeMember: active });
    await storageService.setObject(STORAGE_KEY, updated);
  },
}));
