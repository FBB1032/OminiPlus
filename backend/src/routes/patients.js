/**
 * Patients routes — patient profile + clinical data access for the mobile app
 * and clinical staff (RLS-scoped).
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// ─── GET /api/patients/me — own patient profile ──────────────────────────────

router.get(
  '/me',
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('profile_id', req.auth.userId)
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'No patient profile for this account');
    res.json({ patient: data });
  })
);

// ─── GET /api/patients/:id — clinical staff lookup ───────────────────────────

router.get(
  '/:id',
  requirePermission('patients:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Patient not found (or not visible to your role)');
    res.json({ patient: data });
  })
);

// ─── GET /api/patients/:id/records — medical records ─────────────────────────

router.get(
  '/:id/records',
  requirePermission('medical_records:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', req.params.id)
      .order('date', { ascending: false });
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ records: data ?? [] });
  })
);

// ─── POST /api/patients/:id/records — add a record (doctor/admin/lab) ────────

const recordSchema = z.object({
  type: z.enum(['lab_result', 'imaging', 'diagnosis', 'surgery', 'vaccination', 'allergy', 'other']),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  doctorId: z.string().uuid().nullable().optional(),
  doctorName: z.string().max(200).optional(),
  attachmentUrl: z.string().url().nullable().optional(),
  visibility: z.enum(['all', 'patient_only']).default('all'),
});

router.post(
  '/:id/records',
  requirePermission('medical_records:create'),
  validate(recordSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: req.params.id,
        type: req.body.type,
        title: req.body.title,
        description: req.body.description ?? null,
        date: req.body.date ?? new Date().toISOString().slice(0, 10),
        doctor_id: req.body.doctorId ?? null,
        doctor_name: req.body.doctorName ?? null,
        attachment_url: req.body.attachmentUrl ?? null,
        visibility: req.body.visibility,
      })
      .select('*')
      .single();
    if (error) throw new ApiError(400, 'insert_failed', error.message);

    // NDPA audit trail (insert-only table)
    await supabase.rpc('log_audit_entry', {
      p_patient_id: req.params.id,
      p_actor_id: req.auth.userId,
      p_action: 'edit',
      p_record_id: data.id,
      p_record_name: data.title,
      p_record_category: 'medical_history',
      p_ip_address: req.ip ?? null,
      p_device: req.headers['user-agent']?.slice(0, 200) ?? null,
    }).then(() => {}, () => {});

    res.status(201).json({ record: data });
  })
);

// ─── GET /api/patients/:id/consents — NDPA consent grants ───────────────────

router.get(
  '/:id/consents',
  requirePermission('patients:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('consent_grants')
      .select('*')
      .eq('patient_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ consents: data ?? [] });
  })
);

module.exports = router;
