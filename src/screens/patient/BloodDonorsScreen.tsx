import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../theme';
import { useToast } from '../../hooks/useAuth';
import { HeartbeatLoader, HeartbeatRefreshControl, HeartbeatRefreshHeader } from '../../components';

export interface HospitalBloodBank {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  accreditedBy: string;
  stock: Record<string, number>;
  acceptingDonations: boolean;
  screeningHours: string;
  facilityDeskPhone: string;
}

export interface BloodRequestPipeline {
  id: string;
  patientName: string;
  relativeName: string;
  relationship: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: 'Standard' | 'Urgent' | 'Critical Surgery';
  hospitalName: string;
  hospitalWard: string;
  attendingDoctor: string;
  timestamp: string;
  // Exact 8-stage flow as specified
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  matchedDonorsCount: number;
  respondedDonorsCount: number;
  screenedAtFacility: boolean;
  donationCompleted: boolean;
}

const FLOW_STAGES = [
  { step: 1, title: 'Request Created', desc: 'Patient / Relative submitted details' },
  { step: 2, title: 'Hospital Details Attached', desc: 'Facility, ward & doctor confirmed' },
  { step: 3, title: 'OminiPulse Verified', desc: 'Clinical legitimacy verified by platform' },
  { step: 4, title: 'Donors Matched', desc: 'Compatible AA-genotype donors found' },
  { step: 5, title: 'Donors Notified', desc: 'System dispatched in-app alerts' },
  { step: 6, title: 'Donor Responded', desc: 'Volunteer accepted to donate at facility' },
  { step: 7, title: 'Facility Screening', desc: 'Hospital handles Hb, vitals & blood tests' },
  { step: 8, title: 'Donation Completed', desc: 'Collection done at approved center • Closed' },
];

const BLOOD_GROUPS = ['ALL', 'O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const ACCREDITED_HOSPITALS: HospitalBloodBank[] = [
  {
    id: 'h-1',
    name: 'Lagos University Teaching Hospital (LUTH)',
    category: 'Federal Teaching Hospital',
    address: 'Idi-Araba, Surulere',
    city: 'Lagos',
    state: 'Lagos State',
    distanceKm: 3.2,
    accreditedBy: 'NBTS & NBSC Certified',
    stock: { 'O-': 3, 'O+': 22, 'A+': 14, 'A-': 2, 'B+': 11, 'B-': 1, 'AB+': 6, 'AB-': 0 },
    acceptingDonations: true,
    screeningHours: 'Mon – Sat: 8:00 AM – 5:00 PM',
    facilityDeskPhone: '+234 1 774 0230',
  },
  {
    id: 'h-2',
    name: 'Lagos General Hospital Marina Blood Bank',
    category: 'State General Hospital',
    address: '1–3 Broad Street, Lagos Island',
    city: 'Lagos Island',
    state: 'Lagos State',
    distanceKm: 5.8,
    accreditedBy: 'LSMOH Blood Safety Certified',
    stock: { 'O-': 5, 'O+': 18, 'A+': 9, 'A-': 3, 'B+': 8, 'B-': 2, 'AB+': 4, 'AB-': 1 },
    acceptingDonations: true,
    screeningHours: 'Daily: 24/7 Transfusion Center',
    facilityDeskPhone: '+234 1 263 1111',
  },
  {
    id: 'h-3',
    name: 'National Hospital Abuja Blood Transfusion Unit',
    category: 'Federal Tertiary Hospital',
    address: 'Plot 132 Central Area, Garki',
    city: 'Abuja',
    state: 'FCT Abuja',
    distanceKm: 8.4,
    accreditedBy: 'National Blood Service Commission',
    stock: { 'O-': 2, 'O+': 15, 'A+': 8, 'A-': 1, 'B+': 6, 'B-': 0, 'AB+': 3, 'AB-': 0 },
    acceptingDonations: true,
    screeningHours: 'Mon – Sun: 8:00 AM – 7:00 PM',
    facilityDeskPhone: '+234 9 234 0001',
  },
  {
    id: 'h-4',
    name: 'Eko Hospital Blood Bank & Lab',
    category: 'Private Multi-Specialist Center',
    address: '31 Mobolaji Bank Anthony Way, Ikeja',
    city: 'Ikeja',
    state: 'Lagos State',
    distanceKm: 1.9,
    accreditedBy: 'HEFAMAA Accredited',
    stock: { 'O-': 1, 'O+': 12, 'A+': 6, 'A-': 1, 'B+': 7, 'B-': 1, 'AB+': 2, 'AB-': 0 },
    acceptingDonations: true,
    screeningHours: 'Mon – Sat: 8:30 AM – 6:00 PM',
    facilityDeskPhone: '+234 1 270 0000',
  },
];

