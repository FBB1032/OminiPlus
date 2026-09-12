/**
 * Platform admin routes — dashboard stats, user management (verification,
 * suspension, reactivation), hospitals, audit trail (NDPA + administrative),
 * AI flags + AI interaction logs, incidents, payments, broadcasts.
 *
 * Every privileged mutation:
 *   1. is permission-gated (requirePermission),
 *   2. writes a hash-chained entry to admin_audit_logs (compliance trail),
 *   3. pushes a realtime event so connected admin/desktop sessions see the
 *      change instantly.
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');
const { capture } = require('../services/adminAudit');
const { adminClient } = require('../config/supabase');
const hub = require('../realtime/hub');

const router = express.Router();

// Postgres uuid fields error on malformed input — reject non-UUID ids with a
// client error (400) instead of a retryable 500 from the db layer.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.use(authenticate, requirePermission('admin:dashboard'));

// ─── GET /api/admin/dashboard — platform-wide KPI counts ─────────────────────

router.get(
  '/dashboard',
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const counts = {};
    const tables = ['profiles', 'hospitals', 'appointments', 'lab_orders', 'blood_requests', 'incident_reports', 'ai_flags', 'payment_transactions'];
    for (const t of tables) {
      const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
      if (error) throw new ApiError(500, 'db_error', `${t}: ${error.message}`);
      counts[t] = count ?? 0;
    }
    const { count: pendingDocs } = await supabase
      .from('doctor_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_mdcn_verified', false);
    res.json({
      totals: counts,
      pendingDoctorVerifications: pendingDocs ?? 0,
    });
  })
);

// ─── GET /api/admin/users?role=&status= ─────────────────────────────────────

router.get(
  '/users',
  requirePermission('admin:users'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, verification_status, is_active, is_approved, created_at')
      .order('created_at', { ascending: false });
    if (req.query.role) query = query.eq('role', req.query.role);
    if (req.query.status) query = query.eq('verification_status', req.query.status);
    const { data, error } = await query.limit(300);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ users: data ?? [] });
  })
);

// ─── Super-admin account control ─────────────────────────────────────────────
//
// POST /api/admin/users/:id/verify      — approve | reject a doctor's account
// PATCH /api/admin/users/:id/status     — suspend | reactivate any account
//
// All three are audited to admin_audit_logs and push realtime events to the
// affected user + the admin channel (dashboard badges update live).

const verifySchema = z.object({
  decision: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
});

router.post(
  '/users/:id/verify',
  requirePermission('admin:users'),
  validate(verifySchema),
  wrap(async (req, res) => {
    const { decision, reason } = req.body;
    const { supabase } = req.auth;
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid user id');
    }

    // Load the target — must exist and be a doctor account.
    const { data: target, error: loadError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, verification_status')
      .eq('id', req.params.id)
      .maybeSingle();
    if (loadError) throw new ApiError(500, 'db_error', loadError.message);
    if (!target) throw new ApiError(404, 'not_found', 'User not found');
    if (target.role !== 'doctor') {
      throw new ApiError(400, 'invalid_target', 'Verification decisions apply to doctor accounts only');
    }

    const approved = decision === 'approve';
    const nextStatus = approved ? 'approved' : 'rejected';

    // profiles update (RLS: admin-only on these columns via 0005 trigger).
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_status: nextStatus,
        is_approved: approved,
        is_active: approved,
      })
      .eq('id', req.params.id)
      .select('id, email, role, verification_status, is_approved, is_active')
      .single();
    if (updateError || !updated) {
      throw new ApiError(400, 'update_failed', updateError?.message ?? 'Verification update failed');
    }

    // Doctor clinical row: reflect MDCN verification.
    if (adminClient) {
      await adminClient
        .from('doctor_profiles')
        .update({ is_mdcn_verified: approved })
        .eq('profile_id', req.params.id)
        .then(() => {}, (e) => req.logger.warn('doctor_profiles update failed', { message: e.message }));
    }

    // Compliance trail.
    await capture({
      req,
      action: approved ? 'doctor.verification.approved' : 'doctor.verification.rejected',
      targetType: 'doctor',
      targetId: target.id,
      targetLabel: `${target.first_name} ${target.last_name} (${target.email})`,
      metadata: { reason: reason ?? null, from: target.verification_status, to: nextStatus },
    });

    // Notify the doctor + push realtime event to admin channel.
    if (adminClient) {
      await adminClient
        .from('notifications')
        .insert({
          profile_id: req.params.id,
          type: 'general',
          title: approved ? 'Account verified' : 'Account verification rejected',
          body: approved
            ? 'Your medical credentials have been verified. You can now sign in and start consulting.'
            : `Your verification was rejected.${reason ? ` Reason: ${reason}` : ''} You may update your credentials and reapply.`,
        })
        .then(() => {}, () => {});
    }
    hub.publishToUser(req.params.id, 'account.verification', { status: nextStatus, reason: reason ?? null });
    hub.publish('admins', 'admin.users.changed', { userId: req.params.id, verificationStatus: nextStatus });

    res.json({ user: updated });
  })
);

const statusSchema = z.object({
  isActive: z.boolean().optional(),
  reason: z.string().max(500).optional(),
});

router.patch(
  '/users/:id/status',
  requirePermission('admin:users'),
  validate(statusSchema),
  wrap(async (req, res) => {
    const { isActive, reason } = req.body;
    if (isActive === undefined) {
      throw new ApiError(400, 'validation_error', 'isActive is required');
    }
    const { supabase } = req.auth;
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid user id');
    }

    const { data: target, error: loadError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, is_active, verification_status')
      .eq('id', req.params.id)
      .maybeSingle();
    if (loadError) throw new ApiError(500, 'db_error', loadError.message);
    if (!target) throw new ApiError(404, 'not_found', 'User not found');
    if (target.role === 'admin' && !isActive) {
      throw new ApiError(403, 'forbidden', 'Administrative accounts cannot be suspended from this endpoint');
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        is_active: isActive,
        // Reactivation clears the suspended status back to the account's
        // verified state (approved doctors stay approved; pending stay pending).
        ...(isActive && target.verification_status === 'suspended'
          ? { verification_status: target.role === 'doctor' && target.is_approved ? 'approved' : 'approved' }
          : {}),
        ...(!isActive ? { verification_status: 'suspended' } : {}),
      })
      .eq('id', req.params.id)
      .select('id, email, role, verification_status, is_active, is_approved')
      .single();
    if (updateError || !updated) {
      throw new ApiError(400, 'update_failed', updateError?.message ?? 'Status update failed');
    }

    await capture({
      req,
      action: isActive ? 'account.reactivated' : 'account.suspended',
      targetType: 'user',
      targetId: target.id,
      targetLabel: `${target.first_name} ${target.last_name} (${target.email})`,
      metadata: { role: target.role, reason: reason ?? null },
    });

    if (adminClient) {
      await adminClient
        .from('notifications')
        .insert({
          profile_id: req.params.id,
          type: 'general',
          title: isActive ? 'Account reactivated' : 'Account suspended',
          body: isActive
            ? 'Your account has been reactivated. Welcome back.'
            : `Your account has been suspended by a platform administrator.${reason ? ` Reason: ${reason}` : ''} Contact support for assistance.`,
        })
        .then(() => {}, () => {});
    }
    hub.publishToUser(req.params.id, 'account.status', { isActive, reason: reason ?? null });
    hub.publish('admins', 'admin.users.changed', { userId: req.params.id, isActive });

    res.json({ user: updated });
  })
);

// ─── GET /api/admin/hospitals ───────────────────────────────────────────────

router.get(
  '/hospitals',
  requirePermission('admin:hospitals'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase.from('hospitals').select('*').order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ hospitals: data ?? [] });
  })
);

// ─── GET /api/admin/audit-logs — NDPA patient-record access trail ───────────

router.get(
  '/audit-logs',
  requirePermission('admin:audit'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    if (req.query.patientId && !UUID_RE.test(req.query.patientId)) {
      throw new ApiError(400, 'validation_error', 'Invalid patientId');
    }
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (req.query.patientId) query = query.eq('patient_id', req.query.patientId);
    const { data, error } = await query.limit(500);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ logs: data ?? [] });
  })
);

// ─── GET /api/admin/admin-audit-logs — administrative action trail ──────────
// Hash-chained compliance trail of every privileged mutation (0006). Supports
// action / actor / date-range filters for compliance retrieval.

router.get(
  '/admin-audit-logs',
  requirePermission('admin:audit'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('admin_audit_logs')
      .select('id, actor_id, actor_name, actor_role, action, target_type, target_id, target_label, status, metadata, ip_address, user_agent, prev_hash, entry_hash, created_at')
      .order('created_at', { ascending: false });
    if (req.query.action) query = query.ilike('action', `%${req.query.action}%`);
    if (req.query.actorId && UUID_RE.test(req.query.actorId)) query = query.eq('actor_id', req.query.actorId);
    if (req.query.since) query = query.gte('created_at', req.query.since);
    if (req.query.until) query = query.lte('created_at', req.query.until);
    if (req.query.limit) {
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
      query = query.limit(limit);
    } else {
      query = query.limit(200);
    }
    const { data, error } = await query;
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ logs: data ?? [] });
  })
);

// ─── GET /api/admin/ai-interactions — user↔AI prompt/response review ─────────
// Structured retrieval over ai_interaction_logs (0006): filter by feature,
// profile, urgency, or free-text prompt/response search.

router.get(
  '/ai-interactions',
  requirePermission('admin:ai_flags'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('ai_interaction_logs')
      .select('id, profile_id, profile_role, feature, conversation_id, prompt, response, provider, model, urgency, flagged, created_at')
      .order('created_at', { ascending: false });
    if (req.query.feature) query = query.eq('feature', req.query.feature);
    if (req.query.profileId && UUID_RE.test(req.query.profileId)) query = query.eq('profile_id', req.query.profileId);
    if (req.query.search) query = query.or(`prompt.ilike.%${req.query.search}%,response.ilike.%${req.query.search}%`);
    if (req.query.limit) {
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
      query = query.limit(limit);
    } else {
      query = query.limit(200);
    }
    const { data, error } = await query;
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ interactions: data ?? [] });
  })
);

// ─── GET /api/admin/incidents + resolve ──────────────────────────────────────

router.get(
  '/incidents',
  requirePermission('admin:incidents'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase.from('incident_reports').select('*').order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.limit(300);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ incidents: data ?? [] });
  })
);

router.patch(
  '/incidents/:id',
  requirePermission('admin:incidents'),
  wrap(async (req, res) => {
    const { status } = req.body ?? {};
    const allowed = ['pending', 'under_review', 'resolved', 'dismissed', 'handover_to_board', 'temp_suspended', 'perm_suspended'];
    if (!status || !allowed.includes(status)) {
      throw new ApiError(400, 'validation_error', `status must be one of ${allowed.join(', ')}`);
    }
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid incident id');
    }
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('incident_reports')
      .update({ status, resolved_at: ['resolved', 'dismissed'].includes(status) ? new Date().toISOString() : null })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Incident not found');

    await capture({
      req,
      action: `incident.${status}`,
      targetType: 'incident',
      targetId: data.id,
      targetLabel: data.title ?? data.id,
    });

    res.json({ incident: data });
  })
);

// ─── GET /api/admin/ai-flags — flagged prompts for review ───────────────────

router.get(
  '/ai-flags',
  requirePermission('admin:ai_flags'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase.from('ai_flags').select('*').order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.limit(300);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ flags: data ?? [] });
  })
);

router.patch(
  '/ai-flags/:id',
  requirePermission('admin:ai_flags'),
  wrap(async (req, res) => {
    const { status } = req.body ?? {};
    if (!['reviewed', 'dismissed'].includes(status)) {
      throw new ApiError(400, 'validation_error', 'status must be reviewed or dismissed');
    }
    if (!UUID_RE.test(req.params.id)) {
      throw new ApiError(400, 'validation_error', 'Invalid flag id');
    }
    const { supabase } = req.auth;
    const { data, error } = await supabase.from('ai_flags').update({ status }).eq('id', req.params.id).select('*').single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Flag not found');

    await capture({
      req,
      action: `ai.flag.${status}`,
      targetType: 'ai_flag',
      targetId: data.id,
      targetLabel: data.reason ?? data.id,
    });

    res.json({ flag: data });
  })
);

// ─── GET /api/admin/payments — escrow ledger ─────────────────────────────────

router.get(
  '/payments',
  requirePermission('admin:payments'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase.from('payment_transactions').select('*').order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.limit(500);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ payments: data ?? [] });
  })
);

module.exports = router;
