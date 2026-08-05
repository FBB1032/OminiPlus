export type DeviceCategory = 'wearable' | 'bluetooth_medical' | 'manual_only';

export type SyncEcosystem = 'apple_health' | 'health_connect' | 'huawei_health' | 'google_fit' | 'bluetooth_ble' | 'manual';

export interface DeviceBrand {
  id: string;
  name: string;
  category: DeviceCategory;
  ecosystem: SyncEcosystem;
  iconName: string;
  supportedModels: string[];
  syncCapabilities: string[]; // e.g. ["Heart Rate", "Blood Pressure", "Steps", "Sleep"]
  isAutoSyncSupported: boolean;
  setupGuide: string;
  statusBadge: 'Native Auto-Sync' | 'Health Connect' | 'Ecosystem Sync' | 'Direct BLE Pairing' | 'Manual Log Only';
  badgeColor: string;
}

export interface ConnectedDeviceState {
  deviceId: string;
  brandName: string;
  modelName: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  batteryLevel?: number;
  syncMode: 'auto' | 'manual';
}
