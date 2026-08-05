import React, { useEffect, useMemo, useCallback } from 'react';
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
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescriptionSchema, PrescriptionFormValues } from '../../utils/validators';
import { useCreatePrescription, usePrescriptionById, usePatientDetail, usePatientPrescriptions } from '../../hooks/useDoctor';
import { useToast, useAuth } from '../../hooks/useAuth';
import { Button, FormInput, DatePicker, Card, Divider, SkeletonDetail, AccessDenied } from '../../components';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function PrescriptionScreen({ route, navigation }: any) {
  const { role, user } = useAuth();
  const { appointmentId, patientId, mode, prescriptionId } = route.params;

  if (role !== 'doctor' && role !== 'admin') {
    return <AccessDenied onBack={() => navigation.goBack()} message="Only clinical doctors and system administrators are permitted to issue or view prescriptions." />;
  }

  if (role === 'doctor' && user?.isApproved === false) {
    return <AccessDenied onBack={() => navigation.goBack()} message="Verification Required: Your practitioner credentials must be verified before you can issue prescriptions." />;
  }

  const isCreate = mode === 'create';
  const { success: showToastSuccess, error: showToastError } = useToast();

  const createPrescriptionMutation = useCreatePrescription();
  const { data: prescription, isLoading: isViewLoading, isError: isViewError } = usePrescriptionById(prescriptionId || '');
  const showPrescriptionSkeleton = useSkeletonDelay(isViewLoading, 150);
  const viewPrescription = prescription;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      instructions: '',
      followUpDate: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const { data: patient } = usePatientDetail(patientId);
  const { data: activePrescriptions } = usePatientPrescriptions(patientId);

  const medicationsWatch = useWatch({
    control,
    name: 'medications',
  });

  const safetyWarnings = useMemo<string[]>(() => {
    if (!isCreate || !patient || !medicationsWatch) return [];

    const warnings: string[] = [];
    const patientAllergies: string[] = patient.allergies || [];

    // Drug list from active prescriptions for drug-drug interaction checks
    const activeDrugs: string[] = (activePrescriptions || []).flatMap(
      (ap: { medications?: { name: string }[] }) =>
        (ap.medications || []).map((m) => m.name.toLowerCase().trim())
    );

    medicationsWatch.forEach((med: { name?: string }) => {
      if (!med?.name) return;
      const medNameLower = med.name.toLowerCase().trim();

      // 1. Allergy Check
      patientAllergies.forEach((allergy) => {
        const allergyLower = allergy.toLowerCase().trim();
        if (medNameLower.includes(allergyLower) || allergyLower.includes(medNameLower)) {
          warnings.push(
            `ALLERGY ALERT: Patient is allergic to "${allergy}". Prescribing "${med.name}" may cause severe reactions.`
          );
        }
        if (allergyLower === 'penicillin' && medNameLower.includes('amoxicillin')) {
          warnings.push(
            'CROSS-SENSITIVITY: Patient is allergic to Penicillin. "Amoxicillin" is a beta-lactam and could cause cross-allergic reaction.'
          );
        }
      });

      // 2. Drug-Drug Interaction Check
      activeDrugs.forEach((activeDrug) => {
        if (
          (medNameLower.includes('clarithromycin') && activeDrug.includes('atorvastatin')) ||
          (medNameLower.includes('atorvastatin') && activeDrug.includes('clarithromycin'))
        ) {
          warnings.push(
            'DRUG INTERACTION: Co-administration of Clarithromycin and Atorvastatin increases risk of severe myopathy/rhabdomyolysis.'
          );
        }
        if (
          (medNameLower.includes('ibuprofen') && activeDrug.includes('aspirin')) ||
          (medNameLower.includes('aspirin') && activeDrug.includes('ibuprofen'))
        ) {
          warnings.push(
            'CLINICAL INTERACTION: NSAID interaction detected. Combining Ibuprofen and Aspirin increases risk of gastrointestinal bleeding.'
          );
        }
      });
    });

    return warnings;
  }, [isCreate, patient, medicationsWatch, activePrescriptions]);

  const onSubmit = useCallback(async (data: PrescriptionFormValues) => {
    try {
      await createPrescriptionMutation.mutateAsync({
        appointmentId,
        patientId,
        diagnosis: data.diagnosis,
        medications: data.medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions || '',
        })),
        instructions: data.instructions,
        followUpDate: data.followUpDate,
      });

      showToastSuccess('Success', 'Prescription has been created successfully.');
      navigation.goBack();
    } catch {
      showToastError('Error', 'Failed to create prescription.');
    }
  }, [appointmentId, patientId, createPrescriptionMutation, navigation, showToastSuccess, showToastError]);

  if (!isCreate && showPrescriptionSkeleton) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Prescription...</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkeletonDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!isCreate && (isViewError || !viewPrescription)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.errorText}>Could not load prescription.</Text>
      </SafeAreaView>
    );
  }

  if (!isCreate && !viewPrescription) {
    return null;
  }

  const viewPresc = viewPrescription!;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isCreate ? 'New Prescription' : 'View Prescription'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isCreate && safetyWarnings.length > 0 && (
            <View style={styles.warningContainer}>
              {safetyWarnings.map((warning, idx) => (
                <View key={idx} style={styles.warningRow}>
                  <Ionicons name="alert-circle-outline" size={16} color="#DC2626" style={{ marginTop: 1 }} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {isCreate ? (
            <View style={styles.formContainer}>
              <FormInput
                control={control}
                name="diagnosis"
                label="Diagnosis"
                placeholder="Enter patient diagnosis (e.g. Acute Bronchitis)"
                error={errors.diagnosis}
              />

              {/* Medications Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Medications</Text>
                <TouchableOpacity
                  onPress={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                  style={styles.addMedBtn}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary[600]} />
                  <Text style={styles.addMedBtnText}>Add Medication</Text>
                </TouchableOpacity>
              </View>

              {errors.medications?.root && (
                <Text style={styles.errorMsg}>{errors.medications.root.message}</Text>
              )}

              {fields.map((field, index) => (
                <Card key={field.id} style={styles.medCard}>
                  <View style={styles.medCardHeader}>
                    <Text style={styles.medNumber}>Medication #{index + 1}</Text>
                    {fields.length > 1 && (
                      <TouchableOpacity onPress={() => remove(index)} style={styles.deleteMedBtn}>
                        <Ionicons name="trash-outline" size={20} color={Colors.error.main} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <FormInput
                    control={control}
                    name={`medications.${index}.name` as const}
                    label="Medication Name"
                    placeholder="e.g. Amoxicillin"
                    error={errors.medications?.[index]?.name}
                  />

                  <View style={styles.row}>
                    <View style={styles.flex1}>
                      <FormInput
                        control={control}
                        name={`medications.${index}.dosage` as const}
                        label="Dosage"
                        placeholder="e.g. 500mg"
                        error={errors.medications?.[index]?.dosage}
                      />
                    </View>
                    <View style={styles.flex1}>
                      <FormInput
                        control={control}
                        name={`medications.${index}.frequency` as const}
                        label="Frequency"
                        placeholder="e.g. Twice daily"
                        error={errors.medications?.[index]?.frequency}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.flex1}>
                      <FormInput
                        control={control}
                        name={`medications.${index}.duration` as const}
                        label="Duration"
                        placeholder="e.g. 7 days"
                        error={errors.medications?.[index]?.duration}
                      />
                    </View>
                    <View style={styles.flex1}>
                      <FormInput
                        control={control}
                        name={`medications.${index}.instructions` as const}
                        label="Special Instructions (Opt)"
                        placeholder="e.g. Take after food"
                        error={errors.medications?.[index]?.instructions}
                      />
                    </View>
                  </View>
                </Card>
              ))}

              <Divider spacing={3} />

              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.text.primary }}>
                  SOAP Clinical Consultation Notes
                </Text>

                <FormInput
                  control={control}
                  name="instructions"
                  label="Subjective & Objective Notes"
                  placeholder="Patient chief complaint, history, temperature, BP, exam findings"
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                  error={errors.instructions}
                />

                <DatePicker
                  control={control}
                  name="followUpDate"
                  label="Follow-up Date"
                  placeholder="Select date (optional)"
                  minimumDate={new Date()}
                  error={errors.followUpDate}
                />
              </View>

              <Button
                label="Save & Issue Prescription"
                onPress={handleSubmit(onSubmit)}
                isLoading={createPrescriptionMutation.isPending}
                style={styles.submitBtn}
              />
            </View>
          ) : (
            /* Read-Only View mode */
            <View style={styles.viewContainer}>
              <Card style={styles.summaryCard}>
                <View style={styles.summarySection}>
                  <Text style={styles.summaryLabel}>Diagnosis</Text>
                  <Text style={styles.summaryValue}>{viewPresc.diagnosis}</Text>
                </View>

                <Divider spacing={4} />

                <Text style={styles.summaryHeaderTitle}>Prescribed Medications</Text>
                {viewPresc.medications.map((med: any, index: number) => (
                  <View key={index} style={styles.viewMedRow}>
                    <View style={styles.viewMedLeft}>
                      <View style={styles.numberCircle}>
                        <Text style={styles.numberCircleText}>{index + 1}</Text>
                      </View>
                      <View style={styles.medDetails}>
                        <Text style={styles.viewMedName}>{med.name}</Text>
                        <Text style={styles.viewMedSpecs}>
                          {med.dosage} • {med.frequency} • {med.duration}
                        </Text>
                        {med.instructions ? (
                          <Text style={styles.viewMedInst}>Note: {med.instructions}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}

                {viewPresc.instructions ? (
                  <>
                    <Divider spacing={4} />
                    <View style={styles.summarySection}>
                      <Text style={styles.summaryLabel}>General Instructions</Text>
                      <Text style={styles.summaryValue}>{viewPresc.instructions}</Text>
                    </View>
                  </>
                ) : null}

                {viewPresc.followUpDate ? (
                  <>
                    <Divider spacing={4} />
                    <View style={styles.summarySection}>
                      <Text style={styles.summaryLabel}>Follow-up Date</Text>
                      <Text style={styles.summaryValue}>
                        {new Date(viewPresc.followUpDate).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </>
                ) : null}

                <Divider spacing={4} />

                <View style={styles.signatureSection}>
                  <Text style={styles.issuedBy}>Issued By:</Text>
                  <Text style={styles.docSign}>
                    Dr. {viewPresc.doctor?.firstName || ''} {viewPresc.doctor?.lastName || ''}
                  </Text>
                  <Text style={styles.issuedDate}>
                    Date: {new Date(viewPresc.issuedAt).toLocaleDateString()}
                  </Text>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  scrollContent: {
    padding: Spacing[4],
    flexGrow: 1,
  },
  formContainer: {
    gap: Spacing[4],
    paddingBottom: Spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  addMedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  addMedBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  medCard: {
    padding: Spacing[4],
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medNumber: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  deleteMedBtn: {
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  flex1: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: Spacing[4],
  },
  viewContainer: {
    paddingBottom: Spacing[8],
  },
  summaryCard: {
    padding: Spacing[5],
  },
  summarySection: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: FontSize.base,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  summaryHeaderTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[3],
  },
  viewMedRow: {
    flexDirection: 'row',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewMedLeft: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  numberCircleText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  medDetails: {
    gap: 2,
    flex: 1,
  },
  viewMedName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  viewMedSpecs: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  viewMedInst: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
  signatureSection: {
    alignItems: 'flex-end',
    marginTop: Spacing[4],
    gap: 2,
  },
  issuedBy: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  docSign: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  issuedDate: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
  },
  errorText: {
    fontSize: FontSize.base,
    color: Colors.error.main,
    textAlign: 'center',
    marginTop: Spacing[8],
  },
  errorMsg: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    gap: Spacing[2],
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningText: {
    fontSize: FontSize.xs,
    color: '#991B1B',
    fontWeight: FontWeight.medium,
    flex: 1,
    lineHeight: 16,
  },
});
