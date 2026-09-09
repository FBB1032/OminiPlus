/**
 * Authentication + authorization middleware.
 *
 * Auth flow:
 *   1. Client sends its Supabase JWT in `Authorization: Bearer <token>`.
 *   2. `verifyToken` validates it against Supabase GoTrue.
 *   3. The `profiles` row is loaded once and cached on `req.auth` —
 *      downstream handlers read role / hospital scoping from it.
 *
 * Because requests carry the user's JWT into Supabase, RLS filters every
 * query server-side too: even a buggy route handler cannot leak rows the
 * role is not entitled to see.
 */

const { verifyToken } = require('../config/supabase');
const { hasPermission } = require('../rbac/permissions');
const { ApiError } = require('./errors');

/**
 * Attach req.auth = { userId, profile, supabase } for valid JWTs.
 * Not a guard by itself — pair with requirePermission.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'unauthorized', 'Missing Authorization header');

    const { user, error } = await verifyToken(token);
    if (error || !user) throw new ApiError(401, 'unauthorized', error ?? 'Invalid token');

    // Load the profile row (role, verification status) via a user-scoped client
    const supabase = req.supabase(token);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      throw new ApiError(403, 'forbidden', 'No profile found for this account');
    }
    if (profile.is_active === false) {
      throw new ApiError(403, 'forbidden', 'Account is deactivated');
    }
    if (profile.verification_status === 'suspended') {
      throw new ApiError(403, 'forbidden', 'Account is suspended');
    }

    req.auth = {
      userId: user.id,
      token,
      supabase,
      profile,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Route guard: require one or more permissions (any-of semantics).
 * Usage: router.post('/verify', authenticate, requirePermission('doctors:verify'), handler)
 */
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.auth) return next(new ApiError(401, 'unauthorized', 'Not authenticated'));
    const role = req.auth.profile.role;
    const ok = permissions.some((p) => hasPermission(role, p));
    if (!ok) {
      return next(
        new ApiError(403, 'forbidden', `Role '${role}' is not permitted to perform this action`)
      );
    }
    next();
  };
}

/**
 * Restrict a route to specific roles (stricter than permission check).
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) return next(new ApiError(401, 'unauthorized', 'Not authenticated'));
    if (!roles.includes(req.auth.profile.role)) {
      return next(new ApiError(403, 'forbidden', `Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}

/**
 * Hospital scoping helper — resolves the hospital_id(s) a staff member may
 * act on. hospital_admin/nurse/etc. get their own hospitals; platform admins
 * get null (unscoped).
 */
async function resolveHospitalScope(req) {
  const { profile, supabase } = req.auth;
  if (profile.role === 'admin') return null; // unscoped — platform-wide

  const { data, error } = await supabase
    .from('hospital_staff')
    .select('hospital_id')
    .eq('profile_id', profile.id)
    .eq('status', 'active');
  if (error) throw new ApiError(500, 'db_error', error.message);
  return (data ?? []).map((r) => r.hospital_id);
}

module.exports = { authenticate, requirePermission, requireRole, resolveHospitalScope };
