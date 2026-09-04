import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues, isPasswordStrong } from '../../../utils/validators';
import { authService } from '../../../services/authService';
import { authApi } from '../../../api/auth';
import { Button, FormInput, FormSelect, LoadingOverlay, DocumentUploadPicker, DatePicker, PasswordInput, SocialLoginButtons } from '../../../components';
import { RoleLegalModal } from '../../../components/legal/RoleLegalModal';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';

const medicalTeamIllustration = require('../../../../assets/images/medical_team.jpg');
const { width } = Dimensions.get('window');

const SPECIALTIES = [
  { label: 'General Medicine', value: 'General Medicine' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Pediatrics', value: 'Pediatrics' },
  { label: 'Dermatology', value: 'Dermatology' },
  { label: 'Psychiatry', value: 'Psychiatry' },
  { label: 'Gynecology', value: 'Gynecology' },
  { label: 'Orthopedics', value: 'Orthopedics' },
  { label: 'Neurology', value: 'Neurology' },
];

export default function RegisterScreen({ navigation, route }: AuthScreenProps<'Register'>) {
  const [loading, setLoading] = useState(false);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const selectedRole = route.params?.role ?? 'patient';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: selectedRole,
      password: '',
      confirmPassword: '',
      licenseNo: '',
      specialty: '',
      hospital: '',
      yearsExp: '',
      govIdFile: null,
      licenseFile: null,
      selfieFile: null,
      agreeToTerms: false,
      height: '',
      weight: '',
      bloodGroup: '',
      genotype: '',
      dateOfBirth: '',
    },
  });

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  const pwWatch = watch('password');
  const pwIsStrong = isPasswordStrong(pwWatch);

  const onFormError = (formErrors: any) => {
    const firstKey = Object.keys(formErrors)[0];
    if (firstKey) {
      const msg = formErrors[firstKey]?.message || 'Please fill out all required fields correctly.';
      showToastError('Validation Error', msg);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await authService.register({
        ...data,
        role: selectedRole,
      });
      if (selectedRole === 'doctor') {
        showToastSuccess('Registration Submitted', 'Clinical registration submitted. Account is pending verification.');
      } else {
        showToastSuccess('Registration Successful!', 'Your account has been created.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to register. Please try again.';
      showToastError('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F6E6E" translucent={Platform.OS === 'android'} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Unified card — illustration joined with form */}
            <View style={styles.formCard}>
              {/* Illustration Header */}
              <View style={styles.illustrationHeader}>
                {/* Back button overlaid on the header */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.75}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.roleBadge}>
                  <Ionicons
                    name={selectedRole === 'doctor' ? 'medkit' : 'person'}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.roleBadgeText}>
                    {selectedRole === 'doctor' ? 'Doctor Account' : 'Patient Account'}
                  </Text>
                </View>

                <Image
                  source={medicalTeamIllustration}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>
                  {selectedRole === 'doctor' ? 'Doctor Registration' : 'Create Account'}
                </Text>
                <Text style={styles.subtitle}>
                  {selectedRole === 'doctor'
                    ? 'Complete clinical credentials for verification'
                    : 'Join Omini Pulse to manage your wellness journey'}
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.nameRow}>
                  <View style={styles.flex1}>
                <FormInput
                  control={control}
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.flex1}>
                <FormInput
                  control={control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName}
                />
              </View>
            </View>

            <FormInput
              control={control}
              name="email"
              label="Email Address"
              placeholder="john.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <FormInput
              control={control}
              name="phone"
              label="Phone Number"
              placeholder="e.g. +1234567890"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />

            {/* Doctor Credentials Fields */}
            {selectedRole === 'doctor' && (
              <View style={styles.doctorFieldsContainer}>
                <Text style={styles.doctorSectionTitle}>Medical Practitioner Credentials</Text>
                
                <FormInput
                  control={control}
                  name="licenseNo"
                  label="Medical License Number"
                  placeholder="e.g. LIC-98347102"
                  error={errors.licenseNo}
                />

                <FormSelect
                  control={control}
                  name="specialty"
                  label="Medical Specialty"
                  placeholder="Select specialty"
                  options={SPECIALTIES}
                  error={errors.specialty}
                  leftIcon="medical-outline"
                />

                <FormInput
                  control={control}
                  name="yearsExp"
                  label="Years of Experience"
                  placeholder="e.g. 8"
                  keyboardType="numeric"
                  error={errors.yearsExp}
                />

                <FormInput
                  control={control}
                  name="hospital"
                  label="Hospital/Clinic Affiliation"
                  placeholder="e.g. Mercy General Hospital"
                  error={errors.hospital}
                />

                {/* Government ID Document Upload */}
                <View style={styles.uploadSpacing}>
                  <Controller
                    control={control}
                    name="govIdFile"
                    render={({ field: { value, onChange } }) => (
                      <DocumentUploadPicker
                        label="Government ID Document"
                        placeholder="Upload or Snap National ID / Passport"
                        currentFile={value}
                        onDocumentSelected={(file) => {
                          onChange(file.name ? file : null);
                        }}
                        onError={(error) => showToastError('Upload Failed', error)}
                        acceptedFormats={['image/jpeg', 'image/png']}
                      />
                    )}
                  />
                  {errors.govIdFile && (
                    <Text style={styles.fieldErrorText}>{errors.govIdFile.message as string}</Text>
                  )}
                </View>

                {/* Medical License Document Upload */}
                <View style={styles.uploadSpacing}>
                  <Controller
                    control={control}
                    name="licenseFile"
                    render={({ field: { value, onChange } }) => (
                      <DocumentUploadPicker
                        label="Medical License Document"
                        placeholder="Upload or Snap Medical License"
                        currentFile={value}
                        onDocumentSelected={(file) => {
                          onChange(file.name ? file : null);
                        }}
                        onError={(error) => showToastError('Upload Failed', error)}
                        acceptedFormats={['application/pdf', 'image/jpeg', 'image/png']}
                      />
                    )}
                  />
                  {errors.licenseFile && (
                    <Text style={styles.fieldErrorText}>{errors.licenseFile.message as string}</Text>
                  )}
                </View>

                {/* Selfie / Profile Photo Upload */}
                <View style={styles.uploadSpacing}>
                  <Controller
                    control={control}
                    name="selfieFile"
                    render={({ field: { value, onChange } }) => (
                      <DocumentUploadPicker
                        label="Selfie / Profile Photo"
                        placeholder="Take Selfie or Upload Profile Photo"
                        currentFile={value}
                        onDocumentSelected={(file) => {
                          onChange(file.name ? file : null);
                        }}
                        onError={(error) => showToastError('Upload Failed', error)}
                        acceptedFormats={['image/jpeg', 'image/png']}
                      />
                    )}
                  />
                  {errors.selfieFile && (
                    <Text style={styles.fieldErrorText}>{errors.selfieFile.message as string}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Patient Physical & Health Details */}
            {selectedRole === 'patient' && (
              <View style={styles.doctorFieldsContainer}>
                <Text style={styles.doctorSectionTitle}>Physical & Health Details</Text>
                <DatePicker
                  control={control}
                  name="dateOfBirth"
                  label="Date of Birth"
                  placeholder="Select Date of Birth"
                  error={errors.dateOfBirth}
                />
                <View style={styles.nameRow}>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="height"
                      label="Height (cm)"
                      placeholder="e.g. 175"
                      keyboardType="numeric"
                      error={errors.height}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="weight"
                      label="Weight (kg)"
                      placeholder="e.g. 70"
                      keyboardType="numeric"
                      error={errors.weight}
                    />
                  </View>
                </View>

                <View style={styles.nameRow}>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="bloodGroup"
                      label="Blood Group"
                      placeholder="e.g. O+, A-"
                      leftIcon="heart-outline"
                      error={errors.bloodGroup}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <FormInput
                      control={control}
                      name="genotype"
                      label="Genotype"
                      placeholder="e.g. AA, AS"
                      leftIcon="medical-outline"
                      error={errors.genotype}
                    />
                  </View>
                </View>
              </View>
            )}

            <PasswordInput
              control={control as any}
              name="password"
              label="Password*"
              placeholder="At least 8 chars with uppercase, lowercase, number & special symbol"
              error={errors.password}
              showStrengthMeter
              showRequirements
            />

            {pwWatch && !pwIsStrong && (
              <View style={styles.weakHintRow}>
                <Ionicons name="alert-circle-outline" size={14} color={Colors.warning.main} />
                <Text style={styles.weakPwHint}>
                  Please create a strong password that meets all criteria above.
                </Text>
              </View>
            )}

            <PasswordInput
              control={control as any}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
              showStrengthMeter={false}
              showRequirements={false}
            />

            <Controller
              control={control}
              name="agreeToTerms"
              render={({ field: { value, onChange } }) => (
                <View style={styles.termsWrapper}>
                  <TouchableOpacity
                    style={styles.termsCheckboxRow}
                    onPress={() => onChange(!value)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.termsCheckbox,
                      value && styles.termsCheckboxChecked,
                      errors.agreeToTerms && styles.termsCheckboxError
                    ]}>
                      {value && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.termsText}>
                      I read and agree to the{' '}
                      <Text
                        style={styles.termsHighlight}
                        onPress={() => setIsLegalModalOpen(true)}
                      >
                        {selectedRole === 'patient' ? 'Patient Telehealth Terms' : 'Doctor Provider Terms'}
                      </Text>
                      {' '}and{' '}
                      <Text
                        style={styles.termsHighlight}
                        onPress={() => setIsLegalModalOpen(true)}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agreeToTerms && (
                    <Text style={styles.termsErrorText}>
                      {errors.agreeToTerms.message as string}
                    </Text>
                  )}

                  {/* Modal Trigger Helper */}
                  <TouchableOpacity
                    style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => setIsLegalModalOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selectedRole === 'patient' ? 'person-circle-outline' : 'medkit-outline'}
                      size={14}
                      color={Colors.primary[600]}
                    />
                    <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Colors.primary[600] }}>
                      Tap to read {selectedRole === 'patient' ? 'Patient' : 'Doctor Provider'} Terms & Policy
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <Button
              label="Sign Up"
              onPress={handleSubmit(onSubmit, onFormError)}
              isLoading={loading}
              disabled={!pwIsStrong}
              style={styles.submitBtn}
            />

            <SocialLoginButtons variant="register" />

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Role-Based Legal Terms & Policy Modal */}
      <RoleLegalModal
        visible={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        role={selectedRole}
        onAccept={() => setValue('agreeToTerms', true, { shouldValidate: true })}
      />

      <LoadingOverlay visible={loading} message="Creating account..." />
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B5757', // Deep teal — app brand color
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 28,
  },
  // Concentric circle background graphics — removed (no longer used)
  bgCircle1: { display: 'none' as any },
  bgCircle2: { display: 'none' as any },
  bgCircle3: { display: 'none' as any },
  topBar: { display: 'none' as any },
  illustrationSection: { display: 'none' as any },
  illustrationWrapper: { display: 'none' as any },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  illustrationHeader: {
    backgroundColor: '#44C997',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  roleBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  illustrationImage: {
    width: width * 0.82,
    height: 170,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing[4],
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#165A48',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    gap: Spacing[4],
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing[2],
    height: 50,
    borderRadius: 16,
    backgroundColor: '#44C997',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontSize: FontSize.xs,
    color: '#165A48',
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
  doctorFieldsContainer: {
    gap: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: Spacing[4],
    marginTop: Spacing[2],
    marginBottom: Spacing[2],
  },
  doctorSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  uploadContainer: {
    gap: Spacing[2],
  },
  uploadLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  uploadedActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  uploadedTextActive: {
    color: '#059669',
  },
  uploadSpacing: {
    marginBottom: Spacing[2],
  },
  fieldErrorText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    marginTop: 4,
  },
  termsWrapper: {
    marginVertical: Spacing[1],
  },
  termsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  termsCheckboxChecked: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  termsCheckboxError: {
    borderColor: Colors.error.main,
  },
  termsText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
  termsHighlight: {
    color: Colors.primary[600],
    fontWeight: FontWeight.semiBold,
  },
  termsErrorText: {
    fontSize: FontSize.xs,
    color: Colors.error.main,
    marginTop: 6,
    marginLeft: 30,
  },
  weakHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[1],
    marginTop: -Spacing[2],
    marginBottom: Spacing[1],
  },
  weakPwHint: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.warning.dark,
    fontWeight: FontWeight.medium,
  },
});
