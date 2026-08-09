import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';

export interface DoctorAppointmentItemData {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  patientId?: string;
  scheduledAt: string;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'no_show' | string;
  reason: string;
  notes?: string;
  hasPrescription?: boolean;
  prescription?: { id: string };
  type?: 'video' | 'in_person' | 'phone' | 'chat';
  fee?: number;
}

interface DoctorAppointmentItemProps {
  item: DoctorAppointmentItemData;
  onPress?: () => void;
  onDecline?: () => void;
  onReschedule?: () => void;
  onApprove?: () => void;
  onComplete?: () => void;
  onJoinVideo?: () => void;
  onWritePrescription?: () => void;
  onViewPrescription?: () => void;
  onChat?: () => void;
  onViewChatHistory?: () => void;
  onUpdateStatus?: (status: string) => void;
  showActions?: boolean;
  approvedDoctor?: boolean;
  containerStyle?: ViewStyle;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: Colors.status.scheduled, text: Colors.status.scheduledText },
  pending: { bg: Colors.status.pending, text: Colors.status.pendingText },
  completed: { bg: Colors.status.completed, text: Colors.status.completedText },
  cancelled: { bg: Colors.status.cancelled, text: Colors.status.cancelledText },
  no_show: { bg: Colors.status.cancelled, text: Colors.status.cancelledText },
  approved: { bg: Colors.status.scheduled, text: Colors.status.scheduledText },
};

