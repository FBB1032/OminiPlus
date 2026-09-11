/**
 * Vitals + chronic care routes — manual and wearable readings with the
 * rule-based sentinel evaluation on every write.
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');
const sentinel = require('../ai/sentinel');

const router = express.Router();

const readingSchema = z.object({
  patientId: z.string().uuid(),
  condition: z.enum(['hypertension', 'diabetes', 'asthma', 'pregnancy']).nullable().optional(),
  readingType: z.enum(['blood_pressure', 'blood_glucose', 'peak_flow', 'pregnancy_log', 'heart_rate', 'spo2', 'weight']),
  systolic: z.number().int().min(50).max(300).nullable().optional(),
  diastolic: z.number().int().min(20).max(200).nullable().optional(),
  pulse: z.number().int().min(20).max(250).nullable().optional(),
  value: z.number().min(0).max(1000).nullable().optional(),
  category: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  recordedAt: z.string().datetime().optional(),
});

router.use(authenticate);

// ─── POST /api/vitals — record a reading (runs sentinel) ──────────────────────

router.post(
  '/',
  requirePermission('vitals:write'),
  validate(readingSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const b = req.body;

    const { data, error } = await supabase
      .from('vitals_readings')
      .insert({
        patient_id: b.patientId,
        condition: b.condition ?? null,
        reading_type: b.readingType,
        systolic: b.systolic ?? null,
        diastolic: b.diastolic ?? null,
        pulse: b.pulse ?? null,
        value: b.value ?? null,
        category: b.category ?? null,
        notes: b.notes ?? null,
        recorded_at: b.recordedAt ?? new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw new ApiError(400, 'insert_failed', error.message);

    const { alerts } = sentinel.evaluateReading(data);
    if (alerts.length > 0) {
      // Attach sentinel analysis to the response. Notifications are written via
      // the service-role client: the only INSERT policy on notifications is
      // admin-gated, so the user-scoped client would silently fail RLS.
      const { adminClient } = require('../config/supabase');
      if (adminClient) {
        const patientProfile = await supabase
          .from('patient_profiles')
          .select('profile_id')
          .eq('id', b.patientId)
          .maybeSingle();
        if (patientProfile.data) {
          for (const a of alerts) {
            adminClient
              .from('notifications')
              .insert({
                profile_id: patientProfile.data.profile_id,
                type: 'general',
                title: a.severity === 'critical' ? 'Critical Vitals Alert' : 'Vitals Check',
                body: a.message,
              })
              .then(() => {}, () => {});
          }
        }
      }
    }

    res.status(201).json({ reading: data, sentinelAlerts: alerts });
  })
);

// ─── GET /api/vitals?patientId=&type= ───────────────────────────────────────

router.get(
  '/',
  requirePermission('vitals:read'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    // Malformed uuid query params would 500 at the db layer — 400 instead.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (req.query.patientId && !UUID_RE.test(req.query.patientId)) {
      throw new ApiError(400, 'validation_error', 'Invalid patientId');
    }
    let query = supabase
      .from('vitals_readings')
      .select('*')
      .order('recorded_at', { ascending: false });
    if (req.query.patientId) query = query.eq('patient_id', req.query.patientId);
    if (req.query.type) query = query.eq('reading_type', req.query.type);
    const { data, error } = await query.limit(500);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ readings: data ?? [] });
  })
);

module.exports = router;
