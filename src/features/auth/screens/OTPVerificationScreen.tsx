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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormValues } from '../../../utils/validators';
import { authService } from '../../../services/authService';
import { Button, FormInput, OTPInput, LoadingOverlay } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerificationScreen({ route, navigation }: AuthScreenProps<'OTPVerification'>) {
  const { email, mode } = route.params;
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [otpVal, setOtpVal] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleVerifyOTP = async () => {
    if (otpVal.length < 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setOtpError(null);

    if (mode === 'verify') {
      setLoading(true);
      try {
        await authService.verifyOTP({ email, otp: otpVal });
        showToastSuccess('Success', 'Email verified successfully.');
        navigation.replace('Login');
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Invalid or expired OTP.';
        showToastError('Verification Failed', message);
      } finally {
        setLoading(false);
      }
    } else {
      // mode === 'reset' -> proceed to new password screen
      setStep('password');
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: otpVal,
        newPassword: data.newPassword,
      });
      showToastSuccess('Success', 'Your password has been reset successfully.');
      navigation.replace('Login');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to reset password. Try again.';
      showToastError('Reset Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      showToastSuccess('Code Resent', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      showToastError('Error', 'Unable to resend OTP.');
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (step === 'password' ? setStep('otp') : navigation.goBack())}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={24} color={Colors.text.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          {step === 'otp' ? (
            <>
              <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={32} color={Colors.primary[600]} />
                </View>
                <Text style={styles.title}>Enter OTP Code</Text>
                <Text style={styles.subtitle}>
                  We've sent a 6-digit confirmation code to{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
              </View>

              <View style={styles.formContainer}>
                <OTPInput
                  length={6}
                  value={otpVal}
                  onChange={setOtpVal}
                  error={otpError || undefined}
                />

                <Button
                  label="Verify Code"
                  onPress={handleVerifyOTP}
                  isLoading={loading}
                  style={styles.submitBtn}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResendOTP}
                  style={styles.resendContainer}
                >
                  <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-open-outline" size={32} color={Colors.primary[600]} />
                </View>
                <Text style={styles.title}>New Password</Text>
                <Text style={styles.subtitle}>
                  Please choose a strong password for your account security.
                </Text>
              </View>

              <View style={styles.formContainer}>
                <FormInput
                  control={control}
                  name="newPassword"
                  label="New Password"
                  placeholder="At least 8 chars, 1 uppercase, 1 number"
                  isPassword
                  autoCapitalize="none"
                  leftIcon="lock-closed-outline"
                  error={errors.newPassword}
                />

                <FormInput
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  isPassword
                  autoCapitalize="none"
                  leftIcon="lock-closed-outline"
                  error={errors.confirmPassword}
                />

                <Button
                  label="Reset Password"
                  onPress={handleSubmit(handleResetPassword)}
                  isLoading={loading}
                  style={styles.submitBtn}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Processing..." />
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
    paddingVertical: Spacing[8],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : Spacing[4],
    left: Spacing[6],
    zIndex: 10,
  },
  backBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing[8],
    marginTop: Spacing[10],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[5],
    ...Shadows.sm,
  },
  errorText: {
    color: Colors.error.main,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: -Spacing[2],
  },
  submitBtn: {
    marginTop: Spacing[2],
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  resendText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.medium,
  },
});
