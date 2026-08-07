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
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subtitle}>Your AI-Powered Healthcare Companion</Text>
          </View>

          <View style={styles.formContainer}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="key-outline" size={14} color={Colors.primary[600]} />
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </View>
            </TouchableOpacity>

            <Button
              label="Sign In"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              style={styles.submitBtn}
            />

            <SocialLoginButtons variant="login" />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} message="Signing you in..." />
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  logoContainer: {
    width: Dimensions.get('window').width * 0.72,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  logo: {
    width: '100%',
    height: '100%',
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
  forgotContainer: {
    alignSelf: 'flex-end',
    marginVertical: Spacing[1],
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.medium,
  },
  submitBtn: {
    marginTop: Spacing[2],
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[8],
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  registerLink: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },
});
