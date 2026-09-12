# OminiPulse — The Behind-the-Scenes Work, Explained Simply

> This document explains, in plain language, everything built "under the
> hood" of OminiPulse — the **backend**, the **AI**, and the **database**.
> No technical background is needed to read it.

---

## What Is OminiPulse, in One Paragraph?

OminiPulse is a digital healthcare platform for patients, doctors, and
hospitals, built with a focus on Nigeria and Africa. Patients use a mobile
app to find doctors, book video consultations, track their health readings,
and request blood donors in emergencies. Doctors and hospitals use a desktop
program to manage appointments, hospital beds, pharmacy stock, lab tests,
and blood bank supplies. Underneath all of that sits the invisible machinery
described below — the parts users never see, but that everything depends on.

---

## 1. The Backend — The "Front Desk and Rules Office" of the Platform

### What is a backend?

Think of a restaurant. The dining room — the mobile app and desktop program —
is what customers see. The kitchen, the order system, and the staff-only
corridors are the **backend**: where requests come in, rules are checked,
and the real work happens.

### What we built

We built an **Express API** — essentially a team of digital "receptionists"
that every part of the app talks to. When a patient taps "Book Appointment"
on their phone, the phone doesn't decide anything itself. It sends a request
to this backend, which checks the rules, talks to the database, and sends
back an answer.

The backend handles every kind of request in the platform:

| Area | What it does in plain terms |
|---|---|
| **Sign-in & accounts** | Checks who you are on every single request and decides what you're allowed to see and do. |
| **Doctor directory** | Lists doctors with their specialties, schedules, and verification status so patients can choose. |
| **Appointments** | Shows genuinely free time slots, prevents double-booking, and lets doctors approve, cancel, or mark no-shows. |
| **Payments** | Holds the consultation fee safely — like a neutral middleman, called "escrow" — and only releases it once the appointment is completed: 90% to the doctor, 10% to the platform, in one automatic step. |
| **Patient records** | Stores and retrieves medical records, prescriptions, and permissions the patient has granted. |
| **Hospital operations** | Manages hospital beds, admissions, transfers, pharmacy dispensing, medicine stock, lab tests and results, and blood bank requests. |
| **Admin oversight** | Gives platform administrators dashboards for users, hospitals, audits, incidents, payments, and AI safety reviews. |

### The security model — "Keys that only open your own doors"

Every person in the system has a role: patient, doctor, nurse, pharmacist,
lab scientist, blood bank officer, receptionist, hospital admin, or platform
admin — nine roles in total. The backend enforces **two independent locks**:

1. **A permission checklist at the door** — the backend checks your role
   before even accepting a request. A pharmacist cannot book appointments;
   a patient cannot dispense medicine.
2. **Row-Level Security in the database itself** — even deeper down, the
   database only hands over the rows of data that belong to you.
   A patient only ever sees their own records. A doctor only sees patients
   they actually have an appointment with. A hospital pharmacist only sees
   their own hospital's pharmacy.

Because the second lock lives in the database and not in the app, even a
mistake in the app cannot cause data to leak. It also means the mobile app,
the website, and the desktop program all obey **exactly the same rules** —
nobody can slip through by using a different door.

### Other safety measures

- **Login gates** are checked on the server: suspended accounts and
  unverified doctors are blocked from consulting, messaging, or prescribing —
  on every platform, with no way around it.
- **Passwords can be reset by OTP** — a one-time code sent by email. The
  codes are stored scrambled, expire after 10 minutes, stop working after 5
  wrong attempts, and can only be used once.
- **A permanent activity diary (an audit log)** records who did what, and
  can never be edited or deleted afterwards — important for trust and for
  compliance with the Nigerian data protection law (NDPA 2023).
- **Rate limits** stop anyone from flooding the system with requests.

---

## 2. The AI — The "Always-Available Assistant" (With Guardrails)

### What we built

The platform includes a carefully contained AI assistant. It is **not** a
doctor and never decides anything — it helps, suggests, and warns, and it
always defers to human medical professionals.

