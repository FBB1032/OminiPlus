import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { PATIENT_LEGAL_DOC, DOCTOR_LEGAL_DOC, RoleLegalDoc } from '../../constants/legalTerms';

interface RoleLegalModalProps {
  visible: boolean;
  onClose: () => void;
  role: 'patient' | 'doctor';
  onAccept?: () => void;
}

export function RoleLegalModal({ visible, onClose, role, onAccept }: RoleLegalModalProps) {
  const doc: RoleLegalDoc = role === 'patient' ? PATIENT_LEGAL_DOC : DOCTOR_LEGAL_DOC;
  const isPatient = role === 'patient';

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{doc.title}</Text>
            <Text style={styles.headerSubtitle}>{doc.version}</Text>
          </View>
          <View style={styles.badgeWrap}>
            <View style={[styles.roleBadge, { backgroundColor: isPatient ? '#EFF6FF' : '#F0FDF4', borderColor: isPatient ? '#BFDBFE' : '#BBF7D0' }]}>
              <Ionicons name={isPatient ? 'person' : 'medkit'} size={12} color={isPatient ? '#2563EB' : '#059669'} />
              <Text style={[styles.roleBadgeText, { color: isPatient ? '#2563EB' : '#059669' }]}>
                {isPatient ? 'Patient Only' : 'Doctor Only'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notice Banner */}
        <View style={[styles.noticeBanner, { backgroundColor: isPatient ? '#EFF6FF' : '#F0FDF4', borderColor: isPatient ? '#BFDBFE' : '#BBF7D0' }]}>
          <Ionicons name="shield-checkmark" size={20} color={isPatient ? '#2563EB' : '#059669'} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.noticeTitle, { color: isPatient ? '#1E40AF' : '#065F46' }]}>
              {isPatient ? 'Patient Privacy & Telehealth Protection' : 'Medical Provider Terms & 10% Fee Disclosures'}
            </Text>
            <Text style={[styles.noticeSub, { color: isPatient ? '#1D4ED8' : '#047857' }]}>
              {isPatient
                ? 'These terms govern your telehealth booking, confidential EHR records, and healthcare rights on OminiPulse.'
                : 'These terms govern clinical provider credentialing, 10% platform fee calculations, and 90% payout disbursements.'}
            </Text>
          </View>
        </View>

        {/* Scrollable Terms Content */}
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdatedText}>Last Updated: {doc.lastUpdated} • {doc.version}</Text>

          {doc.sections.map((section, sIdx) => (
            <View key={sIdx} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconCircle, { backgroundColor: isPatient ? '#EFF6FF' : '#E6F4F4' }]}>
                  <Ionicons name={section.icon as any} size={18} color={isPatient ? '#2563EB' : '#0F6E6E'} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <View style={styles.bulletsList}>
                {section.content.map((point, pIdx) => (
                  <View key={pIdx} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: isPatient ? '#2563EB' : '#0F6E6E' }]} />
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Accept Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: isPatient ? Colors.primary[600] : Colors.secondary[600] }]}
            onPress={() => {
              if (onAccept) onAccept();
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.acceptBtnText}>
              I Understand & Accept {isPatient ? 'Patient' : 'Doctor'} Terms
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
    gap: Spacing[3],
  },
  closeBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  badgeWrap: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    margin: Spacing[4],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
  },
  noticeSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  scrollBody: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[4],
  },
  lastUpdatedText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: 10,
    ...Shadows.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
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
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
