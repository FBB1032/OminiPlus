# OminiPulse Backend — Express.js API

Express.js backend for OminiPulse, sitting in front of the shared **Supabase** project
(the same PostgreSQL database + GoTrue auth used by the mobile app, admin web, and desktop clients).

```
Mobile / Web / Desktop  ──►  Express API (this folder)  ──►  Supabase (PostgreSQL + RLS + GoTrue)
                                    │
                                    └──►  AI chain: Groq → Gemini → OpenAI → rule-based fallback
```

## 1. Architecture

| Concern | Implementation |
|---|---|
| **AuthN** | Supabase GoTrue JWTs (issued at login by any client) verified on every request (`src/middleware/auth.js`). |
| **AuthZ (RBAC)** | Two layers: HTTP endpoints guarded by a 9-role permission matrix (`src/rbac/permissions.js`) **and** PostgreSQL RLS policies (`supabase/migrations/0002_rls_policies.sql`). User-scoped queries run under the caller's JWT, so even a handler bug cannot leak rows. |
| **Database** | Supabase PostgreSQL. All queries go through `@supabase/supabase-js` — user clients (RLS-on) for everything user-facing, one service-role client for server-only admin ops. No direct SQL credentials in this process. |
| **AI** | Provider chain `Groq → Gemini → OpenAI` with automatic failover and deterministic rule-based fallback. Guardrails screen inputs (harmful/prescription-bypass prompts), scrub outputs, and append emergency notices for red-flag symptoms. Vitals sentinel is a free rule-based anomaly engine. |

### Repository layout

```
backend/
├── package.json
├── .env.example                 # template — copy to backend/.env
├── scripts/check.js             # syntax check (npm run check)
└── src/
    ├── server.js                # entry point
    ├── app.js                   # middleware stack + route mounting
    ├── config/
    │   ├── index.js             # env parsing (fails fast on missing vars)
    │   ├── logger.js            # JSON stdout logger
    │   └── supabase.js          # user-JWT client + service-role admin client
    ├── middleware/
    │   ├── auth.js              # authenticate / requirePermission / hospital scoping
    │   ├── errors.js            # ApiError, async wrapper, error handler
    │   ├── validate.js          # zod body validation
    │   └── requestContext.js    # per-request logger + timing
    ├── rbac/permissions.js      # the 9-role × permission matrix
    ├── ai/
    │   ├── providers.js         # Groq / Gemini / OpenAI adapters (one contract)
    │   ├── guardrails.js        # input screening, output scrubbing, system prompts
    │   ├── engine.js            # chat / clinical CDS / SOAP / triage + usage metering
    │   └── sentinel.js          # rule-based vitals anomaly detection
    └── routes/
        ├── auth.js              # GET /api/auth/me, eligibility gate
        ├── doctors.js           # directory, working hours, MDCN verification
        ├── appointments.js      # booking, slots, escrow-complete RPC
        ├── patients.js          # profiles, records, NDPA consents
        ├── vitals.js            # readings + sentinel alerts
        ├── hospital.js          # beds, pharmacy, lab, blood bank
        ├── admin.js             # dashboard, users, audit, incidents, AI flags, payments
        └── ai.js                # chat, conversations, CDS, SOAP, triage, sentinel
```

## 2. API surface (all JSON, `/api` prefix)

| Method & path | Permission | Notes |
|---|---|---|
| `GET /health` | public | liveness probe |
| `GET /api/auth/me` | any authed | session via `get_my_session()` RPC |
| `GET /api/auth/eligibility/:email` | public | pre-login gate, no account-existence leak |
| `GET /api/doctors` | all roles | directory with filters |
| `GET /api/doctors/me` | doctor | own profile |
| `PUT /api/doctors/me/working-hours` | doctor | upsert weekly schedule |
| `PATCH /api/doctors/:id/verify` | admin | MDCN verification → syncs `profiles.verification_status` |
| `GET/POST /api/appointments` | role-scoped | book + list (RLS-scoped rows) |
| `PATCH /api/appointments/:id` | doctor/admin/reception | approve / cancel / no-show |
| `POST /api/appointments/:id/complete` | doctor/admin | atomic escrow release RPC (90/10) |
| `GET /api/appointments/slots/:doctorId/:date` | all authed | shared `get_available_slots` RPC |
| `GET /api/patients/me` `/api/patients/:id` | role-scoped | patient profiles |
| `GET/POST /api/patients/:id/records` | role-scoped | records + `log_audit_entry` trail |
| `GET /api/patients/:id/consents` | role-scoped | NDPA consent grants |
| `POST/GET /api/vitals` | role-scoped | sentinel runs on every write |
| `GET /api/hospital/beds` etc. | hospital staff | beds/admit/discharge, pharmacy queue/dispense/inventory, lab orders/results, blood requests |
| `GET /api/admin/dashboard` … | admin | stats, users, hospitals, audit logs, incidents, AI flags, payments |
| `POST /api/ai/chat` | patient/doctor/admin | guardrailed chat, conversations persisted |
| `GET /api/ai/conversations/:id` | owner | transcript |
| `POST /api/ai/cds` | doctor/nurse | differential + interactions |
| `POST /api/ai/soap` | doctor | transcript → SOAP, optionally upserts to `soap_notes` |
| `POST /api/ai/triage` | patient/doctor/admin | urgency classification |
| `POST /api/ai/sentinel` | patient/doctor/nurse | rule-based vitals alerts (no model call) |

