'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Stethoscope, Calendar, Clock, Users, FileText, Pill,
  CheckCircle2, AlertCircle, Plus, Search,
  Send, Eye, Edit3, Award, MapPin, DollarSign, UserCheck, Shield, Star, MessageSquare,
  Smartphone, Download, Video, Phone, Radio, Activity, Fingerprint, Lock, ExternalLink,
  Droplet, Sparkles, Bot, Mic, MicOff, VideoOff, PhoneOff, Settings, RefreshCw,
  ChevronRight, ArrowRight, ShieldCheck, Heart, Info, Check, X, AlertTriangle
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

// ── Types ───────────────────────────────────────────────────────────────────

interface PatientReview {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
  doctorReply?: string;
}

interface Consultation {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  bloodGroup: string;
  genotype: string;
  time: string;
  type: 'video' | 'in_person' | 'phone';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  reason: string;
  vitals: { bp: string; hr: string; temp: string; weight: string; spo2: string };
  history: string;
  allergies: string[];
  painRegion?: {
    region: string;
    severity: number; // 1-10
    color: 'yellow' | 'orange' | 'red';
    notes: string;
  };
}

interface IssuedPrescription {
  id: string;
  patientName: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  pharmacy: string;
  date: string;
  status: 'Dispensed' | 'Processing' | 'Received by Patient App';
}

// ── Initial Mock Data ───────────────────────────────────────────────────────

const INITIAL_PATIENT_REVIEWS: PatientReview[] = [
  {
    id: 'pr-1',
    patientName: 'Mariam Oladosu',
    rating: 5,
    date: '2026-06-02',
    comment: 'Dr. Folake is extremely thorough and caring. She explained my blood pressure management plan clearly.',
    doctorReply: 'Thank you Mariam! Stay consistent with your medication and salt reduction regimen.',
  },
  {
    id: 'pr-2',
    patientName: 'Tunde Afolabi',
    rating: 5,
    date: '2026-05-28',
    comment: 'Very professional cardiac evaluation and bedside manner. I highly recommend her clinic.',
  },
  {
    id: 'pr-3',
    patientName: 'Grace Eze',
    rating: 4,
    date: '2026-05-15',
    comment: 'Very good consultation. Video call was clear and prescription was sent to pharmacy immediately.',
  },
];

const TODAY_CONSULTATIONS: Consultation[] = [
  {
    id: 'c-101',
    patientName: 'Mariam Oladosu',
    patientAge: 34,
    patientGender: 'Female',
    bloodGroup: 'O+',
    genotype: 'AA',
    time: '09:00 AM',
    type: 'video',
    status: 'completed',
    reason: 'Follow-up on hypertension medication & occasional palpitations',
    vitals: { bp: '124/80 mmHg', hr: '72 bpm', temp: '36.6 °C', weight: '68 kg', spo2: '99%' },
    history: 'Hypertension (2 yrs), Mild seasonal asthma.',
    allergies: ['Penicillin', 'Sulfa drugs'],
    painRegion: {
      region: 'Chest',
      severity: 3,
      color: 'yellow',
      notes: 'Substernal tightness after heavy exertion, relieved by rest.',
    },
  },
  {
    id: 'c-102',
    patientName: 'Tunde Afolabi',
    patientAge: 48,
    patientGender: 'Male',
    bloodGroup: 'A+',
    genotype: 'AS',
    time: '10:30 AM',
    type: 'video',
    status: 'in_progress',
    reason: 'Routine cardiac risk evaluation & lipid profile review',
    vitals: { bp: '138/88 mmHg', hr: '82 bpm', temp: '36.8 °C', weight: '84 kg', spo2: '98%' },
    history: 'Hyperlipidemia, borderline pre-diabetes managed via diet.',
    allergies: ['Aspirin'],
    painRegion: {
      region: 'Chest',
      severity: 5,
      color: 'orange',
      notes: 'Mid-chest dull ache during morning jog.',
    },
  },
  {
    id: 'c-103',
    patientName: 'Grace Eze',
    patientAge: 29,
    patientGender: 'Female',
    bloodGroup: 'B+',
    genotype: 'AA',
    time: '02:00 PM',
    type: 'video',
    status: 'waiting',
    reason: 'Frequent tension headaches & dizziness after screen work',
    vitals: { bp: '116/74 mmHg', hr: '86 bpm', temp: '36.5 °C', weight: '59 kg', spo2: '99%' },
    history: 'Migraine with aura, no surgical history.',
    allergies: ['None recorded'],
    painRegion: {
      region: 'Head',
      severity: 7,
      color: 'red',
      notes: 'Frontal and temporal throbbing pain, photophobia present.',
    },
  },
  {
    id: 'c-104',
    patientName: 'Robert Okafor',
    patientAge: 56,
    patientGender: 'Male',
    bloodGroup: 'O-',
    genotype: 'AA',
    time: '04:30 PM',
    type: 'phone',
    status: 'waiting',
    reason: 'Medication refill consultation for Amlodipine 5mg & knee joint stiffness',
    vitals: { bp: '132/84 mmHg', hr: '74 bpm', temp: '36.7 °C', weight: '91 kg', spo2: '97%' },
    history: 'Essential Hypertension (5 yrs), Mild osteoarthritis.',
    allergies: ['Ibuprofen'],
    painRegion: {
      region: 'Lower Limbs',
      severity: 4,
      color: 'orange',
      notes: 'Bilateral knee pain after walking longer distances.',
    },
  },
];

