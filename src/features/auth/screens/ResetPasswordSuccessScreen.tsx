import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../../components';
import { useToast } from '../../../hooks/useAuth';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { AuthScreenProps } from '../../../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';

export default function ResetPasswordSuccessScreen({ route, navigation }: AuthScreenProps<'ResetPasswordSuccess'>) {
  const { email } = route.params;
  const clearOtpVerifiedForReset = useAuthStore((s) => s.clearOtpVerifiedForReset);
  const { success: showToastSuccess } = useToast();

  const handleProceed = () => {
    navigation.navigate('ResetPassword', { email });
  };

  const handleBackToLogin = () => {
    clearOtpVerifiedForReset();
    navigation.replace('Login');
    showToastSuccess('Session Reset', 'Returned to login. Please restart password reset if needed.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-done-circle" size={72} color={Colors.success.main} />
          </View>
          <Text style={styles.title}>Email Verified!</Text>
          <Text style={styles.subtitle}>
            Your OTP has been confirmed. You can now set a new secure password for your account.</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.text.secondary} />
            <Text style={styles.emailText} numberOfLines={1}>{email}</Text>
          </View>

          <Button
            label="Continue to Reset Password"
            onPress={handleProceed}
            style={styles.ctaButton}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBackToLogin}
            style={styles.backLink}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[800],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing[6],
    justifyContent: 'center',
    paddingVertical: Spacing[8],
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  iconContainer: {
    marginBottom: Spacing[5],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing[3],
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing[5],
    borderRadius: 24,
    gap: Spacing[5],
    ...Shadows.sm,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[3],
    backgroundColor: Colors.neutral[50],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  ctaButton: {
    marginTop: Spacing[1],
  },
  backLink: {
    alignSelf: 'center',
    marginTop: Spacing[1],
  },
  backLinkText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.medium,
  },
});
