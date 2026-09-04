/**
 * WearableSyncScreen — MVP Freeze
 *
 * BLE / HealthKit / Health Connect sync is frozen for MVP launch due to low
 * wearable penetration in the target market and high SDK maintenance overhead.
 *
 * Replacement: Manual vitals entry via the Chronic Care Tracker.
 * Phase 2 will re-introduce wearable sync with full HealthKit / Health Connect
 * bridges once the active user base justifies the integration cost.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button } from '../../components';

export default function WearableSyncScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Wearable & Device Sync</Text>
          <Text style={styles.headerSubtitle}>Coming in Phase 2</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming Soon Card */}
        <Card style={styles.frozenCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="watch-outline" size={40} color="#94A3B8" />
          </View>

          <Text style={styles.frozenTitle}>Smartwatch Sync — Coming Soon</Text>
          <Text style={styles.frozenBody}>
            Automatic sync with Apple Watch, Redmi / Health Connect, and Bluetooth
            health monitors is planned for Phase 2. We are building native
            HealthKit and Health Connect bridges that work reliably for the
            Nigerian market before enabling this feature.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.altHeading}>Log Your Vitals Manually Right Now</Text>
          <Text style={styles.altBody}>
            You don't need a smartwatch. Use the Chronic Care Tracker to record your
            Blood Pressure, Heart Rate, Blood Glucose, Asthma Peak Flow, and
            Pregnancy metrics — all visible to your doctor during consultations.
          </Text>

          <Button
            label="Open Chronic Care Tracker"
            onPress={() => navigation.navigate('ChronicDisease')}
            variant="primary"
            style={styles.ctaBtn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('PatientTabs', { screen: 'PatientHome' })}
            activeOpacity={0.7}
            style={styles.secondaryLink}
          >
            <Text style={styles.secondaryLinkText}>Back to Home</Text>
          </TouchableOpacity>
        </Card>

        {/* What to expect in Phase 2 */}
        <View style={styles.roadmapCard}>
          <Text style={styles.roadmapTitle}>What to expect in Phase 2</Text>
          {[
            { icon: 'logo-apple', label: 'Apple HealthKit — iOS auto-sync' },
            { icon: 'watch-outline', label: 'Google Health Connect — Android auto-sync' },
            { icon: 'bluetooth-outline', label: 'Bluetooth BP cuff & glucometer pairing' },
            { icon: 'pulse-outline', label: 'Real-time vitals streaming to your doctor' },
          ].map((item) => (
            <View key={item.label} style={styles.roadmapRow}>
              <View style={styles.roadmapIconBg}>
                <Ionicons name={item.icon as any} size={18} color="#2563EB" />
              </View>
              <Text style={styles.roadmapLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
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
    fontSize: FontSize.sm,
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
    paddingBottom: Spacing[8],
  },
  frozenCard: {
    alignItems: 'center',
    padding: Spacing[6],
    gap: Spacing[3],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  frozenTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  frozenBody: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
  altHeading: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  altBody: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaBtn: {
    width: '100%',
    marginTop: Spacing[2],
  },
  secondaryLink: {
    marginTop: Spacing[2],
    paddingVertical: Spacing[2],
  },
  secondaryLinkText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  roadmapCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    ...Shadows.sm,
  },
  roadmapTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[1],
  },
  roadmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  roadmapIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
});
