import React, { useState, useEffect } from 'react';
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
import { resetPasswordSchema, ResetPasswordFormValues, isPasswordStrong } from '../../../utils/validators';
import { authService } from '../../../services/authService';
import { Button, PasswordInput, LoadingOverlay } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';

export default function ResetPasswordScreen({ route, navigation }: AuthScreenProps<'ResetPassword'>) {
  const [loading, setLoading] = useState(false);
  const otpVerifiedForReset = useAuthStore((s) => s.otpVerifiedForReset);
  const resetEmail = useAuthStore((s) => s.resetEmail);
  const clearOtpVerifiedForReset = useAuthStore((s) => s.clearOtpVerifiedForReset);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const guardEmail = route.params?.email ?? resetEmail;
  const hasAccess = !!otpVerifiedForReset && !!guardEmail;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPwValue = watch('newPassword');
  const strongEnough = isPasswordStrong(newPwValue);

  useEffect(() => {
    if (!hasAccess) {
      const t = setTimeout(() => {
        showToastError('Access Restricted', 'Please verify your email first.');
        navigation.replace('ForgotPassword');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return <LoadingOverlay visible message="Verifying access..." />;
  }

  const onReset = async (data: ResetPasswordFormValues) => {
    if (!strongEnough) {
      showToastError('Weak Password', 'Please choose a strong password before continuing.');
      return;
    }
    if (!guardEmail) return;
    setLoading(true);
    try {
      await authService.resetPassword({
        email: guardEmail,
        otp: '',
        newPassword: data.newPassword,
      });
      clearOtpVerifiedForReset();
      showToastSuccess('Password Updated', 'Your password has been reset successfully.');
      navigation.replace('Login');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to reset password. Try again.';
      showToastError('Reset Failed', message);
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={24} color={Colors.text.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open-outline" size={32} color={Colors.primary[600]} />
            </View>
            <Text style={styles.title}>Enter your new password</Text>
            <Text style={styles.subtitle}>
              Enter a password that is easy for you to remember but hard for others to guess.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <PasswordInput
              control={control as any}
              name="newPassword"
              label="Password*"
              placeholder="Minimum 8 characters with upper, lower, number & symbol"
              error={errors.newPassword}
              showStrengthMeter
              showRequirements
            />

            {newPwValue && !strongEnough && (
              <View style={styles.weakHintRow}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.warning.main} />
              <Text style={styles.weakHintText}>
                Password must meet all 5 criteria before you can continue.
              </Text>
            </View>
          )}

            <PasswordInput
              control={control as any}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your new password"
              error={errors.confirmPassword}
              showStrengthMeter={false}
              showRequirements={false}
            />

            <Button
              label="Continue"
              onPress={handleSubmit(onReset)}
              isLoading={loading}
              disabled={!strongEnough}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Updating password..." />
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[4],
    ...Shadows.sm,
  },
  submitBtn: {
    marginTop: Spacing[2],
  },
  weakHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[2],
    marginTop: -Spacing[2],
    marginBottom: Spacing[1],
  },
  weakHintText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.warning.dark,
    fontWeight: FontWeight.medium,
  },
});
