/**
 * Omini Pulse AI — Supabase Auth Service (Mobile)
 *
 * Bridges the app's existing auth contract (LoginPayload / RegisterPayload /
 * AuthResponse with { user, tokens }) to the unified Supabase backend, so the
 * SAME account works on mobile and the web/desktop app.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import apiClient from '../api/client';
import { logger } from '../utils/logger';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  UserRole,
  AuthTokens,
  VerifyOTPPayload,
  ResetPasswordPayload,
} from '../types';

// ─── Mapping helpers ──────────────────────────────────────────────────────────

interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  is_approved: boolean | null;
  verification_status: User['verificationStatus'];
}

function profileToUser(p: ProfileRow): User {
  return {
    id: p.id,
    email: p.email,
    firstName: p.first_name,
    lastName: p.last_name,
    role: p.role,
    phone: p.phone ?? undefined,
    avatarUrl: p.avatar_url ?? undefined,
    createdAt: p.created_at,
    isApproved: p.is_approved ?? false,
    verificationStatus: p.verification_status ?? 'pending',
  };
}

async function fetchProfile(userId: string): Promise<User> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to load profile');
  }
  return profileToUser(data as ProfileRow);
}

function sessionToTokens(access: string, refresh: string): AuthTokens {
  // Supabase access tokens are 1h JWTs; decode exp for the expiry buffer logic.
  let expiresAt = Date.now() + 3600 * 1000;
  try {
    const payload = JSON.parse(atob(access.split('.')[1]));
    if (payload?.exp) expiresAt = payload.exp * 1000;
  } catch {
    // keep default
  }
  return { accessToken: access, refreshToken: refresh, expiresAt };
}

async function buildAuthResponse(access: string, refresh: string): Promise<AuthResponse> {
  const user = await fetchCurrentProfileFromToken(access);
  return { user, tokens: sessionToTokens(access, refresh) };
}

async function fetchCurrentProfileFromToken(access: string): Promise<User> {
  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(access);
  if (userError || !userData?.user) {
    throw new Error(userError?.message ?? 'Session user not found');
  }
  return fetchProfile(userData.user.id);
}

function requireConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.'
    );
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const supabaseAuthService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    requireConfigured();
    const supabase = getSupabaseClient();

    // Server-side eligibility gate (suspension / MDCN lock) — same as web
    const { data: eligibility, error: gateError } = await supabase.rpc(
      'check_login_eligibility',
      { p_email: payload.email }
    );
    if (gateError) logger.warn('[supabaseAuth] eligibility check failed:', gateError.message);
    if (eligibility && eligibility.allowed === false) {
      throw new Error(
        eligibility.reason === 'account_suspended'
          ? 'This account has been suspended. Contact support.'
          : eligibility.reason === 'account_deactivated'
            ? 'This account is deactivated.'
            : eligibility.reason === 'verification_rejected'
              ? 'Your verification was rejected. Please update your credentials and reapply.'
              : 'Your account is still pending verification. You will be notified once approved.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error || !data?.session) {
      throw new Error(error?.message ?? 'Invalid email or password.');
    }

    return buildAuthResponse(data.session.access_token, data.session.refresh_token!);
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    requireConfigured();

    // Role-aware registration goes through the Express backend so the
    // server controls activation policy:
    //   • patient → email verification bypassed, immediately active
    //   • doctor  → created 'pending', activated by super-admin approval
    // The backend provisions via the service role (clients cannot claim
    // roles), then we sign in to obtain the session.
    const { data: registered } = await apiClient.post<{
      user: { id: string; email: string; role: UserRole; verificationStatus: string };
      requiresAdminApproval: boolean;
    }>('/auth/register', {
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      phone: payload.phone,
      specialization: (payload as RegisterPayload & { specialty?: string }).specialty,
      licenseNumber: (payload as RegisterPayload & { licenseNo?: string }).licenseNo,
    });

    if (registered?.requiresAdminApproval) {
      // Doctor accounts wait for super-admin verification — no session is
      // issued; the caller routes to the pending-approval screen.
      throw Object.assign(new Error('DOCTOR_PENDING_VERIFICATION'), {
        code: 'doctor_pending_verification',
        user: registered.user,
      });
    }

    // Patients: sign in immediately (the account is already active).
    return this.login({ email: payload.email, password: payload.password });
  },

  async me(): Promise<User> {
    requireConfigured();
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) throw new Error('Not authenticated');
    return fetchProfile(data.session.user.id);
  },

  async refresh(): Promise<AuthResponse> {
    requireConfigured();
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) throw new Error('Session refresh failed');
    return buildAuthResponse(data.session.access_token, data.session.refresh_token!);
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  },

  async restoreSession(): Promise<AuthResponse | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    try {
      return await buildAuthResponse(data.session.access_token, data.session.refresh_token!);
    } catch {
      return null;
    }
  },

  // ─── Password reset via unified edge functions (shared with web) ────────────

  async forgotPassword(email: string): Promise<{ message: string }> {
    requireConfigured();
    const fnUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-otp`;
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? 'Failed to send reset code');
    }
    return { message: 'If that account exists, a reset code has been sent.' };
  },

  async verifyOTP(payload: VerifyOTPPayload): Promise<{ verified: boolean }> {
    requireConfigured();
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('verify_password_reset_otp', {
      p_email: payload.email,
      p_otp: payload.otp,
    });
    if (error) throw new Error(error.message);
    return { verified: Boolean(data) };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    requireConfigured();
    const fnUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/reset-password`;
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        otp: payload.otp,
        newPassword: payload.newPassword,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? 'Failed to reset password');
    }
    return { message: 'Password updated. You can now sign in.' };
  },
};
