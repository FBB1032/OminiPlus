# 🏥 OminiPulse — AI-Powered Telehealth & Medical Ecosystem

> **Official Repository Documentation & Developer Quick-Start Guide**  
> **Version**: 2.0.0 (Production-Ready Edition)  
> **Target Markets**: Nigeria & Pan-Africa  
> **Compliance Standard**: NDPA 2023 (Nigeria Data Protection Act) & MDCN Regulatory Guidelines  
> **Master Architecture & Technical Blueprint**: [`NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md)

---

## 🎯 Executive Overview

**OminiPulse** is an enterprise-grade, AI-driven healthcare platform delivering end-to-end digital medical services across Nigeria. The platform seamlessly bridges Patients, Certified Doctors, Partner Pharmacies, Emergency Hospitals, and Regulatory Authorities (MDCN) within a secure, closed-loop ecosystem.

```
                  ┌────────────────────────────────────────┐
                  │          OMINIPULSE ECOSYSTEM          │
                  └──────────────────┬─────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   PATIENT APP    │       │   DOCTOR APP     │       │   ADMIN CONSOLE  │
│ (React Native)   │       │ (React Native)   │       │ (Next.js 14 Web) │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                     │
                   ┌─────────────────┴─────────────────┐
                   ▼                                   ▼
        ┌──────────────────────┐            ┌──────────────────────┐
        │  NESTJS BACKEND API  │            │  TOP 3 MEDICAL AI    │
        │ (PostgreSQL + Redis) │            │ (Gemini + Deepgram)  │
        └──────────────────────┘            └──────────────────────┘
```

---

## 🧭 Master Roadmap & Architecture Guide

> [!IMPORTANT]
> **Attention Developers & AI Coding Agents**:  
> Before writing new features or modifying backend contracts, **you MUST read the Master Roadmap Blueprint**:  
> 🔗 [**NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md**](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md)

### 📌 Development Quick-Start Matrix

| Role / Domain | Where To Start | Immediate Task |
| :--- | :--- | :--- |
| **Mobile Developer (Patient & Doctor App)** | [`src/navigation/RootNavigator.tsx`](./src/navigation/RootNavigator.tsx) & [`src/screens/`](./src/screens/) | Review closed-loop UI states for Doctor Verification Locks, Availability setup, and Patient Telehealth. |
| **Backend Developer (API & DB)** | [Roadmap Stage 2 Architecture](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md#stage-2-backend-architecture--payment-gateway-integration) | Implement NestJS API Gateway, Prisma PostgreSQL schema, and Paystack/Flutterwave Automated Split Payout webhooks. |
| **AI / Machine Learning Engineer** | [Roadmap Stage 5 AI Blueprint](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md#stage-5-top-3-medical-ai-engine-blueprint) | Configure `.env` AI keys (`GEMINI_API_KEY`, `DEEPGRAM_API_KEY`) to activate Doctor SOAP Copilot, Document OCR, and AI Health Insights. |
| **Admin Web Developer** | [`admin/src/`](./admin/src/) | Build Next.js 14 Doctor MDCN Verification Console, Blood Donor Admin Audit, Incident Escalation Board, and Financial Payout Ledger. |
| **Future Release Roadmap** | [`NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md) | Multi-member Family Accounts (dedicated tier pricing), Enterprise Health Subscriptions, and Wearable Background Daemons. |

---

## ✨ Key Platform Features

### 👨‍⚕️ Doctor Portal & MDCN Verification Lock
- **MDCN Legal Verification Lock**: Unverified doctors are strictly locked from consultation messaging, video calls, e-prescribing, and schedule availability until approved by Admin.
- **5 Mandatory Credentials Verification**: MDCN License (with expiration enforcement & 30-day renewal grace period), NIN National ID, Specialty Certificate, Hospital Employment Letter, and Passport Photo.
- **Escrow Payment & Non-Performance Policy**: Consultation fees are held in OminiPulse Escrow until session completion. Doctor non-performance results in immediate account suspension and a 100% patient refund.
- **SOAP Clinical Notes & Prescriptions**: Write structured SOAP consultation notes and digitally signed e-prescriptions with automated multi-drug interaction safety warnings.

### 🩺 Patient Telehealth & AI Intelligence
- **AI Assistant & Triage Engine**: Google Gemini 1.5 Pro-powered symptom guidance with prominent medical disclaimers, top 3 doctor routing with ratings and verified patient feedback.
- **AI Health Insights**: Personalized vitals analysis (BP risk, heart rate trends, BMI category, lifestyle recommendations) in [`AIHealthInsightsScreen.tsx`](./src/screens/patient/AIHealthInsightsScreen.tsx).
- **AI Document Summarization (OCR)**: Scan prescription labels and lab test reports with 1-tap AI value extraction and EHR cross-referencing.
- **7-Day Medication Adherence Tracker**: Interactive adherence tracking chart with pill alarms and dose logging in [`MedicationRemindersScreen.tsx`](./src/screens/patient/MedicationRemindersScreen.tsx).
- **Chronic Disease Monitoring**: AI-driven condition tracking for Hypertension (BP), Diabetes (Glucose), Asthma (Peak Flow), and Pregnancy (Maternal Health) in [`ChronicDiseaseScreen.tsx`](./src/screens/patient/ChronicDiseaseScreen.tsx).
- **Smartwatch & Universal Wearable Inclusivity**: Integration with Apple Watch, Redmi (via Google Health Connect), Huawei Health, Bluetooth BLE medical monitors, and manual vitals logging fallback. Works with or without a watch.

