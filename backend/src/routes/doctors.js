/**
 * Doctors routes — public directory, availability, admin verification.
 */

const express = require('express');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requirePermission('doctors:read'));

// ─── GET /api/doctors?specialization=&available= ─────────────────────────────

router.get(
  '/',
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    let query = supabase
      .from('doctor_profiles')
      .select(
        `id, specialization, bio, experience_years, clinic_name, clinic_address,
         consultation_fee, rating, review_count, is_available, availability_status,
         is_mdcn_verified, hospital:hospital_id (id, name, city, state),
         profile:profile_id (id, first_name, last_name, avatar_url)`
      )
      .order('rating', { ascending: false });
    if (req.query.specialization) query = query.eq('specialization', req.query.specialization);
    if (req.query.available === 'true') query = query.eq('is_available', true);
    if (req.query.mdcn === 'true') query = query.eq('is_mdcn_verified', true);

    const { data, error } = await query.limit(100);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ doctors: data ?? [] });
  })
);

// ─── GET /api/doctors/me — own doctor profile ────────────────────────────────

router.get(
  '/me',
  requirePermission('doctors:manage_availability'),
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('profile_id', req.auth.userId)
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'No doctor profile for this account');
    res.json({ doctor: data });
  })
);

// ─── PUT /api/doctors/me/working-hours ───────────────────────────────────────

const workingHoursSchema = z.object({
  entries: z
    .array(
      z.object({
        day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        isActive: z.boolean().default(true),
        slotDuration: z.number().int().min(10).max(120).default(30),
      })
    )
    .min(1)
    .max(7),
});

router.put(
  '/me/working-hours',
  requirePermission('doctors:manage_availability'),
  validate(workingHoursSchema),
  wrap(async (req, res) => {
    const { supabase } = req.auth;

    const { data: doctor, error: docErr } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('profile_id', req.auth.userId)
      .single();
    if (docErr || !doctor) throw new ApiError(404, 'not_found', 'No doctor profile for this account');

    for (const e of req.body.entries) {
      const { error } = await supabase.from('doctor_working_hours').upsert(
        {
          doctor_id: doctor.id,
          day: e.day,
          start_time: e.startTime,
          end_time: e.endTime,
          is_active: e.isActive,
          slot_duration: e.slotDuration,
        },
        { onConflict: 'doctor_id,day' }
      );
      if (error) throw new ApiError(400, 'upsert_failed', error.message);
    }
    const { data } = await supabase.from('doctor_working_hours').select('*').eq('doctor_id', doctor.id);
    res.json({ workingHours: data ?? [] });
  })
);

// ─── PATCH /api/doctors/:id/verify — admin MDCN verification ─────────────────

router.patch(
  '/:id/verify',
  requirePermission('doctors:verify'),
  wrap(async (req, res) => {
    const { approve, licenseExpiryDate } = req.body ?? {};
    const { supabase } = req.auth;

    const { data, error } = await supabase
      .from('doctor_profiles')
      .update({
        is_mdcn_verified: approve === true,
        ...(licenseExpiryDate ? { license_expiry_date: licenseExpiryDate } : {}),
      })
      .eq('id', req.params.id)
      .select('id, is_mdcn_verified')
      .single();
    if (error || !data) throw new ApiError(404, 'not_found', 'Doctor not found');

    // Sync the profile verification_status so login gating sees the change
    const { data: profile } = await supabase.from('doctor_profiles').select('profile_id').eq('id', req.params.id).single();
    if (profile) {
      await supabase
        .from('profiles')
        .update({
          verification_status: approve === true ? 'approved' : 'pending',
          is_approved: approve === true,
        })
        .eq('id', profile.profile_id);
    }
    res.json({ doctor: data });
  })
);

module.exports = router;
