import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge } from '../index';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';

export interface PatientAppointmentItemData {
  id: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
    avatarUrl?: string;
  };
  scheduledAt: string;
  type: 'in_person' | 'video' | 'phone';
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
}

interface PatientAppointmentItemProps {
  item: PatientAppointmentItemData;
  onPress: () => void;
  onCancel?: () => void;
  onJoinVideo?: () => void;
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

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  video: 'videocam-outline',
  in_person: 'location-outline',
  phone: 'call-outline',
};

export const PatientAppointmentItem = memo<PatientAppointmentItemProps>(({
  item,
  onPress,
  onCancel,
  onJoinVideo,
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

  const isUpcoming = item.status === 'scheduled' || item.status === 'pending';
  const statusColor = statusColors[item.status];

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.cardHeader}>
        <Avatar
          name={`Dr. ${item.doctor.lastName}`}
          uri={item.doctor.avatarUrl}
          size="md"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.doctorName}>
            Dr. {item.doctor.firstName} {item.doctor.lastName}
          </Text>
          <Text style={styles.specialization}>{item.doctor.specialization}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.metaInfo}>
            <Ionicons name="calendar-outline" size={16} color={Colors.neutral[400]} />
            <Text style={styles.metaText}>{appointmentDate}</Text>
          </View>
          <View style={styles.metaInfo}>
            <Ionicons name="time-outline" size={16} color={Colors.neutral[400]} />
            <Text style={styles.metaText}>{appointmentTime}</Text>
          </View>
          <View style={styles.metaInfo}>
            <Ionicons name={typeIcons[item.type]} size={16} color={Colors.neutral[400]} />
            <Text style={styles.metaText}>{item.type.replace('_', ' ')}</Text>
          </View>
        </View>

        <Text style={styles.reasonLabel}>Reason:</Text>
        <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>
      </View>

      {showActions && isUpcoming && (
        <View style={styles.actionRow}>
          {item.type === 'video' && onJoinVideo && (
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={onJoinVideo}
            >
              <Ionicons name="videocam-outline" size={16} color={Colors.text.inverse} />
              <Text style={styles.joinBtnText}>Join Call</Text>
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
            >
              <Ionicons name="close-outline" size={16} color={Colors.error.main} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

PatientAppointmentItem.displayName = 'PatientAppointmentItem';

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
  doctorName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  specialization: {
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
  metaRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  reasonLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: FontSize.sm * 1.4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing[2],
    borderRadius: 8,
  },
  joinBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.error.light,
    paddingVertical: Spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error.main,
  },
  cancelBtnText: {
    color: Colors.error.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
});
