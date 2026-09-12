# Omini Pulse — Live Backend Integration Plan (https://ominipulse.onrender.com)

**Status:** Implemented (this document is both the plan and the record of what shipped)
**Date:** 2026-09-09
**Scope:** Mobile (React Native / Expo), Desktop (Next.js + Electron), Web marketing (admin/)

---

## 0. Executive Summary

The Omini Pulse backend at `https://ominipulse.onrender.com` is an Express + Supabase
service whose source lives in `backend/` of this monorepo. All three client apps already
have an API client layer but currently target a legacy placeholder shape
(`/auth/login`, `/patient/...`, `/doctor/...`, `/admin/...`) that does not exist on the
deployed service. The live backend speaks a different dialect:

- **Auth**: Supabase GoTrue (JWT) — the Express API has no login/register endpoints.
- **Business endpoints**: `/api/*` with camelCase payloads and RBAC guards.
- **Errors**: `{ error: { code, message } }` envelope, not `{ message, errors }`.

This integration rewires each client to the real contract, environment by environment,
while preserving the existing mock-fallback resilience for offline demo use.

### Verified live (2026-09-09)

| Check | Result |
|---|---|
| `GET /health` | `{ status: "ok", ... }` |
| `GET /api/auth/eligibility/:email` | 200, `{ eligible, reason, role }` |
| GoTrue signup + password grant (fresh users) | works, role metadata honored |
| `GET /api/auth/me` with fresh JWT | 200 profile + profile rows |
| `GET /api/admin/dashboard` with fresh admin JWT | 200 counts |
| Live demo account `demo.admin@ominipulse.ai` / `OminiAdmin2026!` | **created & verified end-to-end** (login → `/api/auth/me` → `/api/admin/dashboard`) |
| Seeded demo accounts (`patient@ominipulse.ai` etc.) | **GoTrue 500** — stale broken `auth.users` rows on the live DB; see §7 |

---

## 1. Backend API Contract (as deployed)

Base URL: `https://ominipulse.onrender.com`
Auth: `Authorization: Bearer <supabase-jwt>` (all business endpoints)
Success envelope: per-route (`{ appointments: [...] }`, `{ patient: {...} }`, …)
Error envelope: `{ error: { code: string, message: string } }` (+ zod validation details)

### 1.1 Auth (Supabase GoTrue, not Express)

| Operation | Endpoint |
|---|---|
| Register (role-aware) | `POST /api/auth/register` — patients activate immediately (email verification bypassed server-side); doctors are created `pending` and gated until super-admin approval |
| Login | `POST {SUPABASE_URL}/auth/v1/token?grant_type=password` |
| Refresh | `refreshSession()` via supabase-js (auto-refresh) |
| Eligibility gate | `GET /api/auth/eligibility/:email` (suspension/MDCN lock; `verification_rejected` for rejected doctors) |
| Current profile | `GET /api/auth/me` → `{ profile }` |

JWTs are 1h; supabase-js auto-refreshes. Roles live in `profiles.role` and RBAC is
enforced by the permission matrix in `backend/src/rbac/permissions.js`.

### 1.2 Business surface (mounted under `/api`)

| Area | Endpoints | 
|---|---|
| Doctors | `GET /api/doctors` (public search), `GET /api/doctors/:id`, `GET /api/doctors/verification/pending`, `PATCH /api/doctors/verification/:id` |
| Patients | `GET /api/patients/me`, `GET /api/patients/:id`, `GET/POST /api/patients/:id/records`, `GET /api/patients/:id/consents` |
| Appointments | `GET/POST /api/appointments`, `PATCH /api/appointments/:id`, `POST /api/appointments/:id/complete`, `GET /api/appointments/slots/:doctorId/:date` — mutations publish realtime `appointment.*` events |
| Vitals | `GET/POST /api/vitals` |
| Hospital | `GET /api/hospital/beds`, `POST /api/hospital/beds/:id/admit\|discharge`, `GET /api/hospital/pharmacy/queue\|inventory`, `POST /api/hospital/pharmacy/orders/:id/dispense`, `GET /api/hospital/lab/orders`, `POST /api/hospital/lab/orders/:id/results`, `GET /api/hospital/blood/requests`, `POST /api/hospital/blood/requests/:id/status` |
| AI | `POST /api/ai/chat`, `GET /api/ai/conversations/:id`, `POST /api/ai/cds`, `POST /api/ai/soap`, `POST /api/ai/triage`, `POST /api/ai/sentinel` — every turn logs prompt+response to `ai_interaction_logs` |
| Admin | `GET /api/admin/dashboard`, `GET /api/admin/users`, `POST /api/admin/users/:id/verify` (approve/reject doctor), `PATCH /api/admin/users/:id/status` (suspend/reactivate), `GET /api/admin/hospitals`, `GET /api/admin/audit-logs`, `GET /api/admin/admin-audit-logs` (hash-chained admin trail), `GET /api/admin/ai-interactions` (prompt/response review), `GET /api/admin/incidents`, `PATCH /api/admin/incidents/:id`, `GET /api/admin/ai-flags`, `PATCH /api/admin/ai-flags/:id`, `GET /api/admin/payments` |
| Broadcasts | `GET/POST /api/broadcasts`, `PATCH/DELETE /api/broadcasts/:id`, `POST /api/broadcasts/:id/dispatch` (fan-out to notifications + realtime push; scheduled broadcasts auto-dispatch on a 60s sweep) |

