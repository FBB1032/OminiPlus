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
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../../../utils/validators';
import { authService } from '../../../services/authService';
import { Button, FormInput, LoadingOverlay, SocialLoginButtons } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenProps } from '../../../types';

const medicalTeamIllustration = require('../../../../assets/images/medical_team.jpg');

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [loading, setLoading] = useState(false);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleApplyDemoDoctor = () => {
    setValue('email', 'doctor@ominipulse.ai');
    setValue('password', 'admin123');
    showToastSuccess('Doctor Credentials Applied', 'Dr. Folake Ademola (Cardiologist, MDCN verified)');
  };

  const handleApplyDemoPatient = () => {
    setValue('email', 'patient@ominipulse.ai');
    setValue('password', 'admin123');
    showToastSuccess('Patient Credentials Applied', 'Chioma Egwu (Health records active)');
  };

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await authService.login(data);
      showToastSuccess('Welcome back!', 'Logged in successfully.');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid email or password.';
      showToastError('Login Failed', message);
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
            {/* Unified card — illustration header joined with form */}
            <View style={styles.formCard}>
              {/* Illustration Header (green top section) */}
              <View style={styles.illustrationHeader}>
                <Image
                  source={medicalTeamIllustration}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue your healthcare journey</Text>
              </View>

              <View style={styles.inputsBox}>
                <FormInput
                  control={control}
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                  error={errors.email}
                />

                <FormInput
                  control={control}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  autoCapitalize="none"
                  leftIcon="lock-closed-outline"
                  error={errors.password}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotContainer}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* 1-Tap Quick Demo Credentials */}
                <View style={styles.demoCard}>
                  <View style={styles.demoHeaderRow}>
                    <Ionicons name="flash-outline" size={13} color="#0D9488" />
                    <Text style={styles.demoCardTitle}>COMPETITION QUICK-FILL</Text>
                  </View>
                  <View style={styles.demoButtonsRow}>
                    <TouchableOpacity
                      style={styles.demoDoctorBtn}
                      onPress={handleApplyDemoDoctor}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="medkit" size={13} color="#065F46" />
                      <Text style={styles.demoDoctorText}>Doctor (Dr. Folake)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoPatientBtn}
                      onPress={handleApplyDemoPatient}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="person" size={13} color="#1E40AF" />
                      <Text style={styles.demoPatientText}>Patient (Chioma)</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.demoSubtitle}>
                    Doctor login is identical on Phone & Desktop · doctor@ominipulse.ai
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.88}
                  disabled={loading}
                >
                  <Text style={styles.submitBtnText}>Sign in</Text>
                </TouchableOpacity>

                {/* Social Login Options */}
                <SocialLoginButtons variant="login" />

                {/* Mobile-Only Account Creation Reminder */}
                <View style={styles.registerNoticeCard}>
                  <Ionicons name="phone-portrait-outline" size={14} color="#0D9488" style={{ marginRight: 6 }} />
                  <Text style={styles.registerNoticeText}>
                    Account creation for Doctors & Patients is conducted exclusively on mobile.
                  </Text>
                </View>

                {/* Switch to Register */}
                <View style={styles.footerRow}>
                  <Text style={styles.footerQuestion}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (navigation.canGoBack()) {
                        navigation.goBack();
                      } else {
                        navigation.navigate('RoleSelection');
                      }
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.registerLink}>Sign up instead</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <LoadingOverlay visible={loading} message="Signing you in..." />
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.lg,
    elevation: 10,
  },
  illustrationHeader: {
    backgroundColor: '#44C997',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  illustrationImage: {
    width: width * 0.82,
    height: 180,
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
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  inputsBox: {
    gap: Spacing[3],
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -2,
    marginBottom: 2,
  },
  forgotText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: FontWeight.medium,
  },
  submitBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#44C997', // Mint green button
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#44C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  footerQuestion: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  registerLink: {
    fontSize: FontSize.xs,
    color: '#165A48',
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
  demoCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  demoCardTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoDoctorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingVertical: 7,
  },
  demoDoctorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  demoPatientBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 7,
  },
  demoPatientText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  demoSubtitle: {
    fontSize: 10,
    color: '#059669',
    textAlign: 'center',
    marginTop: 6,
  },
  registerNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  registerNoticeText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'left',
    lineHeight: 15,
    flex: 1,
  },
});
