import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { queryClient } from '../api/queryClient';
import { isSupabaseConfigured } from './supabaseClient';
import { supabaseAuthService } from './supabaseAuthService';
import { LoginPayload, RegisterPayload, ForgotPasswordPayload, VerifyOTPPayload, ResetPasswordPayload } from '../types';

export const authService = {
  async login(payload: LoginPayload) {
    if (isSupabaseConfigured) {
      const { user, tokens } = await supabaseAuthService.login(payload);
      await useAuthStore.getState().setAuth(user, tokens);
      return { data: { user, tokens }, message: 'Logged in successfully', success: true };
    }
    const auth = await authApi.login(payload);
    const { user, tokens } = auth;
    console.log('[authService] login resolved:', { user, tokens });
    await useAuthStore.getState().setAuth(user, tokens);
    return { data: auth, message: 'Logged in successfully', success: true };
  },

  async register(payload: RegisterPayload) {
    if (isSupabaseConfigured) {
      const { user, tokens } = await supabaseAuthService.register(payload);
      await useAuthStore.getState().setAuth(user, tokens);
      return { data: { user, tokens }, message: 'Registered successfully', success: true };
    }
    const auth = await authApi.register(payload);
    const { user, tokens } = auth;
    await useAuthStore.getState().setAuth(user, tokens);
    return { data: auth, message: 'Registered successfully', success: true };
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    if (isSupabaseConfigured) {
      return { data: await supabaseAuthService.forgotPassword(payload.email), message: 'sent', success: true };
    }
    return authApi.forgotPassword(payload);
  },

  async verifyOTP(payload: VerifyOTPPayload) {
    if (isSupabaseConfigured) {
      return { data: await supabaseAuthService.verifyOTP(payload), message: 'verified', success: true };
    }
    return authApi.verifyOTP(payload);
  },

  async resetPassword(payload: ResetPasswordPayload) {
    if (isSupabaseConfigured) {
      return { data: await supabaseAuthService.resetPassword(payload), message: 'reset', success: true };
    }
    return authApi.resetPassword(payload);
  },

  async logout() {
    try {
      if (isSupabaseConfigured) {
        await supabaseAuthService.logout();
      } else {
        await authApi.logout();
      }
    } catch {
      // ignore API error — always clear local session
    } finally {
      await useAuthStore.getState().logout();
      queryClient.clear();
    }
  },

  async restoreSession() {
    if (isSupabaseConfigured) {
      const session = await supabaseAuthService.restoreSession();
      if (session) {
        await useAuthStore.getState().setAuth(session.user, session.tokens);
        return;
      }
      await useAuthStore.getState().initialize();
      return;
    }
    await useAuthStore.getState().initialize();
  },
};