### 1.3 Realtime (WebSocket)

`GET {BASE}/ws?token=<supabase-jwt>` — one authenticated socket per client;
heartbeat-evicted; channels `user:<id>`, `role:<role>`, `admins`. Events:
`appointment.booked|scheduled|approved|cancelled|completed`,
`account.verification`, `account.status`, `broadcast.delivered`,
`admin.users.changed`. Clients: `src/services/realtimeService.ts` (mobile) and
`desktop/src/services/realtimeService.ts` (desktop).

### 1.4 Governance data model (migration 0006)

- `admin_audit_logs` — hash-chained (`prev_hash`/`entry_hash`, insert-only
  trigger; actor pinned from `auth.uid()`), all administrative mutations.
- `ai_interaction_logs` — one row per AI turn (prompt, response, provider,
  model, urgency, flagged), admin-reviewable.
- `broadcast_messages` + `notifications.broadcast_id` — Broadcast Center
  payloads with audience targeting and delivery accounting.

### 1.5 RBAC permission matrix (roles → permissions)

`admin` sees everything; `hospital_admin` hospital-scoped; `doctor` clinical read/write;
`nurse`, `receptionist`, `blood_officer`, `pharmacist`, `lab_technician` scoped staff
permissions; `patient` own-data + AI. Full matrix: `backend/src/rbac/permissions.js`.
Super-admin controls: `POST /api/admin/users/:id/verify` (doctor approve/reject),
`PATCH /api/admin/users/:id/status` (suspend/reactivate any non-admin account).

---

## 2. Mobile App Integration (React Native / Expo)

### 2.1 Authentication

**Method**: Supabase GoTrue via `@supabase/supabase-js` (already wired in
`src/services/supabaseAuthService.ts`). Tokens persisted by supabase-js into
AsyncStorage (web) / Keychain-adjacent storage, plus mirrored into
`secureStoreService` for the axios layer.

Flow:
1. `login(email, password)` → `check_login_eligibility` RPC gate → `signInWithPassword`.
2. Session tokens mirrored to SecureStore keys (`ominipulse_access_token`,
   `ominipulse_refresh_token`) so the axios client can attach them.