The AI powers five features:

1. **Health chat** — patients can ask health questions in everyday language
   and get guidance with clear medical disclaimers.
2. **Symptom triage** — the user describes their symptoms, and the AI
   classifies how urgent the situation is. Dangerous combinations (like
   chest pain with shortness of breath) are immediately flagged as
   emergencies, and the response always ends with instructions to call 112
   (the national emergency number) or get to the nearest hospital.
3. **Clinical decision support (for doctors)** — a doctor describes a case,
   and the AI suggests possibilities to consider and drug interactions to
   watch out for. The system is deliberately instructed to **suggest, never
   decide**.
4. **SOAP note writing (for doctors)** — doctors can draft a consultation
   summary, and the AI formats it into the standard clinical note structure
   (Subjective, Objective, Assessment, Plan), saving the doctor time. The
   doctor reviews and approves it before it is saved.
5. **Vitals sentinel** — a zero-cost "smoke alarm" that checks every health
   reading a patient logs (blood pressure, heart rate, and so on) against
   safe ranges, using plain, transparent rules. If a reading is critical —
   say, a very high blood pressure — it raises an instant alert. This one
   doesn't use AI at all, which means it works instantly, always, and for
   free.

### How the AI stays available: the "relay team" of models

Instead of depending on one AI model, we use a **chain of four models**, all
provided by a company called Groq. Think of it as a relay team:

1. The **first runner** (the strongest) handles most requests.
2. If they're unavailable, the **second runner** takes over instantly.
3. Then a **third**, from a different "family", for extra diversity.
4. Then a **small, always-available fourth** as the last resort.
5. And if the whole team is unreachable, a **built-in rulebook** answers
   without any external service — so the AI features *degrade gracefully*
   (giving simpler answers) but never go completely dead.

### The safety rails around the AI

Because this is healthcare, the AI is fenced in:

- **Incoming questions are screened.** Requests trying to get overdose
  amounts, or to trick the AI into writing a prescription without a doctor,
  are blocked and reported to the platform's moderation queue.
- **Outgoing answers are cleaned** of any attempt to smuggle in
  instructions.
- **Emergency symptoms always trigger the emergency notice** — no matter
  what else happens, this footer cannot be skipped.
- **Every AI conversation is recorded** for safety review, and every AI call
  is metered — meaning the platform tracks how much each user is using it,
  with daily caps and per-minute limits, so no single person can run up
  uncontrolled costs or abuse the system.

---

## 3. The Database — The "Filing Building and Vault" of the Platform

### What is a database?

A database is like a massive, ultra-organized filing building. Every
patient record, every appointment, every prescription, and every bed in
every hospital has a form in it. The backend is the clerk that fetches and
files those forms — but never lets anyone wander the halls themselves.

### What we built

We use **Supabase**, a professional, cloud-hosted service built on a
battle-tested database engine called **PostgreSQL** (used by banks and
governments worldwide). One single database serves the mobile app, the
website, and the desktop program — so an account created on a phone works on
the desktop the same day, with the same data, because it's all one building.

### The filing system — 30+ sections (tables)

| Section | What's stored there, in plain terms |
|---|---|
| **People** | One master profile per person (patient, doctor, hospital staff, admin) with their role and account status. |
| **Doctors** | Doctor credentials and verification documents (medical licence, ID, etc.), weekly working hours, and hospital attachments. |
| **Patients** | Patient health profiles, ongoing conditions (such as diabetes), and health readings (blood pressure, heart rate, weight, and more). |
| **Appointments & consultations** | Bookings (with a rule that makes double-booking impossible), consultation notes (SOAP), prescriptions and the medicines in them, and chat messages between patient and doctor. |
| **Hospital operations** | Hospitals and their staff, every bed (with its status: available, occupied, needs cleaning, or under maintenance), ward transfers, pharmacy medicine stock and orders, lab test orders and results, blood donors, and blood requests. |
| **Trust & safety** | Consents the patient has signed (data-sharing permissions), the un-editable audit diary, incident reports, AI safety flags, and notifications. |
| **Money** | Payment transactions, including the escrow record for each consultation. |
| **AI** | Saved AI conversations, their messages, and the usage metering records. |

