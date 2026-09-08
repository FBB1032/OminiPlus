import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { MOCK_BLOOD_DONORS } from '../api/__mocks__/mockData';

export interface BloodDonorItem {
  id: string;
  name: string;
  bloodGroup: string;
  genotype: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string;
  availabilityStatus: string;
  isVerified: boolean;
  lastDonationDate: string;
  donationsCount: number;
  gender: string;
}

export interface EmergencyBloodRequest {
  id: string;
  patientName: string;
  relativeName: string;
  relationship: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: 'Standard' | 'Urgent' | 'Critical Surgery';
  hospitalName: string;
  hospitalWard: string;
  attendingDoctor: string;
  timestamp: string;
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  matchedDonorsCount: number;
  respondedDonorsCount: number;
  screenedAtFacility: boolean;
  donationCompleted: boolean;
}

interface BloodDonorsStore {
  donors: BloodDonorItem[];
  emergencyRequests: EmergencyBloodRequest[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  registerDonor: (donor: Omit<BloodDonorItem, 'id' | 'distanceKm' | 'isVerified' | 'donationsCount'>) => Promise<BloodDonorItem>;
  submitEmergencyRequest: (req: Omit<EmergencyBloodRequest, 'id' | 'timestamp' | 'stage' | 'matchedDonorsCount' | 'respondedDonorsCount' | 'screenedAtFacility' | 'donationCompleted'>) => Promise<EmergencyBloodRequest>;
  updateRequestStage: (requestId: string, stage: EmergencyBloodRequest['stage']) => Promise<void>;
}

const STORAGE_KEYS = {
  DONORS: 'ominipulse_blood_donors',
  REQUESTS: 'ominipulse_blood_requests',
};

export const useBloodDonorsStore = create<BloodDonorsStore>((set, get) => ({
  donors: MOCK_BLOOD_DONORS,
  emergencyRequests: [],
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const storedDonors = await storageService.getItem<BloodDonorItem[]>(STORAGE_KEYS.DONORS);
      const storedRequests = await storageService.getItem<EmergencyBloodRequest[]>(STORAGE_KEYS.REQUESTS);

      set({
        donors: storedDonors && storedDonors.length > 0 ? storedDonors : MOCK_BLOOD_DONORS,
        emergencyRequests: storedRequests || [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  registerDonor: async (donorData) => {
    const newDonor: BloodDonorItem = {
      ...donorData,
      id: `bd-${Date.now()}`,
      distanceKm: 0.8,
      isVerified: true,
      donationsCount: 1,
    };

    const updated = [newDonor, ...get().donors];
    set({ donors: updated });
    await storageService.setItem(STORAGE_KEYS.DONORS, updated);
    return newDonor;
  },

  submitEmergencyRequest: async (reqData) => {
    // Calculate matching donors by blood group
    const matching = get().donors.filter(
      (d) => reqData.bloodGroup === 'O-' || d.bloodGroup === reqData.bloodGroup || d.bloodGroup === 'O-'
    );

    const newReq: EmergencyBloodRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 3, // Immediately moves through verification
      matchedDonorsCount: Math.max(1, matching.length),
      respondedDonorsCount: Math.min(2, matching.length),
      screenedAtFacility: false,
      donationCompleted: false,
    };

    const updated = [newReq, ...get().emergencyRequests];
    set({ emergencyRequests: updated });
    await storageService.setItem(STORAGE_KEYS.REQUESTS, updated);
    return newReq;
  },

  updateRequestStage: async (requestId, stage) => {
    const updated = get().emergencyRequests.map((r) =>
      r.id === requestId ? { ...r, stage, donationCompleted: stage === 8 } : r
    );
    set({ emergencyRequests: updated });
    await storageService.setItem(STORAGE_KEYS.REQUESTS, updated);
  },
}));
