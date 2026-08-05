import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';
import { useAuth, useToast } from '../../hooks/useAuth';

interface FAQItem {
  id: string;
  category: string;
  role: 'patient' | 'doctor';
  question: string;
  answer: string;
}

// ─── STRICT ROLE-SEPARATED FAQS ──────────────────────────────────────────────

const PATIENT_FAQS: FAQItem[] = [
  {
    id: 'p-faq-1',
    category: 'booking',
    role: 'patient',
    question: 'How do I book a telehealth consultation on OminiPulse?',
    answer:
      'Browse verified specialists by specialization or live availability status, choose a convenient time slot, and conduct secure HD video, phone, or chat consultations directly inside the app. Your payment is held in escrow and only released to the doctor after they confirm your booking.',
  },
  {
    id: 'p-faq-2',
    category: 'billing',
    role: 'patient',
    question: 'What is the appointment cancellation and refund policy?',
    answer:
      'Free Cancellation: You can cancel any booking for a full 100% refund at any time before the doctor confirms (approves) your appointment — no questions asked. After the doctor confirms: cancellations more than 24 hours before get a 100% refund; 6–24 hours before get a 50% refund; less than 6 hours before are non-refundable. Doctor-initiated cancellations always qualify for a 100% full refund. Refunds are processed in 3–5 business days or instantly as in-app wallet credit.',
  },
  {
    id: 'p-faq-3',
    category: 'billing',
    role: 'patient',
    question: 'How does the OminiPulse payment escrow work?',
    answer:
      'When you book and pay for a consultation, your money is held securely by OminiPulse and not sent to the doctor until they formally confirm your appointment. If a doctor confirms and then fails to conduct the session, you receive an automatic full refund. This protects you from no-show doctors.',
  },
  {
    id: 'p-faq-4',
    category: 'privacy',
    role: 'patient',
    question: 'How is my Electronic Health Record (EHR) kept private?',
    answer:
      'All your medical records, lab results, and consultation notes are encrypted with 256-bit AES encryption under the Nigeria Data Protection Act (NDPA) 2023. You can control exactly which records are visible to doctors using the per-record visibility toggle on your Medical Records screen. You can also view a full audit trail of every access to your records under "Who Viewed My Records" in your profile.',
  },
  {
    id: 'p-faq-5',
    category: 'privacy',
    role: 'patient',
    question: 'Can I export or download all my medical records?',
    answer:
      'Yes. Under your NDPA data portability rights, you can export a complete archive of all your medical records in PDF or ZIP format at any time using the "Export My Records" button on your Medical Records screen.',
  },
  {
    id: 'p-faq-6',
    category: 'privacy',
    role: 'patient',
    question: 'Can I hide a medical record from my doctor?',
    answer:
      'Yes. Each record in your Medical Records screen has a visibility toggle. You can set any individual record to "Visible to me only" to prevent it from being seen by doctors while keeping it accessible to yourself. You can change this at any time.',
  },
  {
    id: 'p-faq-7',
    category: 'booking',
    role: 'patient',
    question: 'What should I do in case of a medical emergency?',
    answer:
      'OminiPulse is designed for non-emergency medical consultations. In case of life-threatening emergencies (severe chest pain, acute respiratory distress, severe hemorrhage, loss of consciousness), call national emergency hotlines (112 / 767) or navigate to the nearest hospital emergency room immediately using our GPS Hospital Navigator.',
  },
  {
    id: 'p-faq-8',
    category: 'pharmacy',
    role: 'patient',
    question: 'How do I receive and fulfill my Electronic Prescriptions?',
    answer:
      'After your consultation, your doctor issues a digitally signed e-prescription directly to your Medical Records. Use our GPS Pharmacy Radar to locate nearby certified pharmacies for in-person pickup. Doorstep delivery is coming soon.',
  },
  {
    id: 'p-faq-9',
    category: 'billing',
    role: 'patient',
    question: 'What are the legal consequences of providing false medical information?',
    answer:
      'Providing false health details, lying to doctors, attempting prescription fraud, or making fraudulent malicious reports is strictly illegal. Offenders will face immediate permanent account termination and may be fined, sued for civil damages, or arrested and prosecuted under Nigerian law.',
  },
];

