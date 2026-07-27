import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '../../hooks/useDoctor';
import { Avatar, SkeletonList, EmptyState, ErrorState } from '../../components';
import { useToast, useAuth } from '../../hooks/useAuth';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AppointmentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const { data: appointmentData, isLoading: _isLoading, isError, refetch } = useDoctorAppointments({
    status: selectedStatus,
  });
  const showSkeleton = useSkeletonDelay(_isLoading, 150);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (user?.isApproved === false) {
      showToastError('Verification Required', 'Your clinical account must be verified before you can perform scheduling actions.');
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      showToastSuccess('Success', `Appointment marked as ${newStatus}.`);
      refetch();
    } catch {
      showToastError('Error', 'Failed to update status.');
    }
  };

  const renderAppointmentItem = React.useCallback(({ item }: { item: any }) => {
    const appointmentDate = new Date(item.scheduledAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const appointmentTime = new Date(item.scheduledAt).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PatientDetail', { patientId: item.patientId })}
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
          <View style={[styles.statusBadge, (styles as any)[`statusBadge_${item.status}`]]}>
            <Text style={[styles.statusText, (styles as any)[`statusText_${item.status}`]]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <Text style={styles.reasonLabel}>Reason for visit:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
          {item.notes && (
            <>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </>
          )}
        </View>

        {/* If status is pending, allow doctor to Approve or Decline */}
        {item.status === 'pending' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item.id, 'cancelled')}
              style={[styles.actionBtn, styles.cancelBtn]}
            >
              <Ionicons name="close-circle-outline" size={16} color={Colors.error.main} />
              <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdateStatus(item.id, 'scheduled')}
              style={[styles.actionBtn, styles.completeBtn]}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.text.inverse} />
              <Text style={[styles.actionBtnText, styles.completeBtnText]}>Accept Booking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* If status is scheduled (or approved), show complete/cancel actions and call options */}
        {(item.status === 'scheduled' || item.status === 'approved') && (
          <View style={{ gap: Spacing[2] }}>
            {item.type === 'video' && (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() =>
                  navigation.navigate('VideoConsultation', {
                    appointmentId: item.id,
                    doctorName: `Dr. ${user?.lastName || 'Alabi'}`,
                  })
                }
                activeOpacity={0.7}
              >
                <Ionicons name="videocam" size={16} color="#fff" />
                <Text style={styles.joinBtnText}>Join Video Call</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                style={[styles.actionBtn, styles.cancelBtn]}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.error.main} />
                <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleUpdateStatus(item.id, 'completed')}
                style={[styles.actionBtn, styles.completeBtn]}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.text.inverse} />
                <Text style={[styles.actionBtnText, styles.completeBtnText]}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {item.status === 'completed' && !item.prescription && (
          <TouchableOpacity
            style={styles.prescriptionBtn}
            onPress={() =>
              navigation.navigate('Prescription', {
                appointmentId: item.id,
                patientId: item.patientId,
                mode: 'create',
              })
            }
          >
            <Ionicons name="document-text-outline" size={16} color={Colors.primary[600]} />
            <Text style={styles.prescriptionBtnText}>Write Prescription</Text>
          </TouchableOpacity>
        )}

        {item.prescription && (
          <TouchableOpacity
            style={styles.prescriptionBtnOutline}
            onPress={() =>
              navigation.navigate('Prescription', {
                appointmentId: item.id,
                patientId: item.patientId,
                mode: 'view',
                prescriptionId: item.prescription.id,
              })
            }
          >
            <Ionicons name="eye-outline" size={16} color={Colors.primary[600]} />
            <Text style={styles.prescriptionBtnTextOutline}>View Prescription</Text>
          </TouchableOpacity>
        )}

        {/* Consultation Chat Button */}
        {(item.status === 'pending' || item.status === 'approved' || item.status === 'scheduled' || item.status === 'completed' || item.status === 'cancelled') && (
          <View style={{ marginTop: Spacing[2] }}>
            {(item.status === 'pending') && (
              <TouchableOpacity
                style={[styles.chatBtn, styles.chatBtnLocked]}
                disabled={true}
                activeOpacity={1}
              >
                <Ionicons name="lock-closed-outline" size={16} color={Colors.neutral[400]} />
                <Text style={styles.chatBtnTextLocked}>Chat Locked (Pending Approval)</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'cancelled') && (
              <TouchableOpacity
                style={[styles.chatBtn, styles.chatBtnLocked]}
                disabled={true}
                activeOpacity={1}
              >
                <Ionicons name="lock-closed-outline" size={16} color={Colors.neutral[400]} />
                <Text style={styles.chatBtnTextLocked}>Chat Locked (Cancelled)</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'scheduled' || item.status === 'approved') && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('ConsultationChat', { appointmentId: item.id })}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubbles-outline" size={16} color="#fff" />
                <Text style={styles.chatBtnText}>Open Consultation Chat</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'completed') && (
              <TouchableOpacity
                style={styles.chatBtnOutline}
                onPress={() => navigation.navigate('ConsultationChat', { appointmentId: item.id })}
                activeOpacity={0.8}
              >
                <Ionicons name="archive-outline" size={16} color={Colors.primary[600]} />
                <Text style={styles.chatBtnTextOutline}>View Chat History (Archived)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }, [navigation, handleUpdateStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {user?.isApproved === false && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={18} color="#D97706" />
          <Text style={styles.pendingBannerText}>
            Verification Pending. Modifying appointments is locked.
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <FlashList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isActive = selectedStatus === item.value;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStatus(item.value)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          // @ts-ignore - TS complains but this prop is required by FlashList
          estimatedItemSize={80}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {showSkeleton ? (
        <View style={styles.listContainer}>
          <SkeletonList count={4} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load appointments." />
      ) : !appointmentData || appointmentData.data.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No appointments"
          subtitle="There are no appointments that match this filter."
        />
      ) : (
        <FlashList
          data={appointmentData.data}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          // @ts-ignore - TS complains but this prop is required by FlashList
          estimatedItemSize={250}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  filterWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing[2],
  },
  filterContent: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
  },
  filterTab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  filterLabelActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  listContainer: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  card: {
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
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing[3],
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
  statusBadge_scheduled: { backgroundColor: '#EFF6FF' },
  statusBadge_pending: { backgroundColor: '#FFFBEB' },
  statusBadge_completed: { backgroundColor: '#ECFDF5' },
  statusBadge_cancelled: { backgroundColor: '#FEF2F2' },
  statusText: { fontSize: 10, fontWeight: FontWeight.bold },
  statusText_scheduled: { color: '#3B82F6' },
  statusText_pending: { color: '#D97706' },
  statusText_completed: { color: '#10B981' },
  statusText_cancelled: { color: '#EF4444' },
  cardBody: {
    backgroundColor: Colors.background,
    borderRadius: 12,
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
  },
  notesLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    marginTop: Spacing[2],
  },
  notesText: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  cancelBtn: {
    borderColor: Colors.error.main,
    backgroundColor: Colors.surface,
  },
  cancelBtnText: {
    color: Colors.error.main,
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
  },
  prescriptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary[50],
  },
  prescriptionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  prescriptionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
  },
  prescriptionBtnTextOutline: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  separator: {
    height: Spacing[4],
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: 8,
  },
  pendingBannerText: {
    fontSize: FontSize.xs,
    color: '#B45309',
    fontWeight: FontWeight.semiBold,
    flex: 1,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary[600],
  },
  chatBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
  },
  chatBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
  },
  chatBtnTextOutline: {
    color: Colors.primary[600],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary[600],
  },
  joinBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
