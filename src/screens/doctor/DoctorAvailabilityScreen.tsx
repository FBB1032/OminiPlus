import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { WorkingHours } from '../../types';
import { useDoctorAvailability, useUpdateDoctorAvailability } from '../../hooks/useDoctor';
import { useAuth, useToast } from '../../hooks/useAuth';
import { Button, Card, Divider, SkeletonList, ErrorState, AppModal } from '../../components';
import { storageService } from '../../services/storageService';

const LIVE_STATUS_KEY = 'ominipulse_doctor_live_status';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DAYS: WorkingHours['day'][] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_LABELS: Record<WorkingHours['day'], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DEFAULT_SLOT_DURATIONS = [15, 20, 30, 45, 60];

const DEFAULT_HOURS: WorkingHours[] = ALL_DAYS.map((day) => ({
  day,
  startTime: '09:00',
  endTime: '17:00',
  isActive: !['saturday', 'sunday'].includes(day),
  slotDuration: 30,
}));

// ─── Time Picker ──────────────────────────────────────────────────────────────

const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

interface TimePickerModalProps {
  visible: boolean;
  value: string; // HH:mm
  title: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

const TimePickerModal = ({ visible, value, title, onClose, onConfirm }: TimePickerModalProps) => {
  const [hour, setHour] = useState(value.split(':')[0] ?? '09');
  const [minute, setMinute] = useState(value.split(':')[1] ?? '00');

  useEffect(() => {
    setHour(value.split(':')[0] ?? '09');
    setMinute(value.split(':')[1] ?? '00');
  }, [value, visible]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={title}
      footer={
        <View style={styles.modalFooter}>
          <Button variant="outline" label="Cancel" onPress={onClose} style={styles.flex1} />
          <Button
            variant="primary"
            label="Set Time"
            onPress={() => onConfirm(`${hour}:${minute}`)}
            style={styles.flex1}
          />
        </View>
      }
    >
      <View style={styles.timePickerBody}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeColumnLabel}>Hour</Text>
          <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.timeOption, h === hour && styles.timeOptionActive]}
                onPress={() => setHour(h)}
              >
                <Text style={[styles.timeOptionText, h === hour && styles.timeOptionTextActive]}>
                  {h}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.timeSeparator}>:</Text>

        <View style={styles.timeColumn}>
          <Text style={styles.timeColumnLabel}>Min</Text>
          <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
            {MINUTE_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.timeOption, m === minute && styles.timeOptionActive]}
                onPress={() => setMinute(m)}
              >
                <Text style={[styles.timeOptionText, m === minute && styles.timeOptionTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </AppModal>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DoctorAvailabilityScreen({ navigation }: any) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const isUnverifiedDoctor = isDoctor && ((user as any)?.isVerified === false || (user as any)?.verificationStatus === 'pending' || (user as any)?.isVerified !== true);

  const { success: showSuccess, error: showError } = useToast();
  const { data: serverAvailability, isLoading, isError, refetch } = useDoctorAvailability();
  const updateMutation = useUpdateDoctorAvailability();

  const [schedule, setSchedule] = useState<WorkingHours[]>(DEFAULT_HOURS);
  const [hasChanges, setHasChanges] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'available' | 'busy' | 'offline'>('available');

  // Load live status from storage
  useEffect(() => {
    storageService.get(LIVE_STATUS_KEY).then((val) => {
      if (val === 'busy' || val === 'offline' || val === 'available') {
        setLiveStatus(val as 'available' | 'busy' | 'offline');
      }
    });
  }, []);

  const handleSetLiveStatus = async (status: 'available' | 'busy' | 'offline') => {
    setLiveStatus(status);
    await storageService.set(LIVE_STATUS_KEY, status);
    showSuccess(
      'Status Updated',
      status === 'available'
        ? 'Your status is now Available Now. Patients can see and book you.'
        : status === 'busy'
        ? 'Your status is now Busy. Patients see you are in consultation.'
        : 'Your status is now Offline. No new bookings will show.'
    );
  };

  // Time picker state
  const [timePicker, setTimePicker] = useState<{
    visible: boolean;
    dayIndex: number;
    field: 'startTime' | 'endTime';
    current: string;
  }>({ visible: false, dayIndex: 0, field: 'startTime', current: '09:00' });

  // Merge server data into local state once loaded
  useEffect(() => {
    if (!serverAvailability) return;
    const merged = DEFAULT_HOURS.map((defaultDay) => {
      const server = serverAvailability.find((s) => s.day === defaultDay.day);
      return server ? { ...defaultDay, ...server } : defaultDay;
    });
    setSchedule(merged);
  }, [serverAvailability]);

  const updateDay = useCallback((index: number, patch: Partial<WorkingHours>) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setHasChanges(true);
  }, []);

  const openTimePicker = useCallback(
    (dayIndex: number, field: 'startTime' | 'endTime') => {
      setTimePicker({
        visible: true,
        dayIndex,
        field,
        current: schedule[dayIndex][field],
      });
    },
    [schedule]
  );

  const handleTimeConfirm = useCallback((time: string) => {
    setTimePicker((prev) => {
      updateDay(prev.dayIndex, { [prev.field]: time });
      return { ...prev, visible: false };
    });
  }, [updateDay]);

  const handleSave = async () => {
    // Validate: active days must have start < end
    const invalid = schedule.find((s) => {
      if (!s.isActive) return false;
      return s.startTime >= s.endTime;
    });
    if (invalid) {
      showError(
        'Invalid Time',
        `${DAY_LABELS[invalid.day]}: End time must be after start time.`
      );
      return;
    }

    try {
      await updateMutation.mutateAsync(schedule);
      setHasChanges(false);
      showSuccess('Saved', 'Your availability schedule has been updated.');
    } catch {
      showError('Error', 'Failed to save availability. Please try again.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Schedule',
      'This will restore the default Mon–Fri 9am–5pm schedule. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSchedule(DEFAULT_HOURS);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Availability</Text>
          <View style={styles.placeholder} />
        </View>
        <SkeletonList />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Availability</Text>
          <View style={styles.placeholder} />
        </View>
        <ErrorState onRetry={refetch} message="Could not load your availability schedule." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Availability</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Verification Pending Banner for Unverified Doctors */}
      {isUnverifiedDoctor && (
        <View style={styles.pendingVerificationCard}>
          <View style={styles.pendingHeaderRow}>
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={13} color="#D97706" />
              <Text style={styles.pendingBadgeText}>Verification Pending</Text>
            </View>
            <Ionicons name="lock-closed" size={16} color="#DC2626" />
          </View>
          <Text style={styles.pendingText}>
            Your MDCN License credentials are under review by OminiPulse Compliance Officers. Consultation availability and patient booking slots remain locked until your verification is approved.
          </Text>
        </View>
      )}

      {/* Live Status Selector */}
      <View style={styles.liveStatusCard}>
        <Text style={styles.liveStatusTitle}>Live Consultation Status</Text>
        <Text style={styles.liveStatusSubtitle}>Patients see this on doctor listing and booking screens.</Text>
        <View style={styles.liveStatusRow}>
          {([
            { key: 'available', label: 'Available Now', dotColor: '#0F6E6E', bg: '#E6F4F4', border: '#99D4D4', textColor: '#0F6E6E' },
            { key: 'busy', label: 'Busy', dotColor: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', textColor: '#92400E' },
            { key: 'offline', label: 'Offline', dotColor: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', textColor: '#475569' },
          ] as const).map(({ key, label, dotColor, bg, border, textColor }) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleSetLiveStatus(key)}
              style={[
                styles.liveStatusBtn,
                { backgroundColor: bg, borderColor: border },
                liveStatus === key && styles.liveStatusBtnSelected,
              ]}
            >
              <View style={[styles.liveStatusDot, { backgroundColor: dotColor }]} />
              <Text style={[styles.liveStatusBtnText, { color: textColor }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.primary[600]} />
        <Text style={styles.infoBannerText}>
          Set the days and hours when patients can book appointments with you.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View pointerEvents={isUnverifiedDoctor ? 'none' : 'auto'} style={{ opacity: isUnverifiedDoctor ? 0.55 : 1, gap: Spacing[4] }}>
          {schedule.map((daySchedule, index) => (
            <Card key={daySchedule.day} style={styles.dayCard}>
              {/* Day Toggle Row */}
              <View style={styles.dayHeaderRow}>
                <View style={styles.dayLeft}>
                  <View
                    style={[
                      styles.dayIndicator,
                      { backgroundColor: daySchedule.isActive ? Colors.primary[500] : Colors.neutral[300] },
                    ]}
                  />
                  <Text style={[styles.dayLabel, !daySchedule.isActive && styles.dayLabelInactive]}>
                    {DAY_LABELS[daySchedule.day]}
                  </Text>
                </View>
                <Switch
                  value={daySchedule.isActive}
                  onValueChange={(val) => updateDay(index, { isActive: val })}
                  disabled={isUnverifiedDoctor}
                  trackColor={{ false: Colors.neutral[200], true: Colors.primary[200] }}
                  thumbColor={daySchedule.isActive ? Colors.primary[600] : Colors.neutral[400]}
                />
              </View>

              {daySchedule.isActive && (
                <>
                  <Divider spacing={3} />

                  {/* Time Slots */}
                  <View style={styles.timeRow}>
                    {/* Start Time */}
                    <TouchableOpacity
                      style={styles.timeBtn}
                      onPress={() => openTimePicker(index, 'startTime')}
                      disabled={isUnverifiedDoctor}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={14} color={Colors.primary[600]} />
                      <View>
                        <Text style={styles.timeBtnLabel}>From</Text>
                        <Text style={styles.timeBtnValue}>{formatTime(daySchedule.startTime)}</Text>
                      </View>
                    </TouchableOpacity>

                    <Ionicons name="arrow-forward" size={16} color={Colors.neutral[400]} />

                    {/* End Time */}
                    <TouchableOpacity
                      style={styles.timeBtn}
                      onPress={() => openTimePicker(index, 'endTime')}
                      disabled={isUnverifiedDoctor}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={14} color={Colors.secondary[600]} />
                      <View>
                        <Text style={styles.timeBtnLabel}>To</Text>
                        <Text style={styles.timeBtnValue}>{formatTime(daySchedule.endTime)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <Divider spacing={3} />

                  {/* Slot Duration */}
                  <View style={styles.slotDurationRow}>
                    <Text style={styles.slotDurationLabel}>Slot Duration</Text>
                    <View style={styles.slotDurationPills}>
                      {DEFAULT_SLOT_DURATIONS.map((dur) => (
                        <TouchableOpacity
                          key={dur}
                          style={[
                            styles.durationPill,
                            (daySchedule.slotDuration ?? 30) === dur && styles.durationPillActive,
                          ]}
                          disabled={isUnverifiedDoctor}
                          onPress={() => updateDay(index, { slotDuration: dur })}
                        >
                          <Text
                            style={[
                              styles.durationPillText,
                              (daySchedule.slotDuration ?? 30) === dur &&
                                styles.durationPillTextActive,
                            ]}
                          >
                            {dur}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Computed slots count */}
                  {(() => {
                    const [sh, sm] = daySchedule.startTime.split(':').map(Number);
                    const [eh, em] = daySchedule.endTime.split(':').map(Number);
                    const totalMins = (eh * 60 + em) - (sh * 60 + sm);
                    const dur = daySchedule.slotDuration ?? 30;
                    const slots = totalMins > 0 ? Math.floor(totalMins / dur) : 0;
                    return (
                      <Text style={styles.slotsCount}>
                        {slots > 0
                          ? `${slots} appointment slot${slots !== 1 ? 's' : ''} available`
                          : 'End time must be after start time'}
                      </Text>
                    );
                  })()}
                </>
              )}
            </Card>
          ))}

          {/* Save Button */}
          <Button
            label={isUnverifiedDoctor ? 'Verification Pending — Locked' : updateMutation.isPending ? 'Saving...' : 'Save Availability'}
            onPress={handleSave}
            isLoading={updateMutation.isPending}
            disabled={isUnverifiedDoctor || !hasChanges || updateMutation.isPending}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePicker.visible}
        value={timePicker.current}
        title={`Set ${timePicker.field === 'startTime' ? 'Start' : 'End'} Time — ${
          DAY_LABELS[schedule[timePicker.dayIndex]?.day ?? 'monday']
        }`}
        onClose={() => setTimePicker((p) => ({ ...p, visible: false }))}
        onConfirm={handleTimeConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { padding: Spacing[1] },
  resetBtn: { padding: Spacing[1] },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: { width: 28 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[100],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  infoBannerText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    lineHeight: 16,
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[3],
    paddingBottom: Spacing[10],
  },
  dayCard: { padding: Spacing[4] },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  dayIndicator: { width: 10, height: 10, borderRadius: 5 },
  dayLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  dayLabelInactive: { color: Colors.text.disabled },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    justifyContent: 'space-between',
  },
  timeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
  },
  timeBtnLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  timeBtnValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  slotDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  slotDurationLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.semiBold,
  },
  slotDurationPills: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  durationPill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  durationPillActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  durationPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  durationPillTextActive: { color: '#FFFFFF' },
  slotsCount: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing[2],
    fontStyle: 'italic',
  },
  saveBtn: { marginTop: Spacing[2] },
  // Time picker modal
  modalFooter: { flexDirection: 'row', gap: Spacing[3] },
  flex1: { flex: 1 },
  timePickerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[3],
  },
  timeColumn: { alignItems: 'center', flex: 1 },
  timeColumnLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  timeScroll: { maxHeight: 180 },
  timeOption: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 2,
  },
  timeOptionActive: { backgroundColor: Colors.primary[600] },
  timeOptionText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  timeOptionTextActive: { color: '#FFFFFF', fontWeight: FontWeight.bold },
  timeSeparator: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    marginTop: 24,
  },
  pendingVerificationCard: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: 6,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#B45309',
  },
  pendingText: {
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  liveStatusCard: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  liveStatusTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  liveStatusSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: -8,
  },
  liveStatusRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  liveStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2],
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  liveStatusBtnSelected: {
    borderWidth: 2,
  },
  liveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveStatusBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
