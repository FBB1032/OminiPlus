import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button, Divider } from '../../components';
import { useWearableStore } from '../../store/wearableStore';
import { useToast } from '../../hooks/useAuth';

export default function WearableSyncScreen({ navigation }: any) {
  const { connectedDevices, isSyncing, lastGlobalSyncAt, loadConnectedDevices, triggerManualSync, connectDevice, disconnectDevice } = useWearableStore();
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    loadConnectedDevices();
  }, []);

  const handleSyncNow = async () => {
    try {
      await triggerManualSync();
      showSuccess('Sync Complete', 'Vitals and health telemetry successfully updated from your connected ecosystem.');
    } catch {
      showError('Sync Error', 'Failed to pull wearable telemetry. Please try again.');
    }
  };

  const handleConnectNew = () => {
    Alert.alert(
      'Connect Health Device / Ecosystem',
      'Select ecosystem to connect:',
      [
        {
          text: 'Apple HealthKit',
          onPress: () => {
            connectDevice({
              deviceId: 'dev-apple-watch',
              brandName: 'Apple Watch',
              modelName: 'Series 9 / Ultra 2',
              isConnected: true,
              lastSyncedAt: new Date().toISOString(),
              batteryLevel: 92,
              syncMode: 'auto',
            });
            showSuccess('Apple Health Connected', 'Auto-sync active.');
          },
        },
        {
          text: 'Redmi / Health Connect',
          onPress: () => {
            connectDevice({
              deviceId: 'dev-redmi-health',
              brandName: 'Redmi Watch / Mi Fitness',
              modelName: 'Redmi Watch 4',
              isConnected: true,
              lastSyncedAt: new Date().toISOString(),
              syncMode: 'auto',
            });
            showSuccess('Health Connect Linked', 'Redmi Watch telemetry synced.');
          },
        },
        {
          text: 'Bluetooth BP Cuff',
          onPress: () => {
            connectDevice({
              deviceId: 'dev-omron-ble',
              brandName: 'Omron Bluetooth Monitor',
              modelName: 'Evolv BP Cuff',
              isConnected: true,
              lastSyncedAt: new Date().toISOString(),
              syncMode: 'auto',
            });
            showSuccess('BLE Monitor Paired', 'Direct BLE readings enabled.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Wearable & Device Sync</Text>
          <Text style={styles.headerSubtitle}>Apple Health, Health Connect & BLE Devices</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('DeviceCompatibility')}
          style={styles.compatBtn}
        >
          <Ionicons name="help-circle-outline" size={16} color="#2563EB" />
          <Text style={styles.compatBtnText}>Compatibility</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.syncCircle}>
              <Ionicons name={isSyncing ? 'refresh' : 'sync-circle'} size={28} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>
                {connectedDevices.length > 0 ? `${connectedDevices.length} Connected Device(s)` : 'No Devices Connected'}
              </Text>
              <Text style={styles.statusSub}>
                {lastGlobalSyncAt
                  ? `Last Synced: ${new Date(lastGlobalSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Tap Sync Now to fetch latest telemetry'}
              </Text>
            </View>
          </View>

          <Button
            label={isSyncing ? 'Syncing Telemetry...' : 'Sync All Telemetry Now'}
            onPress={handleSyncNow}
            isLoading={isSyncing}
            variant="primary"
          />
        </Card>

        {/* Connected Devices Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Connected Integrations</Text>
          <TouchableOpacity onPress={handleConnectNew}>
            <Text style={styles.addBtnText}>+ Connect New</Text>
          </TouchableOpacity>
        </View>

        {connectedDevices.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="watch-outline" size={32} color={Colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Devices Paired Yet</Text>
            <Text style={styles.emptyText}>
              Connect your smartwatch or Bluetooth health meter to auto-sync vitals with your doctors.
            </Text>
            <Button label="Pair Device Now" onPress={handleConnectNew} variant="outline" />
          </Card>
        ) : (
          connectedDevices.map((device) => (
            <Card key={device.deviceId} style={styles.deviceCard}>
              <View style={styles.deviceRow}>
                <View style={styles.deviceIconBg}>
                  <Ionicons
                    name={device.brandName.includes('Apple') ? 'logo-apple' : device.brandName.includes('Omron') ? 'bluetooth' : 'watch'}
                    size={22}
                    color="#2563EB"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>{device.brandName}</Text>
                  <Text style={styles.deviceModel}>{device.modelName}</Text>
                  <Text style={styles.deviceSyncTime}>
                    Synced: {device.lastSyncedAt ? new Date(device.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => disconnectDevice(device.deviceId)}
                  style={styles.disconnectBtn}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        {/* Manual Fallback Card */}
        <Card style={styles.manualCard}>
          <View style={styles.manualHeader}>
            <Ionicons name="create-outline" size={20} color="#D97706" />
            <Text style={styles.manualTitle}>No Watch? Log Vitals Manually</Text>
          </View>
          <Text style={styles.manualText}>
            You don't need any expensive smartwatch! You can log your Blood Pressure, Glucose, Asthma Peak Flow, and Pregnancy metrics directly inside Chronic Care.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('ChronicDisease')}
            style={styles.manualActionBtn}
          >
            <Text style={styles.manualActionText}>Go to Chronic Care Tracker →</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  compatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  compatBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#2563EB',
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  statusCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  statusSub: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[1],
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  emptyCard: {
    padding: Spacing[5],
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 4,
  },
  deviceCard: {
    padding: Spacing[3],
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deviceIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  deviceModel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  deviceSyncTime: {
    fontSize: 10.5,
    color: '#059669',
    marginTop: 2,
  },
  disconnectBtn: {
    padding: 6,
  },
  manualCard: {
    padding: Spacing[4],
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    gap: 8,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#92400E',
  },
  manualText: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 17,
  },
  manualActionBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  manualActionText: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: '#D97706',
  },
});
