# 🏥 OminiPulse — AI-Powered Telehealth, Hospital Operating System & Unified Medical Ecosystem

> **NITDA ICSC HACKATHON 2026 SUBMISSION**  
> **Event**: International Cybersecurity Conference (ICSC) Hackathon — Organized by NITDA  
> **Category**: University Category  
> **Track**: TrackC (HealthTech, Digital Trust & Cybersecurity in Healthcare)  
> **Team Name**: TeamAlafia  
> **Target Region**: Nigeria & Pan-African Healthcare Ecosystem  
> **Regulatory Standards**: MDCN (Medical and Dental Council of Nigeria) & NDPA 2023 (Nigeria Data Protection Act)  
> **Current Version**: v2.2.0 (Enterprise Health & Hospital Operating System Edition)

---

## 📌 Executive Summary & Pitch

In Nigeria and across Sub-Saharan Africa, the healthcare delivery system faces severe structural bottlenecks:
- **Severe Doctor-to-Patient Deficit**: Approximately 1 doctor per 5,000+ citizens (far below the WHO benchmark of 1:600).
- **Fragmented Hospital Operations**: Primary and secondary healthcare centers rely on paper charts, manual bed tracking, fragmented dispensary notebooks, and chaotic front-desk triage.
- **Critical Blood Deficits**: Inability to quickly locate compatible, verified donors during trauma or obstetric emergencies leads to preventable maternal and emergency mortality.
- **Unregulated Digital Care & Malpractice Risks**: Proliferation of unverified practitioners without MDCN credential auditing.

**OminiPulse** by **TeamAlafia** (**TrackC**) is a unified, end-to-end digital health operating ecosystem built to modernize African healthcare. Rather than offering just another consumer telemedicine chat app, OminiPulse combines:
1. **Patient & Doctor Mobile Telehealth Application** (React Native / Expo) with AI triage, 3D anatomical body mapping, EHR records, and wearable sensor telemetry.
2. **Hospital Operating System (HMS) & Clinical Desktop Console** (Electron + Next.js 14) with real-time 18-bed inpatient ward matrix, hospital pharmacy formulary, clinical pathology laboratory, and hospital blood bank crossmatching.
3. **Regulatory Super-Admin Console** with MDCN 5-credential verification lock, forensic disciplinary incident audits, and NDPA compliance telemetry.
4. **Unified Cloud Backend & AI Engine** (Supabase PostgreSQL + GoTrue + Express.js API + Groq AI Failover Chain) providing consistent single-identity authentication and database-level Row-Level Security (RLS).

---

## 🏆 NITDA ICSC Hackathon Alignment (University Category — TrackC)

| ICSC TrackC Objective | How OminiPulse Solves It | TrackC Cybersecurity & Digital Trust Impact |
| :--- | :--- | :--- |
| **Healthcare Accessibility** | Eliminates geographical barriers with remote video/audio consultations, structured SOAP clinical notes, and digital e-prescriptions. | Connects rural/semi-urban Nigerians with verified specialists nationwide securely. |
| **Digital Trust & Anti-Quackery** | MDCN 5-credential verification lock (license, NIN, certificates, employment, photo) with 30-day grace alarms. Unverified practitioners are strictly locked out of consultations and billing. | Prevents identity fraud, quackery, and unlicensed medical practice in telehealth. |
| **Data Protection & Sovereignty (NDPA 2023)** | Full compliance with Nigeria Data Protection Act 2023. Per-record access consent, immutable audit logs, and Article 26 1-click personal health data export (PDF/ZIP). | Strict doctor-patient relationship isolation via PostgreSQL Row-Level Security (RLS); zero medical data leakage. |
| **Financial Security & Anti-Fraud** | Escrow-backed consultation fee settlement via Paystack/Flutterwave split architecture. Funds released only upon completed consultation. | Eliminates ghost-doctor billing fraud and provides 100% patient reimbursement on doctor non-performance. |
| **Artificial Intelligence in Medicine** | Groq AI inference chain (`gpt-oss-120b` → `gpt-oss-20b` → `compound-mini` → `allam-2-7b`) with safety guardrails blocking prompt-injection and harmful self-medication attempts. | Safe, hallucination-resistant clinical triage and rule-based vitals anomaly detection. |
| **Hospital Inpatient Digitization** | Live 18-bed management across 6 departments (ICU, Emergency, Maternity, Pediatrics, Male/Female Surgical) with instant admission, transfer, and sanitation tracking. | Reduces inpatient intake delays from hours to seconds and prevents ICU bed shortages. |
| **Emergency Blood & Life-Saving Networks** | "Request Blood Now" emergency broadcast engine matching compatible donors (`O-`, `O+`, `A+`, etc.) by GPS proximity. | 100% ethical, non-commercial flow: `Donor ➔ Accredited Blood Bank ➔ Patient`, preventing illicit black-market blood trading. |

