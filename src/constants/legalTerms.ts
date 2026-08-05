export interface RoleLegalSection {
  title: string;
  icon: string;
  content: string[];
}

export interface RoleLegalDoc {
  role: 'patient' | 'doctor';
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  sections: RoleLegalSection[];
}

export const PATIENT_LEGAL_DOC: RoleLegalDoc = {
  role: 'patient',
  title: 'Patient Telehealth & Privacy Terms',
  subtitle: 'Patient Service Agreement, EHR Privacy, Consent & Cancellation Policies',
  version: 'v3.1 (NDPA Compliance, Escrow Policy & Blood Donor Regulatory Update)',
  lastUpdated: 'August 2026',
  sections: [
    {
      title: '1. Patient Telehealth Service Agreement',
      icon: 'medical-outline',
      content: [
        'OminiPulse provides digital telehealth consultations, appointment scheduling, e-prescriptions, and electronic health record (EHR) tracking for patients in Nigeria and diaspora.',
        'Emergency Disclaimer: OminiPulse telehealth is intended for non-emergency medical consultations only. In case of life-threatening emergencies (severe chest pain, acute breathing distress, severe hemorrhage, loss of consciousness), call national emergency hotlines (112 / 767) or go immediately to the nearest hospital emergency room.',
        'Consultation Services: All telehealth video, phone, and chat consultations are provided exclusively by licensed, MDCN-verified independent medical practitioners.',
        'Artificial Intelligence: AI-powered features (Symptom Checker, AI Health Chat) are informational tools only and do not replace diagnosis or advice from a licensed healthcare professional.',
      ],
    },
    {
      title: '2. Payment, Escrow & Refund Policy',
      icon: 'cash-outline',
      content: [
        'Consultation fees are displayed in Nigerian Naira (NGN) prior to booking confirmation and are inclusive of the OminiPulse platform service charge.',
        'Escrow Payment Model: All consultation payments are held securely by OminiPulse in escrow upon booking. Funds are released to the doctor only after the doctor formally confirms your appointment. You will receive a confirmation notification when funds are released.',
        'Free Cancellation Window: You may cancel any appointment for a full 100% refund at any time before the doctor confirms (approves) your booking, with no penalty.',
        'Standard Cancellation Policy (after doctor approval): Cancellations more than 24 hours before the scheduled appointment time qualify for a full 100% refund. Cancellations between 6 and 24 hours before the appointment qualify for a 50% refund. Cancellations less than 6 hours before the appointment are non-refundable.',
        'Doctor-Initiated Cancellations: If a doctor cancels your confirmed appointment for any reason, you are entitled to a 100% full refund regardless of timing.',
        'No-Show Policy: Patients who fail to attend a confirmed appointment without prior cancellation will not be entitled to a refund.',
        'Refund Timeline: Approved refunds are processed within 3 to 5 business days to your original payment method. Patients may optionally choose instant credit to their OminiPulse in-app wallet instead.',
        'Platform Guarantee: OminiPulse guarantees that no payment will be disbursed to a doctor who fails to conduct a confirmed consultation. Affected patients are entitled to an automatic full refund and may file a formal complaint through the platform.',
      ],
    },
    {
      title: '3. Patient Privacy & EHR Data Protection (NDPA)',
      icon: 'shield-checkmark-outline',
      content: [
        'All patient health records (EHR), lab results, vital signs, consultation chat logs, and prescription data are encrypted in transit and at rest using 256-bit AES encryption, in full compliance with the Nigeria Data Protection Act (NDPA) 2023.',
        'Your medical data is strictly private and accessible only to you and healthcare practitioners you have explicitly consented to during consultations.',
        'We do not sell, rent, license, or monetize personal health information to any third-party advertisers, insurance agencies, pharmaceutical companies, or data brokers.',
        'Consent Management: You may view, manage, and revoke data sharing permissions granted to individual doctors or AI systems at any time through the Consent Management section of your profile.',
        'Audit Trail: OminiPulse maintains a complete, tamper-proof audit log of every access event on your health records. You can view this log at any time under "Who Viewed My Records" in your profile.',
        'Record Visibility Controls: You have the right to control the visibility of individual medical records. Each record can be set to "Visible to me and my assigned doctors" (default) or "Visible to me only — hidden from doctors" using the visibility toggle on your Medical Records screen.',
        'Data Portability & Export (NDPA Article 26): You have the right to export a complete archive of all your medical records in PDF or ZIP format at any time. Use the "Export My Records" feature on the Medical Records screen.',
        'Right to Erasure: You may submit a formal Right to Erasure request through our Data Protection Officer (DPO). Medical records that constitute legal clinical documents cannot be permanently deleted under Nigerian medical records law, but may be archived and restricted from view. All erasure actions are permanently logged.',
      ],
    },
    {
      title: '4. Medical Records — Immutability & Ownership',
      icon: 'document-lock-outline',
      content: [
        'Your medical records (prescriptions, lab results, clinical notes, diagnoses) are your property as the patient.',
        'Signed Records are Immutable: Once a doctor has signed and issued a prescription or clinical note, it cannot be edited, modified, or deleted by anyone. Any correction must be issued as a formal addendum document referencing the original, which is also permanently stored.',
        'Patients cannot permanently delete clinical records, as these are legal medical documents. Patients may archive a record to hide it from their own view while maintaining its integrity.',
        'Doctors who upload false, forged, or clinically inaccurate records are subject to immediate suspension and MDCN reporting.',
      ],
    },
    {
      title: '5. Individual Account Management',
      icon: 'person-outline',
      content: [
        'OminiPulse accounts are individual patient health accounts. Each user maintains their personal clinical history, vitals, prescriptions, and health records.',
        'You, as the primary account holder, are responsible for maintaining account security and for all bookings, consultations, and actions conducted under your account.',
      ],
    },
    {
      title: '6. Electronic Prescriptions & Pharmacy',
      icon: 'receipt-outline',
      content: [
        'E-Prescriptions: E-prescriptions issued by verified doctors on OminiPulse are digitally signed, tamper-evident, and saved directly to your Medical Records.',
        'Controlled Substances Policy: Doctors on OminiPulse are strictly prohibited from prescribing Schedule II controlled narcotics, opioids, or habit-forming substances via remote telehealth under any circumstances.',
        'GPS Pharmacy Directory: Use our GPS Pharmacy Radar to locate nearby certified pharmacies for in-person prescription fulfillment.',
        'Doorstep Delivery: Direct online drug ordering partnerships with licensed pharmacies are in development and coming soon.',
      ],
    },
    {
      title: '7. Patient Conduct, Fraud & Legal Liability',
      icon: 'alert-circle-outline',
      content: [
        'Truthful Medical Reporting: Patients must provide accurate, truthful personal health information, symptom descriptions, and medical history to consulting practitioners. Withholding critical health information that endangers your health or the doctor\'s clinical judgment is your sole responsibility.',
        'Prohibition of False Statements & Prescription Fraud: Fabricating symptoms, lying to doctors, attempting prescription fraud (seeking unauthorized narcotics or controlled substances), submitting forged lab results, or making false malicious reports against medical practitioners is strictly prohibited.',
        'Legal Penalties: Any patient found deliberately deceiving medical practitioners, forging documents, or making fraudulent claims will have their account immediately and permanently terminated. They may be fined, sued for civil defamation or damages, and referred to law enforcement for arrest and criminal prosecution under Nigerian law.',
      ],
    },
    {
      title: '8. Blood Donor Network — Regulatory & Ethical Policy',
      icon: 'water-outline',
      content: [
        'STRICT PROHIBITION — NO COMMERCIAL BLOOD TRANSACTIONS: The buying, selling, trading, or any form of commercial exchange of human blood is absolutely and unconditionally prohibited on the OminiPulse platform. Human blood is not a commodity. Any attempt to monetize, sell, purchase, barter, or negotiate financial compensation for blood donations through OminiPulse constitutes a serious criminal offense.',
        'Legal Framework: The commercial sale or purchase of human blood in Nigeria violates the National Blood Transfusion Service (NBTS) Act, the National Health Act 2014 (Section 48 — prohibition of buying or selling human tissue, blood, and body parts), and applicable provisions of the Criminal Code Act. Violations may attract imprisonment of up to 5 years, substantial fines, or both, upon conviction by a court of competent jurisdiction.',
        'Criminal Prosecution Notice: Any user — whether a registered donor, patient, healthcare worker, or third party — found guilty of attempting to facilitate, negotiate, or conduct commercial blood transactions through OminiPulse will have their account immediately and permanently terminated. OminiPulse will report all confirmed cases to the Nigerian Police Force (NPF), Economic and Financial Crimes Commission (EFCC), and the National Blood Transfusion Service (NBTS) for criminal investigation and prosecution. Offenders may face arrest, remand, criminal trial, conviction, fines, and custodial sentences (imprisonment).',
        'Ethical Donation Framework: OminiPulse operates strictly within the following ethical blood facilitation chain: Voluntary Donor ➔ Accredited Hospital / Licensed Blood Bank ➔ Patient. The platform facilitates donor discovery and emergency alerts only. All blood donations must be formally collected, screened, tested, and processed by a licensed healthcare facility before any transfusion is administered to a patient. OminiPulse does not facilitate direct donor-to-patient blood transfers.',
        'Mandatory Lab Screening: All blood donations arranged through OminiPulse emergency discovery must be processed through a licensed blood bank or hospital transfusion laboratory. Mandatory blood safety tests (HIV, Hepatitis B, Hepatitis C, Syphilis, Malaria, and blood group cross-matching) must be completed by a qualified laboratory in accordance with NBTS national guidelines and World Health Organization (WHO) blood safety standards before transfusion. OminiPulse does not certify blood for transfusion and assumes no liability for donations not processed through a licensed facility.',
        'Donor Eligibility & Genotype Policy: OminiPulse enforces a strict genotype eligibility policy. Only donors with confirmed Genotype AA are eligible to register and appear in the platform\'s blood donor network. Donors with genotypes AS, AC, SS, SC, or other sickle-cell variants are ineligible and excluded from all search results, including emergency searches. This policy exists to protect both donors and recipients from potential sickle-cell-related transfusion complications. The genotype field is permanently locked and immutable after registration based on uploaded and admin-verified lab documentation.',
        'Lab Report Verification: Every blood donor registration requires upload of a certified laboratory report confirming blood group, genotype (AA), and basic infectious disease screening clearance. All submitted lab reports undergo mandatory review and approval by an OminiPulse Compliance Administrator before the donor profile becomes publicly visible. Donors who submit forged, altered, or misleading lab reports will face immediate permanent ban and referral to law enforcement for criminal prosecution.',
        'Admin Verification & Profile Visibility: No blood donor profile is publicly visible in search results or emergency discovery until it has been reviewed and explicitly approved by an OminiPulse Compliance Administrator. Admin rejection of a lab report or profile disqualifies the applicant from the network without recourse until a new, valid lab report is submitted for re-review.',
        'Donor Rights & Privacy: Blood donor profiles are limited to display of blood group, general location (city/area level), availability status, and contact access granted through the platform\'s controlled channels. Full personal data is protected under the Nigeria Data Protection Act (NDPA) 2023. Donors may deactivate or remove their profile at any time through their account settings.',
        'No OminiPulse Liability for Clinical Outcomes: OminiPulse is a technology platform providing donor discovery and emergency alert infrastructure only. OminiPulse is not a blood bank, does not store, process, or certify blood, and assumes no clinical liability for transfusion outcomes. All clinical decisions, blood screening, and transfusion procedures remain the sole responsibility of the licensed healthcare facility administering the transfusion.',
        'Reporting Violations: If you encounter any attempt to buy, sell, or commercially trade blood through the OminiPulse platform, you are legally and ethically obligated to report it immediately via the Report Incident feature in the app or by contacting compliance@ominipulse.ng. All reports are treated with strict confidentiality.',
      ],
    },
  ],
};

