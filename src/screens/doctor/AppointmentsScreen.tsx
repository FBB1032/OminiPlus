import React, { useState, useCallback, useMemo } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '../../hooks/useDoctor';
import { Avatar, SkeletonList, EmptyState, ErrorState, Button } from '../../components';
import { DoctorAppointmentItem } from '../../components/list-items/DoctorAppointmentItem';
import { useToast, useAuth } from '../../hooks/useAuth';

// ─── Time slot helpers ────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 – 19:00
const MINUTES = ['00', '30'];

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  HOURS.forEach((h) => {
    MINUTES.forEach((m) => {
      const hh = String(h).padStart(2, '0');
      slots.push(`${hh}:${m}`);
    });
  });
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

function getNextDays(count: number): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    days.push({ label, value });
  }
  return days;
}
const NEXT_DAYS = getNextDays(14);

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AppointmentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isCompact = width < 380;

  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const { data: appointmentData, isLoading: _isLoading, isError, refetch } =
    useDoctorAppointments({ status: selectedStatus });
  const showSkeleton = useSkeletonDelay(_isLoading, 150);
  const updateStatusMutation = useUpdateAppointmentStatus();
  const { success: showToastSuccess, error: showToastError } = useToast();

  // ── Optimistic overrides: { [appointmentId]: status | 'rescheduled' } ──────
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [scheduledAtOverrides, setScheduledAtOverrides] = useState<Record<string, string>>({});

  // ── Decline confirmation modal ────────────────────────────────────────────
  const [declineModal, setDeclineModal] = useState<{ visible: boolean; appointmentId: string; patientName: string }>({
    visible: false,
    appointmentId: '',
    patientName: '',
  });

  // ── Reschedule modal ──────────────────────────────────────────────────────
  const [rescheduleModal, setRescheduleModal] = useState<{
    visible: boolean;
    appointmentId: string;
    patientName: string;
    currentDate: string;
  }>({ visible: false, appointmentId: '', patientName: '', currentDate: '' });
  const [rescheduleDate, setRescheduleDate] = useState<string>(NEXT_DAYS[0]?.value ?? '');
  const [rescheduleTime, setRescheduleTime] = useState<string>('09:00');

  const tabletWrap = isTablet ? styles.tabletMaxWrap : undefined;
  const isApproved = user?.isApproved !== false;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const applyOptimisticStatus = useCallback((id: string, status: string) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  }, []);

  const callUpdateStatus = useCallback(
    async (id: string, newStatus: string) => {
      if (!isApproved) {
        showToastError(
          'Verification Required',
          'Your account must be verified before performing scheduling actions.'
        );
        return;
      }
      // Optimistic update first — UI reflects change immediately
      applyOptimisticStatus(id, newStatus);
      try {
        await updateStatusMutation.mutateAsync({ id, status: newStatus });
        showToastSuccess(
          'Updated',
          `Appointment ${newStatus === 'scheduled' ? 'approved' : newStatus}.`
        );
      } catch {
        // Roll back on failure
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        showToastError('Error', 'Failed to update appointment. Please try again.');
      }
    },
    [isApproved, applyOptimisticStatus, updateStatusMutation, showToastSuccess, showToastError]
  );

  // ── Decline flow ──────────────────────────────────────────────────────────

  const openDeclineModal = useCallback((appointmentId: string, patientName: string) => {
    setDeclineModal({ visible: true, appointmentId, patientName });
  }, []);

  const confirmDecline = useCallback(async () => {
    setDeclineModal((m) => ({ ...m, visible: false }));
    await callUpdateStatus(declineModal.appointmentId, 'cancelled');
  }, [declineModal.appointmentId, callUpdateStatus]);

  // ── Reschedule flow ───────────────────────────────────────────────────────

  const openRescheduleModal = useCallback(
    (appointmentId: string, patientName: string, currentScheduledAt: string) => {
      setRescheduleDate(NEXT_DAYS[0]?.value ?? '');
      setRescheduleTime('09:00');
      setRescheduleModal({
        visible: true,
        appointmentId,
        patientName,
        currentDate: new Date(currentScheduledAt).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    },
    []
  );

  const confirmReschedule = useCallback(() => {
    const newIso = `${rescheduleDate}T${rescheduleTime}:00.000Z`;
    setScheduledAtOverrides((prev) => ({
      ...prev,
      [rescheduleModal.appointmentId]: newIso,
    }));
    applyOptimisticStatus(rescheduleModal.appointmentId, 'scheduled');
    setRescheduleModal((m) => ({ ...m, visible: false }));
    showToastSuccess(
      'Rescheduled',
      `New time proposed to ${rescheduleModal.patientName}: ${rescheduleDate} at ${rescheduleTime}`
    );
  }, [rescheduleDate, rescheduleTime, rescheduleModal, applyOptimisticStatus, showToastSuccess]);

  // ── Merge appointments with optimistic overrides ───────────────────────────

  const appointments = useMemo(() => {
    if (!appointmentData?.data) return [];
    return appointmentData.data.map((appt: any) => ({
      ...appt,
      status: statusOverrides[appt.id] ?? appt.status,
      scheduledAt: scheduledAtOverrides[appt.id] ?? appt.scheduledAt,
    }));
  }, [appointmentData, statusOverrides, scheduledAtOverrides]);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderAppointmentItem = useCallback(
    ({ item }: { item: any }) => {
      const patientId: string = item.patientId || item.patient?.id;
      const patientName = `${item.patient?.firstName ?? ''} ${item.patient?.lastName ?? ''}`.trim();

      return (
        <DoctorAppointmentItem
          item={item}
          onPress={() => patientId && navigation.navigate('PatientDetail', { patientId })}
          onDecline={() => openDeclineModal(item.id, patientName)}
          onReschedule={() => openRescheduleModal(item.id, patientName, item.scheduledAt)}
          onApprove={() => callUpdateStatus(item.id, 'scheduled')}
          onComplete={() => callUpdateStatus(item.id, 'completed')}
          onJoinVideo={
            item.type === 'video'
              ? () =>
                  navigation.navigate('VideoConsultation', {
                    appointmentId: item.id,
                    doctorName: `Dr. ${user?.lastName ?? 'Doctor'}`,
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
          approvedDoctor={isApproved}
        />
      );
    },
    [
      navigation, user, isApproved,
      callUpdateStatus, openDeclineModal, openRescheduleModal,
    ]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      {/* ── Pending verification banner ── */}
      {!isApproved && (
        <View style={tabletWrap}>
          <View style={styles.pendingBanner}>
            <Ionicons name="time" size={18} color="#D97706" />
            <Text style={styles.pendingBannerText}>
              Verification Pending — appointment actions are locked until approved.
            </Text>
          </View>
        </View>
      )}

      {/* ── Status filter tabs ── */}
      <View style={[styles.filterWrapper, tabletWrap]}>
        <FlashList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => {
            const active = selectedStatus === item.value;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStatus(item.value)}
                style={[styles.filterTab, active && styles.filterTabActive]}
              >
                <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={80}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {/* ── List ── */}
      {showSkeleton ? (
        <View style={[styles.listContainer, tabletWrap]}>
          <SkeletonList count={4} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} message="Could not load appointments." />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No appointments"
          subtitle="There are no appointments matching this filter."
        />
      ) : (
        <FlashList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={[
            styles.listContainer,
            isTablet && styles.listContainerTablet,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={_isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={340}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DECLINE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={declineModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeclineModal((m) => ({ ...m, visible: false }))}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setDeclineModal((m) => ({ ...m, visible: false }))}
          />
          <View style={styles.modalCard}>
            {/* Icon */}
            <View style={styles.declineIconWrap}>
              <Ionicons name="close-circle" size={40} color="#EF4444" />
            </View>

            <Text style={styles.modalTitle}>Decline Appointment?</Text>
            <Text style={styles.modalSubtitle}>
              You are about to decline the appointment request from{' '}
              <Text style={{ fontWeight: FontWeight.bold }}>{declineModal.patientName}</Text>.{'\n'}
              The patient will be notified immediately.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline]}
                onPress={() => setDeclineModal((m) => ({ ...m, visible: false }))}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnOutlineText}>Keep Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={confirmDecline}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={16} color="#fff" />
                <Text style={styles.modalBtnDangerText}>Yes, Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          RESCHEDULE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={rescheduleModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleModal((m) => ({ ...m, visible: false }))}
        statusBarTranslucent
      >
        <View style={styles.modalOverlayBottom}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setRescheduleModal((m) => ({ ...m, visible: false }))}
          />
          <View style={styles.rescheduleSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.modalTitle}>Reschedule Appointment</Text>
                <Text style={styles.modalSubtitle}>
                  Patient: <Text style={{ fontWeight: FontWeight.bold }}>{rescheduleModal.patientName}</Text>
                  {'\n'}Current: {rescheduleModal.currentDate}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRescheduleModal((m) => ({ ...m, visible: false }))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetBody}
            >
              {/* Date selection */}
              <Text style={styles.pickLabel}>
                <Ionicons name="calendar-outline" size={13} color={Colors.primary[600]} />
                {'  '}Select New Date
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateRow}
              >
                {NEXT_DAYS.map((d) => {
                  const active = rescheduleDate === d.value;
                  return (
                    <TouchableOpacity
                      key={d.value}
                      style={[styles.dateChip, active && styles.dateChipActive]}
                      onPress={() => setRescheduleDate(d.value)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.dateChipText, active && styles.dateChipTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Time selection */}
              <Text style={[styles.pickLabel, { marginTop: Spacing[4] }]}>
                <Ionicons name="time-outline" size={13} color={Colors.primary[600]} />
                {'  '}Select New Time
              </Text>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((t) => {
                  const active = rescheduleTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeChip, active && styles.timeChipActive]}
                      onPress={() => setRescheduleTime(t)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Summary pill */}
              <View style={styles.rescheduleSummary}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.rescheduleSummaryText}>
                  New slot: {rescheduleDate} at {rescheduleTime}
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline, { flex: 1 }]}
                onPress={() => setRescheduleModal((m) => ({ ...m, visible: false }))}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { flex: 1 }]}
                onPress={confirmReschedule}
                activeOpacity={0.8}
              >
                <Ionicons name="send-outline" size={16} color="#fff" />
                <Text style={styles.modalBtnPrimaryText}>Confirm & Notify Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

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
  filterContent: { paddingHorizontal: Spacing[4], gap: Spacing[2] },
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
  filterLabelActive: { color: Colors.text.inverse, fontWeight: FontWeight.bold },

  listContainer: { padding: Spacing[4], flexGrow: 1 },
  listContainerTablet: { maxWidth: 880, alignSelf: 'center', width: '100%' },
  separator: { height: Spacing[4] },
  tabletMaxWrap: { width: '100%', maxWidth: 880, alignSelf: 'center' },

  // ── Shared modal styles ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[5],
  },
  modalOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: Spacing[3],
    ...Shadows.xl,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing[3],
    width: '100%',
    marginTop: Spacing[2],
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    minHeight: 48,
  },
  modalBtnOutline: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalBtnOutlineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  modalBtnDanger: {
    backgroundColor: '#EF4444',
    borderWidth: 0,
  },
  modalBtnDangerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primary[600],
    borderWidth: 0,
  },
  modalBtnPrimaryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    flexShrink: 1,
  },

  // ── Decline icon ───────────────────────────────────────────────────────────
  declineIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },

  // ── Reschedule bottom sheet ────────────────────────────────────────────────
  rescheduleSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    maxHeight: '88%',
    ...Shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing[3],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetBody: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
    gap: Spacing[2],
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: Spacing[3],
    padding: Spacing[5],
    paddingBottom: Platform.OS === 'ios' ? Spacing[8] : Spacing[5],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  pickLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[2],
  },

  // Date chips
  dateRow: { gap: Spacing[2], paddingBottom: Spacing[1] },
  dateChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  dateChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  dateChipTextActive: { color: '#FFFFFF' },

  // Time chips
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  timeChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  timeChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  timeChipTextActive: { color: '#FFFFFF' },

  // Summary
  rescheduleSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: Spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: Spacing[3],
  },
  rescheduleSummaryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: '#065F46',
  },
});
