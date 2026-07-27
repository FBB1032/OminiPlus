import { Platform } from 'react-native';

export const Shadows = {
  none: {},

  xs: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }),

  sm: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),

  md: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),

  lg: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),

  xl: Platform.select({
    ios: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
    default: {},
  }),
} as const;