---

## 🏛️ Ecosystem Architecture

```
                                  ┌─────────────────────────────────────────────────────────────┐
                                  │                OMINIPULSE HEALTH ECOSYSTEM                  │
                                  │                   (TeamAlafia — TrackC)                     │
                                  └──────────────────────────────┬──────────────────────────────┘
                                                                 │
          ┌──────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┐
          ▼                                                      ▼                                                      ▼
┌──────────────────────────────┐                       ┌──────────────────────────────┐                       ┌──────────────────────────────┐
│     PATIENT MOBILE APP       │                       │    CLINICAL DESKTOP & WEB    │                       │     PUBLIC MARKETING WEB     │
│    (React Native / Expo)     │                       │   (Electron + Next.js 14)    │                       │    (Next.js 14 App Router)   │
│ • Free Patient Registration  │                       │ • Platform Super Admin       │                       │ • 3D Anatomical Body Map     │
│ • AI Symptom Triage          │                       │ • Doctor Clinical Practice   │                       │ • Educational Resources      │
│ • Video Telehealth & Chat    │                       │ • Inpatient Wards & Beds     │                       │ • Find Verified Doctors      │
│ • Vitals Sentinel Monitor    │                       │ • Pharmacy & Formulary       │                       │ • Hospital Directory         │
│ • Emergency Blood Request    │                       │ • Pathology Laboratory       │                       │ • App Download Portals       │
│ • NDPA Data Portability      │                       │ • Blood Bank Management      │                       │ • Desktop App Gate on /login │
└──────────────┬───────────────┘                       └──────────────┬───────────────┘                       └──────────────┬───────────────┘
               │                                                      │                                                      │
               └──────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┘
                                                                      │
                                                      ┌───────────────┴───────────────┐
                                                      ▼                               ▼
                                       ┌─────────────────────────────┐  ┌─────────────────────────────┐
                                       │    EXPRESS.JS REST & WS     │  │    UNIFIED SUPABASE CLOUD   │
                                       │ • RBAC HTTP API Layer       │  │ • PostgreSQL 16 (30 Tables) │
                                       │ • WebSocket Realtime Hub    │  │ • GoTrue Authentication     │
                                       │ • Groq AI Failover Chain    │  │ • Row-Level Security (RLS)  │
                                       │ • Vitals Sentinel Engine    │  │ • Storage & Edge Functions  │
                                       └─────────────────────────────┘  └─────────────────────────────┘
```

---

## 🌟 Key Platform Capabilities & Modules

### 1. 🏥 Hospital Operating System (HMS / Inpatient Care)
- **Live 18-Bed Wards Matrix**: 6 critical care units:
  - **Intensive Care Unit (ICU)** (3 beds)
  - **Emergency Resuscitation** (3 beds)
  - **Male Surgical Ward** (3 beds)
  - **Female Medical Ward** (3 beds)
  - **Pediatrics & Neonatal** (3 beds)
  - **Maternity & Labor** (3 beds)
- **Dynamic 4-State Bed Lifecycle**: `available` (green), `occupied` (blue), `cleaning_required` (amber), and `maintenance` (slate).
- **Hospital Pharmacy & Dispensary**: Real-time prescription fulfillment queue linked directly to doctor e-prescriptions, batch expiry warnings, unit price calculation, and re-order thresholds.
- **Clinical Pathology & Diagnostics Laboratory**: Specimen collection pipeline (Whole Blood, Serum, Plasma, Urine, Swab), quantitative reference range validation, MLS electronic sign-offs, and printable PDF lab slips.
- **Institutional Billing & Invoices**: FIRS-compliant institutional invoices, automated 85/15 hospital net disbursement split, and 1-click printable PDF receipts.

### 2. 👨‍⚕️ Doctor Clinical Practice & MDCN Verification Lock
- **Mandatory 5-Credential Audit**: MDCN practicing license, National Identity Number (NIN), specialty certificate, letter of employment, and passport photograph.
- **Verification Lock**: Unverified doctors cannot consult, message patients, issue e-prescriptions, or bill fees until audited and approved by the Super Admin.
- **SOAP Clinical Documentation**: Structured Subjective, Objective, Assessment, and Plan clinical recording with automated drug interaction alerts.
- **Escrow Settlement Guarantee**: Consultation fees are held in secure escrow until the appointment is completed. Non-performance results in immediate doctor suspension and 100% patient reimbursement.

