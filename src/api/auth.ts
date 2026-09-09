/**
 * Auth API — unified Supabase GoTrue auth (shared with desktop/web).
 *
 * The deployed Express backend has no /auth/login|register endpoints —
 * authentication is handled by Supabase directly. These adapters delegate to
 * supabaseAuthService so the existing screen/store contract (AuthResponse
 * with { user, tokens }) is preserved.
 */

import { supabaseAuthService } from '../services/supabaseAuthService';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOTPPayload,
  ResetPasswordPayload,
} from '../types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => supabaseAuthService.login(payload),

  register: async (payload: RegisterPayload): Promise<AuthResponse> => supabaseAuthService.register(payload),

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> =>
    supabaseAuthService.forgotPassword(payload.email),

  verifyOTP: async (payload: VerifyOTPPayload): Promise<{ verified: boolean }> =>
    supabaseAuthService.verifyOTP(payload),

  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> =>
    supabaseAuthService.resetPassword(payload),

  refreshToken: async (): Promise<AuthResponse> => supabaseAuthService.refresh(),

  logout: async (): Promise<void> => supabaseAuthService.logout(),

  me: async (): Promise<AuthResponse['user']> => supabaseAuthService.me(),
};
