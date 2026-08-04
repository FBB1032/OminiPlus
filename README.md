# 🏥 OminiPulse — AI-Powered Telehealth & Medical Ecosystem

> **Official Repository Documentation & Developer Quick-Start Guide**  
> **Version**: 2.0.0  
> **Target Markets**: Nigeria & Pan-Africa  
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

## 🧭 WHERE TO BEGIN: MASTER ROADMAP & ARCHITECTURE GUIDE

> [!IMPORTANT]
> **Attention Developers & AI Coding Agents**:  
> Before writing new features or modifying backend contracts, **you MUST read the Master Roadmap Blueprint**:  
> 🔗 [**NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md**](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md)

### 📌 Development Quick-Start Matrix

| Role / Domain | Where To Start | Immediate Task |
| :--- | :--- | :--- |
| **Mobile Developer (Patient & Doctor App)** | [`src/navigation/RootNavigator.tsx`](./src/navigation/RootNavigator.tsx) & [`src/screens/`](./src/screens/) | Review closed-loop UI states for Doctor Verification Locks, Availability setup, and Patient Telehealth. |
| **Backend Developer (API & DB)** | [Roadmap Stage 2 Architecture](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md#86) | Implement NestJS API Gateway, Prisma PostgreSQL schema, and Paystack/Flutterwave Automated Split Payout webhooks. |
| **AI / Machine Learning Engineer** | [Roadmap Stage 5 AI Blueprint](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md#314) | Configure `.env` AI keys (`GEMINI_API_KEY`, `DEEPGRAM_API_KEY`) to activate Doctor SOAP Copilot and Admin OCR verification. |
| **Admin Web Developer** | [`admin/src/`](./admin/src/) | Build Next.js 14 Doctor MDCN Verification Console, Incident Escalation Board, and Financial Payout Ledger. |

---

## ✨ Key Platform Features

### 👨‍⚕️ Doctor Portal & MDCN Verification Lock
- **MDCN Legal Verification Lock**: Unverified doctors are strictly locked from consultation messaging, video calls, e-prescribing, and schedule availability.
- **Platform Fee Breakdown**: Transparent fee calculation (e.g. ₦15,000 fee ➔ ₦1,500 10% platform commission, ₦13,500 net doctor payout).
- **Clean Payout Account Card**: Streamlined Wema Bank account display with in-card edit controls.
- **Practice Analytics**: Displays total **Patients Treated** and **Average Rating (★)** across consultations.

### 🩺 Patient Telehealth & AI Intelligence
- **24/7 AI Symptom Checker**: Medical guidance powered by Google Gemini 1.5 Pro.
- **Smartwatch Vitals Sync**: Real-time integration with Apple HealthKit & Google Health Connect (Heart Rate, SpO2, Blood Pressure).
- **GPS Pharmacy & Hospital Radar**: Locate open certified pharmacies for 1-tap prescription dispatch and emergency hospitals nearby.
- **Blood Donor Network**: Find and request compatible blood donors based on blood group & location.

### 🛡️ Admin Governance & Regulatory Escalation
- **MDCN Verification Moderation**: Review doctor license numbers, medical certificates, and government IDs.
- **Incident & Fraud Investigation**: Investigate patient reports of unprofessional conduct, apply fines, suspend accounts, or escalate severe cases to the **Medical and Dental Council of Nigeria (MDCN)** and law enforcement.
- **Role-Based Data Isolation**: Enforces strict patient-doctor privacy and isolated notification channels.

---

## 🛠️ Technology Stack

- **Mobile Frontend**: React Native, Expo SDK 54, TypeScript, React Navigation v6, React Query (TanStack Query), Zustand state management.
- **Web Admin Console**: Next.js 14 (App Router), Tailwind CSS, TypeScript.
- **Backend Architecture**: NestJS, PostgreSQL 16+, Prisma ORM, Redis, BullMQ queues.
- **Payment Processing**: Paystack API & Flutterwave Split Payments API (Automated 90/10 split payouts).
- **AI & ML Engine**: Google Gemini 1.5 Pro / Med-PaLM 2 (Clinical CDS), Deepgram Nova-2 Medical (Voice SOAP Notes), TensorFlow Lite (Edge Watch Sentinel).

---

## 🔑 AI API Key Activation (`.env`)

All AI features for Doctor, Patient, and Admin portals operate on a **Plug-and-Play Architecture**. To activate AI services:

1. Create a `.env` file in the project root.
2. Add your API keys:

```env
# ─── OMINIPULSE AI ENGINE CONFIGURATION (.env) ─────────────────────────────────
EXPO_PUBLIC_ENABLE_AI_COPILOT=true

# 1. Primary Clinical Intelligence (Google Gemini 1.5 Pro / Med-PaLM 2)
GEMINI_API_KEY=your_google_gemini_api_key_here

# 2. Ambient Voice SOAP Note Transcription (Deepgram Nova-2 Medical / Whisper)
DEEPGRAM_API_KEY=your_deepgram_medical_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# 3. Vision OCR & MDCN Credential Verification (Google Cloud Vision / AWS Textract)
AI_VISION_API_KEY=your_ocr_vision_api_key_here
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- npm or yarn
- Expo Go app on iOS/Android or Xcode / Android Studio simulators

### 2. Mobile App Setup
```bash
# Clone the repository
git clone https://github.com/omini-pulse/omini-pulse.git
cd omini-pulse

# Install dependencies
npm install

# Start Expo development server (with cache reset)
npx expo start -c
```

### 3. Admin Web Console Setup
```bash
# Navigate to admin directory
cd admin

# Install admin dependencies
npm install

# Start Next.js development server
npm run dev
```

### 4. Running Type Safety Checks
```bash
# Run TypeScript compilation check
npx tsc --noEmit
```

---

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
- **Data Protection**: Designed in accordance with NDPR (Nigeria Data Protection Regulation) and HIPAA standards for encrypted EHR transmission.

---

*For technical inquiries or architecture clarification, refer to [`NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](./NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md).*
