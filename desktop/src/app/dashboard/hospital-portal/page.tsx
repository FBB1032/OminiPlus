'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Building2, Calendar, Users, Stethoscope, Droplet, AlertTriangle,
  BarChart3, ScrollText, CheckCircle, Clock, Search, Eye, Plus,
  ShieldCheck, ShieldAlert, Phone, Mail, MapPin, Smartphone, Award,
  Check, X, FileText, ArrowRight, Activity, Filter, Lock,
  Copy, Key, UserPlus, UserCheck, RefreshCw, Printer, Bell,
  Trash2, CheckCheck, SlidersHorizontal, Receipt, CreditCard, Download,
  BedDouble, Pill, FlaskConical, Package, TestTube, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type {
  HospitalStaffRole,
  HospitalDoctor,
  HospitalStaffMember,
  HospitalBloodRequest,
  HospitalEmergencyRequest,
  HospitalAuditEntry,
  AdminRole,
  HospitalBed,
  HospitalWardType,
  HospitalBedStatus,
  HospitalMedicationItem,
  HospitalPrescriptionOrder,
  HospitalLabOrder,
} from '@/types';
import { useAuthStore } from '@/store/authStore';

// ─── Staff Roles & Permissions Matrix ──────────────────────────────────────────
interface StaffPersona {
  id: string;
  name: string;
  role: HospitalStaffRole;
  title: string;
  department: string;
  email: string;
  phone: string;
  badgeId: string;
  tempPassword?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  canViewPatients: boolean;
  canViewFullMedical: boolean;
  canViewAppointments: boolean;
  canManageBlood: boolean;
  canManageStaff: boolean;
  canManageEmergency: boolean;
}

const STAFF_PERSONAS: StaffPersona[] = [
  {
    id: 'staff-admin-1',
    name: 'Dr. Ibrahim Sani',
    role: 'hospital_admin',
    title: 'Hospital Medical Director & Admin',
    department: 'Hospital Administration',
    email: 'i.sani@xyzspecialist.ng',
    phone: '+234 803 111 0001',
    badgeId: 'HSP-ADM-01',
    tempPassword: 'AdminPass2026!',
    status: 'active',
    createdAt: '2026-01-10',
    canViewPatients: true,
    canViewFullMedical: true,
    canViewAppointments: true,
    canManageBlood: true,
    canManageStaff: true,
    canManageEmergency: true,
  },
  {
    id: 'staff-doc-1',
    name: 'Dr. Ahmed Bello',
    role: 'doctor',
    title: 'Senior Consultant Cardiologist',
    department: 'Cardiology',
    email: 'a.bello@xyzspecialist.ng',
    phone: '+234 803 100 2001',
    badgeId: 'HSP-DOC-01',
    tempPassword: 'CardioDoc2026!',
    status: 'active',
    createdAt: '2026-02-15',
    canViewPatients: true,
    canViewFullMedical: true,
    canViewAppointments: true,
    canManageBlood: false, // Limited
    canManageStaff: false,
    canManageEmergency: true,
  },
  {
    id: 'staff-nurse-1',
    name: 'Nurse Amina Yusuf',
    role: 'nurse',
    title: 'Lead Clinical Nurse (Triage)',
    department: 'Emergency & Triage',
    email: 'a.yusuf@xyzspecialist.ng',
    phone: '+234 805 222 3001',
    badgeId: 'HSP-NUR-01',
    tempPassword: 'NurseAmina2026!',
    status: 'active',
    createdAt: '2026-03-01',
    canViewPatients: true,
    canViewFullMedical: false, // Limited to vitals & active orders
    canViewAppointments: true,
    canManageBlood: false,
    canManageStaff: false,
    canManageEmergency: true,
  },
  {
    id: 'staff-rec-1',
    name: 'Fatima Mohammed',
    role: 'receptionist',
    title: 'Front Desk & Patient Intake',
    department: 'Patient Services',
    email: 'f.mohammed@xyzspecialist.ng',
    phone: '+234 812 333 4001',
    badgeId: 'HSP-REC-01',
    tempPassword: 'FrontDesk2026!',
    status: 'active',
    createdAt: '2026-03-15',
    canViewPatients: true,
    canViewFullMedical: false, // Limited to identity check
    canViewAppointments: true,
    canManageBlood: false,
    canManageStaff: false,
    canManageEmergency: false,
  },
  {
    id: 'staff-bld-1',
    name: 'Musa Garba',
    role: 'blood_officer',
    title: 'Blood Bank & Transfusion Officer',
    department: 'Laboratory & Transfusion',
    email: 'm.garba@xyzspecialist.ng',
    phone: '+234 809 444 5001',
    badgeId: 'HSP-BLD-01',
    tempPassword: 'BloodBank2026!',
    status: 'active',
    createdAt: '2026-04-01',
    canViewPatients: true,
    canViewFullMedical: false,
    canViewAppointments: false,
    canManageBlood: true,
    canManageStaff: false,
    canManageEmergency: true,
  },
  {
    id: 'staff-phm-1',
    name: 'Pharm. Chioma Okonkwo',
    role: 'pharmacist',
    title: 'Chief Hospital Pharmacist & Dispensary Lead',
    department: 'Hospital Pharmacy & Dispensary',
    email: 'c.okonkwo@xyzspecialist.ng',
    phone: '+234 803 400 5001',
    badgeId: 'HSP-PHM-01',
    tempPassword: 'PharmPass2026!',
    status: 'active',
    createdAt: '2026-02-01',
    canViewPatients: true,
    canViewFullMedical: false,
    canViewAppointments: false,
    canManageBlood: false,
    canManageStaff: false,
    canManageEmergency: false,
  },
  {
    id: 'staff-lab-1',
    name: 'MLS. Emeka Nnamdi',
    role: 'lab_technician',
    title: 'Senior Medical Laboratory Scientist',
    department: 'Clinical Pathology & Laboratory',
    email: 'e.nnamdi@xyzspecialist.ng',
    phone: '+234 803 600 7001',
    badgeId: 'HSP-LAB-01',
    tempPassword: 'LabPass2026!',
    status: 'active',
    createdAt: '2026-02-10',
    canViewPatients: true,
    canViewFullMedical: false,
    canViewAppointments: false,
    canManageBlood: true,
    canManageStaff: false,
    canManageEmergency: false,
  },
];

// ─── Registered Hospital Facilities Data ───────────────────────────────────────
export interface RegisteredFacility {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  emergencyHotline: string;
  email: string;
  type: string;
  departments: string[];
  isEmergencyAvailable: boolean;
  isVerifiedFacility: boolean;
  operatingHours: string;
  adminName: string;
}

export const ALL_FACILITIES: RegisteredFacility[] = [
  {
    id: 'h-100',
    name: 'XYZ Specialist Hospital',
    address: 'Plot 12 Muhammadu Buhari Way, Kaduna Central',
    city: 'Kaduna State',
    phone: '+234 803 444 8888',
    emergencyHotline: '+234 800 999 0000',
    email: 'info@xyzspecialist.ng',
    type: 'Specialist Referral Center',
    departments: ['Cardiology', 'Pediatrics', 'Emergency & Trauma', 'Laboratory & Blood Bank', 'General Surgery', 'Internal Medicine'],
    isEmergencyAvailable: true,
    isVerifiedFacility: true,
    operatingHours: '24 Hours / 7 Days',
    adminName: 'Dr. Ibrahim Sani',
  },
  {
    id: 'h-101',
    name: 'Lagos General Hospital Marina',
    address: '1-4 Broad Street, Lagos Island',
    city: 'Lagos State',
    phone: '+234 803 000 0001',
    emergencyHotline: '+234 800 111 2222',
    email: 'marina@lagosgeneral.gov.ng',
    type: 'General Public Hospital',
    departments: ['General Medicine', 'Maternity & Child Health', 'Accident & Emergency', 'Blood Bank', 'Dentistry'],
    isEmergencyAvailable: true,
    isVerifiedFacility: true,
    operatingHours: '24 Hours / 7 Days',
    adminName: 'Dr. Babatunde Williams',
  },
  {
    id: 'h-102',
    name: 'Victoria Island Medical Center',
    address: 'Plot 24, Karimu Kotun Street, Victoria Island',
    city: 'Lagos State',
    phone: '+234 805 987 0001',
    emergencyHotline: '+234 800 333 4444',
    email: 'info@vimc.ng',
    type: 'Private Tertiary Hospital',
    departments: ['Cardiology', 'Neurology', 'Executive Health', 'Blood Transfusion', 'ICU'],
    isEmergencyAvailable: true,
    isVerifiedFacility: true,
    operatingHours: '24 Hours / 7 Days',
    adminName: 'Dr. Folashade Adeyemi',
  },
  {
    id: 'h-103',
    name: 'Eko Medical Center Ikeja',
    address: '31 Mobolaji Bank Anthony Way, Ikeja',
    city: 'Lagos State',
    phone: '+234 812 345 0002',
    emergencyHotline: '+234 800 555 6666',
    email: 'contact@ekomc.ng',
    type: 'Medical Center',
    departments: ['General Practice', 'Pediatrics', 'Obstetrics & Gynecology', 'Clinical Diagnostics'],
    isEmergencyAvailable: false,
    isVerifiedFacility: true,
    operatingHours: '08:00 AM - 10:00 PM',
    adminName: 'Dr. Chukwuma Obi',
  },
];

const FACILITY_INFO = ALL_FACILITIES[0];

// Facility-Scoped Appointments
const FACILITY_APPOINTMENTS = [
  {
    id: 'h-apt-01',
    patientName: 'Aisha Okonkwo',
    patientRef: 'PAT-4901',
    doctorAssigned: 'Dr. Ahmed Bello',
    doctorSpecialty: 'Cardiology',
    appointmentType: 'In-Person Consultation',
    scheduledTime: 'Today, 10:00 AM',
    status: 'Active',
    checkInStatus: 'Checked-In (Waiting)',
    room: 'Consultation Suite 4B',
  },
  {
    id: 'h-apt-02',
    patientName: 'Babatunde Balogun',
    patientRef: 'PAT-4902',
    doctorAssigned: 'Dr. Musa Aliyu',
    doctorSpecialty: 'General Practice',
    appointmentType: 'Tele-Consultation Review',
    scheduledTime: 'Yesterday, 02:30 PM',
    status: 'Completed',
    checkInStatus: 'Concluded',
    room: 'Virtual Clinic 2',
  },
  {
    id: 'h-apt-03',
    patientName: 'Chioma Nwachukwu',
    patientRef: 'PAT-4903',
    doctorAssigned: 'Dr. Sarah Danladi',
    doctorSpecialty: 'Dermatology',
    appointmentType: 'In-Person Follow-up',
    scheduledTime: 'Tomorrow, 11:15 AM',
    status: 'Upcoming',
    checkInStatus: 'Scheduled',
    room: 'Consultation Suite 1A',
  },
  {
    id: 'h-apt-04',
    patientName: 'Ibrahim Danjuma',
    patientRef: 'PAT-4910',
    doctorAssigned: 'Dr. Ahmed Bello',
    doctorSpecialty: 'Cardiology',
    appointmentType: 'Emergency ECG Review',
    scheduledTime: 'Today, 03:00 PM',
    status: 'Upcoming',
    checkInStatus: 'Confirmed',
    room: 'Cardiac Wing Suite 2',
  },
];

// Facility-Scoped Patients
const FACILITY_PATIENTS = [
  {
    id: 'pat-4901',
    name: 'Aisha Okonkwo',
    gender: 'Female',
    age: 32,
    bloodGroup: 'O+',
    lastVisit: 'Today, 10:00 AM',
    assignedDoctor: 'Dr. Ahmed Bello',
    activePrescription: 'Amlodipine 5mg Daily',
    allergies: 'Penicillin',
    vitals: { bp: '128/82 mmHg', hr: '74 bpm', temp: '36.8°C' },
    consultationNotes: 'Hypertension follow-up. Blood pressure stabilization noted on current therapy.',
  },
  {
    id: 'pat-4902',
    name: 'Babatunde Balogun',
    gender: 'Male',
    age: 37,
    bloodGroup: 'A+',
    lastVisit: 'Yesterday',
    assignedDoctor: 'Dr. Musa Aliyu',
    activePrescription: 'Metformin 500mg Twice Daily',
    allergies: 'None recorded',
    vitals: { bp: '120/80 mmHg', hr: '70 bpm', temp: '36.6°C' },
    consultationNotes: 'Routine metabolic panel review. Glycemic control within target range.',
  },
  {
    id: 'pat-4903',
    name: 'Chioma Nwachukwu',
    gender: 'Female',
    age: 27,
    bloodGroup: 'B+',
    lastVisit: 'May 28, 2026',
    assignedDoctor: 'Dr. Sarah Danladi',
    activePrescription: 'Topical Hydrocortisone 1%',
    allergies: 'Sulfa Drugs',
    vitals: { bp: '115/75 mmHg', hr: '68 bpm', temp: '36.7°C' },
    consultationNotes: 'Allergic contact dermatitis improving. Scheduled follow-up skin test.',
  },
];

// Hospital Doctors & Staff
const FACILITY_DOCTORS: HospitalDoctor[] = [
  {
    id: 'doc-ahm',
    name: 'Dr. Ahmed Bello',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    licenseNo: 'MDCN-LIC-88291',
    isMdcnVerified: true,
    facilityStatus: 'active',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Fri'],
    shifts: 'Morning (08:00 - 14:00)',
    syncWithMobileApp: true,
    phone: '+234 803 100 2001',
  },
  {
    id: 'doc-mus',
    name: 'Dr. Musa Aliyu',
    specialization: 'General Practitioner',
    department: 'Internal Medicine',
    licenseNo: 'MDCN-LIC-67492',
    isMdcnVerified: true,
    facilityStatus: 'active',
    availabilityDays: ['Daily'],
    shifts: 'Full Day (09:00 - 17:00)',
    syncWithMobileApp: true,
    phone: '+234 805 200 3002',
  },
  {
    id: 'doc-sar',
    name: 'Dr. Sarah Danladi',
    specialization: 'Dermatologist',
    department: 'Dermatology',
    licenseNo: 'MDCN-LIC-44109',
    isMdcnVerified: true,
    facilityStatus: 'on_call',
    availabilityDays: ['Tue', 'Thu', 'Sat'],
    shifts: 'Afternoon (14:00 - 18:00)',
    syncWithMobileApp: true,
    phone: '+234 812 300 4003',
  },
];

// Blood Requests with 6-Step Verification Pipeline
const INITIAL_BLOOD_REQUESTS: HospitalBloodRequest[] = [
  {
    id: 'BR-2026-101',
    patientRef: 'HSP-KAD-8841',
    patientName: 'Zainab Kabir (Post-Partum)',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    unitsCollected: 1,
    urgency: 'emergency',
    requiredBy: 'Today, 06:00 PM',
    status: 'donors_notified',
    hospitalNotes: 'Acute maternal hemorrhage in surgical ward. Requires immediate compatible packed red blood cells.',
    requestedBy: 'Dr. Ahmed Bello',
    hospitalConfirmedAt: '2026-06-04T10:35:00Z',
    ominipulseVerifiedAt: '2026-06-04T10:45:00Z',
    createdAt: '2026-06-04T10:20:00Z',
  },
  {
    id: 'BR-2026-102',
    patientRef: 'HSP-KAD-8842',
    patientName: 'Emeka Obi (Trauma)',
    bloodGroup: 'O-',
    unitsNeeded: 3,
    unitsCollected: 0,
    urgency: 'emergency',
    requiredBy: 'Today, 04:00 PM',
    status: 'hospital_confirmed',
    hospitalNotes: 'Motor vehicle accident with splenic laceration. Universal donor red cells required urgently.',
    requestedBy: 'Nurse Amina Yusuf',
    hospitalConfirmedAt: '2026-06-04T11:15:00Z',
    createdAt: '2026-06-04T11:00:00Z',
  },
  {
    id: 'BR-2026-103',
    patientRef: 'HSP-KAD-8843',
    patientName: 'Hadiza Sani (Elective Surgery)',
    bloodGroup: 'B+',
    unitsNeeded: 2,
    unitsCollected: 2,
    urgency: 'routine',
    requiredBy: 'June 06, 2026',
    status: 'fulfilled',
    hospitalNotes: 'Pre-operative crossmatching for orthopedic femur reconstruction.',
    requestedBy: 'Dr. Musa Aliyu',
    hospitalConfirmedAt: '2026-06-02T09:00:00Z',
    ominipulseVerifiedAt: '2026-06-02T09:30:00Z',
    createdAt: '2026-06-02T08:45:00Z',
  },
];

// Controlled Emergency Requests
const INITIAL_EMERGENCY_REQUESTS: HospitalEmergencyRequest[] = [
  {
    id: 'EMG-01',
    type: 'blood_critical',
    title: 'Critical Blood Shortage: O- Negative',
    details: 'Urgent need for 3 units of O- Negative blood in emergency resuscitation ward.',
    severity: 'critical',
    status: 'active',
    createdAt: '2026-06-04T10:00:00Z',
  },
  {
    id: 'EMG-02',
    type: 'icu_bed',
    title: 'Adult ICU Bed Availability Alert',
    details: '2 ICU Ventilator Beds currently available for regional transfers.',
    severity: 'moderate',
    availableSlots: 2,
    status: 'active',
    createdAt: '2026-06-04T08:00:00Z',
  },
];

