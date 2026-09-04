import React, { useState, useEffect, useRef } from 'react';
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
import { Button, OTPInput, LoadingOverlay } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authService';

export default function OTPVerificationScreen({ route, navigation }: AuthScreenProps<'OTPVerification'>) {
  const { email, mode } = route.params;
  const [otpVal, setOtpVal] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { error: showToastError, success: showToastSuccess } = useToast();
  const setOtpVerifiedForReset = useAuthStore((s) => s.setOtpVerifiedForReset);

  const canResend = cooldown === 0;

  useEffect(() => {
    if (cooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [cooldown]);

  const handleVerifyOTP = async () => {
    if (otpVal.length < 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setOtpError(null);
    setLoading(true);
    try {
      if (mode === 'verify') {
        await authService.verifyOTP({ email, otp: otpVal });
        showToastSuccess('Success', 'Email verified successfully.');
        navigation.replace('Login');
      } else {
        setOtpVerifiedForReset(email);
        showToastSuccess('OTP Verified', 'Email confirmed. Proceed to set a new password.');
        navigation.replace('ResetPasswordSuccess', { email });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid or expired OTP.';
      showToastError('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      showToastSuccess('Code Resent', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      showToastError('Error', 'Unable to resend OTP.');
    } finally {
      setLoading(false);
    }
    setCooldown(60);
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={24} color={Colors.text.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

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
              onChange={(v) => {
                setOtpVal(v);
                if (otpError) setOtpError(null);
              }}
              error={otpError || undefined}
              onComplete={handleVerifyOTP}
            />

            <Button
              label="Verify Code"
              onPress={handleVerifyOTP}
              isLoading={loading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              activeOpacity={canResend ? 0.7 : 1}
              onPress={handleResendOTP}
              style={styles.resendContainer}
              disabled={!canResend}
            >
              <Text style={[styles.resendText, !canResend && styles.resendDisabled]}>
                Didn't receive code? {canResend ? 'Resend' : `Resend in ${cooldown}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Processing..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[800],
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
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: FontWeight.semiBold,
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[5],
    ...Shadows.sm,
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
  resendDisabled: {
    color: Colors.text.disabled,
  },
});
