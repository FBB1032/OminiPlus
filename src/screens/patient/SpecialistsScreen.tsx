import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Image, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows, BorderRadius } from '../../theme';

const MIN_CONSULT_FEE = 2000;
export type FormatTiers = { chat: number; audio: number; video: number };

const ALL_DOCTORS: Array<{
  id: string; name: string; spec: string; specialty: string;
  rating: number; patients: number; experience: number;
  tiers: FormatTiers; hospital: string; avatar: string;
  available: boolean; mdcnVerified: boolean;
}> = [
  { id:'1', name:'Dr. Folake Ademola',    spec:'Cardiologist',        specialty:'Cardiology',
    rating:4.9, patients:1200, experience:12, tiers:{chat:8000,audio:10000,video:15000},
    hospital:'OmniPulse Heart Center, Lagos',
    avatar:'https://images.unsplash.com/photo-1594824813573-246434e33963?w=300',
    available:true, mdcnVerified:true },
  { id:'2', name:'Dr. Tunde Adewale',     spec:'Neurologist',         specialty:'General',
    rating:4.8, patients:980,  experience:15, tiers:{chat:12000,audio:15000,video:20000},
    hospital:'OmniPulse Neuroscience Institute, Abuja',
    avatar:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    available:true, mdcnVerified:true },
  { id:'3', name:'Dr. Amina Yusuf',       spec:'Dermatologist',       specialty:'Dermatology',
    rating:4.7, patients:2100, experience:8,  tiers:{chat:6000,audio:8000,video:12000},
    hospital:'OmniPulse Skin & Wellness Clinic, Ibadan',
    avatar:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    available:false, mdcnVerified:true },
  { id:'4', name:'Dr. Chukwuemeka Obi',   spec:'Dentist',             specialty:'Dental',
    rating:4.6, patients:850,  experience:7,  tiers:{chat:4000,audio:6000,video:9000},
    hospital:'OmniPulse Dental Care, Port Harcourt',
    avatar:'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    available:true, mdcnVerified:true },
  { id:'5', name:'Dr. Ngozi Okonkwo',     spec:'Ophthalmologist',     specialty:'Eye Care',
    rating:4.8, patients:1450, experience:10, tiers:{chat:10000,audio:13000,video:18000},
    hospital:'OmniPulse Eye Institute, Enugu',
    avatar:'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300',
    available:true, mdcnVerified:true },
  { id:'6', name:'Dr. Babatunde Lawal',   spec:'Psychiatrist',        specialty:'Psychiatry',
    rating:4.7, patients:620,  experience:11, tiers:{chat:14000,audio:17000,video:22000},
    hospital:'OmniPulse Mental Wellness Center, Lagos',
    avatar:'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300',
    available:true, mdcnVerified:true },
  { id:'7', name:'Dr. Hadiza Musa',       spec:'General Practitioner',specialty:'General',
    rating:4.5, patients:3200, experience:9,  tiers:{chat:2000,audio:3500,video:5000},
    hospital:'OmniPulse Family Clinic, Kano',
    avatar:'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300',
    available:true, mdcnVerified:true },
  { id:'8', name:'Dr. Emeka Nwosu',       spec:'Cardiologist',        specialty:'Cardiology',
    rating:4.9, patients:760,  experience:14, tiers:{chat:15000,audio:19000,video:25000},
    hospital:'OmniPulse Cardiac Unit, Abuja',
    avatar:'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300',
    available:false, mdcnVerified:true },
  { id:'9', name:'Dr. Chioma Eze',        spec:'Paediatrician',       specialty:'Pediatrics',
    rating:4.9, patients:1850, experience:11, tiers:{chat:3500,audio:5000,video:7500},
    hospital:"OmniPulse Children's Clinic, Lagos",
    avatar:'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=300',
    available:true, mdcnVerified:true },
];

const SPECIALTY_FILTERS = [
  { label: 'All',         value: 'All',         icon: 'apps-outline'        },
  { label: 'General',     value: 'General',     icon: 'medkit-outline'      },
  { label: 'Cardiology',  value: 'Cardiology',  icon: 'heart-outline'       },
  { label: 'Pediatrics',  value: 'Pediatrics',  icon: 'happy-outline'       },
  { label: 'Dental',      value: 'Dental',      icon: 'nutrition-outline'   },
  { label: 'Dermatology', value: 'Dermatology', icon: 'color-palette-outline'},
  { label: 'Eye Care',    value: 'Eye Care',    icon: 'eye-outline'         },
  { label: 'Psychiatry',  value: 'Psychiatry',  icon: 'fitness-outline'     },
];

type SortKey = 'rating' | 'price' | 'experience';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'rating',     label: 'Top Rated',  icon: 'star-outline'    },
  { key: 'price',      label: 'Price ↑',    icon: 'pricetag-outline' },
  { key: 'experience', label: 'Experience', icon: 'time-outline'    },
];

