'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Stethoscope, Calendar, Clock, Users, FileText, Pill,
  FlaskConical, CheckCircle2, AlertCircle, Plus, Search,
  Send, Eye, Edit3, Award, MapPin, DollarSign, UserCheck, Shield, Star, MessageSquare,
  Smartphone, Download, Video, Phone, Radio, Activity, Fingerprint, Lock, ExternalLink, Droplet, Sparkles, Bot
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

// ── Google Play & Apple App Store Badge Buttons Component ───────────────────

function AppStoreButtons({ onAppClick, compact = false }: { onAppClick?: (platform: string) => void; compact?: boolean }) {
  const handlePlayStore = () => {
    if (onAppClick) onAppClick('Google Play Store');
    window.open('https://play.google.com/store/apps', '_blank');
  };

  const handleAppStore = () => {
    if (onAppClick) onAppClick('Apple App Store');
    window.open('https://apps.apple.com/app', '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Google Play Button */}
      <button
        type="button"
        onClick={handlePlayStore}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          background: '#000000', color: '#ffffff', border: '1px solid #334155',
          borderRadius: 10, padding: compact ? '7px 12px' : '9px 16px', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 150ms, background 150ms',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.transform = 'none'; }}
      >
        <svg width="20" height="22" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M47.2 24.2C44.4 27.1 42.8 31.7 42.8 37.7V474.3C42.8 480.3 44.4 484.9 47.2 487.8L48.6 489.1L285.8 252V246L48.6 8.8L47.2 24.2Z" fill="#00D2FF" />
          <path d="M365 331.2L285.8 252V246L365 166.8L366.5 167.7L460.3 221C487.1 236.2 487.1 261.8 460.3 277L366.5 330.3L365 331.2Z" fill="#FFC900" />
          <path d="M366.5 330.3L285.8 249L47.2 487.8C56 497.1 70.3 498.3 86.6 489.1L366.5 330.3Z" fill="#FF3333" />
          <path d="M366.5 167.7L86.6 8.9C70.3-0.3 56 0.9 47.2 10.2L285.8 249L366.5 167.7Z" fill="#00E676" />
        </svg>
        <div>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', display: 'block', fontWeight: 600 }}>Get it on</span>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff', lineHeight: 1.1 }}>Google Play</span>
        </div>
      </button>

      {/* Apple App Store Button */}
      <button
        type="button"
        onClick={handleAppStore}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          background: '#000000', color: '#ffffff', border: '1px solid #334155',
          borderRadius: 10, padding: compact ? '7px 12px' : '9px 16px', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 150ms, background 150ms',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.transform = 'none'; }}
      >
        <svg width="20" height="22" viewBox="0 0 384 512" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 31.9 112.5c15.4 22.3 35.3 47.7 59.9 47 23.7-.7 33.2-15 61.6-15 28.1 0 36.7 15 61.1 14.3 25-.7 42.1-22.7 57.3-45 17.6-25.5 24.8-50.2 25.1-51.5-.6-.5-48.4-18.6-48.7-67.1zM289.4 86.8c16.3-19.8 27.6-47.4 24.3-75.1-23.7 1-52.6 15.8-69.4 35.5-14.8 17.1-27.9 45.3-24.3 72.3 26.3 2 53.1-13 69.4-32.7z" />
        </svg>
        <div>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', display: 'block', fontWeight: 600 }}>Download on the</span>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff', lineHeight: 1.1 }}>App Store</span>
        </div>
      </button>
    </div>
  );
}

// ── Types & Initial Mock Data ────────────────────────────────────────────────

interface PatientReview {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
  doctorReply?: string;
}

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

interface Consultation {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  time: string;
  type: 'video' | 'in_person' | 'phone';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  reason: string;
  vitals: { bp: string; hr: string; temp: string; weight: string };
  history: string;
}

const TODAY_CONSULTATIONS: Consultation[] = [
  {
    id: 'c-101',
    patientName: 'Mariam Oladosu',
    patientAge: 34,
    patientGender: 'Female',
    time: '09:00 AM',
    type: 'video',
    status: 'completed',
    reason: 'Follow-up on hypertension medication & chest tightness',
    vitals: { bp: '128/82 mmHg', hr: '74 bpm', temp: '36.6 °C', weight: '68 kg' },
    history: 'Hypertension (2 yrs), Mild Asthma. Allergic to Penicillin.',
  },
  {
    id: 'c-102',
    patientName: 'Tunde Afolabi',
    patientAge: 48,
    patientGender: 'Male',
    time: '10:30 AM',
    type: 'in_person',
    status: 'in_progress',
    reason: 'Routine cardiac risk evaluation & lipid profile review',
    vitals: { bp: '135/88 mmHg', hr: '80 bpm', temp: '36.8 °C', weight: '84 kg' },
    history: 'High Cholesterol, Type 2 Diabetes (managed with Metformin).',
  },
  {
    id: 'c-103',
    patientName: 'Grace Eze',
    patientAge: 29,
    patientGender: 'Female',
    time: '02:00 PM',
    type: 'video',
    status: 'waiting',
    reason: 'Palpitations during exercise & fatigue',
    vitals: { bp: '118/75 mmHg', hr: '88 bpm', temp: '36.5 °C', weight: '59 kg' },
    history: 'No prior surgeries. Family history of arrhythmia.',
  },
  {
    id: 'c-104',
    patientName: 'Robert Okafor',
    patientAge: 56,
    patientGender: 'Male',
    time: '04:30 PM',
    type: 'phone',
    status: 'waiting',
    reason: 'Medication refill consultation for Amlodipine 5mg',
    vitals: { bp: '130/84 mmHg', hr: '72 bpm', temp: '36.7 °C', weight: '91 kg' },
    history: 'Essential Hypertension, Hyperlipidemia.',
  },
];

interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: string;
  genotype: string;
  city: string;
  phone: string;
  status: string;
  distance: string;
}

const MOCK_BLOOD_DONORS: BloodDonor[] = [
  { id: 'bd-1', name: 'Samuel Okon', bloodGroup: 'O-', genotype: 'AA', city: 'Ikeja, Lagos', phone: '+234 802 345 6789', status: 'Available', distance: '1.2 km' },
  { id: 'bd-2', name: 'Grace Nwosu', bloodGroup: 'O+', genotype: 'AA', city: 'Victoria Island, Lagos', phone: '+234 803 987 6543', status: 'Available', distance: '3.8 km' },
  { id: 'bd-4', name: 'Kemi Fatimah', bloodGroup: 'B+', genotype: 'AA', city: 'Surulere, Lagos', phone: '+234 809 111 2233', status: 'On-Call', distance: '6.1 km' },
  { id: 'bd-6', name: 'Chinedu Eze', bloodGroup: 'O-', genotype: 'AA', city: 'Maitama, Abuja', phone: '+234 805 777 8899', status: 'Available', distance: '2.1 km' },
];

function DoctorPortalContent() {
  const { admin } = useAuthStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') || 'queue';

  // Mobile Lock App Modal state
  const [lockedFeatureModal, setLockedFeatureModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    icon: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
    icon: Smartphone,
  });

  const triggerMobileAppLock = (title: string, description: string, icon = Smartphone) => {
    setLockedFeatureModal({
      isOpen: true,
      title,
      description,
      icon,
    });
  };

  useEffect(() => {
    if (tabParam === 'app-locked') {
      triggerMobileAppLock(
        'Live HD Telehealth Video Calls & Biometric Station',
        'Full encrypted WebRTC HD video consultations, real-time push notification alerts, and biometric fingerprint Rx signing require the OmniPulse Doctor App.',
        Video
      );
    }
  }, [tabParam]);

  const activeTab = tabParam === 'app-locked' ? 'queue' : tabParam;

  // Active Consultation Modal
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');

  // Prescription Form
  const [rxPatientName, setRxPatientName] = useState('Kelechi Amadi (34y · Male)');
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('Twice daily (BID)');
  const [rxDuration, setRxDuration] = useState('7 days');
  const [rxPharmacy, setRxPharmacy] = useState('Pharmacare Pharmacy Ikeja');
  const [issuedPrescriptions, setIssuedPrescriptions] = useState([
    {
      id: 'RX-9081',
      patientName: 'Kelechi Amadi (34y · Male)',
      drugName: 'Amlodipine Besylate 5mg',
      dosage: '1 Tablet by mouth daily',
      frequency: 'Once daily (QD)',
      duration: '30 days',
      pharmacy: 'Pharmacare Pharmacy Ikeja',
      date: 'Today, 09:15 AM',
      status: 'Received by Patient App'
    },
    {
      id: 'RX-8942',
      patientName: 'Bisi Akande (42y · Female)',
      drugName: 'Atorvastatin Calcium 20mg',
      dosage: '1 Tablet at bedtime',
      frequency: 'Once daily (QD)',
      duration: '14 days',
      pharmacy: 'MedPlus Pharmacy Victoria Island',
      date: 'Yesterday, 02:40 PM',
      status: 'Received by Patient App'
    }
  ]);

  // Lab Order Form
  const [labTestName, setLabTestName] = useState('');
  const [labPriority, setLabPriority] = useState<'routine' | 'urgent'>('routine');

  // AI Assistant Query state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Doctor Bio, Fee & Feedback Toast state
  const [doctorBio, setDoctorBio] = useState('Dr. Folake Ademola is a board-certified cardiologist with over 12 years of clinical experience specializing in interventional cardiology, heart failure management, and preventive cardiac care.');
  const [consultFee, setConsultFee] = useState(15000);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Patient Reviews State
  const [patientReviews, setPatientReviews] = useState<PatientReview[]>(INITIAL_PATIENT_REVIEWS);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostDoctorReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setPatientReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, doctorReply: replyText.trim() } : r)
    );
    setReplyingId(null);
    setReplyText('');
    triggerFeedback('Official doctor reply posted to patient review feed.');
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleStartConsultation = (consult: Consultation) => {
    setSelectedConsult(consult);
    setSoapSubjective(consult.reason);
    setSoapObjective(`Vitals: BP ${consult.vitals.bp}, HR ${consult.vitals.hr}, Temp ${consult.vitals.temp}, Weight ${consult.vitals.weight}`);
    setSoapAssessment('Hypertension follow-up / Cardiac evaluation');
    setSoapPlan('Continue current medication regimen. Re-evaluate in 30 days.');
  };

  const handleCompleteConsultation = () => {
    if (!selectedConsult) return;
    triggerFeedback(`Consultation for ${selectedConsult.patientName} completed and clinical record saved.`);
    setSelectedConsult(null);
  };

  const handleRunAiAnalysis = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    setTimeout(() => {
      setAiLoading(false);
      setAiResponse(`Differential Clinical Insight for "${aiQuery}":\n1. Essential Hypertension Exacerbation (High Probability - 78%)\n2. Cardiac Arrhythmia / Atrial Fibrillation (Moderate Probability - 42%)\n3. Anxiety-induced Tachypnea & Sympathetic Surge (35%)\n\nRecommended Action: Order 12-lead ECG, Troponin I level, and Lipid Profile. Review current Amlodipine dosage.`);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Toast Notification Banner */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed', top: 80, right: 36, zIndex: 100,
          background: '#0f6e6e', color: '#ffffff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)', fontSize: 13.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn 200ms'
        }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ── Doctor Header ─────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8e8', borderRadius: 16, padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%', background: '#0f6e6e', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700,
            border: '2.5px solid #ccfbf1', boxShadow: '0 4px 10px rgba(15,110,110,0.2)'
          }}>
            FA
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
                Dr. Folake Ademola
              </h1>
              <Badge variant="teal" size="sm">MDCN Verified Doctor</Badge>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Cardiology Specialist · OmniPulse Heart Center (Lagos) · License: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f6e6e' }}>LIC-98754-C3</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />} onClick={() => window.location.href = '/dashboard/doctor-portal?tab=schedule'}>
            Schedule
          </Button>
          <Button variant="teal" size="sm" leftIcon={<Stethoscope size={14} />} onClick={() => window.location.href = '/dashboard/doctor-portal?tab=queue'}>
            Patient Queue
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        {[
          { label: "Today's Consultations", value: '8 Scheduled', color: '#0f6e6e', bg: '#e6f4f4', icon: Calendar },
          { label: 'Completed Visits', value: '5 Completed', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 },
          { label: 'Patients Waiting', value: '3 Waiting', color: '#d97706', bg: '#fffbeb', icon: Clock },
          { label: 'Consultation Fee', value: `₦${consultFee.toLocaleString()}`, color: '#2563eb', bg: '#eff6ff', icon: DollarSign },
        ].map((stat, idx) => (
          <Card key={idx} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: stat.color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{stat.value}</p>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: stat.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0
            }}>
              <stat.icon size={20} />
            </div>
          </Card>
        ))}
      </div>


      {/* ── TAB 1: APPOINTMENT OVERSIGHT (CONSULTATIONS QUEUE) ─────── */}
      {activeTab === 'queue' && (
        <AppointmentOversight
          consultations={TODAY_CONSULTATIONS}
          onStartConsultation={handleStartConsultation}
          onMobileAppLock={triggerMobileAppLock}
        />
      )}

      {/* ── TAB 2: SOAP CLINICAL NOTES ────────────────────────────── */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
            borderRadius: 20, padding: '22px 28px',
            boxShadow: '0 8px 24px rgba(15,110,110,0.18)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>SOAP Medical Notes & Clinical Records</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>NDPA-compliant subjective, objective, assessment, and treatment plans</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: '#ffffff', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>
              Encrypted Audit Vault
            </span>
          </div>

          {/* MVP Notice: Voice-to-SOAP frozen */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 14, padding: '14px 18px',
          }}>
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              <Smartphone size={16} style={{ color: '#b45309' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 3 }}>
                Voice-to-SOAP Generator — Coming in Phase 2
              </p>
              <p style={{ fontSize: 12.5, color: '#b45309', lineHeight: 1.6 }}>
                Ambient AI voice transcription (Deepgram Nova-2 Medical) is frozen for MVP due to API latency,
                cost per call, and poor recognition of regional accents and medical slang.
                Use the structured text fields below to record your SOAP notes — they are saved to the
                NDPA-compliant encrypted audit vault exactly as voice notes would be.
              </p>
            </div>
          </div>

          {/* SOAP Notes Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TODAY_CONSULTATIONS.map((c, idx) => (
              <div
                key={c.id}
                style={{
                  background: '#ffffff', border: '1px solid #e8eef4',
                  borderRadius: 18, padding: '22px 26px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'box-shadow 150ms'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: '#eff6ff',
                      color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 15, border: '1.5px solid #dbeafe'
                    }}>
                      {c.patientName[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{c.patientName}</h4>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.time} · Medical History: {c.history}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, background: '#f0fdfa', color: '#0f6e6e', border: '1px solid #99f6e4', padding: '4px 10px', borderRadius: 999 }}>
                    Record Ref: #{c.id}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>[S] Subjective (Chief Complaint)</p>
                    <p style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>{c.reason}</p>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>[O] Objective Vitals</p>
                    <p style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>BP: {c.vitals.bp} | HR: {c.vitals.hr} | Temp: {c.vitals.temp} | Wt: {c.vitals.weight}</p>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>[A] Assessment</p>
                    <p style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>Primary Evaluation: Essential Cardiac Follow-up</p>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>[P] Treatment Plan</p>
                    <p style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>Continue prescribed regimen. Re-evaluate in 30 days.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: DIGITAL E-PRESCRIPTIONS ────────────────────────── */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f6e6e 100%)',
            borderRadius: 20, padding: '22px 28px',
            boxShadow: '0 8px 24px rgba(13,148,136,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Digital E-Prescription Dispatch</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>Issue digitally signed e-prescriptions directly to patient mobile app & partner pharmacy</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: '#ffffff', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>
              Direct App & Pharmacy Dispatch
            </span>
          </div>

          {/* Form Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e8eef4', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Create & Issue New E-Prescription</h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!rxDrugName.trim() || !rxDosage.trim()) return;
                const newRx = {
                  id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
                  patientName: rxPatientName,
                  drugName: rxDrugName,
                  dosage: rxDosage,
                  frequency: rxFrequency,
                  duration: rxDuration,
                  pharmacy: rxPharmacy,
                  date: 'Just now',
                  status: 'Received by Patient App'
                };
                setIssuedPrescriptions([newRx, ...issuedPrescriptions]);
                triggerFeedback(`E-Prescription #${newRx.id} for ${rxDrugName} issued to ${rxPatientName} & sent to patient app!`);
                setRxDrugName('');
                setRxDosage('');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Patient Selector */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Target Patient (Receives Prescription in App) *
                </label>
                <select
                  className="input"
                  style={{ borderRadius: 12, padding: '10px 14px', width: '100%', fontWeight: 600 }}
                  value={rxPatientName}
                  onChange={(e) => setRxPatientName(e.target.value)}
                >
                  <option value="Kelechi Amadi (34y · Male)">Kelechi Amadi (34y · Male) — Ref: #c-101</option>
                  <option value="Bisi Akande (42y · Female)">Bisi Akande (42y · Female) — Ref: #c-102</option>
                  <option value="Emeka Okafor (58y · Male)">Emeka Okafor (58y · Male) — Ref: #c-103</option>
                  <option value="Amina Yusuf (29y · Female)">Amina Yusuf (29y · Female) — Ref: #c-104</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Medication Name & Strength *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amlodipine Besylate 5mg"
                    className="input"
                    style={{ borderRadius: 12, padding: '10px 14px' }}
                    value={rxDrugName}
                    onChange={(e) => setRxDrugName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Dosage & Route *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Tablet by mouth daily"
                    className="input"
                    style={{ borderRadius: 12, padding: '10px 14px' }}
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Frequency</label>
                  <select className="input" style={{ borderRadius: 12, padding: '10px 14px' }} value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)}>
                    <option>Once daily (QD)</option>
                    <option>Twice daily (BID)</option>
                    <option>Three times daily (TID)</option>
                    <option>As needed (PRN)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Duration</label>
                  <select className="input" style={{ borderRadius: 12, padding: '10px 14px' }} value={rxDuration} onChange={(e) => setRxDuration(e.target.value)}>
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                    <option>90 days</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button type="submit" variant="teal" leftIcon={<Send size={14} />}>
                  Issue & Send E-Prescription
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={<Fingerprint size={14} />}
                  onClick={() => triggerMobileAppLock(
                    'Biometric Fingerprint Prescription Authorization',
                    'High-security biometric signature authorization requires the Touch ID / Fingerprint sensor on the OmniPulse Doctor App.',
                    Fingerprint
                  )}
                >
                  Sign with Biometrics (App Only)
                </Button>
              </div>
            </form>
          </div>

          {/* Issued Prescriptions Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e8eef4', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Dispatched E-Prescriptions</h4>
                <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>Sent directly to patient's OmniPulse mobile app</p>
              </div>
              <Badge variant="teal" size="sm">{issuedPrescriptions.length} Total Issued</Badge>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 650 }}>
                    <th style={{ padding: '12px 16px' }}>Rx Ref</th>
                    <th style={{ padding: '12px 16px' }}>Patient</th>
                    <th style={{ padding: '12px 16px' }}>Medication & Dosage</th>
                    <th style={{ padding: '12px 16px' }}>Issued Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedPrescriptions.map((rx) => (
                    <tr key={rx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f6e6e' }}>{rx.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{rx.patientName}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: 13, fontWeight: 650, color: '#0f172a' }}>{rx.drugName}</p>
                        <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{rx.dosage} ({rx.frequency}) · {rx.duration}</p>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{rx.date}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 999 }}>
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: BLOOD DONOR NETWORK (BLOCKED — APP ONLY) ─────────── */}
      {activeTab === 'blood' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #450a0a 100%)',
            borderRadius: 20, padding: '32px 28px',
            boxShadow: '0 8px 30px rgba(127,29,29,0.25)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16,
            color: '#ffffff'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Droplet size={32} style={{ color: '#fca5a5' }} />
            </div>

            <div>
              <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 999 }}>
                Mobile Exclusive Feature
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginTop: 8 }}>
                Blood Donor Network & SOS Emergency Broadcast
              </h3>
              <p style={{ fontSize: 13.5, color: '#fca5a5', marginTop: 6, maxWidth: 540, lineHeight: 1.6 }}>
                GPS proximity blood donor discovery, AA genotype verification, and emergency blood push alerts are exclusive to the OmniPulse Mobile App to protect donor privacy and safety.
              </p>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '16px 20px', textAlign: 'left', maxWidth: 520, width: '100%'
            }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                🩸 Why is Blood Donor Network mobile-only?
              </p>
              <ul style={{ fontSize: 12, color: '#fecaca', paddingLeft: 18, margin: 0, lineHeight: 1.6 }}>
                <li>Real-time background GPS proximity matching with active AA donors</li>
                <li>Instant mobile SOS push notifications for urgent blood transfusion calls</li>
                <li>Strict regulatory policy compliance against non-clinical blood monetization</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 6 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff' }}>
                Download the OmniPulse Doctor App to access Blood Donor Network:
              </p>
              <AppStoreButtons onAppClick={(platform) => triggerFeedback(`Redirecting to ${platform}...`)} />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: AI CLINICAL ASSISTANT & SYMPTOM SUMMARY ───────── */}
      {activeTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #7c3aed 100%)',
            borderRadius: 20, padding: '22px 28px',
            boxShadow: '0 8px 24px rgba(109,40,217,0.22)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>AI Clinical Assistant & Differential Diagnosis</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>AI-powered symptom evaluation, clinical history summarization & drug interaction checks</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: '#ffffff', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>
              OmniAI Engine v2.4
            </span>
          </div>

          {/* AI Case Input Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e8eef4', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Enter Patient Symptoms or Clinical Case Summary *
                </label>
                <textarea
                  className="input"
                  style={{ height: 100, padding: 14, fontFamily: 'inherit', fontSize: 13.5, borderRadius: 12, lineHeight: 1.5 }}
                  placeholder="e.g. 48-year-old male with sudden onset retrosternal chest pain, radiating to jaw, diaphoresis, BP 145/90..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                />
              </div>

              <Button
                variant="teal"
                leftIcon={<Sparkles size={15} />}
                onClick={handleRunAiAnalysis}
                disabled={aiLoading}
                style={{ alignSelf: 'flex-start', borderRadius: 12, padding: '10px 20px', fontSize: 13.5 }}
              >
                {aiLoading ? 'Analyzing Case with OmniAI...' : 'Generate AI Differential Diagnosis'}
              </Button>

              {aiResponse && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                  border: '1px solid #99f6e4', borderRadius: 16, padding: 20,
                  marginTop: 4, boxShadow: '0 4px 16px rgba(15,110,110,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#0f6e6e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={18} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0f6e6e' }}>OmniAI Clinical Recommendation</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: '#134e4a', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: WEEKLY CONSULTATION SCHEDULE ────────────────────── */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #0ea5e9 100%)',
            borderRadius: 20, padding: '22px 28px',
            boxShadow: '0 8px 24px rgba(37,99,235,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Weekly Consultation Schedule</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>Configure available days, session hours, and booking time slots</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Active Days', value: '6' },
                { label: 'Daily Slots', value: '4' },
                { label: 'Weekly Hours', value: '48h' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 14px',
                  textAlign: 'center', minWidth: 60
                }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 3 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Day Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {[
              { day: 'Monday', color: '#2563eb', bg: '#eff6ff', border: '#dbeafe', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'], hours: '09:00 AM – 05:00 PM', available: true },
              { day: 'Tuesday', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], hours: '09:00 AM – 05:00 PM', available: true },
              { day: 'Wednesday', color: '#0f6e6e', bg: '#f0fdfa', border: '#99f6e4', slots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'], hours: '10:00 AM – 06:00 PM', available: true },
              { day: 'Thursday', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'], hours: '09:00 AM – 05:00 PM', available: true },
              { day: 'Friday', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', slots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:30 PM'], hours: '09:00 AM – 04:00 PM', available: true },
              { day: 'Saturday', color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', slots: ['10:00 AM', '12:00 PM'], hours: '10:00 AM – 02:00 PM (Half-day)', available: true },
            ].map(({ day, color, bg, border, slots, hours, available }) => (
              <div
                key={day}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8eef4',
                  borderRadius: 18,
                  padding: '20px 22px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 150ms, transform 150ms',
                  display: 'flex', flexDirection: 'column', gap: 14
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Day header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: bg, border: `1.5px solid ${border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Calendar size={18} style={{ color }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{day}</h4>
                      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 1 }}>{slots.length} time slots</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                    background: available ? '#dcfce7' : '#fee2e2',
                    color: available ? '#166534' : '#991b1b'
                  }}>
                    {available ? 'Available' : 'Off'}
                  </span>
                </div>

                {/* Hours bar */}
                <div style={{
                  background: '#f8fafc', border: '1px solid #f1f5f9',
                  borderRadius: 10, padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <Clock size={13} style={{ color: '#64748b', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{hours}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>30 min slots</span>
                </div>

                {/* Time Slot Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {slots.map((slot, si) => (
                    <span
                      key={slot}
                      style={{
                        fontSize: 11.5, fontWeight: 600,
                        padding: '5px 11px', borderRadius: 999,
                        background: si === 0 ? bg : '#f8fafc',
                        border: `1px solid ${si === 0 ? border : '#e2e8f0'}`,
                        color: si === 0 ? color : '#475569',
                        transition: 'background 120ms'
                      }}
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sunday — Off Card */}
          <div style={{
            background: '#f8fafc', border: '1.5px dashed #e2e8f0',
            borderRadius: 18, padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>Sunday</h4>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>No consultations scheduled — Rest day</p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#fee2e2', color: '#991b1b' }}>Day Off</span>
          </div>

        </div>
      )}

      {/* ── TAB 8: PATIENT RATINGS & FEEDBACKS ───────────────────────── */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Hero Rating Summary Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            borderRadius: 20, padding: '24px 28px',
            border: '1px solid #fde68a',
            boxShadow: '0 4px 20px rgba(251,191,36,0.12)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#92400e', letterSpacing: '-0.02em' }}>Patient Feedbacks & Verified Ratings</h3>
              <p style={{ fontSize: 13, color: '#b45309', marginTop: 3 }}>Verified reviews from real consultations · Reply to patient feedback below</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                  <Star size={28} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  <span style={{ fontSize: 34, fontWeight: 900, color: '#92400e', letterSpacing: '-0.04em', lineHeight: 1 }}>4.9</span>
                </div>
                <p style={{ fontSize: 11.5, color: '#b45309', fontWeight: 600, marginTop: 4 }}>{patientReviews.length} Verified Reviews</p>
              </div>
              <div style={{ width: 1, height: 48, background: '#fde68a' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[5, 4, 3].map(star => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#b45309', fontWeight: 700, width: 10 }}>{star}</span>
                    <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <div style={{ width: 60, height: 5, background: '#fde68a', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#f59e0b', borderRadius: 999, width: star === 5 ? '88%' : star === 4 ? '10%' : '2%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {patientReviews.map((rev, idx) => (
              <div key={rev.id} style={{
                background: '#ffffff',
                border: '1px solid #e8eef4',
                borderRadius: 18,
                padding: '20px 22px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 12,
                transition: 'box-shadow 150ms',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; }}
              >
                {/* Review header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 14,
                      background: idx % 3 === 0 ? '#eff6ff' : idx % 3 === 1 ? '#fdf4ff' : '#f0fdf4',
                      border: `2px solid ${idx % 3 === 0 ? '#dbeafe' : idx % 3 === 1 ? '#e9d5ff' : '#bbf7d0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 16,
                      color: idx % 3 === 0 ? '#2563eb' : idx % 3 === 1 ? '#9333ea' : '#16a34a'
                    }}>
                      {rev.patientName[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{rev.patientName}</h4>
                      <span style={{ fontSize: 11.5, color: '#94a3b8', background: '#f8fafc', padding: '2px 8px', borderRadius: 999 }}>Submitted {rev.date}</span>
                    </div>
                  </div>
                  {/* Star rating pill */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: '#fffbeb', border: '1px solid #fde68a',
                    padding: '5px 12px', borderRadius: 999
                  }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    ))}
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginLeft: 3 }}>{rev.rating}.0</span>
                  </div>
                </div>

                {/* Comment */}
                <div style={{
                  background: '#f8fafc', borderRadius: 12, padding: '12px 16px',
                  border: '1px solid #f1f5f9'
                }}>
                  <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Doctor Response or Reply UI */}
                {rev.doctorReply ? (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px',
                    display: 'flex', gap: 10
                  }}>
                    <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>Official Doctor Response</p>
                      <p style={{ fontSize: 13, color: '#15803d', lineHeight: 1.5 }}>{rev.doctorReply}</p>
                    </div>
                  </div>
                ) : replyingId === rev.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                      className="input"
                      placeholder="Write your official response to this patient..."
                      style={{ height: 70, padding: 10, fontSize: 13, borderRadius: 12 }}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => setReplyingId(null)}>Cancel</Button>
                      <Button variant="teal" size="sm" leftIcon={<Send size={12} />} onClick={() => handlePostDoctorReply(rev.id)}>Post Response</Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outline" size="sm" leftIcon={<MessageSquare size={12} />} onClick={() => { setReplyingId(rev.id); setReplyText(''); }}>
                      Reply to Patient
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 9: DOCTOR PROFILE & CREDENTIALS ───────────────────── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 50%, #0891b2 100%)',
            borderRadius: 20, padding: '28px 32px',
            boxShadow: '0 8px 30px rgba(15,110,110,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'rgba(255,255,255,0.15)', border: '2.5px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 900, color: '#ffffff'
              }}>FA</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 4 }}>Dr. Folake Ademola</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>Cardiologist</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>MDCN Verified</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.15)', color: '#ffffff', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>12 Yrs Experience</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Edit3 size={13} />} onClick={() => setIsBioEditing(!isBioEditing)}
              style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
            >
              {isBioEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>

          {/* Credentials Info Chips Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { icon: Award, label: 'License ID', value: 'LIC-98754-C3', color: '#0f6e6e', bg: '#f0fdfa' },
              { icon: MapPin, label: 'Practice Facility', value: 'OmniPulse Heart Center, Lagos', color: '#2563eb', bg: '#eff6ff' },
              { icon: Shield, label: 'Regulatory Body', value: 'MDCN — Nigeria', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: DollarSign, label: 'Consultation Fee', value: `₦${consultFee.toLocaleString()} / Session`, color: '#16a34a', bg: '#f0fdf4' },
              { icon: UserCheck, label: 'Specialisation', value: 'Interventional Cardiology', color: '#ea580c', bg: '#fff7ed' },
              { icon: Star, label: 'Patient Rating', value: '4.9 / 5.0 (Verified)', color: '#d97706', bg: '#fffbeb' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} style={{
                background: '#ffffff', border: '1px solid #e8eef4', borderRadius: 16,
                padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'box-shadow 150ms'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Professional Bio Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e8eef4', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Professional Biography</h4>
                <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>Displayed to patients on your OmniPulse public profile</p>
              </div>
            </div>
            {isBioEditing ? (
              <textarea
                className="input"
                style={{ height: 110, padding: 14, fontFamily: 'inherit', fontSize: 13.5, borderRadius: 12, lineHeight: 1.6 }}
                value={doctorBio}
                onChange={(e) => setDoctorBio(e.target.value)}
              />
            ) : (
              <div style={{
                background: '#f8fafc', padding: '16px 20px', borderRadius: 14, border: '1px solid #f1f5f9',
                borderLeft: '4px solid #0f6e6e'
              }}>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>{doctorBio}</p>
              </div>
            )}
          </div>

          {/* Consultation Fee Edit Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e8eef4', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Consultation Fee</h4>
            <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 16 }}>Set the fee patients pay per consultation session</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Fee Amount (NGN)</label>
                <input type="number" disabled={!isBioEditing} className="input" value={consultFee} onChange={(e) => setConsultFee(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Primary Practice Facility</label>
                <input type="text" disabled className="input" value="OmniPulse Heart Center (Lagos)" />
              </div>
            </div>
            {isBioEditing && (
              <div style={{ marginTop: 16 }}>
                <Button variant="teal" leftIcon={<CheckCircle2 size={14} />} onClick={() => { setIsBioEditing(false); triggerFeedback('Profile bio & consultation fee updated successfully.'); }}>
                  Save Profile Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DESKTOP MEDICAL CONSULTATION WORKSTATION MODAL ───────── */}
      {selectedConsult && (
        <Modal
          isOpen={!!selectedConsult}
          onClose={() => setSelectedConsult(null)}
          title={`Clinical Workstation — ${selectedConsult.patientName}`}
          subtitle={`Consultation Time: ${selectedConsult.time} · Type: ${selectedConsult.type.replace('_', ' ')}`}
          size="xl"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>NDPA Audit Session ID: #{selectedConsult.id}</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setSelectedConsult(null)}>Cancel</Button>
                <Button variant="teal" leftIcon={<CheckCircle2 size={14} />} onClick={handleCompleteConsultation}>
                  Complete Consultation & Save SOAP Note
                </Button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Patient Header Banner */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#166534' }}>{selectedConsult.patientName} ({selectedConsult.patientAge}y · {selectedConsult.patientGender})</h4>
                <p style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>Medical History: {selectedConsult.history}</p>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '4px 10px', borderRadius: 6 }}>
                Vitals: BP {selectedConsult.vitals.bp} | HR {selectedConsult.vitals.hr}
              </div>
            </div>

            {/* SOAP Note Editor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  [S] Subjective (History of Present Illness)
                </label>
                <textarea
                  className="input"
                  style={{ height: 90, padding: 10, fontSize: 13 }}
                  value={soapSubjective}
                  onChange={(e) => setSoapSubjective(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  [O] Objective (Physical Exam & Vitals)
                </label>
                <textarea
                  className="input"
                  style={{ height: 90, padding: 10, fontSize: 13 }}
                  value={soapObjective}
                  onChange={(e) => setSoapObjective(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  [A] Assessment (Clinical Diagnosis)
                </label>
                <textarea
                  className="input"
                  style={{ height: 90, padding: 10, fontSize: 13 }}
                  value={soapAssessment}
                  onChange={(e) => setSoapAssessment(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  [P] Plan (Therapy & Medications)
                </label>
                <textarea
                  className="input"
                  style={{ height: 90, padding: 10, fontSize: 13 }}
                  value={soapPlan}
                  onChange={(e) => setSoapPlan(e.target.value)}
                />
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* ── MOBILE APP EXCLUSIVE FEATURE LOCK MODAL ───────────────── */}
      {lockedFeatureModal.isOpen && (
        <Modal
          isOpen={lockedFeatureModal.isOpen}
          onClose={() => setLockedFeatureModal(prev => ({ ...prev, isOpen: false }))}
          title="OmniPulse Doctor App Required"
          subtitle="This feature is exclusive to the OmniPulse Doctor Mobile Application"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: '10px 0' }}>

            {/* Feature Lock Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', color: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #bfdbfe'
            }}>
              <lockedFeatureModal.icon size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                {lockedFeatureModal.title}
              </h3>
              <p style={{ fontSize: 13.5, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>
                {lockedFeatureModal.description}
              </p>
            </div>

            {/* Explanation box */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14,
              textAlign: 'left', width: '100%'
            }}>
              <p style={{ fontSize: 12, fontWeight: 650, color: '#334155', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={14} style={{ color: '#2563eb' }} />
                Why do I need the Mobile App?
              </p>
              <ul style={{ fontSize: 12, color: '#64748b', paddingLeft: 18, margin: 0, lineHeight: 1.6 }}>
                <li>Encrypted WebRTC video & microphone hardware access</li>
                <li>Instant push notifications for emergency blood SOS alerts</li>
                <li>Touch ID / Biometric fingerprint authorization for digital Rx signing</li>
                <li>Bluetooth background vital signs daemon synchronization</li>
              </ul>
            </div>

            {/* App Store Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center', marginTop: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e' }}>
                Click below to download the official Doctor App:
              </p>
              <AppStoreButtons onAppClick={(platform) => triggerFeedback(`Redirecting to ${platform}...`)} />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLockedFeatureModal(prev => ({ ...prev, isOpen: false }))}
              style={{ marginTop: 8 }}
            >
              Continue using Web Portal
            </Button>

          </div>
        </Modal>
      )}

    </div>
  );
}


// ── Appointment Oversight Sub-Component ─────────────────────────────────────

function AppointmentOversight({
  consultations,
  onStartConsultation,
  onMobileAppLock,
}: {
  consultations: Consultation[];
  onStartConsultation: (c: Consultation) => void;
  onMobileAppLock: (title: string, desc: string, icon?: any) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'completed'>('all');

  const filtered = filter === 'all' ? consultations : consultations.filter(c => c.status === filter);
  const counts = {
    all: consultations.length,
    waiting: consultations.filter(c => c.status === 'waiting').length,
    in_progress: consultations.filter(c => c.status === 'in_progress').length,
    completed: consultations.filter(c => c.status === 'completed').length,
  };

  const FILTERS: { key: typeof filter; label: string; color: string; bg: string; border: string }[] = [
    { key: 'all',         label: 'All Patients',  color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' },
    { key: 'waiting',     label: 'Waiting',        color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { key: 'in_progress', label: 'In Progress',    color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
    { key: 'completed',   label: 'Completed',      color: '#166534', bg: '#dcfce7', border: '#86efac' },
  ];

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string; bar: string }> = {
    waiting:     { label: 'Waiting',     color: '#d97706', bg: '#fffbeb', bar: '#f59e0b' },
    in_progress: { label: 'In Progress', color: '#0369a1', bg: '#e0f2fe', bar: '#38bdf8' },
    completed:   { label: 'Completed',   color: '#166534', bg: '#dcfce7', bar: '#22c55e' },
    cancelled:   { label: 'Cancelled',   color: '#dc2626', bg: '#fee2e2', bar: '#ef4444' },
  };

  const TYPE_ICON: Record<string, typeof Video> = {
    video: Video,
    phone: Phone,
    in_person: MapPin,
  };

  const STAT_CARDS = [
    { label: 'Scheduled', value: counts.all, icon: Calendar, accent: '#0f6e6e', bg: '#e6f4f4', border: '#b7e4e0' },
    { label: 'Waiting', value: counts.waiting, icon: Clock, accent: '#d97706', bg: '#fff7ed', border: '#fed7aa' },
    { label: 'Active', value: counts.in_progress, icon: Activity, accent: '#0369a1', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Completed', value: counts.completed, icon: CheckCircle2, accent: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  ];

  const AVATAR_COLORS = [
    { bg: '#eff6ff', border: '#dbeafe', color: '#2563eb' },
    { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
    { bg: '#faf5ff', border: '#ddd6fe', color: '#7c3aed' },
    { bg: '#fff7ed', border: '#fed7aa', color: '#ea580c' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Oversight Summary ─────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 22,
        boxShadow: '0 12px 32px rgba(15,110,110,0.08)', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 62%, #0891b2 100%)',
          padding: '24px 28px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -24, right: -18, width: 128, height: 128, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -34, right: 92, width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Appointment Oversight</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.76)', marginTop: 3 }}>Today’s consultation flow, triage states, and clinical handoff actions.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'SOAP workstation', icon: FileText },
                { label: 'Vital sign review', icon: Activity },
                { label: 'Clinical handoff', icon: Stethoscope },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                  color: '#ffffff', borderRadius: 999, padding: '8px 12px', fontSize: 12.5, fontWeight: 700
                }}>
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: 20, background: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {STAT_CARDS.map(stat => (
              <div key={stat.label} style={{
                background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 18,
                padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
              }}>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: stat.accent, lineHeight: 1 }}>{stat.value}</p>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: '#ffffff', color: stat.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(15,23,42,0.06)'
                }}>
                  <stat.icon size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>
          Filter appointments
        </span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 999, cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              background: filter === f.key ? f.bg : '#ffffff',
              color: filter === f.key ? f.color : '#64748b',
              border: `1.5px solid ${filter === f.key ? f.border : '#e2e8f0'}`,
              transition: 'all 150ms',
              boxShadow: filter === f.key ? `0 2px 8px ${f.border}80` : 'none',
            }}
          >
            {f.label}
            <span style={{
              fontSize: 11, fontWeight: 800, minWidth: 18, height: 18,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: filter === f.key ? f.color : '#e2e8f0',
              color: filter === f.key ? '#ffffff' : '#64748b',
            }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Patient Cards ────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
          <Users size={36} style={{ marginBottom: 10, opacity: 0.35 }} />
          <p style={{ fontSize: 14, fontWeight: 600 }}>No {filter === 'all' ? '' : filter.replace('_', ' ')} appointments</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Check back later or adjust the filter above</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((c, idx) => {
            const av = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const sc = STATUS_CFG[c.status] ?? STATUS_CFG['waiting'];
            return (
              <div
                key={c.id}
                style={{
                  background: '#ffffff', borderRadius: 18,
                  border: '1px solid #e8eef4',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  overflow: 'hidden', position: 'relative',
                  transition: 'box-shadow 160ms, transform 160ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,110,110,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Status accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: sc.bar, borderRadius: '18px 18px 0 0' }} />

                <div style={{ padding: '20px 24px', paddingTop: 22, display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                  {/* Avatar + Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 16,
                      background: av.bg, border: `2px solid ${av.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 20, color: av.color
                    }}>
                      {c.patientName.charAt(0)}
                    </div>
                    <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 10, padding: '4px 10px', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f6e6e', lineHeight: 1 }}>{c.time}</p>
                      <p style={{ fontSize: 9.5, color: '#64748b', fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {(() => {
                          const TypeIcon = TYPE_ICON[c.type] ?? Video;
                          return <TypeIcon size={11} />;
                        })()}
                        <span>{c.type.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 220 }}>
                    {/* Name + badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{c.patientName}</h4>
                      <span style={{ fontSize: 11.5, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 999, fontWeight: 500 }}>
                        {c.patientAge}y · {c.patientGender}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
                        background: sc.bg, color: sc.color, letterSpacing: '0.01em'
                      }}>
                        {sc.label}
                      </span>
                    </div>

                    {/* Chief Complaint */}
                    <p style={{ fontSize: 13, color: '#475569', marginBottom: 10, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>Chief Complaint: </span>{c.reason}
                    </p>

                    {/* Vitals grid */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[
                        { label: 'BP', val: c.vitals.bp },
                        { label: 'HR', val: c.vitals.hr },
                        { label: 'Temp', val: c.vitals.temp },
                        { label: 'Wt', val: c.vitals.weight },
                      ].map(v => (
                        <div key={v.label} style={{
                          display: 'flex', gap: 4, alignItems: 'center',
                          background: '#f8fafc', border: '1px solid #e2e8f0',
                          borderRadius: 10, padding: '4px 10px',
                        }}>
                          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{v.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{v.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                    {c.type === 'video' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Video size={13} />}
                        onClick={() => onMobileAppLock(
                          `HD Video Session — ${c.patientName}`,
                          'Live Encrypted HD Video calls require the OmniPulse Doctor App.',
                          Video
                        )}
                      >
                        Join Video
                      </Button>
                    )}
                    <Button
                      variant={c.status === 'completed' ? 'secondary' : 'teal'}
                      size="sm"
                      leftIcon={<Stethoscope size={13} />}
                      onClick={() => onStartConsultation(c)}
                    >
                      {c.status === 'completed' ? 'Review SOAP' : 'Open Workstation'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Pill size={13} />}
                      onClick={() => window.location.href = '/dashboard/doctor-portal?tab=prescriptions'}
                    >
                      Issue E-Rx
                    </Button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Loading Doctor Workspace...</div>}>
      <DoctorPortalContent />
    </Suspense>
  );
}