export const DOCTOR_LEGAL_DOC: RoleLegalDoc = {
  role: 'doctor',
  title: 'Doctor & Healthcare Provider Agreement',
  subtitle: 'Practitioner Credential Verification, Escrow Payout, Appointment Conduct & Suspension Policy',
  version: 'v3.1 (Escrow Policy, MDCN Expiry, Indefinite Suspension & Blood Donor Facilitation Update)',
  lastUpdated: 'August 2026',
  sections: [
    {
      title: '1. Practitioner Licensure & Mandatory Verification',
      icon: 'ribbon-outline',
      content: [
        'Medical practitioners registering on OminiPulse must hold a valid, unencumbered license issued by the Medical and Dental Council of Nigeria (MDCN) or equivalent national licensing authority.',
        'Required Verification Documents: All five (5) of the following documents are mandatory for account activation. No exceptions are granted: (1) MDCN Medical License with expiry date, (2) National Identity Number (NIN) or Government-Issued National ID, (3) Specialty Certificate (WACP, FWACP, Fellowship, or equivalent — required for all practitioners including general practitioners), (4) Current Employer or Clinic Affiliation Letter, (5) Professional Passport-Style Photo.',
        'MDCN License Expiry & Account Validity: Your OminiPulse practitioner account remains active only while your MDCN license is valid. Platform access is tied to your MDCN license expiry date. You will receive renewal notifications at 30 days and 7 days before expiry.',
        'License Renewal Grace Period: Upon MDCN license expiry, your account enters a 30-day grace period (license_renewal_pending status) during which you may continue accessing your dashboard and past records, but new patient bookings will be blocked until your renewed license is verified by a Compliance Officer.',
        'Post-Grace Period: If the renewed MDCN license is not uploaded and verified within 30 days of expiry, your account will be automatically restricted (license_expired status) until manual reinstatement by a Compliance Officer.',
        'Duty of Professional Care: Doctors agree to uphold standard clinical guidelines, MDCN ethics, and evidence-based medicine during all remote patient interactions.',
      ],
    },
    {
      title: '2. Appointment Confirmation & Escrow Payment Policy',
      icon: 'cash-outline',
      content: [
        'Escrow Holding: When a patient books a consultation, their full payment is held in escrow by OminiPulse. No funds are disbursed to any party until the appointment is confirmed.',
        'Doctor Confirmation Required: Funds held in escrow are released to your account only after you formally confirm (approve) the patient\'s booking through the Appointments screen. Pending bookings not confirmed within 24 hours will be automatically released back to the patient as a full refund.',
        'Non-Performance Penalty — CRITICAL CLAUSE: Failure to attend, conduct, or complete a consultation after you have formally confirmed the booking and the patient\'s payment has been committed to your account constitutes a serious contractual and professional breach. This will result in: (a) an immediate account suspension without prior notice, (b) a full 100% refund disbursed to the patient at your expense, (c) a formal breach record added to your OminiPulse compliance profile, and (d) repeated breaches being referred to the Medical and Dental Council of Nigeria (MDCN) for disciplinary action and potential license review.',
        'Payout Timeline: Net earnings (after the 10% platform service fee) are disbursed to your verified Nigerian bank account within 24 hours of a consultation being marked as completed.',
      ],
    },
    {
      title: '3. Platform Service Fee & Net Earnings',
      icon: 'wallet-outline',
      content: [
        'Consultation Fee Currency: All consultation fees are set and billed in Nigerian Naira (NGN).',
        'Platform Service Fee (10%): OminiPulse retains a flat 10% platform service fee from each completed consultation. This fee covers HD video infrastructure, EHR cloud hosting, payment gateway processing, NDPA compliance operations, and 24/7 technical support.',
        'Net Earnings (90% Payout): The remaining 90% net earnings are disbursed directly into your verified Nigerian bank account.',
        'Fee Transparency: Your full earnings breakdown (gross fee, 10% platform deduction, net payout, payment date) is available in your Earnings Dashboard at all times.',
      ],
    },
    {
      title: '4. Patient Record Access & Audit Compliance',
      icon: 'eye-outline',
      content: [
        'Authorized Access Only: You may only access the medical records of patients who have explicitly consented to share their records with you during an active consultation or through the patient\'s Consent Management settings.',
        'Audit Trail: Every record access event (view, download, annotation) is permanently logged in the patient\'s audit trail. Patients can see exactly who accessed their records, when, and from what device. This log is tamper-proof and cannot be deleted by any party including administrators.',
        'Record Visibility: Patients have the right to hide individual records from doctor access using their visibility toggle. Attempting to access restricted records is a platform violation.',
        'Record Immutability: Signed prescriptions and clinical notes are immutable. Corrections must be issued as formal addendum documents. Editing, altering, or backdating signed records is a serious criminal offense and will result in immediate permanent account ban and MDCN reporting.',
        'NDPA Compliance: All patient data accessed through OminiPulse is governed by the Nigeria Data Protection Act (NDPA) 2023. Exporting, screen-capturing, printing, or sharing patient medical data outside the OminiPulse secure platform is strictly prohibited and may constitute a criminal data breach under NDPA.',
      ],
    },
    {
      title: '5. Clinical Autonomy & Professional Liability',
      icon: 'fitness-outline',
      content: [
        'Medical practitioners act as independent licensed professionals and retain full clinical discretion, ethical obligation, and legal liability for all diagnoses, clinical advice, prescriptions, and treatment recommendations provided during consultations.',
        'OminiPulse provides the technology infrastructure and does not dictate, direct, interfere with, or assume liability for independent medical judgment.',
        'AI Tools Disclaimer: Any AI-assisted clinical tools or summaries on the platform are for informational reference only. Clinical decisions remain entirely the practitioner\'s responsibility.',
      ],
    },
    {
      title: '6. Account Suspension Policy',
      icon: 'ban-outline',
      content: [
        'Suspension is Indefinite: If your OminiPulse practitioner account is suspended by Compliance Officers, the suspension has no automatic expiry date. Suspended accounts remain restricted until a formal reinstatement review is completed by an OminiPulse Compliance Officer.',
        'Suspended Account Access: A suspended practitioner may log in to view their suspension notice, reason, past completed appointments (read-only), and contact compliance support. All clinical functions (booking, prescriptions, patient record access, availability management) are disabled during suspension.',
        'Reinstatement Process: To appeal a suspension, contact compliance@ominipulse.ng with supporting documentation. Reinstatement requires a fresh document review and Compliance Officer approval.',
        'Grounds for Suspension: Include but are not limited to — non-performance of confirmed consultations, patient complaints of gross negligence, fraudulent credential submission, NDPA data breach, unauthorized sharing of patient records, prescription of controlled substances via telehealth, or any other serious breach of these terms.',
        'Grounds for Permanent Ban: Confirmed cases of medical malpractice, criminal conviction, MDCN license revocation, or extreme repetitive breaches result in a permanent, irrevocable account ban with no right of reinstatement.',
      ],
    },
    {
      title: '7. Professional Misconduct & MDCN Escalation',
      icon: 'warning-outline',
      content: [
        'Duty of Care: Doctors must treat all patients with utmost professional care, clinical competence, and dignity at all times.',
        'Misconduct Investigation: If a patient reports unprofessional behavior, medical negligence, or improper conduct supported by evidence (consultation logs, prescriptions, session records), OminiPulse Compliance Officers will launch an immediate internal investigation.',
        'Escalation to MDCN: Cases involving serious medical malpractice, gross negligence, ethical violations, or criminal conduct are officially reported to the Medical and Dental Council of Nigeria (MDCN).',
        'License Revocation & Criminal Prosecution: If MDCN or law enforcement agencies establish guilt through investigation, the practitioner\'s medical license may be revoked, and they may be arrested and face criminal prosecution under applicable Nigerian law.',
      ],
    },
    {
      title: '8. Confidentiality & Patient Data Security',
      icon: 'lock-closed-outline',
      content: [
        'Practitioners agree to maintain strict confidentiality of all patient records, EHR notes, consultation sessions, and personal health information.',
        'Exporting, capturing, printing, or sharing patient medical data or video recordings outside OminiPulse\'s secure encrypted platform is strictly prohibited and constitutes a serious data breach under the Nigeria Data Protection Act (NDPA) 2023.',
        'Violation of patient data confidentiality will result in immediate permanent account termination, full NDPA breach reporting to the Nigeria Data Protection Commission (NDPC), and potential criminal prosecution.',
      ],
    },
    {
      title: '9. Blood Donor Facilitation — Practitioner Obligations & Policy',
      icon: 'water-outline',
      content: [
        'ABSOLUTE PROHIBITION — NO COMMERCIAL BLOOD TRANSACTIONS: Healthcare practitioners registered on OminiPulse are strictly and unconditionally prohibited from facilitating, negotiating, directing, or participating in any commercial sale, purchase, barter, or financial exchange involving human blood through this platform or any channel associated with it.',
        'Legal Prohibition & Criminal Liability: The commercial sale or purchase of human blood or blood products in Nigeria is a criminal offense under the National Health Act 2014 (Section 48), the National Blood Transfusion Service (NBTS) Act, and applicable provisions of the Criminal Code Act. Any licensed medical practitioner found guilty of facilitating blood commercialization may face: (a) criminal arrest and prosecution, (b) imprisonment of up to 5 years and/or substantial financial fines upon conviction, (c) immediate revocation of their MDCN medical license, (d) permanent OminiPulse account ban and public blacklisting, and (e) formal referral to MDCN, the Nigerian Police Force (NPF), and EFCC for investigation and prosecution.',
        'Mandatory Facilitation Chain: When assisting patients in accessing emergency blood through OminiPulse, practitioners must adhere to the following lawful and ethical facilitation chain exclusively: Voluntary Donor ➔ Licensed Blood Bank / Accredited Hospital Laboratory ➔ Patient. Practitioners may use OminiPulse\'s emergency donor discovery tools only to identify and connect compatible voluntary donors to a licensed healthcare facility equipped to collect, screen, and process donated blood. No direct donor-to-patient blood transfer should be facilitated under any circumstances.',
        'Mandatory Blood Safety Standards: Before any blood transfusion is administered to a patient, practitioners are required under Nigerian law and WHO blood safety guidelines to ensure that all mandatory blood safety tests have been conducted by a qualified NBTS-accredited laboratory. Required tests include: HIV (1 and 2), Hepatitis B Surface Antigen (HBsAg), Hepatitis C Virus (HCV), Venereal Disease Research Laboratory (VDRL) for Syphilis, Malaria Parasite (MP) screening, and ABO/Rhesus blood group cross-matching. OminiPulse emergency discovery does not certify blood for transfusion. All clinical screening decisions remain the sole responsibility of the administering practitioner and facility.',
        'Duty to Report Violations: Any practitioner who becomes aware of blood commercialization attempts — including patient requests to purchase blood, third-party brokers offering blood for sale, or any party attempting to monetize the donation process through OminiPulse — has a professional and legal obligation to report the incident immediately via the Report Incident feature in the app or via compliance@ominipulse.ng. Failure to report known violations may itself constitute a breach of these terms.',
        'Platform Liability Disclaimer: OminiPulse is a digital donor discovery and emergency alert platform only. It is not a blood bank, does not store or process blood, and assumes no legal or clinical liability for blood transfusion outcomes, cross-matching errors, or post-transfusion complications. Practitioners who administer transfusions retain full clinical responsibility for patient outcomes.',
      ],
    },
  ],
};
