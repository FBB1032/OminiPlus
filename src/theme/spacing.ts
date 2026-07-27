export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const IconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
} as const;

export const AvatarSize = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
  '2xl': 96,
} as const;

// Common layout constants
export const Layout = {
  screenPaddingH: 20,
  screenPaddingV: 16,
  cardPadding: 16,
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSm: 40,
  tabBarHeight: 64,
  headerHeight: 56,
  bottomInset: 34, // iPhone home indicator
} as const;
