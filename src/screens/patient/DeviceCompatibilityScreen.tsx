import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Divider } from '../../components';
import { DeviceBrand } from '../../types/wearable';

const DEVICE_BRANDS: DeviceBrand[] = [
  {
    id: 'apple',
    name: 'Apple Watch & HealthKit',
    category: 'wearable',
    ecosystem: 'apple_health',
    iconName: 'logo-apple',
    supportedModels: ['Apple Watch Series 4 through 9', 'Apple Watch Ultra / Ultra 2', 'Apple Watch SE'],
    syncCapabilities: ['Heart Rate', 'ECG (SpO2)', 'Blood Oxygen', 'Sleep Analysis', 'Steps & Activity'],
    isAutoSyncSupported: true,
    statusBadge: 'Native Auto-Sync',
    badgeColor: '#059669',
    setupGuide: 'Open Apple Health app → Sharing → Apps → Enable OminiPulse data read/write permissions.',
  },
  {
    id: 'health-connect',
    name: 'Android Health Connect (Xiaomi / Redmi / Samsung)',
    category: 'wearable',
    ecosystem: 'health_connect',
    iconName: 'logo-android',
    supportedModels: ['Redmi Watch 3 / 4', 'Xiaomi Smart Band 7 / 8', 'Galaxy Watch 4 / 5 / 6', 'Pixel Watch'],
    syncCapabilities: ['Heart Rate', 'Blood Pressure', 'Blood Glucose', 'SpO2', 'Sleep', 'Steps'],
    isAutoSyncSupported: true,
    statusBadge: 'Health Connect',
    badgeColor: '#2563EB',
    setupGuide: 'Install Google Health Connect from Play Store. Grant OminiPulse read access for Mi Fitness or Samsung Health.',
  },
  {
    id: 'huawei',
    name: 'Huawei Health Ecosystem',
    category: 'wearable',
    ecosystem: 'huawei_health',
    iconName: 'fitness',
    supportedModels: ['Huawei Watch GT 3 / GT 4', 'Huawei Band 7 / 8 / 9', 'Huawei Watch D (BP)'],
    syncCapabilities: ['Blood Pressure (Watch D)', 'Continuous SpO2', 'Heart Rate', 'Sleep TruSleep'],
    isAutoSyncSupported: true,
    statusBadge: 'Ecosystem Sync',
    badgeColor: '#7C3AED',
    setupGuide: 'Link Huawei Health to Health Connect or authorize OminiPulse Cloud Sync in Huawei Health settings.',
  },
  {
    id: 'google-fit',
    name: 'Google Fit / Wear OS',
    category: 'wearable',
    ecosystem: 'google_fit',
    iconName: 'logo-google',
    supportedModels: ['Fossil Gen 6', 'TicWatch Pro 5', 'Fitbit Sense / Charge 5 / 6'],
    syncCapabilities: ['Heart Rate', 'Daily Activity', 'Sleep', 'Weight Logs'],
    isAutoSyncSupported: true,
    statusBadge: 'Native Auto-Sync',
    badgeColor: '#059669',
    setupGuide: 'Sign in with your Google account linked to Google Fit / Fitbit to authorize background telemetry sync.',
  },
  {
    id: 'ble-medical',
    name: 'Bluetooth Medical Monitors (Omron / Accu-Chek / Contec)',
    category: 'bluetooth_medical',
    ecosystem: 'bluetooth_ble',
    iconName: 'bluetooth',
    supportedModels: ['Omron Evolv / M7 Blood Pressure Monitors', 'Accu-Chek Instant Blood Glucose', 'Contec Pulse Oximeters'],
    syncCapabilities: ['Systolic / Diastolic BP', 'Blood Glucose (mg/dL)', 'Pulse Rate', 'SpO2%'],
    isAutoSyncSupported: true,
    statusBadge: 'Direct BLE Pairing',
    badgeColor: '#D97706',
    setupGuide: 'Turn on Bluetooth on your device, press pair button on cuff/meter, and tap Pair Bluetooth Monitor inside OminiPulse.',
  },
  {
    id: 'manual',
    name: 'No Wearable? Manual Vital Entry & Smart Devices',
    category: 'manual_only',
    ecosystem: 'manual',
    iconName: 'create-outline',
    supportedModels: ['Cheap Budget Smartwatches without API access', 'Standard Manual Arm Cuffs', 'Finger Glucose Test Strips'],
    syncCapabilities: ['Manual BP Log', 'Manual Blood Sugar Log', 'Manual Asthma Peak Flow Log', 'Pregnancy Milestones'],
    isAutoSyncSupported: false,
    statusBadge: 'Manual Log Only',
    badgeColor: '#64748B',
    setupGuide: 'No watch needed! Simply log readings manually in the Chronic Care screen or tell your doctor during telehealth visits.',
  },
];

