/**
 * Hospital operations routes — beds, pharmacy, lab, blood bank.
 * Scoped by the caller's hospital_staff membership (enforced by RLS and
 * double-checked via resolveHospitalScope).
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission, resolveHospitalScope } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requirePermission('hospital:read'));

// ─── Beds ────────────────────────────────────────────────────────────────────

router.get(
  '/beds',
  requirePermission('beds:read'),
  wrap(async (req, res) => {
    const scope = await resolveHospitalScope(req);
    const { supabase } = req.auth;
    let query = supabase
      .from('hospital_beds')
      .select('*')
      .order('ward')
      .order('bed_number');
    if (scope) {
      if (scope.length === 0) return res.json({ beds: [] });
      query = query.in('hospital_id', scope);
    }
    const { data, error } = await query;
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ beds: data ?? [] });
  })
);

const admitSchema = z.object({
  bedId: z.string().uuid(),
  patientName: z.string().min(1).max(200),
  patientId: z.string().uuid().nullable().optional(),
  diagnosis: z.string().max(500).optional(),
  assignedNurseId: z.string().uuid().nullable().optional(),
});

router.post(
  '/beds/:id/admit',
  requirePermission('beds:write'),
  validate(admitSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('hospital_beds')
      .update({
        status: 'occupied',
        current_patient_name: req.body.patientName,
        current_patient_id: req.body.patientId ?? null,
        diagnosis: req.body.diagnosis ?? null,
        assigned_nurse_id: req.body.assignedNurseId ?? null,
        admission_date: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'admit_failed', error?.message ?? 'Bed not found');
    res.json({ bed: data });
  })
);

router.post(
  '/beds/:id/discharge',
  requirePermission('beds:write'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('hospital_beds')
      .update({
        status: 'cleaning_required',
        current_patient_name: null,
        current_patient_id: null,
        diagnosis: null,
        assigned_nurse_id: null,
        admission_date: null,
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'discharge_failed', error?.message ?? 'Bed not found');
    res.json({ bed: data });
  })
);

// ─── Pharmacy ────────────────────────────────────────────────────────────────

router.get(
  '/pharmacy/queue',
  requirePermission('pharmacy:read'),
  wrap(async (req, res) => {
    const scope = await resolveHospitalScope(req);
    const { supabase } = req.auth;
    let query = supabase
      .from('pharmacy_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.limit(200);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ orders: data ?? [] });
  })
);

router.post(
  '/pharmacy/orders/:id/dispense',
  requirePermission('pharmacy:write'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('pharmacy_orders')
      .update({ status: 'dispensed', dispensed_by: req.auth.userId, dispensed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'dispense_failed', error?.message ?? 'Order not found');
    res.json({ order: data });
  })
);

router.get(
  '/pharmacy/inventory',
  requirePermission('pharmacy:read'),
  wrap(async (req, res) => {
    const scope = await resolveHospitalScope(req);
    const { supabase } = req.auth;
    let query = supabase.from('medication_items').select('*').order('name');
    if (scope) {
      if (scope.length === 0) return res.json({ medications: [] });
      query = query.in('hospital_id', scope);
    }
    const { data, error } = await query;
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ medications: data ?? [] });
  })
);

// ─── Laboratory ───────────────────────────────────────────────────────────────

router.get(
  '/lab/orders',
  requirePermission('lab:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase.from('lab_orders').select('*').order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.urgency) query = query.eq('urgency', req.query.urgency);
    const { data, error } = await query.limit(200);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ orders: data ?? [] });
  })
);

const labResultSchema = z.object({
  resultsSummary: z.string().min(1).max(2000),
  normalRange: z.string().max(200).optional(),
  findings: z.string().max(4000).optional(),
  status: z.enum(['sample_collected', 'in_testing', 'results_ready', 'verified']).default('results_ready'),
});

router.post(
  '/lab/orders/:id/results',
  requirePermission('lab:write'),
  validate(labResultSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const status = req.body.status === 'verified' ? 'verified' : req.body.status;
    const { data, error } = await supabase
      .from('lab_orders')
      .update({
        results_summary: req.body.resultsSummary,
        normal_range: req.body.normalRange ?? null,
        findings: req.body.findings ?? null,
        status,
        ...(status === 'verified' ? { technician_id: req.auth.userId, verified_at: new Date().toISOString() } : {}),
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'results_failed', error?.message ?? 'Order not found');
    res.json({ order: data });
  })
);

// ─── Blood bank ──────────────────────────────────────────────────────────────

router.get(
  '/blood/requests',
  requirePermission('blood:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase.from('blood_requests').select('*').order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query.limit(200);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ requests: data ?? [] });
  })
);

router.post(
  '/blood/requests/:id/status',
  requirePermission('blood:write'),
  wrap(async (req, res) => {
    const { status } = req.body ?? {};
    const allowed = ['hospital_confirmed', 'ominipulse_verified', 'donors_notified', 'screening_scheduled', 'fulfilled', 'closed'];
    if (!status || !allowed.includes(status)) {
      throw new ApiError(400, 'validation_error', `status must be one of ${allowed.join(', ')}`);
    }
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('blood_requests')
      .update({ status })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Request not found');
    res.json({ request: data });
  })
);

// ─── Blood donor registry (admin verification console) ────────────────────────

router.get(
  '/blood/donors',
  requirePermission('blood:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('blood_donors')
      .select('*')
      .order('verification_submitted_at', { ascending: false, nullsFirst: false });
    if (req.query.status) query = query.eq('partner_status', req.query.status);
    const { data, error } = await query.limit(300);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ donors: data ?? [] });
  })
);

router.patch(
  '/blood/donors/:id/status',
  requirePermission('blood:write'),
  wrap(async (req, res) => {
    const { partnerStatus, rejectionReason } = req.body ?? {};
    const allowed = ['active', 'pending', 'suspended', 'rejected'];
    if (!partnerStatus || !allowed.includes(partnerStatus)) {
      throw new ApiError(400, 'validation_error', `partnerStatus must be one of ${allowed.join(', ')}`);
    }
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('blood_donors')
      .update({
        partner_status: partnerStatus,
        verification_reviewed_at: new Date().toISOString(),
        rejection_reason: partnerStatus === 'rejected' ? (rejectionReason ?? 'Verification rejected') : null,
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Donor not found');
    res.json({ donor: data });
  })
);

router.patch(
  '/blood/donors/:id/status',
  requirePermission('blood:write'),
  wrap(async (req, res) => {
    const { partnerStatus, rejectionReason } = req.body ?? {};
    const allowed = ['active', 'pending', 'suspended', 'rejected'];
    if (!partnerStatus || !allowed.includes(partnerStatus)) {
      throw new ApiError(400, 'validation_error', `partnerStatus must be one of ${allowed.join(', ')}`);
    }
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('blood_donors')
      .update({
        partner_status: partnerStatus,
        verification_reviewed_at: new Date().toISOString(),
        rejection_reason: partnerStatus === 'rejected' ? (rejectionReason ?? 'Verification rejected') : null,
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(400, 'update_failed', error?.message ?? 'Donor not found');
    res.json({ donor: data });
  })
);

module.exports = router;
