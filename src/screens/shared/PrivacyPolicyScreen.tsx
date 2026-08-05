import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { PATIENT_LEGAL_DOC, DOCTOR_LEGAL_DOC } from '../../constants/legalTerms';

export default function PrivacyPolicyScreen({ navigation }: any) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const activeDoc = isDoctor ? DOCTOR_LEGAL_DOC : PATIENT_LEGAL_DOC;

  const handleContactDPO = () => {
    Linking.openURL('mailto:dpo@ominipulse.com?subject=NDPR%20Data%20Privacy%20Inquiry');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Privacy Policy & EHR Data Protection</Text>
          <Text style={styles.headerSubtitle}>NDPR & NDPA Compliance Standards</Text>
        </View>
        <View style={styles.roleTag}>
          <Text style={styles.roleTagText}>{isDoctor ? 'Doctor Terms' : 'Patient Privacy'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Compliance Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: isDoctor ? '#F0FDF4' : '#EFF6FF', borderColor: isDoctor ? '#BBF7D0' : '#BFDBFE' }]}>
          <View style={styles.heroHeader}>
            <Ionicons name="shield-checkmark" size={24} color={isDoctor ? '#059669' : '#2563EB'} />
            <Text style={[styles.heroTitle, { color: isDoctor ? '#065F46' : '#1E40AF' }]}>
              {isDoctor ? 'Medical Provider Credential & Payout Data Privacy' : 'End-to-End EHR Data Encryption'}
            </Text>
          </View>

          <Text style={[styles.heroSub, { color: isDoctor ? '#047857' : '#1D4ED8' }]}>
            {isDoctor
              ? 'Your medical license numbers, bank payout accounts, and clinical identity records are protected under strict NDPR guidelines.'
              : 'Your electronic health records (EHR), lab results, and consultation chats are encrypted in transit and at rest with 256-bit AES encryption.'}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.specBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.specBadgeText}>NDPR Compliant</Text>
            </View>
            <View style={styles.specBadge}>
              <Ionicons name="lock-closed" size={12} color="#2563EB" />
              <Text style={styles.specBadgeText}>256-Bit Encrypted</Text>
            </View>
            <View style={styles.specBadge}>
              <Ionicons name="ban" size={12} color="#DC2626" />
              <Text style={styles.specBadgeText}>Zero Data Selling</Text>
            </View>
          </View>
        </View>

        {/* Legal Sections */}
        <Text style={styles.lastUpdated}>Version {activeDoc.version} • Updated {activeDoc.lastUpdated}</Text>

        {activeDoc.sections.map((sec, idx) => (
          <Card key={idx} style={styles.sectionCard}>
            <View style={styles.secTitleRow}>
              <Ionicons name={sec.icon as any} size={18} color={isDoctor ? '#059669' : '#2563EB'} />
              <Text style={styles.secTitle}>{sec.title}</Text>
            </View>

            <View style={styles.bulletsList}>
              {sec.content.map((point, pIdx) => (
                <View key={pIdx} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: isDoctor ? '#059669' : '#2563EB' }]} />
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* Data Protection Officer Contact */}
        <View style={styles.dpoCard}>
          <Text style={styles.dpoTitle}>Questions about your Health Privacy Rights?</Text>
          <Text style={styles.dpoSub}>
            Contact our Data Protection Officer (DPO) to request your EHR data export or privacy audit.
          </Text>

          <TouchableOpacity style={styles.dpoBtn} onPress={handleContactDPO} activeOpacity={0.8}>
            <Ionicons name="mail" size={15} color="#FFFFFF" />
            <Text style={styles.dpoBtnText}>Contact Data Protection Officer (DPO)</Text>
          </TouchableOpacity>
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
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  roleTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  scrollBody: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing[4],
    gap: 10,
    ...Shadows.xs,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 14.5,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  heroSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specBadgeText: {
    fontSize: 10.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  lastUpdated: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  sectionCard: {
    padding: Spacing[3],
    gap: 10,
  },
  secTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  bulletsList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    flex: 1,
  },
  dpoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: 8,
    alignItems: 'center',
  },
  dpoTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  dpoSub: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  dpoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  dpoBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