// Facility Audit Trail Log
const INITIAL_AUDIT_LOGS: HospitalAuditEntry[] = [
  { id: 'aud-1', timestamp: '11:02 AM', staffName: 'Receptionist Fatima', staffRole: 'receptionist', action: 'Updated appointment time & room assignment', target: 'Appointment HSP-APT-04 (Ibrahim Danjuma)' },
  { id: 'aud-2', timestamp: '10:35 AM', staffName: 'Dr. Ibrahim Sani', staffRole: 'hospital_admin', action: 'Confirmed hospital blood request as legitimate', target: 'Blood Request BR-2026-101 (Zainab Kabir)' },
  { id: 'aud-3', timestamp: '10:12 AM', staffName: 'Dr. Ahmed Bello', staffRole: 'doctor', action: 'Created digital e-prescription', target: 'Patient Aisha Okonkwo (PAT-4901)' },
  { id: 'aud-4', timestamp: '09:42 AM', staffName: 'Nurse Amina Yusuf', staffRole: 'nurse', action: 'Viewed patient triage clinical record & vitals', target: 'Patient Aisha Okonkwo (PAT-4901)' },
];

// ─── 1. Hospital Clinical Services ──────────────────────────────────────────
export interface HospitalService {
  id: string;
  name: string;
  department: string;
  fee: number;
  duration: string;
  emergencyAvailable: boolean;
  status: 'active' | 'paused';
  description: string;
}

const INITIAL_SERVICES: HospitalService[] = [
  {
    id: 'srv-1',
    name: 'Comprehensive Cardiology Consultation & ECG',
    department: 'Cardiology',
    fee: 25000,
    duration: '45 mins',
    emergencyAvailable: true,
    status: 'active',
    description: 'Specialist physician cardiac evaluation, 12-lead resting ECG, blood pressure mapping.',
  },
  {
    id: 'srv-2',
    name: 'General Outpatient Triage & Treatment',
    department: 'General Medicine',
    fee: 10000,
    duration: '30 mins',
    emergencyAvailable: true,
    status: 'active',
    description: 'Primary care diagnosis, routine vital signs triage, prescription and follow-up plan.',
  },
  {
    id: 'srv-3',
    name: 'Pediatric Wellness & Immunization',
    department: 'Pediatrics',
    fee: 15000,
    duration: '30 mins',
    emergencyAvailable: false,
    status: 'active',
    description: 'Childhood developmental assessment, vaccine administration, and growth tracking.',
  },
  {
    id: 'srv-4',
    name: '24/7 Trauma & Emergency Casualty Care',
    department: 'Emergency',
    fee: 35000,
    duration: 'Immediate',
    emergencyAvailable: true,
    status: 'active',
    description: 'Immediate trauma resuscitation, wound suture, hemorrhage control, and stabilization.',
  },
  {
    id: 'srv-5',
    name: 'Automated Blood Grouping & Crossmatch Panel',
    department: 'Laboratory',
    fee: 8500,
    duration: '60 mins',
    emergencyAvailable: true,
    status: 'active',
    description: 'ABO/Rh typing, major and minor cross-matching, antibody screening prior to transfusion.',
  },
  {
    id: 'srv-6',
    name: 'Digital Ultrasound & Doppler Echocardiography',
    department: 'Radiology',
    fee: 22000,
    duration: '40 mins',
    emergencyAvailable: false,
    status: 'active',
    description: 'High-definition abdominal, pelvic, and transthoracic cardiac diagnostic ultrasound.',
  },
];

// ─── 2. Blood Donor Screening & Donation Register ───────────────────────────
export interface DonorScreeningAppointment {
  id: string;
  donorName: string;
  bloodGroup: string;
  appointmentTime: string;
  targetAppealRef: string;
  phone: string;
  screeningStatus: 'pending_screening' | 'cleared_for_donation' | 'donation_completed' | 'deferred';
  vitals: { hb: string; bp: string; weight: string };
  screeningNotes?: string;
  unitsCollected?: number;
}

const INITIAL_SCREENING_APPOINTMENTS: DonorScreeningAppointment[] = [
  {
    id: 'SCR-401',
    donorName: 'Ibrahim Danladi',
    bloodGroup: 'O+',
    appointmentTime: 'Today, 02:30 PM',
    targetAppealRef: 'HSP-KAD-8841 (Zainab Kabir)',
    phone: '+234 803 111 2233',
    screeningStatus: 'cleared_for_donation',
    vitals: { hb: '14.2 g/dL', bp: '120/80 mmHg', weight: '72 kg' },
    screeningNotes: 'HIV 1/2, HBsAg, HCV, VDRL all non-reactive. Cleared for 450ml whole blood donation.',
    unitsCollected: 1,
  },
  {
    id: 'SCR-402',
    donorName: 'Chinedu Eze',
    bloodGroup: 'B+',
    appointmentTime: 'Today, 04:00 PM',
    targetAppealRef: 'HSP-KAD-8843 (Hadiza Sani)',
    phone: '+234 802 444 5566',
    screeningStatus: 'pending_screening',
    vitals: { hb: 'Pending triage', bp: 'Pending triage', weight: '68 kg' },
  },
  {
    id: 'SCR-403',
    donorName: 'Zainab Kabir',
    bloodGroup: 'O+',
    appointmentTime: 'Tomorrow, 10:00 AM',
    targetAppealRef: 'HSP-KAD-8841 (Zainab Kabir)',
    phone: '+234 809 777 8899',
    screeningStatus: 'pending_screening',
    vitals: { hb: 'Pending triage', bp: 'Pending triage', weight: '64 kg' },
  },
  {
    id: 'SCR-404',
    donorName: 'Babajide Adeleke',
    bloodGroup: 'A+',
    appointmentTime: 'Yesterday, 11:30 AM',
    targetAppealRef: 'Routine Blood Bank Stocking',
    phone: '+234 814 333 9900',
    screeningStatus: 'donation_completed',
    vitals: { hb: '13.8 g/dL', bp: '124/82 mmHg', weight: '76 kg' },
    screeningNotes: 'Successfully collected 1 unit whole blood into CPDA-1 triple bag. Donor rested with refreshments.',
    unitsCollected: 1,
  },
];

// ─── 3. Hospital Real-Time Notifications ────────────────────────────────────
export interface HospitalNotification {
  id: string;
  timestamp: string;
  type: 'appointment' | 'blood' | 'staff' | 'emergency' | 'system';
  title: string;
  message: string;
  read: boolean;
  priority: 'urgent' | 'normal';
}

const INITIAL_NOTIFICATIONS: HospitalNotification[] = [
  {
    id: 'notif-1',
    timestamp: '10 mins ago',
    type: 'appointment',
    title: 'New Patient Appointment Booked',
    message: 'Mariam Oladosu scheduled a Cardiology In-Person visit with Dr. Ahmed Bello for Tomorrow at 10:00 AM.',
    read: false,
    priority: 'normal',
  },
  {
    id: 'notif-2',
    timestamp: '35 mins ago',
    type: 'blood',
    title: 'Blood Appeal Verification Approved',
    message: 'OminiPulse Central Blood Desk verified Request BR-2026-101 (O+ Emergency). 14 eligible community donors notified.',
    read: false,
    priority: 'urgent',
  },
  {
    id: 'notif-3',
    timestamp: '1 hour ago',
    type: 'blood',
    title: 'Donor Screening Appointment Booked',
    message: 'Volunteer donor Ibrahim Danladi booked a pre-donation screening appointment at the blood bank for Today at 02:30 PM.',
    read: false,
    priority: 'normal',
  },
  {
    id: 'notif-4',
    timestamp: '2 hours ago',
    type: 'staff',
    title: 'Doctor Shift Availability Updated',
    message: 'Dr. Musa Aliyu updated his General Practice availability for Friday: On-Call 08:00 AM – 04:00 PM.',
    read: true,
    priority: 'normal',
  },
  {
    id: 'notif-5',
    timestamp: 'Yesterday',
    type: 'appointment',
    title: 'Appointment Cancelled by Patient',
    message: 'Grace Eze cancelled her follow-up appointment with Dr. Sarah Danladi scheduled for yesterday.',
    read: true,
    priority: 'normal',
  },
  {
    id: 'notif-6',
    timestamp: '2 days ago',
    type: 'system',
    title: 'Facility License Renewal Confirmation',
    message: 'Kaduna State Ministry of Health inspection clearance confirmed and active in OminiPulse partner registry.',
    read: true,
    priority: 'normal',
  },
];

// ─── Hospital Wards & Beds Mock Dataset ──────────────────────────────────────
const INITIAL_BEDS: HospitalBed[] = [
  // Intensive Care Unit (ICU)
  { id: 'bed-icu-01', bedNumber: 'ICU-01', ward: 'icu', wardLabel: 'Intensive Care Unit (ICU)', status: 'occupied', currentPatientId: 'PAT-4903', currentPatientName: 'Chinedu Okafor', patientAge: 46, patientGender: 'Male', admissionDate: '2026-06-03', attendingDoctor: 'Dr. Ahmed Bello', diagnosis: 'Acute Respiratory Distress / Post-MI Observation', assignedNurse: 'Nurse Amina Yusuf', lastCleanedAt: '2026-06-03 08:00' },
  { id: 'bed-icu-02', bedNumber: 'ICU-02', ward: 'icu', wardLabel: 'Intensive Care Unit (ICU)', status: 'available', lastCleanedAt: '2026-06-04 06:30' },
  { id: 'bed-icu-03', bedNumber: 'ICU-03', ward: 'icu', wardLabel: 'Intensive Care Unit (ICU)', status: 'cleaning_required', lastCleanedAt: '2026-06-03 18:00' },
  { id: 'bed-icu-04', bedNumber: 'ICU-04', ward: 'icu', wardLabel: 'Intensive Care Unit (ICU)', status: 'available', lastCleanedAt: '2026-06-04 07:00' },

  // Emergency Casualty Ward
  { id: 'bed-emg-01', bedNumber: 'EMG-01', ward: 'emergency', wardLabel: 'Emergency Casualty Ward', status: 'occupied', currentPatientId: 'PAT-4901', currentPatientName: 'Aisha Okonkwo', patientAge: 32, patientGender: 'Female', admissionDate: '2026-06-04', attendingDoctor: 'Dr. Musa Aliyu', diagnosis: 'Motorcycle Road Traffic Accident / Right Tibia Fracture', assignedNurse: 'Nurse Amina Yusuf', lastCleanedAt: '2026-06-04 09:00' },
  { id: 'bed-emg-02', bedNumber: 'EMG-02', ward: 'emergency', wardLabel: 'Emergency Casualty Ward', status: 'available', lastCleanedAt: '2026-06-04 10:00' },
  { id: 'bed-emg-03', bedNumber: 'EMG-03', ward: 'emergency', wardLabel: 'Emergency Casualty Ward', status: 'available', lastCleanedAt: '2026-06-04 08:45' },

  // Male Surgical Ward
  { id: 'bed-msw-01', bedNumber: 'MSW-01', ward: 'male_surgical', wardLabel: 'Male Surgical Ward', status: 'occupied', currentPatientId: 'PAT-4904', currentPatientName: 'Ibrahim Danjuma', patientAge: 29, patientGender: 'Male', admissionDate: '2026-06-02', attendingDoctor: 'Dr. Ibrahim Sani', diagnosis: 'Post-Appendectomy Day 2 / Wound Drain Intact', assignedNurse: 'Nurse Boma Douglas', lastCleanedAt: '2026-06-02 11:00' },
  { id: 'bed-msw-02', bedNumber: 'MSW-02', ward: 'male_surgical', wardLabel: 'Male Surgical Ward', status: 'available', lastCleanedAt: '2026-06-03 14:00' },
  { id: 'bed-msw-03', bedNumber: 'MSW-03', ward: 'male_surgical', wardLabel: 'Male Surgical Ward', status: 'cleaning_required', lastCleanedAt: '2026-06-04 08:00' },
  { id: 'bed-msw-04', bedNumber: 'MSW-04', ward: 'male_surgical', wardLabel: 'Male Surgical Ward', status: 'maintenance', lastCleanedAt: '2026-05-30 09:00' },

  // Female Medical Ward
  { id: 'bed-fmw-01', bedNumber: 'FMW-01', ward: 'female_medical', wardLabel: 'Female Medical Ward', status: 'occupied', currentPatientId: 'PAT-4902', currentPatientName: 'Zainab Kabir', patientAge: 28, patientGender: 'Female', admissionDate: '2026-06-03', attendingDoctor: 'Dr. Ahmed Bello', diagnosis: 'Complicated Malaria / Severe Anemia (Transfusion in progress)', assignedNurse: 'Nurse Amina Yusuf', lastCleanedAt: '2026-06-03 10:30' },
  { id: 'bed-fmw-02', bedNumber: 'FMW-02', ward: 'female_medical', wardLabel: 'Female Medical Ward', status: 'available', lastCleanedAt: '2026-06-04 07:15' },
  { id: 'bed-fmw-03', bedNumber: 'FMW-03', ward: 'female_medical', wardLabel: 'Female Medical Ward', status: 'available', lastCleanedAt: '2026-06-04 09:30' },

  // Pediatric Ward
  { id: 'bed-ped-01', bedNumber: 'PED-01', ward: 'pediatric', wardLabel: 'Pediatric Ward', status: 'occupied', currentPatientId: 'PAT-4905', currentPatientName: 'Baby Fatima Bello', patientAge: 3, patientGender: 'Female', admissionDate: '2026-06-03', attendingDoctor: 'Dr. Sarah Danladi', diagnosis: 'Acute Bronchiolitis / Nebulization & IV Fluids', assignedNurse: 'Nurse Boma Douglas', lastCleanedAt: '2026-06-03 12:00' },
  { id: 'bed-ped-02', bedNumber: 'PED-02', ward: 'pediatric', wardLabel: 'Pediatric Ward', status: 'available', lastCleanedAt: '2026-06-04 06:00' },

  // Maternity Ward
  { id: 'bed-mat-01', bedNumber: 'MAT-01', ward: 'maternity', wardLabel: 'Maternity & Labor Ward', status: 'occupied', currentPatientId: 'PAT-4906', currentPatientName: 'Maryam Bello', patientAge: 26, patientGender: 'Female', admissionDate: '2026-06-04', attendingDoctor: 'Dr. Sarah Danladi', diagnosis: '38 Weeks Gestation / Early Stage Latent Labor', assignedNurse: 'Nurse Amina Yusuf', lastCleanedAt: '2026-06-04 08:00' },
  { id: 'bed-mat-02', bedNumber: 'MAT-02', ward: 'maternity', wardLabel: 'Maternity & Labor Ward', status: 'available', lastCleanedAt: '2026-06-04 07:45' },
];

// ─── Hospital Internal Pharmacy Mock Dataset ────────────────────────────────
const INITIAL_MEDICATIONS: HospitalMedicationItem[] = [
  { id: 'med-01', name: 'Paracetamol IV Infusion 1000mg/100ml', category: 'IV Fluids', dosageForm: 'IV Infusion Bottle', batchNumber: 'PARA-2026-09', stockQuantity: 240, minimumThreshold: 50, unitPrice: 2500, expiryDate: '2027-08-30', status: 'in_stock' },
  { id: 'med-02', name: 'Ceftriaxone Sodium Injection 1g Powder', category: 'Antibiotics', dosageForm: 'Vial + Water for Inj', batchNumber: 'CEF-2025-14', stockQuantity: 85, minimumThreshold: 30, unitPrice: 3800, expiryDate: '2026-12-15', status: 'in_stock' },
  { id: 'med-03', name: 'Normal Saline (0.9% NaCl) 500ml', category: 'IV Fluids', dosageForm: 'IV Infusion Bag', batchNumber: 'NS-2026-02', stockQuantity: 18, minimumThreshold: 40, unitPrice: 1800, expiryDate: '2027-03-20', status: 'low_stock' },
  { id: 'med-04', name: 'Diclofenac Sodium 75mg/3ml Ampoule', category: 'Analgesics', dosageForm: 'IM Injection Ampoule', batchNumber: 'DIC-2025-88', stockQuantity: 150, minimumThreshold: 40, unitPrice: 1500, expiryDate: '2026-11-10', status: 'in_stock' },
  { id: 'med-05', name: 'Artemether/Lumefantrine 80/480mg Tabs', category: 'Emergency', dosageForm: 'Blister Pack (6 tabs)', batchNumber: 'AL-2024-51', stockQuantity: 32, minimumThreshold: 25, unitPrice: 2200, expiryDate: '2026-07-28', status: 'expiring_soon' },
  { id: 'med-06', name: 'Intravenous Cannula Gauge 20 (Pink)', category: 'Consumables', dosageForm: 'Sterile Piece', batchNumber: 'CAN-2026-01', stockQuantity: 420, minimumThreshold: 100, unitPrice: 800, expiryDate: '2028-01-01', status: 'in_stock' },
  { id: 'med-07', name: 'Metronidazole Infusion 500mg/100ml', category: 'Antibiotics', dosageForm: 'IV Bottle', batchNumber: 'MET-2025-33', stockQuantity: 64, minimumThreshold: 25, unitPrice: 2000, expiryDate: '2026-10-05', status: 'in_stock' },
];

