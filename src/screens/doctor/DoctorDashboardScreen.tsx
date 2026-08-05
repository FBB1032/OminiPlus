import React from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useDoctorDashboard } from '../../hooks/useDoctor';
import { useAuth } from '../../hooks/useAuth';
import { Card, Avatar, EmptyState, ErrorState, SkeletonDoctorDashboard } from '../../components';

export default function DoctorDashboardScreen({ navigation }: any) {
  const { user } = useAuth();

  // If doctor account is suspended, lock out dashboard and show SuspendedAccountScreen component
  if (user?.verificationStatus === 'suspended' || (user as any)?.isSuspended) {
    const SuspendedAccountScreen = require('./SuspendedAccountScreen').default;
    return <SuspendedAccountScreen />;
  }

  const { data: dashboardData, isLoading: _isLoading, isError, refetch } = useDoctorDashboard();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonDoctorDashboard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !dashboardData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState onRetry={refetch} message="Failed to load dashboard data." />
      </SafeAreaView>
    );
  }

  const { stats, todayAppointments, recentPatients } = dashboardData;

  const renderAppointmentItem = ({ item }: { item: any }) => {
    const time = new Date(item.scheduledAt).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PatientDetail', { patientId: item.patientId })}
        style={styles.appointmentItem}
        activeOpacity={0.7}
      >
        <Avatar
          name={`${item.patient.firstName} ${item.patient.lastName}`}
          uri={item.patient.avatarUrl}
          size="md"
        />
        <View style={styles.appointmentInfo}>
          <Text style={styles.patientName}>
            {item.patient.firstName} {item.patient.lastName}
          </Text>
          <Text style={styles.appointmentReason}>{item.reason}</Text>
        </View>
        <View style={styles.appointmentRight}>
          <Text style={styles.appointmentTime}>{time}</Text>
          <View style={[styles.statusBadge, (styles as any)[`statusBadge_${item.status}`]]}>
            <Text style={[styles.statusText, (styles as any)[`statusText_${item.status}`]]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPatientItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
      style={styles.patientCard}
      activeOpacity={0.7}
    >
      <Avatar
        name={`${item.firstName} ${item.lastName}`}
        uri={item.avatarUrl}
        size="md"
      />
      <Text style={styles.recentPatientName} numberOfLines={1}>
        {item.firstName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            uri={user?.avatarUrl}
            size="md"
          />
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.doctorName}>Dr. {user?.lastName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('DoctorAppointments')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={Colors.text.primary} />
            <View style={styles.msgDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {user?.isApproved === false && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={18} color="#D97706" />
          <Text style={styles.pendingBannerText}>
            Verification Pending. Accepting patients and prescriptions are locked.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statVal}>{stats.todayAppointments}</Text>
            <Text style={styles.statLabel}>Today's Appts</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="people" size={20} color="#10B981" />
            </View>
            <Text style={styles.statVal}>{stats.totalPatients}</Text>
            <Text style={styles.statLabel}>Total Patients</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statVal}>{stats.patientsAttended ?? stats.completedToday ?? 0}</Text>
            <Text style={styles.statLabel}>Patients Attended</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="cash" size={20} color="#EC4899" />
            </View>
            <Text style={styles.statVal}>₦{(stats.weeklyRevenue ?? 0).toLocaleString()}</Text>
          </Card>
        </View>

        {/* Quick Issue E-Prescription Banner */}
        <View style={{ marginBottom: Spacing[3] }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#0F6E6E', borderRadius: 14, padding: 16,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderWidth: 1, borderColor: '#0D9488',
              ...Shadows.sm,
            }}
            onPress={() => navigation.navigate('Prescription', { mode: 'create', appointmentId: 'direct-consult', patientId: 'pat-1' })}
            activeOpacity={0.88}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Ionicons name="document-text" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: '#FFFFFF', marginBottom: 2 }}>
                Issue Digital E-Prescription
              </Text>
              <Text style={{ fontSize: 11.5, color: '#CCFBF1', lineHeight: 16 }}>
                Write digital prescriptions with automated drug interaction & allergy safety checks. Dispatches instantly to patient.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCFBF1" />
          </TouchableOpacity>
        </View>

        {/* Quick Access Shortcuts Grid */}
        <View style={{ marginBottom: Spacing[4] }}>
          <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: 10 }}>
            Quick Access Shortcuts
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: 'Issue E-Rx', icon: 'medkit-outline', route: 'Prescription', params: { mode: 'create', appointmentId: 'direct-consult', patientId: 'pat-1' }, color: '#0D9488', bg: '#CCFBF1' },
              { label: 'Schedule', icon: 'calendar-outline', route: 'DoctorAppointments', color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Hours', icon: 'time-outline', route: 'DoctorAvailability', color: '#7C3AED', bg: '#F5F3FF' },
              { label: 'Blood SOS', icon: 'water-outline', route: 'BloodDonors', color: '#DC2626', bg: '#FEF2F2' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
                  alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
                  ...Shadows.sm,
                }}
                onPress={() => navigation.navigate(item.route, item.params)}
                activeOpacity={0.7}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: FontWeight.semiBold, color: Colors.text.primary, textAlign: 'center' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorAppointments')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {todayAppointments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
            </Card>
          ) : (
            <View style={styles.appointmentsList}>
              {todayAppointments.map((item) => (
                <View key={item.id}>
                  {renderAppointmentItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Patients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Patients</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorPatients')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentPatients.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent patients found.</Text>
            </Card>
          ) : (
            <FlatList
              horizontal
              data={recentPatients}
              keyExtractor={(item) => item.id}
              renderItem={renderPatientItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentPatientsScroll}
            />
          )}
        </View>

        {/* Blood Donor Network */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blood Donor Network</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BloodDonors')}>
              <Text style={styles.seeAll}>Open</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#7F1D1D', borderRadius: 14, padding: 16,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderWidth: 1.5, borderColor: '#EF4444',
            }}
            onPress={() => navigation.navigate('BloodDonors')}
            activeOpacity={0.88}
          >
            <View style={{
              width: 48, height: 48, borderRadius: 24, backgroundColor: '#DC2626',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Ionicons name="water" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: '#FFFFFF', marginBottom: 2 }}>
                Emergency Blood Discovery
              </Text>
              <Text style={{ fontSize: 11.5, color: '#FCA5A5', lineHeight: 16 }}>
                Find compatible AA-genotype donors nearby. Use for life-threatening transfusion emergencies. All donations must be screened by a licensed blood bank.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  welcomeText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  doctorName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  msgDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing[4],
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  section: {
    gap: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },
  appointmentsList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.xs,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: Spacing[3],
    gap: 2,
  },
  patientName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  appointmentReason: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  appointmentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  appointmentTime: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
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
  recentPatientsScroll: {
    gap: Spacing[3],
    paddingVertical: Spacing[1],
  },
  patientCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    borderRadius: 16,
    width: 96,
    gap: Spacing[2],
    ...Shadows.xs,
  },
  recentPatientName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  emptyCard: {
    padding: Spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
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
});
