/**
 * Supabase data layer.
 *
 * Two clients:
 *   • userClient  — per-request client bound to the caller's Supabase JWT.
 *                   RLS applies, so a patient can only ever touch their own rows.
 *   • adminClient — service-role client (server secret only). Bypasses RLS.
 *                   Used exclusively server-side for admin ops and AI tasks.
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../config/logger');

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY (or the EXPO_PUBLIC_* equivalents) must be set.');
}

function createAdminClient() {
  if (!config.supabase.serviceKey) {
    logger.warn('SUPABASE_SERVICE_ROLE_KEY not set — admin/bypass-RLS endpoints will be unavailable');
    return null;
  }
  return createClient(config.supabase.url, config.supabase.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const adminClient = createAdminClient();

/**
 * Create a Supabase client scoped to a user's JWT (RLS enforced).
 * @param {string} accessToken Supabase access token from the Authorization header
 */
function createUserClient(accessToken) {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Verify a Supabase JWT and return { userId } — GoTrue is the issuer, so this
 * doubles as the authentication step for every protected route.
 */
async function verifyToken(accessToken) {
  const client = createUserClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data?.user) {
    return { user: null, error: error?.message ?? 'Invalid token' };
  }
  return { user: data.user, error: null };
}

module.exports = { adminClient, createUserClient, verifyToken };
