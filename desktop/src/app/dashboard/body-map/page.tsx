'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowLeft, Heart, Droplet, User, Calendar, Clock,
  Video, Pill, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  Sliders, Info, FileText, Sparkles, RefreshCw, Lock, ShieldAlert
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ThreeBodyMap } from '@/components/clinical/ThreeBodyMap';
import { useAuthStore } from '@/store/authStore';

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  bloodGroup: string;
  genotype: string;
  chiefComplaint: string;
  painRegion: string;
  painSeverity: number;
  duration: string;
  lastBp: string;
  lastHr: string;
  lastSpo2: string;
  lastGlucose: string;
  allergies: string[];
  recentPrescriptions: string[];
  clinicalNotes: string;
}

const PATIENTS: PatientRecord[] = [
  {
    id: 'pat-101',
    name: 'Chioma Egwu',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O+',
    genotype: 'AA',
    chiefComplaint: 'Substernal chest tightness radiating to left shoulder and dyspnea after exertion.',
    painRegion: 'Chest',
    painSeverity: 8,
    duration: '3 days',
    lastBp: '148/92 mmHg',
    lastHr: '88 bpm',
    lastSpo2: '98%',
    lastGlucose: '104 mg/dL',
    allergies: ['Penicillin', 'Sulfa drugs'],
    recentPrescriptions: ['Amlodipine Besylate 5mg daily', 'Aspirin 75mg daily'],
    clinicalNotes: 'ECG shows sinus rhythm with mild non-specific ST-T changes. Cardiac enzyme panel requested. Recommended 24h ambulatory BP monitoring.',
  },
  {
    id: 'pat-102',
    name: 'Chukwuma Okoro',
    age: 34,
    gender: 'Male',
    bloodGroup: 'A+',
    genotype: 'AS',
    chiefComplaint: 'Severe epigastric pain, acid reflux, postprandial burning sensation, and nausea.',
    painRegion: 'Abdomen',
    painSeverity: 6,
    duration: '1 week',
    lastBp: '122/80 mmHg',
    lastHr: '74 bpm',
    lastSpo2: '99%',
    lastGlucose: '96 mg/dL',
    allergies: ['None known'],
    recentPrescriptions: ['Omeprazole 20mg BID', 'Antacid Suspension PRN'],
    clinicalNotes: 'Clinical picture consistent with acute peptic ulcer flare. Stool H. pylori antigen test ordered. Advised avoidance of NSAIDs and spicy irritants.',
  },
  {
    id: 'pat-103',
    name: 'Tunde Afolabi',
    age: 48,
    gender: 'Male',
    bloodGroup: 'O-',
    genotype: 'AA',
    chiefComplaint: 'Chronic bilateral lumbar back pain, radiculopathy to right gluteal region, stiffness in morning.',
    painRegion: 'Spine',
    painSeverity: 7,
    duration: '2 months',
    lastBp: '135/85 mmHg',
    lastHr: '78 bpm',
    lastSpo2: '97%',
    lastGlucose: '112 mg/dL',
    allergies: ['NSAIDs (causes bronchospasm)'],
    recentPrescriptions: ['Pregabalin 75mg nocte', 'Paracetamol 1g TDS'],
    clinicalNotes: 'Lumbar spine MRI scheduled for L4-L5 disc protrusion evaluation. Physiotherapy referral active.',
  },
  {
    id: 'pat-104',
    name: 'Aisha Okonkwo',
    age: 22,
    gender: 'Female',
    bloodGroup: 'B+',
    genotype: 'SS',
    chiefComplaint: 'Bilateral knee and tibia bone pain characteristic of sickle cell vaso-occlusive crisis.',
    painRegion: 'Lower Limbs',
    painSeverity: 9,
    duration: '12 hours',
    lastBp: '115/70 mmHg',
    lastHr: '96 bpm',
    lastSpo2: '96%',
    lastGlucose: '92 mg/dL',
    allergies: ['Ciprofloxacin'],
    recentPrescriptions: ['Hydroxyurea 500mg daily', 'Folic Acid 5mg daily', 'Tramadol 50mg PRN'],
    clinicalNotes: 'Vaso-occlusive pain crisis. Immediate aggressive oral hydration (3L/day) initiated. Warned against cold exposure or ice packs. Monitor for Acute Chest Syndrome.',
  },
  {
    id: 'pat-105',
    name: 'Ibrahim Danladi',
    age: 52,
    gender: 'Male',
    bloodGroup: 'O+',
    genotype: 'AA',
    chiefComplaint: 'Throbbing frontal headaches, visual aura, and neck stiffness associated with elevated BP.',
    painRegion: 'Head',
    painSeverity: 7,
    duration: '4 days',
    lastBp: '162/100 mmHg',
    lastHr: '82 bpm',
    lastSpo2: '98%',
    lastGlucose: '135 mg/dL',
    allergies: ['None known'],
    recentPrescriptions: ['Lisinopril 10mg daily', 'Hydrochlorothiazide 12.5mg daily'],
    clinicalNotes: 'Stage 2 Hypertension with hypertensive cephalea. Urinalysis and serum creatinine ordered to rule out nephropathy.',
  },
];

