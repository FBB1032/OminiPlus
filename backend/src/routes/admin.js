/**
 * Platform admin routes — dashboard stats, user management, hospitals,
 * audit trail, incidents, AI flags, payments. Admin-only (RLS enforces
 * row visibility; the permission matrix guards these endpoints).
 */

const express = require('express');
const { wrap, ApiError } = require('../middleware/errors');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

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

// ─── PATCH /api/admin/users/:id/status — suspend/reactivate ──────────────────

router.patch(
  '/users/:id/status',
  requirePermission('admin:users'),
  wrap(async (req, res) => {
    const { isActive, verificationStatus } = req.body ?? {};
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(isActive !== undefined ? { is_active: isActive } : {}),
        ...(verificationStatus ? { verification_status: verificationStatus } : {}),
      })
      .eq('id', req.params.id)
      .select('id, is_active, verification_status')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'User not found');
    res.json({ user: data });
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

// ─── GET /api/admin/audit-logs ──────────────────────────────────────────────

router.get(
  '/audit-logs',
  requirePermission('admin:audit'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (req.query.patientId) query = query.eq('patient_id', req.query.patientId);
    const { data, error } = await query.limit(500);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ logs: data ?? [] });
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
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('incident_reports')
      .update({ status, resolved_at: ['resolved', 'dismissed'].includes(status) ? new Date().toISOString() : null })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Incident not found');
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
    const { supabase } = req.auth;
    const { data, error } = await supabase.from('ai_flags').update({ status }).eq('id', req.params.id).select('*').single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Flag not found');
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