const INITIAL_PRESCRIPTIONS: IssuedPrescription[] = [
  {
    id: 'RX-9081',
    patientName: 'Tunde Afolabi (48y · Male)',
    drugName: 'Amlodipine Besylate 5mg',
    dosage: '1 Tablet by mouth daily',
    frequency: 'Once daily (QD)',
    duration: '30 days',
    pharmacy: 'Pharmacare Pharmacy Ikeja',
    date: 'Today, 09:15 AM',
    status: 'Received by Patient App',
  },
  {
    id: 'RX-8942',
    patientName: 'Mariam Oladosu (34y · Female)',
    drugName: 'Atorvastatin Calcium 20mg',
    dosage: '1 Tablet at bedtime',
    frequency: 'Once daily (QD)',
    duration: '14 days',
    pharmacy: 'MedPlus Pharmacy Victoria Island',
    date: 'Yesterday, 02:40 PM',
    status: 'Dispensed',
  },
  {
    id: 'RX-8819',
    patientName: 'Robert Okafor (56y · Male)',
    drugName: 'Lisinopril 10mg',
    dosage: '1 Tablet daily in the morning',
    frequency: 'Once daily (QD)',
    duration: '30 days',
    pharmacy: 'HealthPlus Pharmacy Lekki',
    date: '3 days ago',
    status: 'Dispensed',
  },
];

// ── Interactive 3D Anatomical Body Map Component ─────────────────────────────

interface BodyMapProps {
  activeRegion: string;
  onSelectRegion: (region: string) => void;
  severity: number;
  onSelectSeverity: (val: number) => void;
}

