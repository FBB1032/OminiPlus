import React, { useState, useMemo } from 'react';
import { useSkeletonDelay } from '../../hooks/useSkeletonDelay';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';
import { useDoctorList, useAvailableSlots, useBookAppointment } from '../../hooks/usePatient';
import { useToast } from '../../hooks/useAuth';
import { bookAppointmentSchema } from '../../utils/validators';
import {
  Avatar,
  Card,
  HospitalBadge,
  StepIndicator,
  Input,
  Button,
  FormInput,
  FormSelect,
  LoadingOverlay,
  EmptyState,
  ErrorState,
  Divider,
  SkeletonList,
  SkeletonSlots,
} from '../../components';

const STEPS = ['Choose Doctor', 'Select Slot', 'Add Details', 'Payment', 'Confirm'];

export default function BookAppointmentScreen({ route, navigation }: any) {
  const initialDoctorId = route.params?.doctorId;
  const preSelectedDoctor = route.params?.preSelectedDoctor ?? null;

  // If coming from a doctor profile, start directly at step 1 (Select Slot)
  const [currentStep, setCurrentStep] = useState(initialDoctorId ? 1 : 0);

  // Booking states — pre-seed doctor if passed from profile
  const [selectedDoctor, setSelectedDoctor] = useState<any>(preSelectedDoctor);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in_person' | 'video' | 'phone'>('in_person');
  const [reason, setReason] = useState(route.params?.prefilledReason || '');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(route.params?.specialization || null);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  // ── Tiered format pricing ─────────────────────────────────────────────────
  // Pre-seed format & fee from DoctorProfileScreen if the patient already
  // picked a format there; otherwise default to 'chat' (lowest tier).
  const [selectedFormat, setSelectedFormat] = useState<'chat' | 'audio' | 'video'>(
    route.params?.preSelectedDoctor?.selectedFormat ?? 'chat'
  );

  const MIN_CONSULT_FEE = 2000; // ₦2,000 platform floor

  const getActiveFee = (doc: any, fmt: 'chat' | 'audio' | 'video'): number => {
    if (doc?.tiers?.[fmt]) return Math.max(doc.tiers[fmt], MIN_CONSULT_FEE);
    if (doc?.consultFee)   return Math.max(doc.consultFee, MIN_CONSULT_FEE);
    return MIN_CONSULT_FEE;
  };

  const FORMAT_LABELS: Record<'chat' | 'audio' | 'video', string> = {
    chat: 'Chat', audio: 'Audio Call', video: 'Video Call',
  };
  const FORMAT_ICONS: Record<'chat' | 'audio' | 'video', string> = {
    chat: 'chatbubble-outline', audio: 'mic-outline', video: 'videocam-outline',
  };

  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [cvvError, setCvvError] = useState<string | null>(null);
  const [cardholderNameError, setCardholderNameError] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const { success: showToastSuccess, error: showToastError } = useToast();
  const bookMutation = useBookAppointment();

  // Queries
  const { data: doctorsResponse, isLoading: isDoctorsLoading, isError: isDoctorsError, refetch: refetchDoctors } = useDoctorList();

  const doctorIdForQuery = selectedDoctor?.id || initialDoctorId || '';
  const { data: slotsResponse, isLoading: isSlotsLoading, isError: isSlotsError, refetch: refetchSlots } = useAvailableSlots(
    doctorIdForQuery,
    selectedDate
  );

  const showDoctorsSkeleton = useSkeletonDelay(isDoctorsLoading, 150);
  const showSlotsSkeleton = useSkeletonDelay(isSlotsLoading, 150);

  // Fallback: if doctor wasn't passed as object but API loads, match by id
  React.useEffect(() => {
    if (!preSelectedDoctor && doctorsResponse?.data && initialDoctorId) {
      const doc = doctorsResponse.data.find((d) => d.id === initialDoctorId);
      if (doc) {
        setSelectedDoctor(doc);
        setCurrentStep(1);
      }
    }
  }, [doctorsResponse, initialDoctorId, preSelectedDoctor]);

  // Filter doctors locally
  const filteredDoctors = useMemo(() => {
    if (!doctorsResponse?.data) return [];
    return doctorsResponse.data.filter((doc) => {
      const name = `${doc.firstName} ${doc.lastName}`.toLowerCase();
      const spec = (doc.specialization || '').toLowerCase();
      const search = doctorSearch.toLowerCase();
      const matchesSearch = !search || name.includes(search) || spec.includes(search);
      const matchesSpec =
        !selectedSpecialization ||
        spec.includes(selectedSpecialization.toLowerCase()) ||
        selectedSpecialization.toLowerCase().includes(spec);
      return matchesSearch && matchesSpec;
    });
  }, [doctorsResponse, doctorSearch, selectedSpecialization]);

  // Generate next 7 days for the slot selector
  const nextDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const isSunday = nextDate.getDay() === 0;
      if (!isSunday) {
        days.push({
          dateStr: nextDate.toISOString().split('T')[0],
          dayName: nextDate.toLocaleDateString(undefined, { weekday: 'short' }),
          dayNum: nextDate.getDate(),
        });
      }
    }
    return days;
  }, []);

  const selectedDayOfWeek = useMemo(() => {
    if (!selectedDate) return '';
    const date = new Date(selectedDate);
    const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[dayIndex];
  }, [selectedDate]);

  const doctorAvailabilityForDay = useMemo(() => {
    if (!selectedDoctor?.workingHours || !selectedDayOfWeek) return null;
    return selectedDoctor.workingHours.find((h: any) => h.day === selectedDayOfWeek);
  }, [selectedDoctor, selectedDayOfWeek]);

  const formatTime12h = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const handleReasonChange = (text: string) => {
    setReason(text);
    if (reasonError) {
      setReasonError(null);
    }
  };

  const handleReviewBooking = () => {
    setReasonError(null);
    const result = bookAppointmentSchema.safeParse({
      doctorId: selectedDoctor?.id,
      date: selectedDate,
      slot: selectedSlot,
      type: appointmentType,
      reason: reason,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.reason) {
        setReasonError(fieldErrors.reason[0]);
      } else {
        showToastError('Validation Error', 'Please complete all steps correctly.');
      }
      return;
    }

    setCurrentStep(3);
  };

  const handleProcessPayment = () => {
    let hasError = false;
    setCardNumberError(null);
    setExpiryError(null);
    setCvvError(null);
    setCardholderNameError(null);

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (!cleanCard || cleanCard.length < 15 || cleanCard.length > 16 || isNaN(Number(cleanCard))) {
      setCardNumberError('Please enter a valid 15 or 16-digit card number.');
      hasError = true;
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setExpiryError('Use MM/YY format.');
      hasError = true;
    } else {
      const [mm] = expiryDate.split('/');
      const month = parseInt(mm, 10);
      if (month < 1 || month > 12) {
        setExpiryError('Invalid month.');
        hasError = true;
      }
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4 || isNaN(Number(cvv))) {
      setCvvError('Invalid CVV.');
      hasError = true;
    }

    if (!cardholderName || cardholderName.trim().length < 3) {
      setCardholderNameError('Please enter cardholder name.');
      hasError = true;
    }

    if (hasError) return;

    setIsPaymentLoading(true);

    // ── Demo simulation ───────────────────────────────────────────────────
    // Cards ending in an even last digit → success, odd → failure.
    // This lets the team show both flows without a real backend.
    // Replace this block with your actual Paystack charge call when the
    // backend is ready — just navigate to PaymentResult with the real outcome.
    const lastDigit = parseInt(cardNumber.replace(/\s/g, '').slice(-1), 10);
    const simulatedOutcome: 'success' | 'failure' = isNaN(lastDigit) || lastDigit % 2 === 0
      ? 'success'
      : 'failure';

    const fee = getActiveFee(selectedDoctor, selectedFormat);
    const txnRef = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedDate = selectedDate
      ? new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : '—';
    const formattedSlot = selectedSlot
      ? (() => {
          const [h, m] = selectedSlot.split(':');
          const hour = parseInt(h, 10);
          return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
        })()
      : '—';
    const doctorLabel = selectedDoctor?.name
      ?? `Dr. ${selectedDoctor?.firstName ?? ''} ${selectedDoctor?.lastName ?? ''}`.trim();

    setTimeout(() => {
      setIsPaymentLoading(false);

      if (simulatedOutcome === 'success') {
        setIsPaid(true);
      }

      navigation.navigate('PaymentResult', {
        outcome:    simulatedOutcome,
        amount:     `₦${fee.toLocaleString()}`,
        doctorName: doctorLabel,
        format:     FORMAT_LABELS[selectedFormat],
        date:       formattedDate,
        slot:       formattedSlot,
        referenceId: txnRef,
        failureReason: simulatedOutcome === 'failure'
          ? 'Insufficient funds or card limit reached.'
          : undefined,
      });
    }, 1800);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    // Combine date + time
    const [hours, minutes] = selectedSlot.split(':');
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      // The paid consult format must drive the appointment type so the
      // doctor's video-join gate (type === 'video') matches what the patient
      // paid for.
      const paidType =
        selectedFormat === 'video' ? 'video' : selectedFormat === 'audio' ? 'phone' : appointmentType;
      await bookMutation.mutateAsync({
        doctorId: selectedDoctor.id,
        scheduledAt: bookingDateTime.toISOString(),
        duration: 30, // 30 mins
        type: paidType,
        reason,
      });

      showToastSuccess('Booking Confirmed', 'Your appointment has been successfully scheduled.');
      navigation.navigate('PatientTabs', { screen: 'PatientHome' });
    } catch {
      showToastError('Booking Failed', 'Unable to complete booking. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // If we pre-selected a doctor and start from Step 1, go back to step 0
      if (currentStep === 1 && initialDoctorId) {
        navigation.goBack();
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    } else {
      navigation.goBack();
    }
  };

  const renderDoctorItem = React.useCallback(({ item }: { item: any }) => (
    <Card style={styles.doctorCard}>
      <TouchableOpacity onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}>
        <Avatar
          name={`Dr. ${item.lastName}`}
          uri={item.avatarUrl}
          size="md"
        />
      </TouchableOpacity>
      <View style={styles.doctorInfo}>
        <Text style={styles.docName}>Dr. {item.firstName} {item.lastName}</Text>
        <Text style={styles.docSpec}>{item.specialization}</Text>
        <View style={{ marginVertical: 2 }}>
          <HospitalBadge
            hospitalName={item.clinicName || item.hospital}
            isIndependent={!item.clinicName && !item.hospital}
            size="sm"
          />
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewCount} reviews)
          </Text>
        </View>
        <Text style={styles.docFee}>Fee: ₦{item.consultationFee ? (item.consultationFee > 500 ? item.consultationFee.toLocaleString() : (item.consultationFee * 100).toLocaleString()) : '15,000'}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setSelectedDoctor(item);
          setCurrentStep(1);
        }}
        style={styles.selectBtn}
      >
        <Text style={styles.selectBtnText}>Select</Text>
      </TouchableOpacity>
    </Card>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        style={styles.stepIndicator}
      />

      <View style={styles.container}>
        {/* STEP 0: Select Doctor */}
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            <View style={styles.searchWrapper}>
              <Input
                placeholder="Search by specialist or name..."
                value={doctorSearch}
                onChangeText={setDoctorSearch}
                leftIcon="search-outline"
              />
            </View>

            {selectedSpecialization && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#EFF6FF',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  marginHorizontal: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#BFDBFE',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="filter" size={14} color="#2563EB" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1D4ED8' }}>
                    Triage Filter: {selectedSpecialization}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSpecialization(null)}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Show All</Text>
                </TouchableOpacity>
              </View>
            )}

            {showDoctorsSkeleton ? (
              <SkeletonList />
            ) : isDoctorsError ? (
              <ErrorState onRetry={refetchDoctors} message="Failed to load doctors list." />
            ) : filteredDoctors.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No doctors found"
                subtitle="Try adjusting your search criteria."
              />
            ) : (
              <FlashList
                data={filteredDoctors}
                keyExtractor={(item) => item.id}
                renderItem={renderDoctorItem}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
                // @ts-ignore - TS complains but this prop is required by FlashList
                estimatedItemSize={120}
              />
            )}
          </View>
        )}

        {/* STEP 1: Select Date & Time */}
        {currentStep === 1 && selectedDoctor && (
          <View style={styles.stepContainer}>
            <Card style={styles.doctorMiniCard}>
          <TouchableOpacity onPress={() => navigation.navigate('DoctorProfile', { doctorId: selectedDoctor.id })}>
            <Avatar
              name={selectedDoctor.name ?? `${selectedDoctor.firstName ?? ''} ${selectedDoctor.lastName ?? ''}`}
              uri={selectedDoctor.avatarUrl ?? selectedDoctor.avatar}
              size="md"
            />
          </TouchableOpacity>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.docName} numberOfLines={1}>
              {selectedDoctor.name
                ? selectedDoctor.name
                : `Dr. ${selectedDoctor.firstName ?? ''} ${selectedDoctor.lastName ?? ''}`.trim()}
            </Text>
            <Text style={styles.docSpec} numberOfLines={1}>
              {selectedDoctor.spec ?? selectedDoctor.specialization ?? ''}
            </Text>
            {(selectedDoctor.consultFee ?? selectedDoctor.consultationFee) && (
              <Text style={styles.docFeeInline}>
                ₦{((selectedDoctor.consultFee ?? selectedDoctor.consultationFee) as number).toLocaleString()} Consultation Fee
              </Text>
            )}
          </View>
        </Card>

            <Text style={styles.sectionHeading}>Select Date</Text>
            <View style={styles.daysContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                {nextDays.map((day) => {
                  const isSelected = selectedDate === day.dateStr;
                  return (
                    <TouchableOpacity
                      key={day.dateStr}
                      onPress={() => {
                        setSelectedDate(day.dateStr);
                        setSelectedSlot(null);
                      }}
                      style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                    >
                      <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                        {day.dayName}
                      </Text>
                      <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                        {day.dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={styles.sectionHeading}>Available Time Slots</Text>
            {doctorAvailabilityForDay && (
              <View style={[
                styles.availabilityBanner,
                !doctorAvailabilityForDay.isActive && {
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5',
                }
              ]}>
                <Ionicons
                  name={doctorAvailabilityForDay.isActive ? "time-outline" : "calendar-outline"}
                  size={16}
                  color={doctorAvailabilityForDay.isActive ? Colors.primary[600] : Colors.error.main}
                />
                <Text style={[
                  styles.availabilityText,
                  !doctorAvailabilityForDay.isActive && styles.availabilityTextInactive
                ]}>
                  {doctorAvailabilityForDay.isActive
                    ? `Doctor's working hours: ${formatTime12h(doctorAvailabilityForDay.startTime)} - ${formatTime12h(doctorAvailabilityForDay.endTime)} (${doctorAvailabilityForDay.slotDuration || 30}m slots)`
                    : "Doctor is not scheduled for consultations on this day."}
                </Text>
              </View>
            )}
            {showSlotsSkeleton ? (
              <SkeletonSlots />
            ) : isSlotsError ? (
              <Text style={styles.errorText}>Could not load available hours.</Text>
            ) : !slotsResponse || slotsResponse.length === 0 || slotsResponse[0].slots.length === 0 ? (
              <View style={styles.centeredSlot}>
                <Text style={styles.noSlotsText}>No slots available for this day.</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.slotsGrid} showsVerticalScrollIndicator={false}>
                {slotsResponse[0].slots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSelectedSlot(slot)}
                      style={[styles.slotItem, isSelected && styles.slotItemSelected]}
                    >
                      <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.footerBtns}>
              <Button
                label="Next Step"
                disabled={!selectedSlot}
                onPress={() => setCurrentStep(2)}
              />
            </View>
          </View>
        )}

        {/* STEP 2: Visit Details */}
        {currentStep === 2 && (
          <ScrollView contentContainerStyle={styles.detailsForm} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionHeading}>Consultation Type</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: -Spacing[2], marginBottom: Spacing[3] }}>
              Choose how you'd like to connect with the doctor. Fee shown per session.
            </Text>
            <View style={styles.consultTypeGrid}>
              {([
                { fmt: 'chat'  as const, type: 'phone'     as const, icon: 'chatbubble-outline', label: 'Chat',       desc: 'Text messages' },
                { fmt: 'audio' as const, type: 'phone'     as const, icon: 'mic-outline',        label: 'Audio Call', desc: 'Voice call'    },
                { fmt: 'video' as const, type: 'video'     as const, icon: 'videocam-outline',   label: 'Video Call', desc: 'Face-to-face'  },
                { fmt: 'chat'  as const, type: 'in_person' as const, icon: 'business-outline',   label: 'In Person',  desc: 'Clinic visit'  },
              ]).map((opt) => {
                const isInPerson = opt.type === 'in_person';
                const fee = isInPerson ? null : getActiveFee(selectedDoctor, opt.fmt);
                const active = selectedFormat === opt.fmt && appointmentType === opt.type;
                return (
                  <TouchableOpacity
                    key={`${opt.fmt}-${opt.type}`}
                    onPress={() => {
                      setSelectedFormat(opt.fmt);
                      setAppointmentType(opt.type);
                    }}
                    style={[styles.consultTypeCard, active && styles.consultTypeCardActive]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.consultTypeIcon, active && styles.consultTypeIconActive]}>
                      <Ionicons
                        name={opt.icon as any}
                        size={22}
                        color={active ? '#FFFFFF' : Colors.neutral[500]}
                      />
                    </View>
                    <Text style={[styles.consultTypeLabel, active && styles.consultTypeLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.consultTypeDesc}>{opt.desc}</Text>
                    {fee !== null ? (
                      <Text style={[styles.consultTypeFee, active && styles.consultTypeFeeActive]}>
                        ₦{fee.toLocaleString()}
                      </Text>
                    ) : (
                      <Text style={[styles.consultTypeFee, { color: '#94A3B8' }]}>At clinic</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionHeading}>Reason for Visit</Text>
            <Input
              label="Reason for Visit"
              hint="Describe your symptoms, follow-up needs, or questions"
              value={reason}
              onChangeText={handleReasonChange}
              multiline
              numberOfLines={4}
              containerStyle={styles.visitInput}
              error={reasonError || undefined}
            />

            <View style={styles.footerBtns}>
              <Button
                label="Review Booking"
                onPress={handleReviewBooking}
              />
            </View>
          </ScrollView>
        )}

        {/* STEP 3: Payment */}
        {currentStep === 3 && selectedDoctor && (
          <ScrollView contentContainerStyle={styles.detailsForm} keyboardShouldPersistTaps="handled">
            <Card style={styles.doctorMiniCard}>
              <TouchableOpacity onPress={() => navigation.navigate('DoctorProfile', { doctorId: selectedDoctor.id })}>
                <Avatar
                  name={`Dr. ${selectedDoctor.lastName}`}
                  uri={selectedDoctor.avatarUrl}
                  size="sm"
                />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</Text>
                <Text style={styles.docSpec}>{selectedDoctor.specialization}</Text>
                <View style={{ marginTop: 2 }}>
                  <HospitalBadge
                    hospitalName={selectedDoctor.clinicName || selectedDoctor.hospital}
                    isIndependent={!selectedDoctor.clinicName && !selectedDoctor.hospital}
                    size="sm"
                  />
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: FontSize.xs, color: Colors.text.secondary }}>
                  {FORMAT_LABELS[selectedFormat]} Fee
                </Text>
                <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.secondary[600] }}>
                  ₦{getActiveFee(selectedDoctor, selectedFormat).toLocaleString()}
                </Text>
              </View>
            </Card>

            {/* Escrow Banner */}
            <View style={{
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
              borderRadius: 12,
              padding: Spacing[3],
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: Spacing[3],
            }}>
              <Ionicons name="shield-checkmark" size={20} color="#2563EB" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1E40AF' }}>
                  OminiPulse Escrow Protection Active
                </Text>
                <Text style={{ fontSize: 11, color: '#1D4ED8', lineHeight: 16, marginTop: 2 }}>
                  Your payment is held securely in escrow. Funds are released to Dr. {selectedDoctor.lastName} only after they formally confirm your booking. Free cancellation applies until approval.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Payment Method</Text>
            <View style={styles.paymentMethodCard}>
              <Ionicons name="card-outline" size={24} color={Colors.secondary[600]} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.primary }}>
                  Credit or Debit Card
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.text.secondary }}>
                  Safe & Secure checkout powered by Paystack & Escrow Shield
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary[600]} />
            </View>

            <View style={{ gap: Spacing[4], marginTop: Spacing[4] }}>
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={(text) => {
                  setCardholderName(text);
                  if (cardholderNameError) setCardholderNameError(null);
                }}
                leftIcon="person-outline"
                error={cardholderNameError || undefined}
              />

              <Input
                label="Card Number"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChangeText={(text) => {
                  const formatted = text.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                  setCardNumber(formatted);
                  if (cardNumberError) setCardNumberError(null);
                }}
                maxLength={19}
                keyboardType="numeric"
                leftIcon="card-outline"
                error={cardNumberError || undefined}
              />

              <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => {
                      const formatted = text.replace(/\//g, '');
                      if (formatted.length >= 2) {
                        setExpiryDate(`${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`);
                      } else {
                        setExpiryDate(formatted);
                      }
                      if (expiryError) setExpiryError(null);
                    }}
                    maxLength={5}
                    keyboardType="numeric"
                    leftIcon="calendar-outline"
                    error={expiryError || undefined}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="CVV"
                    placeholder="123"
                    value={cvv}
                    onChangeText={(text) => {
                      setCvv(text);
                      if (cvvError) setCvvError(null);
                    }}
                    maxLength={4}
                    keyboardType="numeric"
                    leftIcon="lock-closed-outline"
                    error={cvvError || undefined}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.footerBtns}>
              <Button
                label={`Pay ₦${getActiveFee(selectedDoctor, selectedFormat).toLocaleString()} & Continue`}
                onPress={handleProcessPayment}
                isLoading={isPaymentLoading}
              />
            </View>
          </ScrollView>
        )}

        {/* STEP 4: Confirm Booking */}
        {currentStep === 4 && selectedDoctor && selectedSlot && (
          <View style={styles.stepContainer}>
            <ScrollView contentContainerStyle={styles.confirmScroll}>
              <Card style={styles.confirmCard}>
                <Text style={styles.confirmCardHeader}>Appointment Summary</Text>
                
                <View style={styles.confirmItem}>
                  <Text style={styles.confirmLabel}>Doctor</Text>
                  <View style={styles.confirmDocRow}>
                    <TouchableOpacity onPress={() => navigation.navigate('DoctorProfile', { doctorId: selectedDoctor.id })}>
                      <Avatar
                        name={`Dr. ${selectedDoctor.lastName}`}
                        uri={selectedDoctor.avatarUrl}
                        size="sm"
                      />
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.confirmValue}>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</Text>
                      <Text style={styles.confirmSubValue}>{selectedDoctor.specialization}</Text>
                    </View>
                  </View>
                </View>

                <Divider spacing={3} />

                <View style={styles.confirmItem}>
                  <Text style={styles.confirmLabel}>Date & Time</Text>
                  <Text style={styles.confirmValue}>
                    {new Date(selectedDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.confirmSubValue}>Time Slot: {selectedSlot} (30 mins)</Text>
                </View>

                <Divider spacing={3} />

                <View style={styles.confirmItem}>
                  <Text style={styles.confirmLabel}>Consultation Type</Text>
                  <Text style={styles.confirmValue}>
                    {appointmentType === 'in_person'
                      ? 'In Person Visit'
                      : FORMAT_LABELS[selectedFormat]}
                  </Text>
                </View>

                <Divider spacing={3} />

                <View style={styles.confirmItem}>
                  <Text style={styles.confirmLabel}>Reason for Visit</Text>
                  <Text style={styles.confirmValue}>{reason}</Text>
                </View>

                <Divider spacing={3} />

                <View style={styles.confirmItem}>
                  <Text style={styles.confirmLabel}>Consultation Fee</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.confirmValue, styles.feeValue]}>
                      ₦{getActiveFee(selectedDoctor, selectedFormat).toLocaleString()}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 }}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#059669' }}>PAID</Text>
                    </View>
                  </View>
                </View>
              </Card>

              <Card style={[styles.confirmCard, styles.consentCard]}>
                <TouchableOpacity
                  style={styles.consentCheckboxRow}
                  onPress={() => setConsentChecked(!consentChecked)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.consentCheckbox, consentChecked && styles.consentCheckboxChecked]}>
                    {consentChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.consentText}>
                    I consent to receive virtual medical care, agree to Omini Pulse's{' '}
                    <Text style={styles.consentHighlight}>Telehealth Agreement</Text>, and acknowledge that virtual consultations are not for emergencies.
                  </Text>
                </TouchableOpacity>
              </Card>
            </ScrollView>

            <View style={styles.footerBtns}>
              <Button
                label="Confirm & Book Appointment"
                onPress={handleBookAppointment}
                isLoading={bookMutation.isPending}
                disabled={!consentChecked || !isPaid}
              />
            </View>
          </View>
        )}
      </View>

      <LoadingOverlay visible={bookMutation.isPending} message="Booking appointment..." />
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: Spacing[1],
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 24,
  },
  stepIndicator: {
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: Spacing[4],
  },
  searchWrapper: {
    marginBottom: Spacing[4],
  },
  listContainer: {
    paddingBottom: Spacing[4],
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  doctorInfo: {
    flex: 1,
    gap: 2,
  },
  docName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  docSpec: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  docFee: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginTop: 2,
  },
  selectBtn: {
    backgroundColor: Colors.secondary[600],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 8,
  },
  selectBtnText: {
    color: Colors.text.inverse,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  separator: {
    height: Spacing[3],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  docFeeInline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.secondary[600],
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  daysContainer: {
    marginBottom: Spacing[5],
  },
  daysScroll: {
    gap: Spacing[2],
  },
  dayCard: {
    width: 60,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...Shadows.xs,
  },
  dayCardSelected: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  dayName: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: Colors.secondary[100],
  },
  dayNum: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  dayNumSelected: {
    color: Colors.text.inverse,
  },
  centeredSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  noSlotsText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error.main,
    textAlign: 'center',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    paddingBottom: Spacing[8],
  },
  slotItem: {
    width: '30%',
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xs,
  },
  slotItemSelected: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  slotText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  slotTextSelected: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  footerBtns: {
    paddingVertical: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    marginTop: 'auto',
  },
  detailsForm: {
    padding: Spacing[4],
    flexGrow: 1,
    paddingBottom: 320, // generous space so keyboard never covers the input or the CTA button
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  typeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    gap: Spacing[2],
    ...Shadows.xs,
  },
  typeCardSelected: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
  },
  typeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  typeLabelSelected: {
    color: Colors.secondary[600],
    fontWeight: FontWeight.bold,
  },
  // ── Unified Consultation Type grid ────────────────────────────────────────
  consultTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  consultTypeCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    gap: 4,
    ...Shadows.xs,
  },
  consultTypeCardActive: {
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
  },
  consultTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  consultTypeIconActive: {
    backgroundColor: Colors.secondary[600],
  },
  consultTypeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  consultTypeLabelActive: {
    color: Colors.secondary[600],
  },
  consultTypeDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  consultTypeFee: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
    marginTop: 2,
  },
  consultTypeFeeActive: {
    color: Colors.secondary[700] ?? Colors.secondary[600],
  },
  visitInput: {
    height: 120,
    textAlignVertical: 'top',
    marginBottom: Spacing[3],
  },
  confirmScroll: {
    paddingBottom: Spacing[4],
  },
  confirmCard: {
    padding: Spacing[5],
    gap: Spacing[3],
  },
  confirmCardHeader: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  confirmItem: {
    gap: 4,
  },
  confirmLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  confirmValue: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    fontWeight: FontWeight.semiBold,
  },
  confirmSubValue: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  confirmDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: 2,
  },
  feeValue: {
    fontSize: FontSize.md,
    color: Colors.secondary[600],
    fontWeight: FontWeight.bold,
  },
  consentCard: {
    marginTop: Spacing[4],
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  consentCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  consentCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  consentCheckboxChecked: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  consentText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  consentHighlight: {
    color: Colors.secondary[600],
    fontWeight: FontWeight.bold,
  },
  availabilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    paddingHorizontal: Spacing[3],
    paddingVertical: 10,
    gap: Spacing[2],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.primary[100] || '#BFDBFE',
  },
  availabilityText: {
    fontSize: FontSize.xs,
    color: Colors.primary[700],
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  availabilityTextInactive: {
    color: Colors.error.main,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderWidth: 1.5,
    borderColor: Colors.secondary[600],
    backgroundColor: Colors.secondary[50],
    borderRadius: 16,
    gap: Spacing[3],
    marginVertical: Spacing[2],
  },
});
