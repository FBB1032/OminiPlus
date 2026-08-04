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
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../theme';
import { MOCK_BLOOD_DONORS } from '../../api/__mocks__/mockData';
import { useToast } from '../../hooks/useAuth';

interface DonorItem {
  id: string;
  name: string;
  bloodGroup: string;
  genotype: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string;
  availabilityStatus: string;
  isVerified: boolean;
  lastDonationDate: string;
  donationsCount: number;
  gender: string;
}

const BLOOD_GROUPS = ['ALL', 'O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const DISTANCE_RADII = [
  { label: '< 5 km', value: 5 },
  { label: '< 10 km', value: 10 },
  { label: '< 25 km', value: 25 },
  { label: '< 50 km', value: 50 },
  { label: 'All Distances', value: 999 },
];

const NIGERIA_STATES_AND_CITIES: Record<string, string[]> = {
  'Lagos State': ['Ikeja', 'Victoria Island', 'Lekki Phase 1', 'Yaba', 'Surulere', 'Maryland', 'Ikoyi', 'Festac Town', 'Ajah'],
  'FCT Abuja': ['Garki', 'Wuse Phase 2', 'Maitama', 'Jabi', 'Asokoro', 'Utako', 'Gwarinpa', 'Kubwa'],
  'Rivers State': ['Port Harcourt (GRA)', 'Rumuokoro', 'Trans Amadi', 'Obio-Akpor', 'Eleme'],
  'Oyo State': ['Ibadan (Bodija)', 'Dugbe', 'Ring Road', 'Jericho', 'Mokola', 'Ogbomoso'],
  'Enugu State': ['Enugu Urban', 'Independence Layout', 'GRA Enugu', 'New Haven'],
  'Kano State': ['Kano Central', 'Sabon Gari', 'Nassarawa', 'Tarauni'],
  'Delta State': ['Warri', 'Asaba', 'Effurun', 'Sapele'],
  'Edo State': ['Benin City (GRA)', 'Uselu', 'Ekpoma'],
  'Kaduna State': ['Kaduna Central', 'Barnawa', 'Tudun Wada'],
  'Ogun State': ['Abeokuta', 'Sagamu', 'Sango Ota', 'Ijebu Ode'],
  'Anambra State': ['Awka', 'Onitsha', 'Nnewi'],
  'Abia State': ['Umuahia', 'Aba'],
  'Akwa Ibom State': ['Uyo', 'Eket'],
  'Cross River State': ['Calabar Urban', 'Ikom'],
  'Imo State': ['Owerri (World Bank)', 'Orlu'],
  'Kwara State': ['Ilorin Central', 'Offa'],
  'Plateau State': ['Jos South', 'Jos North'],
};