// Tier icon + color config
const TIER_CONFIG = {
  chat:  { icon: 'chatbubble-outline', color: '#2563EB', bg: '#EFF6FF', label: 'Chat'  },
  audio: { icon: 'mic-outline',        color: '#7C3AED', bg: '#F5F3FF', label: 'Audio' },
  video: { icon: 'videocam-outline',   color: '#DC2626', bg: '#FEF2F2', label: 'Video' },
} as const;

export default function SpecialistsScreen({ route, navigation }: any) {
  const { width } = useWindowDimensions();
  const initialSpecialty = route.params?.specialty || 'All';
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState<SortKey>('rating');

  const filtered = useMemo(() => {
    return ALL_DOCTORS
      .filter((d) => {
        const matchSpec   = selectedSpecialty === 'All' || d.specialty === selectedSpecialty;
        const q           = searchQuery.toLowerCase();
        const matchSearch = !q || d.name.toLowerCase().includes(q) ||
          d.spec.toLowerCase().includes(q) || d.hospital.toLowerCase().includes(q);
        return matchSpec && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating')     return b.rating - a.rating;
        if (sortBy === 'price')      return a.tiers.chat - b.tiers.chat;
        if (sortBy === 'experience') return b.experience - a.experience;
        return 0;
      });
  }, [selectedSpecialty, searchQuery, sortBy]);

  return (
    <SafeAreaView style={s.safe}>

      {/* ══════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════ */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Find a Specialist</Text>
          <Text style={s.headerSub}>
            {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} available
          </Text>
        </View>
      </View>

      {/* ══════════════════════════════════════════════
          SEARCH BAR
      ══════════════════════════════════════════════ */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, specialty, hospital…"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* ══════════════════════════════════════════════
          SPECIALTY FILTER PILLS + SORT ROW
      ══════════════════════════════════════════════ */}
      <View style={s.filterSortBlock}>
        {/* Specialty pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
          {SPECIALTY_FILTERS.map((f) => {
            const active = selectedSpecialty === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[s.pill, active && s.pillActive]}
                onPress={() => setSelectedSpecialty(f.value)}
                activeOpacity={0.8}
              >
                <Ionicons name={f.icon as any} size={13} color={active ? '#FFFFFF' : '#64748B'} />
                <Text style={[s.pillText, active && s.pillTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort row */}
        <View style={s.sortRow}>
          <Text style={s.sortLabel}>Sort:</Text>
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[s.sortBtn, active && s.sortBtnActive]}
                onPress={() => setSortBy(opt.key)}
                activeOpacity={0.8}
              >
                <Ionicons name={opt.icon as any} size={12} color={active ? Colors.patient : '#64748B'} />
                <Text style={[s.sortBtnText, active && s.sortBtnTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Price floor notice when sorting by price */}
      {sortBy === 'price' && (
        <View style={s.floorBanner}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#15803D" />
          <Text style={s.floorBannerText}>
            Platform minimum ₦{MIN_CONSULT_FEE.toLocaleString()} · Lower price = high efficiency, not lower quality — every doctor is MDCN verified.
          </Text>
        </View>
      )}

      {/* ══════════════════════════════════════════════
          DOCTOR CARDS LIST
      ══════════════════════════════════════════════ */}
      <ScrollView
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="people-outline" size={40} color="#CBD5E1" />
            </View>
            <Text style={s.emptyTitle}>No Doctors Found</Text>
            <Text style={s.emptySub}>Try adjusting your search or specialty filter.</Text>
            <TouchableOpacity
              style={s.emptyResetBtn}
              onPress={() => { setSearchQuery(''); setSelectedSpecialty('All'); }}
              activeOpacity={0.8}
            >
              <Text style={s.emptyResetText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={s.card}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id })}
            >
              {/* ── Top row: avatar + info + availability badge ── */}
              <View style={s.cardTop}>
                {/* Avatar */}
                <View style={s.avatarWrap}>
                  <Image source={{ uri: doc.avatar }} style={s.avatar} />
                  <View style={[s.onlineDot, { backgroundColor: doc.available ? '#10B981' : '#94A3B8' }]} />
                </View>

                {/* Info column */}
                <View style={s.infoCol}>
                  {/* Name + MDCN */}
                  <View style={s.nameRow}>
                    <Text style={s.docName} numberOfLines={1}>{doc.name}</Text>
                    {doc.mdcnVerified && (
                      <View style={s.mdcnBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#0F6E6E" />
                        <Text style={s.mdcnText}>MDCN</Text>
                      </View>
                    )}
                  </View>

                  <Text style={s.docSpec}>{doc.spec}</Text>
                  <View style={s.hospitalRow}>
                    <Ionicons name="location-outline" size={11} color="#94A3B8" />
                    <Text style={s.docHospital} numberOfLines={1}>{doc.hospital}</Text>
                  </View>

                  {/* Stats row */}
                  <View style={s.statsRow}>
                    <View style={s.statChip}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={s.statText}>{doc.rating}</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statChip}>
                      <Ionicons name="people-outline" size={11} color="#64748B" />
                      <Text style={s.statText}>{(doc.patients / 1000).toFixed(1)}k pts</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statChip}>
                      <Ionicons name="ribbon-outline" size={11} color="#64748B" />
                      <Text style={s.statText}>{doc.experience} yrs</Text>
                    </View>
                  </View>
                </View>

                {/* Availability pill */}
                <View style={[s.availBadge, doc.available ? s.availBadgeOn : s.availBadgeOff]}>
                  <View style={[s.availDot, { backgroundColor: doc.available ? '#10B981' : '#94A3B8' }]} />
                  <Text style={[s.availText, { color: doc.available ? '#166534' : '#64748B' }]}>
                    {doc.available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>

              {/* ── Tier pricing chips ── */}
              <View style={s.tierRow}>
                {(['chat', 'audio', 'video'] as const).map((t) => {
                  const cfg = TIER_CONFIG[t];
                  return (
                    <View key={t} style={[s.tierChip, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
                      <Text style={[s.tierLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      <Text style={[s.tierPrice, { color: cfg.color }]}>
                        ₦{(doc.tiers[t] / 1000).toFixed(0)}k
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* ── Book button ── */}
              <TouchableOpacity
                style={[s.bookBtn, !doc.available && s.bookBtnDisabled]}
                activeOpacity={0.85}
                onPress={() => {
                  if (doc.available) {
                    navigation.navigate('BookAppointment', {
                      doctorId: doc.id,
                      preSelectedDoctor: { ...doc, selectedFormat: 'chat' },
                    });
                  }
                }}
              >
                <Ionicons name={doc.available ? 'calendar-outline' : 'time-outline'} size={15} color={doc.available ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[s.bookBtnText, !doc.available && s.bookBtnTextDisabled]}>
                  {doc.available ? 'Book Appointment' : 'Currently Unavailable'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {filtered.length > 0 && <View style={{ height: 20 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: { fontSize: 16, fontWeight: FontWeight.bold, color: '#0F172A' },
  headerSub:   { fontSize: 11.5, color: '#64748B', marginTop: 1 },

  // ── Search ───────────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 10,
    ...Shadows.xs,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: '#0F172A', paddingVertical: 0 },

  // ── Filter + sort block ───────────────────────────────────────────────────
  filterSortBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  pillRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  pillActive:     { backgroundColor: Colors.patient, borderColor: Colors.patient },
  pillText:       { fontSize: 12, fontWeight: FontWeight.semiBold, color: '#64748B' },
  pillTextActive: { color: '#FFFFFF' },

  sortRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 4 },
  sortLabel:        { fontSize: 11.5, color: '#94A3B8', fontWeight: FontWeight.medium, marginRight: 2 },
  sortBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  sortBtnActive:    { backgroundColor: '#EFF6FF', borderColor: Colors.patient },
  sortBtnText:      { fontSize: 11.5, color: '#64748B', fontWeight: FontWeight.semiBold },
  sortBtnTextActive:{ color: Colors.patient },

  floorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  floorBannerText: { flex: 1, fontSize: 11, color: '#15803D', lineHeight: 16 },

  // ── List ─────────────────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 14 },

  // ── Doctor card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8EEF4',
    ...Shadows.md,
  },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

  // Avatar
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar:     { width: 66, height: 66, borderRadius: 33, backgroundColor: '#F1F5F9' },
  onlineDot:  {
    width: 13, height: 13, borderRadius: 7,
    borderWidth: 2.5, borderColor: '#FFFFFF',
    position: 'absolute', bottom: 2, right: 2,
  },

  // Info
  infoCol:   { flex: 1, flexShrink: 1, gap: 3 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  docName:   { fontSize: 14.5, fontWeight: FontWeight.bold, color: '#0F172A', flexShrink: 1 },
  mdcnBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E6F4F4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  mdcnText:  { fontSize: 9.5, fontWeight: FontWeight.bold, color: '#0F6E6E' },
  docSpec:   { fontSize: 12.5, color: Colors.patient, fontWeight: FontWeight.semiBold },
  hospitalRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  docHospital: { fontSize: 11, color: '#94A3B8', flexShrink: 1 },

  statsRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statChip:    { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText:    { fontSize: 11.5, color: '#64748B', fontWeight: FontWeight.medium },
  statDivider: { width: 1, height: 10, backgroundColor: '#E2E8F0' },

  // Availability badge
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, flexShrink: 0, alignSelf: 'flex-start',
  },
  availBadgeOn:  { backgroundColor: '#DCFCE7' },
  availBadgeOff: { backgroundColor: '#F1F5F9' },
  availDot:  { width: 7, height: 7, borderRadius: 4 },
  availText: { fontSize: 11, fontWeight: FontWeight.bold },

  // Tier pricing row
  tierRow: { flexDirection: 'row', gap: 8 },
  tierChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
    paddingVertical: 7, borderRadius: 10,
  },
  tierLabel: { fontSize: 10.5, fontWeight: FontWeight.semiBold },
  tierPrice: { fontSize: 11.5, fontWeight: FontWeight.bold },

  // Book button
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.patient,
  },
  bookBtnDisabled: { backgroundColor: '#F1F5F9' },
  bookBtnText:     { fontSize: 13.5, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  bookBtnTextDisabled: { color: '#94A3B8' },

  // Empty state
  emptyState:   { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIconWrap:{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  emptyTitle:   { fontSize: 17, fontWeight: FontWeight.bold, color: '#64748B' },
  emptySub:     { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32 },
  emptyResetBtn:{ marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.patient },
  emptyResetText:{ fontSize: 13, fontWeight: FontWeight.bold, color: '#FFFFFF' },
});
