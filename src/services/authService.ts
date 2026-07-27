import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { queryClient } from '../api/queryClient';
import { LoginPayload, RegisterPayload, ForgotPasswordPayload, VerifyOTPPayload, ResetPasswordPayload } from '../types';

export const authService = {
  async login(payload: LoginPayload) {
    const response = await authApi.login(payload);
    const { user, tokens } = response.data;
    console.log('[authService] login resolved:', { user, tokens });
    await useAuthStore.getState().setAuth(user, tokens);
    return response;
  },

  async register(payload: RegisterPayload) {
    const response = await authApi.register(payload);
    const { user, tokens } = response.data;
    await useAuthStore.getState().setAuth(user, tokens);
    return response;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    return authApi.forgotPassword(payload);
  },

  async verifyOTP(payload: VerifyOTPPayload) {
    return authApi.verifyOTP(payload);
  },

  async resetPassword(payload: ResetPasswordPayload) {
    return authApi.resetPassword(payload);
  },

  async logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore API error — always clear local session
    } finally {
      await useAuthStore.getState().logout();
      queryClient.clear();
    }
  },

  async restoreSession() {
    await useAuthStore.getState().initialize();
  },
};

