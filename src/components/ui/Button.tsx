import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontWeight, FontSize, Shadows } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const variantStyles: Record<Variant, { container: ViewStyle; label: TextStyle }> = {
  primary: {
    container: { backgroundColor: Colors.primary[600] },
    label: { color: Colors.text.inverse },
  },
  secondary: {
    container: { backgroundColor: Colors.secondary[500] },
    label: { color: Colors.text.inverse },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary[600] },
    label: { color: Colors.primary[600] },
  },
  ghost: {
    container: { backgroundColor: Colors.primary[50] },
    label: { color: Colors.primary[600] },
  },
  danger: {
    container: { backgroundColor: Colors.error.main },
    label: { color: Colors.text.inverse },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; label: TextStyle }> = {
  sm: {
    container: { height: 36, paddingHorizontal: Spacing[3], borderRadius: BorderRadius.md },
    label: { fontSize: FontSize.sm },
  },
  md: {
    container: { height: 48, paddingHorizontal: Spacing[5], borderRadius: BorderRadius.lg },
    label: { fontSize: FontSize.base },
  },
  lg: {
    container: { height: 56, paddingHorizontal: Spacing[6], borderRadius: BorderRadius.xl },
    label: { fontSize: FontSize.md },
  },
};

export const Button = memo<ButtonProps>(({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled,
  style,
  labelStyle,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        vStyle.container,
        sStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary[600] : Colors.neutral[0]}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, vStyle.label, sStyle.label, labelStyle]}>{label}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    ...Shadows.sm,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  label: {
    fontWeight: FontWeight.semiBold,
    includeFontPadding: false,
  },
});
