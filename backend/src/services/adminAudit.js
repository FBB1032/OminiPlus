/**
 * Administrative audit service — the compliance trail behind every
 * privileged mutation.
 *
 * Contract:
 *   • `capture()` records an entry into public.admin_audit_logs via the
 *     security-definer RPC `log_admin_action` using the CALLER's Supabase
 *     JWT (so actor identity is pinned server-side by the DB trigger) —
 *     falling back to the service-role client when the RPC is unavailable.
 *   • Audit writes never block the primary operation: a failed audit insert
 *     is logged loudly (logger.error) but the request still succeeds, so a
 *     compliance-subsystem outage cannot take down moderation. Failures are
 *     visible in logs for follow-up.
 *
 * The DB layer (0006) hash-chains every entry and pins actor identity, so
 * the trail is tamper-evident: rewriting any row breaks the chain.
 */

const { adminClient } = require('../config/supabase');

/**
 * Record one administrative action.
 *
 * @param {object} opts
 * @param {object} opts.req            Express request (req.auth.profile = actor)
 * @param {string} opts.action         Stable verb, e.g. 'doctor.verification.approve'
 * @param {string} opts.targetType     'user' | 'doctor' | 'patient' | ...
 * @param {string} [opts.targetId]     Row id the action concerns
 * @param {string} [opts.targetLabel]  Human-readable target (name, email)
 * @param {string} [opts.status]       'success' | 'failure'
 * @param {object} [opts.metadata]     Free-form details (before/after snapshots)
 * @returns {Promise<{id: string|null}>}
 */
async function capture({ req, action, targetType, targetId, targetLabel, status = 'success', metadata = {} }) {
  const actor = req?.auth?.profile;
  const ipAddress = req?.ip ?? null;
  const userAgent = (req?.headers?.['user-agent'] ?? '').slice(0, 200) || null;

  const entry = {
    p_action: action,
    p_target_type: targetType,
    p_target_id: targetId ?? null,
    p_target_label: targetLabel ?? null,
    p_status: status,
    p_metadata: metadata,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  };

  // Preferred path: caller-scoped RPC — the DB trigger pins actor identity.
  if (req?.auth?.supabase) {
    const { data, error } = await req.auth.supabase.rpc('log_admin_action', entry);
    if (!error && data) return { id: data };
  }

  // Fallback: service-role write (still hash-chained by the DB trigger).
  if (!adminClient) {
    req?.logger?.error?.('admin audit NOT persisted (no service client)', { action });
    return { id: null };
  }
  const { data, error } = await adminClient.rpc('log_admin_action', entry);
  if (error) {
    req?.logger?.error?.('admin audit write failed', { action, message: error.message });
    return { id: null };
  }
  return { id: data };
}

module.exports = { capture };