### 3. 🩺 Patient Telehealth & AI Intelligence
- **Interactive 3D Anatomical Body Map**: Visual symptom selector allowing patients to click body regions (Head, Chest, Abdomen, Spine, Limbs) on a 3D anatomical model for instant specialist doctor matching.
- **AI Symptom Guidance & CDS**: Powered by Groq's high-speed inference chain with safety guardrails blocking dangerous self-medication or overdose attempts.
- **Rule-Based Vitals Sentinel**: Real-time anomaly detection for systolic/diastolic blood pressure, oxygen saturation, and heart rate (flags hypertensive urgencies and hypoxic states).
- **Universal Wearable Inclusivity**: Syncs with Apple HealthKit, Google Health Connect, Bluetooth BLE monitors, or manual vitals logging fallback.

### 4. 🚨 Non-Commercial Emergency Blood Network
- **"Request Blood Now" Emergency Mode**:
  - Instant compatible blood group matching (`O-` universal donor, `O+`, `A+`, `B+`, etc.) prioritized by GPS proximity.
  - Urgent push broadcast to nearby verified voluntary donors.
  - One-tap emergency dispatch hotlines (National 112, OminiPulse Emergency Blood Desk).
- **Strict Ethical Policy**: Strictly forbids commercial blood sales. The system only coordinates `Voluntary Donor ➔ Accredited Hospital / Blood Bank ➔ Patient`.

### 5. 🛡️ NDPA 2023 Compliance & Security
- **Row-Level Security (RLS)**: Enforces at the database level that patients only see their own records, doctors only access their active patients, and hospital staff access only their department queues.
- **Article 26 Data Portability**: 1-click complete medical history export in PDF/ZIP formats.
- **Zero-Browser-Alert UI**: Eliminates native browser popups in favor of secure, customized in-app modal sheets.

---

## 🔑 Pre-Configured Demo Personas & Credentials

For fast evaluation during the **NITDA Hackathon**, use the pre-configured accounts below (seeded in the database):

### 1. Platform Super Admin & Governance (`desktop/` or `/login`)
| Role Badge | Persona Name | Email | Password | Primary Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Adaora Obi | `superadmin@ominipulse.ai` | `OminiAdmin2026!` | `/dashboard/hospitals` |
| **MDCN Verification Admin** | Ngozi Eze | `verification@ominipulse.ai` | `VerifyAdmin2026!` | `/dashboard/doctors` |
| **Support & Dispute Admin** | Tunde Bakare | `support@ominipulse.ai` | `SupportAdmin2026!` | `/dashboard/reports` |
| **Security & NDPA Officer** | Halima Bello | `security@ominipulse.ai` | `SecureAdmin2026!` | `/dashboard/security` |
| **Clinical Moderator** | MLS. Emeka Nnamdi | `moderator@ominipulse.ai` | `Moder8Admin2026!` | `/dashboard/blood-donors` |
| **Hospital Relations Lead** | Yetunde Adeyemi | `hospitalrel@ominipulse.ai` | `PartnerAdmin2026!` | `/dashboard/billing` |

### 2. Verified Doctor (Mobile & Desktop Portal)
| Role Badge | Persona Name | Email | Password | Specialization |
| :--- | :--- | :--- | :--- | :--- |
| **Lead Consultant** | Dr. Folake Ademola | `doctor@ominipulse.ai` | `Doctor2026!` | Cardiology (MDCN Verified) |
| **Hospital Consultant** | Dr. Babatunde Adeyemi | `dr.adeyemi@xyzspecialist.ng` | `DocPass2026!` | Internal Medicine |

### 3. Patient (Mobile Application)
| Role Badge | Persona Name | Email | Password | Medical Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Chioma Egwu | `patient@ominipulse.ai` | `Patient2026!` | Type 2 Diabetes, Hypertension, O+ / AA |

### 4. Hospital Multi-Department Operations Staff (`desktop/`)
| Department | Persona Name | Email | Password | Sub-Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **Hospital Admin / Director** | Dr. Chidiebere Okeke | `admin@xyzspecialist.ng` | `HospPass2026!` | `/dashboard/hospital-portal` |
| **Wards & Inpatient Nurse** | Nurse Amina Yusuf | `nurse@xyzspecialist.ng` | `Nurse2026!` | `?tab=wards` |
| **Hospital Pharmacist** | Pharm. Chioma Okonkwo | `pharmacist@xyzspecialist.ng` | `Pharm2026!` | `?tab=pharmacy` |
| **Medical Lab Scientist** | MLS. Emeka Nnamdi | `labtech@xyzspecialist.ng` | `LabTech2026!` | `?tab=laboratory` |
| **Blood Bank Officer** | Musa Garba | `bloodbank@xyzspecialist.ng` | `BloodBank2026!` | `?tab=blood` |
| **Front Desk Receptionist** | Fatima Mohammed | `reception@xyzspecialist.ng` | `Reception2026!` | `?tab=appointments` |

