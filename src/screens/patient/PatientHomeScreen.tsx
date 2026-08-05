import React, { useState } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../constants/queryKeys';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { usePatientHome, useCancelAppointment } from '../../hooks/usePatient';
import { useAuth } from '../../hooks/useAuth';
import { Card, Avatar, ErrorState, SearchBar, AppModal, Input, Button, SkeletonHomePage, DoctorStatusBadge } from '../../components';
import { useToast } from '../../hooks/useAuth';

// ─── Static Mock Data ─────────────────────────────────────────────────────────

const SPECIALITIES = [
  { id: '1', name: 'General',    icon: 'medkit',         color: '#2563EB', bg: '#EFF6FF' },
  { id: '2', name: 'Cardiology', icon: 'heart',          color: '#DC2626', bg: '#FEF2F2' },
  { id: '3', name: 'Dental',     icon: 'happy',          color: '#059669', bg: '#ECFDF5' },
  { id: '4', name: 'Dermatology', icon: 'color-palette', color: '#7C3AED', bg: '#F5F3FF' },
  { id: '5', name: 'Eye Care',   icon: 'eye',            color: '#D97706', bg: '#FFFBEB' },
  { id: '6', name: 'Psychiatry', icon: 'fitness',        color: '#0891B2', bg: '#ECFEFF' },
];

