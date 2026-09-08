/**
 * Omini Pulse Desktop/Web — Supabase Auth Service
 *
 * Authenticates against the SAME unified backend as the mobile app, so an
 * account created on mobile signs into the desktop console seamlessly.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import type { Admin, AdminRole } from '@/types';

interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  is_two_factor_enabled: boolean | null;
}

function profileToAdmin(p: ProfileRow): Admin {
  return {
    id: p.id,
    email: p.email,
    firstName: p.first_name,
    lastName: p.last_name,
    role: p.role,
    avatarUrl: p.avatar_url ?? undefined,
    createdAt: p.created_at,
    isTwoFactorEnabled: p.is_two_factor_enabled ?? false,
  };
}

export const supabaseAuthService = {
  async login(email: string, password: string): Promise<{ admin: Admin; token: string }> {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in desktop/.env.local.'
      );
    }
    const supabase = getSupabaseClient();

    // Server-side gate (suspension / MDCN lock) — identical to mobile
    const { data: eligibility } = await supabase.rpc('check_login_eligibility', {
      p_email: email,
    });
    if (eligibility && eligibility.allowed === false) {
      throw new Error(
        eligibility.reason === 'account_suspended'
          ? 'This account has been suspended. Contact support.'
          : eligibility.reason === 'account_deactivated'
            ? 'This account is deactivated.'
            : 'Your account is still pending verification.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error(error?.message ?? 'Invalid email or password.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    if (profileError || !profile) {
      throw new Error(profileError?.message ?? 'Failed to load staff profile');
    }

    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.session.user.id);

    return {
      admin: profileToAdmin(profile as ProfileRow),
      token: data.session.access_token,
    };
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  },

  async restoreSession(): Promise<{ admin: Admin; token: string } | null> {
    if (!isSupabaseConfigured) return null;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    if (profileError || !profile) return null;

    return {
      admin: profileToAdmin(profile as ProfileRow),
      token: data.session.access_token,
    };
  },
};
