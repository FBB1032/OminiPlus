# OminiPulse Unified Backend — Supabase Architecture

> One backend for every platform: the **Patient/Doctor mobile app** (React Native + Expo),
> the **clinical desktop + admin web app** (Next.js), and future clients all share a
> single Supabase project for the **centralized PostgreSQL database** and **user authentication**.

---

## 1. Architecture Overview

```
┌──────────────────────┐   ┌──────────────────────────┐   ┌───────────────────────────┐
│  PATIENT MOBILE APP  │   │  DOCTOR MOBILE APP       │   │  WEB / DESKTOP APP        │
│  React Native + Expo │   │  React Native + Expo     │   │  Next.js (admin/hospital/ │
│  @supabase/supabase-js│  │  @supabase/supabase-js   │   │  doctor portals, Electron)│
└──────────┬───────────┘   └──────────┬───────────────┘   │  @supabase/supabase-js    │
           │                          │                   └────────────┬──────────────┘
           └──────────────┬───────────┴────────────────────────────────┘
                          ▼
              ┌────────────────────────────────┐        ┌─────────────────────────┐
              │         SUPABASE PROJECT        │        │   EDGE FUNCTIONS        │
              │  • auth.users (GoTrue JWT)      │        │  • send-otp             │
              │  • PostgreSQL (unified schema)  │◄──────►│  • reset-password       │
              │  • RLS policies (one authz      │        │  (service_role, bypass │
              │    layer for ALL platforms)     │        │   RLS server-side)      │
              │  • Storage (avatars, documents) │        └─────────────────────────┘
              │  • Realtime (chats, beds)       │
              └────────────────────────────────┘
```

### Why Supabase as the unified backend

| Concern | Implementation |
|---|---|
| **Centralized database** | Single PostgreSQL schema (`public.*`) with 30 tables covering profiles, doctor/patient clinical data, hospital operations, pharmacy, lab, blood bank, consent, audit, and payments. |
| **User authentication** | Supabase Auth (`auth.users`). One account per person — created on mobile, usable on web, and vice versa. JWTs are issued and verified in one place. |
| **Authorization / data consistency** | Row-Level Security in the database. Both apps receive identical row visibility because policies live server-side, not in app code. |
| **Cross-platform session** | `profiles` (1:1 with `auth.users`) is auto-created by the `on_auth_user_created` trigger, carrying `role`, `verification_status`, `is_active` used by both apps to route after login. |
| **Shared business logic** | RPC functions (`get_my_session`, `check_login_eligibility`, `get_available_slots`, `complete_appointment_and_release_escrow`, `log_audit_entry`) so mobile and web compute the same results. |

---

## 2. Repository Layout

```
supabase/
├── migrations/
│   ├── 0001_unified_schema.sql    # tables, enums, triggers
│   ├── 0002_rls_policies.sql      # row-level security for every table
│   └── 0003_auth_functions.sql    # OTP, login gate, session, slots, escrow RPCs
├── functions/
│   ├── send-otp/index.ts          # edge function: issue + email reset OTP
│   └── reset-password/index.ts    # edge function: verify OTP + set password
├── seed.sql                       # dummy users + demo clinical data
└── README.md                      # this file
```

Client integration (already wired in this repo):

- Mobile: `src/services/supabaseClient.ts`, `src/services/supabaseAuthService.ts` (used by `src/services/authService.ts`)
- Desktop/Web: `desktop/src/services/supabaseClient.ts`, `desktop/src/services/supabaseAuthService.ts` (used by login + auth store)

---

## 3. Dummy Sign-in Credentials (all platforms)

> These accounts work on **both** the mobile app and the web/desktop app once
> `seed.sql` + the auth seeding steps below are applied. All demo passwords meet
> an 8+ character policy.

### 3.1 The 6 Platform Admins (web admin console)

| # | Email | Password | Name | Console area |
|---|---|---|---|---|
| 1 | `superadmin@ominipulse.ai` | `OminiAdmin2026!` | Adaora Obi | Full platform (super admin) |
| 2 | `verification@ominipulse.ai` | `VerifyAdmin2026!` | Ngozi Eze | Doctor MDCN verification |
| 3 | `support@ominipulse.ai` | `SupportAdmin2026!` | Tunde Bakare | Patient support |
| 4 | `security@ominipulse.ai` | `SecureAdmin2026!` | Halima Bello | Security & audit logs |
| 5 | `moderator@ominipulse.ai` | `Moder8Admin2026!` | Emeka Nnamdi | AI monitoring & moderation |
| 6 | `hospitalrel@ominipulse.ai` | `PartnerAdmin2026!` | Yetunde Adeyemi | Hospital onboarding / relations |

