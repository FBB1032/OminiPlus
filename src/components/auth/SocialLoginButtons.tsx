import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useToast } from '../../hooks/useAuth';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '../../theme';

export interface SocialLoginButtonsProps {
  variant?: 'login' | 'register';
  onGoogle?: () => void;
  onApple?: () => void;
}

const GoogleLogo = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.8 2.3 2.7 6.5 2.7 12s4.1 9.7 9.3 9.7c5.4 0 8.9-3.8 8.9-9.2 0-.6-.1-1.1-.2-1.6L12 10.2z"
    />
  </Svg>
);

const AppleLogo = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M17.05 12.44c-.03-2.71 2.21-4.02 2.32-4.08-1.26-1.84-3.23-2.09-3.93-2.12-1.67-.17-3.26.98-4.11.98-.86 0-2.15-.96-3.53-.93-1.81.03-3.49 1.05-4.42 2.67-1.89 3.27-.48 8.1 1.36 10.77.91 1.33 1.99 2.82 3.41 2.77 1.37-.05 1.89-.89 3.55-.89 1.66 0 2.13.89 3.58.86 1.48-.03 2.41-1.35 3.31-2.69 1.04-1.5 1.47-2.95 1.49-3.02-.03-.02-2.86-1.1-2.88-4.31zM14.42 4.55c.75-.91 1.26-2.17 1.12-3.42-1.08.04-2.4.72-3.18 1.62-.69.8-1.31 2.09-1.14 3.32 1.21.09 2.45-.61 3.2-1.52z" />
  </Svg>
);

export const SocialLoginButtons = memo<SocialLoginButtonsProps>(({
  variant = 'login',
  onGoogle,
  onApple,
}) => {
  const { info: showToastInfo } = useToast();

  const defaultGoogle = () => {
    showToastInfo(
      'Coming Soon',
      'Google Sign-In will be available with backend integration.',
    );
  };

  const defaultApple = () => {
    showToastInfo(
      'Coming Soon',
      'Apple Sign-In will be available with backend integration.',
    );
  };

  const handleGoogle = onGoogle ?? defaultGoogle;
  const handleApple = onApple ?? defaultApple;

  const googleLabel = variant === 'login' ? 'Continue with Google' : 'Sign up with Google';
  const appleLabel = variant === 'login' ? 'Continue with Apple' : 'Sign up with Apple';

  return (
    <View style={styles.wrapper}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsGroup}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogle}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={googleLabel}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <View style={styles.iconWrapper}>
            <GoogleLogo />
          </View>
          <Text style={styles.googleLabel} numberOfLines={1} adjustsFontSizeToFit>
            {googleLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appleButton}
          onPress={handleApple}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={appleLabel}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <View style={styles.iconWrapper}>
            <AppleLogo />
          </View>
          <Text style={styles.appleLabel} numberOfLines={1} adjustsFontSizeToFit>
            {appleLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

SocialLoginButtons.displayName = 'SocialLoginButtons';

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing[5],
    gap: Spacing[4],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
    letterSpacing: 0.5,
  },
  buttonsGroup: {
    gap: Spacing[3],
  },
  googleButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing[3],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  appleButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    gap: Spacing[3],
    ...Shadows.xs,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLabel: {
    flex: 1,
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  appleLabel: {
    flex: 1,
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.surface,
    textAlign: 'center',
  },
});
