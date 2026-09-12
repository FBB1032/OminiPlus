/**
 * RBAC permission matrix — the single source of truth for route-level
 * authorization in the Express layer.
 *
 * It mirrors (never replaces) the database RLS policies in
 * supabase/migrations/0002_rls_policies.sql: RLS filters rows inside
 * PostgreSQL, this matrix guards HTTP endpoints. Defense in depth.
 *
 * Permission syntax: route = permission key; the middleware checks the
 * authenticated profile's role against the allowed set.
 */

const ROLES = [
  'patient',
  'doctor',
  'admin',
  'hospital_admin',
  'nurse',
  'receptionist',
  'blood_officer',
  'pharmacist',
  'lab_technician',
];

// All clinical/hospital staff roles (can read department queues etc.)
const HOSPITAL_STAFF = ['hospital_admin', 'nurse', 'receptionist', 'blood_officer', 'pharmacist', 'lab_technician'];

const PERMISSIONS = {
  // ─── Appointments ────────────────────────────────────────────────────────
  'appointments:read': ['patient', 'doctor', 'admin', ...HOSPITAL_STAFF],
  'appointments:create': ['patient', 'receptionist'],
  'appointments:update': ['doctor', 'admin', 'receptionist', 'patient'],
  'appointments:complete': ['doctor', 'admin'],

  // ─── Doctors & directory ─────────────────────────────────────────────────
  'doctors:read': [...ROLES],
  'doctors:verify': ['admin'],
  'doctors:suspend': ['admin'],
  'doctors:manage_availability': ['doctor'],

  // ─── Patients / clinical records ────────────────────────────────────────
  'patients:read': ['doctor', 'admin', ...HOSPITAL_STAFF],
  'medical_records:read': ['patient', 'doctor', 'admin', 'nurse', 'lab_technician'],
  'medical_records:create': ['doctor', 'admin', 'lab_technician'],
  'vitals:write': ['patient', 'nurse', 'doctor'],
  'vitals:read': ['patient', 'doctor', 'nurse', 'admin'],

  // ─── Hospital operations ────────────────────────────────────────────────
  'hospital:read': ['admin', ...HOSPITAL_STAFF, 'doctor'],
  'hospital:manage': ['admin', 'hospital_admin'],
  'beds:read': ['admin', 'hospital_admin', 'nurse', 'receptionist'],
  'beds:write': ['admin', 'hospital_admin', 'nurse'],
  'pharmacy:read': ['admin', 'hospital_admin', 'pharmacist', 'doctor'],
  'pharmacy:write': ['admin', 'hospital_admin', 'pharmacist'],
  'lab:read': ['admin', 'hospital_admin', 'lab_technician', 'doctor'],
  'lab:write': ['admin', 'hospital_admin', 'lab_technician'],
  'blood:read': ['admin', 'hospital_admin', 'blood_officer', 'receptionist'],
  'blood:write': ['admin', 'hospital_admin', 'blood_officer'],

  // ─── Platform admin console ──────────────────────────────────────────────
  'admin:dashboard': ['admin'],
  'admin:users': ['admin'],
  'admin:hospitals': ['admin'],
  'admin:audit': ['admin'],
  'admin:incidents': ['admin'],
  'admin:ai_flags': ['admin'],
  'admin:payments': ['admin'],
  'admin:notifications': ['admin'],

  // ─── AI engine ───────────────────────────────────────────────────────────
  'ai:chat': ['patient', 'doctor', 'admin'],
  'ai:clinical_cds': ['doctor', 'nurse'],
  'ai:soap': ['doctor'],
  'ai:sentinel': ['patient', 'doctor', 'nurse'],
};

/**
 * Check whether a role has a permission.
 * @param {string} role profile.role value
 * @param {string} permission key from PERMISSIONS
 */
function hasPermission(role, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) throw new Error(`Unknown permission: ${permission}`);
  return allowed.includes(role);
}

module.exports = { ROLES, HOSPITAL_STAFF, PERMISSIONS, hasPermission };
