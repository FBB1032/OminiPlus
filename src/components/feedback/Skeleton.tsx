import * as React from 'react';
import { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
  key?: React.Key;
}

export const SkeletonBox = memo<SkeletonBoxProps>(({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
});

SkeletonBox.displayName = 'SkeletonBox';

/** A skeleton card mimicking a list item */
export const SkeletonCard = memo(() => (
  <View style={styles.card}>
    <SkeletonBox width={44} height={44} borderRadius={22} />
    <View style={styles.cardBody}>
      <SkeletonBox width="65%" height={14} />
      <SkeletonBox width="45%" height={12} style={{ marginTop: 6 }} />
      <SkeletonBox width="30%" height={10} style={{ marginTop: 6 }} />
    </View>
    <SkeletonBox width={60} height={24} borderRadius={BorderRadius.full} />
  </View>
));

SkeletonCard.displayName = 'SkeletonCard';

/** A full-page skeleton list of N cards */
export const SkeletonList = memo<{ count?: number }>(({ count = 6 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
));

SkeletonList.displayName = 'SkeletonList';

/** Dashboard grid skeleton */
export const SkeletonDashboard = memo(() => (
  <View style={styles.dashboard}>
    {/* Header */}
    <View style={styles.dashboardHeader}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width="60%" height={18} />
        <SkeletonBox width="40%" height={13} />
      </View>
    </View>
    {/* Stats row */}
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statCard}>
          <SkeletonBox width="70%" height={28} />
          <SkeletonBox width="90%" height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
    {/* Section title */}
    <SkeletonBox width="50%" height={18} style={{ marginTop: Spacing[4] }} />
    {/* List */}
    {[1, 2, 3].map((i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
));

SkeletonDashboard.displayName = 'SkeletonDashboard';

/** Detail page skeleton */
export const SkeletonDetail = memo(() => (
  <View style={styles.detail}>
    <View style={styles.detailHeader}>
      <SkeletonBox width={72} height={72} borderRadius={36} />
      <View style={{ gap: 8, flex: 1 }}>
        <SkeletonBox width="70%" height={20} />
        <SkeletonBox width="50%" height={14} />
        <SkeletonBox width="40%" height={24} borderRadius={BorderRadius.full} />
      </View>
    </View>
    <View style={{ gap: Spacing[3], marginTop: Spacing[4] }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ gap: 6 }}>
          <SkeletonBox width="35%" height={12} />
          <SkeletonBox width="80%" height={16} />
        </View>
      ))}
    </View>
  </View>
));

SkeletonDetail.displayName = 'SkeletonDetail';

// ─── NEW SCREEN-SPECIFIC SKELETONS ────────────────────────────────────────────

/** Patient Home full-page skeleton mirroring the real home layout */
export const SkeletonHomePage = memo(() => (
  <View style={styles.homeContainer}>
    {/* Search bar */}
    <SkeletonBox width="100%" height={44} borderRadius={12} style={{ marginBottom: Spacing[5] }} />

    {/* Appointment banner */}
    <SkeletonBox width="100%" height={130} borderRadius={20} style={{ marginBottom: Spacing[6] }} />

    {/* Vitals section */}
    <View style={{ gap: Spacing[3], marginBottom: Spacing[6] }}>
      <SkeletonBox width="35%" height={16} />
      <View style={styles.homeVitalsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.homeVitalCard}>
            <SkeletonBox width={28} height={28} borderRadius={8} />
            <SkeletonBox width="60%" height={20} style={{ marginTop: 8 }} />
            <SkeletonBox width="40%" height={11} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
    </View>

    {/* Quick Actions */}
    <View style={{ gap: Spacing[3], marginBottom: Spacing[6] }}>
      <SkeletonBox width="40%" height={16} />
      <View style={styles.homeActionsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.homeActionItem}>
            <SkeletonBox width={54} height={54} borderRadius={18} />
            <SkeletonBox width={42} height={10} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>

    {/* Specialities */}
    <View style={{ gap: Spacing[3], marginBottom: Spacing[6] }}>
      <SkeletonBox width="35%" height={16} />
      <View style={styles.homeSpecRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.homeSpecItem}>
            <SkeletonBox width={56} height={56} borderRadius={18} />
            <SkeletonBox width={48} height={10} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>

    {/* Top Doctors */}
    <View style={{ gap: Spacing[3] }}>
      <SkeletonBox width="35%" height={16} />
      <View style={styles.homeDoctorRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.homeDoctorCard}>
            <SkeletonBox width={56} height={56} borderRadius={28} />
            <SkeletonBox width="75%" height={13} style={{ marginTop: 8 }} />
            <SkeletonBox width="55%" height={10} style={{ marginTop: 5 }} />
            <SkeletonBox width="50%" height={10} style={{ marginTop: 5 }} />
          </View>
        ))}
      </View>
    </View>
  </View>
));

SkeletonHomePage.displayName = 'SkeletonHomePage';