### 🚨 Emergency Mode & Blood Donor Network
- **"Request Blood Now" (Emergency Mode)**: Life-threatening emergency blood request flow featuring:
  - Instant compatible blood group matching (`O-` universal, `O+`, `A+`, `B+`, etc.) ranked by GPS proximity.
  - Urgent push notification and SMS alert broadcast to nearby verified donors.
  - Directory of nearest accredited hospital blood banks (LUTH, Lagos State Transfusion Service, FMC Yaba).
  - One-tap emergency dials (National Emergency 112, OminiPulse Blood Desk, Hospital Transfusion Desk).
- **Strict Non-Commercial Blood Regulatory Facilitation**:
  - Direct buying/selling of blood is strictly prohibited. The platform facilitates:
    `Voluntary Donor ➔ Accredited Hospital / Blood Bank ➔ Patient`
  - No donor-to-patient monetary transactions are allowed.
- **Admin Donor Verification**: Mandatory lab report upload during registration. Profiles are audited and approved by Admin before appearing in public donor searches.

### 🛡️ NDPA 2023 Data Privacy & Compliance
- **100% NDPA Compliant**: Full alignment with the Nigeria Data Protection Act (NDPA 2023).
- **NDPA Article 26 Data Export**: 1-click encrypted PDF/ZIP export of complete EHR history and medical reports.
- **Per-Record Access Controls**: Patients can set records to "Visible to me only (Hidden from doctors)".
- **Real-Time Audit Trail**: Automated audit logging tracks every instance a doctor or provider views a patient record.

---

## 🛠️ Technology Stack

- **Mobile Frontend**: React Native, Expo SDK 54, TypeScript, React Navigation v6, React Query (TanStack Query), Zustand state management.
- **Web Admin Console**: Next.js 14 (App Router), Tailwind CSS, TypeScript.
- **Backend Architecture**: NestJS, PostgreSQL 16+, Prisma ORM, Redis, BullMQ queues.
- **Payment Processing**: Paystack API & Flutterwave Split Payments API (Automated 90/10 split payouts & Escrow holding).
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

### 2. Admin Web Console Setup
```bash
# Navigate to admin directory
cd admin

# Install admin dependencies
npm install

# Start Next.js development server
npm run dev
```

### 3. Running Type Safety Verification
```bash
# Run TypeScript compilation check across codebase
npx tsc --noEmit
```

---

## 📄 License

Copyright © 2026 OminiPulse Health Technologies Ltd. All rights reserved.

## 📂 Project Structure

```
Omini Pulse/
├── NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md  <-- 🌟 MASTER ARCHITECTURE BLUEPRINT
├── README.md                                <-- Project documentation & onboarding
├── App.tsx                                  ├── Expo entry point
├── app.json                                 ├── Expo app configuration
├── package.json                             ├── Project dependencies & scripts
├── admin/                                   ├── Next.js Web Admin Console
│   ├── src/
│   │   ├── app/                             ├── Admin pages (Dashboard, Verification, Incidents)
│   │   └── components/                      ├── Admin UI components & sidebar
├── assets/                                  ├── Brand logos, doctor photography & icons
├── src/                                     ├── Mobile Application Core
│   ├── api/                                 ├── API services & mock repositories
│   ├── components/                          ├── Reusable React Native UI components
│   ├── constants/                           ├── Legal Terms, Doctor Agreement, Patient Policy
│   ├── features/                            ├── Auth, Onboarding & Feature Modules
│   ├── hooks/                               ├── React Hooks (useAuth, usePatient, useDoctor)
│   ├── navigation/                          ├── React Navigation (Auth, Patient & Doctor Tabs)
│   ├── screens/                             ├── Mobile Screens (Patient, Doctor & Shared)
│   ├── store/                               ├── Zustand Global State (authStore, etc.)
│   ├── theme/                               ├── Design Tokens (Colors, Typography, Spacing)
│   └── types/                               ├── TypeScript interfaces & navigation params
```

---

## ⚖️ Legal & Regulatory Standards

- **MDCN Compliance**: Built in compliance with Medical and Dental Council of Nigeria regulations. Unverified practice is strictly blocked.
- **Data Protection**: Designed in accordance with NDPR (Nigeria Data Protection Regulation) and NDPA standards for encrypted EHR transmission.

---

*For technical inquiries or architecture clarification, refer to [`NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md).*