export default function BloodDonorsScreen({ navigation }: any) {
  const { success: toastSuccess, error: toastError } = useToast();
  
  // States
  const [donorsList, setDonorsList] = useState<DonorItem[]>(MOCK_BLOOD_DONORS as DonorItem[]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [selectedRadius, setSelectedRadius] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regState, setRegState] = useState('Lagos State');
  const [regCity, setRegCity] = useState('Ikeja');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regGenotype, setRegGenotype] = useState('AA');
  const [regGender, setRegGender] = useState('Male');
  const [regAvailability, setRegAvailability] = useState('Available Anytime');
  const [isEligibleConfirmed, setIsEligibleConfirmed] = useState(false);

  // Emergency Appeal Form State
  const [appealPatient, setAppealPatient] = useState('');
  const [appealBloodGroup, setAppealBloodGroup] = useState('O-');
  const [appealUnits, setAppealUnits] = useState('2');
  const [appealHospital, setAppealHospital] = useState('');
  const [appealPhone, setAppealPhone] = useState('');

  // GPS Refresh simulation
  const handleRefreshGPS = () => {
    setIsRefreshingGPS(true);
    setTimeout(() => {
      setIsRefreshingGPS(false);
      toastSuccess('GPS Updated', 'Location refreshed: Ikeja, Lagos (GPS Accuracy: High)');
    }, 1000);
  };

  // Filtered Donors list
  const filteredDonors = useMemo(() => {
    return donorsList.filter((donor) => {
      const matchBlood = selectedBloodGroup === 'ALL' || donor.bloodGroup === selectedBloodGroup;
      const matchRadius = donor.distanceKm <= selectedRadius;
      const matchQuery =
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlood && matchRadius && matchQuery;
    });
  }, [donorsList, selectedBloodGroup, selectedRadius, searchQuery]);

  // Handle Call Donor
  const handleCallDonor = (phone: string, name: string) => {
    Alert.alert(
      `Call Donor: ${name}`,
      `Are you sure you want to dial ${phone}? Please confirm this is for a legitimate medical need.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            const url = `tel:${phone.replace(/\s+/g, '')}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else toastSuccess('Dialing Demo', `Simulated dial to ${phone}`);
              })
              .catch(() => toastSuccess('Dialing Demo', `Simulated dial to ${phone}`));
          },
        },
      ]
    );
  };

  // Handle Send Request
  const handleSendRequest = (donor: DonorItem) => {
    Alert.alert(
      `Send Blood Request to ${donor.name}`,
      `Send an instant SMS & in-app notification requesting ${donor.bloodGroup} blood donation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS Request',
          onPress: () => {
            toastSuccess('Request Sent', `Notification and SMS dispatched to ${donor.name}.`);
          },
        },
      ]
    );
  };

  // Handle Register Donor Submit
  const handleRegisterSubmit = () => {
    if (!regName.trim() || !regPhone.trim() || !regCity.trim()) {
      toastError('Missing Fields', 'Please fill in your name, phone number, and city.');
      return;
    }
    if (!isEligibleConfirmed) {
      toastError('Eligibility Required', 'Please confirm that you meet the donor eligibility criteria.');
      return;
    }

    const newDonor: DonorItem = {
      id: `bd-${Date.now()}`,
      name: regName.trim(),
      bloodGroup: regBloodGroup,
      genotype: regGenotype,
      city: regCity.trim(),
      latitude: 6.5244,
      longitude: 3.3792,
      distanceKm: 0.8,
      phone: regPhone.trim(),
      availabilityStatus: regAvailability,
      isVerified: true,
      lastDonationDate: new Date().toISOString().split('T')[0],
      donationsCount: 1,
      gender: regGender,
    };

    setDonorsList([newDonor, ...donorsList]);
    setIsRegisterModalOpen(false);
    toastSuccess('Registration Successful!', 'You are now registered as an active voluntary blood donor.');

    // Reset Form
    setRegName('');
    setRegPhone('');
    setIsEligibleConfirmed(false);
  };

  // Handle Submit Appeal
  const handleAppealSubmit = () => {
    if (!appealPatient.trim() || !appealHospital.trim() || !appealPhone.trim()) {
      toastError('Missing Fields', 'Please enter patient name, hospital location, and contact phone.');
      return;
    }

    setIsAppealModalOpen(false);
    toastSuccess('Emergency Appeal Broadcasted!', `Urgent request for ${appealUnits} Pints of ${appealBloodGroup} blood has been broadcasted to nearby donors.`);

    setAppealPatient('');
    setAppealHospital('');
    setAppealPhone('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Blood Donor Network</Text>
          <Text style={styles.headerSubtitle}>GPS Proximity & Donor Match</Text>
        </View>
        <TouchableOpacity
          style={styles.sosHeaderBtn}
          onPress={() => setIsAppealModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
          <Text style={styles.sosHeaderBtnText}>SOS Appeal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* ── Blood Donor Medical Safety & Screening Banner ───────────────── */}
        <View style={{
          flexDirection: 'row', alignItems: 'flex-start', gap: 10,
          backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: '#DC2626',
          padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FCA5A5'
        }}>
          <Ionicons name="shield-checkmark" size={20} color="#DC2626" style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: '#DC2626' }}>
              Medical Safety & Screening Protocol
            </Text>
            <Text style={{ fontSize: 11, color: '#991B1B', lineHeight: 15, marginTop: 2 }}>
              All matched blood donors must undergo mandatory clinical blood screening (HIV, Hepatitis B/C, Syphilis, Hemoglobin) at an accredited hospital or certified blood bank laboratory prior to donation.
            </Text>
          </View>
        </View>

        {/* ── GPS Status Banner Card ─────────────────────────────────────── */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsCardRow}>
            <View style={styles.gpsCardLeft}>
              <View style={styles.gpsPulseDot} />
              <View>
                <Text style={styles.gpsLocationTitle}>Ikeja, Lagos</Text>
                <Text style={styles.gpsAccuracyText}>GPS Active • Radius filter enabled</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.gpsRefreshBtn} onPress={handleRefreshGPS} disabled={isRefreshingGPS}>
              {isRefreshingGPS ? (
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              ) : (
                <>
                  <Ionicons name="navigate" size={14} color={Colors.primary[600]} />
                  <Text style={styles.gpsRefreshText}>Refresh GPS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Radius Selector Pills */}
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Filter Distance:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {DISTANCE_RADII.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.radiusPill, selectedRadius === r.value && styles.radiusPillActive]}
                  onPress={() => setSelectedRadius(r.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.radiusPillText, selectedRadius === r.value && styles.radiusPillTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search donors by name, city, or blood type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Blood Group Filter Horizontal List ──────────────────────────── */}
        <View style={styles.bloodFilterSection}>
          <Text style={styles.sectionHeading}>Target Blood Group:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bloodPillsRow}>
            {BLOOD_GROUPS.map((bg) => {
              const isSelected = selectedBloodGroup === bg;
              const isUniversal = bg === 'O-';
              return (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.bloodPill,
                    isSelected && styles.bloodPillActive,
                    isUniversal && !isSelected && styles.bloodPillUniversal,
                  ]}
                  onPress={() => setSelectedBloodGroup(bg)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bloodPillText, isSelected && styles.bloodPillTextActive]}>
                    {bg}
                  </Text>
                  {isUniversal && <Text style={styles.universalTag}>Universal</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Action Buttons Row ─────────────────────────────────────────── */}
        <View style={styles.actionBannerRow}>
          <TouchableOpacity
            style={styles.registerBannerBtn}
            onPress={() => setIsRegisterModalOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="heart" size={20} color="#DC2626" />
            <Text style={styles.registerBannerText}>Register as a Donor</Text>
          </TouchableOpacity>
        </View>

        {/* ── Donors List ───────────────────────────────────────────────── */}
        <View style={styles.donorListSection}>
          <View style={styles.donorListHeader}>
            <Text style={styles.sectionHeading}>
              Nearby Donors ({filteredDonors.length})
            </Text>
            <Text style={styles.sortByText}>Sorted by Proximity</Text>
          </View>

          {filteredDonors.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="water-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Donors Found Nearby</Text>
              <Text style={styles.emptyStateSub}>
                Try expanding your distance radius filter or selecting a different blood group.
              </Text>
            </View>
          ) : (
            filteredDonors.map((donor) => (
              <View key={donor.id} style={styles.donorCard}>
                <View style={styles.donorCardTop}>
                  <View style={styles.donorBadgeGroup}>
                    <View style={styles.bloodBadgeContainer}>
                      <Text style={styles.bloodBadgeText}>{donor.bloodGroup}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <Text style={styles.donorName} numberOfLines={1}>{donor.name}</Text>
                        {donor.isVerified && (
                          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                        )}
                      </View>
                      <Text style={styles.donorLocationSub} numberOfLines={1}>
                        {donor.city} • Genotype: <Text style={{ fontWeight: 'bold' }}>{donor.genotype}</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.distanceBadge}>
                    <Ionicons name="navigate-circle" size={13} color="#DC2626" />
                    <Text style={styles.distanceBadgeText}>{donor.distanceKm} km</Text>
                  </View>
                </View>

                {/* Info row */}
                <View style={styles.donorInfoRow}>
                  <View style={[styles.infoPill, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                    <Ionicons name="location-sharp" size={11} color="#DC2626" />
                    <Text style={[styles.infoPillText, { color: '#DC2626', fontWeight: 'bold' }]}>{donor.distanceKm} km Proximity</Text>
                  </View>
                  <View style={styles.infoPill}>
                    <Ionicons name="time-outline" size={11} color="#475569" />
                    <Text style={styles.infoPillText}>{donor.availabilityStatus}</Text>
                  </View>
                  <View style={styles.infoPill}>
                    <Ionicons name="ribbon-outline" size={11} color="#475569" />
                    <Text style={styles.infoPillText}>{donor.donationsCount} donations</Text>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.donorCardActions}>
                  <TouchableOpacity
                    style={styles.callDonorBtn}
                    onPress={() => handleCallDonor(donor.phone, donor.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={15} color="#FFFFFF" />
                    <Text style={styles.callDonorBtnText} numberOfLines={1}>Call Donor</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.requestDonorBtn}
                    onPress={() => handleSendRequest(donor)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="send-outline" size={14} color="#DC2626" />
                    <Text style={styles.requestDonorBtnText} numberOfLines={1}>Send SOS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Modal: Become a Donor ────────────────────────────────────────── */}
      <Modal visible={isRegisterModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register as a Blood Donor</Text>
              <TouchableOpacity onPress={() => setIsRegisterModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Samuel Okon"
                value={regName}
                onChangeText={setRegName}
              />

              <Text style={styles.formLabel}>Phone Number (For Emergency Alerts)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. +234 802 123 4567"
                keyboardType="phone-pad"
                value={regPhone}
                onChangeText={setRegPhone}
              />

              {/* State Dropdown Selector */}
              <Text style={styles.formLabel}>State / Region</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {Object.keys(NIGERIA_STATES_AND_CITIES).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.selectPill, regState === st && styles.selectPillActive]}
                    onPress={() => {
                      setRegState(st);
                      const cities = NIGERIA_STATES_AND_CITIES[st];
                      if (cities && cities.length > 0) {
                        setRegCity(cities[0]);
                      }
                    }}
                  >
                    <Text style={[styles.selectPillText, regState === st && styles.selectPillTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* City / Area Dropdown Selector */}
              <Text style={styles.formLabel}>City / Area ({regState})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {(NIGERIA_STATES_AND_CITIES[regState] || ['Central']).map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.selectPill, regCity === city && styles.selectPillActive]}
                    onPress={() => setRegCity(city)}
                  >
                    <Text style={[styles.selectPillText, regCity === city && styles.selectPillTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Blood Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.selectPill, regBloodGroup === bg && styles.selectPillActive]}
                    onPress={() => setRegBloodGroup(bg)}
                  >
                    <Text style={[styles.selectPillText, regBloodGroup === bg && styles.selectPillTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Genotype</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {['AA', 'AS', 'AC', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.selectPill, regGenotype === g && styles.selectPillActive]}
                    onPress={() => setRegGenotype(g)}
                  >
                    <Text style={[styles.selectPillText, regGenotype === g && styles.selectPillTextActive]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Availability Status</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['Available Anytime', 'On-Call Emergency'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.selectPill, regAvailability === st && styles.selectPillActive]}
                    onPress={() => setRegAvailability(st)}
                  >
                    <Text style={[styles.selectPillText, regAvailability === st && styles.selectPillTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Eligibility Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsEligibleConfirmed(!isEligibleConfirmed)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, isEligibleConfirmed && styles.checkboxChecked]}>
                  {isEligibleConfirmed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  I confirm I am aged 18-65, weigh over 50kg, and have no active medical contraindications.
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.submitModalBtn} onPress={handleRegisterSubmit} activeOpacity={0.85}>
              <Text style={styles.submitModalBtnText}>Complete Registration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Emergency SOS Appeal ─────────────────────────────────── */}
      <Modal visible={isAppealModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="alert-circle" size={22} color="#DC2626" />
                <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Emergency Blood Appeal</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAppealModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <Text style={styles.formLabel}>Patient Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Mrs. Adeola Johnson"
                value={appealPatient}
                onChangeText={setAppealPatient}
              />

              <Text style={styles.formLabel}>Required Blood Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.selectPill, appealBloodGroup === bg && styles.selectPillActiveDanger]}
                    onPress={() => setAppealBloodGroup(bg)}
                  >
                    <Text style={[styles.selectPillText, appealBloodGroup === bg && styles.selectPillTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Required Units (Pints)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 2 Pints"
                keyboardType="numeric"
                value={appealUnits}
                onChangeText={setAppealUnits}
              />

              <Text style={styles.formLabel}>Target Hospital & Location</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. LUTH Hospital, Idi-Araba, Lagos"
                value={appealHospital}
                onChangeText={setAppealHospital}
              />

              <Text style={styles.formLabel}>Emergency Contact Phone</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. +234 803 999 8888"
                keyboardType="phone-pad"
                value={appealPhone}
                onChangeText={setAppealPhone}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitDangerBtn} onPress={handleAppealSubmit} activeOpacity={0.85}>
              <Ionicons name="megaphone-outline" size={18} color="#FFFFFF" />
              <Text style={styles.submitModalBtnText}>Broadcast Urgent SOS Appeal</Text>
            </TouchableOpacity>
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  sosHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
  },
  scrollBody: {
    padding: Spacing[4],
    gap: 16,
  },
  gpsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  gpsCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gpsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gpsPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  gpsLocationTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  gpsAccuracyText: {
    fontSize: 11,
    color: '#64748B',
  },
  gpsRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gpsRefreshText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  radiusLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: FontWeight.semiBold,
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  radiusPillActive: {
    backgroundColor: Colors.secondary[600],
  },
  radiusPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: FontWeight.medium,
  },
  radiusPillTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  bloodFilterSection: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#334155',
  },
  bloodPillsRow: {
    gap: 8,
  },
  bloodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  bloodPillActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  bloodPillUniversal: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  bloodPillText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#334155',
  },
  bloodPillTextActive: {
    color: '#FFFFFF',
  },
  universalTag: {
    fontSize: 8,
    color: '#DC2626',
    fontWeight: 'bold',
    marginTop: -2,
  },
  actionBannerRow: {
    marginVertical: 4,
  },
  registerBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: 10,
  },
  registerBannerText: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  donorListSection: {
    gap: 12,
  },
  donorListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortByText: {
    fontSize: 11,
    color: '#64748B',
  },
  donorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    ...Shadows.sm,
  },
  donorCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  donorBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  bloodBadgeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bloodBadgeText: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  donorName: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    flexShrink: 1,
  },
  donorLocationSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  donorInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoPillText: {
    fontSize: 11,
    color: '#475569',
  },
  donorCardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  callDonorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  callDonorBtnText: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  requestDonorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  requestDonorBtnText: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#475569',
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing[4],
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semiBold,
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 8,
  },
  selectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  selectPillActive: {
    backgroundColor: Colors.secondary[600],
  },
  selectPillActiveDanger: {
    backgroundColor: '#DC2626',
  },
  selectPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: FontWeight.medium,
  },
  selectPillTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  submitModalBtn: {
    backgroundColor: Colors.secondary[600],
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitModalBtnText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  submitDangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
});