/** Doctor Dashboard full-page skeleton */
export const SkeletonDoctorDashboard = memo(() => (
  <View style={styles.dashContainer}>
    {/* Stats 2×2 grid */}
    <View style={styles.dashStatsGrid}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.dashStatCard}>
          <SkeletonBox width={36} height={36} borderRadius={10} />
          <SkeletonBox width="55%" height={22} style={{ marginTop: 8 }} />
          <SkeletonBox width="80%" height={11} style={{ marginTop: 5 }} />
        </View>
      ))}
    </View>

    {/* Today's Appointments */}
    <View style={{ gap: Spacing[3], marginTop: Spacing[4] }}>
      <View style={styles.dashSectionRow}>
        <SkeletonBox width="45%" height={16} />
        <SkeletonBox width="15%" height={13} />
      </View>
      <View style={styles.dashApptList}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.dashApptItem}>
            <SkeletonBox width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, gap: 5 }}>
              <SkeletonBox width="60%" height={13} />
              <SkeletonBox width="40%" height={11} />
            </View>
            <View style={{ gap: 5, alignItems: 'flex-end' }}>
              <SkeletonBox width={48} height={12} />
              <SkeletonBox width={64} height={20} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Recent Patients */}
    <View style={{ gap: Spacing[3], marginTop: Spacing[5] }}>
      <View style={styles.dashSectionRow}>
        <SkeletonBox width="40%" height={16} />
        <SkeletonBox width="15%" height={13} />
      </View>
      <View style={styles.dashPatientsRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.dashPatientCard}>
            <SkeletonBox width={48} height={48} borderRadius={24} />
            <SkeletonBox width="80%" height={11} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  </View>
));

SkeletonDoctorDashboard.displayName = 'SkeletonDoctorDashboard';

/** Notification list skeleton */
export const SkeletonNotificationList = memo<{ count?: number }>(({ count = 6 }) => (
  <View style={styles.notifList}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.notifCard}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width="70%" height={13} />
          <SkeletonBox width="90%" height={11} />
          <SkeletonBox width="85%" height={11} />
          <SkeletonBox width="30%" height={10} style={{ marginTop: 2 }} />
        </View>
      </View>
    ))}
  </View>
));

SkeletonNotificationList.displayName = 'SkeletonNotificationList';

/** Prescription view-mode skeleton */
export const SkeletonPrescriptionView = memo(() => (
  <View style={styles.prescView}>
    <View style={styles.prescCard}>
      {/* Diagnosis block */}
      <SkeletonBox width="30%" height={11} />
      <SkeletonBox width="75%" height={16} style={{ marginTop: 6 }} />

      <View style={styles.prescDivider} />

      {/* Medications header */}
      <SkeletonBox width="50%" height={14} style={{ marginBottom: Spacing[3] }} />

      {/* Med items */}
      {[1, 2].map((i) => (
        <View key={i} style={styles.prescMedRow}>
          <SkeletonBox width={24} height={24} borderRadius={12} />
          <View style={{ flex: 1, gap: 5 }}>
            <SkeletonBox width="55%" height={13} />
            <SkeletonBox width="70%" height={11} />
          </View>
        </View>
      ))}

      <View style={styles.prescDivider} />

      {/* Instructions */}
      <SkeletonBox width="40%" height={11} />
      <SkeletonBox width="90%" height={13} style={{ marginTop: 6 }} />
      <SkeletonBox width="70%" height={13} style={{ marginTop: 4 }} />

      <View style={styles.prescDivider} />

      {/* Signature */}
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <SkeletonBox width="30%" height={11} />
        <SkeletonBox width="45%" height={14} />
        <SkeletonBox width="35%" height={11} />
      </View>
    </View>
  </View>
));

SkeletonPrescriptionView.displayName = 'SkeletonPrescriptionView';

/** Time-slot grid skeleton for BookAppointment */
export const SkeletonSlots = memo(() => (
  <View style={styles.slotsGrid}>
    {Array.from({ length: 9 }).map((_, i) => (
      <SkeletonBox key={i} width="30%" height={44} borderRadius={10} />
    ))}
  </View>
));

SkeletonSlots.displayName = 'SkeletonSlots';

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.neutral[200] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing[3],
  },
  cardBody: { flex: 1, gap: 4 },
  list: { paddingHorizontal: Spacing[4] },
  dashboard: { padding: Spacing[4], gap: Spacing[3] },
  dashboardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  statsRow: { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2] },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
  },
  detail: { padding: Spacing[4] },
  detailHeader: { flexDirection: 'row', gap: Spacing[4], alignItems: 'center' },

  // ── Home skeleton
  homeContainer: {
    padding: Spacing[4],
    paddingBottom: Spacing[10],
  },
  homeVitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  homeVitalCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  homeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  homeActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  homeSpecRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  homeSpecItem: {
    alignItems: 'center',
    width: 68,
  },
  homeDoctorRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  homeDoctorCard: {
    width: 152,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // ── Doctor Dashboard skeleton
  dashContainer: {
    padding: Spacing[4],
    paddingBottom: Spacing[10],
  },
  dashStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  dashStatCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dashSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashApptList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dashApptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dashPatientsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  dashPatientCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    borderRadius: 16,
    width: 96,
  },

  // ── Notifications skeleton
  notifList: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing[4],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
    alignItems: 'flex-start',
  },

  // ── Prescription view skeleton
  prescView: {
    padding: Spacing[4],
    paddingBottom: Spacing[8],
  },
  prescCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing[5],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prescDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[2],
  },
  prescMedRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },

  // ── Slots skeleton
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    padding: Spacing[1],
  },
});