---

## 💻 Tech Stack Overview

- **Mobile Application**: React Native 0.86, Expo SDK 57, TypeScript, React Navigation v7, Zustand, TanStack Query, React Native Reanimated.
- **Desktop Clinical Suite**: Electron, Next.js 14 (App Router), TypeScript, Vanilla CSS Design System, Lucide Icons.
- **Public Marketing Web**: Next.js 14 (App Router), Three.js / React Three Fiber (3D Anatomical Body Map), Vanilla CSS.
- **Backend API & Realtime**: Node.js, Express.js, WebSocket (`ws`), Zod schema validation, Helmet, Rate Limiting.
- **Database & Auth**: Supabase PostgreSQL 16 (30 relational tables, triggers, RPC procedures), Supabase GoTrue Auth, Row-Level Security (RLS).
- **AI & Medical Intelligence**: Groq Inference API (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `groq/compound-mini`, `allam-2-7b`), Vitals Sentinel Engine.

---

## 🛠️ Complete Setup & Installation Guide

### 1. Prerequisites
Ensure you have the following installed on your development machine:
- **Node.js**: `v18.17.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **Git**
- **Mobile Testing**: **Expo Go** app on your physical iOS or Android phone, or Android Studio / Xcode simulator.

---

### 2. Repository Cloning & Dependency Installation

Clone the repository and install dependencies across each module:

```bash
# Clone the repository
git clone https://github.com/your-org/ominipulse.git
cd "Omini puls"

# 1. Install root dependencies (Mobile App)
npm install

# 2. Install Desktop Application dependencies
cd desktop
npm install
cd ..

# 3. Install Public Web dependencies
cd admin
npm install
cd ..

# 4. Install Express Backend dependencies
cd backend
npm install
cd ..
```

---

### 3. Environment Configuration

#### A. Mobile Application (`.env` in repository root)
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

#### B. Desktop Clinical Suite (`desktop/.env.local`)
Create `desktop/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

#### C. Express Backend (`backend/.env`)
Copy the template in `backend/`:
```bash
cp backend/.env.example backend/.env
```
Fill in your credentials:
```env
NODE_ENV=development
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ORIGINS=*
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
GROQ_FALLBACK_MODELS=openai/gpt-oss-20b,groq/compound-mini,allam-2-7b
```

> **Note**: If no Groq API key is provided, the backend automatically falls back to deterministic rule-based medical triage and vitals analysis.

---

### 4. Database Setup & Migrations (Supabase)

All client platforms share a single Supabase PostgreSQL database:

