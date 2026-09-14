/**
 * Account registration service — role-aware activation policy.
 *
 *   • Patient → immediately active. The email-verification step is bypassed:
 *     GoTrue's `email_confirm` is set to true server-side via the admin API,
 *     and the profile is marked approved, so the patient can use the app
 *     the moment registration returns.
 *   • Doctor  → created with verification_status='pending'. The account is
 *     usable for login only AFTER the super admin approves it (the MDCN
 *     lock in check_login_eligibility enforces this at login time).
 *   • Privileged roles (admin, hospital_admin, ...) are never creatable via
 *     self-signup — they are provisioned out-of-band (0005 hardening).
 */

const config = require('../config');
const logger = require('../config/logger');
const { adminClient } = require('../config/supabase');
const { ApiError } = require('../middleware/errors');

const SELF_SIGNUP_ROLES = new Set(['patient', 'doctor']);

/**
 * Log an audit entry for account creation/events.
 * Uses the log_audit_entry function which is safe to call from the service role.
 */
async function logAccountCreation({ req, userId, role, fullName, action }) {
  try {
    const entry = {
      p_patient_id: role === 'patient' ? userId : null,
      p_actor_id: userId,
      p_action: action,
      p_record_id: userId,
      p_record_name: fullName,
      p_record_category: role === 'patient' ? 'patient_profile' : 'doctor_profile',
      p_ip_address: req?.ip ?? null,
      p_device: (req?.headers?.['user-agent'] ?? '').slice(0, 200) || null,
    };
    const { data, error } = await adminClient.rpc('log_audit_entry', entry);
    if (error) {
      logger.warn('audit log creation warning', { userId, error: error.message });
    }
  } catch (err) {
    logger.warn('audit log creation exception', { userId, message: err.message });
  }
}

/**
 * Create a new account end-to-end.
 * @param {object} opts
 * @param {object} opts.payload  { email, password, firstName, lastName, role, phone? }
 * @param {object} [opts.req]    Express request (for error logging and audit)
 * @returns {Promise<{user: object}>} the created GoTrue user
 */
async function registerAccount({ payload, req }) {
  const { email, password, firstName, lastName, role, phone } = payload;
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!SELF_SIGNUP_ROLES.has(role)) {
    throw new ApiError(403, 'forbidden', `Role '${role}' cannot self-register. Contact the platform administrator.`);
  }
  if (!adminClient) {
    throw new ApiError(503, 'unavailable', 'Registration is temporarily unavailable — server not fully configured');
  }

  // 1. Create the GoTrue user with email_confirm: true — this is the
  //    server-side email-verification bypass (patients activate instantly;
  //    doctors are gated by the admin verification workflow instead).
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone: phone ?? null,
    },
  });
  if (createError) {
    if (createError.message?.toLowerCase().includes('already registered')) {
      throw new ApiError(409, 'email_taken', 'An account with this email already exists.');
    }
    throw new ApiError(400, 'registration_failed', createError.message);
  }

  const userId = created.user.id;

  // 2. Apply the role-aware activation policy to the profiles row
  const isPatient = role === 'patient';
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      role,
      phone: phone ?? null,
      is_active: true,
      // Patients: immediately usable. Doctors: blocked at login until approved.
      is_approved: isPatient,
      verification_status: isPatient ? 'approved' : 'pending',
    })
    .eq('id', userId);
  if (profileError) {
    logger.error('profile activation update failed', { userId, message: profileError.message });
    // The account exists; surface a specific failure rather than a generic 500.
    throw new ApiError(500, 'profile_activation_failed', 'Account created but activation failed. Contact support.');
  }

  // 3. Seed the role-specific profile row (patient_profiles / doctor_profiles
  //    minimal stubs so downstream screens have a row to build on).
  //    Must succeed — the system must avoid creating an authentication account
  //    without its corresponding database profile, or vice versa.
  if (isPatient) {
    const { error: patientErr } = await adminClient
      .from('patient_profiles')
      .upsert({ profile_id: userId }, { onConflict: 'profile_id' });
    if (patientErr) {
      logger.error('patient profile seed failed', { userId, message: patientErr.message });
      // Rollback: delete the GoTrue user since the profile could not be created
      await adminClient.auth.admin.deleteUser(userId);
      throw new ApiError(500, 'profile_activation_failed', 'Account creation failed — patient profile could not be created. Contact support.');
    }
    // Log patient creation audit trail
    await logAccountCreation({ req, userId, role: 'patient', fullName: `${firstName} ${lastName}`, action: 'patient_created' });
  } else {
    const { error: doctorErr } = await adminClient
      .from('doctor_profiles')
      .upsert(
        {
          profile_id: userId,
          specialization: payload.specialization ?? 'General Medicine',
          license_number: payload.licenseNumber ?? `PENDING-${userId.slice(0, 8)}`,
        },
        { onConflict: 'profile_id' }
      );
    if (doctorErr) {
      logger.error('doctor profile seed failed', { userId, message: doctorErr.message });
      // Rollback: delete the GoTrue user since the profile could not be created
      await adminClient.auth.admin.deleteUser(userId);
      throw new ApiError(500, 'profile_activation_failed', 'Account creation failed — doctor profile could not be created. Contact support.');
    }
    // Log doctor creation audit trail
    await logAccountCreation({ req, userId, role: 'doctor', fullName: `${firstName} ${lastName}`, action: 'doctor_created' });
  }

  logger.info('account registered', { userId, role, immediateActivation: isPatient });
  return { user: { ...created.user, role, verification_status: isPatient ? 'approved' : 'pending' } };
}

module.exports = { registerAccount, logAccountCreation };