const DOCTOR_FAQS: FAQItem[] = [
  {
    id: 'd-faq-1',
    category: 'payouts',
    role: 'doctor',
    question: 'How does the 10% platform fee and payout work?',
    answer:
      'OminiPulse retains a flat 10% platform service fee from each completed consultation, covering HD video infrastructure, EHR hosting, payment processing, and NDPA compliance. The remaining 90% is disbursed to your verified bank account within 24 hours of marking the consultation as completed.',
  },
  {
    id: 'd-faq-2',
    category: 'payouts',
    role: 'doctor',
    question: 'How does the appointment confirmation and escrow system work?',
    answer:
      'When a patient books you, their payment is held in escrow by OminiPulse. You must formally confirm (approve) the booking through your Appointments screen to release the funds. Unconfirmed bookings are automatically refunded to the patient after 24 hours. IMPORTANT: Confirming a booking and then failing to conduct the consultation is a serious breach — it results in immediate account suspension and a full refund to the patient at your expense.',
  },
  {
    id: 'd-faq-3',
    category: 'verification',
    role: 'doctor',
    question: 'What credentials are required for account verification?',
    answer:
      'All five documents are mandatory with no exceptions: (1) MDCN Medical License with expiry date, (2) National Identity Number (NIN) or Government-Issued ID, (3) Specialty Certificate (required for all doctors including GPs — WACP, FWACP, Fellowship, or equivalent), (4) Current Employer or Clinic Affiliation Letter, (5) Professional Passport-Style Photo. Your account remains pending until all five are approved by a Compliance Officer.',
  },
  {
    id: 'd-faq-4',
    category: 'verification',
    role: 'doctor',
    question: 'What happens when my MDCN license expires?',
    answer:
      'Your account validity is tied to your MDCN license expiry date. You will receive renewal notifications 30 days and 7 days before expiry. Upon expiry, you enter a 30-day grace period where you can view your dashboard but cannot accept new bookings. After the grace period, your account is fully restricted until a Compliance Officer verifies your renewed license.',
  },
  {
    id: 'd-faq-5',
    category: 'verification',
    role: 'doctor',
    question: 'What happens if my account is suspended?',
    answer:
      'Suspensions on OminiPulse are indefinite — there is no automatic expiry date. A suspended account can still be logged into to view your suspension reason, past appointments, and contact compliance support. All clinical features are disabled. To appeal, contact compliance@ominipulse.ng. Reinstatement requires a fresh document review and Compliance Officer approval.',
  },
  {
    id: 'd-faq-6',
    category: 'schedule',
    role: 'doctor',
    question: 'How do I set my consultation availability and live status?',
    answer:
      'In the Doctor Availability screen under your Profile, you can configure your weekly schedule by day and time, set slot durations, and toggle your live status between Available Now, Busy, and Offline. Your live status is visible to patients on all booking and doctor listing screens.',
  },
  {
    id: 'd-faq-7',
    category: 'clinical',
    role: 'doctor',
    question: 'What are the guidelines for issuing E-Prescriptions?',
    answer:
      'E-prescriptions are digitally signed, tamper-evident, and verifiable by partner pharmacies. Schedule II controlled narcotics, opioids, or habit-forming medications cannot be prescribed via telehealth under any circumstances.',
  },
  {
    id: 'd-faq-8',
    category: 'clinical',
    role: 'doctor',
    question: 'What happens if a patient reports me for misconduct or malpractice?',
    answer:
      'OminiPulse Compliance Officers launch an immediate internal investigation upon receiving evidence-backed reports. If found guilty, your account faces suspension or a permanent ban. Serious offenses are reported to the MDCN, which may result in license revocation, arrest, and criminal prosecution under Nigerian law.',
  },
];

