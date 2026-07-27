export const Colors = {
  // Primary brand (Deep Teal / Blue-Green)
  primary: {
    50: '#E6F4F4',
    100: '#C2E5E5',
    200: '#99D4D4',
    300: '#6FC3C3',
    400: '#46B2B2',
    500: '#1A7A7A',
    600: '#0F6E6E',
    700: '#0B5757',
    800: '#084141',
    900: '#042A2A',
  },

  // Secondary (teal accent)
  secondary: {
    50: '#E6F4F4',
    100: '#C2E5E5',
    200: '#99D4D4',
    300: '#6FC3C3',
    400: '#46B2B2',
    500: '#1A7A7A',
    600: '#0F6E6E',
    700: '#0B5757',
    800: '#084141',
    900: '#042A2A',
  },

  // Neutrals (Adjusted for Charcoal text comfort)
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFA',
    100: '#F0F4F4',
    200: '#E2E8E8',
    300: '#CBD5D5',
    400: '#94A3A3',
    500: '#647474',
    600: '#475555',
    700: '#334141',
    800: '#1E2A2A',
    900: '#0F1717',
  },

  // Semantic colors
  success: {
    light: '#DCFCE7',
    main: '#22C55E',
    dark: '#16A34A',
  },
  warning: {
    light: '#FEF9C3',
    main: '#EAB308',
    dark: '#CA8A04',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#E6F4F4',
    main: '#1A7A7A',
    dark: '#0F6E6E',
  },

  // App-level aliases
  background: '#F8FAFA',
  surface: '#FFFFFF',
  border: '#E2E8E8',
  text: {
    primary: '#1E2A2A',
    secondary: '#647474',
    disabled: '#CBD5D5',
    inverse: '#FFFFFF',
    link: '#0F6E6E',
  },

  // Role-specific accents
  doctor: '#0F6E6E',
  patient: '#1A7A7A',
  admin: '#7C3AED',

  // Appointment status
  status: {
    scheduled: '#E6F4F4',
    scheduledText: '#0F6E6E',
    completed: '#DCFCE7',
    completedText: '#16A34A',
    cancelled: '#FEE2E2',
    cancelledText: '#DC2626',
    pending: '#FEF9C3',
    pendingText: '#CA8A04',
  },
} as const;

export type ColorKey = keyof typeof Colors;