### 3.2 Doctor (mobile app + web doctor portal)

| Email | Password | Name | Specialization |
|---|---|---|---|
| `doctor@ominipulse.ai` | `Doctor2026!` | Dr. Folake Ademola | Cardiology (MDCN verified) |

### 3.3 Patient (mobile app)

| Email | Password | Name | Notes |
|---|---|---|---|
| `patient@ominipulse.ai` | `Patient2026!` | Chioma Egwu | Type 2 Diabetes + Hypertension, O+ / AA |

### 3.4 Hospital staff (web hospital portal, demo extras)

| Email | Password | Role |
|---|---|---|
| `admin@xyzspecialist.ng` | `HospAdmin2026!` | hospital_admin |
| `nurse@xyzspecialist.ng` | `Nurse2026!` | nurse |
| `pharmacist@xyzspecialist.ng` | `Pharm2026!` | pharmacist |
| `labtech@xyzspecialist.ng` | `LabTech2026!` | lab_technician |
| `bloodbank@xyzspecialist.ng` | `BloodBank2026!` | blood_officer |
| `reception@xyzspecialist.ng` | `Reception2026!` | receptionist |

---

## 4. Setup Instructions

### 4.1 Create the project & run migrations

```bash
# install the CLI once
npm i -g supabase

supabase login
supabase link --project-ref <your-project-ref>

# apply in order
supabase db push                       # runs migrations/0001..0003
# then load the demo data + profiles
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
# or: supabase db reset (local) with seed.sql configured as seed file
```

### 4.2 Seed the auth users (passwords live in auth.users)

`seed.sql` creates the `profiles` rows with deterministic UUIDs; the matching
`auth.users` entries must be created once (any order) so passwords work:

```bash
# helper script using the admin API (run from repo root)
node scripts/seed-supabase-auth.mjs
```

`scripts/seed-supabase-auth.mjs` (create with your project URL + service key in env):

```js
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase-auth.mjs
const USERS = [
  ['11111111-1111-1111-1111-111111111111', 'superadmin@ominipulse.ai',    'OminiAdmin2026!',  'Adaora',  'Obi',     'admin'],
  ['22222222-2222-2222-2222-222222222222', 'verification@ominipulse.ai', 'VerifyAdmin2026!', 'Ngozi',   'Eze',     'admin'],
  ['33333333-3333-3333-3333-333333333333', 'support@ominipulse.ai',       'SupportAdmin2026!','Tunde',   'Bakare',  'admin'],
  ['44444444-4444-4444-4444-444444444444', 'security@ominipulse.ai',      'SecureAdmin2026!', 'Halima',  'Bello',   'admin'],
  ['55555555-5555-5555-5555-555555555555', 'moderator@ominipulse.ai',     'Moder8Admin2026!', 'Emeka',   'Nnamdi',  'admin'],
  ['66666666-6666-6666-6666-666666666666', 'hospitalrel@ominipulse.ai',  'PartnerAdmin2026!','Yetunde','Adeyemi', 'admin'],
  ['77777777-7777-7777-7777-777777777777', 'doctor@ominipulse.ai',        'Doctor2026!',      'Folake',  'Ademola', 'doctor'],
  ['88888888-8888-8888-8888-888888888888', 'patient@ominipulse.ai',      'Patient2026!',     'Chioma',  'Egwu',    'patient'],
  ['99999999-9999-9999-9999-999999999999', 'admin@xyzspecialist.ng',     'HospAdmin2026!',   'Ibrahim', 'Sani',    'hospital_admin'],
  ['aaaaaaa1-1111-4111-8111-aaaaaaaaaaa1', 'nurse@xyzspecialist.ng',     'Nurse2026!',       'Amina',   'Yusuf',   'nurse'],
  ['aaaaaaa2-2222-4222-8222-aaaaaaaaaaa2', 'pharmacist@xyzspecialist.ng','Pharm2026!',       'Chioma',  'Okonkwo', 'pharmacist'],
  ['aaaaaaa3-3333-4333-8333-aaaaaaaaaaa3', 'labtech@xyzspecialist.ng',   'LabTech2026!',     'Emeka',   'Nnamdi',  'lab_technician'],
  ['aaaaaaa4-4444-4444-8444-aaaaaaaaaaa4', 'bloodbank@xyzspecialist.ng', 'BloodBank2026!',   'Musa',    'Garba',   'blood_officer'],
  ['aaaaaaa5-5555-4555-8555-aaaaaaaaaaa5', 'reception@xyzspecialist.ng', 'Reception2026!',   'Fatima',  'Mohammed','receptionist'],
];

const admin = await (await import('@supabase/supabase-js')).createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

for (const [id, email, password, first, last, role] of USERS) {
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { first_name: first, last_name: last, role },
  });
  // align the auth.users id with the deterministic profile id
  if (data?.user && data.user.id !== id) {
    // the trigger already created a profile for the new id; move it
    await admin.from('profiles').update({ id }).eq('id', data.user.id);
    // note: if your plan disallows auth id mutation, instead pre-create
    // users with the deterministic ids via createUser({ ... }) then update.
  }
  console.log(email, error ? 'FAILED: ' + error.message : 'OK');
}
```

