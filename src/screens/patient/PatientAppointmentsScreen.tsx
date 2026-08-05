import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { usePatientAppointments, useCancelAppointment } from '../../hooks/usePatient';
import { Avatar, SkeletonList, EmptyState, ErrorState } from '../../components';
import { useToast } from '../../hooks/useAuth';

type TabType = 'upcoming' | 'history';

export default function PatientAppointmentsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { data: appointmentsResponse, isLoading: _isLoading, isError, refetch } = usePatientAppointments();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);
  const cancelMutation = useCancelAppointment();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const handleCancelAppointment = (id: string, isDoctorApproved?: boolean) => {
    const title = isDoctorApproved === false || isDoctorApproved === undefined
      ? 'Free Cancellation (Pre-Approval)'
      : 'Cancel Appointment';

    const message = isDoctorApproved === false || isDoctorApproved === undefined
      ? 'This appointment has not been confirmed by the doctor yet. You are entitled to an instant 100% full refund to your payment account under OminiPulse Escrow terms.'
      : 'Doctor has confirmed this booking. Cancellations >24h receive 100% refund, 6–24h receive 50% refund, and <6h are non-refundable.';

    Alert.alert(title, message, [
      { text: 'Keep Appointment', style: 'cancel' },
      {
        text: 'Confirm Cancellation',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation.mutateAsync(id);
            showToastSuccess('Appointment Cancelled', 'Your cancellation was processed and escrow refund initiated.');
            refetch();
          } catch {
            showToastError('Error', 'Could not cancel appointment. Try again.');
          }
        },
      },
    ]);
  };

  // Filter items locally based on tab
  const filteredAppointments = React.useMemo(() => {
    if (!appointmentsResponse || !appointmentsResponse.data) return [];
    
    return appointmentsResponse.data.filter((appt) => {
      const isPendingOrScheduled = appt.status === 'scheduled' || appt.status === 'pending';
      return activeTab === 'upcoming' ? isPendingOrScheduled : !isPendingOrScheduled;
    });
  }, [appointmentsResponse, activeTab]);

  const renderAppointmentItem = ({ item }: { item: any }) => {
    const apptDate = new Date(item.scheduledAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const apptTime = new Date(item.scheduledAt).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isUpcoming = item.status === 'scheduled' || item.status === 'pending';

    return (
      <View style={styles.card}>
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
          <View style={[styles.statusBadge, (styles as any)[`statusBadge_${item.status}`]]}>
            <Text style={[styles.statusText, (styles as any)[`statusText_${item.status}`]]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.metaInfo}>
              <Ionicons name="calendar-outline" size={16} color={Colors.neutral[400]} />
              <Text style={styles.metaText}>{apptDate}</Text>
            </View>
            <View style={styles.metaInfo}>
              <Ionicons name="time-outline" size={16} color={Colors.neutral[400]} />
              <Text style={styles.metaText}>{apptTime}</Text>
            </View>
          </View>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>

        {isUpcoming && item.status === 'scheduled' && (
          <View style={styles.actionRow}>
            {item.type === 'video' && (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => navigation.navigate('VideoConsultation', {
                  appointmentId: item.id,
                  doctorName: `Dr. ${item.doctor.firstName} ${item.doctor.lastName}`
                })}
                activeOpacity={0.7}
              >
                <Ionicons name="videocam" size={16} color="#fff" />
                <Text style={styles.joinBtnText}>Join Video Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.cancelBtn, { flex: 1, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
              onPress={() => navigation.navigate('BookAppointment', { doctorId: item.doctorId })}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar" size={16} color="#2563EB" />
              <Text style={[styles.cancelBtnText, { color: '#2563EB' }]} numberOfLines={1}>
                Reschedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { flex: 1 }]}
              onPress={() => handleCancelAppointment(item.id, item.isDoctorApproved)}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={16} color={Colors.error.main} />
              <Text style={styles.cancelBtnText} numberOfLines={1}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
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
                <Ionicons name="archive-outline" size={16} color={Colors.secondary[600]} />
                <Text style={styles.chatBtnTextOutline}>View Chat History (Archived)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      {/* Tab Selectors */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabLabel, activeTab === 'upcoming' && styles.tabLabelActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {showSkeleton ? (
        <View style={styles.listContainer}>
          <SkeletonList count={4} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load appointments." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={activeTab === 'upcoming' ? 'No upcoming visits' : 'No past visits'}
          subtitle={
            activeTab === 'upcoming'
              ? "You don't have any appointments scheduled."
              : "You haven't completed any visits yet."
          }
        />
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.secondary[600],
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  tabLabelActive: {
    color: Colors.secondary[600],
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
  metaRow: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
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
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.error.main,
    backgroundColor: Colors.surface,
  },
  cancelBtnText: {
    color: Colors.error.main,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.secondary[600],
  },
  joinBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  separator: {
    height: Spacing[4],
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.secondary[600],
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
    borderColor: Colors.secondary[600],
  },
  chatBtnTextOutline: {
    color: Colors.secondary[600],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
