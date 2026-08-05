import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Button } from '../ui/Button';
import { ConsentScope } from '../../types/consent';

interface ConsentModalProps {
  visible: boolean;
  scope: ConsentScope;
  targetName: string;
  onAgree: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  visible,
  scope,
  targetName,
  onAgree,
  onDecline,
}) => {
  let title = 'Explicit Consent Required';
  let statement = `I agree to share my medical history with ${targetName}.`;

  if (scope === 'lab_report') {
    statement = `I agree to share my lab report with ${targetName}.`;
  } else if (scope === 'ai_analysis') {
    statement = `I agree to automated AI health analysis and clinical guidance.`;
  } else if (scope === 'prescription_share') {
    statement = `I agree to share my active prescriptions with ${targetName}.`;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={28} color={Colors.primary[600]} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            In compliance with healthcare data protection standards, your explicit consent is required before accessing or sharing medical records.
          </Text>

          {/* Statement Box */}
          <View style={styles.statementBox}>
            <Ionicons name="checkbox-outline" size={22} color={Colors.secondary[600]} style={{ marginTop: 2 }} />
            <Text style={styles.statementText}>{statement}</Text>
          </View>

          <View style={styles.auditNotice}>
            <Ionicons name="shield-outline" size={16} color={Colors.neutral[500]} />
            <Text style={styles.auditNoticeText}>
              Every access attempt is permanently logged into your unalterable Audit Trail.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onDecline} style={styles.declineBtn}>
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Button label="I Agree & Continue" onPress={onAgree} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing[5],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: Spacing[3],
    ...Shadows.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  statementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing[4],
    gap: Spacing[3],
    marginVertical: Spacing[1],
  },
  statementText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  auditNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  auditNoticeText: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: Spacing[2],
    width: '100%',
  },
  declineBtn: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  declineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
});
