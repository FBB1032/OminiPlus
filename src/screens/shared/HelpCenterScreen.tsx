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
      'Browse verified specialists by department or availability, select a convenient time slot, and conduct secure HD video, audio, or chat consultations directly inside the app.',
  },
  {
    id: 'p-faq-2',
    category: 'pharmacy',
    role: 'patient',
    question: 'How do I receive and fulfill my Electronic Prescriptions (E-Prescriptions)?',
    answer:
      'After your consultation, your doctor issues a digitally signed e-prescription to your Medical Records. You can use our GPS Pharmacy Radar to locate nearby open pharmacies or request doorstep delivery.',
  },
  {
    id: 'p-faq-3',
    category: 'billing',
    role: 'patient',
    question: 'What is the appointment cancellation and refund policy?',
    answer:
      'You can cancel any scheduled appointment up to 2 hours prior to the start time for a 100% full refund to your payment account. Cancellations within 2 hours are subject to a 50% late fee.',
  },
  {
    id: 'p-faq-4',
    category: 'privacy',
    role: 'patient',
    question: 'How is my Electronic Health Record (EHR) kept private?',
    answer:
      'All patient medical histories, lab results, and consultation notes are encrypted with 256-bit AES encryption in strict accordance with Nigerian Data Protection Regulation (NDPR) and HIPAA standards. We never sell or share patient health data.',
  },
  {
    id: 'p-faq-5',
    category: 'booking',
    role: 'patient',
    question: 'What should I do in case of a medical emergency?',
    answer:
      'OminiPulse is designed for non-emergency medical consultations. In case of life-threatening emergencies (severe chest pain, acute respiratory distress, severe hemorrhage), call national emergency hotlines (112 / 767) or navigate to the nearest hospital emergency room immediately using our GPS Hospital Navigator.',
  },
  {
    id: 'p-faq-6',
    category: 'billing',
    role: 'patient',
    question: 'What are the legal consequences of providing false medical information or prescription fraud?',
    answer:
      'Providing false health details, lying to doctors, attempting prescription fraud, or making fraudulent malicious reports is strictly illegal. Offenders will face immediate account termination and may be fined, sued for civil damages, or arrested and prosecuted under Nigerian law.',
  },
];

const DOCTOR_FAQS: FAQItem[] = [
  {
    id: 'd-faq-1',
    category: 'payouts',
    role: 'doctor',
    question: 'How does the 10% platform service fee and payout work for doctors?',
    answer:
      'OminiPulse retains a flat 10% platform service fee on completed consultation fees to cover HD video streaming, EHR cloud hosting, payment processing, and 24/7 technical support. The remaining 90% net earnings are disbursed directly into your verified bank payout account.',
  },
  {
    id: 'd-faq-2',
    category: 'verification',
    role: 'doctor',
    question: 'What credentials are required for doctor verification?',
    answer:
      'Practitioners must upload a valid Government ID (National ID/Passport), Medical License Number issued by the Medical and Dental Council of Nigeria (MDCN), and specialty certificates. Compliance Officers verify all credentials prior to account activation.',
  },
  {
    id: 'd-faq-3',
    category: 'schedule',
    role: 'doctor',
    question: 'How do I set and manage my consultation availability?',
    answer:
      'You can set your weekly consultation time slots, video vs chat consultation fees, and emergency availability toggles inside the Doctor Availability screen under your Profile.',
  },
  {
    id: 'd-faq-4',
    category: 'clinical',
    role: 'doctor',
    question: 'What are the guidelines for issuing E-Prescriptions?',
    answer:
      'E-prescriptions issued via OminiPulse are digitally signed and verifiable by partner pharmacies. Controlled Schedule II narcotics or habit-forming medications cannot be prescribed via remote telemedicine.',
  },
  {
    id: 'd-faq-5',
    category: 'clinical',
    role: 'doctor',
    question: 'What is my clinical liability during virtual consultations?',
    answer:
      'Medical Practitioners act as independent licensed professionals and retain full clinical discretion and liability for diagnoses, advice, and treatment recommendations provided during consultations.',
  },
  {
    id: 'd-faq-6',
    category: 'clinical',
    role: 'doctor',
    question: 'What happens if a doctor is reported for unprofessional conduct or medical malpractice?',
    answer:
      'OminiPulse Compliance Officers launch an immediate internal investigation upon receiving evidence of unprofessional conduct or malpractice. If found guilty, the doctor faces account suspension or a permanent ban. Serious medical offenses are reported to the Medical and Dental Council of Nigeria (MDCN), which may result in medical license revocation, arrest, and criminal prosecution.',
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
