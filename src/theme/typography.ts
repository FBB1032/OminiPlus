import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  semiBold: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
  mono: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
  '5xl': 40,
} as const;

export const LineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Pre-built text style presets
export const TextPresets = {
  h1: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['3xl'] * LineHeight.tight,
  },
  h2: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['2xl'] * LineHeight.tight,
  },
  h3: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.xl * LineHeight.snug,
  },
  h4: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.lg * LineHeight.snug,
  },
  subtitle1: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  subtitle2: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  body1: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * LineHeight.relaxed,
  },
  body2: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  button: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  buttonSm: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
} as const;