export default function BloodDonorsScreen({ navigation, route }: any) {
  const initialBg = route?.params?.initialBloodGroup || 'ALL';
  const { success: toastSuccess, error: toastError } = useToast();

  // Active Screen Tab: 'find' (Patient/Relative) vs 'donate' (Volunteer Donor)
  const [activeTab, setActiveTab] = useState<'find' | 'donate'>('find');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>(initialBg);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Request Pipeline (Stage 1 to 8)
  const [activePipeline, setActivePipeline] = useState<BloodRequestPipeline | null>({
    id: 'REQ-8821',
    patientName: 'Amara Okafor',
    relativeName: 'Chidi Okafor',
    relationship: 'Brother',
    bloodGroup: 'O-',
    unitsNeeded: 2,
    urgency: 'Critical Surgery',
    hospitalName: 'Lagos University Teaching Hospital (LUTH)',
    hospitalWard: 'Emergency Surgical Ward 3B',
    attendingDoctor: 'Dr. T. Adeyemi',
    timestamp: 'Today, 08:30 AM',
    stage: 5,
    matchedDonorsCount: 6,
    respondedDonorsCount: 2,
    screenedAtFacility: false,
    donationCompleted: false,
  });

  // Modals
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [isRegisterDonorModalOpen, setIsRegisterDonorModalOpen] = useState(false);
  const [selectedHospitalDetail, setSelectedHospitalDetail] = useState<HospitalBloodBank | null>(null);

  // Create Request Form State
  const [reqPatient, setReqPatient] = useState('');
  const [reqRelative, setReqRelative] = useState('');
  const [reqRelationship, setReqRelationship] = useState('Relative');
  const [reqBloodGroup, setReqBloodGroup] = useState('O-');
  const [reqUnits, setReqUnits] = useState('2');
  const [reqHospital, setReqHospital] = useState(ACCREDITED_HOSPITALS[0].name);
  const [reqWard, setReqWard] = useState('');
  const [reqDoctor, setReqDoctor] = useState('');
  const [reqUrgency, setReqUrgency] = useState<'Standard' | 'Urgent' | 'Critical Surgery'>('Urgent');

  // Registered Volunteer Donor State (for current logged in user)
  const [myDonorStatus, setMyDonorStatus] = useState<{
    registered: boolean;
    name: string;
    bloodGroup: string;
    genotype: string;
    lastDonationDate: string;
    approvedFacility: string;
  }>({
    registered: true,
    name: 'Samuel Eze',
    bloodGroup: 'O+',
    genotype: 'AA',
    lastDonationDate: '12 Nov 2025',
    approvedFacility: 'Lagos General Hospital Marina',
  });

  // Pull-to-refresh handler with Heartbeat animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toastSuccess('Blood Bank Stock Updated', 'Synchronized live inventory with accredited facility networks.');
    }, 1100);
  };

  // Submit Blood Request through the official 8-stage flow
  const handleCreateRequestSubmit = () => {
    if (!reqPatient.trim() || !reqRelative.trim() || !reqWard.trim()) {
      toastError('Missing Information', 'Please provide patient name, your name, and hospital ward.');
      return;
    }

    const newRequest: BloodRequestPipeline = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: reqPatient.trim(),
      relativeName: reqRelative.trim(),
      relationship: reqRelationship,
      bloodGroup: reqBloodGroup,
      unitsNeeded: parseInt(reqUnits, 10) || 1,
      urgency: reqUrgency,
      hospitalName: reqHospital,
      hospitalWard: reqWard.trim(),
      attendingDoctor: reqDoctor.trim() || 'Attending Physician',
      timestamp: 'Just now',
      stage: 3, // Immediately moves through Stage 1 -> 2 -> 3 (OminiPulse auto-verifies license)
      matchedDonorsCount: 4,
      respondedDonorsCount: 0,
      screenedAtFacility: false,
      donationCompleted: false,
    };

    setActivePipeline(newRequest);
    setIsCreateRequestModalOpen(false);

    Alert.alert(
      'Blood Request Submitted to Hospital Network',
      `Your request for ${reqUnits} units of ${reqBloodGroup} at ${reqHospital} has been submitted.\n\nFlow initiated:\n• Stage 1 & 2: Patient and Hospital Details Attached\n• Stage 3: OminiPulse Automated Verification Active\n• Stage 4: Matching compatible AA-genotype donors\n• Stage 5: In-app notifications will be sent to suitable donors\n\nNo individual phone calls or messaging needed. All donations are screened and conducted safely at ${reqHospital}.`,
      [{ text: 'View Pipeline Status' }]
    );

    // Reset Form
    setReqPatient('');
    setReqRelative('');
    setReqWard('');
    setReqDoctor('');
  };

  // Donor chooses to respond and volunteer for a verified hospital appeal
  const handleDonorRespond = (hospitalName: string, bloodGroupNeeded: string) => {
    Alert.alert(
      'Confirm Donation at Approved Facility',
      `You are volunteering to donate ${bloodGroupNeeded} blood for a verified medical request at:\n\n🏥 ${hospitalName}\n\n• You will NOT be contacted by strangers or asked to message anyone.\n• You will report directly to the hospital laboratory for your pre-donation screening (hemoglobin & vitals check).\n• Proceed to accept?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Book Screening',
          style: 'default',
          onPress: () => {
            if (activePipeline) {
              setActivePipeline({
                ...activePipeline,
                stage: 6,
                respondedDonorsCount: activePipeline.respondedDonorsCount + 1,
              });
            }
            toastSuccess('Screening Scheduled!', `Pre-donation appointment logged at ${hospitalName}. Please present your OminiPulse Donor ID at the laboratory reception.`);
          },
        },
      ]
    );
  };

  // Filtered Hospital List
  const filteredHospitals = useMemo(() => {
    return ACCREDITED_HOSPITALS.filter((h) => {
      const matchSearch =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedBloodGroup === 'ALL') return matchSearch;
      const count = h.stock[selectedBloodGroup] || 0;
      return matchSearch && count > 0;
    });
  }, [searchQuery, selectedBloodGroup]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Blood Services</Text>
          <View style={styles.headerBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#059669" />
            <Text style={styles.headerBadgeText}>Verified Hospital Network</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => setIsCreateRequestModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.headerActionBtnText}>Request</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2-Segment Switcher: Find Blood vs Donate Blood ──────────────────── */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'find' && styles.tabButtonActive]}
          onPress={() => setActiveTab('find')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color={activeTab === 'find' ? '#DC2626' : Colors.text.secondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'find' && styles.tabButtonTextActive,
            ]}
          >
            Find Blood / Hospitals
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'donate' && styles.tabButtonActive]}
          onPress={() => setActiveTab('donate')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="heart-outline"
            size={16}
            color={activeTab === 'donate' ? '#DC2626' : Colors.text.secondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'donate' && styles.tabButtonTextActive,
            ]}
          >
            Volunteer to Donate
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <HeartbeatRefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            color="#DC2626"
          />
        }
      >
        <HeartbeatRefreshHeader
          refreshing={isRefreshing}
          color="#DC2626"
          message="Scanning verified hospital blood banks..."
        />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: FIND BLOOD (Patients & Relatives)                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'find' && (
          <View style={styles.sectionContainer}>
            {/* Primary Action Card: Create Blood Request */}
            <TouchableOpacity
              style={styles.requestHeroCard}
              onPress={() => setIsCreateRequestModalOpen(true)}
              activeOpacity={0.88}
            >
              <View style={styles.requestHeroLeft}>
                <View style={styles.requestHeroIconCircle}>
                  <Ionicons name="water" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestHeroTitle}>Need Blood for a Patient?</Text>
                  <Text style={styles.requestHeroSubtitle}>
                    Route verified request to accredited hospital blood banks and eligible AA donors.
                  </Text>
                </View>
              </View>
              <View style={styles.requestHeroBtn}>
                <Text style={styles.requestHeroBtnText}>Create Request</Text>
                <Ionicons name="arrow-forward" size={14} color="#DC2626" />
              </View>
            </TouchableOpacity>

            {/* Active Request Pipeline (The Exact 8-Stage Workflow) */}
            {activePipeline && (
              <View style={styles.pipelineCard}>
                <View style={styles.pipelineHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="pulse" size={16} color="#DC2626" />
                    <Text style={styles.pipelineTitle}>Active Blood Request</Text>
                  </View>
                  <View style={styles.pipelineBadge}>
                    <Text style={styles.pipelineBadgeText}>
                      Stage {activePipeline.stage} of 8
                    </Text>
                  </View>
                </View>

                <View style={styles.pipelineDetails}>
                  <View style={styles.pipelineDetailCol}>
                    <Text style={styles.pipelineDetailLabel}>Patient</Text>
                    <Text style={styles.pipelineDetailVal}>{activePipeline.patientName}</Text>
                  </View>
                  <View style={styles.pipelineDetailCol}>
                    <Text style={styles.pipelineDetailLabel}>Required</Text>
                    <Text style={[styles.pipelineDetailVal, { color: '#DC2626', fontWeight: FontWeight.bold }]}>
                      {activePipeline.unitsNeeded} Units • {activePipeline.bloodGroup}
                    </Text>
                  </View>
                  <View style={styles.pipelineDetailCol}>
                    <Text style={styles.pipelineDetailLabel}>Hospital</Text>
                    <Text style={styles.pipelineDetailVal} numberOfLines={1}>
                      {activePipeline.hospitalName.split('(')[0].trim()}
                    </Text>
                  </View>
                </View>

                {/* Visual 8-Step Timeline */}
                <View style={styles.timelineContainer}>
                  <Text style={styles.timelineSectionTitle}>Workflow Pipeline (No direct contacts)</Text>
                  {FLOW_STAGES.map((s) => {
                    const isPassed = activePipeline.stage > s.step;
                    const isCurrent = activePipeline.stage === s.step;
                    return (
                      <View key={s.step} style={styles.timelineRow}>
                        <View style={styles.timelineIndicatorCol}>
                          <View
                            style={[
                              styles.timelineDot,
                              isPassed && styles.timelineDotPassed,
                              isCurrent && styles.timelineDotCurrent,
                            ]}
                          >
                            {isPassed ? (
                              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                            ) : isCurrent ? (
                              <View style={styles.timelineDotPulse} />
                            ) : (
                              <Text style={styles.timelineDotNum}>{s.step}</Text>
                            )}
                          </View>
                          {s.step < 8 && (
                            <View
                              style={[
                                styles.timelineLine,
                                isPassed && styles.timelineLinePassed,
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.timelineTextCol}>
                          <Text
                            style={[
                              styles.timelineStepTitle,
                              isCurrent && styles.timelineStepTitleCurrent,
                            ]}
                          >
                            {s.step}. {s.title}
                          </Text>
                          <Text style={styles.timelineStepDesc}>
                            {s.step === 4 && activePipeline.matchedDonorsCount > 0
                              ? `Found ${activePipeline.matchedDonorsCount} compatible AA donors nearby`
                              : s.step === 5
                              ? `In-app push notifications dispatched`
                              : s.step === 6 && activePipeline.respondedDonorsCount > 0
                              ? `${activePipeline.respondedDonorsCount} donor(s) confirmed to attend hospital lab`
                              : s.desc}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Accredited Hospital Blood Banks Section */}
            <View style={styles.hospitalsSectionHeader}>
              <View>
                <Text style={styles.sectionHeading}>Hospital Blood Banks & Stock</Text>
                <Text style={styles.sectionSubheading}>
                  Accredited facilities with inventory or active donor intake
                </Text>
              </View>
            </View>

            {/* Blood Group Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bloodFilterRow}
            >
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = selectedBloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodPill, isSelected && styles.bloodPillActive]}
                    onPress={() => setSelectedBloodGroup(bg)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.bloodPillText,
                        isSelected && styles.bloodPillTextActive,
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Hospitals Inventory Cards */}
            {filteredHospitals.map((hosp) => (
              <View key={hosp.id} style={styles.hospitalCard}>
                <View style={styles.hospitalCardTop}>
                  <View style={styles.hospitalIconCircle}>
                    <Ionicons name="business" size={20} color="#0F6E6E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hospitalName} numberOfLines={1}>
                      {hosp.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="location-outline" size={12} color={Colors.text.secondary} />
                      <Text style={styles.hospitalAddress} numberOfLines={1}>
                        {hosp.address} • {hosp.distanceKm} km away
                      </Text>
                    </View>
                  </View>
                  <View style={styles.accreditPill}>
                    <Text style={styles.accreditPillText}>Accredited</Text>
                  </View>
                </View>

                {/* Stock Chips */}
                <View style={styles.stockRow}>
                  <Text style={styles.stockRowLabel}>Current Stock:</Text>
                  <View style={styles.stockChipsWrap}>
                    {Object.entries(hosp.stock).map(([bg, count]) => {
                      const isHighlighted = selectedBloodGroup === bg;
                      return (
                        <View
                          key={bg}
                          style={[
                            styles.stockChip,
                            count > 0 ? styles.stockChipAvailable : styles.stockChipEmpty,
                            isHighlighted && styles.stockChipHighlighted,
                          ]}
                        >
                          <Text
                            style={[
                              styles.stockChipText,
                              isHighlighted && styles.stockChipTextHighlighted,
                            ]}
                          >
                            {bg}: {count}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Facility Info & Action */}
                <View style={styles.hospitalFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time-outline" size={13} color={Colors.text.secondary} />
                    <Text style={styles.screeningHoursText}>{hosp.screeningHours}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.requestFromHospBtn}
                    onPress={() => {
                      setReqHospital(hosp.name);
                      setIsCreateRequestModalOpen(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.requestFromHospBtnText}>Request from Facility</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: DONATE BLOOD (Volunteer Donors)                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'donate' && (
          <View style={styles.sectionContainer}>
            {/* Donor Profile Card */}
            {myDonorStatus.registered ? (
              <View style={styles.donorProfileCard}>
                <View style={styles.donorProfileHeader}>
                  <View style={styles.donorAvatarCircle}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.donorName}>{myDonorStatus.name}</Text>
                    <Text style={styles.donorMeta}>
                      Donor Status: <Text style={{ color: '#059669', fontWeight: FontWeight.bold }}>Active & Eligible</Text>
                    </Text>
                  </View>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeBadgeText}>{myDonorStatus.bloodGroup}</Text>
                  </View>
                </View>

                <View style={styles.donorStatsRow}>
                  <View style={styles.donorStatBox}>
                    <Text style={styles.donorStatLabel}>Genotype</Text>
                    <Text style={styles.donorStatVal}>{myDonorStatus.genotype} (Clear)</Text>
                  </View>
                  <View style={styles.donorStatBox}>
                    <Text style={styles.donorStatLabel}>Last Donated</Text>
                    <Text style={styles.donorStatVal}>{myDonorStatus.lastDonationDate}</Text>
                  </View>
                  <View style={styles.donorStatBox}>
                    <Text style={styles.donorStatLabel}>Screening Center</Text>
                    <Text style={styles.donorStatVal} numberOfLines={1}>
                      {myDonorStatus.approvedFacility.split(' ')[0]}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.becomeDonorCard}>
                <Ionicons name="heart" size={32} color="#DC2626" />
                <Text style={styles.becomeDonorTitle}>Register as a Volunteer Donor</Text>
                <Text style={styles.becomeDonorSub}>
                  OminiPulse maintains a secure, institutional donor directory. You will only receive official hospital appeals.
                </Text>
                <TouchableOpacity
                  style={styles.registerDonorBtn}
                  onPress={() => setIsRegisterDonorModalOpen(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.registerDonorBtnText}>Register Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Active Hospital Appeals for Donors */}
            <View style={{ marginTop: Spacing[4] }}>
              <View style={styles.hospitalsSectionHeader}>
                <View>
                  <Text style={styles.sectionHeading}>Verified Hospital Appeals</Text>
                  <Text style={styles.sectionSubheading}>
                    Hospitals currently requesting volunteer blood donations
                  </Text>
                </View>
              </View>

              {/* Appeal Card 1 */}
              <View style={styles.appealCard}>
                <View style={styles.appealTop}>
                  <View style={styles.appealBloodPill}>
                    <Text style={styles.appealBloodText}>O-</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.appealHospName}>Lagos University Teaching Hospital</Text>
                    </View>
                    <Text style={styles.appealReason}>Urgent Surgery • 2 Units Needed</Text>
                  </View>
                  <View style={styles.urgencyBadge}>
                    <Text style={styles.urgencyBadgeText}>CRITICAL</Text>
                  </View>
                </View>
                <Text style={styles.appealNotice}>
                  Official verified hospital appeal. Screening and donation take place at the LUTH Blood Transfusion Lab.
                </Text>
                <TouchableOpacity
                  style={styles.volunteerBtn}
                  onPress={() => handleDonorRespond('Lagos University Teaching Hospital', 'O-')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="heart" size={15} color="#FFFFFF" />
                  <Text style={styles.volunteerBtnText}>Volunteer to Donate at Hospital</Text>
                </TouchableOpacity>
              </View>

              {/* Appeal Card 2 */}
              <View style={styles.appealCard}>
                <View style={styles.appealTop}>
                  <View style={[styles.appealBloodPill, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.appealBloodText, { color: '#2563EB' }]}>O+</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.appealHospName}>General Hospital Marina</Text>
                    <Text style={styles.appealReason}>Maternity Delivery Support • 1 Unit Needed</Text>
                  </View>
                  <View style={[styles.urgencyBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.urgencyBadgeText, { color: '#92400E' }]}>URGENT</Text>
                  </View>
                </View>
                <Text style={styles.appealNotice}>
                  Pre-donation Hb and vitals check conducted on arrival at the hospital donor clinic.
                </Text>
                <TouchableOpacity
                  style={[styles.volunteerBtn, { backgroundColor: '#2563EB' }]}
                  onPress={() => handleDonorRespond('General Hospital Marina', 'O+')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="heart" size={15} color="#FFFFFF" />
                  <Text style={styles.volunteerBtnText}>Volunteer to Donate at Hospital</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Modal: Create Blood Request (8-Stage Flow Initiation) ─────────── */}
      <Modal
        visible={isCreateRequestModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateRequestModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Blood Request</Text>
                <Text style={styles.modalSub}>Stages 1 & 2: Patient & Hospital Details</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCreateRequestModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {/* Notice */}
              <View style={styles.modalSafetyNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.modalSafetyText}>
                  All requests are verified through hospital records. No personal contact numbers are displayed to donors.
                </Text>
              </View>

              {/* Patient Name */}
              <View>
                <Text style={styles.inputLabel}>Patient Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Amara Okafor"
                  value={reqPatient}
                  onChangeText={setReqPatient}
                />
              </View>

              {/* Relative Name & Relationship */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Your Name (Requester) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Chidi Okafor"
                    value={reqRelative}
                    onChangeText={setReqRelative}
                  />
                </View>
                <View style={{ width: 110 }}>
                  <Text style={styles.inputLabel}>Relationship</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Brother"
                    value={reqRelationship}
                    onChangeText={setReqRelationship}
                  />
                </View>
              </View>

              {/* Blood Group & Units */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Blood Group Needed *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                    {['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <TouchableOpacity
                        key={bg}
                        style={[
                          styles.modalBgPill,
                          reqBloodGroup === bg && styles.modalBgPillActive,
                        ]}
                        onPress={() => setReqBloodGroup(bg)}
                      >
                        <Text
                          style={[
                            styles.modalBgPillText,
                            reqBloodGroup === bg && styles.modalBgPillTextActive,
                          ]}
                        >
                          {bg}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={{ width: 80 }}>
                  <Text style={styles.inputLabel}>Units</Text>
                  <TextInput
                    style={[styles.textInput, { textAlign: 'center' }]}
                    keyboardType="numeric"
                    value={reqUnits}
                    onChangeText={setReqUnits}
                  />
                </View>
              </View>

              {/* Hospital Selection */}
              <View>
                <Text style={styles.inputLabel}>Attending Hospital / Blood Bank *</Text>
                <TextInput
                  style={styles.textInput}
                  value={reqHospital}
                  onChangeText={setReqHospital}
                  placeholder="Select hospital"
                />
              </View>

              {/* Hospital Ward & Doctor */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Ward / Room / Bed *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. ICU Bed 4 / Ward 3B"
                    value={reqWard}
                    onChangeText={setReqWard}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Attending Physician</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Dr. Adeyemi"
                    value={reqDoctor}
                    onChangeText={setReqDoctor}
                  />
                </View>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                style={styles.submitRequestBtn}
                onPress={handleCreateRequestSubmit}
                activeOpacity={0.88}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.submitRequestBtnText}>Submit to OminiPulse Verification</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Register as Donor ─────────────────────────────────────── */}
      <Modal
        visible={isRegisterDonorModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsRegisterDonorModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Donor Registration</Text>
                <Text style={styles.modalSub}>Verified AA-Genotype Lifesaver Program</Text>
              </View>
              <TouchableOpacity onPress={() => setIsRegisterDonorModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14 }}>
              <View style={styles.modalSafetyNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.modalSafetyText}>
                  Your contact information is strictly protected. Only official accredited hospitals receive donation authorizations.
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: Colors.text.secondary, lineHeight: 18 }}>
                Criteria for registration:
                {'\n'}• Age between 18 and 65
                {'\n'}• Weight at least 50 kg
                {'\n'}• AA Genotype (platform requirement for donor safety)
                {'\n'}• Pre-donation screening completed at certified hospital lab
              </Text>
              <TouchableOpacity
                style={styles.submitRequestBtn}
                onPress={() => {
                  setMyDonorStatus({
                    registered: true,
                    name: 'Registered Donor',
                    bloodGroup: 'O+',
                    genotype: 'AA',
                    lastDonationDate: 'Pending first donation',
                    approvedFacility: 'Accredited General Hospital',
                  });
                  setIsRegisterDonorModalOpen(false);
                  toastSuccess('Registration Complete', 'You are now an active volunteer donor in the verified network.');
                }}
                activeOpacity={0.88}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.submitRequestBtnText}>Confirm Eligibility & Register</Text>
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerBadgeText: {
    fontSize: 10.5,
    fontWeight: FontWeight.medium,
    color: '#059669',
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  headerActionBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  tabButtonActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  tabButtonTextActive: {
    color: '#DC2626',
    fontWeight: FontWeight.bold,
  },
  scrollContent: {
    padding: Spacing[4],
    paddingBottom: 40,
  },
  sectionContainer: {
    gap: Spacing[3],
  },
  requestHeroCard: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  requestHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  requestHeroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestHeroTitle: {
    fontSize: 14.5,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  requestHeroSubtitle: {
    fontSize: 11,
    color: '#FEE2E2',
    marginTop: 2,
    lineHeight: 15,
  },
  requestHeroBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },
  requestHeroBtnText: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  pipelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
    gap: 12,
  },
  pipelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipelineTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  pipelineBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pipelineBadgeText: {
    fontSize: 10.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  pipelineDetails: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  pipelineDetailCol: {
    flex: 1,
  },
  pipelineDetailLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  pipelineDetailVal: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginTop: 2,
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  timelineSectionTitle: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 34,
  },
  timelineIndicatorCol: {
    width: 22,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotPassed: {
    backgroundColor: '#10B981',
  },
  timelineDotCurrent: {
    backgroundColor: '#DC2626',
  },
  timelineDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  timelineDotNum: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#94A3B8',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  timelineLinePassed: {
    backgroundColor: '#10B981',
  },
  timelineTextCol: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 8,
  },
  timelineStepTitle: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  timelineStepTitleCurrent: {
    color: '#DC2626',
    fontWeight: FontWeight.bold,
  },
  timelineStepDesc: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  hospitalsSectionHeader: {
    marginTop: Spacing[2],
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  sectionSubheading: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  bloodFilterRow: {
    gap: 6,
    paddingVertical: 4,
  },
  bloodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bloodPillActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  bloodPillText: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  bloodPillTextActive: {
    color: '#FFFFFF',
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
    gap: 10,
  },
  hospitalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hospitalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 110, 110, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalName: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  hospitalAddress: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  accreditPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  accreditPillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#059669',
  },
  stockRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  stockRowLabel: {
    fontSize: 10.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  stockChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  stockChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockChipAvailable: {
    backgroundColor: '#E0F2FE',
  },
  stockChipEmpty: {
    backgroundColor: '#F1F5F9',
  },
  stockChipHighlighted: {
    backgroundColor: '#DC2626',
  },
  stockChipText: {
    fontSize: 10.5,
    fontWeight: FontWeight.medium,
    color: '#0369A1',
  },
  stockChipTextHighlighted: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  hospitalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  screeningHoursText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  requestFromHospBtn: {
    backgroundColor: '#0F6E6E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  requestFromHospBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  donorProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
    gap: 12,
  },
  donorProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donorAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorName: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  donorMeta: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  bloodTypeBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  bloodTypeBadgeText: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  donorStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  donorStatBox: {
    flex: 1,
  },
  donorStatLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  donorStatVal: {
    fontSize: 11.5,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    marginTop: 2,
  },
  becomeDonorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[5],
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
    gap: 8,
  },
  becomeDonorTitle: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  becomeDonorSub: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  registerDonorBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  registerDonorBtnText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  appealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing[3],
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Shadows.sm,
    gap: 8,
    marginTop: 10,
  },
  appealTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appealBloodPill: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appealBloodText: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  appealHospName: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  appealReason: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  urgencyBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  urgencyBadgeText: {
    fontSize: 9.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  appealNotice: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 15,
  },
  volunteerBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 2,
  },
  volunteerBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing[4],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  modalSub: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  modalSafetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  modalSafetyText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    lineHeight: 15,
  },
  inputLabel: {
    fontSize: 11.5,
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
  modalBgPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  modalBgPillActive: {
    backgroundColor: '#DC2626',
  },
  modalBgPillText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  modalBgPillTextActive: {
    color: '#FFFFFF',
  },
  submitRequestBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  submitRequestBtnText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