const BODY_REGIONS = [
  { id: 'Head', label: 'Head & Cranium', top: '10%', left: '46%', color: '#3b82f6', desc: 'Cephalea, migraine, visual aura, dizziness, ENT' },
  { id: 'Chest', label: 'Chest & Precordium', top: '27%', left: '44%', color: '#ef4444', desc: 'Angina, dyspnea, palpitations, pleuritic pain' },
  { id: 'Abdomen', label: 'Abdomen & GI', top: '40%', left: '45%', color: '#f97316', desc: 'Epigastric, RUQ/RLQ pain, gastritis, appendicitis' },
  { id: 'Pelvis', label: 'Pelvis & Groin', top: '50%', left: '46%', color: '#8b5cf6', desc: 'Renal colic, pelvic inflammatory disease, hernia' },
  { id: 'Spine', label: 'Vertebral Spine & Back', top: '35%', left: '57%', color: '#0ea5e9', desc: 'Lumbar radiculopathy, disc herniation, cervical strain' },
  { id: 'Upper Limbs', label: 'Upper Limbs & Arms', top: '32%', left: '26%', color: '#10b981', desc: 'Brachial pain, shoulder impingement, joint edema' },
  { id: 'Lower Limbs', label: 'Lower Limbs & Knees', top: '70%', left: '45%', color: '#f59e0b', desc: 'Vaso-occlusive bone pain, DVT, arthritis, tibia trauma' },
];

