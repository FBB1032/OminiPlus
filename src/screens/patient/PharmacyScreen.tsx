/**
 * PharmacyScreen — MVP Freeze
 *
 * GPS Pharmacy Radar and Direct Checkout are frozen for MVP launch.
 * Managing pharmacy inventory APIs and drug-fulfillment logistics would delay
 * launch without meaningful user value at this stage.
 *
 * Replacement: Doctors issue MDCN-stamped digital PDF e-prescriptions that
 * patients can download and take to any physical pharmacy.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button } from '../../components';
import { useToast } from '../../hooks/useAuth';

// ─── Nearby pharmacies list (static, no GPS required) ─────────────────────────

const NEARBY_PHARMACIES = [
  { id: '1', name: 'Medplus Pharmacy & Superstore', address: '14 Allen Avenue, Ikeja', phone: '+234 803 123 4567' },
  { id: '2', name: 'HealthPlus Pharmacy',           address: 'Oba Akran Avenue, Ikeja',  phone: '+234 802 987 6543' },
  { id: '3', name: 'Alpha Pharmacy & Healthcare',   address: '42 Isaac John Street, GRA Ikeja', phone: '+234 805 555 1212' },
  { id: '4', name: 'Carefort Drugs & Mart',         address: '78 Toyin Street, Ikeja',   phone: '+234 809 333 4455' },
];

export default function PharmacyScreen({ navigation }: any) {
  const { success: toastSuccess } = useToast();
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  // Simulates PDF e-prescription download
  const handleDownloadPrescription = (rxId: string, drugName: string) => {
    setDownloadedIds((prev) => [...prev, rxId]);
    toastSuccess(
      'E-Prescription Downloaded',
      `${drugName} prescription (MDCN-stamped PDF) saved to your device. Show it at any pharmacy.`
    );
  };

  const handleCallPharmacy = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Dial ${phone} to check stock before visiting?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            const url = `tel:${phone.replace(/\s+/g, '')}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else toastSuccess('Dialer', `Calling ${phone}…`);
              })
              .catch(() => toastSuccess('Dialer', `Calling ${phone}…`));
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Pharmacy</Text>
          <Text style={styles.headerSubtitle}>E-Prescriptions & Nearby Pharmacies</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* How it works banner */}
        <Card style={styles.howItWorksCard}>
          <View style={styles.howItWorksHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
            <Text style={styles.howItWorksTitle}>How prescriptions work</Text>
          </View>
          <View style={styles.stepsList}>
            {[
              { icon: 'calendar-outline',       text: 'Complete a consultation with your doctor on OmniPulse.' },
              { icon: 'document-text-outline',  text: 'Your doctor issues a digitally signed, MDCN-stamped PDF e-prescription.' },
              { icon: 'download-outline',       text: 'Download the PDF from your Prescription History.' },
              { icon: 'storefront-outline',     text: 'Present the PDF at any physical pharmacy to collect your medication.' },
            ].map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.stepIconBg}>
                  <Ionicons name={step.icon as any} size={16} color="#2563EB" />
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Download E-Prescriptions section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Active E-Prescriptions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PrescriptionHistory')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllLink}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* Prescription cards (mock — will bind to real API in Phase 2) */}
        {[
          { id: 'RX-9081', drug: 'Amlodipine Besylate 5mg',   dosage: '1 Tablet once daily',    doctor: 'Dr. Folake Ademola', date: 'Today, 09:15 AM' },
          { id: 'RX-8942', drug: 'Atorvastatin Calcium 20mg', dosage: '1 Tablet at bedtime',     doctor: 'Dr. Tunde Adewale',  date: 'Yesterday, 02:40 PM' },
        ].map((rx) => {
          const isDownloaded = downloadedIds.includes(rx.id);
          return (
            <Card key={rx.id} style={styles.rxCard}>
              <View style={styles.rxCardTop}>
                <View style={styles.rxIconBg}>
                  <Ionicons name="document-text-outline" size={20} color="#0F6E6E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rxDrug}>{rx.drug}</Text>
                  <Text style={styles.rxMeta}>{rx.dosage} · {rx.doctor}</Text>
                  <Text style={styles.rxDate}>{rx.date}</Text>
                </View>
                <View style={[styles.rxBadge, isDownloaded && styles.rxBadgeDownloaded]}>
                  <Text style={[styles.rxBadgeText, isDownloaded && styles.rxBadgeTextDownloaded]}>
                    {isDownloaded ? 'Downloaded' : rx.id}
                  </Text>
                </View>
              </View>
              <Button
                label={isDownloaded ? 'Download Again' : 'Download PDF (MDCN Stamped)'}
                onPress={() => handleDownloadPrescription(rx.id, rx.drug)}
                variant={isDownloaded ? 'outline' : 'primary'}
                leftIcon={<Ionicons name="download-outline" size={16} color={isDownloaded ? Colors.primary[600] : '#FFFFFF'} />}
                style={styles.downloadBtn}
              />
            </Card>
          );
        })}

        {/* Nearby Pharmacies section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing[2] }]}>
          Nearby Pharmacies
        </Text>
        <Text style={styles.nearbyNote}>
          Call ahead to confirm stock before visiting.
        </Text>

        {NEARBY_PHARMACIES.map((pharmacy) => (
          <Card key={pharmacy.id} style={styles.pharmacyCard}>
            <View style={styles.pharmacyRow}>
              <View style={styles.pharmacyIconBg}>
                <Ionicons name="storefront-outline" size={20} color="#0F6E6E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCallPharmacy(pharmacy.phone, pharmacy.name)}
                style={styles.callBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={18} color="#0F6E6E" />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* Phase 2 teaser */}
        <View style={styles.phase2Card}>
          <Ionicons name="rocket-outline" size={20} color="#7C3AED" />
          <Text style={styles.phase2Text}>
            <Text style={{ fontWeight: FontWeight.bold }}>Coming in Phase 2: </Text>
            GPS Pharmacy Radar, real-time stock availability, and doorstep
            prescription delivery.
          </Text>
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
    paddingBottom: Spacing[10],
    gap: Spacing[3],
  },
  howItWorksCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  howItWorksTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  stepsList: {
    gap: Spacing[3],
    marginTop: Spacing[1],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  stepIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  seeAllLink: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.medium,
  },
  rxCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  rxCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  rxIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rxDrug: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  rxMeta: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  rxDate: {
    fontSize: FontSize.xs,
    color: Colors.text.tertiary ?? Colors.text.secondary,
    marginTop: 2,
  },
  rxBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  rxBadgeDownloaded: {
    backgroundColor: '#DCFCE7',
  },
  rxBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  rxBadgeTextDownloaded: {
    color: '#15803D',
  },
  downloadBtn: {
    marginTop: Spacing[1],
  },
  nearbyNote: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: -Spacing[2],
  },
  pharmacyCard: {
    padding: Spacing[3],
  },
  pharmacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  pharmacyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pharmacyName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  pharmacyAddress: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  phase2Card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginTop: Spacing[2],
  },
  phase2Text: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#5B21B6',
    lineHeight: 20,
  },
});
