import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Avatar, Card } from '../../components';

const MOCK_DOCTORS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Dr. Folake Ademola',
    spec: 'Cardiologist',
    rating: 4.9,
    patients: 1200,
    experience: 12,
    about: 'Dr. Folake Ademola is a board-certified cardiologist with over 12 years of clinical experience. She specializes in interventional cardiology, heart failure management, and preventive cardiac care. She completed her residency at Lagos University Teaching Hospital (LUTH).',
    avatar: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=300',
    hospital: 'OminiPlus Heart Center (Lagos)',
    consultFee: 15000,
    available: true,
    reviews: [
      { id: 'r1', author: 'Mariam O.', rating: 5, text: 'Very thorough and explained everything clearly.', date: '2 weeks ago' },
      { id: 'r2', author: 'Tunde A.', rating: 5, text: 'Excellent bedside manner. Highly recommended.', date: '1 month ago' },
    ],
    availableSlots: ['9:00 AM', '10:30 AM', '2:00 PM', '4:30 PM'],
  },
  '2': {
    id: '2',
    name: 'Dr. Tunde Adewale',
    spec: 'Neurologist',
    rating: 4.8,
    patients: 980,
    experience: 15,
    about: 'Dr. Tunde Adewale is a neurologist specializing in headache disorders, stroke management, epilepsy, and neurodegenerative diseases. He completed his fellowship at the West African College of Physicians.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    hospital: 'OminiPlus Neuroscience Institute (Abuja)',
    consultFee: 20000,
    available: true,
    reviews: [
      { id: 'r1', author: 'Linda E.', rating: 5, text: 'Finally got a proper diagnosis after years. Thank you.', date: '3 weeks ago' },
      { id: 'r2', author: 'Robert O.', rating: 4, text: 'Knowledgeable and patient doctor.', date: '1 month ago' },
    ],
    availableSlots: ['8:30 AM', '11:00 AM', '1:00 PM', '3:30 PM'],
  },
  '3': {
    id: '3',
    name: 'Dr. Amina Yusuf',
    spec: 'Dermatologist',
    rating: 4.7,
    patients: 2100,
    experience: 8,
    about: 'Dr. Amina Yusuf is a dermatologist focused on medical and cosmetic dermatology, treating conditions ranging from acne and eczema to skin cancer screenings.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    hospital: 'OminiPlus Skin & Wellness Clinic (Ibadan)',
    consultFee: 12000,
    available: false,
    reviews: [
      { id: 'r1', author: 'Aminat B.', rating: 5, text: 'Cleared up my skin issues in just two visits.', date: '1 week ago' },
      { id: 'r2', author: 'Tobi B.', rating: 5, text: 'Very professional and caring doctor.', date: '2 months ago' },
    ],
    availableSlots: [],
  },
};

export default function DoctorProfileScreen({ route, navigation }: any) {
  const { doctorId } = route.params;
  const doctor = MOCK_DOCTORS[doctorId] || MOCK_DOCTORS['1'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar name={doctor.name} uri={doctor.avatar} size="xl" />
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docSpec}>{doctor.spec}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: doctor.available ? '#10B981' : '#94A3B8' }]} />
            <Text style={styles.statusText}>{doctor.available ? 'Available Today' : 'Unavailable'}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.patients.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience} yr</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingValue}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.statValue}>{doctor.rating}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₦{doctor.consultFee?.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Per Visit</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{doctor.about}</Text>
        </View>

        {/* Hospital */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospital</Text>
          <View style={styles.hospitalRow}>
            <View style={styles.hospitalIcon}>
              <Ionicons name="business" size={18} color="#2563EB" />
            </View>
            <Text style={styles.hospitalName}>{doctor.hospital}</Text>
          </View>
        </View>

        {/* Available Slots */}
        {doctor.availableSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Today</Text>
            <View style={styles.slotsRow}>
              {doctor.availableSlots.map((slot: string, idx: number) => (
                <View key={idx} style={styles.slotChip}>
                  <Text style={styles.slotText}>{slot}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Reviews</Text>
          {doctor.reviews.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.author}</Text>
                <View style={styles.reviewRating}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={11} color="#F59E0B" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.feeCol}>
          <Text style={styles.feeLabel}>Consultation Fee</Text>
          <Text style={styles.feeValue}>₦{doctor.consultFee?.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, !doctor.available && styles.bookBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => {
            if (doctor.available) {
              navigation.navigate('BookAppointment', {
                doctorId: doctor.id,
                preSelectedDoctor: doctor,
              });
            }
          }}
        >
          <Text style={styles.bookBtnText}>
            {doctor.available ? 'Book Appointment' : 'Currently Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
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
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  scroll: {
    paddingBottom: 120,
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing[6],
    backgroundColor: '#FFFFFF',
    gap: Spacing[1],
  },
  docName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    marginTop: Spacing[3],
  },
  docSpec: {
    fontSize: FontSize.sm,
    color: '#64748B',
    fontWeight: FontWeight.medium,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing[2],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: '#64748B',
    fontWeight: FontWeight.medium,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: FontWeight.medium,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[5],
    gap: Spacing[3],
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  aboutText: {
    fontSize: FontSize.sm,
    color: '#475569',
    lineHeight: 22,
  },

  // Hospital
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: '#FFFFFF',
    padding: Spacing[4],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hospitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: '#0F172A',
  },

  // Slots
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  slotChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  slotText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: '#0F172A',
  },

  // Reviews
  reviewCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing[4],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing[2],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewText: {
    fontSize: FontSize.sm,
    color: '#475569',
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    paddingBottom: Spacing[6],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: Spacing[4],
    ...Shadows.md,
  },
  feeCol: {
    gap: 2,
  },
  feeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: FontWeight.medium,
  },
  feeValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#0F172A',
  },
  bookBtn: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  bookBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