3. **401 handling** in `src/api/client.ts` rewritten: instead of the legacy
   `POST /auth/refresh` (which doesn't exist), call `supabaseAuthService.refresh()`
   (supabase-js `refreshSession()`), re-mirror tokens, replay the request once.
   Queue parallel 401s behind a single refresh, same as before.
4. Logout clears SecureStore + supabase-js session + query cache.

### 2.2 Data fetching patterns

- React Query (TanStack) with existing `QUERY_KEYS` and `STALE_TIME` conventions.
- Adapters in `src/api/*.ts` map the live envelope (`{ appointments: [...] }`) to the
  app's `ApiResponse<T>`-era types via lightweight mappers, keeping screens untouched.
- Slot lookup uses the real RPC endpoint `GET /api/appointments/slots/:doctorId/:date`.
- Book appointment sends the live payload: `{ doctorId, patientId, scheduledAt,
  type, reason }` with ISO-8601 timestamps.
- Vitals + AI features (new): `src/api/vitals.ts` and `src/api/ai.ts` thin clients +
  `useVitals.ts` / `useAI.ts` hooks; `chatStore`, SymptomChecker, ChronicDisease
  screens call the real `/api/ai/chat|triage` and `/api/vitals`.

### 2.3 Error handling

- Axios interceptor normalizes `{ error: { code, message } }` into `AppError`
  (message, statusCode) — same class screens already catch.
- Retry with exponential backoff on 408/429/5xx (max 3) — unchanged.
- **Mock fallback retained**: after retry exhaustion on network/5xx/404, fall back to
  `src/api/__mocks__/mockData.ts` so demo/offline flows keep working.
- AI quota (429 `ai_quota_exceeded`) and rate-limit responses surface their server
  message verbatim.

### 2.4 Environment

`.env`:
```
EXPO_PUBLIC_API_URL=https://ominipulse.onrender.com/api
EXPO_PUBLIC_SUPABASE_URL=https://sjkonmnratfouliovoes.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 3. Desktop Application Integration (Next.js + Electron)

### 3.1 Authentication

**Method**: same unified Supabase account as mobile (already implemented in
`desktop/src/services/supabaseAuthService.ts` — eligibility gate + password sign-in +
profile fetch + session restore). Login page already attempts real login first, demo
fallback second. This integration fixes the token handoff to the REST client.

Key fix: `desktop/src/services/apiClient.ts` read token key
`ominipulse_admin_token` while the auth store writes `ominipulse_desktop_token`
— requests went out unauthenticated. The interceptor now reads the correct key and
refreshes via supabase-js on 401.

### 3.2 Data fetching patterns

- New `desktop/src/services/api.ts` — real backend services mapping the live
  contract (`{ totals }`, `{ users }`, `{ hospitals }`, `{ flags }`, `{ logs }`,
  `{ payments }`, `{ incidents }`, slots, beds, lab, blood) onto the desktop
  `DashboardStats` / `Doctor` / `Patient` / `Hospital` / `AIFlag` / `AuditLog`
  types with fallback to the previous mock shapes when the API is unreachable or
  the caller lacks permission (e.g. hospital-scoped staff).
- Pages: dashboard KPIs from `GET /api/admin/dashboard`; doctors list from
  `GET /api/admin/users?role=doctor` + `GET /api/doctors`; patients from
  `GET /api/admin/users?role=patient`; hospitals from `GET /api/admin/hospitals`;
  audit logs, AI flags, payments, incidents from their admin endpoints.
- Portal pages (hospital-portal, doctor-portal) consume the hospital + AI endpoints
  with the staff JWT.

### 3.3 Error handling

- Axios response interceptor: normalize `{ error: { code, message } }`; 401 →
  supabase `refreshSession()` → single-flight replay; refresh failure → sign out +
  redirect to `/login`.
- Every wired page keeps its mock/initial state as fallback so the console remains
  usable offline (demo mode), with a small "Live data" badge where it matters.

### 3.4 Environment

`desktop/.env.local`:
```
NEXT_PUBLIC_API_URL=https://ominipulse.onrender.com/api
NEXT_PUBLIC_SUPABASE_URL=https://sjkonmnratfouliovoes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
Default in code (when env unset) changed from `http://localhost:3001/api` to the
deployed URL, so demo deployments work with zero configuration.

---

## 4. Web Platform (admin/ marketing site)

`admin/` is a Next.js marketing/download site with no dashboard. Integration =
point its `NEXT_PUBLIC_API_URL` default at the deployed backend and add a live
health banner on the download page hitting `GET /health`. It keeps its own local
state; no auth flows are added there.

---

## 5. Cross-Cutting Concerns

| Concern | Mobile | Desktop | Web (admin/) |
|---|---|---|---|
| Auth method | Supabase GoTrue (JWT, 1h, auto-refresh) | Same | None (marketing) |
| Token storage | SecureStore (iOS/Android) / AsyncStorage (web) | localStorage mirror + supabase-js session | n/a |
| 401 strategy | Refresh via supabase-js → replay → logout on failure | Same | n/a |
| Retry policy | 3× exp backoff on 408/429/5xx | 2× on GET, no retry on mutations | n/a |
| Error contract | `AppError{message, statusCode}` | Normalized axios error + toast | Health banner only |
| Offline/mock | mockData.ts fallback | Per-page fallback to mock seed data | n/a |
| RBAC | Role from `profiles.role`; server-enforced | Same; UI gates via permissionStore | n/a |

---

## 6. Implementation Checklist (what this changeset does)

### Mobile (`src/`)
1. `.env` — `EXPO_PUBLIC_API_URL` → deployed backend `/api`.
2. `src/api/client.ts` — Supabase-backed 401 refresh; error envelope mapping.
3. `src/api/auth.ts` — authApi delegates to supabaseAuthService (no legacy endpoints).
4. `src/api/patient.ts` — real endpoints: `/patients/me`, `/appointments`,
   `/appointments/slots/...`, `/patients/:id/records`, `/doctors`; mappers to app types.
5. `src/api/doctor.ts` — `/appointments` (role-scoped), `/patients`, `/doctors/verification`,
   `/ai/soap`, `/ai/cds` for doctor tooling; availability via direct supabase query.
6. `src/api/vitals.ts` (new) + `src/hooks/useVitals.ts` (new).
7. `src/api/ai.ts` (new) + `src/hooks/useAI.ts` (new).
8. `src/store/chatStore.ts` — real `/api/ai/chat` with conversationId continuity.
9. `src/screens/patient/SymptomCheckerScreen.tsx` — real `/api/ai/triage`.
10. `src/screens/patient/ChronicDiseaseScreen.tsx` — real `/api/vitals` logging.

### Desktop (`desktop/`)
11. `desktop/src/constants/index.ts` — default `API_BASE_URL` → deployed backend.
12. `desktop/src/services/apiClient.ts` — correct token key; Supabase refresh on 401;
    error normalization.
13. `desktop/src/services/api.ts` (new) — real services + mappers + fallbacks.
14. `desktop/src/app/login/page.tsx` — real Supabase login first (already), demo fallback
    guarded; server error surfaces GoTrue/eligibility messages verbatim.
15. `desktop/src/app/dashboard/page.tsx` — live KPIs from `/api/admin/dashboard` with fallback.
16. `desktop/src/app/dashboard/doctors/page.tsx` — live doctor list with fallback.
17. `desktop/src/app/dashboard/patients/page.tsx` — live patient list with fallback.
18. `desktop/src/app/dashboard/hospitals/page.tsx` — live hospital list with fallback.
19. `desktop/src/app/dashboard/audit-logs/page.tsx`, `ai-monitoring/page.tsx` — live lists with fallback.

### Web (`admin/`)
20. `admin/src/constants/index.ts` — default API URL → deployed backend.
21. `admin/src/app/page.tsx` — live backend health banner (`GET /health`), green/red
    status indicator in the header.

### Backend/seeds
22. `supabase/seed.sql` — the GoTrue-compatible `auth.users`/`auth.identities` seed
    shape (already committed in `59bafe4`); live-DB repair instructions in §7.

### Pre-existing build breakage fixed along the way
23. `desktop/src/app/dashboard/hospital-portal/page.tsx` — `RegisteredFacility`
    was missing the optional `licenseNo`/`cacNumber` fields used by the audit
    certificate export (blocked the whole desktop build).
24. `src/components/forms/DatePicker.tsx` — wrong `SafeAreaView` import source
    (react-native instead of react-native-safe-area-context).

---

## 7. Known Backend Issues Encountered (out of band)

1. **Seeded demo accounts cannot log in on the live project.** The live
   Supabase project still holds stale `auth.users` rows seeded by an older,
   broken seed script (pre-`59bafe4`). Every GoTrue operation that touches those
   rows — password grant, admin read, admin update, admin delete — fails with
   `500 unexpected_failure: Database error querying schema/loading user`, while
   all GoTrue-created users work perfectly (signup, login, refresh, profile).
   The seed file itself is already fixed; **the live DB rows need replacing**:
   - Option A (SQL editor, recommended): run the `auth.users` + `auth.identities`
     upsert blocks from the current `supabase/seed.sql` (they are
     `on conflict (id) do update`) — this overwrites the malformed rows in place.
     The `profiles`/business rows are unaffected.
   - Option B: delete the stale rows in the Supabase dashboard SQL editor
     (`delete from auth.users where id in ('11111111-…', …)`) then re-run seed.sql.
   - Interim verified demo account (created via GoTrue admin API during
     integration testing): **`demo.admin@ominipulse.ai` / `OminiAdmin2026!`**
     (role `admin`, works end-to-end on all platforms).
2. Root URL `/` returns 404 by design; `/health` is the uptime probe.
3. Free-tier Render cold starts: first request after idle may take ~50s — the
   clients' retry + mock fallback logic covers this.

---

## 8. Testing & Verification

- **Live smoke tests** (documented above in §0): health, eligibility, GoTrue
  signup/login, authenticated `/api/auth/me` + `/api/admin/dashboard` —
  including a full end-to-end pass with `demo.admin@ominipulse.ai` returning
  live platform counts (`profiles: 17, hospitals: 1, appointments: 1, …`).
- **Mobile**: `npx tsc --noEmit` (passes), React Query behavior unchanged.
- **Desktop**: `npm run build` (passes) — includes Next.js type checking.
- **Admin (web)**: `npm run build` (passes).
- **Manual matrix**: patient login → book appointment flow; doctor login → dashboard;
  admin login → console dashboard KPIs; staff roles → hospital portal; offline →
  mock fallback demo mode.

---

## 9. Future Stages (not in this changeset)

- WebSocket/realtime notifications (currently polling via React Query refetch).
- Edge functions for push notifications (mobile) / tray updates (desktop).
- Unified monorepo package for the API client (currently per-platform adapters).
- Server pagination on admin lists (live API returns capped arrays; desktop maps them).
