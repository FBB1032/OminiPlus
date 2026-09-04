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
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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

                {/* Dots indicator */}
                <View style={styles.dotsContainer}>
                  <View style={styles.dotInactive} />
                  <View style={styles.dotActive} />
                  <View style={styles.dotInactive} />
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
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: Spacing[3],
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2CB48E',
  },
  dotInactive: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D1ECE3',
  },
});