1. **Create a Supabase Project** at [https://supabase.com](https://supabase.com).
2. **Apply Migrations**:
   Run the SQL migration scripts in order from the `supabase/migrations/` directory using the Supabase SQL Editor:
   - `0001_unified_schema.sql` (Creates all 30 relational tables, enums, indexes, and triggers)
   - `0002_rls_policies.sql` (Row-Level Security rules)
   - `0003_auth_functions.sql` (Auth session, slots, and atomic escrow release RPCs)
   - `0004_ai_engine.sql` (AI conversation logs, tokens, and usage metrics)
   - `0005_security_hardening.sql` (Role-injection lock and security hardening)
3. **Load Demo Seed Data**:
   Copy and run `supabase/seed.sql` into the Supabase SQL Editor. This populates the demo accounts (`auth.users`), hospital wards, 18 inpatient beds, pharmacy drugs, and test vitals.

---

### 5. Running the Application Modules

You can launch any component using the unified npm scripts from the root directory:

#### Run the Mobile Application (Patient & Doctor)
```bash
# Starts the Expo development server
npm run mobile

# Or start directly with cache clear:
npx expo start -c
```
- Open the **Expo Go** app on your physical Android or iPhone and scan the QR code displayed in your terminal.
- Or press `a` for Android Emulator or `i` for iOS Simulator.

#### Run the Desktop Clinical & Hospital Operating System
```bash
# Option A: Run inside Electron Desktop Environment (Native Window)
npm run desktop

# Option B: Run in browser for rapid web inspection (Port 3000)
npm run desktop:web
```
- Navigate to `http://localhost:3000/login` to use the 8-persona 1-click clinical login.

#### Run the Public Marketing & Educational Website
```bash
# Starts the public website on port 3001
npm run web
```
- Access at `http://localhost:3000` (or `http://localhost:3001` if desktop is running). Features the interactive 3D Anatomical Body Map.

#### Run the Express.js Backend API
```bash
cd backend
npm run dev
```
- API server runs at `http://localhost:8080` with health check at `http://localhost:8080/health`.

---

## 🧪 NITDA Hackathon Evaluation Guide

Judges can execute the following validation walkthroughs in under 5 minutes:

### 🔬 Test Flow 1: Patient AI Triage & Telehealth Booking
1. Launch the **Mobile App** (`npm run mobile`).
2. Sign in with the seeded patient credentials (`patient@ominipulse.ai` / `Patient2026!`).
3. View the **Chronic Care & Vitals** dashboard showing real-time blood pressure and glucose tracking.
4. Tap **AI Health Assistant**: enter symptoms like *"Persistent throbbing headache and fever for 3 days"*.
5. Observe the Groq AI triage classification, medical disclaimer, and matched specialist recommendation.
6. Book an appointment with **Dr. Folake Ademola**; observe the atomic slot reservation and escrow notice.

### 🔬 Test Flow 2: Doctor Clinical SOAP Notes & e-Prescription
1. Sign in to the **Desktop Portal** (`npm run desktop:web`) as **Doctor** (`doctor@ominipulse.ai` / `Doctor2026!`).
2. Navigate to `/dashboard/doctor-portal`.
3. View the patient's incoming appointment in the schedule.
4. Fill in the **SOAP Note** (Subjective, Objective, Assessment, Plan).
5. Generate an **e-Prescription**; note the drug-drug interaction warning alert.
6. Complete the consultation and release the escrow payout.

### 🔬 Test Flow 3: Hospital Ward & 18-Bed Occupancy Matrix
1. Sign in as **Nurse Amina Yusuf** (`nurse@xyzspecialist.ng` / `Nurse2026!`).
2. Navigate to `/dashboard/hospital-portal?tab=wards`.
3. View the 18 beds across ICU, Emergency, Surgical, and Maternity wards.
4. Click an available bed (`ICU-02`) to open the **Admit Patient Modal**. Enter patient details and admit.
5. Watch the bed status transition from `available` (green) to `occupied` (blue).
6. Discharge the patient: the bed updates to `cleaning_required` (amber) with an automatic housekeeping dispatch.

### 🔬 Test Flow 4: Hospital Pharmacy & Pathology Lab
1. As **Hospital Pharmacist** (`pharmacist@xyzspecialist.ng` / `Pharm2026!`):
   - Switch to `?tab=pharmacy`.
   - Inspect the live prescription queue and dispense medications with stock level auto-deduction.
2. As **Medical Lab Scientist** (`labtech@xyzspecialist.ng` / `LabTech2026!`):
   - Switch to `?tab=laboratory`.
   - Open a pending diagnostic lab order, input values, and generate an official signed pathology slip.

### 🔬 Test Flow 5: Platform Super Admin & MDCN Credential Verification
1. Sign in as **Super Admin** (`superadmin@ominipulse.ai` / `OminiAdmin2026!`).
2. Open `/dashboard/doctors` to inspect pending doctor applications.
3. Review uploaded MDCN licenses, specialty certifications, and NIN identity documents.
4. Approve or reject practitioners to toggle their practicing lock state in real-time.

---

## 🔒 Regulatory & Security Compliance

- **MDCN Regulatory Architecture**: Doctors cannot practice without authenticated MDCN license numbers. Suspended practitioners are instantly barred across all platforms via the database-level eligibility gate.
- **NDPA 2023 Compliance**:
  - In full compliance with Section 24 and Section 26 of the **Nigeria Data Protection Act 2023**.
  - Strict purpose specification and granular consent options before sharing health records.
  - Full data portability: Patients can trigger an Article 26 export of their comprehensive health history.
- **Non-Commercial Blood Facilitation**: Strictly adheres to the National Blood Transfusion Commission guidelines prohibiting the commercial sale of human blood.

---

## 👥 Team: TeamAlafia | Category: University Category | Track: TrackC

Developed for the **NITDA International Cybersecurity Conference (ICSC) Hackathon** by **TeamAlafia** (**University Category — TrackC: HealthTech & Digital Trust**):
- Dedicated to building resilient, secure, and life-saving digital public infrastructure for Nigeria and Africa.
- For inquiries, partnerships, or technical evaluations: `teamalafia@ominipulse.ai`

---

*© 2026 OminiPulse Health Technologies Ltd. Built with pride by **TeamAlafia** for **TrackC** (University Category) at the NITDA ICSC Hackathon.*