export default function HelpCenterScreen({ navigation }: any) {
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const isDoctor = user?.role === 'doctor';
  const roleFaqs = isDoctor ? DOCTOR_FAQS : PATIENT_FAQS;

  const PATIENT_CATEGORIES = [
    { id: 'all', label: 'All FAQs' },
    { id: 'booking', label: 'Booking & Consultations' },
    { id: 'pharmacy', label: 'Prescriptions & Pharmacy' },
    { id: 'billing', label: 'Refunds & Payments' },
  ];

  const DOCTOR_CATEGORIES = [
    { id: 'all', label: 'All FAQs' },
    { id: 'payouts', label: '10% Fee & Payouts' },
    { id: 'verification', label: 'MDCN Verification' },
    { id: 'clinical', label: 'Clinical Guidelines' },
  ];

  const categories = isDoctor ? DOCTOR_CATEGORIES : PATIENT_CATEGORIES;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(isDoctor ? 'd-faq-1' : 'p-faq-1');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFaqs = useMemo(() => {
    return roleFaqs.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [roleFaqs, activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleLiveSupport = () => {
    toastSuccess(
      'Connecting Live Support',
      isDoctor
        ? 'Connecting with Provider Relations Support Specialist...'
        : 'Connecting with Patient Customer Care Specialist...'
    );
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent(isDoctor ? 'Doctor Provider Support Inquiry' : 'Patient Support Inquiry');
    Linking.openURL(`mailto:support@ominipulse.com?subject=${subject}`);
  };

  const handleCallSupport = () => {
    Alert.alert(
      'Call OminiPulse Support',
      `Dial +234 800 664 6478 for 24/7 ${isDoctor ? 'Practitioner' : 'Patient'} Assistance?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:+2348006646478') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isDoctor ? 'Doctor Provider Help Center' : 'Patient Telehealth Support'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isDoctor ? 'Practitioner Guides, Payouts & Technical Support' : '24/7 Patient Assistance & Consultation FAQ'}
          </Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: isDoctor ? '#F0FDF4' : '#EFF6FF', borderColor: isDoctor ? '#BBF7D0' : '#BFDBFE' }]}>
          <Ionicons name={isDoctor ? 'medkit' : 'person'} size={12} color={isDoctor ? '#059669' : '#2563EB'} />
          <Text style={[styles.roleBadgeText, { color: isDoctor ? '#059669' : '#2563EB' }]}>
            {isDoctor ? 'Doctor Only' : 'Patient Only'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Support Channels Banner */}
        <View style={styles.supportChannelsCard}>
          <Text style={styles.channelsTitle}>
            {isDoctor ? 'Practitioner Support Desk' : 'How can we help your health journey today?'}
          </Text>
          <Text style={styles.channelsSub}>
            {isDoctor
              ? 'Get direct assistance with payout account verification, video streaming, or clinical tools.'
              : 'Choose a dedicated support channel to speak with our patient care team.'}
          </Text>

          <View style={styles.channelButtonsRow}>
            <TouchableOpacity style={styles.channelBtn} onPress={handleLiveSupport} activeOpacity={0.8}>
              <View style={[styles.channelIconBg, { backgroundColor: isDoctor ? '#F0FDF4' : '#EFF6FF' }]}>
                <Ionicons name="chatbubbles-outline" size={18} color={isDoctor ? '#059669' : '#2563EB'} />
              </View>
              <Text style={styles.channelBtnText}>Live Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.channelBtn} onPress={handleEmailSupport} activeOpacity={0.8}>
              <View style={[styles.channelIconBg, { backgroundColor: isDoctor ? '#F0FDF4' : '#ECFDF5' }]}>
                <Ionicons name="mail-outline" size={18} color="#059669" />
              </View>
              <Text style={styles.channelBtnText}>Email Support</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.channelBtn} onPress={handleCallSupport} activeOpacity={0.8}>
              <View style={[styles.channelIconBg, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="call-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.channelBtnText}>Call 24/7</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={isDoctor ? 'Search doctor payouts, MDCN verification...' : 'Search booking, prescriptions, refunds...'}
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

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tabChip,
                activeCategory === cat.id && (isDoctor ? styles.tabChipDoctorActive : styles.tabChipPatientActive),
              ]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabChipText,
                  activeCategory === cat.id && styles.tabChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Accordion FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionHeading}>
            {isDoctor ? 'Practitioner Frequently Asked Questions' : 'Patient Frequently Asked Questions'}
          </Text>

          {filteredFaqs.length === 0 ? (
            <View style={styles.emptyFaq}>
              <Ionicons name="help-circle-outline" size={38} color="#CBD5E1" />
              <Text style={styles.emptyFaqTitle}>No Articles Found</Text>
              <Text style={styles.emptyFaqSub}>
                No support articles match your search in {isDoctor ? 'Doctor' : 'Patient'} Help Center.
              </Text>
            </View>
          ) : (
            filteredFaqs.map((item) => {
              const isExpanded = expandedFaqId === item.id;
              return (
                <Card key={item.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqQuestionRow}
                    onPress={() => toggleFaq(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isDoctor ? Colors.secondary[600] : Colors.primary[600]}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqAnswerBox}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}
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
  headerTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  scrollBody: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  supportChannelsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: 10,
    ...Shadows.xs,
  },
  channelsTitle: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  channelsSub: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  channelButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  channelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  channelIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
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
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipPatientActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  tabChipDoctorActive: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  tabChipText: {
    fontSize: 11.5,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  faqSection: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  faqCard: {
    padding: Spacing[3],
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  faqAnswerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  emptyFaq: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyFaqTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  emptyFaqSub: {
    fontSize: 11.5,
    color: Colors.text.disabled,
    textAlign: 'center',
  },
});
