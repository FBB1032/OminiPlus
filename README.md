# 🏥 OminiPulse — AI-Powered Telehealth, Hospital Operating System & Medical Ecosystem

> **Official Repository Documentation & Developer Quick-Start Guide**  
> **Version**: 2.2.0 (Enterprise Health Ecosystem Edition)  
> **Target Markets**: Nigeria & Pan-Africa  
> **Compliance Standard**: NDPA 2023 (Nigeria Data Protection Act) & MDCN Regulatory Guidelines  
> **Master Architecture & Technical Blueprint**: [`NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md)

---

## 🎯 Executive Overview

**OminiPulse** is an enterprise-grade, AI-driven healthcare platform delivering end-to-end digital medical services across Africa. The platform seamlessly connects **Patients**, **Certified Independent Doctors**, **Accredited Hospitals & Clinics**, **Internal Hospital Departments** (Wards, Pharmacy, Diagnostics Laboratory, Blood Bank), and **Regulatory Authorities (MDCN)** within a secure, closed-loop ecosystem.

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 OMINIPULSE HEALTH ECOSYSTEM                 │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │
         ┌───────────────────────────────┬───────┴───────────────────────┬───────────────────────────────┐
         ▼                               ▼                               ▼                               ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│   PATIENT APP    │            │   DOCTOR APP     │            │  HOSPITAL PORTAL │            │  PLATFORM ADMIN  │
│ (React Native)   │            │ (React Native)   │            │ (Next.js 14 Web) │            │ (Next.js 14 Web) │
│ • 100% Free Reg  │            │ • 100% Free Reg  │            │ • Multi-Dept Ops │            │ • MDCN Audits    │
│ • Pay per Doctor │            │ • Sets Own Fee   │            │ • Undisclosed    │            │ • Hospital ARR   │
│ • 3D Symptom Map │            │ • 90/10 Split    │            │   Enterprise Fee │            │ • Disciplinary   │
└────────┬─────────┘            └────────┬─────────┘            └────────┬─────────┘            └────────┬─────────┘
         │                               │                               │                               │
         └───────────────────────────────┼───────────────────────────────┴───────────────────────────────┘
                                         │
                       ┌─────────────────┴─────────────────┐
                       ▼                                   ▼
            ┌──────────────────────┐            ┌──────────────────────┐
            │  NESTJS BACKEND API  │            │  TOP 3 MEDICAL AI    │
            │ (PostgreSQL + Redis) │            │ (Gemini + Deepgram)  │
            └──────────────────────┘            └──────────────────────┘
```

---

## 💰 Pricing & Commercial Model

| Healthcare Role | Account Creation & Access | Pricing & Financial Mechanism |
| :--- | :--- | :--- |
| **Patient** | **100% Free** | Patients only pay the consultation fee when booking an appointment with a verified doctor. No subscription or hidden signup fees. |
| **Doctor** | **100% Free** | Doctors register and verify their credentials for free. Each doctor **sets their own consultation fee** (e.g. ₦10,000 – ₦50,000). OminiPulse deducts a transparent platform commission percentage upon completion held in escrow. |
| **Hospital / Clinic** | **Enterprise Quotation** | Hospital subscription pricing is undisclosed publicly. Facilities contact the **OminiPulse Institutional Desk** (`partnerships@ominipulse.ai`) for custom tier pricing based on licensed bed count and departmental modules. |

---

## 🏛️ Comprehensive Role & Department Architecture

OminiPulse implements an 8-role granular permission matrix (`AdminRole`) supporting both platform oversight and hospital sub-department operations:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             ROLE WORKSPACE SPECIFICATIONS                              │
├──────────────────┬──────────────────────┬──────────────────────────────────────────────┤
│ Role             │ Primary Workspace    │ Core Responsibilities                        │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `admin`          │ `/dashboard/hospitals`│ Platform Super Admin: Hospital onboarding,   │
│                  │                      │ doctor MDCN audits, incident council, ARR.   │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `doctor`         │ `/doctor-portal`     │ Independent Clinical Practice: Patient video │
│                  │                      │ calls, SOAP notes, e-prescriptions, payouts. │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `hospital_admin` │ `/hospital-portal`   │ Medical Director / Hospital GM: Staff badges,│
│                  │                      │ department access, beds, billing & revenue.  │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `nurse`          │ `?tab=wards`         │ Ward Floor Management: Inpatient admissions, │
│                  │                      │ bed status transfers, discharge & cleaning.  │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `pharmacist`     │ `?tab=pharmacy`      │ Hospital Dispensary: Prescription orders,    │
│                  │                      │ stock formulary, batch expiry alerts.        │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `lab_technician` │ `?tab=laboratory`    │ Clinical Diagnostics: Specimen intake, test  │
│                  │                      │ verification, digital pathology reports.     │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `blood_officer`  │ `?tab=blood`         │ Transfusion Unit: Blood bank reserve tracking│
│                  │                      │ crossmatching, voluntary donor screening.    │
├──────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ `receptionist`   │ `?tab=appointments`  │ Front Desk: Patient triage, intake queues,   │
│                  │                      │ doctor appointments, bed inquiry routing.    │
└──────────────────┴──────────────────────┴──────────────────────────────────────────────┘
```

---

## ✨ Key Platform Capabilities

### 🏥 1. Hospital Operating System (HMS / Inpatient Care)
- **Wards & Beds Real-Time Matrix**:
  - 18 licensed beds mapped across 6 specialized departments: **Intensive Care Unit (ICU)**, **Emergency Resuscitation**, **Male Surgical**, **Female Medical**, **Pediatrics & Neonatal**, and **Maternity**.
  - Dynamic 4-state lifecycle: `available` (green), `occupied` (blue), `cleaning_required` (amber), and `maintenance` (slate).
  - Quick patient admission modal, inter-ward bed transfers with automatic housekeeping alerts, and 1-click sanitized status releases.
- **Hospital Pharmacy & Formulary**:
  - Real-time prescription queue with patient chart linking and 1-click dispensing.
  - Drug inventory tracker with re-order thresholds, unit prices, batch numbers, and batch expiration dates.
  - "Add Medication Stock" modal with automated low-stock warnings.
- **Clinical Diagnostics & Pathology Laboratory**:
  - Specimen collection pipeline (Whole Blood, Serum, Plasma, Midstream Urine, Nasopharyngeal Swab).
  - Test order status pipeline (`sample_collected`, `analyzing`, `results_ready`).
  - Diagnostic pathology report generator with quantitative values, standard reference ranges, pathologist notes, and electronic signature sign-offs (`MLS. Emeka Nnamdi`).
  - Printable official laboratory slips.
- **Enterprise Hospital Billing & Invoices**:
  - Annual enterprise software contract tier management (Active Tier 2 License).
  - Automated revenue disbursement breakdown (85% facility net / 15% platform fee).
  - FIRS-compliant institutional invoices with 1-click printable PDF receipts.

### 👨‍⚕️ 2. Doctor Portal & MDCN Verification Lock
- **MDCN Legal Verification Lock**: Unverified doctors cannot consult, message patients, generate e-prescriptions, or set availability until approved.
- **5 Mandatory Credentials**: MDCN License (with 30-day renewal grace period), NIN National ID, Specialty Certificate, Employment Letter, and Passport Photo.
- **Escrow Payment & Non-Performance Policy**: Consultation fees are held in escrow until session completion. Doctor non-performance results in immediate account suspension and a 100% patient refund.
- **SOAP Clinical Notes & Prescriptions**: Structured clinical notes and digitally signed e-prescriptions with multi-drug interaction safety warnings.

### 🩺 3. Patient Telehealth & AI Intelligence
- **3D Anatomical Body Map**: Interactive 3D anatomical viewer on the web landing page allowing patients to point to specific body symptoms (Head, Chest, Abdomen, Spine, Limbs) for instant specialist doctor matching.
- **AI Symptom Guidance**: Google Gemini 1.5 Pro-powered symptom guidance with medical disclaimers and top 3 doctor routing with ratings and verified patient feedback.
- **AI Health Insights**: Personalized vitals analysis (BP risk, heart rate trends, BMI category, lifestyle recommendations).
- **AI Document Summarization (OCR)**: Scan prescription labels and lab test reports with 1-tap AI value extraction and EHR cross-referencing.
- **Universal Wearable Inclusivity**: Integration with Apple Watch, Redmi (via Google Health Connect), Huawei Health, Bluetooth BLE medical monitors, and manual vitals logging fallback. Works with or without a watch.

### 🚨 4. Emergency Mode & Non-Commercial Blood Donor Network
- **"Request Blood Now" (Emergency Mode)**: Life-threatening emergency blood request flow featuring:
  - Instant compatible blood group matching (`O-` universal, `O+`, `A+`, `B+`, etc.) ranked by GPS proximity.
  - Urgent push notification and SMS alert broadcast to nearby verified donors.
  - Directory of nearest accredited hospital blood banks (LUTH, Lagos State Transfusion Service, FMC Yaba).
  - One-tap emergency dials (National Emergency 112, OminiPulse Blood Desk, Hospital Transfusion Desk).
- **Strict Non-Commercial Blood Regulatory Policy**:
  - Direct buying/selling of blood is strictly prohibited. The platform facilitates:
    `Voluntary Donor ➔ Accredited Hospital / Blood Bank ➔ Patient`
  - No donor-to-patient monetary transactions are allowed.
- **Admin Donor Verification**: Mandatory lab report upload during registration. Profiles are audited and approved by Admin before appearing in public donor searches.

### 🛡️ 5. Zero-Browser-Alert Modern UI Standard
- **100% Custom In-App Modals**: All native browser `alert(...)` popups have been removed.
- Rich dialogs handle Diagnostic Pathology Reports, Institutional Billing Inquiries, Invoice PDF Receipts, Bed Capacity Notices, and Mobile App QR Download Previews.

---

## 🛠️ Technology Stack

- **Mobile Frontend**: React Native, Expo SDK 54, TypeScript, React Navigation v6, React Query, Zustand state management.
- **Web Admin & Hospital Console**: Next.js 14 (App Router), Vanilla CSS Design System, Lucide React, TypeScript.
- **Backend Architecture**: NestJS, PostgreSQL 16+, Prisma ORM, Redis, BullMQ queues.
- **Payment Processing**: Paystack API & Flutterwave Split Payments API (Automated 90/10 doctor split payouts & Escrow holding).
- **AI & ML Engine**: Google Gemini 1.5 Pro (Clinical CDS & Insights), Deepgram Nova-2 Medical (Voice SOAP Notes), OCR Vision (Document Scanning).

---

## 🚀 Quick Start Guide

### 1. Mobile App Setup
```bash
# Clone the repository
git clone https://github.com/omini-pulse/omini-pulse.git
cd omini-pulse

# Install dependencies
npm install

# Start Expo development server (with cache reset)
npx expo start -c
```

### 2. Admin & Hospital Web Console Setup
```bash
# Navigate to admin directory
cd admin

# Install admin dependencies
npm install

# Start Next.js development server
npm run dev
# Console will be available at http://localhost:3000
```

### 3. Demo Persona Logins (Instant Login Presets)
On the web console sign-in page (`http://localhost:3000/login`), click any preset button to test role-specific workspaces:
- **Platform Super Admin**: `admin@ominipulse.ai`
- **Hospital Administrator**: `admin@xyzspecialist.ng`
- **Lead Consultant Doctor**: `dr.adeyemi@xyzspecialist.ng`
- **Senior Ward Nurse**: `a.yusuf@xyzspecialist.ng`
- **Front-Desk Receptionist**: `f.mohammed@xyzspecialist.ng`
- **Blood Bank Officer**: `m.garba@xyzspecialist.ng`
- **Chief Hospital Pharmacist**: `c.okonkwo@xyzspecialist.ng`
- **Medical Laboratory Scientist**: `e.nnamdi@xyzspecialist.ng`

### 4. Running Verification Checks
```bash
# Check TypeScript compilation across admin console
cd admin && npx tsc --noEmit
```

---

## 📄 License & Compliance

- **Copyright**: © 2026 OminiPulse Health Technologies Ltd. All rights reserved.
- **MDCN Compliance**: Built in strict compliance with the Medical and Dental Council of Nigeria regulations. Unverified practice is locked.
- **NDPA 2023 Compliance**: Built in accordance with Nigeria Data Protection Act (NDPA 2023) standards with Article 26 data portability export and per-record access controls.

---

*For technical inquiries or architecture clarification, refer to [`NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md).*