export default function BodyMapPage() {
  const router = useRouter();
  const { admin } = useAuthStore();

  // ── Medical Privacy & NDPA Barrier: Platform Admins cannot inspect clinical body maps
  if (admin?.role === 'admin') {
    return (
      <div style={{
        maxWidth: 780,
        margin: '60px auto',
        background: '#ffffff',
        borderRadius: 20,
        padding: '40px 44px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626'
        }}>
          <Lock size={36} />
        </div>

        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '4px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 12
          }}>
            <ShieldAlert size={14} />
            MEDICAL CONFIDENTIALITY & NDPA COMPLIANCE PROTOCOL
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            Clinical Records Restricted from Platform Admin
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6, maxWidth: 620 }}>
            Under the Nigeria Data Protection Act (NDPA 2023) Section 30 and medical confidentiality ethics, 3D anatomical body maps, symptom severity markers, diagnostic ECG notes, and patient clinical charts are privileged health records strictly restricted to attending physicians and hospital medical staff.
          </p>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '18px 22px',
          textAlign: 'left',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          fontSize: 13,
          color: '#334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <CheckCircle2 size={16} color="#0f6e6e" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong>Authorized Clinical Access Only:</strong> Only licensed attending doctors and hospital clinical staff can inspect patient anatomical body maps and treatment notes.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <CheckCircle2 size={16} color="#0f6e6e" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong>Platform Administrator Boundary:</strong> Platform Super-Admins are strictly limited to hospital accreditation, doctor credential verification, and financial billing audits.</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push('/dashboard/hospitals')}
          >
            Return to Hospital Governance
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/dashboard/doctors')}
          >
            Doctor Credentials Directory
          </Button>
        </div>
      </div>
    );
  }

  const [selectedPatientId, setSelectedPatientId] = useState('pat-101');
  const patient = PATIENTS.find((p) => p.id === selectedPatientId) || PATIENTS[0];

  const [activeRegion, setActiveRegion] = useState(patient.painRegion);
  const [severity, setSeverity] = useState(patient.painSeverity);
  const [viewAngle, setViewAngle] = useState<'anterior' | 'posterior'>('anterior');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const currentRegionMeta = BODY_REGIONS.find((r) => r.id === activeRegion) || BODY_REGIONS[0];

  const getSeverityLabel = (val: number) => {
    if (val <= 3) return { text: 'Mild (1-3)', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    if (val <= 6) return { text: 'Moderate (4-6)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    return { text: 'Severe / Critical (7-10)', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  };

  const severityBadge = getSeverityLabel(severity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 36,
            zIndex: 99999,
            background: '#0f6e6e',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={16} style={{ color: '#5eead4' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/doctor-portal?tab=patients')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            title="Back to Doctor Portal"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#e6f4f4',
                  color: '#0f6e6e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={20} />
              </div>
              <h1 className="page-title">3D Anatomical Body Map & Clinical Chart Studio</h1>
            </div>
            <p className="page-subtitle">
              Interactive clinical triage mannequin, anatomical pain mapping, and real-time patient vitals chart.
            </p>
          </div>
        </div>

        {/* Patient Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', padding: '6px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <User size={16} style={{ color: '#0f6e6e' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Select Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedPatientId(newId);
              const found = PATIENTS.find((p) => p.id === newId);
              if (found) {
                setActiveRegion(found.painRegion);
                setSeverity(found.painSeverity);
              }
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.age}y · {p.gender} · {p.painRegion})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Body Map Canvas + Patient Clinical Records */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* ── LEFT COLUMN: 3D ANATOMICAL BODY MAP ──────────────────────────── */}
        <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* True 3D Anatomical Mannequin Studio */}
          <ThreeBodyMap
            activeRegion={activeRegion}
            onSelectRegion={setActiveRegion}
            severity={severity}
            onSelectSeverity={setSeverity}
            height={440}
          />

          {/* Pain Severity Rating Slider */}
          <div style={{ background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={16} style={{ color: '#0f6e6e' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Clinical Pain Severity Scale (1–10)
                </span>
              </div>
              <span
                style={{
                  background: severityBadge.bg,
                  color: severityBadge.color,
                  border: `1px solid ${severityBadge.border}`,
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {severity}/10 · {severityBadge.text}
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: severityBadge.color }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              <span>1 - Mild Discomfort</span>
              <span>5 - Moderate Distress</span>
              <span>10 - Intractable Excruciating</span>
            </div>
          </div>

          {/* Anatomical Regions Quick Picker */}
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>
              Quick Select Anatomical Zone:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BODY_REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRegion(r.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: activeRegion === r.id ? '#0f6e6e' : '#f8fafc',
                    color: activeRegion === r.id ? '#ffffff' : '#334155',
                    border: `1px solid ${activeRegion === r.id ? '#0f6e6e' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    transition: 'all 120ms',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeRegion === r.id ? '#ffffff' : r.color }} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ── RIGHT COLUMN: PATIENT CLINICAL EHR & VITALS ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Patient Card */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  {patient.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                    {patient.name}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                    {patient.age}y · {patient.gender} · Blood Group: <strong>{patient.bloodGroup}</strong> ({patient.genotype})
                  </p>
                </div>
              </div>

              <Badge variant="info">Verified Patient</Badge>
            </div>

            {/* Vitals Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: 12, fontWeight: 700 }}>
                  <Heart size={14} /> Blood Pressure
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {patient.lastBp}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0284c7', fontSize: 12, fontWeight: 700 }}>
                  <Activity size={14} /> Heart Rate
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {patient.lastHr}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 12, fontWeight: 700 }}>
                  <Droplet size={14} /> Blood Oxygen (SpO2)
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {patient.lastSpo2}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontSize: 12, fontWeight: 700 }}>
                  <Droplet size={14} /> Blood Glucose
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {patient.lastGlucose}
                </div>
              </div>
            </div>

            {/* Chief Complaint */}
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', marginBottom: 4 }}>
                Active Patient Symptom Log
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#991b1b', lineHeight: 1.4 }}>
                "{patient.chiefComplaint}"
              </p>
            </div>

            {/* Known Allergies */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
                Reported Drug Allergies:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {patient.allergies.map((alg, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#fff1f2',
                      color: '#e11d48',
                      border: '1px solid #fecdd3',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <AlertTriangle size={12} /> {alg}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
                Active Digital Prescriptions:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {patient.recentPrescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: 12.5,
                      color: '#334155',
                      background: '#f8fafc',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Pill size={13} style={{ color: '#0f6e6e' }} />
                    <span>{rx}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Clinical Actions & Teleconsultation Launcher */}
          <Card style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Immediate Clinical Operations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button
                variant="teal"
                style={{ width: '100%' }}
                leftIcon={<Video size={16} />}
                onClick={() => {
                  router.push(`/dashboard/doctor-portal?tab=appointments&launchCall=${patient.id}`);
                }}
              >
                Launch HD Teleconsultation Studio
              </Button>

              <Button
                variant="outline"
                style={{ width: '100%' }}
                leftIcon={<Pill size={16} />}
                onClick={() => {
                  router.push(`/dashboard/doctor-portal?tab=prescriptions&patientName=${encodeURIComponent(patient.name)}`);
                }}
              >
                Draft Digital E-Prescription
              </Button>

              <Button
                variant="secondary"
                style={{ width: '100%' }}
                leftIcon={<FileText size={16} />}
                onClick={() => showToast(`Clinical observations recorded for ${patient.name}.`)}
              >
                Save Mannequin Pain Mapping to EHR
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
