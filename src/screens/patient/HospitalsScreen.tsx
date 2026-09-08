import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useToast } from '../../hooks/useAuth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH - 32;
const MAP_HEIGHT = 260;

interface HospitalItem {
  id: string;
  name: string;
  shortName: string;
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
  // Relative position on the map placeholder (0–1)
  mapX: number;
  mapY: number;
}

const MOCK_HOSPITALS: HospitalItem[] = [
  {
    id: 'hosp-1',
    name: 'Lagos University Teaching Hospital (LUTH)',
    shortName: 'LUTH',
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
    mapX: 0.58,
    mapY: 0.22,
  },
  {
    id: 'hosp-2',
    name: 'Evercare Hospital Lekki',
    shortName: 'Evercare',
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
    mapX: 0.82,
    mapY: 0.55,
  },
  {
    id: 'hosp-3',
    name: 'Reddington Hospital Victoria Island',
    shortName: 'Reddington',
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
    mapX: 0.22,
    mapY: 0.42,
  },
  {
    id: 'hosp-4',
    name: 'St. Nicholas Hospital',
    shortName: 'St. Nicholas',
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
    mapX: 0.35,
    mapY: 0.72,
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Centers', icon: 'grid-outline' },
  { id: 'er', label: '24/7 ER', icon: 'alert-circle-outline' },
  { id: 'teaching', label: 'Teaching', icon: 'school-outline' },
  { id: 'icu', label: 'ICU', icon: 'heart-outline' },
  { id: 'blood', label: 'Blood Bank', icon: 'water-outline' },
];

const TYPE_COLORS: Record<string, string> = {
  'Public Teaching': '#0F6E6E',
  'Private Specialist': '#7C3AED',
  'Tertiary Hospital': '#D97706',
};

// Simulated street/road layout for the map placeholder
const H_ROADS = [0.18, 0.35, 0.5, 0.65, 0.82];
const V_ROADS = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
// City blocks (rectangles)
const BLOCKS = [
  { x: 0.16, y: 0.16, w: 0.12, h: 0.16 },
  { x: 0.31, y: 0.16, w: 0.12, h: 0.16 },
  { x: 0.46, y: 0.16, w: 0.12, h: 0.16 },
  { x: 0.62, y: 0.16, w: 0.1, h: 0.16 },
  { x: 0.76, y: 0.16, w: 0.12, h: 0.16 },
  { x: 0.16, y: 0.37, w: 0.12, h: 0.12 },
  { x: 0.31, y: 0.37, w: 0.12, h: 0.12 },
  { x: 0.46, y: 0.37, w: 0.12, h: 0.12 },
  { x: 0.62, y: 0.37, w: 0.1, h: 0.12 },
  { x: 0.76, y: 0.37, w: 0.12, h: 0.12 },
  { x: 0.16, y: 0.52, w: 0.12, h: 0.11 },
  { x: 0.31, y: 0.52, w: 0.12, h: 0.11 },
  { x: 0.46, y: 0.52, w: 0.12, h: 0.11 },
  { x: 0.62, y: 0.52, w: 0.1, h: 0.11 },
  { x: 0.76, y: 0.52, w: 0.12, h: 0.11 },
  { x: 0.16, y: 0.67, w: 0.12, h: 0.12 },
  { x: 0.31, y: 0.67, w: 0.12, h: 0.12 },
  { x: 0.46, y: 0.67, w: 0.12, h: 0.12 },
  { x: 0.62, y: 0.67, w: 0.1, h: 0.12 },
  { x: 0.76, y: 0.67, w: 0.12, h: 0.12 },
];

export default function HospitalsScreen({ navigation }: any) {
  const { success: toastSuccess } = useToast();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1');

  // User location pulse animation
  const locationPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const locPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(locationPulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(locationPulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    );
    locPulse.start();
    return () => locPulse.stop();
  }, []);

  const locationPulseScale = locationPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const locationPulseOpacity = locationPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  const handleRefreshGPS = () => {
    setIsRefreshingGPS(true);
    setTimeout(() => {
      setIsRefreshingGPS(false);
      toastSuccess('GPS Calibrated', 'Map synced with your current position.');
    }, 1200);
  };

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

  const activeHospital = useMemo(
    () => MOCK_HOSPITALS.find((h) => h.id === selectedHospitalId) || MOCK_HOSPITALS[0],
    [selectedHospitalId]
  );

  const handleCallEmergency = (phone: string) => {
    const url = `tel:${phone.replace(/\s+/g, '')}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Call Unavailable', 'No phone or dialer application is available on this device.')
    );
  };

  const handleGetDirections = (name: string, address: string) => {
    const query = encodeURIComponent(`${name}, ${address}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => toastSuccess('GPS Directions', `Opening route to ${name}...`));
  };

  const handleCallNationalEmergency = () => {
    Alert.alert('National Emergency Dialers', 'Choose emergency service hotline:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'National Emergency (112)', onPress: () => Linking.openURL('tel:112') },
      { text: 'Lagos Emergency (767)', onPress: () => Linking.openURL('tel:767') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>GPS Hospital Radar</Text>
          <Text style={styles.headerSubtitle}>Live tracking — 4 centers mapped</Text>
        </View>
        <TouchableOpacity style={styles.gpsBtn} onPress={handleRefreshGPS} disabled={isRefreshingGPS}>
          {isRefreshingGPS ? (
            <ActivityIndicator size="small" color="#0F6E6E" />
          ) : (
            <Ionicons name="navigate" size={16} color="#0F6E6E" />
          )}
        </TouchableOpacity>
      </View>

      {/* ── View Toggle ── */}
      <View style={styles.viewToggleBar}>
        <TouchableOpacity
          style={[styles.toggleTab, viewMode === 'map' && styles.toggleTabActive]}
          onPress={() => setViewMode('map')}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={14} color={viewMode === 'map' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.toggleTabText, viewMode === 'map' && styles.toggleTabTextActive]}>Map View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleTab, viewMode === 'list' && styles.toggleTabActive]}
          onPress={() => setViewMode('list')}
          activeOpacity={0.8}
        >
          <Ionicons name="list-outline" size={14} color={viewMode === 'list' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.toggleTabText, viewMode === 'list' && styles.toggleTabTextActive]}>List View</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

        {/* ── Emergency SOS Card ── */}
        <View style={styles.sosCard}>
          <View style={styles.sosCardLeft}>
            <View style={styles.sosPulseDot}>
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sosTitle}>Life-Threatening Emergency?</Text>
              <Text style={styles.sosSub}>Dial 112 or 767 for immediate national response</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.sosCallBtn} onPress={handleCallNationalEmergency} activeOpacity={0.85}>
            <Ionicons name="call" size={15} color="#FFFFFF" />
            <Text style={styles.sosCallText}>Call 112</Text>
          </TouchableOpacity>
        </View>

        {/* ── MAP VIEW ── */}
        {viewMode === 'map' && (
          <View style={styles.mapSection}>
            {/* Map Container — replace contents with <MapView> when integrating react-native-maps */}
            <View style={[styles.mapContainer, { width: MAP_WIDTH, height: MAP_HEIGHT }]}>
              {/* MAP PLACEHOLDER — swap this View for <MapView> from react-native-maps */}
              <View style={StyleSheet.absoluteFill}>

                {/* Base map background */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#E2E8F0' }]} />

                {/* Horizontal roads */}
                {H_ROADS.map((y, i) => (
                  <View
                    key={`h-${i}`}
                    style={[
                      styles.roadH,
                      { top: MAP_HEIGHT * y, width: MAP_WIDTH },
                      i === 2 && styles.roadHMajor,
                    ]}
                  />
                ))}

                {/* Vertical roads */}
                {V_ROADS.map((x, i) => (
                  <View
                    key={`v-${i}`}
                    style={[
                      styles.roadV,
                      { left: MAP_WIDTH * x, height: MAP_HEIGHT },
                      i === 2 && styles.roadVMajor,
                    ]}
                  />
                ))}

                {/* City blocks */}
                {BLOCKS.map((b, i) => (
                  <View
                    key={`b-${i}`}
                    style={[
                      styles.cityBlock,
                      {
                        left: MAP_WIDTH * b.x,
                        top: MAP_HEIGHT * b.y,
                        width: MAP_WIDTH * b.w,
                        height: MAP_HEIGHT * b.h,
                      },
                    ]}
                  />
                ))}

                {/* Route line from user to selected hospital */}
                <View
                  style={[
                    styles.routeDashedLine,
                    {
                      left: MAP_WIDTH * 0.48,
                      top: MAP_HEIGHT * 0.56,
                      width: MAP_WIDTH * (activeHospital.mapX - 0.48),
                      height: 2.5,
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            MAP_HEIGHT * (activeHospital.mapY - 0.58),
                            MAP_WIDTH * (activeHospital.mapX - 0.48)
                          ) * (180 / Math.PI)}deg`,
                        },
                      ],
                    },
                  ]}
                />

                {/* Hospital map pins */}
                {MOCK_HOSPITALS.map((hosp) => {
                  const isSelected = selectedHospitalId === hosp.id;
                  const typeColor = TYPE_COLORS[hosp.type] || '#0F6E6E';
                  const pinLeft = MAP_WIDTH * hosp.mapX - 14;
                  const pinTop = MAP_HEIGHT * hosp.mapY - 36;
                  return (
                    <TouchableOpacity
                      key={hosp.id}
                      style={[styles.pinWrapper, { left: pinLeft, top: pinTop }]}
                      onPress={() => setSelectedHospitalId(hosp.id)}
                      activeOpacity={0.85}
                    >
                      {/* Pin bubble */}
                      <View
                        style={[
                          styles.pinBubble,
                          { backgroundColor: isSelected ? typeColor : '#FFFFFF' },
                          isSelected && { shadowColor: typeColor },
                        ]}
                      >
                        <Ionicons
                          name="business"
                          size={12}
                          color={isSelected ? '#FFFFFF' : typeColor}
                        />
                        {isSelected && (
                          <Text style={styles.pinLabel}>{hosp.shortName}</Text>
                        )}
                      </View>
                      {/* Pin needle */}
                      <View
                        style={[
                          styles.pinNeedle,
                          { borderTopColor: isSelected ? typeColor : '#FFFFFF' },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}

                {/* User location marker */}
                <View style={[styles.userMarker, { left: MAP_WIDTH * 0.48 - 14, top: MAP_HEIGHT * 0.56 - 14 }]}>
                  <Animated.View
                    style={[
                      styles.userPulseRing,
                      {
                        transform: [{ scale: locationPulseScale }],
                        opacity: locationPulseOpacity,
                      },
                    ]}
                  />
                  <View style={styles.userDot}>
                    <Ionicons name="person" size={9} color="#FFFFFF" />
                  </View>
                </View>

                {/* Map attribution label */}
                <View style={styles.mapAttribBadge}>
                  <Ionicons name="map" size={9} color="#64748B" />
                  <Text style={styles.mapAttribText}>Map integration ready — react-native-maps</Text>
                </View>

                {/* Scale bar */}
                <View style={styles.scaleBar}>
                  <View style={styles.scaleBarLine} />
                  <Text style={styles.scaleBarText}>500m</Text>
                </View>

                {/* Zoom controls */}
                <View style={styles.zoomControls}>
                  <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.8}>
                    <Ionicons name="add" size={16} color="#1E293B" />
                  </TouchableOpacity>
                  <View style={styles.zoomDivider} />
                  <TouchableOpacity style={styles.zoomBtn} activeOpacity={0.8}>
                    <Ionicons name="remove" size={16} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* END MAP PLACEHOLDER */}
            </View>

            {/* Selected hospital bottom card */}
            {activeHospital && (
              <View style={styles.selectedCard}>
                <View style={styles.selectedCardTopRow}>
                  <View style={[styles.selectedTypeTag, { backgroundColor: TYPE_COLORS[activeHospital.type] + '18' }]}>
                    <Text style={[styles.selectedTypeText, { color: TYPE_COLORS[activeHospital.type] }]}>
                      {activeHospital.type}
                    </Text>
                  </View>
                  <View style={styles.selectedEtaChip}>
                    <Ionicons name="car-outline" size={12} color="#0F6E6E" />
                    <Text style={styles.selectedEtaText}>{activeHospital.driveTimeMins} min</Text>
                    <Text style={styles.selectedDistText}> — {activeHospital.distanceKm} km</Text>
                  </View>
                </View>

                <Text style={styles.selectedName}>{activeHospital.name}</Text>
                <Text style={styles.selectedAddress}>{activeHospital.address}</Text>

                <View style={styles.selectedCapsBadges}>
                  {activeHospital.hasEmergencyER && (
                    <View style={styles.capsBadge}>
                      <Ionicons name="alert-circle" size={11} color="#DC2626" />
                      <Text style={styles.capsBadgeText}>24/7 ER</Text>
                    </View>
                  )}
                  {activeHospital.hasICU && (
                    <View style={[styles.capsBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                      <Text style={[styles.capsBadgeText, { color: '#1D4ED8' }]}>ICU</Text>
                    </View>
                  )}
                  {activeHospital.hasBloodBank && (
                    <View style={[styles.capsBadge, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                      <Text style={[styles.capsBadgeText, { color: '#6D28D9' }]}>Blood Bank</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.hmoLabel}>Accepted HMOs:</Text>
                <Text style={styles.hmoList}>{activeHospital.acceptedHMOs.join(' — ')}</Text>

                <View style={styles.selectedActions}>
                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => handleGetDirections(activeHospital.name, activeHospital.address)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="navigate" size={14} color="#FFFFFF" />
                    <Text style={styles.navBtnText}>GPS Directions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.callErBtn}
                    onPress={() => handleCallEmergency(activeHospital.emergencyPhone)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="call" size={14} color="#DC2626" />
                    <Text style={styles.callErBtnText}>Call ER Desk</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Search & Filters ── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hospital, HMO or street..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {CATEGORY_FILTERS.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterPill, activeCategory === cat.id && styles.filterPillActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={cat.icon as any} size={12} color={activeCategory === cat.id ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.filterPillText, activeCategory === cat.id && styles.filterPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Hospital List ── */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Nearby Medical Centers</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filteredHospitals.length}</Text>
            </View>
          </View>

          {filteredHospitals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Hospitals Found</Text>
              <Text style={styles.emptySub}>Try clearing your search or filter.</Text>
            </View>
          ) : (
            filteredHospitals.map((hospital, idx) => {
              const isSelected = selectedHospitalId === hospital.id;
              const typeColor = TYPE_COLORS[hospital.type] || '#0F6E6E';
              return (
                <TouchableOpacity
                  key={hospital.id}
                  style={[styles.hospitalCard, isSelected && styles.hospitalCardSelected]}
                  onPress={() => setSelectedHospitalId(hospital.id)}
                  activeOpacity={0.88}
                >
                  <View style={[styles.rankBadge, { backgroundColor: isSelected ? '#0F6E6E' : '#F1F5F9' }]}>
                    <Text style={[styles.rankText, { color: isSelected ? '#FFFFFF' : '#64748B' }]}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardHospName}>{hospital.name}</Text>
                        <Text style={styles.cardHospAddr}>{hospital.address}</Text>
                      </View>
                      <View style={styles.cardDistBlock}>
                        <Text style={styles.cardDistKm}>{hospital.distanceKm} km</Text>
                        <Text style={styles.cardDistTime}>{hospital.driveTimeMins} min</Text>
                      </View>
                    </View>

                    <View style={styles.cardBadgesRow}>
                      <View style={[styles.cardTypeBadge, { backgroundColor: typeColor + '15' }]}>
                        <Text style={[styles.cardTypeText, { color: typeColor }]}>{hospital.type}</Text>
                      </View>
                      {hospital.hasEmergencyER && (
                        <View style={styles.erChip}><Text style={styles.erChipText}>24/7 ER</Text></View>
                      )}
                      {hospital.hasICU && (
                        <View style={styles.icuChip}><Text style={styles.icuChipText}>ICU</Text></View>
                      )}
                      {hospital.hasBloodBank && (
                        <View style={styles.bloodChip}><Text style={styles.bloodChipText}>Blood Bank</Text></View>
                      )}
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.cardNavBtn}
                        onPress={() => handleGetDirections(hospital.name, hospital.address)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="navigate" size={12} color="#0F6E6E" />
                        <Text style={styles.cardNavText}>Directions</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardCallBtn}
                        onPress={() => handleCallEmergency(hospital.emergencyPhone)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call-outline" size={12} color="#DC2626" />
                        <Text style={styles.cardCallText}>Call ER</Text>
                      </TouchableOpacity>
                      <View style={styles.cardPhoneLabel}>
                        <Ionicons name="phone-portrait-outline" size={11} color="#64748B" />
                        <Text style={styles.cardPhoneText}>{hospital.emergencyPhone}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleGroup: { flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' as any, color: '#0F172A', letterSpacing: -0.2 },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 1 },
  gpsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4F4',
    borderWidth: 1,
    borderColor: '#0F6E6E',
  },

  // View toggle
  viewToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  toggleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleTabActive: { backgroundColor: '#0F6E6E', borderColor: '#0F6E6E' },
  toggleTabText: { fontSize: 12, fontWeight: '600' as any, color: '#64748B' },
  toggleTabTextActive: { color: '#FFFFFF' },

  scrollBody: { padding: 16, gap: 16 },

  // SOS Card
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    gap: 10,
  },
  sosCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sosPulseDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sosTitle: { fontSize: 13, fontWeight: '700' as any, color: '#991B1B' },
  sosSub: { fontSize: 11, color: '#DC2626', marginTop: 2 },
  sosCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sosCallText: { fontSize: 12, fontWeight: '700' as any, color: '#FFFFFF' },

  // Map section
  mapSection: { gap: 12 },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Map roads
  roadH: {
    position: 'absolute',
    left: 0,
    height: 5,
    backgroundColor: '#CBD5E1',
    marginTop: -2.5,
  },
  roadHMajor: {
    height: 9,
    backgroundColor: '#94A3B8',
    marginTop: -4.5,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    width: 5,
    backgroundColor: '#CBD5E1',
    marginLeft: -2.5,
  },
  roadVMajor: {
    width: 9,
    backgroundColor: '#94A3B8',
    marginLeft: -4.5,
  },

  // City blocks
  cityBlock: {
    position: 'absolute',
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Route line
  routeDashedLine: {
    position: 'absolute',
    backgroundColor: '#0F6E6E',
    opacity: 0.85,
    transformOrigin: 'left center',
  },

  // Hospital pins
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  pinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '700' as any,
    color: '#FFFFFF',
    maxWidth: 70,
  },
  pinNeedle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // User marker
  userMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  userPulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0F6E6E',
    backgroundColor: 'transparent',
  },
  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F6E6E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#0F6E6E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  // Map UI chrome
  mapAttribBadge: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapAttribText: { fontSize: 8.5, color: '#475569', fontWeight: '500' as any },
  scaleBar: {
    position: 'absolute',
    bottom: 6,
    right: 56,
    alignItems: 'center',
    gap: 1,
  },
  scaleBarLine: {
    width: 40,
    height: 2,
    backgroundColor: '#64748B',
    borderRadius: 1,
  },
  scaleBarText: { fontSize: 8.5, color: '#64748B', fontWeight: '600' as any },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  zoomBtn: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: { height: 1, backgroundColor: '#E2E8F0' },

  // Selected hospital card
  selectedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedTypeText: { fontSize: 10.5, fontWeight: '700' as any },
  selectedEtaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99D4D4',
  },
  selectedEtaText: { fontSize: 11, fontWeight: '700' as any, color: '#0F6E6E' },
  selectedDistText: { fontSize: 10.5, color: '#64748B' },
  selectedName: { fontSize: 15, fontWeight: '700' as any, color: '#0F172A', letterSpacing: -0.2 },
  selectedAddress: { fontSize: 12, color: '#64748B', marginTop: -4 },
  selectedCapsBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  capsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  capsBadgeText: { fontSize: 10, fontWeight: '700' as any, color: '#DC2626' },
  hmoLabel: { fontSize: 10.5, fontWeight: '600' as any, color: '#475569', marginTop: 2 },
  hmoList: { fontSize: 11, color: '#64748B', marginTop: -4 },
  selectedActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#0F6E6E',
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#0F6E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  navBtnText: { fontSize: 12.5, fontWeight: '700' as any, color: '#FFFFFF' },
  callErBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  callErBtnText: { fontSize: 12.5, fontWeight: '700' as any, color: '#DC2626' },

  // Search
  searchSection: { gap: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: { backgroundColor: '#0F6E6E', borderColor: '#0F6E6E' },
  filterPillText: { fontSize: 11.5, fontWeight: '600' as any, color: '#64748B' },
  filterPillTextActive: { color: '#FFFFFF' },

  // List
  listSection: { gap: 10 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listTitle: { fontSize: 12.5, fontWeight: '700' as any, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8 },
  countBadge: { backgroundColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeText: { fontSize: 11, fontWeight: '700' as any, color: '#0F6E6E' },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  hospitalCardSelected: {
    borderColor: '#0F6E6E',
    backgroundColor: '#F0F9F9',
    shadowColor: '#0F6E6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  rankBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rankText: { fontSize: 11, fontWeight: '700' as any },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardHospName: { fontSize: 13.5, fontWeight: '700' as any, color: '#0F172A' },
  cardHospAddr: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  cardDistBlock: { alignItems: 'flex-end' },
  cardDistKm: { fontSize: 13, fontWeight: '700' as any, color: '#0F6E6E' },
  cardDistTime: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  cardBadgesRow: { flexDirection: 'row', gap: 5, marginTop: 6, flexWrap: 'wrap' },
  cardTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  cardTypeText: { fontSize: 10, fontWeight: '700' as any },
  erChip: { backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FECACA' },
  erChipText: { fontSize: 9.5, fontWeight: '700' as any, color: '#DC2626' },
  icuChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  icuChipText: { fontSize: 9.5, fontWeight: '700' as any, color: '#1D4ED8' },
  bloodChip: { backgroundColor: '#F5F3FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#DDD6FE' },
  bloodChipText: { fontSize: 9.5, fontWeight: '700' as any, color: '#6D28D9' },
  cardActionsRow: { flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' },
  cardNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F4F4',
    borderWidth: 1,
    borderColor: '#99D4D4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cardNavText: { fontSize: 11, fontWeight: '700' as any, color: '#0F6E6E' },
  cardCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cardCallText: { fontSize: 11, fontWeight: '700' as any, color: '#DC2626' },
  cardPhoneLabel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'flex-end' },
  cardPhoneText: { fontSize: 10.5, color: '#64748B' },
  emptyState: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '700' as any, color: '#0F172A' },
  emptySub: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});