const INITIAL_PRESCRIPTIONS: HospitalPrescriptionOrder[] = [
  {
    id: 'rx-01',
    prescriptionNumber: 'RX-2026-081',
    patientId: 'PAT-4902',
    patientName: 'Zainab Kabir (FMW Bed 01)',
    doctorName: 'Dr. Ahmed Bello',
    department: 'Female Medical Ward',
    prescribedAt: 'Today, 10:15 AM',
    medications: [
      { drugName: 'Ceftriaxone 1g IV', dosage: '1g IV Stat then BD', duration: '5 days', instructions: 'Reconstitute with 10ml WFI, administer slowly' },
      { drugName: 'Paracetamol IV 1000mg', dosage: '1000mg IV', duration: '3 days', instructions: 'Infuse over 15 mins for temperature > 38.5C' },
    ],
    status: 'pending',
  },
  {
    id: 'rx-02',
    prescriptionNumber: 'RX-2026-082',
    patientId: 'PAT-4904',
    patientName: 'Ibrahim Danjuma (MSW Bed 01)',
    doctorName: 'Dr. Musa Aliyu',
    department: 'Male Surgical Ward',
    prescribedAt: 'Today, 08:30 AM',
    medications: [
      { drugName: 'Diclofenac Sodium 75mg IM', dosage: '75mg IM BD', duration: '2 days', instructions: 'Deep intragluteal injection post-op' },
      { drugName: 'Normal Saline 0.9% 500ml', dosage: '500ml IV', duration: '24 hrs', instructions: 'Run at 30 drops/min' },
    ],
    status: 'dispensed',
    dispensedBy: 'Pharm. Chioma Okonkwo',
    dispensedAt: 'Today, 09:15 AM',
  },
  {
    id: 'rx-03',
    prescriptionNumber: 'RX-2026-083',
    patientId: 'PAT-4903',
    patientName: 'Chinedu Okafor (ICU Bed 01)',
    doctorName: 'Dr. Ahmed Bello',
    department: 'Intensive Care Unit (ICU)',
    prescribedAt: 'Today, 11:20 AM',
    medications: [
      { drugName: 'Metronidazole 500mg IV', dosage: '500mg IV TDS', duration: '5 days', instructions: 'Protect from direct sunlight during infusion' },
    ],
    status: 'pending',
  },
];

// ─── Hospital Laboratory Mock Dataset ───────────────────────────────────────
const INITIAL_LAB_ORDERS: HospitalLabOrder[] = [
  {
    id: 'lab-01',
    orderNumber: 'LAB-2026-101',
    patientId: 'PAT-4902',
    patientName: 'Zainab Kabir (FMW Bed 01)',
    doctorName: 'Dr. Ahmed Bello',
    testName: 'Full Blood Count (FBC) + ESR',
    testCategory: 'Hematology',
    sampleType: 'Blood',
    urgency: 'urgent',
    orderedAt: 'Today, 09:10 AM',
    status: 'results_ready',
    resultsSummary: 'Hb: 8.2 g/dL (Mild-Moderate Anemia), WBC: 12,400 /mm3 (Leukocytosis), Platelets: 180,000 /mm3.',
    normalRange: 'Hb: 12.0 - 15.5 g/dL | WBC: 4,000 - 10,000 /mm3',
    findings: 'Microcytic hypochromic picture consistent with ongoing hemolysis from severe malaria.',
    technicianName: 'MLS. Emeka Nnamdi',
    verifiedAt: 'Today, 10:45 AM',
  },
  {
    id: 'lab-02',
    orderNumber: 'LAB-2026-102',
    patientId: 'PAT-4904',
    patientName: 'Ibrahim Danjuma (MSW Bed 01)',
    doctorName: 'Dr. Musa Aliyu',
    testName: 'Malaria Parasite (MP / Blood Film)',
    testCategory: 'Parasitology',
    sampleType: 'Blood',
    urgency: 'routine',
    orderedAt: 'Today, 09:40 AM',
    status: 'results_ready',
    resultsSummary: '3+ Plasmodium falciparum ring forms detected.',
    normalRange: 'Nil seen',
    findings: 'High parasitemia count. Antimalarial therapy advised.',
    technicianName: 'MLS. Emeka Nnamdi',
    verifiedAt: 'Today, 10:30 AM',
  },
  {
    id: 'lab-03',
    orderNumber: 'LAB-2026-103',
    patientId: 'PAT-4903',
    patientName: 'Chinedu Okafor (ICU Bed 01)',
    doctorName: 'Dr. Ahmed Bello',
    testName: 'Serum Electrolytes, Urea & Creatinine (E/U/Cr)',
    testCategory: 'Biochemistry',
    sampleType: 'Blood',
    urgency: 'stat_emergency',
    orderedAt: 'Today, 10:50 AM',
    status: 'in_testing',
    findings: 'Sample running in automated chemistry analyzer.',
    technicianName: 'MLS. Emeka Nnamdi',
  },
  {
    id: 'lab-04',
    orderNumber: 'LAB-2026-104',
    patientId: 'PAT-4901',
    patientName: 'Aisha Okonkwo (EMG Bed 01)',
    doctorName: 'Dr. Musa Aliyu',
    testName: 'Urinalysis Dipstick 10-Parameter',
    testCategory: 'Urinalysis',
    sampleType: 'Urine',
    urgency: 'routine',
    orderedAt: 'Today, 11:05 AM',
    status: 'sample_pending',
  },
];

