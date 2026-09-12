/**
 * Auth routes — registration (role-aware activation) + session/profile.
 * Login itself is handled by Supabase GoTrue (clients call it directly);
 * these endpoints cover account creation and the "who am I" contract.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { wrap, ApiError } = require('../middleware/errors');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { registerAccount } = require('../services/accountProvisioning');
const { capture } = require('../services/adminAudit');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Registration is a sensitive public endpoint — throttle harder than the
// global limiter to blunt credential stuffing and bot signups.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'rate_limited', message: 'Too many registration attempts. Try again later.' } },
});

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['patient', 'doctor']),
  phone: z.string().max(30).optional(),
  // Doctor onboarding metadata (stored on doctor_profiles stub)
  specialization: z.string().max(120).optional(),
  licenseNumber: z.string().max(60).optional(),
});

// ─── POST /api/auth/register — role-aware account creation ─────────────────
//
// Patients: email verification bypassed (email_confirm: true) + immediate
// activation — the account is usable as soon as this returns.
// Doctors: created pending — usable only after super-admin approval.

router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  wrap(async (req, res) => {
    const { user } = await registerAccount({ payload: req.body, req });
    const isPatient = req.body.role === 'patient';

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        verificationStatus: isPatient ? 'approved' : 'pending',
        isActive: true,
      },
      // Doctors wait for approval; patients can sign in immediately.
      requiresAdminApproval: !isPatient,
    });
  })
);

router.get(
  '/me',
  authenticate,
  wrap(async (req, res) => {
    const { supabase } = req.auth;
    const { data, error } = await supabase.rpc('get_my_session');
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Session not found');
    res.json(data);
  })
);

// ─── GET /api/auth/eligibility/:email — pre-login gate (public, no leak) ─────

router.get(
  '/eligibility/:email',
  wrap(async (req, res) => {
    const { adminClient } = require('../config/supabase');
    if (!adminClient) throw new ApiError(503, 'unavailable', 'Server not fully configured');
    const { data, error } = await adminClient.rpc('check_login_eligibility', {
      p_email: decodeURIComponent(req.params.email),
    });
    if (error) throw new ApiError(500, 'db_error', error.message);
    // Do not leak account existence to anonymous callers:
    if (!data || data.allowed === false) {
      return res.json({ allowed: false, reason: 'account_not_found' });
    }
    res.json(data);
  })
);

module.exports = router;
