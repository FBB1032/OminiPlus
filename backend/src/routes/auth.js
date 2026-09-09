/**
 * Session/profile route — the "who am I" endpoint used by every client after
 * login. Delegates to the shared get_my_session() RPC for a consistent shape.
 */

const express = require('express');
const { wrap, ApiError } = require('../middleware/errors');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

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