### How the building was constructed — the "migrations"

Databases are built in careful, numbered stages, like construction phases.
We built ours in five:

1. **Stage 1 — The blueprint (unified schema):** created all 30+ sections
   and their exact fields, plus automatic rules (for example, a bed status
   can only be one of the four allowed words).
2. **Stage 2 — The locks (security policies):** installed Row-Level Security
   on every single section, so each person can only touch their own (or
   their hospital's own) records.
3. **Stage 3 — The shared rulebook (functions):** wrote server-side
   procedures that both the mobile app and desktop program call for the same
   answers — "who am I logged in as", "is this account allowed to log in",
   "which time slots are actually free for this doctor on this date", and
   "complete the appointment and release the escrow payment as one
   indivisible step" (so money can never be released without the
   appointment being completed, or vice versa).
4. **Stage 4 — The AI wing:** added the sections that store AI
   conversations and meter usage.
5. **Stage 5 — The reinforced doors (security hardening):** a later pass
   that fixed newly discovered weaknesses — closing a loophole where
   someone could try to register with an elevated role, making password
   reset codes properly protected, tightening who can authorize escrow
   and hospital staff access, and fixing a time-slot calculation bug.

### Emergency password recovery — the "post office"

We also built two small cloud services (called edge functions) that handle
one-time password reset codes. One **sends** the code by email; the other
**verifies** it and sets the new password. The codes never travel through
the apps unprotected — verification happens on the server.

### Real-time updates

The database supports **live updates**: when a nurse marks a bed as
"occupied" on the desktop program, the bed status updates for everyone
watching, without refreshing. The same power keeps patient–doctor chats
flowing.

---

## 4. How the Three Pieces Work Together

Here is the whole journey of one simple action — a patient booking a
consultation:

1. The patient taps **Book** on their phone (the app).
2. The app asks the **backend** for the doctor's free slots.
3. The backend calls the database's shared **free-slot rulebook function**,
   which checks the doctor's working hours against existing bookings.
4. The database returns only what this patient is allowed to see (thanks to
   the row-level locks).
5. The patient confirms; the backend records the appointment and holds the
   consultation fee in **escrow**.
6. After the video consultation, the doctor marks it complete; the backend
   then triggers the single, indivisible step that completes the
   appointment and releases the money — 90% to the doctor, 10% to the
   platform.
7. Every step of this journey was written into the **audit diary**,
   permanently.

And through it all, the AI is available to guide symptom questions before
the booking and to help the doctor write the clinical note afterwards —
each safely fenced by its guardrails.

---

## 5. Why This Design, in Everyday Terms

| Choice | The plain-English reason |
|---|---|
| **One shared database for all platforms** | Your account and data are the same everywhere — no more "the app doesn't show what the website shows" problems. |
| **Rules live on the server, not in the apps** | Nobody can tamper with their phone to unlock extra powers — the rulebook is kept in the vault, not handed out to every visitor. |
| **Two independent security locks** | If one is ever bypassed by mistake, the other still protects the data. |
| **A relay team of AI models + a rulebook fallback** | The AI assistant never simply "goes down" — it always answers something, even if slower or simpler. |
| **Money moves in one indivisible step** | Escrow can never be released half-way; there is no window where the money is out but the appointment isn't complete. |
| **A permanent audit diary** | Trust in healthcare requires knowing exactly who did what, forever. |
| **Built for Nigerian law** | Consents, data export, and access controls follow the NDPA 2023 data protection act; doctor verification follows the MDCN medical council rules. |

---

*For the technical versions of this document, see
[`supabase/README.md`](./supabase/README.md) (database),
[`backend/README.md`](./backend/README.md) (backend API), and
[`README.md`](./README.md) (the whole platform).*
