import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Shadows } from '../../theme';

const ALL_DOCTORS = [
  { id: '1', name: 'Dr. Folake Ademola',    spec: 'Cardiologist',          specialty: 'Cardiology',    rating: 4.9, patients: 1200, experience: 12, consultFee: 15000, hospital: 'OmniPulse Heart Center, Lagos',             avatar: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=300', available: true },
  { id: '2', name: 'Dr. Tunde Adewale',     spec: 'Neurologist',           specialty: 'General',       rating: 4.8, patients: 980,  experience: 15, consultFee: 20000, hospital: 'OmniPulse Neuroscience Institute, Abuja',    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300', available: true },
  { id: '3', name: 'Dr. Amina Yusuf',       spec: 'Dermatologist',         specialty: 'Dermatology',   rating: 4.7, patients: 2100, experience: 8,  consultFee: 12000, hospital: 'OmniPulse Skin & Wellness Clinic, Ibadan',   avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300', available: false },
  { id: '4', name: 'Dr. Chukwuemeka Obi',   spec: 'Dentist',               specialty: 'Dental',        rating: 4.6, patients: 850,  experience: 7,  consultFee: 9000,  hospital: 'OmniPulse Dental Care, Port Harcourt',      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300', available: true },
  { id: '5', name: 'Dr. Ngozi Okonkwo',     spec: 'Ophthalmologist',       specialty: 'Eye Care',      rating: 4.8, patients: 1450, experience: 10, consultFee: 18000, hospital: 'OmniPulse Eye Institute, Enugu',             avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300', available: true },
  { id: '6', name: 'Dr. Babatunde Lawal',   spec: 'Psychiatrist',          specialty: 'Psychiatry',    rating: 4.7, patients: 620,  experience: 11, consultFee: 22000, hospital: 'OmniPulse Mental Wellness Center, Lagos',    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300', available: true },
  { id: '7', name: 'Dr. Hadiza Musa',       spec: 'General Practitioner',  specialty: 'General',       rating: 4.5, patients: 3200, experience: 9,  consultFee: 7000,  hospital: 'OmniPulse Family Clinic, Kano',              avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300', available: true },
  { id: '8', name: 'Dr. Emeka Nwosu',       spec: 'Cardiologist',          specialty: 'Cardiology',    rating: 4.9, patients: 760,  experience: 14, consultFee: 25000, hospital: 'OmniPulse Cardiac Unit, Abuja',              avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300', available: false },
];

const SPECIALTY_FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'General', value: 'General' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Dental', value: 'Dental' },
  { label: 'Dermatology', value: 'Dermatology' },
  { label: 'Eye Care', value: 'Eye Care' },
  { label: 'Psychiatry', value: 'Psychiatry' },
];

export default function SpecialistsScreen({ route, navigation }: any) {
  const initialSpecialty = route.params?.specialty || 'All';
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'fee' | 'experience'>('rating');

  const filtered = useMemo(() => {
    return ALL_DOCTORS
      .filter((d) => {
        const matchSpec = selectedSpecialty === 'All' || d.specialty === selectedSpecialty;
        const q = searchQuery.toLowerCase();
        const matchSearch =
          d.name.toLowerCase().includes(q) ||
          d.spec.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q);
        return matchSpec && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'fee') return a.consultFee - b.consultFee;
        return b.experience - a.experience;
      });
  }, [selectedSpecialty, searchQuery, sortBy]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Find a Specialist</Text>
          <Text style={styles.headerSub}>{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} available</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, specialty, hospital..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ paddingHorizontal: 10 }}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {SPECIALTY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterPill, selectedSpecialty === f.value && styles.filterPillActive]}
            onPress={() => setSelectedSpecialty(f.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, selectedSpecialty === f.value && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['rating', 'fee', 'experience'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
              {s === 'fee' ? 'Lowest Fee' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Doctors Found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or specialty filter.</Text>
          </View>
        ) : (
          filtered.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id })}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: doc.avatar }} style={styles.avatar} />
                <View style={[styles.availDot, { backgroundColor: doc.available ? '#10B981' : '#94A3B8' }]} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docSpec} numberOfLines={1}>{doc.spec}</Text>
                <Text style={styles.docHospital} numberOfLines={1}>{doc.hospital}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={styles.metaText}>{doc.rating}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="people-outline" size={11} color="#64748B" />
                    <Text style={styles.metaText}>{doc.patients.toLocaleString()} pts</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={11} color="#64748B" />
                    <Text style={styles.metaText}>{doc.experience} yrs exp</Text>
                  </View>
                </View>
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.feeLabel}>From</Text>
                <Text style={styles.feeAmount}>N{(doc.consultFee / 1000).toFixed(0)}k</Text>
                <View style={[styles.availBadge, { backgroundColor: doc.available ? '#DCFCE7' : '#F1F5F9' }]}>
                  <Text style={[styles.availText, { color: doc.available ? '#166534' : '#64748B' }]}>
                    {doc.available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        {filtered.length > 0 && (
          <TouchableOpacity
            style={styles.bookCta}
            onPress={() => navigation.navigate('BookAppointment')}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            <Text style={styles.bookCtaText}>Book an Appointment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: FontWeight.bold, color: '#0F172A' },
  headerSub: { fontSize: 11.5, color: '#64748B', marginTop: 1 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: '#0F172A' },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  filterPillActive: { backgroundColor: Colors.patient, borderColor: Colors.patient },
  filterPillText: { fontSize: 12, fontWeight: FontWeight.semibold, color: '#64748B' },
  filterPillTextActive: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 10 },
  sortLabel: { fontSize: 12, color: '#94A3B8', marginRight: 2 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  sortBtnActive: { backgroundColor: '#EFF6FF', borderColor: Colors.patient },
  sortBtnText: { fontSize: 11, color: '#64748B', fontWeight: FontWeight.semibold },
  sortBtnTextActive: { color: Colors.patient },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#F1F5F9' },
  availDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF', position: 'absolute', bottom: 1, right: 1 },
  docName: { fontSize: 13.5, fontWeight: FontWeight.bold, color: '#0F172A' },
  docSpec: { fontSize: 12, color: Colors.patient, fontWeight: FontWeight.semibold, marginTop: 1 },
  docHospital: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#64748B' },
  rightCol: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  feeLabel: { fontSize: 10, color: '#94A3B8' },
  feeAmount: { fontSize: 14, fontWeight: FontWeight.bold, color: '#0F172A' },
  availBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  availText: { fontSize: 10.5, fontWeight: FontWeight.semibold },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: FontWeight.bold, color: '#94A3B8' },
  emptySub: { fontSize: 12, color: '#CBD5E1', textAlign: 'center' },
  bookCta: { backgroundColor: Colors.patient, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 },
  bookCtaText: { fontSize: 14, fontWeight: FontWeight.bold, color: '#FFFFFF' },
});