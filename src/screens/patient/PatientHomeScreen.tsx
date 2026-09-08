import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../constants/queryKeys';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { usePatientHome } from '../../hooks/usePatient';
import { useAuth } from '../../hooks/useAuth';
import {
  Avatar,
  ErrorState,
  SkeletonHomePage,
  HeartbeatRefreshControl,
  HeartbeatRefreshHeader,
} from '../../components';
import { useToast } from '../../hooks/useAuth';

export default function PatientHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { data: homeData, isLoading: _isLoading, isError, refetch } = usePatientHome();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);
  const { success: toastSuccess, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeAllServicesOpen, setIsSeeAllServicesOpen] = useState(false);
  const [isEditVitalsOpen, setIsEditVitalsOpen] = useState(false);

  // Vitals inputs
  const [inputBP, setInputBP] = useState('');
  const [inputHR, setInputHR] = useState('');
  const [inputTemp, setInputTemp] = useState('');

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
    });
  };

  const handleOpenVitalsEdit = () => {
    setInputBP(healthSummary?.bloodPressure || '120/80');
    setInputHR(healthSummary?.heartRate?.toString() || '72');
    setInputTemp(healthSummary?.temperature?.toString() || '36.6');
    setIsEditVitalsOpen(true);
  };

  const handleSaveVitals = () => {
    const hrVal = parseInt(inputHR, 10);
    const tempVal = parseFloat(inputTemp);

    if (!inputBP.includes('/')) {
      toastError('Invalid Format', 'Please enter Blood Pressure as systolic/diastolic (e.g. 120/80).');
      return;
    }
    if (isNaN(hrVal) || hrVal < 30 || hrVal > 220) {
      toastError('Invalid Heart Rate', 'Heart rate must be between 30 and 220 bpm.');
      return;
    }
    if (isNaN(tempVal) || tempVal < 25 || tempVal > 45) {
      toastError('Invalid Temp', 'Body temperature must be between 25°C and 45°C.');
      return;
    }

    queryClient.setQueryData(QUERY_KEYS.patientHome, (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        healthSummary: {
          ...oldData.healthSummary,
          bloodPressure: inputBP,
          heartRate: hrVal,
          temperature: tempVal,
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    setIsEditVitalsOpen(false);
    toastSuccess('Vitals Updated', 'Your vitals summary has been logged.');
  };

  // ─── Loading & Error ────────────────────────────────────────────────────────
  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SkeletonHomePage />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !homeData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState onRetry={refetch} message="Failed to load your health dashboard." />
      </SafeAreaView>
    );
  }

  const { upcomingAppointments, healthSummary } = homeData;
  const nextAppt = upcomingAppointments?.[0] ?? null;

  // Dynamic BMI Calculation
  const height = user?.height || healthSummary?.height || 170;
  const weight = user?.weight || healthSummary?.weight || 70;
  const bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));

  // Services Directory for See All Sheet (Neatly categorized)
  const serviceCategories = [
    {
      title: 'Consultations & Triage',
      items: [
        {
          label: 'Book Doctor',
          icon: 'calendar',
          color: '#0F6E6E',
          bg: '#E6F4F4',
          desc: 'Schedule video, voice or clinic visit',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('BookAppointment'); },
        },
        {
          label: 'Body Map & Symptoms',
          icon: 'body',
          color: '#7C3AED',
          bg: '#F5F3FF',
          desc: 'Interactive 3D/2D pain mapping & triage',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('SymptomChecker'); },
        },
        {
          label: 'Find Specialists',
          icon: 'people',
          color: '#2563EB',
          bg: '#EFF6FF',
          desc: 'Directory of MDCN-verified physicians',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('Specialists'); },
        },
      ],
    },
    {
      title: 'Medications & Care',
      items: [
        {
          label: 'Pharmacy & E-Rx',
          icon: 'bandage',
          color: '#0284C7',
          bg: '#E0F2FE',
          desc: 'Digital prescriptions & home delivery',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('Pharmacy'); },
        },
        {
          label: 'Medication Reminders',
          icon: 'alarm',
          color: '#E11D48',
          bg: '#FFE4E6',
          desc: 'Pill timers & daily adherence logs',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('MedicationReminders'); },
        },
        {
          label: 'Chronic Care Tracker',
          icon: 'fitness',
          color: '#059669',
          bg: '#ECFDF5',
          desc: 'Hypertension, diabetes & pregnancy care',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('ChronicDisease'); },
        },
      ],
    },
    {
      title: 'Emergency & Hospitals',
      items: [
        {
          label: 'Hospitals Network',
          icon: 'business',
          color: '#DC2626',
          bg: '#FEF2F2',
          desc: 'Accredited hospitals & emergency centers',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('Hospitals'); },
        },
        {
          label: 'Blood Bank & Donors',
          icon: 'water',
          color: '#DC2626',
          bg: '#FEE2E2',
          desc: 'Verified hospital pipeline & inventory',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('BloodDonors'); },
        },
        {
          label: 'Report an Incident',
          icon: 'shield',
          color: '#D97706',
          bg: '#FEF3C7',
          desc: 'Clinical complaints & patient advocacy',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('ReportIncident'); },
        },
      ],
    },
    {
      title: 'Records & Privacy (NDPA)',
      items: [
        {
          label: 'Health Records',
          icon: 'document-text',
          color: '#0D9488',
          bg: '#CCFBF1',
          desc: 'EHR health records, lab reports & scans',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('PatientRecords'); },
        },
        {
          label: 'AI Health Insights',
          icon: 'analytics',
          color: '#0891B2',
          bg: '#CFFAFE',
          desc: 'Automated clinical vitals analysis',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('AIHealthInsights'); },
        },
        {
          label: 'Access Logs',
          icon: 'eye',
          color: '#4F46E5',
          bg: '#EEF2FF',
          desc: 'Audit trail: see who viewed your records',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('AccessLogs'); },
        },
        {
          label: 'Data Sharing Consents',
          icon: 'lock-closed',
          color: '#16A34A',
          bg: '#DCFCE7',
          desc: 'Manage doctor permissions & revocations',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('ConsentManagement'); },
        },
        {
          label: 'Wearable Sync',
          icon: 'watch',
          color: '#9333EA',
          bg: '#F3E8FF',
          desc: 'Smartwatch & sensor telemetry',
          action: () => { setIsSeeAllServicesOpen(false); navigation.navigate('WearableSync'); },
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerUser}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            uri={user?.avatarUrl}
            size="md"
          />
          <View>
            <Text style={styles.greetingSub}>Hello,</Text>
            <Text style={styles.greetingName}>{user?.firstName || 'Patient'}</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.navigate('PatientAppointments')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={Colors.text.primary} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
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
          message="Updating health records & pulse..."
        />

        {/* ── Immediate Clarity Hero: "What can we help you with?" ─────────── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What would you like to do today?</Text>
          <View style={styles.heroGrid}>
            {/* 1. Book Consultation */}
            <TouchableOpacity
              style={[styles.heroCard, { backgroundColor: '#0F6E6E' }]}
              onPress={() => navigation.navigate('BookAppointment')}
              activeOpacity={0.88}
            >
              <View style={styles.heroCardIconWrap}>
                <Ionicons name="videocam" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.heroCardTitle}>Talk to a Doctor</Text>
              <Text style={styles.heroCardSub}>Video or voice consult</Text>
            </TouchableOpacity>

            {/* 2. Check Symptoms & Body Map */}
            <TouchableOpacity
              style={[styles.heroCard, { backgroundColor: '#581C87' }]}
              onPress={() => navigation.navigate('SymptomChecker')}
              activeOpacity={0.88}
            >
              <View style={styles.heroCardIconWrap}>
                <Ionicons name="body" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.heroCardTitle}>Body Map & Triage</Text>
              <Text style={styles.heroCardSub}>Interactive symptom check</Text>
            </TouchableOpacity>

            {/* 3. Emergency Care */}
            <TouchableOpacity
              style={[styles.heroCard, { backgroundColor: '#991B1B' }]}
              onPress={() => navigation.navigate('Hospitals')}
              activeOpacity={0.88}
            >
              <View style={styles.heroCardIconWrap}>
                <Ionicons name="medical" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.heroCardTitle}>Emergency Care</Text>
              <Text style={styles.heroCardSub}>Nearest hospitals & SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Active Consultation Focus (If Scheduled) ──────────────────────── */}
        {nextAppt ? (
          <View style={styles.apptCard}>
            <View style={styles.apptCardTop}>
              <View style={styles.apptBadge}>
                <Ionicons name="videocam" size={12} color="#0284C7" />
                <Text style={styles.apptBadgeText}>UPCOMING CONSULTATION</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('PatientAppointments')}>
                <Text style={styles.viewApptsLink}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.apptDoctorRow}>
              <Avatar
                name={`Dr. ${nextAppt.doctor?.lastName}`}
                uri={nextAppt.doctor?.avatarUrl}
                size="md"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.apptDocName}>
                  Dr. {nextAppt.doctor?.firstName} {nextAppt.doctor?.lastName}
                </Text>
                <Text style={styles.apptDocSpec}>{nextAppt.doctor?.specialization || 'General Physician'}</Text>
                <Text style={styles.apptTimeText}>
                  {new Date(nextAppt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} •{' '}
                  {new Date(nextAppt.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.joinConsultBtn}
              onPress={() => navigation.navigate('VideoConsultation', {
                appointmentId: nextAppt.id,
                doctorName: `Dr. ${nextAppt.doctor?.firstName} ${nextAppt.doctor?.lastName}`,
              })}
              activeOpacity={0.88}
            >
              <Ionicons name="videocam" size={16} color="#FFFFFF" />
              <Text style={styles.joinConsultBtnText}>Join Video Consultation</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Compact Health Snapshot (Uncluttered Vitals Pill) ─────────────── */}
        <View style={styles.vitalsSnapshotCard}>
          <View style={styles.vitalsSnapshotHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pulse" size={16} color="#0F6E6E" />
              <Text style={styles.vitalsSnapshotTitle}>My Vitals Snapshot</Text>
            </View>
            <TouchableOpacity onPress={handleOpenVitalsEdit} activeOpacity={0.75}>
              <Text style={styles.vitalsEditLink}>Log Vitals</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vitalsPillRow}>
            <View style={styles.vitalMiniPill}>
              <Ionicons name="heart" size={13} color="#EF4444" />
              <Text style={styles.vitalMiniVal}>{healthSummary?.bloodPressure || '120/80'}</Text>
              <Text style={styles.vitalMiniUnit}>BP</Text>
            </View>
            <View style={styles.vitalMiniPill}>
              <Ionicons name="pulse" size={13} color="#3B82F6" />
              <Text style={styles.vitalMiniVal}>{healthSummary?.heartRate || 72}</Text>
              <Text style={styles.vitalMiniUnit}>bpm</Text>
            </View>
            <View style={styles.vitalMiniPill}>
              <Ionicons name="thermometer" size={13} color="#10B981" />
              <Text style={styles.vitalMiniVal}>{healthSummary?.temperature || 36.6}°</Text>
              <Text style={styles.vitalMiniUnit}>Temp</Text>
            </View>
            <View style={styles.vitalMiniPill}>
              <Ionicons name="calculator" size={13} color="#F59E0B" />
              <Text style={styles.vitalMiniVal}>{bmi}</Text>
              <Text style={styles.vitalMiniUnit}>BMI</Text>
            </View>
          </View>
        </View>

        {/* ── Essential Services Grid (4 Clean Items + See All Button) ──────── */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Essential Services</Text>
            <TouchableOpacity onPress={() => setIsSeeAllServicesOpen(true)} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All (12+)</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Focused Cards */}
          <View style={styles.fourGrid}>
            <TouchableOpacity
              style={styles.fourGridCard}
              onPress={() => navigation.navigate('Pharmacy')}
              activeOpacity={0.78}
            >
              <View style={[styles.fourGridIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="bandage" size={22} color="#0284C7" />
              </View>
              <Text style={styles.fourGridTitle}>Pharmacy</Text>
              <Text style={styles.fourGridDesc}>Meds & Refills</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fourGridCard}
              onPress={() => navigation.navigate('BloodDonors')}
              activeOpacity={0.78}
            >
              <View style={[styles.fourGridIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="water" size={22} color="#DC2626" />
              </View>
              <Text style={styles.fourGridTitle}>Blood Services</Text>
              <Text style={styles.fourGridDesc}>Hospital Network</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fourGridCard}
              onPress={() => navigation.navigate('PatientRecords')}
              activeOpacity={0.78}
            >
              <View style={[styles.fourGridIconWrap, { backgroundColor: '#CCFBF1' }]}>
                <Ionicons name="document-text" size={22} color="#0D9488" />
              </View>
              <Text style={styles.fourGridTitle}>Health Records</Text>
              <Text style={styles.fourGridDesc}>EHR & Lab Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fourGridCard}
              onPress={() => navigation.navigate('AIHealthInsights')}
              activeOpacity={0.78}
            >
              <View style={[styles.fourGridIconWrap, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="analytics" size={22} color="#7C3AED" />
              </View>
              <Text style={styles.fourGridTitle}>AI Health</Text>
              <Text style={styles.fourGridDesc}>Insights & Advice</Text>
            </TouchableOpacity>
          </View>

          {/* "See All Services" Full Directory Bar */}
          <TouchableOpacity
            style={styles.seeAllBarBtn}
            onPress={() => setIsSeeAllServicesOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="grid-outline" size={16} color="#0F6E6E" />
            <Text style={styles.seeAllBarText}>View All Services & Tools</Text>
            <Ionicons name="chevron-forward" size={16} color="#0F6E6E" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Modal: See All Services (Comprehensive, Uncluttered Directory) ─── */}
      <Modal
        visible={isSeeAllServicesOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsSeeAllServicesOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>All Services & Tools</Text>
                <Text style={styles.modalSub}>Everything in OminiPulse organized clearly</Text>
              </View>
              <TouchableOpacity onPress={() => setIsSeeAllServicesOpen(false)}>
                <Ionicons name="close-circle" size={26} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30, gap: 18 }}>
              {serviceCategories.map((cat, idx) => (
                <View key={idx}>
                  <Text style={styles.categoryHeading}>{cat.title}</Text>
                  <View style={styles.categoryCardList}>
                    {cat.items.map((item, itemIdx) => (
                      <TouchableOpacity
                        key={itemIdx}
                        style={styles.categoryItemRow}
                        onPress={item.action}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.categoryItemIcon, { backgroundColor: item.bg }]}>
                          <Ionicons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.categoryItemLabel}>{item.label}</Text>
                          <Text style={styles.categoryItemDesc}>{item.desc}</Text>
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

      {/* ── Modal: Log / Edit Vitals ───────────────────────────────────────── */}
      <Modal
        visible={isEditVitalsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditVitalsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Your Vitals</Text>
              <TouchableOpacity onPress={() => setIsEditVitalsOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.inputLabel}>Blood Pressure (mmHg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={inputBP}
                  onChangeText={setInputBP}
                  placeholder="e.g. 120/80"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={inputHR}
                  onChangeText={setInputHR}
                  keyboardType="numeric"
                  placeholder="e.g. 72"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Temperature (°C)</Text>
                <TextInput
                  style={styles.textInput}
                  value={inputTemp}
                  onChangeText={setInputTemp}
                  keyboardType="numeric"
                  placeholder="e.g. 36.6"
                />
              </View>

              <TouchableOpacity
                style={styles.saveVitalsBtn}
                onPress={handleSaveVitals}
                activeOpacity={0.88}
              >
                <Text style={styles.saveVitalsBtnText}>Save Vitals</Text>
              </TouchableOpacity>
            </View>
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
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingSub: {
    fontSize: 11.5,
    color: Colors.text.secondary,
  },
  greetingName: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scrollBody: {
    padding: Spacing[4],
    paddingBottom: 40,
    gap: Spacing[4],
  },
  heroSection: {
    gap: 10,
  },
  heroTitle: {
    fontSize: 14.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  heroCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  heroCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroCardTitle: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  heroCardSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    lineHeight: 13,
  },
  apptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#E0F2FE',
    ...Shadows.sm,
    gap: 12,
  },
  apptCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  apptBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#0284C7',
  },
  viewApptsLink: {
    fontSize: 11.5,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  apptDoctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  apptDocName: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  apptDocSpec: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  apptTimeText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: FontWeight.medium,
    marginTop: 3,
  },
  joinConsultBtn: {
    backgroundColor: '#0F6E6E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinConsultBtnText: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  vitalsSnapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
    gap: 10,
  },
  vitalsSnapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vitalsSnapshotTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  vitalsEditLink: {
    fontSize: 11.5,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  vitalsPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vitalMiniPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vitalMiniVal: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  vitalMiniUnit: {
    fontSize: 9.5,
    color: Colors.text.secondary,
  },
  servicesSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
  },
  fourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fourGridCard: {
    width: '48.3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
  },
  fourGridIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fourGridTitle: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  fourGridDesc: {
    fontSize: 10.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  seeAllBarBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  seeAllBarText: {
    fontSize: 12.5,
    fontWeight: FontWeight.semiBold,
    color: '#0F6E6E',
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
    maxHeight: '85%',
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
  categoryHeading: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  categoryCardList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemLabel: {
    fontSize: 13,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  categoryItemDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: Colors.text.primary,
  },
  saveVitalsBtn: {
    backgroundColor: '#0F6E6E',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveVitalsBtnText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
