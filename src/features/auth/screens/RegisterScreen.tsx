import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '../../../utils/validators';
import { authService } from '../../../services/authService';
import { authApi } from '../../../api/auth';
import { Button, FormInput, FormSelect, LoadingOverlay, DocumentUploadPicker, DatePicker } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';

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

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const [loading, setLoading] = useState(false);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'patient',
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

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>('patient');

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
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join OminiPlus to manage your wellness journey</Text>
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

            {/* Role Selector Toggle */}
            <View style={styles.roleToggleContainer}>
              <Text style={styles.roleLabel}>I am a...</Text>
              <View style={styles.roleToggleRow}>
                <TouchableOpacity
                  style={[styles.roleToggleButton, selectedRole === 'patient' && styles.roleToggleActive]}
                  onPress={() => {
                    setSelectedRole('patient');
                    setValue('role', 'patient');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person" size={18} color={selectedRole === 'patient' ? '#FFF' : Colors.text.secondary} />
                  <Text style={[styles.roleToggleText, selectedRole === 'patient' && styles.roleToggleTextActive]}>Patient</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.roleToggleButton, selectedRole === 'doctor' && styles.roleToggleActive]}
                  onPress={() => {
                    setSelectedRole('doctor');
                    setValue('role', 'doctor');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="medkit" size={18} color={selectedRole === 'doctor' ? '#FFF' : Colors.text.secondary} />
                  <Text style={[styles.roleToggleText, selectedRole === 'doctor' && styles.roleToggleTextActive]}>Doctor</Text>
                </TouchableOpacity>
              </View>
            </View>

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

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Minimum 8 characters (A-Z, 0-9)"
              isPassword
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <FormInput
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              isPassword
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
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
                      I agree to the{' '}
                      <Text style={styles.termsHighlight}>Terms & Conditions</Text>
                      {' '}and{' '}
                      <Text style={styles.termsHighlight}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agreeToTerms && (
                    <Text style={styles.termsErrorText}>
                      {errors.agreeToTerms.message as string}
                    </Text>
                  )}
                </View>
              )}
            />

            <Button
              label="Sign Up"
              onPress={handleSubmit(onSubmit, onFormError)}
              isLoading={loading}
              style={styles.submitBtn}
            />
          </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Creating account..." />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[4],
    ...Shadows.sm,
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
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[6],
    marginBottom: Spacing[4],
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },
  roleToggleContainer: {
    marginBottom: Spacing[2],
  },
  roleLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  roleToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  roleToggleActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  roleToggleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  roleToggleTextActive: {
    color: '#FFFFFF',
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
});
