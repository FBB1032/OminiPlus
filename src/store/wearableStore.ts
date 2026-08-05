import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { ConnectedDeviceState } from '../types/wearable';

const WEARABLE_STORAGE_KEY = 'ominipulse_connected_wearables_v1';

interface WearableStoreState {
  connectedDevices: ConnectedDeviceState[];
  isSyncing: boolean;
  lastGlobalSyncAt: string | null;
  loadConnectedDevices: () => Promise<void>;
  connectDevice: (device: ConnectedDeviceState) => Promise<void>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  triggerManualSync: () => Promise<void>;
}

const DEFAULT_DEVICES: ConnectedDeviceState[] = [
  {
    deviceId: 'dev-apple-watch',
    brandName: 'Apple Watch',
    modelName: 'Series 9 / Ultra 2',
    isConnected: true,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    batteryLevel: 84,
    syncMode: 'auto',
  },
];

export const useWearableStore = create<WearableStoreState>((set, get) => ({
  connectedDevices: DEFAULT_DEVICES,
  isSyncing: false,
  lastGlobalSyncAt: new Date().toISOString(),

  loadConnectedDevices: async () => {
    try {
      const raw = await storageService.get(WEARABLE_STORAGE_KEY);
      if (raw) {
        const stored = typeof raw === 'string' ? JSON.parse(raw) : raw;
        set({ connectedDevices: stored });
      }
    } catch (e) {
      console.error('[WearableStore] Load error:', e);
    }
  },

  connectDevice: async (device: ConnectedDeviceState) => {
    const updated = [...get().connectedDevices.filter((d) => d.deviceId !== device.deviceId), device];
    set({ connectedDevices: updated });
    await storageService.set(WEARABLE_STORAGE_KEY, JSON.stringify(updated));
  },

  disconnectDevice: async (deviceId: string) => {
    const updated = get().connectedDevices.filter((d) => d.deviceId !== deviceId);
    set({ connectedDevices: updated });
    await storageService.set(WEARABLE_STORAGE_KEY, JSON.stringify(updated));
  },

  triggerManualSync: async () => {
    set({ isSyncing: true });
    // Simulate background sync with ecosystem APIs
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const now = new Date().toISOString();
    const updated = get().connectedDevices.map((dev) => ({
      ...dev,
      lastSyncedAt: now,
    }));
    set({ connectedDevices: updated, isSyncing: false, lastGlobalSyncAt: now });
    await storageService.set(WEARABLE_STORAGE_KEY, JSON.stringify(updated));
  },
}));
