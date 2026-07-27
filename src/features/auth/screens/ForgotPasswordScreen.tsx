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
import { forgotPasswordSchema, ForgotPasswordFormValues } from '../../../utils/validators';
import { authService } from '../../../services/authService';
import { Button, FormInput, LoadingOverlay } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const [loading, setLoading] = useState(false);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      showToastSuccess('Reset Link Sent', 'OTP sent to your email.');
      navigation.navigate('OTPVerification', { email: data.email, mode: 'reset' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to send OTP. Please try again.';
      showToastError('Error', message);
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
              <Ionicons name="key-outline" size={32} color={Colors.primary[600]} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered email below, and we'll send you a 6-digit OTP to reset your password.
            </Text>
          </View>

          <View style={styles.formContainer}>
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

            <Button
              label="Send OTP"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Sending OTP..." />
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
  formContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[5],
    ...Shadows.sm,
  },
  submitBtn: {
    marginTop: Spacing[2],
  },
});
