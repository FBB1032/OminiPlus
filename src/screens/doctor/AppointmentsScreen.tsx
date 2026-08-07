import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '../../hooks/useDoctor';
import { Avatar, SkeletonList, EmptyState, ErrorState } from '../../components';
import { DoctorAppointmentItem } from '../../components/list-items/DoctorAppointmentItem';
import { useToast, useAuth } from '../../hooks/useAuth';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AppointmentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const { data: appointmentData, isLoading: _isLoading, isError, refetch } = useDoctorAppointments({
    status: selectedStatus,
  });
  const showSkeleton = useSkeletonDelay(_isLoading, 150);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const tabletWrap = isTablet ? styles.tabletMaxWrap : undefined;

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
    const patientId: string = item.patientId || item.patient?.id;
    const patientName = `${item.patient?.firstName || 'patient'}`;

    return (
      <DoctorAppointmentItem
        item={item}
        onPress={() => patientId && navigation.navigate('PatientDetail', { patientId })}
        onDecline={() => handleUpdateStatus(item.id, 'cancelled')}
        onReschedule={() => {
          Alert.alert(
            'Propose Reschedule Time',
            `Propose new consultation slot to ${patientName}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Send Proposed Time',
                onPress: () => {
                  showToastSuccess('Reschedule Sent', 'Proposed new consultation time sent to patient for confirmation.');
                  refetch();
                },
              },
            ]
          );
        }}
        onApprove={() => handleUpdateStatus(item.id, 'scheduled')}
        onComplete={() => handleUpdateStatus(item.id, 'completed')}
        onJoinVideo={
          item.type === 'video'
            ? () =>
                navigation.navigate('VideoConsultation', {
                  appointmentId: item.id,
                  doctorName: `Dr. ${user?.lastName || 'Alabi'}`,
                })
            : undefined
        }
        onWritePrescription={
          !item.prescription
            ? () =>
                navigation.navigate('Prescription', {
                  appointmentId: item.id,
                  patientId,
                  mode: 'create',
                })
            : undefined
        }
        onViewPrescription={
          item.prescription
            ? () =>
                navigation.navigate('Prescription', {
                  appointmentId: item.id,
                  patientId,
                  mode: 'view',
                  prescriptionId: item.prescription.id,
                })
            : undefined
        }
        onChat={() => navigation.navigate('ConsultationChat', { appointmentId: item.id })}
        onViewChatHistory={() =>
          navigation.navigate('ConsultationChat', { appointmentId: item.id })
        }
        approvedDoctor={user?.isApproved !== false}
      />
    );
  }, [navigation, user, handleUpdateStatus, showToastSuccess, refetch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {user?.isApproved === false && (
        <View style={tabletWrap}>
          <View style={styles.pendingBanner}>
            <Ionicons name="time" size={18} color="#D97706" />
            <Text style={styles.pendingBannerText}>
              Verification Pending. Modifying appointments is locked.
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.filterWrapper, tabletWrap && tabletWrap]}>
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
        <View style={[styles.listContainer, tabletWrap && tabletWrap]}>
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
          contentContainerStyle={[
            styles.listContainer,
            tabletWrap && styles.listContainerTablet,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          // @ts-ignore - TS complains but this prop is required by FlashList
          estimatedItemSize={340}
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
    flexShrink: 1,
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
  listContainerTablet: {
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
  },
  separator: {
    height: Spacing[4],
  },
  tabletMaxWrap: {
    width: '100%',
    maxWidth: 880,
    alignSelf: 'center',
  },
});
