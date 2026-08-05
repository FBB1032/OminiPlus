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
  subtitle: 'Patient Service Agreement, EHR Privacy & Consultation Policies',
  version: 'v2.5 (Legal Enforcement & NDPR Standards)',
  lastUpdated: 'August 2026',
  sections: [
    {
      title: '1. Patient Telehealth Service Agreement',
      icon: 'medical-outline',
      content: [
        'OminiPulse provides digital telehealth consultations, appointment scheduling, e-prescriptions, and EHR health tracking.',
        'Emergency Disclaimer: OminiPulse telehealth is intended for non-emergency medical consultations. In case of life-threatening emergencies (severe chest pain, breathing distress, severe hemorrhage), call emergency services or go immediately to the nearest hospital emergency room.',
        'Consultation Services: Telehealth video and chat interactions are provided by licensed, independent medical practitioners.',
      ],
    },
    {
      title: '2. Patient Privacy & EHR Data Protection',
      icon: 'shield-checkmark-outline',
      content: [
        'All patient health records (EHR), lab results, vital signs, and consultation chats are encrypted in transit and at rest in accordance with Nigerian Data Protection Regulation (NDPR) and NDPA standards.',
        'Your medical data is strictly private and accessible only to you and healthcare practitioners explicitly authorized during your consultations.',
        'We do not sell, rent, or monetize personal health information to third-party advertisers or insurance agencies.',
      ],
    },
    {
      title: '3. Appointments, Fees & Cancellation Policy',
      icon: 'cash-outline',
      content: [
        'Consultation fees are displayed in Nigerian Naira (₦) prior to booking confirmation.',
        'Payment Authorization: Payments are processed securely via encrypted payment gateways upon appointment confirmation.',
        'Cancellation & Refunds: Patients may cancel a booked appointment up to 2 hours prior to the scheduled start time for a 100% full refund.',
      ],
    },
    {
      title: '4. Electronic Prescriptions & Pharmacy Delivery (Coming Soon)',
      icon: 'receipt-outline',
      content: [
        'Electronic Prescriptions: E-prescriptions issued by verified doctors on OminiPulse are digitally signed and saved directly to your Medical Records.',
        'Doorstep Delivery (Coming Soon): Direct online drug ordering and doorstep delivery partnerships with licensed pharmacies are currently in development and coming soon.',
        'GPS Pharmacy Directory: In the interim, patients can utilize our GPS Pharmacy Radar to locate nearby certified pharmacies for direct in-person pickup or phone inquiries.',
        'Controlled Substances Policy: Doctors on OminiPulse cannot prescribe Schedule II controlled narcotics or habit-forming substances via remote telehealth.',
      ],
    },
    {
      title: '5. Patient Integrity, Deception & Legal Penalties',
      icon: 'alert-circle-outline',
      content: [
        'Truthful Medical Reporting: Patients must provide accurate, truthful personal health information, symptom descriptions, and medical history to consulting practitioners.',
        'Prohibition of False Statements & Prescription Fraud: Fabricating medical symptoms, lying to doctors, attempting prescription fraud (seeking unauthorized narcotics or controlled drugs), or submitting false malicious reports against medical practitioners is strictly prohibited.',
        'Legal Penalties, Fines & Criminal Liability: Any patient found deliberately deceiving medical practitioners, forging documents, or making fraudulent claims will have their account immediately terminated and may be fined, sued for civil defamation/damages, or arrested and prosecuted by law enforcement agencies depending on the severity of the crime under Nigerian law.',
      ],
    },
  ],
};

export const DOCTOR_LEGAL_DOC: RoleLegalDoc = {
  role: 'doctor',
  title: 'Doctor & Healthcare Provider Agreement',
  subtitle: 'Practitioner License Verification, Platform Fee & Payout Terms',
  version: 'v2.5 (MDCN Ethics & Malpractice Enforcement)',
  lastUpdated: 'August 2026',
  sections: [
    {
      title: '1. Practitioner Licensure & Verification',
      icon: 'ribbon-outline',
      content: [
        'Medical Practitioners registering on OminiPulse must possess a valid, unencumbered license issued by the Medical and Dental Council of Nigeria (MDCN) or equivalent national licensing authority.',
        'Credentials Verification: Accounts remain in pending status until government ID, medical license numbers, and medical certificates are verified by OminiPulse Compliance Officers.',
        'Duty of Professional Care: Doctors agree to uphold standard clinical guidelines and medical ethics during remote patient interactions.',
      ],
    },
    {
      title: '2. Platform Service Fee & Payout Disbursement',
      icon: 'cash-outline',
      content: [
        'Consultation Fee Currency: Consultation fees are set and billed in Nigerian Naira (₦).',
        'Platform Service Fee (10%): OminiPulse retains a flat 10% platform service fee from each completed consultation. This fee covers video infrastructure, EHR hosting, payment gateway charges, and administrative support.',
        'Net Earnings (90% Payout): The remaining 90% net earnings are disbursed directly into the doctor’s verified Nigerian bank payout account.',
      ],
    },
    {
      title: '3. Clinical Autonomy & Professional Liability',
      icon: 'fitness-outline',
      content: [
        'Medical Practitioners act as independent licensed professionals and retain full clinical discretion and liability for diagnoses, advice, and treatment recommendations.',
        'OminiPulse provides the technological platform infrastructure and does not dictate or interfere with independent medical judgment.',
      ],
    },
    {
      title: '4. Confidentiality & Patient Data Security',
      icon: 'lock-closed-outline',
      content: [
        'Practitioners agree to maintain strict confidentiality of patient records, EHR notes, and consultation sessions.',
        'Exporting, capturing, or sharing patient medical data or video recordings outside OminiPulse’s secure platform is strictly prohibited.',
      ],
    },
    {
      title: '5. Professional Misconduct, MDCN Reporting & Legal Penalties',
      icon: 'warning-outline',
      content: [
        'Duty of Care & Professional Ethics: Doctors must treat all patients with utmost professional care, dignity, and clinical competence.',
        'Substandard Care & Misconduct Investigation: If a patient reports a doctor for unprofessional behavior, medical negligence, abuse, or improper consultation conduct accompanied by supporting evidence (chat logs, prescriptions, audio/video records), OminiPulse Compliance Officers will launch an immediate internal investigation.',
        'Account Suspension & Permanent Ban: If found guilty following investigation, the doctor’s OminiPulse account will face immediate temporary suspension or permanent ban, depending on the severity of the offense.',
        'Escalation to MDCN (Medical and Dental Council of Nigeria): In cases involving serious medical malpractice, gross negligence, or ethical violations, OminiPulse will officially report the practitioner to the Medical and Dental Council of Nigeria (MDCN).',
        'License Revocation & Criminal Prosecution: If MDCN or law enforcement agencies establish guilt through investigation, the practitioner’s medical license may be revoked or withdrawn, and they may be arrested and face criminal prosecution under Nigerian law based on their crime.',
      ],
    },
  ],
};