const FEATURED_DOCTORS = [
  {
    id: '1',
    name: 'Dr. Folake Ademola',
    spec: 'Cardiologist',
    rating: 4.9,
    patients: 1200,
    avatar: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=300',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Tunde Adewale',
    spec: 'Neurologist',
    rating: 4.8,
    patients: 980,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Amina Yusuf',
    spec: 'Dermatologist',
    rating: 4.7,
    patients: 2100,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    available: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { data: homeData, isLoading: _isLoading, isError, refetch } = usePatientHome();
  const showSkeleton = useSkeletonDelay(_isLoading, 150);
  const cancelMutation = useCancelAppointment();
  const { success: toastSuccess, error: toastError } = useToast();
  
  const queryClient = useQueryClient();
  const [isEditTempOpen, setIsEditTempOpen] = useState(false);
  const [inputTemp, setInputTemp] = useState('');
  const [localTemp, setLocalTemp] = useState<number | null>(null);

  // Quick Access See All modal state
  const [isSeeAllQuickAccessOpen, setIsSeeAllQuickAccessOpen] = useState(false);

  // Filter modal state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Vitals check states
  const [isEditVitalsOpen, setIsEditVitalsOpen] = useState(false);
  const [inputBP, setInputBP] = useState('');
  const [inputHR, setInputHR] = useState('');
  const [inputTempField, setInputTempField] = useState('');

  const handleOpenVitalsEdit = () => {
    setInputBP(healthSummary?.bloodPressure || '120/80');
    setInputHR(healthSummary?.heartRate?.toString() || '72');
    setInputTempField(localTemp !== null ? localTemp.toString() : (healthSummary?.temperature?.toString() || '36.6'));
    setIsEditVitalsOpen(true);
  };

  const handleSaveVitals = () => {
    const hrVal = parseInt(inputHR, 10);
    const tempVal = parseFloat(inputTempField);
    
    if (!inputBP.includes('/')) {
      toastError('Error', 'Please enter a valid Blood Pressure (e.g., 120/80).');
      return;
    }
    if (isNaN(hrVal) || hrVal < 30 || hrVal > 200) {
      toastError('Error', 'Please enter a valid Heart Rate between 30 and 200 bpm.');
      return;
    }
    if (isNaN(tempVal) || tempVal < 20 || tempVal > 50) {
      toastError('Error', 'Please enter a valid Temperature between 20°C and 50°C.');
      return;
    }

    setLocalTemp(tempVal);
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
        }
      };
    });
    
    setIsEditVitalsOpen(false);
    toastSuccess('Success', 'Vitals checked and updated successfully.');
  };

  const handleSaveTemp = () => {
    const val = parseFloat(inputTemp);
    if (!isNaN(val) && val > 20 && val < 50) {
      setLocalTemp(val);
      queryClient.setQueryData(QUERY_KEYS.patientHome, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          healthSummary: {
            ...oldData.healthSummary,
            temperature: val,
            lastUpdated: new Date().toISOString(),
          }
        };
      });
      setIsEditTempOpen(false);
      toastSuccess('Success', 'Body temperature updated successfully.');
    } else {
      toastError('Error', 'Please enter a valid temperature between 20°C and 50°C.');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      toastSuccess('Cancelled', 'Appointment cancelled.');
      refetch();
    } catch {
      toastError('Error', 'Failed to cancel appointment.');
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SkeletonHomePage />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (isError || !homeData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState onRetry={refetch} message="Failed to load your dashboard." />
      </SafeAreaView>
    );
  }

  const { upcomingAppointments, recentPrescriptions, healthSummary } = homeData;
  const nextAppt = upcomingAppointments?.[0] ?? null;

  // Calculate BMI dynamically from Patient profile info (with fallback)
  const height = user?.height || healthSummary?.height || 170;
  const weight = user?.weight || healthSummary?.weight || 70;
  const bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));

  let bmiCategory = 'Normal';
  let bmiColor = '#10B981'; // green
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#3B82F6'; // blue
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = '#F59E0B'; // orange
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = '#EF4444'; // red
  }

  // Top 3 Main Features for un-crowded dashboard
  const mainQuickActions = [
    { label: 'Pharmacy',     icon: 'medical',        bg: '#EFF6FF', color: '#2563EB', desc: 'Prescriptions & Drugs', action: () => navigation.navigate('Pharmacy') },
    { label: 'Hospitals',    icon: 'business',       bg: '#F5F3FF', color: '#7C3AED', desc: 'Partner Centers', action: () => navigation.navigate('Hospitals') },
    { label: 'Blood Donors', icon: 'water',          bg: '#FEF2F2', color: '#DC2626', desc: 'GPS Proximity Match', action: () => navigation.navigate('BloodDonors') },
  ];

  // Full Quick Access list for See All Modal
  const allQuickActions = [
    { label: 'Pharmacy',     icon: 'medical',        bg: '#EFF6FF', color: '#2563EB', desc: 'Online Prescriptions & Drugs', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('Pharmacy'); } },
    { label: 'Hospitals',    icon: 'business',       bg: '#F5F3FF', color: '#7C3AED', desc: 'Verified Hospitals & Centers', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('Hospitals'); } },
    { label: 'Blood Donors', icon: 'water',          bg: '#FEF2F2', color: '#DC2626', desc: 'GPS Emergency Donor Match', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('BloodDonors'); } },
    { label: 'Records',      icon: 'document-text',  bg: '#ECFDF5', color: '#059669', desc: 'EHR Health History & Files', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('PatientRecords'); } },
    { label: 'Reminders',    icon: 'alarm',          bg: '#FFF1F2', color: '#E11D48', desc: 'Pill Alarms & Medication Logs', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('MedicationReminders'); } },
    { label: 'Check Vitals', icon: 'heart-half',     bg: '#FEF3C7', color: '#D97706', desc: 'Log BP, Heart Rate & Temp', action: () => { setIsSeeAllQuickAccessOpen(false); handleOpenVitalsEdit(); } },
    { label: 'Chronic Care', icon: 'fitness',        bg: '#F0FDFA', color: '#0D9488', desc: 'BP, Sugar & Pregnancy Tracker', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('ChronicDisease'); } },
    { label: 'AI Insights',  icon: 'analytics',      bg: '#F0FDFA', color: '#0891B2', desc: 'AI Analysis of Your Health', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('AIHealthInsights'); } },
    { label: 'Who Viewed',   icon: 'eye',            bg: '#EFF6FF', color: '#1D4ED8', desc: 'Audit Trail & Access Logs', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('AccessLogs'); } },
    { label: 'My Consents',  icon: 'lock-closed',    bg: '#F0FDF4', color: '#15803D', desc: 'Data Sharing Permissions', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('ConsentManagement'); } },
    { label: 'Wearable Sync', icon: 'watch',           bg: '#EFF6FF', color: '#2563EB', desc: 'Apple Watch, Redmi & Health Connect', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('WearableSync'); } },
    { label: 'Device Compat', icon: 'hardware-chip',  bg: '#F5F3FF', color: '#7C3AED', desc: 'Supported Watch & Monitor List', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('DeviceCompatibility'); } },
    { label: 'Report Incident', icon: 'shield',      bg: '#FEF2F2', color: '#DC2626', desc: 'File Provider Complaint', action: () => { setIsSeeAllQuickAccessOpen(false); navigation.navigate('ReportIncident'); } },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            uri={user?.avatarUrl}
            size="md"
          />
          <View>
            <Text style={styles.greetLabel}>Welcome back</Text>
            <Text style={styles.greetName}>{user?.firstName} {user?.lastName}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
          <TouchableOpacity
            style={styles.msgBtn}
            onPress={() => navigation.navigate('PatientAppointments')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles-outline" size={22} color={Colors.text.primary} />
            <View style={styles.msgDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable Body ───────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Search */}
        <SearchBar
          placeholder="Search doctors, symptoms, specialties…"
          onFilterPress={() => setIsFilterOpen(true)}
        />

        {/* ── Upcoming Appointment Banner ───────────────────────────────── */}
        {nextAppt ? (
          <View style={styles.apptBanner}>
            <View style={styles.apptBannerGlow} />
            <View style={styles.apptBannerTop}>
              <View style={styles.apptBannerBadge}>
                <Ionicons name="videocam" size={11} color="#38BDF8" />
                <Text style={styles.apptBannerBadgeText}>VIDEO CONSULTATION</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('PatientAppointments')}>
                <Text style={styles.apptBannerSeeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.apptBannerBody}>
              <Avatar
                name={`Dr. ${nextAppt.doctor?.lastName}`}
                uri={nextAppt.doctor?.avatarUrl}
                size="lg"
              />
              <View style={styles.apptBannerInfo}>
                <Text style={styles.apptBannerDoc}>
                  Dr. {nextAppt.doctor?.firstName} {nextAppt.doctor?.lastName}
                </Text>
                <Text style={styles.apptBannerSpec}>{nextAppt.doctor?.specialization}</Text>
                <View style={styles.apptBannerMeta}>
                  <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                  <Text style={styles.apptBannerMetaText}>
                    {new Date(nextAppt.scheduledAt).toLocaleDateString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </Text>
                  <View style={styles.apptBannerDot} />
                  <Ionicons name="time-outline" size={13} color="#94A3B8" />
                  <Text style={styles.apptBannerMetaText}>
                    {new Date(nextAppt.scheduledAt).toLocaleTimeString(undefined, {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.joinBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('VideoConsultation', {
                appointmentId: nextAppt.id,
                doctorName: `Dr. ${nextAppt.doctor?.firstName} ${nextAppt.doctor?.lastName}`
              })}
            >
              <Ionicons name="videocam" size={16} color="#fff" />
              <Text style={styles.joinBtnText}>Join Consultation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* No Appointment → Book CTA */
          <TouchableOpacity
            style={styles.bookCta}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('BookAppointment')}
          >
            <View>
              <Text style={styles.bookCtaTitle}>No upcoming consultation</Text>
              <Text style={styles.bookCtaSubtitle}>Book a slot with a specialist today</Text>
            </View>
            <View style={styles.bookCtaBtn}>
              <Text style={styles.bookCtaBtnText}>Book Now</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── My Vitals ─────────────────────────────────────────────── */}
        {healthSummary && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>My Vitals</Text>
              <Text style={styles.vitalsUpdated}>
                Updated {healthSummary.lastUpdated ? new Date(healthSummary.lastUpdated).toLocaleDateString() : '—'}
              </Text>
            </View>
            <View style={styles.vitalsGrid}>
              <View style={[styles.vitalCard, { borderLeftColor: '#EF4444' }]}>
                <View style={styles.vitalHeader}>
                  <Ionicons name="heart" size={18} color="#EF4444" />
                  <Text style={styles.vitalLabel}>BP</Text>
                </View>
                <Text style={styles.vitalValue}>{healthSummary.bloodPressure}</Text>
                <Text style={styles.vitalUnit}>mmHg</Text>
              </View>
              <View style={[styles.vitalCard, { borderLeftColor: '#3B82F6' }]}>
                <View style={styles.vitalHeader}>
                  <Ionicons name="pulse" size={18} color="#3B82F6" />
                  <Text style={styles.vitalLabel}>HR</Text>
                </View>
                <Text style={styles.vitalValue}>{healthSummary.heartRate}</Text>
                <Text style={styles.vitalUnit}>bpm</Text>
              </View>
              <TouchableOpacity
                style={[styles.vitalCard, { borderLeftColor: '#10B981' }]}
                onPress={() => {
                  const currentTemp = localTemp !== null ? localTemp : (healthSummary.temperature || 36.6);
                  setInputTemp(currentTemp != null ? currentTemp.toString() : '');
                  setIsEditTempOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.vitalHeader}>
                  <Ionicons name="thermometer" size={18} color="#10B981" />
                  <Text style={styles.vitalLabel}>Temp</Text>
                  <Ionicons name="create-outline" size={13} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                </View>
                <Text style={styles.vitalValue}>{localTemp !== null ? localTemp : (healthSummary.temperature || 36.6)}</Text>
                <Text style={styles.vitalUnit}>°C</Text>
              </TouchableOpacity>
              <View style={[styles.vitalCard, { borderLeftColor: '#F59E0B' }]}>
                <View style={styles.vitalHeader}>
                  <Ionicons name="calculator" size={18} color="#F59E0B" />
                  <Text style={styles.vitalLabel}>BMI</Text>
                </View>
                <Text style={styles.vitalValue}>{bmi}</Text>
                <Text style={[styles.vitalUnit, { color: bmiColor, fontWeight: 'bold' }]}>{bmiCategory}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <TouchableOpacity onPress={() => setIsSeeAllQuickAccessOpen(true)} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            {mainQuickActions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={{
                  flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12,
                  alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.sm
                }}
                onPress={item.action}
                activeOpacity={0.75}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22, backgroundColor: item.bg,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 8
                }}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={{ fontSize: 12.5, fontWeight: FontWeight.bold, color: '#0F172A', textAlign: 'center' }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 }} numberOfLines={1}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── AI Health Insights Banner ──────────────────────────────── */}
        <TouchableOpacity
          style={{
            marginHorizontal: 0,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#0C1A2E',
            padding: Spacing[4],
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing[3],
            ...Shadows.md,
          }}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('AIHealthInsights')}
        >
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(6,182,212,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="analytics" size={24} color={Colors.patient} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#FFFFFF' }}>
              AI Health Insights
            </Text>
            <Text style={{ fontSize: FontSize.xs, color: '#94A3B8', marginTop: 2, lineHeight: 16 }}>
              Personalized analysis of your vitals, records and medication history
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.patient} />
        </TouchableOpacity>

        {/* ── Specialities ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Specialities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Specialists')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specRow}>
            {SPECIALITIES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.specChip}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Specialists', { specialty: s.name })}
              >
                <View style={[styles.specIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon as any} size={22} color={s.color} />
                </View>
                <Text style={styles.specLabel}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Top Doctors ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Top Doctors</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Specialists')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.docRow}>
            {FEATURED_DOCTORS.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id })}
              >
                <View style={styles.docAvatarWrap}>
                  <Avatar name={doc.name} uri={doc.avatar} size="lg" />
                  <View style={[styles.availDot, { backgroundColor: doc.available ? '#10B981' : '#94A3B8' }]} />
                </View>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docSpec}>{doc.spec}</Text>
                <View style={styles.docRatingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.docRating}>{doc.rating}</Text>
                  <Text style={styles.docPatients}>· {doc.patients.toLocaleString()} pts</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Recent Prescriptions ─────────────────────────────────────── */}
        {recentPrescriptions?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PrescriptionHistory')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentPrescriptions.slice(0, 2).map((presc: any) => (
              <TouchableOpacity
                key={presc.id}
                style={styles.prescCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PrescriptionHistory', { prescriptionId: presc.id })}
              >
                <View style={styles.prescIconBg}>
                  <Ionicons name="medkit" size={18} color={Colors.secondary[600]} />
                </View>
                <View style={styles.prescInfo}>
                  <Text style={styles.prescDiagnosis} numberOfLines={1}>{presc.diagnosis}</Text>
                  <Text style={styles.prescMeds} numberOfLines={1}>
                    {presc.medications?.map((m: any) => m.name).join(', ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.neutral[400]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Edit Temperature Modal */}
      <AppModal
        visible={isEditTempOpen}
        onClose={() => setIsEditTempOpen(false)}
        title="Update Temperature"
        contentStyle={{ alignSelf: 'center' }}
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsEditTempOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save"
              onPress={handleSaveTemp}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <View style={{ padding: Spacing[4], gap: Spacing[4] }}>
          <Text style={{ fontSize: FontSize.sm, color: Colors.text.secondary }}>
            Enter your current body temperature in Celsius (°C).
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderWidth: 1.5,
            borderColor: Colors.border,
            borderRadius: 12,
            height: 52,
            paddingHorizontal: Spacing[3],
          }}>
            <TextInput
              placeholder="e.g. 36.6"
              value={inputTemp}
              onChangeText={setInputTemp}
              keyboardType="numeric"
              autoFocus={true}
              style={{
                flex: 1,
                fontSize: FontSize.base,
                color: Colors.text.primary,
                paddingVertical: 0,
              }}
            />
          </View>
        </View>
      </AppModal>

      {/* Vitals Input Modal */}
      <AppModal
        visible={isEditVitalsOpen}
        onClose={() => setIsEditVitalsOpen(false)}
        title="Check & Measure Vitals"
        footer={
          <View style={{ flexDirection: 'row', gap: Spacing[3], width: '100%' }}>
            <Button
              variant="outline"
              label="Cancel"
              onPress={() => setIsEditVitalsOpen(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Save Vitals"
              onPress={handleSaveVitals}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <View style={{ padding: Spacing[4], gap: Spacing[4] }}>
          <Text style={{ fontSize: FontSize.sm, color: Colors.text.secondary }}>
            Measure and enter your current vitals below to update your medical record.
          </Text>

          <Input
            label="Blood Pressure (mmHg)"
            placeholder="e.g. 120/80"
            value={inputBP}
            onChangeText={setInputBP}
            leftIcon="heart-outline"
          />

          <Input
            label="Heart Rate (bpm)"
            placeholder="e.g. 72"
            value={inputHR}
            onChangeText={setInputHR}
            keyboardType="numeric"
            leftIcon="pulse-outline"
          />

          <Input
            label="Body Temperature (°C)"
            placeholder="e.g. 36.6"
            value={inputTempField}
            onChangeText={setInputTempField}
            keyboardType="numeric"
            leftIcon="thermometer-outline"
          />
        </View>
      </AppModal>

      {/* ── See All Quick Access Modal ─────────────────────────────────────── */}
      <AppModal
        visible={isSeeAllQuickAccessOpen}
        onClose={() => setIsSeeAllQuickAccessOpen(false)}
        title="All Quick Access Features"
      >
        <View style={{ padding: Spacing[4], gap: 12 }}>
          <Text style={{ fontSize: 12, color: Colors.text.secondary, marginBottom: 4 }}>
            Select a medical feature to navigate directly:
          </Text>

          <View style={{ gap: 8 }}>
            {allQuickActions.map((act) => (
              <TouchableOpacity
                key={act.label}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12,
                  borderWidth: 1, borderColor: '#E2E8F0'
                }}
                onPress={act.action}
                activeOpacity={0.75}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 20, backgroundColor: act.bg,
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Ionicons name={act.icon as any} size={20} color={act.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: FontWeight.bold, color: '#0F172A' }}>
                    {act.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    {act.desc}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </AppModal>

      {/* ── Filter / Specialty Modal ─────────────────────────────────────── */}
      <AppModal
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter by Specialty"
      >
        <View style={{ padding: Spacing[4] }}>
          <Text style={{ fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: Spacing[4] }}>
            Pick a specialty to browse matching doctors.
          </Text>

          {/* All Doctors shortcut */}
          <TouchableOpacity
            style={styles.filterRow}
            activeOpacity={0.75}
            onPress={() => {
              setIsFilterOpen(false);
              navigation.navigate('BookAppointment');
            }}
          >
            <View style={[styles.filterIcon, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="people" size={18} color="#64748B" />
            </View>
            <Text style={styles.filterLabel}>All Doctors</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>

          {SPECIALITIES.map((sp) => (
            <TouchableOpacity
              key={sp.id}
              style={styles.filterRow}
              activeOpacity={0.75}
              onPress={() => {
                setIsFilterOpen(false);
                navigation.navigate('Specialists', { specialty: sp.name });
              }}
            >
              <View style={[styles.filterIcon, { backgroundColor: sp.bg }]}>
                <Ionicons name={sp.icon as any} size={18} color={sp.color} />
              </View>
              <Text style={styles.filterLabel}>{sp.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TEAL = '#0EA5E9';
const DARK = '#0F172A';

const styles = StyleSheet.create({

  // ── Layout
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },


  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  greetLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  greetName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: DARK,
    marginTop: 1,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  msgBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },

  // ── Scroll
  scroll: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
    gap: Spacing[6],
  },

  // ── Upcoming Appointment Banner
  apptBanner: {
    backgroundColor: DARK,
    borderRadius: 20,
    padding: Spacing[5],
    overflow: 'hidden',
    ...Shadows.md,
  },
  apptBannerGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  apptBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  apptBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  apptBannerBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  apptBannerSeeAll: {
    fontSize: FontSize.xs,
    color: '#64748B',
    fontWeight: FontWeight.medium,
  },
  apptBannerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  apptBannerInfo: {
    flex: 1,
    gap: 4,
  },
  apptBannerDoc: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  apptBannerSpec: {
    fontSize: FontSize.xs,
    color: '#94A3B8',
    fontWeight: FontWeight.medium,
  },
  apptBannerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  apptBannerMetaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  apptBannerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: TEAL,
    paddingVertical: 13,
    borderRadius: 14,
  },
  joinBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },

  // ── Book CTA (fallback when no appointment)
  bookCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary[600],
    borderRadius: 16,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[5],
    ...Shadows.sm,
  },
  bookCtaTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bookCtaSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  bookCtaBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 10,
  },
  bookCtaBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
  },

  // ── Sections
  section: {
    gap: Spacing[3],
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: DARK,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: TEAL,
  },

  // ── Quick Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    gap: Spacing[2],
    flex: 1,
  },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: '#475569',
    textAlign: 'center',
  },

  // ── Specialities
  specRow: {
    gap: Spacing[3],
    paddingBottom: 4,
  },
  specChip: {
    alignItems: 'center',
    gap: Spacing[2],
    width: 68,
  },
  specIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: '#475569',
    textAlign: 'center',
  },

  // ── Doctor Cards
  docRow: {
    gap: Spacing[3],
    paddingBottom: 4,
  },
  docCard: {
    width: 152,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  docAvatarWrap: {
    position: 'relative',
    marginBottom: Spacing[2],
  },
  availDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  docName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: DARK,
    textAlign: 'center',
  },
  docSpec: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  docRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  docRating: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#92400E',
  },
  docPatients: {
    fontSize: 10,
    color: '#94A3B8',
  },
  docBookBtn: {
    marginTop: Spacing[2],
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  docBookBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#2563EB',
  },

  // ── Prescriptions
  prescCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[4],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.xs,
  },
  prescIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescInfo: {
    flex: 1,
    gap: 3,
  },
  prescDiagnosis: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: DARK,
  },
  prescMeds: {
    fontSize: FontSize.xs,
    color: '#64748B',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginTop: Spacing[1],
  },
  vitalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing[3],
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.xs,
    gap: 2,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vitalLabel: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: '#64748B',
  },
  vitalValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: DARK,
    marginTop: 4,
  },
  vitalUnit: {
    fontSize: 10,
    color: '#94A3B8',
  },
  vitalsUpdated: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: FontWeight.medium,
  },

  // ── Filter Modal
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: Spacing[3],
  },
  filterIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    flex: 1,
    fontSize: FontSize.base,
    color: '#1E2A2A',
    fontWeight: FontWeight.medium,
  },
});
