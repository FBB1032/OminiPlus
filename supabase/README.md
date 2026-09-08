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
> `seed.sql` is applied (it seeds `auth.users` + `profiles` together). All demo passwords meet
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

`seed.sql` can also be pasted straight into the Supabase **SQL editor** — it is
self-contained. The auth users, identities, and profiles sections are safe to
re-run (upserts), but re-running duplicates the demo clinical rows (vitals,
audit logs, notifications, donors, etc.), so run the demo-data section once.

### 4.2 Auth users are seeded by seed.sql itself

`seed.sql` creates the `auth.users` + `auth.identities` rows (deterministic UUIDs,
bcrypt-hashed passwords via pgcrypto) **before** inserting the matching
`public.profiles` rows, because `profiles.id` is a foreign key to
`auth.users(id)`. No separate auth-seeding step or helper script is needed.

> Note: the SQL editor runs with elevated privileges, which is what allows the
> direct `auth.users` inserts. If you seed via `psql`/`supabase db reset` with a
> restricted role, run it as a role that may write to the `auth` schema.

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