export const DoctorAppointmentItem = memo<DoctorAppointmentItemProps>(({
  item,
  onPress,
  onDecline,
  onReschedule,
  onApprove,
  onComplete,
  onJoinVideo,
  onWritePrescription,
  onViewPrescription,
  onChat,
  onViewChatHistory,
  showActions = true,
  approvedDoctor = true,
  containerStyle,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const appointmentDate = new Date(item.scheduledAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const appointmentTime = new Date(item.scheduledAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColor = statusColors[item.status] || statusColors.pending;
  const hasPrescription = !!item.prescription || !!item.hasPrescription;

  const isPending = item.status === 'pending';
  const isScheduled = item.status === 'scheduled' || item.status === 'approved';
  const isCompleted = item.status === 'completed';
  const isCancelled = item.status === 'cancelled';

  // Format badge configuration
  const getFormatConfig = () => {
    switch (item.type) {
      case 'video':
        return { icon: 'videocam', label: 'Video', color: '#DC2626', bg: '#FEF2F2' };
      case 'in_person':
        return { icon: 'person', label: 'In Person', color: '#059669', bg: '#F0FDF4' };
      case 'phone':
        return { icon: 'call', label: 'Audio', color: '#2563EB', bg: '#EFF6FF' };
      case 'chat':
        return { icon: 'chatbubble', label: 'Chat', color: '#7C3AED', bg: '#F5F3FF' };
      default:
        return { icon: 'calendar', label: 'Appt', color: '#64748B', bg: '#F8FAFC' };
    }
  };

  const formatConfig = getFormatConfig();

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.cardHeader}
        accessibilityRole="button"
        accessibilityLabel={`Appointment with ${item.patient.firstName} ${item.patient.lastName}`}
        accessibilityHint="Tap to view patient details"
      >
        <Avatar
          name={`${item.patient.firstName} ${item.patient.lastName}`}
          uri={item.patient.avatarUrl}
          size="md"
        />
        <View style={styles.headerInfo}>
          <Text
            style={styles.patientName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.patient.firstName} {item.patient.lastName}
          </Text>
          <View style={styles.headerMetaRow}>
            <Text
              style={styles.dateTime}
              numberOfLines={1}
            >
              {appointmentDate} at {appointmentTime}
            </Text>
            {/* Format Badge */}
            {item.type && (
              <View style={[styles.formatBadge, { backgroundColor: formatConfig.bg }]}>
                <Ionicons name={formatConfig.icon as any} size={12} color={formatConfig.color} />
                <Text style={[styles.formatBadgeText, { color: formatConfig.color }]}>
                  {formatConfig.label}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text
              style={[styles.statusText, { color: statusColor.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {String(item.status).toUpperCase()}
            </Text>
          </View>
          {/* Fee Display */}
          {item.fee && (
            <Text style={styles.feeText}>
              ₦{item.fee.toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <Text style={styles.reasonLabel}>Reason for visit:</Text>
        <Text
          style={styles.reasonText}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {item.reason}
        </Text>
        {item.notes && (
          <>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text
              style={styles.notesText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {item.notes}
            </Text>
          </>
        )}
      </View>

      {showActions && isPending && (
        <View style={styles.actionsRowWrap}>
          <TouchableOpacity
            onPress={onDecline}
            disabled={!approvedDoctor}
            style={[styles.actionBtn, styles.cancelBtn, !approvedDoctor && styles.btnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={isCompact ? 'Decline appointment' : undefined}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="close-circle-outline" size={16} color={Colors.error.main} />
            {!isCompact && (
              <Text
                style={[styles.actionBtnText, styles.cancelBtnText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Decline
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onReschedule}
            disabled={!approvedDoctor}
            style={[styles.actionBtn, styles.rescheduleBtn, !approvedDoctor && styles.btnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={isCompact ? 'Reschedule appointment' : undefined}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            {!isCompact && (
              <Text
                style={[styles.actionBtnText, styles.rescheduleBtnText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Reschedule
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onApprove}
            disabled={!approvedDoctor}
            style={[styles.actionBtn, styles.completeBtn, !approvedDoctor && styles.btnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={isCompact ? 'Approve appointment' : undefined}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.text.inverse} />
            {!isCompact && (
              <Text
                style={[styles.actionBtnText, styles.completeBtnText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Approve
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {showActions && isScheduled && (
        <View style={styles.verticalActionGroup}>
          {item.type === 'video' && (
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={onJoinVideo}
              disabled={!approvedDoctor}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Join video call"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="videocam" size={16} color="#fff" />
              <Text
                style={styles.joinBtnText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Join Video Call
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionsRowWrap}>
            <TouchableOpacity
              onPress={onDecline}
              disabled={!approvedDoctor}
              style={[styles.actionBtn, styles.cancelBtn, !approvedDoctor && styles.btnDisabled]}
              accessibilityRole="button"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="close-circle-outline" size={16} color={Colors.error.main} />
              <Text
                style={[styles.actionBtnText, styles.cancelBtnText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {isCompact ? 'Cancel' : 'Decline / Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onReschedule}
              disabled={!approvedDoctor}
              style={[styles.actionBtn, styles.rescheduleBtn, !approvedDoctor && styles.btnDisabled]}
              accessibilityRole="button"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="calendar-outline" size={16} color="#2563EB" />
              {!isCompact && (
                <Text
                  style={[styles.actionBtnText, styles.rescheduleBtnText]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  Reschedule
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onComplete}
              disabled={!approvedDoctor}
              style={[styles.actionBtn, styles.completeBtn, !approvedDoctor && styles.btnDisabled]}
              accessibilityRole="button"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.text.inverse} />
              <Text
                style={[styles.actionBtnText, styles.completeBtnText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {isCompact ? 'Done' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showActions && isCompleted && !hasPrescription && (
        <TouchableOpacity
          style={styles.prescriptionBtn}
          onPress={onWritePrescription}
          disabled={!approvedDoctor}
          accessibilityRole="button"
          accessibilityLabel="Write prescription"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="document-text-outline" size={16} color={Colors.primary[600]} />
          <Text
            style={styles.prescriptionBtnText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Write Prescription
          </Text>
        </TouchableOpacity>
      )}

      {showActions && hasPrescription && (
        <TouchableOpacity
          style={styles.prescriptionBtnOutline}
          onPress={onViewPrescription}
          accessibilityRole="button"
          accessibilityLabel="View prescription"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="eye-outline" size={16} color={Colors.primary[600]} />
          <Text
            style={styles.prescriptionBtnTextOutline}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            View Prescription
          </Text>
        </TouchableOpacity>
      )}

      {showActions && (isPending || isScheduled || isCompleted || isCancelled) && (
        <View style={styles.chatRow}>
          {isPending && (
            <TouchableOpacity
              style={[styles.chatBtn, styles.chatBtnLocked]}
              disabled={true}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Chat locked pending approval"
            >
              <Ionicons name="lock-closed-outline" size={16} color={Colors.neutral[400]} />
              <Text
                style={styles.chatBtnTextLocked}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                Chat Locked (Pending Approval)
              </Text>
            </TouchableOpacity>
          )}
          {isCancelled && (
            <TouchableOpacity
              style={[styles.chatBtn, styles.chatBtnLocked]}
              disabled={true}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Chat locked cancelled"
            >
              <Ionicons name="lock-closed-outline" size={16} color={Colors.neutral[400]} />
              <Text
                style={styles.chatBtnTextLocked}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                Chat Locked (Cancelled)
              </Text>
            </TouchableOpacity>
          )}
          {isScheduled && (
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={onChat}
              disabled={!approvedDoctor}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open consultation chat"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="chatbubbles-outline" size={16} color="#fff" />
              <Text
                style={styles.chatBtnText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Open Consultation Chat
              </Text>
            </TouchableOpacity>
          )}
          {isCompleted && (
            <TouchableOpacity
              style={styles.chatBtnOutline}
              onPress={onViewChatHistory}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View chat history"
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="archive-outline" size={16} color={Colors.primary[600]} />
              <Text
                style={styles.chatBtnTextOutline}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                View Chat History (Archived)
              </Text>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    gap: Spacing[3],
    overflow: 'hidden',
    ...Shadows.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  headerInfo: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  dateTime: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    flexShrink: 1,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  formatBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
    maxWidth: 110,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  feeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700] ?? Colors.primary[600],
  },
  cardBody: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    gap: 4,
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
  verticalActionGroup: {
    gap: Spacing[2],
  },
  actionsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  actionBtn: {
    flex: 1,
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minHeight: 48,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  cancelBtn: {
    borderColor: Colors.error.main,
    backgroundColor: Colors.surface,
  },
  cancelBtnText: {
    color: Colors.error.main,
  },
  rescheduleBtn: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  rescheduleBtnText: {
    color: '#2563EB',
  },
  completeBtn: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[600],
  },
  completeBtnText: {
    color: Colors.text.inverse,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[600],
    minHeight: 48,
  },
  joinBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
  prescriptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    minHeight: 48,
  },
  prescriptionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
    flexShrink: 1,
  },
  prescriptionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
    minHeight: 48,
  },
  prescriptionBtnTextOutline: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
    flexShrink: 1,
  },
  chatRow: {
    marginTop: 0,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[600],
    minHeight: 48,
  },
  chatBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
  chatBtnLocked: {
    backgroundColor: Colors.neutral[200],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  chatBtnTextLocked: {
    color: Colors.neutral[400],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
  chatBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
    minHeight: 48,
  },
  chatBtnTextOutline: {
    color: Colors.primary[600],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    flexShrink: 1,
  },
});