export default function HospitalPortalPage() {
  const searchParams = useSearchParams();
  const facilityParam = searchParams?.get('facilityId');
  const initialFacility = ALL_FACILITIES.find(f => f.id === facilityParam) || ALL_FACILITIES[0];
  const [currentFacility, setCurrentFacility] = useState<RegisteredFacility>(initialFacility);
  const initialTab = searchParams?.get('tab') || 'appointments';
  const [currentTab, setCurrentTab] = useState(initialTab);

  const tabParam = searchParams?.get('tab');
  useEffect(() => {
    if (tabParam && tabParam !== currentTab) {
      setCurrentTab(tabParam);
    }
  }, [tabParam, currentTab]);

  // Active Logged-In Persona
  const admin = useAuthStore(s => s.admin);
  const currentRole: AdminRole = (admin?.role as AdminRole) || 'hospital_admin';

  const matchedStaff = STAFF_PERSONAS.find(s => s.role === (currentRole === 'admin' ? 'hospital_admin' : currentRole)) || STAFF_PERSONAS[0];
  const activeStaff: StaffPersona = {
    ...matchedStaff,
    name: admin ? `${admin.firstName} ${admin.lastName}` : matchedStaff.name,
    role: (currentRole === 'admin' ? 'hospital_admin' : currentRole) as HospitalStaffRole,
    canManageStaff: currentRole === 'hospital_admin' || currentRole === 'admin',
    canManageBlood: currentRole === 'hospital_admin' || currentRole === 'blood_officer' || currentRole === 'lab_technician' || currentRole === 'admin',
  };

  const portalInfo = {
    nurse: {
      portalName: 'Nurse Clinical Portal',
      roleTitle: 'Nurse',
      badge: 'NURSE',
    },
    receptionist: {
      portalName: 'Reception & Intake Portal',
      roleTitle: 'Receptionist',
      badge: 'RECEPTIONIST',
    },
    blood_officer: {
      portalName: 'Blood Bank Portal',
      roleTitle: 'Blood Officer',
      badge: 'BLOOD OFFICER',
    },
    pharmacist: {
      portalName: 'Hospital Pharmacy & Dispensary',
      roleTitle: 'Hospital Pharmacist',
      badge: 'PHARMACIST',
    },
    lab_technician: {
      portalName: 'Clinical Laboratory Portal',
      roleTitle: 'Lab Scientist',
      badge: 'LAB SCIENTIST',
    },
    doctor: {
      portalName: 'Doctor Clinical Workspace',
      roleTitle: 'Doctor',
      badge: 'DOCTOR',
    },
    admin: {
      portalName: 'Hospital Master Admin Portal',
      roleTitle: 'Super Admin',
      badge: 'SUPER ADMIN',
    },
    hospital_admin: {
      portalName: 'Hospital Admin Portal',
      roleTitle: 'Hospital Admin',
      badge: 'HOSPITAL ADMIN',
    },
  }[currentRole] || {
    portalName: 'Hospital Admin Portal',
    roleTitle: 'Hospital Admin',
    badge: 'HOSPITAL ADMIN',
  };

  // Blood Requests state
  const [bloodRequests, setBloodRequests] = useState<HospitalBloodRequest[]>(INITIAL_BLOOD_REQUESTS);
  const [selectedPatientModal, setSelectedPatientModal] = useState<any | null>(null);
  const [newBloodModalOpen, setNewBloodModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // New Blood Request form state
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [newUnits, setNewUnits] = useState('2');
  const [newUrgency, setNewUrgency] = useState<'routine' | 'urgent' | 'emergency'>('emergency');
  const [newPatientName, setNewPatientName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Hospital Action handlers
  const handleConfirmBloodRequest = (requestId: string) => {
    setBloodRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: 'hospital_confirmed', hospitalConfirmedAt: new Date().toISOString() } : r)
    );
  };

  const handleMarkReceived = (requestId: string) => {
    setBloodRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: 'fulfilled', unitsCollected: r.unitsNeeded } : r)
    );
  };

  const handleCloseRequest = (requestId: string) => {
    setBloodRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: 'closed' } : r)
    );
  };

  // ── Wards & Beds State ──────────────────────────────────────────────────────
  const [bedsList, setBedsList] = useState<HospitalBed[]>(INITIAL_BEDS);
  const [selectedWardFilter, setSelectedWardFilter] = useState<'all' | HospitalWardType>('all');
  const [assignBedModalBed, setAssignBedModalBed] = useState<HospitalBed | null>(null);
  const [assignPatientName, setAssignPatientName] = useState('');
  const [assignPatientDiagnosis, setAssignPatientDiagnosis] = useState('');
  const [assignAttendingDoctor, setAssignAttendingDoctor] = useState('Dr. Ahmed Bello');
  const [transferBedModalBed, setTransferBedModalBed] = useState<HospitalBed | null>(null);
  const [targetTransferWard, setTargetTransferWard] = useState<HospitalWardType>('icu');

  // ── Pharmacy State ──────────────────────────────────────────────────────────
  const [medicationsList, setMedicationsList] = useState<HospitalMedicationItem[]>(INITIAL_MEDICATIONS);
  const [prescriptionsList, setPrescriptionsList] = useState<HospitalPrescriptionOrder[]>(INITIAL_PRESCRIPTIONS);
  const [pharmacySubTab, setPharmacySubTab] = useState<'prescriptions' | 'inventory'>('prescriptions');
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedCategory, setNewMedCategory] = useState<'Antibiotics' | 'Analgesics' | 'IV Fluids' | 'Cardiovascular' | 'Consumables' | 'Emergency'>('Antibiotics');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedBatch, setNewMedBatch] = useState('');
  const [newMedQty, setNewMedQty] = useState('50');
  const [newMedPrice, setNewMedPrice] = useState('2500');
  const [newMedExpiry, setNewMedExpiry] = useState('2027-06-30');

  // ── Laboratory State ────────────────────────────────────────────────────────
  const [labOrdersList, setLabOrdersList] = useState<HospitalLabOrder[]>(INITIAL_LAB_ORDERS);
  const [labSubTab, setLabSubTab] = useState<'orders' | 'completed'>('orders');
  const [enterResultModalOrder, setEnterResultModalOrder] = useState<HospitalLabOrder | null>(null);
  const [resultSummaryInput, setResultSummaryInput] = useState('');
  const [resultFindingsInput, setResultFindingsInput] = useState('');
  const [resultNormalRangeInput, setResultNormalRangeInput] = useState('');

  // ── Custom In-App Modal States (replacing browser alerts) ───────────────────
  const [systemNoticeModal, setSystemNoticeModal] = useState<{ title: string; message: string; type?: 'warning' | 'info' | 'success' | 'error' } | null>(null);
  const [viewLabReportModalOrder, setViewLabReportModalOrder] = useState<HospitalLabOrder | null>(null);
  const [contactBillingModalOpen, setContactBillingModalOpen] = useState(false);
  const [downloadReceiptModalInvoice, setDownloadReceiptModalInvoice] = useState<{ invoiceNumber: string; title: string; amount: string; date: string } | null>(null);

  // ── Wards Actions ───────────────────────────────────────────────────────────
  const handleAssignBedSubmit = () => {
    if (!assignBedModalBed || !assignPatientName.trim()) return;
    setBedsList(prev => prev.map(b => b.id === assignBedModalBed.id ? {
      ...b,
      status: 'occupied',
      currentPatientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      currentPatientName: assignPatientName.trim(),
      diagnosis: assignPatientDiagnosis.trim() || 'General Medical Inpatient Admission',
      attendingDoctor: assignAttendingDoctor,
      admissionDate: new Date().toISOString().split('T')[0],
      assignedNurse: activeStaff.name,
    } : b));
    setAssignBedModalBed(null);
    setAssignPatientName('');
    setAssignPatientDiagnosis('');
  };

  const handleTransferBedSubmit = () => {
    if (!transferBedModalBed) return;
    const targetBed = bedsList.find(b => b.ward === targetTransferWard && b.status === 'available');
    if (!targetBed) {
      setSystemNoticeModal({
        title: 'Ward Bed Full',
        message: `No available bed currently in ${targetTransferWard.replace('_', ' ').toUpperCase()}. Please clean a sanitized bed or select another ward.`,
        type: 'warning',
      });
      return;
    }
    setBedsList(prev => prev.map(b => {
      if (b.id === transferBedModalBed.id) {
        return {
          ...b,
          status: 'cleaning_required',
          currentPatientId: undefined,
          currentPatientName: undefined,
          diagnosis: undefined,
          admissionDate: undefined,
        };
      }
      if (b.id === targetBed.id) {
        return {
          ...b,
          status: 'occupied',
          currentPatientId: transferBedModalBed.currentPatientId,
          currentPatientName: transferBedModalBed.currentPatientName,
          diagnosis: transferBedModalBed.diagnosis,
          admissionDate: transferBedModalBed.admissionDate || new Date().toISOString().split('T')[0],
          attendingDoctor: transferBedModalBed.attendingDoctor,
          assignedNurse: activeStaff.name,
        };
      }
      return b;
    }));
    setTransferBedModalBed(null);
  };

  const handleDischargePatient = (bedId: string) => {
    setBedsList(prev => prev.map(b => b.id === bedId ? {
      ...b,
      status: 'cleaning_required',
      currentPatientId: undefined,
      currentPatientName: undefined,
      diagnosis: undefined,
      admissionDate: undefined,
    } : b));
  };

  const handleMarkBedSanitized = (bedId: string) => {
    setBedsList(prev => prev.map(b => b.id === bedId ? {
      ...b,
      status: 'available',
      lastCleanedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } : b));
  };

  // ── Pharmacy Actions ────────────────────────────────────────────────────────
  const handleDispensePrescription = (rxId: string) => {
    setPrescriptionsList(prev => prev.map(rx => rx.id === rxId ? {
      ...rx,
      status: 'dispensed',
      dispensedBy: activeStaff.name,
      dispensedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    } : rx));
  };

  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const newMed: HospitalMedicationItem = {
      id: `med-${Date.now().toString().slice(-4)}`,
      name: newMedName.trim(),
      category: newMedCategory,
      dosageForm: newMedDosage.trim() || 'Unit Pack',
      batchNumber: newMedBatch.trim() || `BATCH-${Math.floor(100 + Math.random() * 900)}`,
      stockQuantity: parseInt(newMedQty) || 1,
      minimumThreshold: 20,
      unitPrice: parseInt(newMedPrice) || 1000,
      expiryDate: newMedExpiry,
      status: parseInt(newMedQty) <= 20 ? 'low_stock' : 'in_stock',
    };
    setMedicationsList(prev => [newMed, ...prev]);
    setAddMedModalOpen(false);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedBatch('');
  };

  // ── Laboratory Actions ──────────────────────────────────────────────────────
  const handleCollectSample = (orderId: string) => {
    setLabOrdersList(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'in_testing',
      technicianName: activeStaff.name,
    } : o));
  };

  const handleSaveLabResult = () => {
    if (!enterResultModalOrder || !resultSummaryInput.trim()) return;
    setLabOrdersList(prev => prev.map(o => o.id === enterResultModalOrder.id ? {
      ...o,
      status: 'results_ready',
      resultsSummary: resultSummaryInput.trim(),
      findings: resultFindingsInput.trim(),
      normalRange: resultNormalRangeInput.trim() || o.normalRange,
      technicianName: activeStaff.name,
      verifiedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    } : o));
    setEnterResultModalOrder(null);
    setResultSummaryInput('');
    setResultFindingsInput('');
    setResultNormalRangeInput('');
  };

  const handleCreateBloodRequest = () => {
    if (!newPatientName.trim()) return;
    const newReq: HospitalBloodRequest = {
      id: `BR-2026-${100 + bloodRequests.length + 1}`,
      patientRef: `HSP-KAD-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: newPatientName,
      bloodGroup: newBloodGroup,
      unitsNeeded: parseInt(newUnits) || 1,
      unitsCollected: 0,
      urgency: newUrgency,
      requiredBy: 'Today',
      status: 'hospital_confirmed',
      hospitalNotes: newNotes,
      requestedBy: `${activeStaff.name} (${activeStaff.title})`,
      hospitalConfirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setBloodRequests([newReq, ...bloodRequests]);
    setNewBloodModalOpen(false);
    setNewPatientName('');
    setNewNotes('');
  };

  // Staff Roster & Registration State
  const [staffList, setStaffList] = useState<StaffPersona[]>(STAFF_PERSONAS);
  const [staffSubTab, setStaffSubTab] = useState<'roster' | 'doctors'>('roster');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [isRegisterStaffModalOpen, setIsRegisterStaffModalOpen] = useState(false);
  const [credentialsModalStaff, setCredentialsModalStaff] = useState<StaffPersona | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Staff Registration Form Fields
  const [regStaffName, setRegStaffName] = useState('');
  const [regStaffRole, setRegStaffRole] = useState<HospitalStaffRole>('nurse');
  const [regStaffTitle, setRegStaffTitle] = useState('');
  const [regStaffDept, setRegStaffDept] = useState('Emergency & Triage');
  const [regStaffEmail, setRegStaffEmail] = useState('');
  const [regStaffPhone, setRegStaffPhone] = useState('');
  const [regStaffPassword, setRegStaffPassword] = useState('HospitalPass2026!');

  // Clinical Services State
  const [servicesList, setServicesList] = useState<HospitalService[]>(INITIAL_SERVICES);
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDept, setNewServiceDept] = useState('Cardiology');
  const [newServiceFee, setNewServiceFee] = useState('15000');
  const [newServiceDuration, setNewServiceDuration] = useState('30 mins');
  const [newServiceEmergency, setNewServiceEmergency] = useState(false);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const handleAddServiceSubmit = () => {
    if (!newServiceName.trim()) return;
    const newService: HospitalService = {
      id: `srv-${servicesList.length + 1}`,
      name: newServiceName.trim(),
      department: newServiceDept,
      fee: parseInt(newServiceFee) || 10000,
      duration: newServiceDuration || '30 mins',
      emergencyAvailable: newServiceEmergency,
      status: 'active',
      description: newServiceDesc.trim() || 'Standard outpatient clinical service and clinical evaluation.',
    };
    setServicesList([...servicesList, newService]);
    setNewServiceModalOpen(false);
    setNewServiceName('');
    setNewServiceDesc('');
  };

  const handleToggleServiceStatus = (serviceId: string) => {
    setServicesList(prev =>
      prev.map(s => s.id === serviceId ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s)
    );
  };

  // Blood Donor Screening Appointments State
  const [screeningAppointments, setScreeningAppointments] = useState<DonorScreeningAppointment[]>(INITIAL_SCREENING_APPOINTMENTS);
  const [bloodSubTab, setBloodSubTab] = useState<'appeals' | 'screening'>('appeals');
  const [newScreeningModalOpen, setNewScreeningModalOpen] = useState(false);
  const [conductScreeningDonor, setConductScreeningDonor] = useState<DonorScreeningAppointment | null>(null);
  const [screeningFormHb, setScreeningFormHb] = useState('13.5');
  const [screeningFormBp, setScreeningFormBp] = useState('120/80');
  const [screeningFormWeight, setScreeningFormWeight] = useState('70');
  const [screeningFormDecision, setScreeningFormDecision] = useState<'cleared_for_donation' | 'donation_completed' | 'deferred'>('cleared_for_donation');
  const [screeningFormNotes, setScreeningFormNotes] = useState('');

  // Book Donor Screening Form State
  const [bookDonorName, setBookDonorName] = useState('');
  const [bookDonorPhone, setBookDonorPhone] = useState('');
  const [bookDonorBloodGroup, setBookDonorBloodGroup] = useState('O+');
  const [bookDonorTime, setBookDonorTime] = useState('Today, 03:00 PM');
  const [bookDonorAppeal, setBookDonorAppeal] = useState('HSP-KAD-8841 (Zainab Kabir)');

  const handleBookScreeningSubmit = () => {
    if (!bookDonorName.trim() || !bookDonorPhone.trim()) return;
    const newScr: DonorScreeningAppointment = {
      id: `SCR-${400 + screeningAppointments.length + 1}`,
      donorName: bookDonorName.trim(),
      bloodGroup: bookDonorBloodGroup,
      appointmentTime: bookDonorTime,
      targetAppealRef: bookDonorAppeal,
      phone: bookDonorPhone.trim(),
      screeningStatus: 'pending_screening',
      vitals: { hb: 'Pending screening', bp: 'Pending screening', weight: 'Pending screening' },
    };
    setScreeningAppointments([newScr, ...screeningAppointments]);
    setNewScreeningModalOpen(false);
    setBookDonorName('');
    setBookDonorPhone('');
  };

  const handleConductScreeningSubmit = () => {
    if (!conductScreeningDonor) return;
    setScreeningAppointments(prev =>
      prev.map(scr => scr.id === conductScreeningDonor.id ? {
        ...scr,
        screeningStatus: screeningFormDecision,
        vitals: { hb: `${screeningFormHb} g/dL`, bp: `${screeningFormBp} mmHg`, weight: `${screeningFormWeight} kg` },
        screeningNotes: screeningFormNotes.trim() || 'Medical screening completed at facility blood bank station.',
        unitsCollected: screeningFormDecision === 'donation_completed' ? 1 : scr.unitsCollected,
      } : scr)
    );
    setConductScreeningDonor(null);
  };

  // Facility Notifications State
  const [notificationsList, setNotificationsList] = useState<HospitalNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<'all' | 'appointment' | 'blood' | 'staff' | 'system'>('all');

  const handleMarkAllNotificationsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id));
  };

  // Doctor Management Actions State
  const [facilityDoctors, setFacilityDoctors] = useState<HospitalDoctor[]>(FACILITY_DOCTORS);
  const [assignDeptDoctor, setAssignDeptDoctor] = useState<HospitalDoctor | null>(null);
  const [selectedDeptToAssign, setSelectedDeptToAssign] = useState('Cardiology');
  const [manageAvailabilityDoctor, setManageAvailabilityDoctor] = useState<HospitalDoctor | null>(null);
  const [availShifts, setAvailShifts] = useState('Morning (08:00 - 14:00)');
  const [availDays, setAvailDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [isInviteDoctorModalOpen, setIsInviteDoctorModalOpen] = useState(false);
  const [inviteDocName, setInviteDocName] = useState('');
  const [inviteDocSpecialization, setInviteDocSpecialization] = useState('');
  const [inviteDocDept, setInviteDocDept] = useState('Cardiology');
  const [inviteDocEmail, setInviteDocEmail] = useState('');
  const [inviteDocPhone, setInviteDocPhone] = useState('');
  const [inviteDocLicense, setInviteDocLicense] = useState('');

  const handleAssignDeptSubmit = () => {
    if (!assignDeptDoctor) return;
    setFacilityDoctors(prev =>
      prev.map(d => d.id === assignDeptDoctor.id ? { ...d, department: selectedDeptToAssign } : d)
    );
    setAssignDeptDoctor(null);
  };

  const handleManageAvailabilitySubmit = () => {
    if (!manageAvailabilityDoctor) return;
    setFacilityDoctors(prev =>
      prev.map(d => d.id === manageAvailabilityDoctor.id ? {
        ...d,
        availabilityDays: availDays,
        shifts: availShifts
      } : d)
    );
    setManageAvailabilityDoctor(null);
  };

  const handleToggleDoctorSuspension = (doctorId: string) => {
    setFacilityDoctors(prev =>
      prev.map(d => d.id === doctorId ? {
        ...d,
        facilityStatus: d.facilityStatus === 'suspended' ? 'active' : 'suspended'
      } : d)
    );
  };

  const handleInviteDoctorSubmit = () => {
    if (!inviteDocName.trim() || !inviteDocEmail.trim()) return;
    const newDoc: HospitalDoctor = {
      id: `doc-${Date.now()}`,
      name: inviteDocName.trim(),
      specialization: inviteDocSpecialization.trim() || 'General Practitioner',
      department: inviteDocDept,
      licenseNo: inviteDocLicense.trim() || 'MDCN-PENDING',
      isMdcnVerified: true,
      facilityStatus: 'active',
      availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      shifts: 'Regular (08:00 - 16:00)',
      syncWithMobileApp: true,
      phone: inviteDocPhone.trim() || '+234 800 000 0000',
    };
    setFacilityDoctors([...facilityDoctors, newDoc]);
    setIsInviteDoctorModalOpen(false);
    setInviteDocName('');
    setInviteDocEmail('');
    setInviteDocSpecialization('');
    setInviteDocLicense('');
  };

  const getRolePermissions = (role: HospitalStaffRole) => {
    switch (role) {
      case 'hospital_admin':
        return { canViewPatients: true, canViewFullMedical: true, canViewAppointments: true, canManageBlood: true, canManageStaff: true, canManageEmergency: true };
      case 'doctor':
        return { canViewPatients: true, canViewFullMedical: true, canViewAppointments: true, canManageBlood: false, canManageStaff: false, canManageEmergency: true };
      case 'nurse':
        return { canViewPatients: true, canViewFullMedical: false, canViewAppointments: true, canManageBlood: false, canManageStaff: false, canManageEmergency: true };
      case 'receptionist':
        return { canViewPatients: true, canViewFullMedical: false, canViewAppointments: true, canManageBlood: false, canManageStaff: false, canManageEmergency: false };
      case 'blood_officer':
        return { canViewPatients: true, canViewFullMedical: false, canViewAppointments: false, canManageBlood: true, canManageStaff: false, canManageEmergency: true };
      case 'pharmacist':
        return { canViewPatients: true, canViewFullMedical: false, canViewAppointments: false, canManageBlood: false, canManageStaff: false, canManageEmergency: false };
      case 'lab_technician':
        return { canViewPatients: true, canViewFullMedical: false, canViewAppointments: false, canManageBlood: true, canManageStaff: false, canManageEmergency: false };
    }
  };

  const handleRegisterStaffSubmit = () => {
    if (!regStaffName.trim() || !regStaffEmail.trim()) return;
    const perms = getRolePermissions(regStaffRole);
    const badgePrefix = regStaffRole === 'hospital_admin' ? 'ADM' : regStaffRole === 'doctor' ? 'DOC' : regStaffRole === 'nurse' ? 'NUR' : regStaffRole === 'receptionist' ? 'REC' : regStaffRole === 'pharmacist' ? 'PHM' : regStaffRole === 'lab_technician' ? 'LAB' : 'BLD';
    const newStaff: StaffPersona = {
      id: `staff-${Date.now().toString().slice(-4)}`,
      name: regStaffName.trim(),
      role: regStaffRole,
      title: regStaffTitle.trim() || `${regStaffRole.replace('_', ' ').toUpperCase()} Staff`,
      department: regStaffDept,
      email: regStaffEmail.trim(),
      phone: regStaffPhone.trim() || '+234 800 123 4567',
      badgeId: `HSP-${badgePrefix}-${Math.floor(10 + Math.random() * 90)}`,
      tempPassword: regStaffPassword || 'HospitalPass2026!',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      ...perms,
    };

    setStaffList(prev => [newStaff, ...prev]);
    setIsRegisterStaffModalOpen(false);
    setCredentialsModalStaff(newStaff);

    // Reset Form
    setRegStaffName('');
    setRegStaffTitle('');
    setRegStaffEmail('');
    setRegStaffPhone('');
    setRegStaffPassword('HospitalPass2026!');
  };

  const handleToggleStaffStatus = (staffId: string) => {
    setStaffList(prev =>
      prev.map(s => s.id === staffId ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s)
    );
  };

  const copyToClipboard = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Hospital Facility Header ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        border: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#2563eb', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>
                  {currentFacility.name}
                </h1>
                <span style={{
                  background: '#065f46', color: '#34d399', fontSize: 11,
                  padding: '2px 8px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <ShieldCheck size={12} /> Verified Facility
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} style={{ color: '#38bdf8' }} /> {currentFacility.address}, {currentFacility.city}
              </p>

              {/* Facility Switcher Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Hospital:
                </span>
                <select
                  value={currentFacility.id}
                  onChange={(e) => {
                    const found = ALL_FACILITIES.find(f => f.id === e.target.value);
                    if (found) setCurrentFacility(found);
                  }}
                  style={{
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #475569',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {ALL_FACILITIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.city.replace(' State', '')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Role & Staff Identity Badge ───────────────────────────────────── */}
        <div style={{
          background: '#0f172a',
          padding: '12px 20px',
          borderRadius: 12,
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {portalInfo.portalName}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
              {activeStaff.name} ({portalInfo.roleTitle})
            </div>
          </div>
        </div>
      </div>

      {/* ── Doctor Web vs Mobile Synchronization Notice ─────────────────────── */}
      <div style={{
        background: '#eff6ff',
        borderRadius: 12,
        padding: '12px 16px',
        border: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#2563eb', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Smartphone size={16} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1e40af' }}>
              Doctor Web & Phone Synchronization Active
            </p>
            <p style={{ margin: '1px 0 0', fontSize: 12, color: '#3b82f6' }}>
              Consultation queues, weekly duty shifts, and SOAP clinical documentation are managed here on the Web Portal; live HD video calls and real-time push emergency notifications operate on the Doctor Mobile App.
            </p>
          </div>
        </div>
        <Badge variant="info">Synced with Doctor Phone</Badge>
      </div>

      {/* ── Active Module Header (Sidebar-driven navigation) ─────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {currentTab === 'appointments' && <Calendar size={20} />}
            {currentTab === 'patients' && <Users size={20} />}
            {currentTab === 'wards' && <BedDouble size={20} />}
            {currentTab === 'pharmacy' && <Pill size={20} />}
            {currentTab === 'laboratory' && <FlaskConical size={20} />}
            {currentTab === 'doctors' && <Stethoscope size={20} />}
            {currentTab === 'blood' && <Droplet size={20} />}
            {currentTab === 'services' && <Activity size={20} />}
            {currentTab === 'billing' && <Receipt size={20} />}
            {currentTab === 'emergency' && <AlertTriangle size={20} />}
            {currentTab === 'profile' && <Building2 size={20} />}
            {currentTab === 'notifications' && <Bell size={20} />}
            {currentTab === 'reports' && <BarChart3 size={20} />}
            {currentTab === 'audit' && <ScrollText size={20} />}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workplace / {currentFacility.name}
            </div>
            <h1 style={{ margin: '1px 0 0', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              {currentTab === 'appointments' && 'Clinical Appointments'}
              {currentTab === 'patients' && 'Hospital Patients'}
              {currentTab === 'wards' && 'Wards & Bed Management Board'}
              {currentTab === 'pharmacy' && 'Hospital Internal Pharmacy & Dispensary'}
              {currentTab === 'laboratory' && 'Clinical Laboratory & Diagnostic Orders'}
              {currentTab === 'doctors' && 'Doctors & Staff Management'}
              {currentTab === 'blood' && 'Blood Requests & Donor Screening'}
              {currentTab === 'services' && 'Clinical Services & Procedures'}
              {currentTab === 'billing' && 'Facility Billing & Invoices'}
              {currentTab === 'emergency' && 'Controlled Emergency Operations'}
              {currentTab === 'profile' && 'Hospital Facility Profile'}
              {currentTab === 'notifications' && 'Real-Time Notification Center'}
              {currentTab === 'reports' && 'Facility Analytics & Reports'}
              {currentTab === 'audit' && 'Security & Operational Audit Logs'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Logged in: <strong style={{ color: '#0f172a' }}>{activeStaff.name}</strong> ({portalInfo.roleTitle})
          </span>
          <Badge variant="info">
            {portalInfo.badge}
          </Badge>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. APPOINTMENTS TAB                                                   */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Authorized Facility Appointments
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Showing only visits scheduled at {currentFacility.name}. Filtered by your staff role.
              </p>
            </div>
            <Badge variant="success">4 Scheduled Today</Badge>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Patient Name</th>
                    <th style={{ padding: '12px 16px' }}>Scheduled Date / Time</th>
                    <th style={{ padding: '12px 16px' }}>Doctor Assigned</th>
                    <th style={{ padding: '12px 16px' }}>Type & Suite</th>
                    <th style={{ padding: '12px 16px' }}>Check-In Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {FACILITY_APPOINTMENTS.map((apt) => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{apt.patientName}</p>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Ref: {apt.patientRef}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>
                        {apt.scheduledTime}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{apt.doctorAssigned}</p>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{apt.doctorSpecialty}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ margin: 0, color: '#334155' }}>{apt.appointmentType}</p>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{apt.room}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Badge variant={apt.status === 'Active' ? 'warning' : apt.status === 'Completed' ? 'success' : 'neutral'}>
                          {apt.checkInStatus}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const p = FACILITY_PATIENTS.find(pt => pt.name === apt.patientName);
                            if (p) setSelectedPatientModal(p);
                          }}
                        >
                          <Eye size={14} style={{ marginRight: 4 }} /> Patient Chart
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. PATIENTS ASSOCIATED WITH HOSPITAL TAB                               */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Facility Patients Directory
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Patients who have visited or booked appointments with {currentFacility.name}. Scoped to minimal authorized clinical data.
              </p>
            </div>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Patient Name</th>
                    <th style={{ padding: '12px 16px' }}>Biometrics</th>
                    <th style={{ padding: '12px 16px' }}>Last Visit</th>
                    <th style={{ padding: '12px 16px' }}>Primary Doctor</th>
                    <th style={{ padding: '12px 16px' }}>Clinical Visibility</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {FACILITY_PATIENTS.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', color: '#3730a3',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12
                          }}>
                            {p.name[0]}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{p.name}</p>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11.5 }}>
                          {p.age} yrs • {p.gender}
                        </span>
                        <span style={{ marginLeft: 6, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4, fontSize: 11.5, fontWeight: 600 }}>
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>{p.lastVisit}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0f172a' }}>{p.assignedDoctor}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {activeStaff.canViewFullMedical ? (
                          <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 600 }}>Full EHR Available</span>
                        ) : (
                          <span style={{ color: '#d97706', fontSize: 12, fontWeight: 600 }}>Limited (Privacy Masked)</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatientModal(p)}
                        >
                          <Eye size={14} style={{ marginRight: 4 }} /> View Records
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. DOCTORS & STAFF MANAGEMENT TAB                                     */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'doctors' && (
        !activeStaff.canManageStaff ? (
          <Card style={{ padding: 48, textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldAlert size={30} />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              Hospital Administrator Access Required
            </h3>
            <p style={{ margin: '0 auto 16px', maxWidth: 480, fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>
              Doctors & Staff roster management, onboarding, login credential generation, and account suspension are strictly restricted to Hospital Administrators.
            </p>
            <div>
              <Badge variant="warning">Logged in as: {activeStaff.title} (Restricted)</Badge>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                  Hospital Staff Directory & Account Credentials
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                  Register new hospital personnel, generate role-scoped login credentials, and manage staff access for {currentFacility.name}.
                </p>
              </div>

            {activeStaff.canManageStaff && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsRegisterStaffModalOpen(true)}
              >
                <UserPlus size={15} style={{ marginRight: 6 }} /> Register New Staff & Issue Account
              </Button>
            )}
          </div>

          {/* Subtabs for Staff Roster vs Clinical Doctors */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 2 }}>
            <button
              onClick={() => setStaffSubTab('roster')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                color: staffSubTab === 'roster' ? '#2563eb' : '#64748b',
                borderBottom: staffSubTab === 'roster' ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              All Hospital Staff & Login Accounts ({staffList.length})
            </button>
            <button
              onClick={() => setStaffSubTab('doctors')}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                color: staffSubTab === 'doctors' ? '#2563eb' : '#64748b',
                borderBottom: staffSubTab === 'doctors' ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              Clinical Doctors & MDCN Schedules ({FACILITY_DOCTORS.length})
            </button>
          </div>

          {/* Subtab 1: All Hospital Staff Roster */}
          {staffSubTab === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Role Filters */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginRight: 4 }}>Filter Role:</span>
                {[
                  { key: 'all', label: `All Staff (${staffList.length})` },
                  { key: 'doctor', label: 'Doctors' },
                  { key: 'nurse', label: 'Nurses' },
                  { key: 'receptionist', label: 'Receptionists' },
                  { key: 'blood_officer', label: 'Blood Officers' },
                  { key: 'hospital_admin', label: 'Admins' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStaffFilter(f.key)}
                    style={{
                      background: staffFilter === f.key ? '#0f172a' : '#f1f5f9',
                      color: staffFilter === f.key ? '#ffffff' : '#475569',
                      border: '1px solid',
                      borderColor: staffFilter === f.key ? '#0f172a' : '#e2e8f0',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Staff Table */}
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                        <th style={{ padding: '12px 16px' }}>Staff Personnel</th>
                        <th style={{ padding: '12px 16px' }}>Assigned Role</th>
                        <th style={{ padding: '12px 16px' }}>Department</th>
                        <th style={{ padding: '12px 16px' }}>Login Email & Badge</th>
                        <th style={{ padding: '12px 16px' }}>Portal Scope</th>
                        <th style={{ padding: '12px 16px' }}>Account Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList
                        .filter(s => staffFilter === 'all' || s.role === staffFilter)
                        .map((staff) => {
                          const isCurrentActive = activeStaff.id === staff.id;
                          return (
                            <tr key={staff.id} style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: isCurrentActive ? '#f0fdf4' : 'transparent'
                            }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: staff.role === 'doctor' ? '#dbeafe' : staff.role === 'nurse' ? '#dcfce7' : staff.role === 'hospital_admin' ? '#fef3c7' : '#f1f5f9',
                                    color: staff.role === 'doctor' ? '#1e40af' : staff.role === 'nurse' ? '#166534' : staff.role === 'hospital_admin' ? '#92400e' : '#334155',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13
                                  }}>
                                    {staff.name.replace(/^(Dr\.|Nurse)\s+/, '')[0]}
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{staff.name}</p>
                                      {isCurrentActive && (
                                        <span style={{ fontSize: 9.5, background: '#16a34a', color: '#ffffff', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                                          ACTIVE SESSION
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: 11.5, color: '#64748b' }}>{staff.title}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <Badge variant={
                                  staff.role === 'hospital_admin' ? 'warning' :
                                  staff.role === 'doctor' ? 'info' :
                                  staff.role === 'nurse' ? 'success' :
                                  staff.role === 'blood_officer' ? 'error' : 'neutral'
                                }>
                                  {staff.role.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>
                                {staff.department}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: 12 }}>{staff.email}</p>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Badge: {staff.badgeId} • {staff.phone}</span>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: 11.5 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <span style={{ color: staff.canViewFullMedical ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                                    • {staff.canViewFullMedical ? 'Full EHR & Notes' : staff.canViewPatients ? 'Triage / Identity' : 'No Patient Charts'}
                                  </span>
                                  <span style={{ color: staff.canManageBlood ? '#db2777' : '#64748b' }}>
                                    • {staff.canManageBlood ? 'Blood Appeals Admin' : staff.canViewAppointments ? 'Appointments Scheduling' : 'Operational Scope'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{
                                  background: staff.status === 'active' ? '#dcfce7' : '#fee2e2',
                                  color: staff.status === 'active' ? '#166534' : '#991b1b',
                                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700
                                }}>
                                  {staff.status === 'active' ? 'ACTIVE' : 'SUSPENDED'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                  {/* View Login Credentials Slip */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCredentialsModalStaff(staff)}
                                    title="View Login Credentials Slip"
                                  >
                                    <Key size={13} style={{ marginRight: 4 }} /> Credentials
                                  </Button>

                                  {/* Suspend / Reactivate */}
                                  {activeStaff.canManageStaff && !isCurrentActive && (
                                    <Button
                                      variant={staff.status === 'active' ? 'danger' : 'outline'}
                                      size="sm"
                                      onClick={() => handleToggleStaffStatus(staff.id)}
                                    >
                                      {staff.status === 'active' ? 'Suspend' : 'Activate'}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Subtab 2: Clinical Doctors & Shifts */}
          {staffSubTab === 'doctors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Authorized Facility Medical Practitioners ({facilityDoctors.length})
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                    Assign hospital departments, manage consultation shifts, and monitor MDCN verification.
                  </p>
                </div>

                {activeStaff.canManageStaff && (
                  <Button variant="primary" size="sm" onClick={() => setIsInviteDoctorModalOpen(true)}>
                    <UserPlus size={14} style={{ marginRight: 6 }} /> Invite Doctor to Hospital
                  </Button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {facilityDoctors.map((doc) => (
                  <Card key={doc.id} style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{doc.name}</h3>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#2563eb', fontWeight: 600 }}>{doc.specialization}</p>
                        <span style={{ fontSize: 11.5, color: '#64748b' }}>Department: <strong>{doc.department}</strong></span>
                      </div>
                      <Badge variant={doc.facilityStatus === 'active' ? 'success' : doc.facilityStatus === 'suspended' ? 'error' : 'warning'}>
                        {doc.facilityStatus === 'active' ? 'ON DUTY' : doc.facilityStatus === 'suspended' ? 'SUSPENDED' : doc.facilityStatus.toUpperCase()}
                      </Badge>
                    </div>

                    <div style={{ margin: '14px 0', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>MDCN License:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{doc.licenseNo}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>Platform Status:</span>
                        <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={13} /> MDCN Verified by Admin
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>Hospital Shift:</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{doc.shifts}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>Active Days:</span>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{doc.availabilityDays.join(', ')}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Smartphone size={15} style={{ color: '#059669' }} />
                      <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>
                        Synced with Doctor Mobile App (Video & Push)
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12, flexWrap: 'wrap' }}>
                      {activeStaff.canManageStaff && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ flex: 1 }}
                            onClick={() => {
                              setAssignDeptDoctor(doc);
                              setSelectedDeptToAssign(doc.department);
                            }}
                          >
                            Assign Dept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ flex: 1 }}
                            onClick={() => {
                              setManageAvailabilityDoctor(doc);
                              setAvailShifts(doc.shifts);
                              setAvailDays(doc.availabilityDays);
                            }}
                          >
                            Availability
                          </Button>
                          <Button
                            variant={doc.facilityStatus === 'suspended' ? 'outline' : 'danger'}
                            size="sm"
                            onClick={() => handleToggleDoctorSuspension(doc.id)}
                          >
                            {doc.facilityStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 4. BLOOD REQUESTS TAB (Safe Verification Pipeline)                     */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'blood' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Safe Blood Transfusion & Donor Screening Pipeline
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                All donor appeals require Hospital Confirmation + OminiPulse Verification. Volunteer donors book pre-donation screening appointments at {currentFacility.name}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" size="sm" onClick={() => setNewScreeningModalOpen(true)}>
                <Calendar size={14} style={{ marginRight: 6 }} /> Book Donor Screening
              </Button>
              <Button variant="primary" size="sm" onClick={() => setNewBloodModalOpen(true)}>
                <Plus size={14} style={{ marginRight: 6 }} /> Create Hospital Blood Appeal
              </Button>
            </div>
          </div>

          {/* Subtabs for Blood Appeals vs Donor Screening Appointments */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 2 }}>
            <button
              onClick={() => setBloodSubTab('appeals')}
              style={{
                background: 'none', border: 'none', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: bloodSubTab === 'appeals' ? '#2563eb' : '#64748b',
                borderBottom: bloodSubTab === 'appeals' ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              Active Hospital Blood Appeals ({bloodRequests.length})
            </button>
            <button
              onClick={() => setBloodSubTab('screening')}
              style={{
                background: 'none', border: 'none', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: bloodSubTab === 'screening' ? '#2563eb' : '#64748b',
                borderBottom: bloodSubTab === 'screening' ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              Donor Screening & Donation Register ({screeningAppointments.length})
            </button>
          </div>

          {/* Subtab 1: Active Appeals */}
          {bloodSubTab === 'appeals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Architecture Pipeline Explanation Card */}
              <Card style={{ padding: 14, background: '#fdf2f8', borderColor: '#fbcfe8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <ShieldCheck size={16} style={{ color: '#db2777' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#9d174d' }}>
                    Hospital-Verified Transfusion Pipeline
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#831843' }}>
                  Patient / Relatives create requests → <strong>Hospital confirms validity</strong> → OminiPulse verifies → Eligible donors notified → Screening & Donation at approved hospital → Closed.
                </p>
              </Card>

              {/* Blood Requests List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bloodRequests.map((req) => (
                  <Card key={req.id} style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontSize: 14 }}>
                            {req.bloodGroup}
                          </span>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                            {req.patientName} ({req.patientRef})
                          </h3>
                          <Badge variant={req.urgency === 'emergency' ? 'error' : req.urgency === 'urgent' ? 'warning' : 'neutral'}>
                            {req.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#475569' }}>{req.hospitalNotes}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#94a3b8' }}>
                          Requested by {req.requestedBy} • Required by: <strong>{req.requiredBy}</strong>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {req.unitsCollected} / {req.unitsNeeded} Units Collected
                        </p>
                        <span style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: req.status === 'fulfilled' ? '#16a34a' : req.status === 'donors_notified' ? '#2563eb' : '#d97706'
                        }}>
                          Status: {req.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Actions per stage */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid #f1f5f9', paddingTop: 12, justifyContent: 'flex-end' }}>
                      {req.status === 'pending_hospital_confirmation' && (
                        <Button variant="primary" size="sm" onClick={() => handleConfirmBloodRequest(req.id)}>
                          <CheckCircle size={14} style={{ marginRight: 4 }} /> Confirm Request
                        </Button>
                      )}

                      {req.status === 'donors_notified' && (
                        <Button variant="primary" size="sm" onClick={() => handleMarkReceived(req.id)}>
                          <Check size={14} style={{ marginRight: 4 }} /> Mark Units Received
                        </Button>
                      )}

                      {req.status === 'fulfilled' && (
                        <Button variant="outline" size="sm" onClick={() => handleCloseRequest(req.id)}>
                          Close Request
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 2: Donor Screening Appointments Register */}
          {bloodSubTab === 'screening' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: '#eff6ff', borderRadius: 12, padding: '14px 18px', border: '1px solid #bfdbfe',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#1e40af' }}>
                    Hospital Donor Screening Protocol
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#2563eb' }}>
                    Donors who responded to verified appeals must complete clinical screening (Hb ≥ 12.5 g/dL, BP, infectious disease panel) at our blood bank before transfusion donation.
                  </p>
                </div>
                <Badge variant="info">4 Appointments Scheduled</Badge>
              </div>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '12px 16px' }}>Donor Name & Contact</th>
                      <th style={{ padding: '12px 16px' }}>Blood Group</th>
                      <th style={{ padding: '12px 16px' }}>Target Appeal</th>
                      <th style={{ padding: '12px 16px' }}>Appointment Time</th>
                      <th style={{ padding: '12px 16px' }}>Screening Vitals</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screeningAppointments.map((scr) => (
                      <tr key={scr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{scr.donorName}</p>
                          <span style={{ fontSize: 11.5, color: '#64748b' }}>{scr.phone}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                            {scr.bloodGroup}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontSize: 12.5 }}>
                          {scr.targetAppealRef}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                          {scr.appointmentTime}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#475569' }}>
                          <div>Hb: <strong>{scr.vitals.hb}</strong></div>
                          <div>BP: <strong>{scr.vitals.bp}</strong></div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Badge variant={
                            scr.screeningStatus === 'donation_completed' ? 'success' :
                            scr.screeningStatus === 'cleared_for_donation' ? 'info' :
                            scr.screeningStatus === 'deferred' ? 'error' : 'warning'
                          }>
                            {scr.screeningStatus.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <Button
                            variant={scr.screeningStatus === 'donation_completed' ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => {
                              setConductScreeningDonor(scr);
                              setScreeningFormHb('13.8');
                              setScreeningFormBp('120/80');
                              setScreeningFormWeight('70');
                              setScreeningFormDecision(scr.screeningStatus === 'cleared_for_donation' ? 'donation_completed' : 'cleared_for_donation');
                              setScreeningFormNotes(scr.screeningNotes || '');
                            }}
                          >
                            {scr.screeningStatus === 'donation_completed' ? 'View Slip' : 'Conduct Screening'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 5. CONTROLLED EMERGENCY REQUESTS TAB                                   */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'emergency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Controlled Emergency Operations
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Targeted emergency facility management: critical bed availability and blood shortages.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {INITIAL_EMERGENCY_REQUESTS.map((emg) => (
              <Card key={emg.id} style={{ padding: 18, borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{emg.title}</h3>
                  <Badge variant={emg.severity === 'critical' ? 'error' : 'warning'}>
                    {emg.severity.toUpperCase()}
                  </Badge>
                </div>
                <p style={{ margin: '8px 0 12px', fontSize: 13, color: '#475569' }}>{emg.details}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#94a3b8' }}>
                  <span>Logged: {new Date(emg.createdAt).toLocaleTimeString()}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (emg.title.toLowerCase().includes('blood')) {
                        setCurrentTab('blood');
                      } else {
                        setCurrentTab('wards');
                      }
                    }}
                  >
                    Manage Slots
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 6. HOSPITAL PROFILE & SERVICES TAB                                     */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Facility Credentials & Services
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Public profile information visible to patients on the OminiPulse network
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <Card style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                General Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div><strong>Facility:</strong> {currentFacility.name}</div>
                <div><strong>Location:</strong> {currentFacility.address}, {currentFacility.city}</div>
                <div><strong>Operating Hours:</strong> {currentFacility.operatingHours}</div>
                <div><strong>Emergency Hotline:</strong> {currentFacility.emergencyHotline}</div>
                <div><strong>Administrative Email:</strong> {currentFacility.email}</div>
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Active Departments & Clinical Wings
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {currentFacility.departments.map((dept) => (
                  <span
                    key={dept}
                    style={{
                      background: '#f1f5f9', color: '#0f172a', padding: '6px 12px',
                      borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: '1px solid #cbd5e1'
                    }}
                  >
                    • {dept}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                  24/7 Emergency Casualty & Trauma Unit Available
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 7. REPORTS & FACILITY ANALYTICS TAB                                    */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Facility Operational Analytics
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Summary metrics for visits and blood fulfillment at {FACILITY_INFO.name}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <Card style={{ padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Weekly Appointments
              </h3>
              <p style={{ margin: '6px 0 16px', fontSize: 28, fontWeight: 800, color: '#2563eb' }}>142</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Completed:</span> <strong style={{ color: '#16a34a' }}>118</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cancelled:</span> <strong style={{ color: '#dc2626' }}>12</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Upcoming:</span> <strong style={{ color: '#2563eb' }}>12</strong>
                </div>
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Blood Requests (This Month)
              </h3>
              <p style={{ margin: '6px 0 16px', fontSize: 28, fontWeight: 800, color: '#db2777' }}>21</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fulfilled:</span> <strong style={{ color: '#16a34a' }}>17</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pending / Under Screening:</span> <strong style={{ color: '#d97706' }}>4</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 8. FACILITY AUDIT LOG TAB                                              */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Facility Security & Operational Audit Trail
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
              Tamper-evident logs of staff chart views, prescription creations, and blood requests
            </p>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Time</th>
                  <th style={{ padding: '12px 16px' }}>Staff Member</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Action Performed</th>
                  <th style={{ padding: '12px 16px' }}>Target Record</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_AUDIT_LOGS.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {log.staffName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: 4,
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {log.staffRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: 500 }}>
                      {log.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 9. CLINICAL SERVICES TAB                                               */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Clinical Services & Medical Procedures
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Manage healthcare packages, laboratory investigations, consultation fees, and emergency clinical services offered at {currentFacility.name}.
              </p>
            </div>

            {activeStaff.canManageStaff && (
              <Button variant="primary" size="sm" onClick={() => setNewServiceModalOpen(true)}>
                <Plus size={15} style={{ marginRight: 6 }} /> Add Clinical Service
              </Button>
            )}
          </div>

          {/* Services Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {servicesList.map((srv) => (
              <Card key={srv.id} style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: srv.status === 'paused' ? 0.7 : 1 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff',
                        padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {srv.department}
                      </span>
                      <h3 style={{ margin: '8px 0 4px', fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                        {srv.name}
                      </h3>
                    </div>
                    <Badge variant={srv.status === 'active' ? 'success' : 'neutral'}>
                      {srv.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                    </Badge>
                  </div>

                  <p style={{ margin: '8px 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    {srv.description}
                  </p>
                </div>

                <div>
                  <div style={{
                    padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Standard Fee</span>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f6e6e' }}>
                        ₦{srv.fee.toLocaleString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Estimated Time</span>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        {srv.duration}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    {srv.emergencyAvailable ? (
                      <span style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldAlert size={14} /> 24/7 Emergency Available
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} /> Scheduled Outpatient Only
                      </span>
                    )}

                    {activeStaff.canManageStaff && (
                      <Button
                        variant={srv.status === 'active' ? 'outline' : 'teal'}
                        size="sm"
                        onClick={() => handleToggleServiceStatus(srv.id)}
                      >
                        {srv.status === 'active' ? 'Pause Service' : 'Activate Service'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 10. NOTIFICATIONS TAB                                                  */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Hospital Real-Time Notification Center
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Immediate platform alerts for appointments, blood appeal confirmations, donor bookings, and doctor shifts at {currentFacility.name}.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={handleMarkAllNotificationsRead}>
              <CheckCheck size={14} style={{ marginRight: 6 }} /> Mark All as Read
            </Button>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginRight: 4 }}>Filter:</span>
            {[
              { key: 'all', label: `All Alerts (${notificationsList.length})` },
              { key: 'appointment', label: 'Appointments' },
              { key: 'blood', label: 'Blood Appeals & Donors' },
              { key: 'staff', label: 'Doctors & Shifts' },
              { key: 'system', label: 'Platform & Licenses' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setNotifFilter(f.key as any)}
                style={{
                  background: notifFilter === f.key ? '#0f172a' : '#f1f5f9',
                  color: notifFilter === f.key ? '#ffffff' : '#475569',
                  border: '1px solid',
                  borderColor: notifFilter === f.key ? '#0f172a' : '#e2e8f0',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notifications Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notificationsList
              .filter(n => notifFilter === 'all' || n.type === notifFilter)
              .map((n) => (
                <Card
                  key={n.id}
                  style={{
                    padding: 16,
                    borderLeft: n.priority === 'urgent' ? '4px solid #ef4444' : n.read ? '1px solid #e2e8f0' : '4px solid #2563eb',
                    background: n.read ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: n.type === 'blood' ? '#fee2e2' : n.type === 'appointment' ? '#e0f2fe' : n.type === 'staff' ? '#f0fdf4' : '#f1f5f9',
                        color: n.type === 'blood' ? '#dc2626' : n.type === 'appointment' ? '#0284c7' : n.type === 'staff' ? '#16a34a' : '#475569',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {n.type === 'blood' ? <Droplet size={18} /> : n.type === 'appointment' ? <Calendar size={18} /> : n.type === 'staff' ? <Stethoscope size={18} /> : <ShieldCheck size={18} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>
                            {n.title}
                          </h4>
                          {n.priority === 'urgent' && (
                            <Badge variant="error" size="sm">URGENT</Badge>
                          )}
                          {!n.read && (
                            <Badge variant="info" size="sm">NEW</Badge>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: 11.5, color: '#94a3b8', display: 'inline-block', marginTop: 6 }}>
                          {n.timestamp}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissNotification(n.id)}
                      title="Dismiss alert"
                    >
                      <Trash2 size={14} style={{ color: '#94a3b8' }} />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 11. BILLING & INVOICES TAB (Hospital Admin Only)                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Facility Billing & Institutional Invoices
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                Manage {currentFacility.name}&apos;s OminiPulse enterprise software subscription, view official institutional invoices, and review patient revenue disbursements.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContactBillingModalOpen(true)}
              >
                Contact Institutional Billing
              </Button>
            </div>
          </div>

          {/* Subscription & Entitlements Overview Card */}
          <Card style={{ padding: 24, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', border: 'none', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(37,99,235,0.25)', padding: '3px 10px', borderRadius: 12 }}>
                  Active Institutional Contract
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                  OminiPulse Enterprise Facility License
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8' }}>
                  Contract Ref: <strong>CTR-HSP-003</strong> • Annual Billing Cycle
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#38bdf8' }}>
                  ₦1,200,000 <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>/ year</span>
                </div>
                <Badge variant="success" style={{ marginTop: 4 }}>
                  License Active (Paid)
                </Badge>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '20px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Renewal Date</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>January 15, 2027</div>
                <span style={{ fontSize: 11, color: '#34d399' }}>Auto-renews annually</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Staff User Accounts</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>45 of 50 Allocated</div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>5 seats remaining</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Inpatient Bed Tracking</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>80 Licensed Beds</div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Triage & vitals included</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Emergency Blood Pipeline</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>Unlimited Access</div>
                <span style={{ fontSize: 11, color: '#34d399' }}>Verified screening enabled</span>
              </div>
            </div>
          </Card>

          {/* Hospital Revenue Collection & Payout Bank */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Patient Revenue via OminiPulse
                </span>
                <Badge variant="success">Auto-Settled Daily</Badge>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                ₦14,850,000
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>
                Gross patient payments collected for hospital consultations, bed deposits, and diagnostic tests.
              </p>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  REVENUE BREAKDOWN BY DEPARTMENT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Outpatient Consultations</span>
                    <strong style={{ color: '#0f172a' }}>₦5,200,000 (35%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Inpatient Beds & Nursing</span>
                    <strong style={{ color: '#0f172a' }}>₦4,650,000 (31%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Laboratory & Diagnostic Tests</span>
                    <strong style={{ color: '#0f172a' }}>₦3,100,000 (21%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Emergency Casualty Care</span>
                    <strong style={{ color: '#0f172a' }}>₦1,900,000 (13%)</strong>
                  </div>
                </div>
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Corporate Settlement Bank Account
                </span>
                <ShieldCheck size={18} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>BANK NAME</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>Guaranty Trust Bank (GTBank)</div>
                
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 10 }}>ACCOUNT NUMBER</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb', fontFamily: 'monospace', marginTop: 2 }}>0148928371</div>

                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 10 }}>ACCOUNT NAME</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>XYZ Specialist Hospital Ltd</div>
              </div>

              <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Patient service fees paid through the OminiPulse mobile and web check-in are deposited directly into this verified institutional account every 24 hours.
              </p>
            </Card>
          </div>

          {/* Institutional Invoices History Table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  OminiPulse Institutional Invoices & Receipts
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                  Official tax invoices and payment receipts issued to {currentFacility.name}.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>
                    <th style={{ padding: '12px 18px' }}>Invoice #</th>
                    <th style={{ padding: '12px 18px' }}>Description</th>
                    <th style={{ padding: '12px 18px' }}>Billing Period</th>
                    <th style={{ padding: '12px 18px' }}>Amount</th>
                    <th style={{ padding: '12px 18px' }}>Payment Method</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      OMP-INV-2026-092
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                      Annual Enterprise Software License
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                      Jan 15, 2026 – Jan 15, 2027
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                      ₦1,200,000
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                      Direct Corporate Bank Transfer
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="success">PAID</Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDownloadReceiptModalInvoice({
                          invoiceNumber: 'OMP-INV-2026-092',
                          title: 'OminiPulse Enterprise Facility License — Annual Tier 2',
                          amount: '₦1,200,000',
                          date: 'March 15, 2026',
                        })}
                        style={{ fontSize: 12, color: '#2563eb' }}
                      >
                        <Download size={14} style={{ marginRight: 4 }} /> PDF
                      </Button>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      OMP-INV-2025-041
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                      Facility Onboarding & Multi-Department Integration
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                      Jan 10, 2025 (One-time setup)
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                      ₦500,000
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                      Direct Corporate Bank Transfer
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="success">PAID</Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDownloadReceiptModalInvoice({
                          invoiceNumber: 'OMP-INV-2025-041',
                          title: 'Facility Onboarding & Multi-Department Integration',
                          amount: '₦500,000',
                          date: 'Jan 10, 2025',
                        })}
                        style={{ fontSize: 12, color: '#2563eb' }}
                      >
                        <Download size={14} style={{ marginRight: 4 }} /> PDF
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 12. WARDS & BED MANAGEMENT TAB (Admin, Nurse, Receptionist)            */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'wards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Wards & Inpatient Bed Management Board
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                Live floorbed tracking, admission allocation by Front Desk & Nurses, and patient ward transfers at {currentFacility.name}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="sm"
                onClick={() => {
                  const firstAvail = bedsList.find(b => b.status === 'available');
                  if (firstAvail) setAssignBedModalBed(firstAvail);
                  else setSystemNoticeModal({
                    title: 'No Beds Currently Available',
                    message: 'All licensed beds are currently occupied or awaiting housekeeping sanitization. Please free or disinfect a bed first.',
                    type: 'warning',
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={14} style={{ marginRight: 6 }} /> Assign Inpatient Bed
              </Button>
            </div>
          </div>

          {/* Bed Occupancy Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Licensed Beds</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{bedsList.length} Beds</div>
              <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>Across 6 Facility Wards</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Occupied Beds</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                {bedsList.filter(b => b.status === 'occupied').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                {Math.round((bedsList.filter(b => b.status === 'occupied').length / bedsList.length) * 100)}% Occupancy Rate
              </span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Available Beds</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                {bedsList.filter(b => b.status === 'available').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>Ready for Admission</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #d97706' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Needs Sanitizing</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                {bedsList.filter(b => b.status === 'cleaning_required').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>Discharged & Awaiting Cleaning</span>
            </Card>
          </div>

          {/* Ward Selector Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginRight: 4 }}>Select Ward:</span>
            {[
              { key: 'all', label: `All Wards (${bedsList.length})` },
              { key: 'icu', label: `ICU (${bedsList.filter(b => b.ward === 'icu').length})` },
              { key: 'emergency', label: `Emergency (${bedsList.filter(b => b.ward === 'emergency').length})` },
              { key: 'male_surgical', label: `Male Surgical (${bedsList.filter(b => b.ward === 'male_surgical').length})` },
              { key: 'female_medical', label: `Female Medical (${bedsList.filter(b => b.ward === 'female_medical').length})` },
              { key: 'pediatric', label: `Pediatrics (${bedsList.filter(b => b.ward === 'pediatric').length})` },
              { key: 'maternity', label: `Maternity (${bedsList.filter(b => b.ward === 'maternity').length})` },
            ].map((w) => (
              <button
                key={w.key}
                onClick={() => setSelectedWardFilter(w.key as any)}
                style={{
                  background: selectedWardFilter === w.key ? '#0f172a' : '#f1f5f9',
                  color: selectedWardFilter === w.key ? '#ffffff' : '#475569',
                  border: '1px solid',
                  borderColor: selectedWardFilter === w.key ? '#0f172a' : '#e2e8f0',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Visual Bed Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {bedsList
              .filter(b => selectedWardFilter === 'all' || b.ward === selectedWardFilter)
              .map((bed) => (
                <Card
                  key={bed.id}
                  style={{
                    padding: 18,
                    borderRadius: 12,
                    border: '1px solid',
                    borderColor: bed.status === 'occupied' ? '#bfdbfe' : bed.status === 'available' ? '#bbf7d0' : bed.status === 'cleaning_required' ? '#fde68a' : '#e2e8f0',
                    background: bed.status === 'occupied' ? '#f8fafc' : bed.status === 'available' ? '#ffffff' : bed.status === 'cleaning_required' ? '#fffbeb' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Card Top */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: bed.status === 'occupied' ? '#dbeafe' : bed.status === 'available' ? '#dcfce7' : bed.status === 'cleaning_required' ? '#fef3c7' : '#f1f5f9',
                          color: bed.status === 'occupied' ? '#1d4ed8' : bed.status === 'available' ? '#15803d' : bed.status === 'cleaning_required' ? '#b45309' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <BedDouble size={16} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {bed.bedNumber}
                        </span>
                      </div>

                      {bed.status === 'occupied' && <Badge variant="info">OCCUPIED</Badge>}
                      {bed.status === 'available' && <Badge variant="success">AVAILABLE</Badge>}
                      {bed.status === 'cleaning_required' && <Badge variant="warning">NEEDS SANITIZING</Badge>}
                      {bed.status === 'maintenance' && <Badge variant="neutral">MAINTENANCE</Badge>}
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                      {bed.wardLabel}
                    </div>

                    {/* Card Middle: Occupied Details */}
                    {bed.status === 'occupied' && (
                      <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {bed.currentPatientName}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {bed.patientAge} yrs • {bed.patientGender} • Admitted: {bed.admissionDate}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#475569', marginTop: 6, fontStyle: 'italic' }}>
                          &ldquo;{bed.diagnosis}&rdquo;
                        </div>
                        <div style={{ fontSize: 11, color: '#2563eb', marginTop: 6, fontWeight: 600 }}>
                          Dr: {bed.attendingDoctor} • Nurse: {bed.assignedNurse}
                        </div>
                      </div>
                    )}

                    {bed.status === 'available' && (
                      <div style={{ padding: '12px 0', fontSize: 12.5, color: '#15803d', lineHeight: 1.5 }}>
                        Ready for new admission. Sanitized & inspected.
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Last Disinfected: {bed.lastCleanedAt}</div>
                      </div>
                    )}

                    {bed.status === 'cleaning_required' && (
                      <div style={{ padding: '8px 0', fontSize: 12, color: '#b45309', lineHeight: 1.4 }}>
                        Patient recently discharged. Housekeeping must sanitize & disinfect bed before re-allocation.
                      </div>
                    )}

                    {bed.status === 'maintenance' && (
                      <div style={{ padding: '8px 0', fontSize: 12, color: '#64748b' }}>
                        Biomedical equipment & monitor inspection in progress.
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 10, display: 'flex', gap: 6 }}>
                    {bed.status === 'occupied' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTransferBedModalBed(bed)}
                          style={{ flex: 1, fontSize: 11.5 }}
                        >
                          Transfer Ward
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDischargePatient(bed.id)}
                          style={{ flex: 1, fontSize: 11.5, color: '#dc2626', borderColor: '#fca5a5' }}
                        >
                          Discharge
                        </Button>
                      </>
                    )}

                    {bed.status === 'available' && (
                      <Button
                        size="sm"
                        onClick={() => setAssignBedModalBed(bed)}
                        style={{ width: '100%', fontSize: 12, background: '#16a34a', color: '#ffffff' }}
                      >
                        <UserPlus size={13} style={{ marginRight: 5 }} /> Assign Patient
                      </Button>
                    )}

                    {bed.status === 'cleaning_required' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkBedSanitized(bed.id)}
                        style={{ width: '100%', fontSize: 12, background: '#d97706', color: '#ffffff' }}
                      >
                        <CheckCircle size={13} style={{ marginRight: 5 }} /> Mark Sanitized & Ready
                      </Button>
                    )}

                    {bed.status === 'maintenance' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled
                        style={{ width: '100%', fontSize: 11.5, color: '#94a3b8' }}
                      >
                        Under Service
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 13. HOSPITAL INTERNAL PHARMACY & DISPENSARY TAB (Admin & Pharmacist)   */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'pharmacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Hospital Internal Pharmacy & Dispensary
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                Inpatient & outpatient prescription fulfillment, medication inventory control, and drug expiration safety at {currentFacility.name}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="sm"
                onClick={() => setAddMedModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus size={14} style={{ marginRight: 6 }} /> Add Medication Stock
              </Button>
            </div>
          </div>

          {/* Pharmacy Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #0d9488' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Drug Units</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {medicationsList.reduce((acc, m) => acc + m.stockQuantity, 0).toLocaleString()}
              </div>
              <span style={{ fontSize: 11.5, color: '#0d9488', fontWeight: 600 }}>Across {medicationsList.length} Formulary Items</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Doctor Prescriptions</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                {prescriptionsList.length}
              </div>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>Today&apos;s Active Prescriptions</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #d97706' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Dispense</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                {prescriptionsList.filter(p => p.status === 'pending').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>Awaiting Pharmacist Fulfillment</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Low Stock Warnings</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                {medicationsList.filter(m => m.status === 'low_stock' || m.status === 'expiring_soon').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600 }}>Requires Warehouse Re-order</span>
            </Card>
          </div>

          {/* Sub-tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 16 }}>
            <button
              onClick={() => setPharmacySubTab('prescriptions')}
              style={{
                paddingBottom: 10,
                fontSize: 13.5,
                fontWeight: 700,
                borderBottom: pharmacySubTab === 'prescriptions' ? '2px solid #0d9488' : '2px solid transparent',
                color: pharmacySubTab === 'prescriptions' ? '#0d9488' : '#64748b',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              Prescriptions Dispensing Queue ({prescriptionsList.filter(p => p.status === 'pending').length} Pending)
            </button>

            <button
              onClick={() => setPharmacySubTab('inventory')}
              style={{
                paddingBottom: 10,
                fontSize: 13.5,
                fontWeight: 700,
                borderBottom: pharmacySubTab === 'inventory' ? '2px solid #0d9488' : '2px solid transparent',
                color: pharmacySubTab === 'inventory' ? '#0d9488' : '#64748b',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              Medication Stock & Inventory ({medicationsList.length} Items)
            </button>
          </div>

          {/* 1. Prescriptions Queue Sub-tab */}
          {pharmacySubTab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {prescriptionsList.map((rx) => (
                <Card key={rx.id} style={{ padding: 18, border: rx.status === 'pending' ? '1px solid #99f6e4' : '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                          {rx.prescriptionNumber}
                        </span>
                        {rx.status === 'pending' ? (
                          <Badge variant="warning">PENDING DISPENSE</Badge>
                        ) : (
                          <Badge variant="success">DISPENSED</Badge>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                        Patient: {rx.patientName}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Prescribed by: {rx.doctorName} • {rx.department} • {rx.prescribedAt}
                      </div>
                    </div>

                    <div>
                      {rx.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => handleDispensePrescription(rx.id)}
                          style={{ background: '#0d9488', color: '#ffffff', fontWeight: 600 }}
                        >
                          <CheckCircle size={14} style={{ marginRight: 6 }} /> Dispense Medication
                        </Button>
                      ) : (
                        <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 600 }}>
                          Dispensed by {rx.dispensedBy} ({rx.dispensedAt})
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                      PRESCRIBED DRUGS & DOSAGE INSTRUCTIONS:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {rx.medications.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {idx + 1}. {m.drugName} — <span style={{ fontWeight: 500, color: '#2563eb' }}>{m.dosage} ({m.duration})</span>
                          </span>
                          <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                            {m.instructions}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 2. Medication Stock Sub-tab */}
          {pharmacySubTab === 'inventory' && (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>
                      <th style={{ padding: '12px 18px' }}>Medication Name</th>
                      <th style={{ padding: '12px 18px' }}>Category</th>
                      <th style={{ padding: '12px 18px' }}>Dosage Form</th>
                      <th style={{ padding: '12px 18px' }}>Batch #</th>
                      <th style={{ padding: '12px 18px' }}>Stock Level</th>
                      <th style={{ padding: '12px 18px' }}>Unit Price</th>
                      <th style={{ padding: '12px 18px' }}>Expiry Date</th>
                      <th style={{ padding: '12px 18px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicationsList.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                          {m.name}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 4 }}>
                            {m.category}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                          {m.dosageForm}
                        </td>
                        <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#64748b', fontSize: 12 }}>
                          {m.batchNumber}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: m.stockQuantity <= m.minimumThreshold ? '#dc2626' : '#0f172a' }}>
                          {m.stockQuantity} units
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                          ₦{m.unitPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: m.status === 'expiring_soon' ? '#d97706' : '#64748b' }}>
                          {m.expiryDate}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {m.status === 'in_stock' && <Badge variant="success">IN STOCK</Badge>}
                          {m.status === 'low_stock' && <Badge variant="error">LOW STOCK</Badge>}
                          {m.status === 'expiring_soon' && <Badge variant="warning">EXPIRING SOON</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 14. CLINICAL LABORATORY & DIAGNOSTIC ORDERS TAB (Admin & Lab)          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {currentTab === 'laboratory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Clinical Laboratory & Diagnostic Orders
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                Pathology specimen intake, test analysis pipeline, and laboratory result verification at {currentFacility.name}.
              </p>
            </div>
          </div>

          {/* Lab Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #c026d3' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Lab Orders</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {labOrdersList.length} Orders
              </div>
              <span style={{ fontSize: 11.5, color: '#c026d3', fontWeight: 600 }}>Active Today</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sample Pending</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                {labOrdersList.filter(o => o.status === 'sample_pending').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#f59e0b', fontWeight: 600 }}>Awaiting Phlebotomy / Specimen</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>In Testing</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                {labOrdersList.filter(o => o.status === 'in_testing').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>In Laboratory Analyzers</span>
            </Card>

            <Card style={{ padding: '16px 18px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Results Verified</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                {labOrdersList.filter(o => o.status === 'results_ready').length}
              </div>
              <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>Published to Patient Chart</span>
            </Card>
          </div>

          {/* Orders Table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Active Diagnostic Laboratory Orders
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', fontWeight: 700 }}>
                    <th style={{ padding: '12px 18px' }}>Order #</th>
                    <th style={{ padding: '12px 18px' }}>Patient</th>
                    <th style={{ padding: '12px 18px' }}>Test Name</th>
                    <th style={{ padding: '12px 18px' }}>Specimen</th>
                    <th style={{ padding: '12px 18px' }}>Urgency</th>
                    <th style={{ padding: '12px 18px' }}>Ordered By</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labOrdersList.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {order.orderNumber}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        {order.patientName}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.testName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{order.testCategory}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: 12 }}>
                        {order.sampleType}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {order.urgency === 'stat_emergency' && <Badge variant="error">STAT EMERGENCY</Badge>}
                        {order.urgency === 'urgent' && <Badge variant="warning">URGENT</Badge>}
                        {order.urgency === 'routine' && <Badge variant="neutral">ROUTINE</Badge>}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 12, color: '#64748b' }}>
                        {order.doctorName}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {order.status === 'sample_pending' && <Badge variant="warning">SAMPLE PENDING</Badge>}
                        {order.status === 'in_testing' && <Badge variant="info">IN TESTING</Badge>}
                        {order.status === 'results_ready' && <Badge variant="success">RESULTS PUBLISHED</Badge>}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {order.status === 'sample_pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleCollectSample(order.id)}
                            style={{ fontSize: 12, background: '#2563eb', color: '#ffffff' }}
                          >
                            Collect Sample
                          </Button>
                        )}
                        {order.status === 'in_testing' && (
                          <Button
                            size="sm"
                            onClick={() => setEnterResultModalOrder(order)}
                            style={{ fontSize: 12, background: '#c026d3', color: '#ffffff' }}
                          >
                            Enter Results
                          </Button>
                        )}
                        {order.status === 'results_ready' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewLabReportModalOrder(order)}
                            style={{ fontSize: 12, color: '#16a34a', borderColor: '#bbf7d0' }}
                          >
                            View Report
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}

      {/* ── Patient Chart Modal ──────────────────────────────────────────────── */}
      {selectedPatientModal && (
        <Modal
          isOpen={Boolean(selectedPatientModal)}
          onClose={() => setSelectedPatientModal(null)}
          title={`Hospital Patient Chart: ${selectedPatientModal.name}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedPatientModal.name}</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Blood Group: {selectedPatientModal.bloodGroup} • Age: {selectedPatientModal.age}</span>
              </div>
              <Badge variant="info">Ref: {selectedPatientModal.id}</Badge>
            </div>

            {activeStaff.canViewFullMedical ? (
              <>
                <div style={{ padding: 14, background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#64748b' }}>LATEST CLINICAL VITALS</h4>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                    BP: {selectedPatientModal.vitals.bp} • Heart Rate: {selectedPatientModal.vitals.hr} • Temp: {selectedPatientModal.vitals.temp}
                  </p>
                </div>

                <div style={{ padding: 14, background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#64748b' }}>ACTIVE MEDICATIONS & PRESCRIPTIONS</h4>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{selectedPatientModal.activePrescription}</p>
                </div>

                <div style={{ padding: 14, background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 13, color: '#64748b' }}>DOCTOR NOTES</h4>
                  <p style={{ margin: 0, fontSize: 13 }}>{selectedPatientModal.consultationNotes}</p>
                </div>
              </>
            ) : (
              <div style={{ padding: 16, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', color: '#b45309', fontSize: 12.5 }}>
                <Lock size={16} style={{ display: 'inline', marginRight: 6 }} />
                Your role ({activeStaff.role.replace('_', ' ').toUpperCase()}) does not have authorized clinical chart clearance for full diagnostic notes. Basic identity check only.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <Button variant="outline" onClick={() => setSelectedPatientModal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Create Hospital Blood Request Modal ─────────────────────────────── */}
      {newBloodModalOpen && (
        <Modal
          isOpen={newBloodModalOpen}
          onClose={() => setNewBloodModalOpen(false)}
          title="Create Hospital Blood Appeal"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Patient Name / Ward</label>
              <input
                type="text"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                placeholder="e.g. Aminu Bello (Maternity Suite 2)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Blood Group</label>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Units Needed</label>
                <input
                  type="number"
                  value={newUnits}
                  onChange={(e) => setNewUnits(e.target.value)}
                  min="1"
                  max="10"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Urgency Level</label>
              <select
                value={newUrgency}
                onChange={(e) => setNewUrgency(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              >
                <option value="emergency">Emergency (Within Hours)</option>
                <option value="urgent">Urgent (Within 24 Hours)</option>
                <option value="routine">Routine (Scheduled Surgery)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Clinical Justification / Ward Notes</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Reason for blood appeal..."
                rows={3}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <Button variant="outline" onClick={() => setNewBloodModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateBloodRequest}>Create & Confirm</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal 1: Register New Staff & Create Account ──────────────────────── */}
      {isRegisterStaffModalOpen && (
        <Modal
          isOpen={isRegisterStaffModalOpen}
          onClose={() => setIsRegisterStaffModalOpen(false)}
          title={`Register Staff for ${currentFacility.name}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              background: '#eff6ff', borderRadius: 8, padding: '12px 14px',
              border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 10
            }}>
              <ShieldCheck size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#1e40af', lineHeight: 1.4 }}>
                Create a hospital staff account for <strong>{currentFacility.name}</strong>. Upon creation, an official <strong>Onboarding Credentials Slip</strong> will be generated with their login details and temporary password to hand over to the staff member.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Staff Full Name *</label>
                <input
                  type="text"
                  value={regStaffName}
                  onChange={(e) => setRegStaffName(e.target.value)}
                  placeholder="e.g. Nurse Boma Douglas / Dr. Kalu Okoro"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Assigned Staff Role *</label>
                <select
                  value={regStaffRole}
                  onChange={(e) => {
                    const r = e.target.value as HospitalStaffRole;
                    setRegStaffRole(r);
                    if (r === 'doctor') setRegStaffDept('Cardiology');
                    else if (r === 'nurse') setRegStaffDept('Emergency & Triage');
                    else if (r === 'receptionist') setRegStaffDept('Patient Services');
                    else if (r === 'blood_officer') setRegStaffDept('Laboratory & Blood Bank');
                    else if (r === 'pharmacist') setRegStaffDept('Hospital Pharmacy & Dispensary');
                    else if (r === 'lab_technician') setRegStaffDept('Clinical Pathology & Laboratory');
                    else if (r === 'hospital_admin') setRegStaffDept('Hospital Administration');
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="doctor">Doctor (Full EHR, Clinical Notes, Doctor Phone Sync)</option>
                  <option value="nurse">Nurse (Triage, Patient Vitals, Check-Ins)</option>
                  <option value="receptionist">Receptionist (Front Desk Intake, Appointments)</option>
                  <option value="blood_officer">Blood / Records Officer (Transfusions & Appeals)</option>
                  <option value="pharmacist">Pharmacist (Prescription Dispensing & Drug Inventory)</option>
                  <option value="lab_technician">Lab Scientist (Diagnostic Orders & Results Verification)</option>
                  <option value="hospital_admin">Hospital Admin (Full Staff & Facility Oversight)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Job Title / Designation</label>
                <input
                  type="text"
                  value={regStaffTitle}
                  onChange={(e) => setRegStaffTitle(e.target.value)}
                  placeholder="e.g. Lead Triage Nurse / Specialist Physician"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Facility Department</label>
                <select
                  value={regStaffDept}
                  onChange={(e) => setRegStaffDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="Emergency & Triage">Emergency & Triage</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Patient Services">Patient Services (Reception Desk)</option>
                  <option value="Laboratory & Blood Bank">Laboratory & Blood Bank</option>
                  <option value="Hospital Administration">Hospital Administration</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Official Work Email (Login Username) *</label>
                <input
                  type="email"
                  value={regStaffEmail}
                  onChange={(e) => setRegStaffEmail(e.target.value)}
                  placeholder="staff@xyzspecialist.ng"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Phone Number</label>
                <input
                  type="tel"
                  value={regStaffPhone}
                  onChange={(e) => setRegStaffPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Initial Temporary Password</label>
                <button
                  type="button"
                  onClick={() => setRegStaffPassword(`Hsp${Math.floor(1000 + Math.random() * 9000)}!xyz`)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Generate New
                </button>
              </div>
              <input
                type="text"
                value={regStaffPassword}
                onChange={(e) => setRegStaffPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'block' }}>
                The staff member will use this password to sign in at <code>/login</code> and be prompted to set a personal password.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 14, marginTop: 6 }}>
              <Button variant="outline" onClick={() => setIsRegisterStaffModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleRegisterStaffSubmit}>
                <UserPlus size={14} style={{ marginRight: 6 }} /> Create Account & Issue Credentials
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal 2: Official Staff Account Credentials Slip ───────────────────── */}
      {credentialsModalStaff && (
        <Modal
          isOpen={Boolean(credentialsModalStaff)}
          onClose={() => setCredentialsModalStaff(null)}
          title={`Staff Credentials Slip: ${credentialsModalStaff.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Facility Header Slip */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 12, padding: '16px 18px', color: '#ffffff', border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={16} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {currentFacility.name}
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: '#f8fafc' }}>
                    {credentialsModalStaff.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#94a3b8' }}>
                    {credentialsModalStaff.title} • {credentialsModalStaff.department} (Staff of {currentFacility.name})
                  </p>
                </div>
                <Badge variant="warning">
                  {credentialsModalStaff.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid #334155', fontSize: 11.5, color: '#cbd5e1' }}>
                <span>Badge ID: <strong style={{ color: '#ffffff' }}>{credentialsModalStaff.badgeId}</strong></span>
                <span>•</span>
                <span>Created: <strong style={{ color: '#ffffff' }}>{credentialsModalStaff.createdAt}</strong></span>
              </div>
            </div>

            {/* Login Details Card */}
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: 14,
              border: '1.5px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 10
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Portal Web URL</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', marginTop: 2 }}>
                  <code style={{ fontSize: 12, color: '#0f172a' }}>http://localhost:3000/login</code>
                  <button
                    onClick={() => copyToClipboard('http://localhost:3000/login', 'url')}
                    style={{ background: 'none', border: 'none', color: copiedKey === 'url' ? '#16a34a' : '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600 }}
                  >
                    {copiedKey === 'url' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'url' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Work Email (Username)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', marginTop: 2 }}>
                  <code style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{credentialsModalStaff.email}</code>
                  <button
                    onClick={() => copyToClipboard(credentialsModalStaff.email, 'email')}
                    style={{ background: 'none', border: 'none', color: copiedKey === 'email' ? '#16a34a' : '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600 }}
                  >
                    {copiedKey === 'email' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'email' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Temporary Password</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', marginTop: 2 }}>
                  <code style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
                    {credentialsModalStaff.tempPassword || 'HospitalPass2026!'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(credentialsModalStaff.tempPassword || 'HospitalPass2026!', 'pass')}
                    style={{ background: 'none', border: 'none', color: copiedKey === 'pass' ? '#16a34a' : '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600 }}
                  >
                    {copiedKey === 'pass' ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === 'pass' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Scope Summary Box */}
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, border: '1px solid #bbf7d0', fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
              <strong>Portal Access Scope for {credentialsModalStaff.role.replace('_', ' ').toUpperCase()}:</strong>
              <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <span>Patients: {credentialsModalStaff.canViewFullMedical ? 'Full EHR & Notes' : 'Triage / Identity'}</span>
                <span>Appointments: {credentialsModalStaff.canViewAppointments ? 'Manage & View' : 'No Access'}</span>
                <span>Blood Appeals: {credentialsModalStaff.canManageBlood ? 'Manage Pipeline' : 'View Only'}</span>
                <span>Staff Admin: {credentialsModalStaff.canManageStaff ? 'Full Admin' : 'Restricted'}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const slip = `OMINIPULSE HOSPITAL ONBOARDING SLIP\nFacility: ${currentFacility.name}\nStaff Name: ${credentialsModalStaff.name}\nRole: ${credentialsModalStaff.role}\nBadge ID: ${credentialsModalStaff.badgeId}\nLogin URL: http://localhost:3000/login\nWork Email: ${credentialsModalStaff.email}\nTemporary Password: ${credentialsModalStaff.tempPassword || 'HospitalPass2026!'}`;
                  copyToClipboard(slip, 'all');
                }}
              >
                {copiedKey === 'all' ? <Check size={14} style={{ marginRight: 6, color: '#16a34a' }} /> : <Copy size={14} style={{ marginRight: 6 }} />}
                {copiedKey === 'all' ? 'Slip Copied!' : 'Copy Full Slip'}
              </Button>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" size="sm" onClick={() => setCredentialsModalStaff(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {/* ── Add New Clinical Service Modal ─────────────────────────────────── */}
      {newServiceModalOpen && (
        <Modal
          isOpen={newServiceModalOpen}
          onClose={() => setNewServiceModalOpen(false)}
          title={`Add Clinical Service to ${currentFacility.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Define medical procedures, diagnostic panels, or specialty consultation packages available at this facility.
            </p>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Service / Procedure Name *</label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="e.g. Comprehensive Echocardiogram / Maternal Triage"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Hospital Department</label>
                <select
                  value={newServiceDept}
                  onChange={(e) => setNewServiceDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Emergency">Emergency & Trauma</option>
                  <option value="Laboratory">Laboratory & Blood Bank</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Standard Fee (NGN) *</label>
                <input
                  type="number"
                  value={newServiceFee}
                  onChange={(e) => setNewServiceFee(e.target.value)}
                  placeholder="15000"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Estimated Duration</label>
                <input
                  type="text"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                  placeholder="30 mins"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={newServiceEmergency}
                    onChange={(e) => setNewServiceEmergency(e.target.checked)}
                  />
                  Available 24/7 Emergency
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Clinical Description</label>
              <textarea
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                placeholder="Scope of clinical investigation, patient instructions, and consultation overview..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, height: 70, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setNewServiceModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddServiceSubmit}>Add Clinical Service</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Book Donor Screening Appointment Modal ────────────────────────── */}
      {newScreeningModalOpen && (
        <Modal
          isOpen={newScreeningModalOpen}
          onClose={() => setNewScreeningModalOpen(false)}
          title={`Book Donor Screening Appointment (${currentFacility.name})`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Schedule a voluntary or appeal-matched donor for pre-transfusion clinical screening at the blood bank.
            </p>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Volunteer Donor Full Name *</label>
              <input
                type="text"
                value={bookDonorName}
                onChange={(e) => setBookDonorName(e.target.value)}
                placeholder="e.g. Ibrahim Danladi / Chinedu Eze"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Donor Contact Phone *</label>
                <input
                  type="tel"
                  value={bookDonorPhone}
                  onChange={(e) => setBookDonorPhone(e.target.value)}
                  placeholder="+234 803 111 2233"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Self-Reported Blood Group</label>
                <select
                  value={bookDonorBloodGroup}
                  onChange={(e) => setBookDonorBloodGroup(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="O+">O+ (Positive)</option>
                  <option value="O-">O- (Universal)</option>
                  <option value="A+">A+ (Positive)</option>
                  <option value="A-">A- (Negative)</option>
                  <option value="B+">B+ (Positive)</option>
                  <option value="B-">B- (Negative)</option>
                  <option value="AB+">AB+ (Positive)</option>
                  <option value="AB-">AB- (Negative)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Appointment Date & Time *</label>
                <input
                  type="text"
                  value={bookDonorTime}
                  onChange={(e) => setBookDonorTime(e.target.value)}
                  placeholder="Today, 03:00 PM"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Target Hospital Appeal Ref</label>
                <select
                  value={bookDonorAppeal}
                  onChange={(e) => setBookDonorAppeal(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  {bloodRequests.map(r => (
                    <option key={r.id} value={`${r.id} (${r.patientName})`}>
                      {r.id} — {r.patientName} ({r.bloodGroup})
                    </option>
                  ))}
                  <option value="Routine Blood Bank Stocking">Routine Blood Bank Reserve</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setNewScreeningModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleBookScreeningSubmit}>Schedule Screening Appointment</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Conduct Medical Screening & Record Donation Modal ─────────────── */}
      {conductScreeningDonor && (
        <Modal
          isOpen={Boolean(conductScreeningDonor)}
          onClose={() => setConductScreeningDonor(null)}
          title={`Clinical Screening: ${conductScreeningDonor.donorName}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Screening Station: {currentFacility.name}</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  Target: {conductScreeningDonor.targetAppealRef}
                </p>
              </div>
              <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '4px 10px', borderRadius: 6, fontSize: 13 }}>
                {conductScreeningDonor.bloodGroup}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>Hemoglobin (g/dL)</label>
                <input
                  type="text"
                  value={screeningFormHb}
                  onChange={(e) => setScreeningFormHb(e.target.value)}
                  placeholder="13.5"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>Blood Pressure</label>
                <input
                  type="text"
                  value={screeningFormBp}
                  onChange={(e) => setScreeningFormBp(e.target.value)}
                  placeholder="120/80"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>Weight (kg)</label>
                <input
                  type="text"
                  value={screeningFormWeight}
                  onChange={(e) => setScreeningFormWeight(e.target.value)}
                  placeholder="70"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Clinical Clearance Status *</label>
              <select
                value={screeningFormDecision}
                onChange={(e) => setScreeningFormDecision(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              >
                <option value="cleared_for_donation">Cleared for Donation (Viral Markers Non-Reactive)</option>
                <option value="donation_completed">Donation Completed (1 Unit Collected & Verified)</option>
                <option value="deferred">Deferred (Low Hb / Elevated BP / Temporary Hold)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Lab Screening & Collection Notes</label>
              <textarea
                value={screeningFormNotes}
                onChange={(e) => setScreeningFormNotes(e.target.value)}
                placeholder="HIV 1/2, HBsAg, HCV, VDRL all non-reactive. Verified sterile blood bag collection..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, height: 65, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setConductScreeningDonor(null)}>Close</Button>
              <Button variant="primary" onClick={handleConductScreeningSubmit}>Save Screening & Update Inventory</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Assign Doctor Department Modal ─────────────────────────────────── */}
      {assignDeptDoctor && (
        <Modal
          isOpen={Boolean(assignDeptDoctor)}
          onClose={() => setAssignDeptDoctor(null)}
          title={`Assign Department: ${assignDeptDoctor.name}`}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Reassign clinical department privileges for {assignDeptDoctor.name} at {currentFacility.name}.
            </p>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Target Hospital Department</label>
              <select
                value={selectedDeptToAssign}
                onChange={(e) => setSelectedDeptToAssign(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              >
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Emergency & Trauma">Emergency & Trauma</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setAssignDeptDoctor(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignDeptSubmit}>Confirm Department Assignment</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Manage Doctor Availability Modal ───────────────────────────────── */}
      {manageAvailabilityDoctor && (
        <Modal
          isOpen={Boolean(manageAvailabilityDoctor)}
          onClose={() => setManageAvailabilityDoctor(null)}
          title={`Manage Schedule: ${manageAvailabilityDoctor.name}`}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Configure active duty shifts and clinic consultation days at {currentFacility.name}.
            </p>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Hospital Shift Schedule</label>
              <select
                value={availShifts}
                onChange={(e) => setAvailShifts(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              >
                <option value="Morning (08:00 - 14:00)">Morning (08:00 - 14:00)</option>
                <option value="Afternoon (14:00 - 18:00)">Afternoon (14:00 - 18:00)</option>
                <option value="Regular Full Shift (08:00 - 16:00)">Regular Full Shift (08:00 - 16:00)</option>
                <option value="24/7 On-Call Rotation">24/7 On-Call Rotation</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Active Consulting Days
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => {
                  const isSelected = availDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        if (isSelected) setAvailDays(availDays.filter(day => day !== d));
                        else setAvailDays([...availDays, d]);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#2563eb' : '#475569',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setManageAvailabilityDoctor(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleManageAvailabilitySubmit}>Save Doctor Schedule</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Invite Doctor to Hospital Modal ─────────────────────────────────── */}
      {isInviteDoctorModalOpen && (
        <Modal
          isOpen={isInviteDoctorModalOpen}
          onClose={() => setIsInviteDoctorModalOpen(false)}
          title={`Invite Doctor to ${currentFacility.name}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Associate a licensed medical practitioner with {currentFacility.name}. Doctor MDCN verification remains supervised by platform administration.
            </p>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Doctor Full Name *</label>
              <input
                type="text"
                value={inviteDocName}
                onChange={(e) => setInviteDocName(e.target.value)}
                placeholder="e.g. Dr. Kalu Okoro"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Clinical Specialization *</label>
                <input
                  type="text"
                  value={inviteDocSpecialization}
                  onChange={(e) => setInviteDocSpecialization(e.target.value)}
                  placeholder="e.g. Obstetrician & Gynecologist"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Hospital Department</label>
                <select
                  value={inviteDocDept}
                  onChange={(e) => setInviteDocDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Doctor Official Email *</label>
                <input
                  type="email"
                  value={inviteDocEmail}
                  onChange={(e) => setInviteDocEmail(e.target.value)}
                  placeholder="dr.kalu@xyzspecialist.ng"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>MDCN License Number</label>
                <input
                  type="text"
                  value={inviteDocLicense}
                  onChange={(e) => setInviteDocLicense(e.target.value)}
                  placeholder="MDCN-LIC-55902"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setIsInviteDoctorModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleInviteDoctorSubmit}>Invite & Grant Facility Access</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Assign Bed Modal ─────────────────────────────────────────────────── */}
      {assignBedModalBed && (
        <Modal
          isOpen={Boolean(assignBedModalBed)}
          onClose={() => setAssignBedModalBed(null)}
          title={`Assign Inpatient to Bed: ${assignBedModalBed.bedNumber} (${assignBedModalBed.wardLabel})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Patient Full Name *</label>
              <input
                type="text"
                value={assignPatientName}
                onChange={(e) => setAssignPatientName(e.target.value)}
                placeholder="e.g. Danjuma Usman / Aisha Kabir"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Admission Diagnosis / Reason</label>
              <input
                type="text"
                value={assignPatientDiagnosis}
                onChange={(e) => setAssignPatientDiagnosis(e.target.value)}
                placeholder="e.g. Acute Gastroenteritis / Post-Op Recovery"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Attending Physician</label>
              <select
                value={assignAttendingDoctor}
                onChange={(e) => setAssignAttendingDoctor(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              >
                <option value="Dr. Ahmed Bello">Dr. Ahmed Bello (Cardiology)</option>
                <option value="Dr. Musa Aliyu">Dr. Musa Aliyu (General Practice)</option>
                <option value="Dr. Sarah Danladi">Dr. Sarah Danladi (Pediatrics)</option>
                <option value="Dr. Ibrahim Sani">Dr. Ibrahim Sani (Surgery / Admin)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setAssignBedModalBed(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignBedSubmit}>Confirm Bed Admission</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Transfer Bed / Ward Modal ────────────────────────────────────────── */}
      {transferBedModalBed && (
        <Modal
          isOpen={Boolean(transferBedModalBed)}
          onClose={() => setTransferBedModalBed(null)}
          title={`Transfer Patient: ${transferBedModalBed.currentPatientName} (From ${transferBedModalBed.bedNumber})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Select target destination ward. The patient will be moved to the first available bed in that ward, and current bed ({transferBedModalBed.bedNumber}) will be marked as &quot;Cleaning Required&quot;.
            </p>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Destination Ward *</label>
              <select
                value={targetTransferWard}
                onChange={(e) => setTargetTransferWard(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              >
                <option value="icu">Intensive Care Unit (ICU)</option>
                <option value="emergency">Emergency Casualty Ward</option>
                <option value="male_surgical">Male Surgical Ward</option>
                <option value="female_medical">Female Medical Ward</option>
                <option value="pediatric">Pediatric Ward</option>
                <option value="maternity">Maternity & Labor Ward</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setTransferBedModalBed(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleTransferBedSubmit}>Execute Ward Transfer</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Medication Stock Modal ────────────────────────────────────────── */}
      {addMedModalOpen && (
        <Modal
          isOpen={addMedModalOpen}
          onClose={() => setAddMedModalOpen(false)}
          title="Add Medication Stock Batch to Hospital Pharmacy"
        >
          <form onSubmit={handleAddMedicationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Medication Full Name *</label>
              <input
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Ciprofloxacin 500mg Tablets"
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Formulary Category</label>
                <select
                  value={newMedCategory}
                  onChange={(e) => setNewMedCategory(e.target.value as any)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
                >
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Analgesics">Analgesics</option>
                  <option value="IV Fluids">IV Fluids</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Dosage Form</label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g. 100ml Infusion / Blister Pack"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Stock Quantity</label>
                <input
                  type="number"
                  value={newMedQty}
                  onChange={(e) => setNewMedQty(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Unit Price (₦)</label>
                <input
                  type="number"
                  value={newMedPrice}
                  onChange={(e) => setNewMedPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Expiry Date</label>
                <input
                  type="date"
                  value={newMedExpiry}
                  onChange={(e) => setNewMedExpiry(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button type="button" variant="outline" onClick={() => setAddMedModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Add to Inventory</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Enter Lab Results Modal ─────────────────────────────────────────── */}
      {enterResultModalOrder && (
        <Modal
          isOpen={Boolean(enterResultModalOrder)}
          onClose={() => setEnterResultModalOrder(null)}
          title={`Enter Laboratory Diagnostic Results: ${enterResultModalOrder.testName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 12, background: '#fdf4ff', borderRadius: 8, border: '1px solid #f5d0fe' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#86198f' }}>
                Order #{enterResultModalOrder.orderNumber} • Patient: {enterResultModalOrder.patientName}
              </div>
              <div style={{ fontSize: 12, color: '#701a75', marginTop: 2 }}>
                Specimen: {enterResultModalOrder.sampleType} • Prescribed by {enterResultModalOrder.doctorName}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Diagnostic Results Summary *</label>
              <input
                type="text"
                value={resultSummaryInput}
                onChange={(e) => setResultSummaryInput(e.target.value)}
                placeholder="e.g. Hb: 11.4 g/dL, WBC: 7,200 /mm3, Platelets: 240,000 /mm3"
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Normal Reference Range</label>
              <input
                type="text"
                value={resultNormalRangeInput}
                onChange={(e) => setResultNormalRangeInput(e.target.value)}
                placeholder="e.g. Hb: 12.0 - 15.5 g/dL"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Clinical Pathology Observations / Findings</label>
              <textarea
                value={resultFindingsInput}
                onChange={(e) => setResultFindingsInput(e.target.value)}
                rows={3}
                placeholder="Detailed clinical observation by testing scientist..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setEnterResultModalOrder(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveLabResult}>Publish Results to Chart</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── System Notice Modal (Replacing browser alert) ────────────────────── */}
      {systemNoticeModal && (
        <Modal
          isOpen={Boolean(systemNoticeModal)}
          onClose={() => setSystemNoticeModal(null)}
          title={systemNoticeModal.title}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: 14,
              borderRadius: 10,
              background: systemNoticeModal.type === 'error' ? '#fef2f2' : systemNoticeModal.type === 'warning' ? '#fffbeb' : '#eff6ff',
              border: `1px solid ${systemNoticeModal.type === 'error' ? '#fee2e2' : systemNoticeModal.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
            }}>
              <AlertTriangle size={20} style={{ color: systemNoticeModal.type === 'error' ? '#dc2626' : systemNoticeModal.type === 'warning' ? '#d97706' : '#2563eb', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ margin: 0, fontSize: 13.5, color: '#1e293b', lineHeight: 1.5 }}>
                  {systemNoticeModal.message}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="primary" onClick={() => setSystemNoticeModal(null)}>Acknowledge & Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── View Diagnostic Lab Report Modal ─────────────────────────────────── */}
      {viewLabReportModalOrder && (
        <Modal
          isOpen={Boolean(viewLabReportModalOrder)}
          onClose={() => setViewLabReportModalOrder(null)}
          title={`Diagnostic Pathology Report: ${viewLabReportModalOrder.orderNumber}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header banner */}
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Patient Name</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{viewLabReportModalOrder.patientName}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>ID: {viewLabReportModalOrder.patientId} • Ordered by {viewLabReportModalOrder.doctorName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge variant="success">RESULTS VERIFIED & PUBLISHED</Badge>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>Verified: {viewLabReportModalOrder.verifiedAt}</div>
              </div>
            </div>

            {/* Test info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, background: '#f1f5f9' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Test Ordered</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{viewLabReportModalOrder.testName}</div>
                <div style={{ fontSize: 11.5, color: '#2563eb' }}>{viewLabReportModalOrder.testCategory}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: '#f1f5f9' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Specimen Sample</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{viewLabReportModalOrder.sampleType}</div>
                <div style={{ fontSize: 11.5, color: '#16a34a' }}>Analyzed in Laboratory</div>
              </div>
            </div>

            {/* Findings & Values */}
            <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                Laboratory Quantitative Results:
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                {viewLabReportModalOrder.resultsSummary}
              </div>

              {viewLabReportModalOrder.normalRange && (
                <div style={{ marginTop: 10, padding: 10, background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#475569' }}>
                  <strong style={{ color: '#0f172a' }}>Standard Reference Range:</strong> {viewLabReportModalOrder.normalRange}
                </div>
              )}

              {viewLabReportModalOrder.findings && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                  <strong style={{ fontStyle: 'normal', color: '#0f172a' }}>Clinical Pathologist Note:</strong> &ldquo;{viewLabReportModalOrder.findings}&rdquo;
                </div>
              )}
            </div>

            {/* Sign-off */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: 12.5, color: '#15803d', fontWeight: 600 }}>
                  Electronically Verified & Signed by {viewLabReportModalOrder.technicianName}
                </span>
              </div>
              <Badge variant="success">E-Signed</Badge>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setViewLabReportModalOrder(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} style={{ marginRight: 6 }} /> Print Official Lab Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Contact Institutional Billing Modal ──────────────────────────────── */}
      {contactBillingModalOpen && (
        <Modal
          isOpen={contactBillingModalOpen}
          onClose={() => setContactBillingModalOpen(false)}
          title="OminiPulse Institutional Billing & Enterprise Desk"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#1e40af' }}>Dedicated Facility Account Manager</h4>
              <p style={{ margin: 0, fontSize: 12.5, color: '#3b82f6', lineHeight: 1.5 }}>
                For enterprise contract renegotiations, custom bed additions, or corporate wire reconciliations, our institutional billing team is at your service.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} style={{ color: '#2563eb' }} />
                <span>Email: <strong style={{ color: '#0f172a' }}>partnerships@ominipulse.ai</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} style={{ color: '#16a34a' }} />
                <span>Enterprise Hotline: <strong style={{ color: '#0f172a' }}>+234 800 OMINI PULSE</strong> (Mon-Sat 8am - 6pm)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={16} style={{ color: '#7c3aed' }} />
                <span>Facility Account: <strong style={{ color: '#0f172a' }}>{currentFacility.name} (ID: {currentFacility.id})</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setContactBillingModalOpen(false)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = 'mailto:partnerships@ominipulse.ai?subject=Institutional%20Billing%20Inquiry%20-%20' + encodeURIComponent(currentFacility.name);
                }}
              >
                Send Direct Email
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Official Receipt Modal ───────────────────────────────────────────── */}
      {downloadReceiptModalInvoice && (
        <Modal
          isOpen={Boolean(downloadReceiptModalInvoice)}
          onClose={() => setDownloadReceiptModalInvoice(null)}
          title={`Official Invoice Receipt: ${downloadReceiptModalInvoice.invoiceNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{downloadReceiptModalInvoice.title}</span>
                <Badge variant="success">PAID IN FULL</Badge>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Date of Payment: {downloadReceiptModalInvoice.date}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 10 }}>
                {downloadReceiptModalInvoice.amount}
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
              This digitally signed institutional tax receipt is registered with the Federal Inland Revenue Service (FIRS) and OminiPulse Corporate Escrow.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setDownloadReceiptModalInvoice(null)}>Close</Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} style={{ marginRight: 6 }} /> Print / Save as PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
