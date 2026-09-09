/**
 * Appointments routes — booking, approval, completion with escrow release.
 * All queries go through the user's JWT so RLS applies.
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

const createSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  type: z.enum(['in_person', 'video', 'phone']).default('video'),
  reason: z.string().min(5).max(2000),
});

router.use(authenticate, requirePermission('appointments:read'));

// ─── GET /api/appointments?status=&upcoming= ─────────────────────────────────

router.get(
  '/',
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('appointments')
      .select(
        `id, scheduled_at, duration, status, type, reason, payment_status,
         doctor:doctor_id (id, specialization, consultation_fee, profile:doctor_profiles!doctor_profiles_profile_id_fkey(first_name, last_name)),
         patient:patient_id (id, profile:patient_profiles!patient_profiles_profile_id_fkey(first_name, last_name))`
      )
      .order('scheduled_at', { ascending: true });
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.upcoming === 'true') query = query.gte('scheduled_at', new Date().toISOString());
    if (req.query.from) query = query.gte('scheduled_at', req.query.from);
    if (req.query.to) query = query.lte('scheduled_at', req.query.to);

    const { data, error } = await query.limit(200);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ appointments: data ?? [] });
  })
);

// ─── POST /api/appointments — book ───────────────────────────────────────────

router.post(
  '/',
  requirePermission('appointments:create'),
  validate(createSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;

    // Server-side double-booking guard (RLS + unique constraint back this up)
    const { data: clash } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', req.body.doctorId)
      .eq('scheduled_at', req.body.scheduledAt)
      .maybeSingle();
    if (clash) throw new ApiError(409, 'slot_taken', 'That slot has just been booked. Pick another.');

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: req.body.doctorId,
        patient_id: req.body.patientId,
        scheduled_at: req.body.scheduledAt,
        type: req.body.type,
        reason: req.body.reason,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw new ApiError(400, 'booking_failed', error.message);

    res.status(201).json({ appointment: data });
  })
);

// ─── PATCH /api/appointments/:id — approve / cancel / reschedule ─────────────

router.patch(
  '/:id',
  requirePermission('appointments:update'),
  wrap(async (req, res) => {
    const allowed = ['scheduled', 'cancelled', 'no_show', 'approved'];
    const status = req.body?.status;
    if (!status || !allowed.includes(status)) {
      throw new ApiError(400, 'validation_error', `status must be one of ${allowed.join(', ')}`);
    }
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, ...(req.body.cancellationReason ? { cancellation_reason: req.body.cancellationReason } : {}) })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error || !data) throw new ApiError(404, 'not_found', 'Appointment not found or not updatable');
    res.json({ appointment: data });
  })
);

// ─── POST /api/appointments/:id/complete — atomic escrow release ─────────────

router.post(
  '/:id/complete',
  requirePermission('appointments:complete'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase.rpc('complete_appointment_and_release_escrow', {
      p_appointment_id: req.params.id,
    });
    if (error) throw new ApiError(400, 'complete_failed', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Appointment not found');
    res.json({ completed: true, appointmentId: req.params.id });
  })
);

// ─── GET /api/appointments/slots/:doctorId/:date — shared availability ───────

router.get(
  '/slots/:doctorId/:date',
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase.rpc('get_available_slots', {
      p_doctor_id: req.params.doctorId,
      p_date: req.params.date,
    });
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ slots: data ?? [] });
  })
);

module.exports = router;
