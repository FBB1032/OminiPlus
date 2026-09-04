import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useDoctorDashboard } from '../../hooks/useDoctor';
import { useAuth } from '../../hooks/useAuth';
import {
  Avatar,
  ErrorState,
  SkeletonDoctorDashboard,
  HeartbeatRefreshControl,
  HeartbeatRefreshHeader,
} from '../../components';

export default function DoctorDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);

  // If doctor account is suspended, lock out dashboard and show SuspendedAccountScreen component
  if (user?.verificationStatus === 'suspended' || (user as any)?.isSuspended) {
    const SuspendedAccountScreen = require('./SuspendedAccountScreen').default;
    return <SuspendedAccountScreen />;
  }

  const { data: dashboardData, isLoading: _isLoading, isError, refetch } = useDoctorDashboard();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

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
        <ErrorState onRetry={refetch} message="Failed to load clinical dashboard." />
      </SafeAreaView>
    );
  }

  const { stats, todayAppointments, recentPatients } = dashboardData;
  const nextAppt = todayAppointments?.[0] ?? null;

  // Clinical Management Tools for "See All Tools" Modal
  const clinicalTools = [
    {
      title: 'Practice & Consultations',
      items: [
        {
          label: 'Issue Digital E-Prescription',
          icon: 'medkit',
          color: '#0F6E6E',
          bg: '#E6F4F4',
          desc: 'Write Rx with automated allergy & interaction safety checks',
          action: () => {
            setIsToolsModalOpen(false);
            navigation.navigate('Prescription', { mode: 'create', appointmentId: 'direct-consult', patientId: 'pat-1' });
          },
        },
        {
          label: 'Set Working Hours & Slots',
          icon: 'time',
          color: '#7C3AED',
          bg: '#F5F3FF',
          desc: 'Manage clinical availability and teleconsultation slots',
          action: () => {
            setIsToolsModalOpen(false);
            navigation.navigate('DoctorAvailability');
          },
        },
        {
          label: 'Configure Tiered Fees',
          icon: 'cash',
          color: '#059669',
          bg: '#ECFDF5',
          desc: 'Adjust rates: Chat (₦8k), Voice (₦10k), Video (₦15k)',
          action: () => {
            setIsToolsModalOpen(false);
            navigation.navigate('DoctorProfile');
          },
        },
      ],
    },
    {
      title: 'Patient Care & Records',
      items: [
        {
          label: 'All Patients Directory',
          icon: 'people',
          color: '#2563EB',
          bg: '#EFF6FF',
          desc: 'Patient clinical charts, Body Maps, and EHR histories',
          action: () => {
            setIsToolsModalOpen(false);
            navigation.navigate('DoctorPatients');
          },
        },
        {
          label: 'Hospital & Blood Bank Network',
          icon: 'water',
          color: '#DC2626',
          bg: '#FEF2F2',
          desc: 'Emergency blood appeals and hospital screening coordination',
          action: () => {
            setIsToolsModalOpen(false);
            navigation.navigate('BloodDonors');
          },
        },
        {
          label: 'Full Appointment Calendar',
          icon: 'calendar',
          color: '#D97706',
          bg: '#FFFBEB',
          desc: 'Upcoming week view & completed consultation history',
          action: () => {
            setIsToolsModalOpen(false);
            navigation.navigate('DoctorAppointments');
          },
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Doctor Header ────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            uri={user?.avatarUrl}
            size="md"
          />
          <View>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.doctorName}>Dr. {user?.lastName || 'Physician'}</Text>
              <View style={styles.mdcnBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#0F6E6E" />
                <Text style={styles.mdcnBadgeText}>MDCN Verified</Text>
              </View>
            </View>
            <Text style={styles.docSpecialtyText}>
              {(user as any)?.specialization || 'General Medical Practitioner'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('DoctorAppointments')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={Colors.text.primary} />
            <View style={styles.msgDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <HeartbeatRefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            color="#0F6E6E"
          />
        }
      >
        <HeartbeatRefreshHeader
          refreshing={isRefreshing}
          color="#0F6E6E"
          message="Updating clinical queue..."
        />

        {/* ── Immediate Attention Banner (Next Patient in Queue) ─────────────── */}
        <View style={styles.attentionSection}>
          <View style={styles.attentionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.pulseIndicator} />
              <Text style={styles.attentionTitle}>Needs Your Attention Right Now</Text>
            </View>
            <Text style={styles.attentionCount}>
              {todayAppointments.length} Appt{todayAppointments.length === 1 ? '' : 's'} Today
            </Text>
          </View>

          {nextAppt ? (
            <View style={styles.nextPatientCard}>
              <View style={styles.nextPatientHeader}>
                <View style={styles.nextTag}>
                  <Ionicons name="time" size={11} color="#0F6E6E" />
                  <Text style={styles.nextTagText}>UP NEXT IN SCHEDULE</Text>
                </View>
                <Text style={styles.nextTimeText}>
                  {new Date(nextAppt.scheduledAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.patientRow}>
                <Avatar
                  name={`${nextAppt.patient?.firstName} ${nextAppt.patient?.lastName}`}
                  uri={nextAppt.patient?.avatarUrl}
                  size="md"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientFullName}>
                    {nextAppt.patient?.firstName} {nextAppt.patient?.lastName}
                  </Text>
                  <Text style={styles.consultReason} numberOfLines={2}>
                    Reason: {nextAppt.reason || 'General Health Consultation'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: 1-Tap Consult & Review Chart/Body Map */}
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={styles.startConsultBtn}
                  onPress={() => navigation.navigate('PatientDetail', { patientId: nextAppt.patientId })}
                  activeOpacity={0.88}
                >
                  <Ionicons name="videocam" size={15} color="#FFFFFF" />
                  <Text style={styles.startConsultBtnText}>Start Consultation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inspectChartBtn}
                  onPress={() => navigation.navigate('PatientDetail', { patientId: nextAppt.patientId })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="body-outline" size={15} color="#0F6E6E" />
                  <Text style={styles.inspectChartBtnText}>Chart & Body Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noQueueCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
              <Text style={styles.noQueueTitle}>Waiting Room Clear</Text>
              <Text style={styles.noQueueSub}>No patients currently queued for immediate consultation.</Text>
            </View>
          )}
        </View>

        {/* ── Quick Clinical Action Bar (Fast Issuance) ─────────────────────── */}
        <View style={styles.quickBarRow}>
          <TouchableOpacity
            style={styles.quickBarBtn}
            onPress={() => navigation.navigate('Prescription', { mode: 'create', appointmentId: 'direct-consult', patientId: 'pat-1' })}
            activeOpacity={0.8}
          >
            <Ionicons name="medkit" size={18} color="#0F6E6E" />
            <Text style={styles.quickBarBtnText}>Issue E-Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBarBtn}
            onPress={() => navigation.navigate('DoctorAvailability')}
            activeOpacity={0.8}
          >
            <Ionicons name="time" size={18} color="#7C3AED" />
            <Text style={styles.quickBarBtnText}>Manage Hours</Text>
          </TouchableOpacity>
        </View>

        {/* ── Clinical KPIs Summary (Compact 4-Item Row) ─────────────────────── */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiVal}>{stats.todayAppointments}</Text>
            <Text style={styles.kpiLabel}>Today's Appts</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiVal, { color: '#059669' }]}>
              {stats.patientsAttended ?? stats.completedToday ?? 0}
            </Text>
            <Text style={styles.kpiLabel}>Attended</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiVal, { color: '#2563EB' }]}>{stats.totalPatients}</Text>
            <Text style={styles.kpiLabel}>Total Patients</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiVal, { color: '#D97706' }]}>
              ₦{(stats.weeklyRevenue ?? 0).toLocaleString()}
            </Text>
            <Text style={styles.kpiLabel}>Revenue</Text>
          </View>
        </View>

        {/* ── Today's Patient Queue ─────────────────────────────────────────── */}
        <View style={styles.queueSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Patient Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorAppointments')}>
              <Text style={styles.seeAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No appointments scheduled for today.</Text>
            </View>
          ) : (
            <View style={styles.queueList}>
              {todayAppointments.map((item) => {
                const time = new Date(item.scheduledAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.queueItem}
                    onPress={() => navigation.navigate('PatientDetail', { patientId: item.patientId })}
                    activeOpacity={0.75}
                  >
                    <Avatar
                      name={`${item.patient?.firstName} ${item.patient?.lastName}`}
                      uri={item.patient?.avatarUrl}
                      size="sm"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.queuePatientName}>
                        {item.patient?.firstName} {item.patient?.lastName}
                      </Text>
                      <Text style={styles.queueReason} numberOfLines={1}>
                        {item.reason || 'General Consultation'}
                      </Text>
                    </View>
                    <View style={styles.queueTimeWrap}>
                      <Text style={styles.queueTime}>{time}</Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{item.status.toUpperCase()}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Clinical Tools Bar ("See All Tools") ──────────────────────────── */}
        <TouchableOpacity
          style={styles.toolsBarBtn}
          onPress={() => setIsToolsModalOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="construct-outline" size={18} color="#0F6E6E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.toolsBarTitle}>Clinical Tools & Practice Management</Text>
            <Text style={styles.toolsBarSub}>Tiered fees, schedule, patient records & blood network</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#0F6E6E" />
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modal: Clinical Tools & Services (Clean, Organized) ───────────── */}
      <Modal
        visible={isToolsModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsToolsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Clinical Tools & Settings</Text>
                <Text style={styles.modalSub}>Administrative and practice management tools</Text>
              </View>
              <TouchableOpacity onPress={() => setIsToolsModalOpen(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 16 }}>
              {clinicalTools.map((cat, idx) => (
                <View key={idx}>
                  <Text style={styles.toolCategoryTitle}>{cat.title}</Text>
                  <View style={styles.toolListWrap}>
                    {cat.items.map((item, itemIdx) => (
                      <TouchableOpacity
                        key={itemIdx}
                        style={styles.toolItemRow}
                        onPress={item.action}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.toolIconWrap, { backgroundColor: item.bg }]}>
                          <Ionicons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.toolItemLabel}>{item.label}</Text>
                          <Text style={styles.toolItemDesc}>{item.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  mdcnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mdcnBadgeText: {
    fontSize: 9.5,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
  },
  docSpecialtyText: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollContent: {
    padding: Spacing[4],
    paddingBottom: 40,
    gap: Spacing[4],
  },
  attentionSection: {
    gap: 10,
  },
  attentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  attentionTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  attentionCount: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  nextPatientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing[4],
    borderWidth: 1.5,
    borderColor: '#CCFBF1',
    ...Shadows.sm,
    gap: 12,
  },
  nextPatientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextTagText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
  },
  nextTimeText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientFullName: {
    fontSize: 14.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  consultReason: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  startConsultBtn: {
    flex: 1.2,
    backgroundColor: '#0F6E6E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startConsultBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  inspectChartBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inspectChartBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
  },
  noQueueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 6,
  },
  noQueueTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  noQueueSub: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  quickBarRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBarBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  quickBarBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
  },
  kpiVal: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  kpiLabel: {
    fontSize: 9.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  queueSection: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  seeAllLink: {
    fontSize: 11.5,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  queueList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  queuePatientName: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  queueReason: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  queueTimeWrap: {
    alignItems: 'flex-end',
    gap: 3,
  },
  queueTime: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  statusPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 8.5,
    fontWeight: FontWeight.bold,
    color: '#0369A1',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  toolsBarBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  toolsBarTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#0F6E6E',
  },
  toolsBarSub: {
    fontSize: 10.5,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing[4],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  modalSub: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  toolCategoryTitle: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  toolListWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  toolItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolItemLabel: {
    fontSize: 13,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  toolItemDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
});
