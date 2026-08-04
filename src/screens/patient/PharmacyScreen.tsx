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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';
import { useToast } from '../../hooks/useAuth';

interface PharmacyItem {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  isOpen24Hours: boolean;
  distanceKm: number;
  driveTimeMins: number;
  walkTimeMins: number;
  phone: string;
  isCertifiedPartner: boolean;
  latitude: number;
  longitude: number;
}

const MOCK_PHARMACIES: PharmacyItem[] = [
  {
    id: 'ph-1',
    name: 'Medplus Pharmacy & Superstore',
    address: '14 Allen Avenue, Ikeja',
    city: 'Lagos',
    status: 'Open 24/7',
    isOpen24Hours: true,
    distanceKm: 0.8,
    driveTimeMins: 3,
    walkTimeMins: 9,
    phone: '+234 803 123 4567',
    isCertifiedPartner: true,
    latitude: 6.6018,
    longitude: 3.3515,
  },
  {
    id: 'ph-2',
    name: 'HealthPlus Pharmacy',
    address: 'Oba Akran Avenue, Ikeja',
    city: 'Lagos',
    status: 'Closes at 10:00 PM',
    isOpen24Hours: false,
    distanceKm: 1.5,
    driveTimeMins: 5,
    walkTimeMins: 16,
    phone: '+234 802 987 6543',
    isCertifiedPartner: true,
    latitude: 6.6050,
    longitude: 3.3420,
  },
  {
    id: 'ph-3',
    name: 'Alpha Pharmacy & Healthcare',
    address: '42 Isaac John Street, GRA Ikeja',
    city: 'Lagos',
    status: 'Open 24/7',
    isOpen24Hours: true,
    distanceKm: 2.3,
    driveTimeMins: 7,
    walkTimeMins: 24,
    phone: '+234 805 555 1212',
    isCertifiedPartner: true,
    latitude: 6.5880,
    longitude: 3.3580,
  },
  {
    id: 'ph-4',
    name: 'Carefort Drugs & Mart',
    address: '78 Toyin Street, Ikeja',
    city: 'Lagos',
    status: 'Closes at 9:00 PM',
    isOpen24Hours: false,
    distanceKm: 3.1,
    driveTimeMins: 10,
    walkTimeMins: 32,
    phone: '+234 809 333 4455',
    isCertifiedPartner: false,
    latitude: 6.5920,
    longitude: 3.3490,
  },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Pharmacies', icon: 'grid-outline' },
  { id: '247', label: 'Open 24/7', icon: 'moon-outline' },
  { id: 'near', label: '< 2 km', icon: 'location-outline' },
  { id: 'partner', label: 'Certified Partners', icon: 'ribbon-outline' },
];

