import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';
import { useToast } from '../../hooks/useAuth';

interface HospitalItem {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'Public Teaching' | 'Private Specialist' | 'Tertiary Hospital';
  hasEmergencyER: boolean;
  hasICU: boolean;
  hasBloodBank: boolean;
  distanceKm: number;
  driveTimeMins: number;
  emergencyPhone: string;
  acceptedHMOs: string[];
}

const MOCK_HOSPITALS: HospitalItem[] = [
  {
    id: 'hosp-1',
    name: 'Lagos University Teaching Hospital (LUTH)',
    address: 'Ishaga Road, Idi-Araba, Surulere',
    city: 'Lagos',
    type: 'Public Teaching',
    hasEmergencyER: true,
    hasICU: true,
    hasBloodBank: true,
    distanceKm: 1.2,
    driveTimeMins: 5,
    emergencyPhone: '+234 803 999 1122',
    acceptedHMOs: ['NHIA', 'Hygeia', 'AXA Mansard', 'Reliance'],
  },
  {
    id: 'hosp-2',
    name: 'Evercare Hospital Lekki',
    address: 'Bisola Durosinmi Etti Drive, Lekki Phase 1',
    city: 'Lagos',
    type: 'Tertiary Hospital',
    hasEmergencyER: true,
    hasICU: true,
    hasBloodBank: true,
    distanceKm: 2.8,
    driveTimeMins: 8,
    emergencyPhone: '+234 800 383 72273',
    acceptedHMOs: ['Hygeia', 'AXA Mansard', 'Redcare', 'Leadway'],
  },
  {
    id: 'hosp-3',
    name: 'Reddington Hospital Victoria Island',
    address: '39 Idowu Martins Street, Victoria Island',
    city: 'Lagos',
    type: 'Private Specialist',
    hasEmergencyER: true,
    hasICU: true,
    hasBloodBank: false,
    distanceKm: 3.5,
    driveTimeMins: 11,
    emergencyPhone: '+234 802 123 9900',
    acceptedHMOs: ['AXA Mansard', 'Reliance HMO', 'Anchor HMO'],
  },
  {
    id: 'hosp-4',
    name: 'St. Nicholas Hospital',
    address: '57 Campbell Street, Lagos Island',
    city: 'Lagos',
    type: 'Private Specialist',
    hasEmergencyER: true,
    hasICU: false,
    hasBloodBank: true,
    distanceKm: 4.2,
    driveTimeMins: 14,
    emergencyPhone: '+234 801 888 4433',
    acceptedHMOs: ['Hygeia', 'Clearline HMO', 'Metrohealth'],
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Centers', icon: 'grid-outline' },
  { id: 'er', label: '24/7 Emergency ER', icon: 'alert-circle-outline' },
  { id: 'teaching', label: 'Teaching Hospitals', icon: 'school-outline' },
  { id: 'icu', label: 'ICU Available', icon: 'heart-outline' },
  { id: 'blood', label: 'Blood Bank On-Site', icon: 'water-outline' },
];

export default function HospitalsScreen({ navigation }: any) {
  const { success: toastSuccess } = useToast();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1');

  // Refresh GPS Simulation
  const handleRefreshGPS = () => {
    setIsRefreshingGPS(true);
    setTimeout(() => {
      setIsRefreshingGPS(false);
      toastSuccess('GPS Calibrated', 'Hospital radar synced with current position.');
    }, 800);
  };

  // Filter Hospitals
  const filteredHospitals = useMemo(() => {
    return MOCK_HOSPITALS.filter((h) => {
      const matchQuery =
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.type.toLowerCase().includes(searchQuery.toLowerCase());

      let matchCat = true;
      if (activeCategory === 'er') matchCat = h.hasEmergencyER;
      if (activeCategory === 'teaching') matchCat = h.type === 'Public Teaching';
      if (activeCategory === 'icu') matchCat = h.hasICU;
      if (activeCategory === 'blood') matchCat = h.hasBloodBank;

      return matchQuery && matchCat;
    });
  }, [searchQuery, activeCategory]);

  const activeHospital = useMemo(() => {
    return MOCK_HOSPITALS.find((h) => h.id === selectedHospitalId) || MOCK_HOSPITALS[0];
  }, [selectedHospitalId]);

  const handleCallEmergency = (phone: string, name: string) => {
    Alert.alert(
      `Call Emergency Ward`,
      `Dial emergency hotline ${phone} for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dial Hotline',
          onPress: () => {
            const url = `tel:${phone.replace(/\s+/g, '')}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else toastSuccess('Dialing ER', `Calling ${phone}...`);
              })
              .catch(() => toastSuccess('Dialing ER', `Calling ${phone}...`));
          },
        },
      ]
    );
  };

  const handleGetDirections = (name: string, address: string) => {
    const query = encodeURIComponent(`${name}, ${address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      toastSuccess('GPS Directions', `Opening route to ${name}...`);
    });
  };

  const handleCallNationalEmergency = () => {
    Alert.alert(
      'National Emergency Dialers',
      'Choose emergency service hotline:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'National Emergency (112)',
          onPress: () => Linking.openURL('tel:112'),
        },
        {
          text: 'Lagos Emergency (767 / 112)',
          onPress: () => Linking.openURL('tel:767'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>GPS Hospital Radar</Text>
          <Text style={styles.headerSubtitle}>24/7 Emergency Rooms & Centers</Text>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={14} color={viewMode === 'map' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={14} color={viewMode === 'list' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* ── 24/7 Emergency SOS Action Card ───────────────────────────────── */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeaderRow}>
            <View style={styles.sosBadge}>
              <Ionicons name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.sosBadgeText}>24/7 EMERGENCY RESPONSE</Text>
            </View>
            <TouchableOpacity style={styles.gpsRefreshChip} onPress={handleRefreshGPS} disabled={isRefreshingGPS}>
              {isRefreshingGPS ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="navigate" size={12} color="#DC2626" />
                  <Text style={styles.gpsRefreshChipText}>Refresh GPS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.emergencyTitle}>Life-Threatening Emergency?</Text>
          <Text style={styles.emergencySub}>
            In case of severe hemorrhage, cardiac arrest, or acute distress, call national emergency response (112 / 767) or navigate to the nearest ER below immediately.
          </Text>

          <TouchableOpacity style={styles.emergencyCallBtn} onPress={handleCallNationalEmergency} activeOpacity={0.85}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.emergencyCallText}>Dial Emergency Hotlines (112 / 767)</Text>
          </TouchableOpacity>
        </View>

        {/* ── VISUAL GPS RADAR MAP BOX (Map View Mode) ────────────────────────── */}
        {viewMode === 'map' && (
          <View style={styles.mapVisualContainer}>
            <View style={styles.mapHeaderRow}>
              <View style={styles.mapTitleGroup}>
                <Ionicons name="location" size={16} color="#DC2626" />
                <Text style={styles.mapTitleText}>GPS Medical Radar</Text>
              </View>
              <Text style={styles.mapSubText}>4 Hospitals Mapped Nearby</Text>
            </View>

            {/* Simulated Radar Map View Box */}
            <View style={styles.mapRadarBox}>
              <View style={styles.mapGridLineH1} />
              <View style={styles.mapGridLineH2} />
              <View style={styles.mapGridLineV1} />
              <View style={styles.mapGridLineV2} />

              <View style={styles.routeLine} />

              {/* User Current Location Dot */}
              <View style={styles.userLocationPulseRing}>
                <View style={styles.userLocationDot}>
                  <Ionicons name="person" size={10} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.userLocationLabelBox}>
                <Text style={styles.userLocationLabelText}>You (Ikeja)</Text>
              </View>

              {/* Hospital GPS Pins */}
              {MOCK_HOSPITALS.map((hosp, idx) => {
                const isSelected = selectedHospitalId === hosp.id;
                const positions = [
                  { top: 20, right: 30 },
                  { top: 85, right: 80 },
                  { top: 125, left: 35 },
                  { top: 45, left: 65 },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <TouchableOpacity
                    key={hosp.id}
                    style={[
                      styles.mapPinContainer,
                      pos as any,
                      isSelected && styles.mapPinContainerSelected,
                    ]}
                    onPress={() => setSelectedHospitalId(hosp.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.mapPinBubble, isSelected && styles.mapPinBubbleSelected]}>
                      <Ionicons
                        name="business"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#DC2626'}
                      />
                      <Text style={[styles.mapPinText, isSelected && styles.mapPinTextSelected]}>
                        {hosp.name.split(' ')[0]} ({hosp.distanceKm}km)
                      </Text>
                    </View>
                    <View style={[styles.mapPinNeedle, isSelected && styles.mapPinNeedleSelected]} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Pin Details Overlay Card */}
            {activeHospital && (
              <View style={styles.selectedOverlayCard}>
                <View style={styles.selectedCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCardName}>{activeHospital.name}</Text>
                    <Text style={styles.selectedCardAddress}>{activeHospital.address}</Text>

                    <View style={styles.badgeChipsRow}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{activeHospital.type}</Text>
                      </View>
                      {activeHospital.hasEmergencyER && (
                        <View style={styles.erBadge}>
                          <Ionicons name="alert-circle" size={10} color="#DC2626" />
                          <Text style={styles.erBadgeText}>24/7 ER Available</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.closestEtaBadge}>
                    <Text style={styles.closestEtaText}>{activeHospital.driveTimeMins} min drive</Text>
                    <Text style={styles.closestDistText}>{activeHospital.distanceKm} km</Text>
                  </View>
                </View>

                <View style={styles.selectedActionsRow}>
                  <TouchableOpacity
                    style={styles.selectedNavBtn}
                    onPress={() => handleGetDirections(activeHospital.name, activeHospital.address)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={15} color="#FFFFFF" />
                    <Text style={styles.selectedNavText}>Get GPS Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectedCallBtn}
                    onPress={() => handleCallEmergency(activeHospital.emergencyPhone, activeHospital.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={14} color="#DC2626" />
                    <Text style={styles.selectedCallText}>Call ER Desk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Search Bar & Category Filters ──────────────────────────────── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hospital by name, HMO or street..."
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

          {/* Category Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {CATEGORY_FILTERS.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, activeCategory === cat.id && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={13}
                  color={activeCategory === cat.id ? '#FFFFFF' : Colors.text.secondary}
                />
                <Text style={[styles.categoryPillText, activeCategory === cat.id && styles.categoryPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Hospitals Directory List ───────────────────────────────────── */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            Nearby Hospitals & Medical Centers ({filteredHospitals.length})
          </Text>

          {filteredHospitals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={42} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Hospitals Found</Text>
              <Text style={styles.emptySub}>
                No medical centers match your search filter. Try clearing filters.
              </Text>
            </View>
          ) : (
            filteredHospitals.map((hospital) => {
              const isSelected = selectedHospitalId === hospital.id;
              return (
                <Card
                  key={hospital.id}
                  style={[styles.hospitalCard, isSelected && styles.hospitalCardSelected]}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedHospitalId(hospital.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardMainRow}>
                      <View style={styles.hospitalIconBox}>
                        <Ionicons name="business" size={20} color={Colors.primary[600]} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.hospitalName}>{hospital.name}</Text>
                        <Text style={styles.hospitalAddress}>{hospital.address}</Text>

                        {/* Badges Row */}
                        <View style={styles.badgeRow}>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{hospital.type}</Text>
                          </View>
                          {hospital.hasEmergencyER && (
                            <View style={styles.erBadge}>
                              <Ionicons name="alert-circle" size={10} color="#DC2626" />
                              <Text style={styles.erBadgeText}>24/7 ER</Text>
                            </View>
                          )}
                          {hospital.hasICU && (
                            <View style={styles.icuBadge}>
                              <Text style={styles.icuBadgeText}>ICU</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.metaRow}>
                          <Ionicons name="navigate-outline" size={12} color={Colors.text.secondary} />
                          <Text style={styles.metaText}>{hospital.distanceKm} km away</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Ionicons name="car-outline" size={12} color={Colors.primary[600]} />
                          <Text style={styles.metaText}>{hospital.driveTimeMins} min drive</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card Actions */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.cardNavBtn}
                      onPress={() => handleGetDirections(hospital.name, hospital.address)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="navigate" size={14} color={Colors.primary[600]} />
                      <Text style={styles.cardNavText}>GPS Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardCallBtn}
                      onPress={() => handleCallEmergency(hospital.emergencyPhone, hospital.name)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call-outline" size={14} color="#DC2626" />
                      <Text style={styles.cardCallText}>Call ER</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary[600],
  },
  toggleText: {
    fontSize: 11,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  scrollBody: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: Spacing[4],
    gap: 8,
    ...Shadows.xs,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sosBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  gpsRefreshChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  gpsRefreshChipText: {
    fontSize: 10.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  emergencyTitle: {
    fontSize: 15.5,
    fontWeight: FontWeight.bold,
    color: '#991B1B',
  },
  emergencySub: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 17,
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  emergencyCallText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },

  // Map Visual Radar Container
  mapVisualContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[3],
    gap: 10,
    ...Shadows.sm,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitleText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  mapSubText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  mapRadarBox: {
    height: 180,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridLineH1: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  mapGridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  mapGridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
  },
  routeLine: {
    position: 'absolute',
    top: 45,
    left: 80,
    width: 110,
    height: 2,
    backgroundColor: '#DC2626',
    transform: [{ rotate: '25deg' }],
  },
  userLocationPulseRing: {
    position: 'absolute',
    bottom: 35,
    left: 45,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationLabelBox: {
    position: 'absolute',
    bottom: 12,
    left: 30,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userLocationLabelText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapPinContainerSelected: {
    zIndex: 10,
  },
  mapPinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    ...Shadows.xs,
  },
  mapPinBubbleSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#991B1B',
  },
  mapPinText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#991B1B',
  },
  mapPinTextSelected: {
    color: '#FFFFFF',
  },
  mapPinNeedle: {
    width: 2,
    height: 8,
    backgroundColor: '#DC2626',
  },
  mapPinNeedleSelected: {
    backgroundColor: '#991B1B',
    width: 3,
  },

  // Selected Overlay Card
  selectedOverlayCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: Spacing[3],
    gap: 10,
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  selectedCardName: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#991B1B',
  },
  selectedCardAddress: {
    fontSize: 11.5,
    color: '#B91C1C',
    marginTop: 1,
  },
  badgeChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  erBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  erBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  icuBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  icuBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#2563EB',
  },
  closestEtaBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  closestEtaText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  closestDistText: {
    fontSize: 10,
    color: '#991B1B',
  },
  selectedActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary[600],
    paddingVertical: 9,
    borderRadius: 8,
  },
  selectedNavText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  selectedCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 9,
    borderRadius: 8,
  },
  selectedCallText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },

  // Search Section
  searchSection: {
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.primary,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },

  // List Section
  listSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  hospitalCard: {
    padding: Spacing[3],
    gap: 10,
  },
  hospitalCardSelected: {
    borderColor: Colors.primary[600],
    borderWidth: 1.5,
  },
  cardMainRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  hospitalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalName: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  hospitalAddress: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metaText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[100] ?? '#BFDBFE',
    paddingVertical: 7,
    borderRadius: 6,
  },
  cardNavText: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  cardCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 7,
    borderRadius: 6,
  },
  cardCallText: {
    fontSize: 11.5,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  emptySub: {
    fontSize: 11.5,
    color: Colors.text.disabled,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