## 3. AI model choice rationale

| Rank | Provider | Why |
|---|---|---|
| 1 | **Groq** (`llama-3.3-70b-versatile`) | Free tier with generous rate limits, ~fastest tokens/sec on the market, 70B-class quality. Best cost/quality for chat, triage, CDS. |
| 2 | **Google Gemini 1.5 Flash** | Free tier fallback, strong medical reasoning, long context. |
| 3 | **OpenAI `gpt-4o-mini`** | Cheap paid safety net if both free tiers are exhausted. |
| — | **Rule-based fallback** | Zero-cost deterministic responses + sentinel. The product degrades, never breaks, with zero API keys configured. |

Safety: input guardrails block overdose/prescription-bypass prompts (logged to `ai_flags` for admin review), red-flag symptoms always get the emergency footer (112 / nearest hospital), and outputs are scrubbed of injection attempts. Doctors' CDS/SOAP prompts pin the model to "suggest, never decide".

## 4. Local run

```bash
cd backend
npm install
cp .env.example .env        # fill SUPABASE_URL / SUPABASE_ANON_KEY (see checklist)
npm run dev                 # http://localhost:8080
```

## 5. Post-implementation checklist

### A. Database (Supabase)

- [ ] Apply migrations **in order** to the shared Supabase project:
  `0001_unified_schema.sql` → `0002_rls_policies.sql` → `0003_auth_functions.sql` → **`0004_ai_engine.sql`** (new)
  (`supabase db push` from the repo root, or paste each file into the SQL editor.)
- [ ] Load `supabase/seed.sql` once for demo accounts/data (safe to re-run for auth/profile sections).
- [ ] Verify RLS: in the SQL editor run `select * from public.ai_usage;` as an anon key — must return 0 rows.

### B. Environment variables

- [ ] `SUPABASE_URL` + `SUPABASE_ANON_KEY` — from Supabase dashboard → Settings → API (same values the mobile app uses as `EXPO_PUBLIC_*`).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — server-only; used for the admin eligibility lookup. **Never ship it to any client.**
- [ ] `GROQ_API_KEY` — create free at https://console.groq.com (recommended primary).
- [ ] Optional: `GEMINI_API_KEY` (https://aistudio.google.com), `OPENAI_API_KEY` (paid fallback).
- [ ] `CORS_ORIGINS` — set to your real web origins in production (comma-separated; never `*` with credentials).
- [ ] Tune `AI_DAILY_USER_CAP`, `AI_RATE_LIMIT_MAX` to your Groq tier limits.

### C. Deployment

- [ ] Node 18.17+ host (Render / Railway / Fly.io / EC2 / Docker). `npm ci --omit=dev`, `npm start`.
- [ ] Set `NODE_ENV=production` (masks 500 details, enables prod error text).
- [ ] Health check path: `/health`.
- [ ] Terminate TLS at the proxy; the app sets `trust proxy` for correct client IPs in rate limiting.
- [ ] Point clients at the API: mobile `EXPO_PUBLIC_API_URL=https://api.ominipulse.health`, admin `NEXT_PUBLIC_API_URL=...` (they send their Supabase JWT as the Bearer token).
- [ ] Log drains: the logger writes JSON lines to stdout — pipe to your aggregator.

### D. Security review before go-live

- [ ] Rotate demo passwords from `seed.sql` (they are public in the repo).
- [ ] Confirm `backend/.env` is git-ignored (it is, via root `.gitignore`).
- [ ] Restrict service-role key scope; consider a dedicated Supabase project per environment.
- [ ] Load-test the rate limits (`RATE_LIMIT_MAX` default 300/15min, AI 20/min).
- [ ] Review `ai_flags` queue daily (guardrail-blocked prompts land there for moderation).

### E. Verification smoke tests

- [ ] `GET /health` → `{"ok":true}`
- [ ] `GET /api/doctors` without a token → 401; with a seeded patient JWT → doctor list.
- [ ] `POST /api/ai/triage` with symptoms "chest pain and shortness of breath" → urgency `emergency` + 112 footer.
- [ ] Login as `superadmin@ominipulse.ai` → `GET /api/admin/dashboard` returns counts.
- [ ] `POST /api/vitals` with systolic 185/diastolic 125 → response includes a `critical` sentinel alert.