> Alternative without the helper script: create each user from the Supabase
> dashboard (Authentication → Add user) with the emails + passwords from the
> tables in §3. The `on_auth_user_created` trigger then links `profiles`
> automatically; seed.sql rows with matching deterministic UUIDs will simply
> be reused (`on conflict do nothing`) once the ids align.

### 4.3 Deploy edge functions

```bash
supabase functions deploy send-otp
supabase functions deploy reset-password
supabase secrets set RESEND_API_KEY=xxxx OTP_FROM_EMAIL="OminiPulse <no-reply@ominipulse.ai>"
# no RESEND key → OTP prints to function logs (dev mode)
```

### 4.4 Client environment variables

Mobile (`.env` at repo root, consumed by Expo):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Desktop/web (`desktop/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

---

## 5. Authentication & Data-Consistency Design

### 5.1 One identity, one session shape

1. Client calls `supabase.auth.signInWithPassword({ email, password })` — identical call on mobile and web.
2. Server issues a JWT; the client then calls `get_my_session()` RPC to hydrate
   app state (user object with role / verification status) — one canonical shape.
3. Routing is role-driven: `patient` → patient navigator, `doctor` → doctor
   workspace, `admin` / `hospital_*` → admin/hospital console.
4. `check_login_eligibility()` gates login server-side (suspension, MDCN lock),
   so neither platform can bypass account states the other enforces.

### 5.2 RLS = one authorization layer for all platforms

| Role | Can read | Can write |
|---|---|---|
| patient | own profiles/records/consents/appointments | own data (records, consents, vitals, bookings) |
| doctor | patients-of-record, own appointments/prescriptions | own clinical entities (SOAP, Rx, availability) |
| admin | everything | platform oversight (verify, suspend, hospitals) |
| hospital_admin | own hospital (staff, beds, pharmacy, lab, blood) | own hospital operations |
| nurse / receptionist | ward beds, appointments | beds, transfers, intake |
| pharmacist / lab_technician / blood_officer | their department queues | department updates (dispense, results, blood) |

Key consistency invariants (enforced in SQL, not app code):

- **No double-booking**: `unique (doctor_id, scheduled_at)` on `appointments`.
- **Doctor-patient relationship** for record visibility requires an actual
  appointment row (`doctor_has_patient`), so records never leak to unrelated doctors.
- **Escrow atomicity**: `complete_appointment_and_release_escrow()` completes the
  appointment and releases the 90/10 split payment in one transaction.
- **OTP security**: SHA-256 hashed codes, 10-minute expiry, 5-attempt cap,
  single-use burn — verified server-side for both apps.
- **Immutable audit trail**: `audit_logs` is insert-only (no update/delete policies).

### 5.3 Shared availability computation

`get_available_slots(doctor_id, date)` derives free slots from
`doctor_working_hours` minus booked appointments — the patient booking flow and
the receptionist console show the exact same availability because they call the
same function.

---

## 6. Verification Checklist

After setup, verify cross-platform consistency:

1. **Sign in as the doctor** (`doctor@ominipulse.ai`) on mobile → Doctor workspace shows 1 upcoming appointment; the same appointment appears on the web doctor portal.
2. **Sign in as the patient** (`patient@ominipulse.ai`) on mobile → Home shows the appointment, prescriptions (Metformin, B12), records, and consent grants.
3. **Sign in as superadmin** on web → Dashboard reads the same doctor/patient/appointment rows.
4. **RLS test**: as the patient via SQL editor, `select * from public.audit_logs;`
   should return only rows where `patient_id` is the patient's profile.
5. **OTP test**: call `POST /functions/v1/send-otp` with the patient email → code
   appears in function logs (or email with Resend) → `reset-password` completes
   → sign in with the new password works on both platforms.