export default function DeviceCompatibilityScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wearable' | 'bluetooth_medical' | 'manual_only'>('all');

  const filteredBrands = DEVICE_BRANDS.filter((brand) =>
    selectedCategory === 'all' ? true : brand.category === selectedCategory
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Device Compatibility Directory</Text>
          <Text style={styles.headerSubtitle}>Supported Wearables, Smartwatches & Medical Monitors</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Inclusive Banner */}
        <Card style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <Ionicons name="heart-circle" size={24} color="#059669" />
            <Text style={styles.bannerTitle}>OminiPulse Works With or Without a Watch</Text>
          </View>
          <Text style={styles.bannerText}>
            Whether you own an Apple Watch, a Redmi Watch, a Bluetooth blood pressure cuff, a budget smartwatch, or no device at all — OminiPulse is 100% inclusive. You can always log vitals manually or consult doctors anytime.
          </Text>
        </Card>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All Devices' },
            { key: 'wearable', label: 'Smartwatches' },
            { key: 'bluetooth_medical', label: 'Medical Devices' },
            { key: 'manual_only', label: 'Manual Entry' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key as any)}
              style={[styles.filterPill, selectedCategory === cat.key && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, selectedCategory === cat.key && styles.filterPillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Brands List */}
        {filteredBrands.map((brand) => (
          <Card key={brand.id} style={styles.brandCard}>
            <View style={styles.brandHeader}>
              <View style={styles.brandTitleRow}>
                <Ionicons name={brand.iconName as any} size={20} color={Colors.primary[600]} />
                <Text style={styles.brandName}>{brand.name}</Text>
              </View>

              <View style={[styles.badge, { backgroundColor: `${brand.badgeColor}15`, borderColor: `${brand.badgeColor}40` }]}>
                <Text style={[styles.badgeText, { color: brand.badgeColor }]}>{brand.statusBadge}</Text>
              </View>
            </View>

            <Divider spacing={3} />

            <View style={styles.infoSection}>
              <Text style={styles.subHeading}>Supported Models:</Text>
              <Text style={styles.bodyText}>{brand.supportedModels.join(' • ')}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.subHeading}>Vitals Synced:</Text>
              <View style={styles.tagsRow}>
                {brand.syncCapabilities.map((cap, i) => (
                  <View key={i} style={styles.tagPill}>
                    <Text style={styles.tagText}>{cap}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.setupCard}>
              <Text style={styles.setupTitle}>How to Connect / Sync:</Text>
              <Text style={styles.setupText}>{brand.setupGuide}</Text>
            </View>
          </Card>
        ))}
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
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  bannerCard: {
    padding: Spacing[4],
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    gap: 8,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: '#065F46',
    flex: 1,
  },
  bannerText: {
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 17,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  brandCard: {
    padding: Spacing[4],
    gap: Spacing[2],
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  brandName: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  infoSection: {
    gap: 4,
  },
  subHeading: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  bodyText: {
    fontSize: 12,
    color: Colors.text.primary,
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 10.5,
    color: Colors.text.secondary,
  },
  setupCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing[3],
    gap: 4,
    marginTop: 4,
  },
  setupTitle: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#334155',
  },
  setupText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
});
