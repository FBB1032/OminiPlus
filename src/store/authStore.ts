import { create } from 'zustand';
import { User, UserRole, AuthTokens } from '../types';
import { storageService } from '../services/storageService';
import { secureStoreService } from '../services/secureStoreService';
import { STORAGE_KEYS } from '../constants/config';
import { logger } from '../utils/logger';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  role: UserRole | null;
  onboardingCompleted: boolean;
  otpVerifiedForReset: boolean;
  resetEmail: string | null;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  markInitialized: () => void;
  completeOnboarding: () => Promise<void>;
  setOtpVerifiedForReset: (email: string) => void;
  clearOtpVerifiedForReset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  role: null,
  onboardingCompleted: false,
  otpVerifiedForReset: false,
  resetEmail: null,

  setAuth: async (user, tokens) => {
    try {
      await Promise.all([
        storageService.setObject(STORAGE_KEYS.USER, user),
        secureStoreService.set(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        secureStoreService.set(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        storageService.set(STORAGE_KEYS.TOKEN_EXPIRY, String(tokens.expiresAt)),
      ]);
    } catch (e) {
      logger.error('[AuthStore] Failed to persist credentials:', e);
    }
    set({ user, tokens, isAuthenticated: true, role: user.role });
  },

  setUser: (user) => {
    storageService.setObject(STORAGE_KEYS.USER, user);
    set({ user });
  },

  logout: async () => {
    await Promise.all([
      secureStoreService.remove(STORAGE_KEYS.ACCESS_TOKEN),
      secureStoreService.remove(STORAGE_KEYS.REFRESH_TOKEN),
      storageService.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN_EXPIRY]),
    ]);
    set({ user: null, tokens: null, isAuthenticated: false, role: null });
  },

  markInitialized: () => {
    set({ isLoading: false, isInitialized: true });
  },

  completeOnboarding: async () => {
    // Update in-memory state only (not saved to storage) so reloads show onboarding
    set({ onboardingCompleted: true });
  },

  setOtpVerifiedForReset: (email) => {
    set({ otpVerifiedForReset: true, resetEmail: email });
  },

  clearOtpVerifiedForReset: () => {
    set({ otpVerifiedForReset: false, resetEmail: null });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Clear any previously saved onboarding flag from storage
      await storageService.remove(STORAGE_KEYS.ONBOARDING_COMPLETE);

      const [user, accessToken, refreshToken, expiresAtStr] = await Promise.all([
        storageService.getObject<User>(STORAGE_KEYS.USER),
        secureStoreService.get(STORAGE_KEYS.ACCESS_TOKEN),
        secureStoreService.get(STORAGE_KEYS.REFRESH_TOKEN),
        storageService.get(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      set({ onboardingCompleted: false });

      if (user && accessToken && refreshToken) {
        const expiresAt = expiresAtStr ? Number(expiresAtStr) : 0;
        set({
          user,
          tokens: { accessToken, refreshToken, expiresAt },
          isAuthenticated: true,
          role: user.role,
        });
      }
    } catch {
      // Session restore failed — user stays logged out
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
