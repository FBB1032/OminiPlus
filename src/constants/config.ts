// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.ominiplus.health/v1';

// App Info
export const APP_NAME = 'OminiPlus AI';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Token
export const ACCESS_TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 min before expiry

// AsyncStorage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ominiplus_access_token',
  REFRESH_TOKEN: 'ominiplus_refresh_token',
  USER: 'ominiplus_user',
  TOKEN_EXPIRY: 'ominiplus_token_expiry',
  ONBOARDING_COMPLETE: 'ominiplus_onboarding_complete',
} as const;

// React Query stale times
export const STALE_TIME = {
  SHORT: 30 * 1000,         // 30s
  MEDIUM: 5 * 60 * 1000,   // 5 min
  LONG: 30 * 60 * 1000,    // 30 min
  FOREVER: Infinity,
} as const;
