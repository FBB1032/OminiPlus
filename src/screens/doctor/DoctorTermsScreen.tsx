import React, { useState } from 'react';
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
import { Card, Button } from '../../components';

export default function DoctorTermsScreen({ navigation, route }: any) {
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isEnd && !hasScrolledBottom) {
      setHasScrolledBottom(true);
    }
  };

  const handleConfirmAccept = () => {
    if (!hasScrolledBottom && !isAccepted) {
      Alert.alert(
        'Please Review Terms',
        'Please scroll down and read the complete Escrow Payment and Penalty clauses before accepting.'
      );
      return;
    }
    setIsAccepted(true);
    Alert.alert(
      'Terms Accepted',
      'You have accepted the OminiPulse Doctor Agreement & Escrow Terms.',
      [{ text: 'Continue', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Agreement & Escrow Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Card style={styles.heroCard}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#059669" />
          <Text style={styles.heroTitle}>OminiPulse Practitioner Escrow & Conduct Terms</Text>
          <Text style={styles.heroSub}>
            Effective August 2026 • Governed by MDCN Ethics & NDPA 2023 Rules
          </Text>
        </Card>

        {/* Section 1: Escrow */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cash-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>1. Payment Escrow & Confirmation Model</Text>
          </View>
          <Text style={styles.bodyText}>
            Patient consultation fees are held in escrow by OminiPulse at booking time. Funds are released to your earnings account ONLY after you formally confirm (approve) the appointment via your schedule dashboard.
          </Text>
        </Card>

        {/* Section 2: Non-performance */}
        <Card style={[styles.sectionCard, styles.alertBorder]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
            <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>
              2. Non-Performance Penalty Clause (CRITICAL)
            </Text>
          </View>
          <Text style={styles.bodyTextBold}>
            Failure to conduct a consultation after formally confirming a booking and holding patient funds in escrow constitutes a serious professional offence.
          </Text>
          <Text style={styles.bodyText}>
            Breaching this condition results in:
            {'\n'}• Immediate indefinite account suspension
            {'\n'}• 100% full refund disbursed to the patient at your expense
            {'\n'}• Formal reporting to the Medical and Dental Council of Nigeria (MDCN) for clinical negligence investigation
          </Text>
        </Card>

        {/* Section 3: MDCN Expiry */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="ribbon-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>3. Mandatory Verification & MDCN Expiry</Text>
          </View>
          <Text style={styles.bodyText}>
            All practitioners must maintain valid credentials across 5 mandatory categories (MDCN License, NIN ID, Specialty Certificate, Employment Letter, Passport Photo). Account access automatically locks upon MDCN license expiry date following a 30-day renewal grace period.
          </Text>
        </Card>

        {/* Section 4: Audit & Confidentiality */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="eye-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>4. Patient Record Auditing & Immutability</Text>
          </View>
          <Text style={styles.bodyText}>
            Every patient record access is permanently recorded in the patient's "Who Viewed My Records" audit trail under NDPA 2023 rules. Signed prescriptions and SOAP notes are immutable and cannot be deleted or altered once submitted.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isAccepted ? 'Terms Accepted ✓' : 'I Agree & Accept Terms'}
          onPress={handleConfirmAccept}
          variant={isAccepted ? 'secondary' : 'primary'}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  heroCard: {
    padding: Spacing[4],
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#065F46',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: FontSize.xs,
    color: '#047857',
    textAlign: 'center',
  },
  sectionCard: {
    padding: Spacing[4],
    gap: Spacing[2],
  },
  alertBorder: {
    borderColor: '#FCA5A5',
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  bodyTextBold: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#991B1B',
    lineHeight: 18,
  },
  bodyText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
