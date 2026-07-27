import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';

export interface DoctorAppointmentItemData {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  scheduledAt: string;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  hasPrescription?: boolean;
}

interface DoctorAppointmentItemProps {
  item: DoctorAppointmentItemData;
  onPress: () => void;
  onUpdateStatus?: (status: string) => void;
  onWritePrescription?: () => void;
  onViewPrescription?: () => void;
  showActions?: boolean;
  containerStyle?: ViewStyle;
}

const statusColors = {
  scheduled: { bg: Colors.status.scheduled, text: Colors.status.scheduledText },
  pending: { bg: Colors.status.pending, text: Colors.status.pendingText },
  completed: { bg: Colors.status.completed, text: Colors.status.completedText },
  cancelled: { bg: Colors.status.cancelled, text: Colors.status.cancelledText },
  no_show: { bg: Colors.status.cancelled, text: Colors.status.cancelledText },
};

export const DoctorAppointmentItem = memo<DoctorAppointmentItemProps>(({
  item,
  onPress,
  onUpdateStatus,
  onWritePrescription,
  onViewPrescription,
  showActions = false,
  containerStyle,
}) => {
  const appointmentDate = new Date(item.scheduledAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const appointmentTime = new Date(item.scheduledAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColor = statusColors[item.status];

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.cardHeader}
      >
        <Avatar
          name={`${item.patient.firstName} ${item.patient.lastName}`}
          uri={item.patient.avatarUrl}
          size="md"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.patientName}>
            {item.patient.firstName} {item.patient.lastName}
          </Text>
          <Text style={styles.dateTime}>
            {appointmentDate} at {appointmentTime}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <Text style={styles.reasonLabel}>Reason for visit:</Text>
        <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>

        {item.notes && (
          <>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
          </>
        )}
      </View>

      {showActions && item.status === 'scheduled' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => onUpdateStatus?.('cancelled')}
            style={[styles.actionBtn, styles.cancelBtn]}
          >
            <Ionicons name="close-circle-outline" size={16} color={Colors.error.main} />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onUpdateStatus?.('completed')}
            style={[styles.actionBtn, styles.completeBtn]}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success.main} />
            <Text style={styles.completeBtnText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {showActions && (
        <View style={styles.prescriptionRow}>
          {!item.hasPrescription ? (
            <TouchableOpacity
              onPress={onWritePrescription}
              style={styles.prescriptionBtn}
            >
              <Ionicons name="add-circle-outline" size={16} color={Colors.text.inverse} />
              <Text style={styles.prescriptionBtnText}>Write Prescription</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onViewPrescription}
              style={[styles.prescriptionBtn, styles.prescriptionBtnOutline]}
            >
              <Ionicons name="eye-outline" size={16} color={Colors.primary[600]} />
              <Text style={styles.prescriptionBtnTextOutline}>View Prescription</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

DoctorAppointmentItem.displayName = 'DoctorAppointmentItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing[4],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  dateTime: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  cardBody: {
    gap: Spacing[2],
  },
  reasonLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: FontSize.sm * 1.4,
  },
  notesLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  notesText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: FontSize.sm * 1.4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtn: {
    backgroundColor: Colors.error.light,
    borderColor: Colors.error.main,
  },
  cancelBtnText: {
    color: Colors.error.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  completeBtn: {
    backgroundColor: Colors.success.light,
    borderColor: Colors.success.main,
  },
  completeBtnText: {
    color: Colors.success.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  prescriptionRow: {
    marginTop: Spacing[2],
  },
  prescriptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing[2],
    borderRadius: 8,
  },
  prescriptionBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  prescriptionBtnOutline: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  prescriptionBtnTextOutline: {
    color: Colors.primary[600],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
});
