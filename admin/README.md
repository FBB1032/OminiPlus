# 🖥️ OminiPulse Admin & Hospital Enterprise Web Console

> **Next.js 14 Web Portal for Platform Governance, Hospital Department Operations, Doctor Credentialing, and Financial Settlement**  
> **Version**: 2.2.0  
> **Framework**: Next.js 14 (App Router), TypeScript, Vanilla CSS Design System  
> **Master Architecture**: [`../NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](../NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md)

---

## 🧭 Overview

The **OminiPulse Web Console** is the administrative nerve center of the ecosystem. It serves two distinct administrative tiers:

1. **Platform Super Admin (`admin`)**:
   - Oversees nationwide hospital facility licensing, MDCN doctor credential audits, voluntary blood donor screening, medical malpractice disciplinary actions, and platform ARR revenue ledgers.
2. **Hospital Multi-Department Enterprise Portal (`hospital-portal`)**:
   - Manages institutional day-to-day clinical operations across 6 internal departments:
     - **Facility Director (`hospital_admin`)**: Staff badges, department permissions, enterprise billing.
     - **Wards & Inpatient Care (`nurse`)**: 18 beds across 6 wards (ICU, Emergency, Male Surgical, Female Medical, Pediatrics, Maternity) with live occupancy, admission, transfer, and sanitation tracking.
     - **Dispensary & Pharmacy (`pharmacist`)**: Prescription orders queue, formulary stock management, batch expiry tracking.
     - **Clinical Diagnostics & Pathology (`lab_technician`)**: Specimen intake, verified results entry, digital pathology reports with electronic signatures.
     - **Transfusion Blood Bank (`blood_officer`)**: Emergency blood unit reserves, crossmatching, donor screening.
     - **Front Desk Intake (`receptionist`)**: Triage queues, doctor booking, bed inquiry routing.

---

## 🔑 Demo Personas & Instant Login Credentials

You can sign in using any of the pre-configured clinical and administrative personas on the login page (`/login`):

| Role Badge | Persona Name | Email | Default Password | Target Workspace |
| :--- | :--- | :--- | :--- | :--- |
| `PLATFORM ADMIN` | Dr. Omini Director | `admin@ominipulse.ai` | `AdminPass2026!` | `/dashboard/hospitals` |
| `HOSPITAL ADMIN` | Dr. Chidiebere Okeke | `admin@xyzspecialist.ng` | `HospPass2026!` | `/dashboard/hospital-portal` |
| `DOCTOR` | Dr. Babatunde Adeyemi | `dr.adeyemi@xyzspecialist.ng` | `DocPass2026!` | `/dashboard/doctor-portal` |
| `NURSE` | Nurse Amina Yusuf | `a.yusuf@xyzspecialist.ng` | `NursePass2026!` | `/dashboard/hospital-portal?tab=wards` |
| `RECEPTIONIST` | Fatima Mohammed | `f.mohammed@xyzspecialist.ng` | `RecepPass2026!` | `/dashboard/hospital-portal?tab=appointments` |
| `BLOOD OFFICER` | Musa Garba | `m.garba@xyzspecialist.ng` | `BloodPass2026!` | `/dashboard/hospital-portal?tab=blood` |
| `PHARMACIST` | Pharm. Chioma Okonkwo | `c.okonkwo@xyzspecialist.ng` | `PharmPass2026!` | `/dashboard/hospital-portal?tab=pharmacy` |
| `LAB SCIENTIST` | MLS. Emeka Nnamdi | `e.nnamdi@xyzspecialist.ng` | `LabPass2026!` | `/dashboard/hospital-portal?tab=laboratory` |

---

## 🏛️ Routing & Page Architecture

```
admin/src/app/
├── page.tsx                           ├── Public Landing Page (3D Anatomical Body Map, Mock Reviews, App QR Modals)
├── login/page.tsx                     ├── 8-Persona Fast Sign-In Console
├── dashboard/
│   ├── page.tsx                       ├── Role-based intelligent redirector
│   ├── hospitals/page.tsx             ├── Platform Admin: Hospital facility directory & contracts
│   ├── doctors/page.tsx               ├── Platform Admin: Doctor MDCN credentialing & audit console
│   ├── billing/page.tsx               ├── Platform Admin: Institutional invoice manager & platform ARR
│   ├── blood-donors/page.tsx          ├── Platform Admin: Voluntary blood donor serology verification
│   ├── reports/page.tsx               ├── Platform Admin: Medical incident & disciplinary board console
│   ├── security/page.tsx              ├── Platform Admin: RBAC permissions, audit log & 2FA controls
│   ├── doctor-portal/page.tsx         ├── Independent Doctor Clinical Practice (Video, SOAP, Prescriptions)
│   └── hospital-portal/page.tsx       ├── Hospital Multi-Department Management:
│       ├── ?tab=wards                 │   • Inpatient Wards & 18-Bed Occupancy Matrix
│       ├── ?tab=pharmacy              │   • Pharmacy Dispensary & Medication Formulary
│       ├── ?tab=laboratory            │   • Clinical Diagnostics Lab & Verified Reports
│       ├── ?tab=blood                 │   • Hospital Blood Bank & Crossmatch
│       ├── ?tab=appointments          │   • Front Desk Intake & Appointments
│       ├── ?tab=patients              │   • Patient EHR Directory & Drug Charts
│       ├── ?tab=staff                 │   • Staff Onboarding & Badge Generation
│       ├── ?tab=billing               │   • Facility Contract & FIRS Invoices
│       └── ?tab=profile               │   • Hospital Facility Profile & Accreditation
```

---

## 🛡️ Zero-Browser-Alert UI Architecture

In accordance with enterprise UX standards, **no native browser popup alerts (`alert(...)`) exist in this web console**. All interactions utilize custom in-app modals:
- **Diagnostic Pathology Report Modal**: Formatted lab slips with reference ranges and e-signatures.
- **Institutional Billing Desk Modal**: Direct enterprise account manager hotline and email inquiry launcher.
- **Official Invoices & PDF Receipts Modal**: FIRS-compliant tax receipts with 1-click printable layout.
- **Inpatient Bed Notice Dialog**: Clean housekeeping and occupancy alerts.
- **Forensic Evidence Inspection Modal**: Hash-verified document evidence viewer.
- **App Download Modal**: Mobile application preview with camera QR code scanner.

---

## 🚀 Development & Verification

### Running the Development Server
```bash
# From within the admin/ directory:
npm run dev
```
The console will be accessible at `http://localhost:3000`.

### Type-Safety Verification
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

---

*For platform-wide architecture, database schemas, and AI engine blueprints, see [`../NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md`](../NEXT_STAGES_ROADMAP_AND_ARCHITECTURE.md).*
