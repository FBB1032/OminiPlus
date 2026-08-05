'use client';

import { useState } from 'react';
import { 
  Stethoscope, Calendar, Clock, Users, FileText, Pill, 
  FlaskConical, CheckCircle2, AlertCircle, Plus, Search, 
  Send, Eye, Edit3, Award, MapPin, DollarSign, UserCheck, Shield, Star, MessageSquare
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

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

// Mock Consultations for Doctor Web Workspace
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

export default function DoctorPortalPage() {
  const { admin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'queue' | 'notes' | 'prescriptions' | 'labs' | 'schedule' | 'reviews' | 'profile'>('queue');
  
  // Active Consultation Modal
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');

  // Prescription Form
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('Twice daily (BID)');
  const [rxDuration, setRxDuration] = useState('7 days');
  const [rxPharmacy, setRxPharmacy] = useState('Pharmacare Pharmacy Ikeja');

  // Lab Order Form
  const [labTestName, setLabTestName] = useState('');
  const [labPriority, setLabPriority] = useState<'routine' | 'urgent'>('routine');

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

      {/* ── Doctor Welcome Header ─────────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8e8', borderRadius: 16, padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#0f6e6e', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700,
            border: '2px solid #ccfbf1'
          }}>
            FA
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
                Dr. Folake Ademola
              </h1>
              <Badge variant="teal" size="sm">Verified Doctor</Badge>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Cardiology Specialist · Omini Pulse Heart Center (Lagos) · License: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>LIC-98754-C3</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />} onClick={() => setActiveTab('schedule')}>
            Manage Schedule
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Stethoscope size={14} />} onClick={() => setActiveTab('queue')}>
            Patient Workspace
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
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

      {/* ── Workspace Tab Bar Navigation ─────────────────────────── */}
      <div style={{
        display: 'flex', gap: 6, borderBottom: '1px solid #e2e8f0', paddingBottom: 2, flexWrap: 'wrap'
      }}>
        {[
          { key: 'queue', label: 'Consultations Queue', icon: Users },
          { key: 'notes', label: 'SOAP Clinical Notes', icon: FileText },
          { key: 'prescriptions', label: 'Digital E-Prescriptions', icon: Pill },
          { key: 'labs', label: 'Lab Orders & Diagnostics', icon: FlaskConical },
          { key: 'schedule', label: 'Weekly Availability', icon: Calendar },
          { key: 'reviews', label: 'Patient Ratings & Feedbacks', icon: Star },
          { key: 'profile', label: 'Doctor Bio & Credentials', icon: Award },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                borderRadius: '8px 8px 0 0', border: 'none',
                background: active ? '#ffffff' : 'transparent',
                borderBottom: active ? '2.5px solid #0f6e6e' : '2.5px solid transparent',
                color: active ? '#0f6e6e' : '#64748b', fontWeight: active ? 650 : 500,
                fontSize: 13.5, cursor: 'pointer', transition: 'all 120ms'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: CONSULTATIONS QUEUE ─────────────────────────────── */}
      {activeTab === 'queue' && (
        <Card padding="none">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Today's Scheduled Consultations</h3>
              <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Launch desktop consultation workstation or review patient vitals</p>
            </div>
            <Badge variant="teal" size="sm">4 Total Patients Today</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TODAY_CONSULTATIONS.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
                  padding: '20px 24px', borderBottom: '1px solid #f1f5f9', transition: 'background 120ms'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: '#eff6ff', color: '#2563eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
                    flexShrink: 0, border: '1.5px solid #dbeafe'
                  }}>
                    {c.patientName[0]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h4 style={{ fontSize: 14.5, fontWeight: 650, color: '#1e293b' }}>{c.patientName}</h4>
                      <span style={{ fontSize: 12, color: '#64748b' }}>({c.patientAge}y · {c.patientGender})</span>
                      <Badge variant={c.status === 'completed' ? 'success' : c.status === 'in_progress' ? 'warning' : 'neutral'} size="sm">
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Reason:</span> {c.reason}
                    </p>
                    <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11.5, color: '#64748b' }}>
                      <span><strong>BP:</strong> {c.vitals.bp}</span>
                      <span><strong>HR:</strong> {c.vitals.hr}</span>
                      <span><strong>Temp:</strong> {c.vitals.temp}</span>
                      <span><strong>Weight:</strong> {c.vitals.weight}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{c.time}</p>
                    <span style={{ fontSize: 11.5, color: '#64748b', textTransform: 'capitalize' }}>{c.type.replace('_', ' ')}</span>
                  </div>
                  <Button
                    variant={c.status === 'completed' ? 'secondary' : 'teal'}
                    size="sm"
                    leftIcon={<Stethoscope size={13} />}
                    onClick={() => handleStartConsultation(c)}
                  >
                    {c.status === 'completed' ? 'Review Notes' : 'Start Consult'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── TAB 2: SOAP CLINICAL NOTES ────────────────────────────── */}
      {activeTab === 'notes' && (
        <Card padding="lg">
          <CardHeader
            title="SOAP Medical Notes & Clinical Records"
            subtitle="NDPA-compliant subjective, objective, assessment, and treatment plans"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {TODAY_CONSULTATIONS.map((c) => (
              <div key={c.id} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b' }}>{c.patientName}</h4>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.time} · Medical History: {c.history}</p>
                  </div>
                  <Badge variant="teal" size="sm">Record Ref: #{c.id}</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 8, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', marginBottom: 4 }}>[S] Subjective (Chief Complaint)</p>
                    <p style={{ fontSize: 12.5, color: '#334155' }}>{c.reason}</p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 8, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase', marginBottom: 4 }}>[O] Objective Vitals</p>
                    <p style={{ fontSize: 12.5, color: '#334155' }}>BP: {c.vitals.bp} | HR: {c.vitals.hr} | Temp: {c.vitals.temp} | Wt: {c.vitals.weight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── TAB 3: DIGITAL E-PRESCRIPTIONS ────────────────────────── */}
      {activeTab === 'prescriptions' && (
        <Card padding="lg">
          <CardHeader
            title="Digital E-Prescription Dispatch"
            subtitle="Issue digitally signed prescriptions to registered pharmacy partners"
          />
          <form onSubmit={(e) => { e.preventDefault(); triggerFeedback(`E-Prescription for ${rxDrugName} dispatched to ${rxPharmacy}`); }} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Medication Name & Strength *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amlodipine Besylate 5mg"
                  className="input"
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
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Frequency</label>
                <select className="input" value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)}>
                  <option>Once daily (QD)</option>
                  <option>Twice daily (BID)</option>
                  <option>Three times daily (TID)</option>
                  <option>As needed (PRN)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Duration</label>
                <select className="input" value={rxDuration} onChange={(e) => setRxDuration(e.target.value)}>
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Fulfillment Pharmacy</label>
                <select className="input" value={rxPharmacy} onChange={(e) => setRxPharmacy(e.target.value)}>
                  <option>Pharmacare Pharmacy Ikeja</option>
                  <option>RxNow Pharmacy Port Harcourt</option>
                  <option>MedPlus Pharmacy Victoria Island</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="teal" leftIcon={<Send size={14} />} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              Issue & Sign E-Prescription
            </Button>
          </form>
        </Card>
      )}

      {/* ── TAB 4: LAB ORDERS & DIAGNOSTICS ────────────────────────── */}
      {activeTab === 'labs' && (
        <Card padding="lg">
          <CardHeader
            title="Diagnostic Lab Requisitions"
            subtitle="Order blood panels, radiology scans, and cardiac diagnostics"
          />
          <form onSubmit={(e) => { e.preventDefault(); triggerFeedback(`Lab order for ${labTestName} submitted successfully.`); }} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Required Test / Panel *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) + Lipid Profile"
                  className="input"
                  value={labTestName}
                  onChange={(e) => setLabTestName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Priority Level</label>
                <select className="input" value={labPriority} onChange={(e) => setLabPriority(e.target.value as any)}>
                  <option value="routine">Routine</option>
                  <option value="urgent">STAT / Urgent</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" leftIcon={<FlaskConical size={14} />} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              Submit Lab Order
            </Button>
          </form>
        </Card>
      )}

      {/* ── TAB 5: WEEKLY AVAILABILITY & SLOTS ─────────────────────── */}
      {activeTab === 'schedule' && (
        <Card padding="lg">
          <CardHeader
            title="Weekly Consultation Schedule & Time Slots"
            subtitle="Configure days and hours available for patient bookings"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{day}</h4>
                  <Badge variant="teal" size="sm">Available</Badge>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Hours: 09:00 AM – 05:00 PM (30m slots)</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'].map((slot) => (
                    <span key={slot} style={{ fontSize: 11, background: '#ffffff', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 6, color: '#334155' }}>
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── TAB: PATIENT RATINGS & FEEDBACKS ───────────────────────── */}
      {activeTab === 'reviews' && (
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Patient Feedbacks & Verified Ratings</h3>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Review verified patient ratings, feedback comments, and post official responses.</p>
              </div>

              {/* Rating Summary Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 16px', borderRadius: 10
              }}>
                <Star size={24} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#b45309' }}>4.9 / 5.0</span>
                  <p style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>Based on {patientReviews.length} Verified Patient Reviews</p>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
              {patientReviews.map((rev) => (
                <div key={rev.id} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 17, background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#2563eb', fontSize: 14
                      }}>
                        {rev.patientName[0]}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{rev.patientName}</h4>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Submitted {rev.date}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fffbeb', padding: '3px 8px', borderRadius: 6 }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>"{rev.comment}"</p>

                  {/* Doctor Response Section */}
                  {rev.doctorReply ? (
                    <div style={{
                      background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginTop: 4
                    }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Official Doctor Response:
                      </span>
                      <p style={{ fontSize: 12.5, color: '#15803d', marginTop: 2 }}>{rev.doctorReply}</p>
                    </div>
                  ) : replyingId === rev.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                      <textarea
                        className="input"
                        placeholder="Write official response to patient..."
                        style={{ height: 65, padding: 8, fontSize: 12.5 }}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" onClick={() => setReplyingId(null)}>Cancel</Button>
                        <Button variant="teal" size="sm" onClick={() => handlePostDoctorReply(rev.id)}>Post Response</Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                      <Button variant="outline" size="sm" leftIcon={<MessageSquare size={12} />} onClick={() => { setReplyingId(rev.id); setReplyText(''); }}>
                        Respond to Feedback
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── TAB 6: DOCTOR BIO & CREDENTIALS ───────────────────────── */}
      {activeTab === 'profile' && (
        <Card padding="lg">
          <CardHeader
            title="Doctor Profile & Credentials"
            subtitle="Manage your public bio, consultation fees, and practice credentials"
            action={
              <Button variant="secondary" size="sm" leftIcon={<Edit3 size={13} />} onClick={() => setIsBioEditing(!isBioEditing)}>
                {isBioEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Professional Biography</label>
              {isBioEditing ? (
                <textarea
                  className="input"
                  style={{ height: 100, padding: 12, fontFamily: 'inherit' }}
                  value={doctorBio}
                  onChange={(e) => setDoctorBio(e.target.value)}
                />
              ) : (
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  {doctorBio}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Consultation Fee (NGN)</label>
                <input
                  type="number"
                  disabled={!isBioEditing}
                  className="input"
                  value={consultFee}
                  onChange={(e) => setConsultFee(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>Primary Practice Facility</label>
                <input
                  type="text"
                  disabled
                  className="input"
                  value="Omini Pulse Heart Center (Lagos)"
                />
              </div>
            </div>

            {isBioEditing && (
              <Button variant="teal" leftIcon={<CheckCircle2 size={14} />} onClick={() => { setIsBioEditing(false); triggerFeedback('Profile bio & consultation fee updated successfully.'); }}>
                Save Profile Changes
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ── DESKTOP MEDICAL CONSULTATION MODAL ────────────────────── */}
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

    </div>
  );
}