export default function PharmacyScreen({ navigation }: any) {
  const { success: toastSuccess } = useToast();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);
  const [isNotifiedForDelivery, setIsNotifiedForDelivery] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('ph-1');

  // GPS Refresh simulation
  const handleRefreshGPS = () => {
    setIsRefreshingGPS(true);
    setTimeout(() => {
      setIsRefreshingGPS(false);
      toastSuccess('GPS Calibrated', 'Location refreshed: Ikeja, Lagos (Accuracy: High)');
    }, 800);
  };

  // Filter pharmacies
  const filteredPharmacies = useMemo(() => {
    return MOCK_PHARMACIES.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase());

      let matchCat = true;
      if (activeCategory === '247') matchCat = p.isOpen24Hours;
      if (activeCategory === 'near') matchCat = p.distanceKm <= 2.0;
      if (activeCategory === 'partner') matchCat = p.isCertifiedPartner;

      return matchQuery && matchCat;
    });
  }, [searchQuery, activeCategory]);

  // Closest Pharmacy Recommendation
  const closestPharmacy = useMemo(() => {
    return [...MOCK_PHARMACIES].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  }, []);

  const activeSelectedPharmacy = useMemo(() => {
    return MOCK_PHARMACIES.find(p => p.id === selectedPharmacyId) || closestPharmacy;
  }, [selectedPharmacyId, closestPharmacy]);

  const handleCallPharmacy = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Dial ${phone} to connect directly with the pharmacist on duty?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            const url = `tel:${phone.replace(/\s+/g, '')}`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) Linking.openURL(url);
                else toastSuccess('Dialer', `Calling ${phone}...`);
              })
              .catch(() => toastSuccess('Dialer', `Calling ${phone}...`));
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

  const handleNotifyDelivery = () => {
    setIsNotifiedForDelivery(true);
    toastSuccess(
      'Waitlist Joined',
      'You are registered for early access! We will alert you immediately when Doorstep Prescription Delivery launches in Ikeja.'
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
          <Text style={styles.headerTitle}>GPS Pharmacy Radar</Text>
          <Text style={styles.headerSubtitle}>Ikeja, Lagos • GPS Active</Text>
        </View>

        {/* View Mode Toggle (Map vs List) */}
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
        
        {/* ── Doorstep Delivery Coming Soon Glassmorphism Hero Card ─────────── */}
        <View style={styles.heroDeliveryCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.badgePill}>
              <Ionicons name="cube-outline" size={13} color="#047857" />
              <Text style={styles.badgePillText}>DOORSTEP DELIVERY • COMING SOON</Text>
            </View>
            <TouchableOpacity style={styles.gpsRefreshChip} onPress={handleRefreshGPS} disabled={isRefreshingGPS}>
              {isRefreshingGPS ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <>
                  <Ionicons name="navigate" size={12} color="#059669" />
                  <Text style={styles.gpsRefreshChipText}>Refresh GPS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>Need Prescriptions Delivered?</Text>
          <Text style={styles.heroSub}>
            We are onboarding local pharmacy dispatch riders in Ikeja. Soon you will order drugs directly to your doorstep. For now, locate open pharmacies near you below for direct pickup or phone orders.
          </Text>

          <TouchableOpacity
            style={[styles.heroNotifyBtn, isNotifiedForDelivery && styles.heroNotifyBtnActive]}
            onPress={handleNotifyDelivery}
            disabled={isNotifiedForDelivery}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isNotifiedForDelivery ? 'checkmark-circle' : 'notifications'}
              size={16}
              color={isNotifiedForDelivery ? '#047857' : '#FFFFFF'}
            />
            <Text style={[styles.heroNotifyText, isNotifiedForDelivery && styles.heroNotifyTextActive]}>
              {isNotifiedForDelivery ? 'VIP Waitlist Joined ✓' : 'Notify Me When Delivery Launches'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── VISUAL GPS RADAR MAP BOX (When Map Mode Selected) ─────────────── */}
        {viewMode === 'map' && (
          <View style={styles.mapVisualContainer}>
            <View style={styles.mapHeaderRow}>
              <View style={styles.mapTitleGroup}>
                <Ionicons name="location" size={16} color="#059669" />
                <Text style={styles.mapTitleText}>GPS Radar Visualizer</Text>
              </View>
              <Text style={styles.mapSubText}>4 Pharmacies Mapped Nearby</Text>
            </View>

            {/* Simulated Radar Map View Box */}
            <View style={styles.mapRadarBox}>
              {/* Map grid lines background simulation */}
              <View style={styles.mapGridLineH1} />
              <View style={styles.mapGridLineH2} />
              <View style={styles.mapGridLineV1} />
              <View style={styles.mapGridLineV2} />

              {/* Connected Route Path Line Simulation */}
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

              {/* Pharmacy GPS Map Pins */}
              {MOCK_PHARMACIES.map((pharm, idx) => {
                const isSelected = selectedPharmacyId === pharm.id;
                // Position pins in visual layout
                const positions = [
                  { top: 25, right: 35 },
                  { top: 90, right: 90 },
                  { top: 130, left: 40 },
                  { top: 50, left: 70 },
                ];
                const pos = positions[idx % positions.length];

                return (
                  <TouchableOpacity
                    key={pharm.id}
                    style={[
                      styles.mapPinContainer,
                      pos as any,
                      isSelected && styles.mapPinContainerSelected,
                    ]}
                    onPress={() => setSelectedPharmacyId(pharm.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.mapPinBubble, isSelected && styles.mapPinBubbleSelected]}>
                      <Ionicons
                        name="medical"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#059669'}
                      />
                      <Text style={[styles.mapPinText, isSelected && styles.mapPinTextSelected]}>
                        {pharm.name.split(' ')[0]} ({pharm.distanceKm}km)
                      </Text>
                    </View>
                    <View style={[styles.mapPinNeedle, isSelected && styles.mapPinNeedleSelected]} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Pin Details Overlay Card */}
            {activeSelectedPharmacy && (
              <View style={styles.selectedOverlayCard}>
                <View style={styles.selectedCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.selectedCardName}>{activeSelectedPharmacy.name}</Text>
                      {activeSelectedPharmacy.isCertifiedPartner && (
                        <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                      )}
                    </View>
                    <Text style={styles.selectedCardAddress}>{activeSelectedPharmacy.address}</Text>
                  </View>
                  <View style={styles.closestEtaBadge}>
                    <Text style={styles.closestEtaText}>{activeSelectedPharmacy.driveTimeMins} min drive</Text>
                    <Text style={styles.closestDistText}>{activeSelectedPharmacy.distanceKm} km</Text>
                  </View>
                </View>

                <View style={styles.selectedActionsRow}>
                  <TouchableOpacity
                    style={styles.selectedNavBtn}
                    onPress={() => handleGetDirections(activeSelectedPharmacy.name, activeSelectedPharmacy.address)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={15} color="#FFFFFF" />
                    <Text style={styles.selectedNavText}>Get Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectedCallBtn}
                    onPress={() => handleCallPharmacy(activeSelectedPharmacy.phone, activeSelectedPharmacy.name)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={14} color="#059669" />
                    <Text style={styles.selectedCallText}>Call Pharmacist</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Search Input & Category Filter Pills ─────────────────────────── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pharmacy by name or street..."
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

          {/* Category Filter Pills */}
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

        {/* ── All Nearby Pharmacies List ─────────────────────────────────── */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            Nearby Pharmacies ({filteredPharmacies.length})
          </Text>

          {filteredPharmacies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={42} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Pharmacies Found</Text>
              <Text style={styles.emptySub}>
                No pharmacies match your current search or category filter. Try clearing filters.
              </Text>
            </View>
          ) : (
            filteredPharmacies.map((pharmacy) => {
              const isSelected = selectedPharmacyId === pharmacy.id;
              return (
                <Card
                  key={pharmacy.id}
                  style={[styles.pharmacyCard, isSelected && styles.pharmacyCardSelected]}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedPharmacyId(pharmacy.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.cardMainRow}>
                      <View style={styles.pharmacyIconBox}>
                        <Ionicons name="medical" size={20} color={Colors.primary[600]} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                          {pharmacy.isCertifiedPartner && (
                            <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                          )}
                        </View>
                        <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>

                        <View style={styles.metaBadgeRow}>
                          <View style={[styles.statusTag, pharmacy.isOpen24Hours ? styles.statusOpen : styles.statusStandard]}>
                            <Text style={[styles.statusTagText, pharmacy.isOpen24Hours ? styles.statusTextOpen : styles.statusTextStandard]}>
                              {pharmacy.status}
                            </Text>
                          </View>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.metaDistanceText}>{pharmacy.distanceKm} km away</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.metaTimeText}>{pharmacy.driveTimeMins} min drive</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.cardDirectionsBtn}
                      onPress={() => handleGetDirections(pharmacy.name, pharmacy.address)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="navigate" size={14} color={Colors.primary[600]} />
                      <Text style={styles.cardDirectionsText}>GPS Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardCallBtn}
                      onPress={() => handleCallPharmacy(pharmacy.phone, pharmacy.name)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call-outline" size={14} color="#475569" />
                      <Text style={styles.cardCallText}>Call Pharmacist</Text>
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
  heroDeliveryCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: Spacing[4],
    gap: 8,
    ...Shadows.xs,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#047857',
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
    borderColor: '#A7F3D0',
  },
  gpsRefreshChipText: {
    fontSize: 10.5,
    fontWeight: FontWeight.bold,
    color: '#059669',
  },
  heroTitle: {
    fontSize: 15.5,
    fontWeight: FontWeight.bold,
    color: '#065F46',
  },
  heroSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
  heroNotifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  heroNotifyBtnActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  heroNotifyText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  heroNotifyTextActive: {
    color: '#047857',
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
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridLineH1: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  mapGridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  mapGridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  routeLine: {
    position: 'absolute',
    top: 45,
    left: 80,
    width: 110,
    height: 2,
    backgroundColor: '#059669',
    transform: [{ rotate: '25deg' }],
  },
  userLocationPulseRing: {
    position: 'absolute',
    bottom: 35,
    left: 45,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
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
    borderColor: '#6EE7B7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    ...Shadows.xs,
  },
  mapPinBubbleSelected: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  mapPinText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#065F46',
  },
  mapPinTextSelected: {
    color: '#FFFFFF',
  },
  mapPinNeedle: {
    width: 2,
    height: 8,
    backgroundColor: '#059669',
  },
  mapPinNeedleSelected: {
    backgroundColor: '#047857',
    width: 3,
  },

  // Selected Overlay Card
  selectedOverlayCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
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
    color: '#065F46',
  },
  selectedCardAddress: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 1,
  },
  closestEtaBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  closestEtaText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#047857',
  },
  closestDistText: {
    fontSize: 10,
    color: '#059669',
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
    backgroundColor: '#059669',
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
    borderColor: '#6EE7B7',
    paddingVertical: 9,
    borderRadius: 8,
  },
  selectedCallText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#059669',
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
  pharmacyCard: {
    padding: Spacing[3],
    gap: 10,
  },
  pharmacyCardSelected: {
    borderColor: Colors.primary[600],
    borderWidth: 1.5,
  },
  cardMainRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  pharmacyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pharmacyName: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  pharmacyAddress: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: '#ECFDF5',
  },
  statusStandard: {
    backgroundColor: '#FFFBEB',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  statusTextOpen: {
    color: '#059669',
  },
  statusTextStandard: {
    color: '#D97706',
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  metaDistanceText: {
    fontSize: 10.5,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  metaTimeText: {
    fontSize: 10.5,
    color: Colors.primary[600],
    fontWeight: FontWeight.semiBold,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardDirectionsBtn: {
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
  cardDirectionsText: {
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
    color: '#475569',
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