function AnatomicalBodyMap({ activeRegion, onSelectRegion, severity, onSelectSeverity }: BodyMapProps) {
  const regions = [
    { id: 'Head', label: 'Head & Brain', top: '10%', left: '46%', defaultColor: '#3b82f6' },
    { id: 'Chest', label: 'Chest & Heart', top: '26%', left: '44%', defaultColor: '#ef4444' },
    { id: 'Abdomen', label: 'Abdomen & GI', top: '38%', left: '45%', defaultColor: '#f97316' },
    { id: 'Pelvis', label: 'Pelvis & Groin', top: '48%', left: '46%', defaultColor: '#8b5cf6' },
    { id: 'Spine', label: 'Back & Spine', top: '34%', left: '56%', defaultColor: '#0ea5e9' },
    { id: 'Upper Limbs', label: 'Arms & Shoulders', top: '30%', left: '26%', defaultColor: '#10b981' },
    { id: 'Lower Limbs', label: 'Legs & Knees', top: '68%', left: '45%', defaultColor: '#f59e0b' },
  ];

  const getSeverityBadgeColor = (val: number) => {
    if (val <= 3) return { bg: '#fef9c3', text: '#854d0e', label: 'Mild Pain (1-3)' };
    if (val <= 6) return { bg: '#ffedd5', text: '#9a3412', label: 'Moderate Pain (4-6)' };
    return { bg: '#fee2e2', text: '#991b1b', label: 'Severe Pain (7-10)' };
  };

  const badgeInfo = getSeverityBadgeColor(severity);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: 16,
      padding: '24px 20px',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
      border: '1px solid #334155'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: '#f8fafc' }}>
              3D Anatomical Body Map & Pain Zones
            </h4>
          </div>
          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '3px 0 0' }}>
            Interactive clinical diagnostic mannequin · Select region & inspect intensity
          </p>
        </div>

        <div style={{
          background: badgeInfo.bg,
          color: badgeInfo.text,
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: 11.5,
          fontWeight: 700
        }}>
          Intensity: {severity}/10 · {badgeInfo.label}
        </div>
      </div>

      {/* Anatomical Canvas */}
      <div style={{
        position: 'relative',
        height: 280,
        background: 'radial-gradient(circle at center, rgba(15,110,110,0.18) 0%, rgba(15,23,42,0.6) 70%)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Silhouette Vector Mannequin */}
        <svg width="180" height="260" viewBox="0 0 180 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.85 }}>
          {/* Head */}
          <circle cx="90" cy="30" r="18" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          {/* Neck */}
          <rect x="85" y="48" width="10" height="8" rx="2" fill="#334155" />
          {/* Torso */}
          <path d="M60 56C60 56 75 54 90 54C105 54 120 56 120 56L126 125C126 125 110 135 90 135C70 135 54 125 54 125L60 56Z" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          {/* Left Arm */}
          <path d="M54 60L28 120L34 124L58 72" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          {/* Right Arm */}
          <path d="M126 60L152 120L146 124L122 72" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          {/* Pelvis & Legs */}
          <path d="M64 135L66 230L80 230L82 150L90 148L98 150L100 230L114 230L116 135" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        </svg>

        {/* Interactive Hotspots */}
        {regions.map((reg) => {
          const isSelected = activeRegion === reg.id;
          let pinColor = '#3b82f6';
          if (severity <= 3) pinColor = '#eab308';
          else if (severity <= 6) pinColor = '#f97316';
          else pinColor = '#ef4444';

          return (
            <button
              key={reg.id}
              type="button"
              onClick={() => onSelectRegion(reg.id)}
              style={{
                position: 'absolute',
                top: reg.top,
                left: reg.left,
                transform: 'translate(-50%, -50%)',
                background: isSelected ? pinColor : 'rgba(30, 41, 59, 0.85)',
                color: isSelected ? '#ffffff' : '#94a3b8',
                border: isSelected ? `2px solid #ffffff` : '1px solid #475569',
                borderRadius: 20,
                padding: '4px 9px',
                fontSize: 10.5,
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: isSelected ? `0 0 16px ${pinColor}` : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 200ms ease'
              }}
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isSelected ? '#ffffff' : pinColor,
              }} />
              {reg.label.split(' ')[0]}
              {isSelected && <span style={{ background: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: 999, fontSize: 9 }}>{severity}</span>}
            </button>
          );
        })}
      </div>

      {/* Pain Severity Scale (1 - 10) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
          <span>1 Mild (Yellow)</span>
          <span>5 Moderate (Orange)</span>
          <span>10 Severe (Red)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isCur = severity === num;
            let btnBg = '#1e293b';
            let activeBg = '#eab308';
            if (num > 3 && num <= 6) activeBg = '#f97316';
            if (num > 6) activeBg = '#ef4444';

            return (
              <button
                key={num}
                type="button"
                onClick={() => onSelectSeverity(num)}
                style={{
                  height: 32,
                  borderRadius: 6,
                  border: isCur ? '2px solid #ffffff' : '1px solid #334155',
                  background: isCur ? activeBg : btnBg,
                  color: isCur ? '#ffffff' : '#cbd5e1',
                  fontWeight: isCur ? 800 : 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Doctor Portal Component ─────────────────────────────────────────────

function DoctorPortalContent() {
  const { admin } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/dashboard/doctor-portal?tab=${newTab}`);
  };

  // Telehealth Doctor Online/Offline toggle
  const [isDoctorOnline, setIsDoctorOnline] = useState(true);

  // Toast feedback message
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Selected Consult for Video Call / SOAP
  const [activeVideoConsult, setActiveVideoConsult] = useState<Consultation | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  // Selected Patient Chart & Body Map Modal
  const [activeChartPatient, setActiveChartPatient] = useState<Consultation | null>(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState('Chest');
  const [painIntensity, setPainIntensity] = useState(5);

  // E-Prescription Modal & State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [rxPatientName, setRxPatientName] = useState('Tunde Afolabi (48y · Male)');
  const [rxDrugName, setRxDrugName] = useState('Amlodipine Besylate 5mg');
  const [rxDosage, setRxDosage] = useState('1 Tablet daily by mouth');
  const [rxFrequency, setRxFrequency] = useState('Once daily (QD)');
  const [rxDuration, setRxDuration] = useState('30 days');
  const [rxPharmacy, setRxPharmacy] = useState('Pharmacare Pharmacy Ikeja');
  const [issuedPrescriptions, setIssuedPrescriptions] = useState<IssuedPrescription[]>(INITIAL_PRESCRIPTIONS);

  // Working Hours & Availability State
  const [scheduleSlots, setScheduleSlots] = useState([
    { day: 'Monday', active: true, start: '08:00 AM', end: '05:00 PM', slots: 18 },
    { day: 'Tuesday', active: true, start: '08:00 AM', end: '05:00 PM', slots: 18 },
    { day: 'Wednesday', active: true, start: '08:00 AM', end: '02:00 PM', slots: 12 },
    { day: 'Thursday', active: true, start: '08:00 AM', end: '05:00 PM', slots: 18 },
    { day: 'Friday', active: true, start: '08:00 AM', end: '04:00 PM', slots: 16 },
    { day: 'Saturday', active: false, start: '10:00 AM', end: '02:00 PM', slots: 8 },
    { day: 'Sunday', active: false, start: 'Off Duty', end: 'Off Duty', slots: 0 },
  ]);
  const [slotDuration, setSlotDuration] = useState('30 mins');

  // Tiered Consultation Fees
  const [feeChat, setFeeChat] = useState(8000);
  const [feeVoice, setFeeVoice] = useState(10000);
  const [feeVideo, setFeeVideo] = useState(15000);
  const [isEditingFees, setIsEditingFees] = useState(false);

  // Patient Reviews & Doctor Replies
  const [patientReviews, setPatientReviews] = useState<PatientReview[]>(INITIAL_PATIENT_REVIEWS);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostDoctorReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setPatientReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, doctorReply: replyText.trim() } : r)
    );
    setReplyingReviewId(null);
    setReplyText('');
    triggerFeedback('Official verified doctor reply published to patient review feed.');
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxDrugName.trim()) return;

    const newRx: IssuedPrescription = {
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: rxPatientName,
      drugName: rxDrugName,
      dosage: rxDosage,
      frequency: rxFrequency,
      duration: rxDuration,
      pharmacy: rxPharmacy,
      date: 'Just now',
      status: 'Received by Patient App',
    };

    setIssuedPrescriptions([newRx, ...issuedPrescriptions]);
    setIsPrescriptionModalOpen(false);
    triggerFeedback(`Official E-Prescription ${newRx.id} generated and signed with MDCN cryptographic stamp.`);
  };

  // Up Next Appointment in Schedule
  const nextAppt = TODAY_CONSULTATIONS.find(c => c.status === 'in_progress' || c.status === 'waiting') || TODAY_CONSULTATIONS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>

      {/* Toast Notification Banner */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 36, zIndex: 9999,
          background: '#0f6e6e', color: '#ffffff', padding: '14px 22px', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontSize: 13.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeIn 200ms'
        }}>
          <CheckCircle2 size={18} color="#5eead4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ── TOP DOCTOR CLINICAL HEADER ────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Doctor Avatar */}
          <div style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            border: '3px solid #ccfbf1',
            boxShadow: '0 4px 14px rgba(15,110,110,0.22)',
            flexShrink: 0
          }}>
            FA
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Dr. Folake Ademola
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#e6f4f4',
                color: '#0f6e6e',
                fontSize: 11.5,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid #ccfbf1'
              }}>
                <ShieldCheck size={14} color="#0f6e6e" />
                MDCN Verified Physician
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Cardiology Specialist · General Medical Practitioner</span>
              <span>•</span>
              <span>OmniPulse Heart Center (Lagos)</span>
              <span>•</span>
              <span>Folio: <strong style={{ color: '#0f6e6e', fontFamily: 'monospace' }}>LIC-98754-C3</strong></span>
            </p>
          </div>
        </div>

        {/* Telehealth Status Toggle & Action Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setIsDoctorOnline(!isDoctorOnline);
              triggerFeedback(isDoctorOnline ? 'Switched to Offline mode. No incoming queue alerts.' : 'Online for Teleconsults! Now receiving live patient queue calls.');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDoctorOnline ? '#ecfdf5' : '#f1f5f9',
              color: isDoctorOnline ? '#059669' : '#64748b',
              border: `1.5px solid ${isDoctorOnline ? '#a7f3d0' : '#cbd5e1'}`,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 150ms'
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isDoctorOnline ? '#10b981' : '#94a3b8',
              boxShadow: isDoctorOnline ? '0 0 8px #10b981' : 'none'
            }} />
            {isDoctorOnline ? 'Online for Telehealth' : 'Offline / Away'}
          </button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Clock size={14} />}
            onClick={() => handleTabChange('schedule')}
          >
            Manage Hours
          </Button>

          <Button
            variant="teal"
            size="sm"
            leftIcon={<Pill size={14} />}
            onClick={() => setIsPrescriptionModalOpen(true)}
          >
            Issue E-Prescription
          </Button>
        </div>
      </div>

      {/* ── SUB-TABS NAVIGATION (Landscape Bar) ────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 6,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 2,
        overflowX: 'auto',
      }}>
        {[
          { key: 'dashboard', label: 'Clinical Dashboard', icon: Activity },
          { key: 'appointments', label: 'Appointments Queue', icon: Calendar },
          { key: 'patients', label: 'Patients & Body Map', icon: Users },
          { key: 'prescriptions', label: 'Digital Prescriptions', icon: Pill },
          { key: 'schedule', label: 'Duty Shifts & Hours', icon: Clock },
          { key: 'reviews', label: 'Patient Reviews', icon: Star },
          { key: 'profile', label: 'Doctor Profile & MDCN', icon: Stethoscope },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isSelected ? '3px solid #0f6e6e' : '3px solid transparent',
                background: isSelected ? '#f0fdfa' : 'transparent',
                color: isSelected ? '#0f6e6e' : '#64748b',
                fontWeight: isSelected ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 120ms'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CLINICAL DASHBOARD (Matches App DoctorDashboardScreen)       */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* ── Immediate Attention Banner (Next Patient in Queue) ─────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
            border: '1.5px solid #ccfbf1',
            borderRadius: 16,
            padding: '24px 26px',
            boxShadow: '0 4px 20px rgba(15,110,110,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#0f6e6e',
                  boxShadow: '0 0 10px #0f6e6e',
                  animation: 'pulse 1.8s infinite'
                }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  Needs Your Attention Right Now
                </h3>
              </div>
              <span style={{
                background: '#e6f4f4',
                color: '#0f6e6e',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 999
              }}>
                {TODAY_CONSULTATIONS.length} Consultations Today
              </span>
            </div>

            {nextAppt ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 18,
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {nextAppt.patientName.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        background: '#e6f4f4',
                        color: '#0f6e6e',
                        fontSize: 10.5,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '3px 8px',
                        borderRadius: 6
                      }}>
                        UP NEXT IN SCHEDULE
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f6e6e' }}>
                        {nextAppt.time}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: '4px 0 2px' }}>
                      {nextAppt.patientName} ({nextAppt.patientAge}y · {nextAppt.patientGender})
                    </h4>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                      Reason: <strong>{nextAppt.reason}</strong>
                    </p>
                  </div>
                </div>

                {/* 1-Tap Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setActiveVideoConsult(nextAppt)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#0f6e6e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15,110,110,0.25)',
                      transition: 'transform 120ms'
                    }}
                  >
                    <Video size={16} />
                    Start Video Consultation
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChartPatient(nextAppt);
                      if (nextAppt.painRegion) {
                        setSelectedBodyRegion(nextAppt.painRegion.region);
                        setPainIntensity(nextAppt.painRegion.severity);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#ffffff',
                      color: '#0f6e6e',
                      border: '1.5px solid #0f6e6e',
                      borderRadius: 10,
                      padding: '9px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 120ms'
                    }}
                  >
                    <Activity size={16} />
                    Chart & Body Map
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: '30px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Waiting Room Clear</h4>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  No patients currently queued for immediate consultation.
                </p>
              </div>
            )}
          </div>

          {/* ── Quick Clinical Action Bar ──────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14
          }}>
            <button
              type="button"
              onClick={() => setIsPrescriptionModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 150ms'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#e6f4f4',
                color: '#0f6e6e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Pill size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>Issue E-Prescription</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Fast Rx with automated drug checks</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('schedule')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 150ms'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Hours & Slots</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Configure duty shifts & availability</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            <button
              type="button"
              onClick={() => {
                handleTabChange('schedule');
                setIsEditingFees(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 150ms'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <DollarSign size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>Tiered Consultation Rates</p>
                <p style={{ fontSize: 12, color: '#059669', margin: '2px 0 0', fontWeight: 600 }}>Chat ₦8k · Voice ₦10k · Video ₦15k</p>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>
          </div>

          {/* ── Clinical KPIs Summary (4 Compact Cards) ────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16
          }}>
            {[
              { label: "Today's Appts", value: '8 Scheduled', color: '#0f6e6e', bg: '#e6f4f4', icon: Calendar },
              { label: 'Attended Visits', value: '5 Completed', color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
              { label: 'Total Patients', value: '142 Active', color: '#2563eb', bg: '#eff6ff', icon: Users },
              { label: 'Weekly Revenue', value: '₦125,000', color: '#d97706', bg: '#fffbeb', icon: DollarSign },
            ].map((stat, idx) => (
              <Card key={idx} style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 4px' }}>{stat.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: stat.color, margin: 0, letterSpacing: '-0.02em' }}>{stat.value}</p>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0
                }}>
                  <stat.icon size={22} />
                </div>
              </Card>
            ))}
          </div>

          {/* ── 2-Column Split: Today's Patient Schedule (Left) & Clinical Tools (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.15fr', gap: 20 }}>

            {/* LEFT: Today's Patient Schedule */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Today's Patient Schedule
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                    Real-time clinical queue & consult intake
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange('appointments')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0f6e6e',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  View Full Calendar <ChevronRight size={14} />
                </button>
              </div>

              {/* Patient Queue Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TODAY_CONSULTATIONS.map((item) => {
                  const isCurNext = item.id === nextAppt?.id;
                  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
                    in_progress: { bg: '#e0f2fe', color: '#0369a1', label: 'IN PROGRESS' },
                    waiting: { bg: '#fffbeb', color: '#b45309', label: 'WAITING' },
                    completed: { bg: '#ecfdf5', color: '#059669', label: 'COMPLETED' },
                    cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'CANCELLED' },
                  };
                  const st = statusColors[item.status] || statusColors.waiting;

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: isCurNext ? '#f0fdfa' : '#f8fafc',
                        border: `1px solid ${isCurNext ? '#a7f3d0' : '#e2e8f0'}`,
                        gap: 14,
                        transition: 'background 120ms'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          background: '#0f6e6e',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {item.patientName.split(' ').map(n => n[0]).join('')}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h5 style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                              {item.patientName}
                            </h5>
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>
                              ({item.patientAge}y · {item.bloodGroup} · {item.genotype})
                            </span>
                          </div>
                          <p style={{
                            fontSize: 12, color: '#64748b', margin: '2px 0 0',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f6e6e', display: 'block' }}>
                            {item.time}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: st.bg,
                            color: st.color,
                            display: 'inline-block'
                          }}>
                            {st.label}
                          </span>
                        </div>

                        {/* Quick action triggers */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setActiveVideoConsult(item)}
                            title="Start Video Consultation"
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: '#0f6e6e',
                              color: '#ffffff',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Video size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveChartPatient(item);
                              if (item.painRegion) {
                                setSelectedBodyRegion(item.painRegion.region);
                                setPainIntensity(item.painRegion.severity);
                              }
                            }}
                            title="Inspect Body Map & Chart"
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: '#ffffff',
                              color: '#0f6e6e',
                              border: '1px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Activity size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Clinical Tools & Practice Management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Tools Box */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="#0f6e6e" />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Clinical Tools & Practice Management
                  </h3>
                </div>

                {/* Practice & Consultations */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                    Practice & Consultations
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setIsPrescriptionModalOpen(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e6f4f4', color: '#0f6e6e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Pill size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>Digital E-Prescription</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Interaction & allergy safety engine</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange('schedule')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>Working Hours & Shifts</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Availability & slot duration</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>
                  </div>
                </div>

                {/* Patient Care & Records */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                    Patient Care & Records
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleTabChange('patients')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>All Patients & Body Maps</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Full clinical dossier & pain zones</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/blood-donors')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                        cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Droplet size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', margin: 0 }}>Hospital Blood Bank Network</p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '1px 0 0' }}>Emergency transfusions & appeals</p>
                      </div>
                      <ChevronRight size={14} color="#94a3b8" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware & Encryption Status Card */}
              <div style={{
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: 14,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={15} color="#5eead4" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>Encrypted WebRTC Station</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 999 }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: '#94a3b8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Video & Mic Hardware:</span>
                    <strong style={{ color: '#f1f5f9' }}>1080p HD Ready</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>NDPA 2023 Compliance:</span>
                    <strong style={{ color: '#10b981' }}>Verified Vault</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>MDCN Digital Escrow:</span>
                    <strong style={{ color: '#5eead4' }}>90% Payout Hold</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: APPOINTMENTS QUEUE (Matches AppointmentsScreen.tsx)          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Clinical Appointment Calendar & Schedule
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Manage upcoming consultations, video triage rooms, and completed patient sessions
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="teal"
                size="sm"
                leftIcon={<Calendar size={14} />}
                onClick={() => triggerFeedback('Syncing with Google Calendar & Apple iCal...')}
              >
                Sync Calendar
              </Button>
            </div>
          </div>

          {/* Appointments Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {TODAY_CONSULTATIONS.map((c) => (
              <Card key={c.id} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: '#0f6e6e', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                    }}>
                      {c.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', margin: 0 }}>{c.patientName}</h4>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                        {c.patientAge}y · {c.patientGender} · {c.bloodGroup} {c.genotype}
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: c.status === 'completed' ? '#ecfdf5' : '#fffbeb',
                    color: c.status === 'completed' ? '#059669' : '#b45309'
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, fontSize: 12.5, color: '#334155' }}>
                  <strong>Consult Reason:</strong> {c.reason}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
                  <span>Time: <strong>{c.time}</strong></span>
                  <span>Type: <strong style={{ textTransform: 'capitalize' }}>{c.type} Call</strong></span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Button
                    variant="teal"
                    size="sm"
                    style={{ width: '100%' }}
                    leftIcon={<Video size={14} />}
                    onClick={() => setActiveVideoConsult(c)}
                  >
                    Start Consult
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ width: '100%' }}
                    leftIcon={<Activity size={14} />}
                    onClick={() => {
                      setActiveChartPatient(c);
                      if (c.painRegion) {
                        setSelectedBodyRegion(c.painRegion.region);
                        setPainIntensity(c.painRegion.severity);
                      }
                    }}
                  >
                    Body Map & Vitals
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: PATIENTS & BODY MAP (Matches PatientDetailScreen.tsx)        */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'patients' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>

          {/* Patients Directory List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Patients Directory ({TODAY_CONSULTATIONS.length})
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                Click a patient to inspect 3D Anatomical Body Map & EHR
              </p>

              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="Search patient name, MRN, phone..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TODAY_CONSULTATIONS.map((pt) => {
                const isSelected = activeChartPatient?.id === pt.id;
                return (
                  <div
                    key={pt.id}
                    onClick={() => {
                      setActiveChartPatient(pt);
                      if (pt.painRegion) {
                        setSelectedBodyRegion(pt.painRegion.region);
                        setPainIntensity(pt.painRegion.severity);
                      }
                    }}
                    style={{
                      background: isSelected ? '#f0fdfa' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#0f6e6e' : '#e2e8f0'}`,
                      borderRadius: 14,
                      padding: '16px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      boxShadow: isSelected ? '0 4px 14px rgba(15,110,110,0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'all 150ms'
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: isSelected ? '#0f6e6e' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {pt.patientName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>{pt.patientName}</h4>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e' }}>{pt.bloodGroup} ({pt.genotype})</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                        {pt.patientAge}y · {pt.patientGender} · Last Visit: {pt.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Details & 3D Anatomical Body Map Inspector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {activeChartPatient ? (
              <>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '22px 24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {activeChartPatient.patientName}
                        </h3>
                        <Badge variant="teal" size="sm">Active Patient Record</Badge>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                        MRN: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>MRN-{activeChartPatient.id.toUpperCase()}</span> · {activeChartPatient.patientAge} yrs old · {activeChartPatient.patientGender}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="teal"
                        size="sm"
                        leftIcon={<Video size={14} />}
                        onClick={() => setActiveVideoConsult(activeChartPatient)}
                      >
                        Start Consult
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Pill size={14} />}
                        onClick={() => {
                          setRxPatientName(`${activeChartPatient.patientName} (${activeChartPatient.patientAge}y · ${activeChartPatient.patientGender})`);
                          setIsPrescriptionModalOpen(true);
                        }}
                      >
                        Prescribe Rx
                      </Button>
                    </div>
                  </div>

                  {/* Vitals Summary Strip */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 10,
                    marginTop: 18,
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Blood Pressure</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.bp}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Heart Rate</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.hr}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Temp</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.temp}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>SpO2 Pulse</span>
                      <strong style={{ fontSize: 13, color: '#059669' }}>{activeChartPatient.vitals.spo2}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Weight</span>
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{activeChartPatient.vitals.weight}</strong>
                    </div>
                  </div>
                </div>

                {/* Interactive Body Map */}
                <AnatomicalBodyMap
                  activeRegion={selectedBodyRegion}
                  onSelectRegion={(reg) => {
                    setSelectedBodyRegion(reg);
                    triggerFeedback(`Selected ${reg} region for clinical inspection.`);
                  }}
                  severity={painIntensity}
                  onSelectSeverity={(val) => {
                    setPainIntensity(val);
                    triggerFeedback(`Updated ${selectedBodyRegion} pain intensity to ${val}/10.`);
                  }}
                />

                {/* Clinical Notes & Allergies */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '20px 22px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Clinical History & Allergy Warnings
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {activeChartPatient.allergies.map((alg, idx) => (
                      <span key={idx} style={{
                        background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5
                      }}>
                        <AlertTriangle size={13} />
                        Allergy: {alg}
                      </span>
                    ))}
                  </div>

                  <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    <strong>Medical History:</strong> {activeChartPatient.history}
                  </p>
                </div>
              </>
            ) : (
              <div style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '60px 30px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <Users size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Select a Patient Record</h4>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Click any patient on the left to view their 3D Anatomical Body Map and medical chart.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: DIGITAL PRESCRIPTIONS (Matches PrescriptionScreen.tsx)       */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Digital E-Prescriptions & Clinical Dispensary
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Legally signed with MDCN cryptographic stamp · Transmitted to accredited pharmacies
              </p>
            </div>

            <Button
              variant="teal"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsPrescriptionModalOpen(true)}
            >
              Issue New Prescription
            </Button>
          </div>

          {/* Issued Prescriptions Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Rx Number</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Patient</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Medication & Dosage</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Duration</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Routed Pharmacy</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {issuedPrescriptions.map((rx) => (
                  <tr key={rx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f6e6e', fontFamily: 'monospace' }}>
                      {rx.id}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1e293b' }}>
                      {rx.patientName}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <strong style={{ color: '#0f172a' }}>{rx.drugName}</strong>
                      <span style={{ display: 'block', fontSize: 11.5, color: '#64748b' }}>{rx.dosage} · {rx.frequency}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{rx.duration}</td>
                    <td style={{ padding: '14px 20px', color: '#475569' }}>{rx.pharmacy}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: '#ecfdf5',
                        color: '#059669'
                      }}>
                        {rx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: DUTY SHIFTS & HOURS (Matches DoctorAvailabilityScreen.tsx)   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 24 }}>

          {/* Weekly Schedule Days */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 26px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Weekly Clinical Availability & Consultation Slots
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                Configure working shifts for digital teleconsultations and physical appointments
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scheduleSlots.map((slot, idx) => (
                <div
                  key={slot.day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: slot.active ? '#ffffff' : '#f8fafc',
                    border: `1px solid ${slot.active ? '#ccfbf1' : '#e2e8f0'}`,
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      type="checkbox"
                      checked={slot.active}
                      onChange={() => {
                        const updated = [...scheduleSlots];
                        updated[idx].active = !updated[idx].active;
                        setScheduleSlots(updated);
                        triggerFeedback(`Updated availability for ${slot.day}.`);
                      }}
                      style={{ width: 18, height: 18, accentColor: '#0f6e6e', cursor: 'pointer' }}
                    />
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: slot.active ? '#0f172a' : '#94a3b8', margin: 0 }}>
                        {slot.day}
                      </h4>
                      <span style={{ fontSize: 12, color: slot.active ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                        {slot.active ? `${slot.start} - ${slot.end} (${slot.slots} slots)` : 'Off Duty'}
                      </span>
                    </div>
                  </div>

                  {slot.active && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Shift:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e', background: '#e6f4f4', padding: '4px 8px', borderRadius: 6 }}>
                        {slot.start} - {slot.end}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Slot Duration & Tiered Fees Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Consultation Duration */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '22px 24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Default Slot Duration
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['15 mins', '30 mins', '45 mins', '60 mins'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setSlotDuration(dur);
                      triggerFeedback(`Consultation duration set to ${dur}.`);
                    }}
                    style={{
                      padding: '10px 0',
                      borderRadius: 8,
                      border: slotDuration === dur ? '2px solid #0f6e6e' : '1px solid #cbd5e1',
                      background: slotDuration === dur ? '#e6f4f4' : '#ffffff',
                      color: slotDuration === dur ? '#0f6e6e' : '#475569',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer'
                    }}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiered Consultation Fees */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '22px 24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Tiered Consultation Fees (Doctor Set)
                </h4>
                <Badge variant="teal" size="sm">90% Payout</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Chat Consultation Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={feeChat}
                    onChange={(e) => setFeeChat(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Voice Call Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={feeVoice}
                    onChange={(e) => setFeeVoice(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    HD Video Telehealth Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={feeVideo}
                    onChange={(e) => setFeeVideo(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <Button
                  variant="teal"
                  style={{ width: '100%' }}
                  onClick={() => triggerFeedback('Updated tiered consultation fees. Patients will now see these rates.')}
                >
                  Save Fee Schedule
                </Button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 6: PATIENT REVIEWS & REPLIES                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Verified Patient Reviews & Clinical Feedback
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                4.9 / 5.0 Average Rating across 84 verified telehealth and in-clinic consultations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {patientReviews.map((rev) => (
              <Card key={rev.id} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#1e293b', margin: 0 }}>{rev.patientName}</h4>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Consultation Date: {rev.date}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < rev.rating ? '#eab308' : 'none'}
                        color={i < rev.rating ? '#eab308' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  "{rev.comment}"
                </p>

                {/* Doctor reply */}
                {rev.doctorReply ? (
                  <div style={{
                    background: '#f0fdfa',
                    borderLeft: '3px solid #0f6e6e',
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: 12.5,
                    color: '#0f6e6e'
                  }}>
                    <strong>Dr. Folake Ademola (Reply):</strong> {rev.doctorReply}
                  </div>
                ) : (
                  <div>
                    {replyingReviewId === rev.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write official doctor response to patient..."
                          rows={2}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button size="sm" variant="teal" onClick={() => handlePostDoctorReply(rev.id)}>
                            Publish Reply
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setReplyingReviewId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<MessageSquare size={14} />}
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                      >
                        Reply to Patient
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* TAB 7: DOCTOR PROFILE & MDCN (Matches DoctorProfileScreen.tsx)      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>

          {/* Left: MDCN Verification Status Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '24px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 14
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: '#0f6e6e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                border: '4px solid #ccfbf1'
              }}>
                FA
              </div>

              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Dr. Folake Ademola
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Cardiologist & General Medical Practitioner
                </p>
              </div>

              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 10,
                padding: '10px 16px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  MDCN Standing
                </span>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#065f46', margin: '2px 0 0' }}>
                  Fully Verified & Licensed
                </p>
                <span style={{ fontSize: 11, color: '#059669', display: 'block' }}>
                  Folio: LIC-98754-C3 (Exp: Dec 2027)
                </span>
              </div>
            </div>

            {/* Verification Documents Checklist */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Verified Credentials Vault
              </h4>

              {[
                { name: 'MDCN Practicing License', status: 'Approved' },
                { name: 'NIN National Identity', status: 'Approved' },
                { name: 'Fellowship / Specialty Certificate', status: 'Approved' },
                { name: 'Hospital Privileges Letter', status: 'Approved' },
              ].map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                  <span style={{ color: '#334155' }}>{doc.name}</span>
                  <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Bio & Professional Affiliations Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Professional Biography & Clinic Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Clinical Biography
                </label>
                <textarea
                  rows={4}
                  defaultValue="Dr. Folake Ademola is a board-certified cardiologist with over 12 years of clinical experience specializing in interventional cardiology, hypertension management, and preventive cardiac care across top tertiary centers."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, lineHeight: 1.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Primary Specialty
                  </label>
                  <input
                    type="text"
                    defaultValue="Cardiology / Internal Medicine"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Affiliated Hospital
                  </label>
                  <input
                    type="text"
                    defaultValue="OmniPulse Heart Center, Victoria Island, Lagos"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Degrees & Fellowships
                </label>
                <input
                  type="text"
                  defaultValue="MBBS (Lagos), FMCP (Cardiology), FWACS, FESC"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <Button
                variant="teal"
                onClick={() => triggerFeedback('Doctor profile details successfully saved and updated in the patient search directory.')}
              >
                Save Profile Changes
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: HD VIDEO TELEHEALTH CONSULTATION STATION                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeVideoConsult && (
        <Modal
          isOpen={true}
          onClose={() => setActiveVideoConsult(null)}
          title={`Encrypted HD Teleconsultation — ${activeVideoConsult.patientName}`}
          subtitle={`Vitals stream & live clinical consultation · Room ID: ROOM-${activeVideoConsult.id}`}
          size="xl"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

            {/* Video Call Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                position: 'relative',
                height: 380,
                background: '#090d16',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #334155'
              }}>
                {/* Patient Video Simulation */}
                {!isVideoDisabled ? (
                  <div style={{ textAlign: 'center', color: '#ffffff' }}>
                    <div style={{
                      width: 90, height: 90, borderRadius: '50%', background: '#1e293b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                      fontSize: 32, fontWeight: 800, border: '3px solid #0f6e6e'
                    }}>
                      {activeVideoConsult.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{activeVideoConsult.patientName}</h4>
                    <span style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      Encrypted Live 1080p WebRTC Feed
                    </span>
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                    <VideoOff size={44} style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0 }}>Camera Video Feed Paused</p>
                  </div>
                )}

                {/* Local Doctor PIP Preview */}
                <div style={{
                  position: 'absolute',
                  right: 16,
                  bottom: 16,
                  width: 120,
                  height: 90,
                  background: '#1e293b',
                  borderRadius: 10,
                  border: '2px solid #0f6e6e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  You (Dr. Folake)
                </div>

                {/* Live Vitals HUD */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  color: '#ffffff',
                  display: 'flex',
                  gap: 12,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <span>BP: <strong>{activeVideoConsult.vitals.bp}</strong></span>
                  <span>HR: <strong>{activeVideoConsult.vitals.hr}</strong></span>
                  <span>SpO2: <strong style={{ color: '#10b981' }}>{activeVideoConsult.vitals.spo2}</strong></span>
                </div>
              </div>

              {/* Call Controls Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 14,
                padding: '12px 20px',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: isMicMuted ? '#fee2e2' : '#ffffff',
                    color: isMicMuted ? '#dc2626' : '#334155',
                    border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoDisabled(!isVideoDisabled)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: isVideoDisabled ? '#fee2e2' : '#ffffff',
                    color: isVideoDisabled ? '#dc2626' : '#334155',
                    border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {isVideoDisabled ? <VideoOff size={18} /> : <Video size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveVideoConsult(null);
                    triggerFeedback(`Consultation for ${activeVideoConsult.patientName} completed successfully.`);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#dc2626', color: '#ffffff', border: 'none',
                    borderRadius: 999, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  <PhoneOff size={16} />
                  End Consultation
                </button>
              </div>
            </div>

            {/* Quick Clinical Notes during Call */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>Chief Complaint</h5>
                <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>{activeVideoConsult.reason}</p>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Consultation Impressions & Plan
                </label>
                <textarea
                  rows={6}
                  placeholder="Record subjective observations, assessment, and treatment instructions..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                />
              </div>

              <Button
                variant="teal"
                style={{ width: '100%' }}
                leftIcon={<Pill size={14} />}
                onClick={() => {
                  setRxPatientName(`${activeVideoConsult.patientName} (${activeVideoConsult.patientAge}y · ${activeVideoConsult.patientGender})`);
                  setIsPrescriptionModalOpen(true);
                }}
              >
                Fast Issue Prescription
              </Button>
            </div>

          </div>
        </Modal>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: DIGITAL E-PRESCRIPTION CREATOR                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isPrescriptionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPrescriptionModalOpen(false)}
          title="Create & Issue Digital E-Prescription"
          subtitle="Signed with MDCN Doctor Folio LIC-98754-C3"
          size="lg"
        >
          <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Safety Alert Box */}
            <div style={{
              background: '#f0fdfa', border: '1px solid #a7f3d0', borderRadius: 10,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#065f46'
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>Automated Allergy & Drug Interaction Safety Scanner Active</span>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Select Patient
              </label>
              <select
                value={rxPatientName}
                onChange={(e) => setRxPatientName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                {TODAY_CONSULTATIONS.map(c => (
                  <option key={c.id} value={`${c.patientName} (${c.patientAge}y · ${c.patientGender})`}>
                    {c.patientName} ({c.patientAge}y · {c.patientGender})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Medication Name & Strength
                </label>
                <input
                  type="text"
                  value={rxDrugName}
                  onChange={(e) => setRxDrugName(e.target.value)}
                  placeholder="e.g. Amlodipine Besylate 5mg"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Dosage Instructions
                </label>
                <input
                  type="text"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  placeholder="e.g. 1 Tablet daily"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Frequency
                </label>
                <select
                  value={rxFrequency}
                  onChange={(e) => setRxFrequency(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Once daily (QD)">Once daily (QD)</option>
                  <option value="Twice daily (BID)">Twice daily (BID)</option>
                  <option value="Three times daily (TID)">Three times daily (TID)</option>
                  <option value="At bedtime (QHS)">At bedtime (QHS)</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Duration
                </label>
                <select
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="5 days">5 days</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Fulfillment Pharmacy
              </label>
              <select
                value={rxPharmacy}
                onChange={(e) => setRxPharmacy(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                <option value="Pharmacare Pharmacy Ikeja">Pharmacare Pharmacy Ikeja</option>
                <option value="MedPlus Pharmacy Victoria Island">MedPlus Pharmacy Victoria Island</option>
                <option value="HealthPlus Pharmacy Lekki">HealthPlus Pharmacy Lekki</option>
                <option value="Patient Pick-up / Direct App Forwarding">Patient Pick-up / Direct App Forwarding</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button variant="secondary" onClick={() => setIsPrescriptionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" leftIcon={<Pill size={14} />}>
                Authorize & Sign Prescription
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#0f6e6e' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <DoctorPortalContent />
    </Suspense>
  );
}
