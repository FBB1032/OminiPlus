'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Video, Pill, Activity, Search, ShieldCheck,
  CheckCheck, Clock, AlertTriangle, FileText, Sparkles,
  Heart, Stethoscope, Droplet, ChevronRight, User2,
  Thermometer, Wind, Zap, Phone, X, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ConsultationPatient {
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
    severity: number;
    color: 'yellow' | 'orange' | 'red';
    notes: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  read?: boolean;
  type?: 'text' | 'vitals_card' | 'rx_card';
  metadata?: {
    bp?: string;
    hr?: string;
    temp?: string;
    spo2?: string;
    rxDrug?: string;
    rxDosage?: string;
  };
}

interface DoctorPatientChatProps {
  consultations: ConsultationPatient[];
  activePatientId: string;
  onSelectPatientId: (id: string) => void;
  onStartVideoConsult: (patient: ConsultationPatient) => void;
  onOpenChart: (patient: ConsultationPatient) => void;
  onOpenPrescription: (patientName: string) => void;
  onTriggerFeedback?: (msg: string) => void;
}

// Session messages are ephemeral: each conversation thread starts empty and
// fills from the live session input (and realtime events) — no mock history.

const CLINICAL_TEMPLATES = [
  'Please confirm your current blood pressure reading.',
  'Are you experiencing any shortness of breath or chest tightness?',
  'I have prepared your digital prescription — sent to your pharmacy.',
  'Please rest well, stay hydrated, and avoid heavy exertion.',
  'Let us switch to a video call for visual clinical evaluation.',
];

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  waiting:     { bg: '#fffbeb', color: '#b45309', label: 'Waiting' },
  in_progress: { bg: '#eff6ff', color: '#1d4ed8', label: 'In Progress' },
  completed:   { bg: '#f0fdf4', color: '#0f6e6e', label: 'Completed' },
  cancelled:   { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  video:     <Video size={11} />,
  in_person: <User2 size={11} />,
  phone:     <Phone size={11} />,
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function AvatarCircle({ name, size = 40, active = false }: { name: string; size?: number; active?: boolean }) {
  const hue = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % 360;
  const bg = active ? '#0f6e6e' : `hsl(${hue}, 55%, 88%)`;
  const color = active ? '#ffffff' : `hsl(${hue}, 55%, 30%)`;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 800, flexShrink: 0,
      letterSpacing: '-0.03em',
    }}>
      {getInitials(name)}
    </div>
  );
}

export function DoctorPatientChat({
  consultations,
  activePatientId,
  onSelectPatientId,
  onStartVideoConsult,
  onOpenChart,
  onOpenPrescription,
  onTriggerFeedback,
}: DoctorPatientChatProps) {
  const [messagesByPatient, setMessagesByPatient] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEHR, setShowEHR] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activePatient = consultations.find((c) => c.id === activePatientId) || consultations[0];
  const activeMessages = (activePatient && messagesByPatient[activePatient.id]) || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePatientId, activeMessages.length]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activePatient) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'doctor',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setMessagesByPatient((prev) => ({
      ...prev,
      [activePatient.id]: [...(prev[activePatient.id] || []), newMsg],
    }));
    setInputText('');
    onTriggerFeedback?.(`Message sent to ${activePatient.patientName}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const filteredPatients = consultations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.patientName.toLowerCase().includes(q) || c.reason.toLowerCase().includes(q);
  });

  const hasAllergy = activePatient?.allergies.some((a) => a !== 'None recorded');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showEHR ? '280px 1fr 300px' : '280px 1fr',
      background: '#ffffff',
      borderRadius: 20,
      border: '1px solid #e2e8f0',
      height: '760px',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(15,110,110,0.08), 0 2px 8px rgba(0,0,0,0.04)',
    }}>

      {/* ── LEFT SIDEBAR: PATIENT QUEUE ──────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: '#0c1a2e',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.01em' }}>
                Patient Queue
              </h3>
              <p style={{ fontSize: 10.5, color: '#64748b', margin: '2px 0 0' }}>
                Consultation Chat
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'rgba(15,110,110,0.35)',
              color: '#5eead4',
              padding: '3px 9px', borderRadius: 999,
              border: '1px solid rgba(94,234,212,0.2)',
            }}>
              {consultations.length} Active
            </span>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '7px 11px',
          }}>
            <Search size={13} color="#64748b" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontSize: 12, color: '#cbd5e1', width: '100%',
              }}
            />
          </div>
        </div>

        {/* Patient List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
          {filteredPatients.map((patient) => {
            const isActive = activePatient?.id === patient.id;
            const msgs = messagesByPatient[patient.id] || [];
            const lastMsg = msgs[msgs.length - 1];
            const sc = STATUS_CONFIG[patient.status];

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatientId(patient.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '11px 10px', borderRadius: 12, cursor: 'pointer',
                  background: isActive ? 'rgba(15,110,110,0.25)' : 'transparent',
                  border: isActive ? '1px solid rgba(94,234,212,0.2)' : '1px solid transparent',
                  marginBottom: 2, transition: 'all 150ms',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <AvatarCircle name={patient.patientName} size={38} active={isActive} />
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 10, height: 10, borderRadius: '50%',
                    background: patient.status === 'waiting' ? '#f59e0b' : patient.status === 'in_progress' ? '#3b82f6' : '#0f6e6e',
                    border: '2px solid #0c1a2e',
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <h4 style={{
                      fontSize: 12.5, fontWeight: 700, margin: 0,
                      color: isActive ? '#f1f5f9' : '#cbd5e1',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {patient.patientName}
                    </h4>
                    <span style={{ fontSize: 9.5, color: '#475569', flexShrink: 0 }}>
                      {lastMsg?.timestamp || patient.time}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, color: '#475569' }}>
                      {patient.patientAge}y · {patient.patientGender[0]}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 9.5, fontWeight: 600,
                      color: sc.color,
                      background: 'rgba(255,255,255,0.06)',
                      padding: '1px 5px', borderRadius: 4,
                    }}>
                      {TYPE_ICON[patient.type]} {sc.label}
                    </span>
                  </div>

                  <p style={{
                    fontSize: 11, color: '#475569', margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {lastMsg ? `${lastMsg.sender === 'doctor' ? 'You: ' : ''}${lastMsg.text}` : patient.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CENTER: CHAT THREAD ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', minWidth: 0 }}>

        {/* Chat Header */}
        {activePatient && (
          <div style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #0f6e6e 0%, #0d5a5a 100%)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: '#ffffff',
                letterSpacing: '-0.03em', flexShrink: 0,
              }}>
                {getInitials(activePatient.patientName)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {activePatient.patientName}
                  </h3>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff', fontSize: 10, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}>
                    <ShieldCheck size={10} /> NDPA Encrypted
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 12 }}>
                  <span>{activePatient.patientAge}y · {activePatient.patientGender}</span>
                  <span>Blood: <strong style={{ color: '#ffffff' }}>{activePatient.bloodGroup}</strong></span>
                  <span>Genotype: <strong style={{ color: '#ffffff' }}>{activePatient.genotype}</strong></span>
                  <span style={{
                    background: STATUS_CONFIG[activePatient.status].bg,
                    color: STATUS_CONFIG[activePatient.status].color,
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  }}>
                    {STATUS_CONFIG[activePatient.status].label.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => onStartVideoConsult(activePatient)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.18)', color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9,
                  padding: '6px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              >
                <Video size={13} /> Start Video
              </button>

              <button
                type="button"
                onClick={() => onOpenChart(activePatient)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9,
                  padding: '6px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <Activity size={13} /> Body Map
              </button>

              <button
                type="button"
                onClick={() => onOpenPrescription(`${activePatient.patientName} (${activePatient.patientAge}y · ${activePatient.patientGender})`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9,
                  padding: '6px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <FileText size={13} /> Prescribe
              </button>

              <button
                type="button"
                onClick={() => setShowEHR(!showEHR)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: showEHR ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9,
                  padding: '6px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 120ms',
                }}
              >
                <FileText size={13} /> {showEHR ? 'Hide EHR' : 'EHR'}
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: 14,
          background: '#f8fafc',
        }}>
          {/* Encrypted banner */}
          <div style={{
            alignSelf: 'center',
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 999, padding: '5px 16px',
            fontSize: 11, color: '#64748b',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <ShieldCheck size={12} color="#0f6e6e" />
            End-to-end encrypted · NDPA 2023 compliant
          </div>

          {activeMessages.map((msg) => {
            const isDoc = msg.sender === 'doctor';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isDoc ? 'row-reverse' : 'row',
                  alignItems: 'flex-end', gap: 8,
                }}
              >
                {/* Tiny avatar */}
                {!isDoc && (
                  <AvatarCircle name={activePatient?.patientName || 'P'} size={28} />
                )}
                {isDoc && (
                  <AvatarCircle name="Dr. Folake" size={28} active />
                )}

                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: isDoc ? 'flex-end' : 'flex-start',
                  maxWidth: '72%',
                }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, paddingLeft: 4, paddingRight: 4 }}>
                    {isDoc ? 'Dr. Folake Ademola (You)' : activePatient?.patientName} · {msg.timestamp}
                  </div>

                  {/* Bubble */}
                  <div style={{
                    background: isDoc
                      ? 'linear-gradient(135deg, #0f6e6e 0%, #0a5454 100%)'
                      : '#ffffff',
                    color: isDoc ? '#ffffff' : '#0f172a',
                    padding: '11px 15px',
                    borderRadius: isDoc ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: isDoc ? 'none' : '1px solid #e2e8f0',
                    fontSize: 13, lineHeight: 1.55,
                    boxShadow: isDoc
                      ? '0 4px 14px rgba(15,110,110,0.25)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                  }}>
                    <p style={{ margin: 0 }}>{msg.text}</p>

                    {/* Vitals card attachment */}
                    {msg.type === 'vitals_card' && msg.metadata && (
                      <div style={{
                        marginTop: 10,
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 10, padding: '10px 12px',
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
                      }}>
                        {[
                          { label: 'BP', value: msg.metadata.bp, icon: <Activity size={11} /> },
                          { label: 'HR', value: msg.metadata.hr, icon: <Heart size={11} /> },
                          { label: 'Temp', value: msg.metadata.temp, icon: <Thermometer size={11} /> },
                          { label: 'SpO₂', value: msg.metadata.spo2, icon: <Wind size={11} /> },
                        ].map((v) => (
                          <div key={v.label} style={{ textAlign: 'center' }}>
                            <div style={{ opacity: 0.7, fontSize: 9, marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                              {v.icon} {v.label}
                            </div>
                            <strong style={{ fontSize: 11 }}>{v.value}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Prescription card attachment */}
                    {msg.type === 'rx_card' && msg.metadata && (
                      <div style={{
                        marginTop: 10,
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 10, padding: '10px 12px',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Pill size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: 12, display: 'block' }}>{msg.metadata.rxDrug}</strong>
                          <span style={{ fontSize: 10.5, opacity: 0.85 }}>{msg.metadata.rxDosage}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Read receipt */}
                  {isDoc && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, paddingRight: 4 }}>
                      <CheckCheck size={11} color="#0f6e6e" />
                      <span style={{ fontSize: 9.5, color: '#94a3b8' }}>Delivered · Read</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Templates */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Sparkles size={12} color="#0f6e6e" /> Quick:
          </span>
          {CLINICAL_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(tmpl)}
              style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 999,
                padding: '4px 11px', fontSize: 11, color: '#334155',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e6f4f4';
                e.currentTarget.style.borderColor = '#0f6e6e';
                e.currentTarget.style.color = '#0f6e6e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              {tmpl}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #e2e8f0',
          background: '#ffffff', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activePatient?.patientName || 'patient'}… (Enter to send)`}
            style={{
              flex: 1, background: '#f8fafc',
              border: '1.5px solid #e2e8f0', borderRadius: 12,
              padding: '10px 14px', fontSize: 13, color: '#0f172a',
              outline: 'none', transition: 'border 120ms',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#0f6e6e')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: inputText.trim() ? 'linear-gradient(135deg, #0f6e6e, #0a5454)' : '#e2e8f0',
              color: inputText.trim() ? '#ffffff' : '#94a3b8',
              border: 'none', cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms',
              boxShadow: inputText.trim() ? '0 4px 12px rgba(15,110,110,0.3)' : 'none',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL: EHR SNAPSHOT ─────────────────────────────────────── */}
      {showEHR && activePatient && (
        <div style={{
          borderLeft: '1px solid #e2e8f0',
          background: '#ffffff',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* EHR Header */}
          <div style={{
            padding: '16px 16px 12px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AvatarCircle name={activePatient.patientName} size={44} active />
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                  {activePatient.patientName}
                </h4>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                  EHR-ID: P-{activePatient.id} · {activePatient.patientGender}
                </p>
              </div>
            </div>

            {/* Patient tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                { icon: <Droplet size={10} />, label: activePatient.bloodGroup, color: '#dc2626', bg: '#fef2f2' },
                { icon: <Stethoscope size={10} />, label: activePatient.genotype, color: '#7c3aed', bg: '#f5f3ff' },
                { icon: <Clock size={10} />, label: `${activePatient.patientAge} years old`, color: '#0369a1', bg: '#eff6ff' },
              ].map((tag) => (
                <span key={tag.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: tag.bg, color: tag.color,
                  fontSize: 10.5, fontWeight: 700,
                  padding: '3px 8px', borderRadius: 6,
                }}>
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* EHR Body */}
          <div style={{ flex: 1, padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Vitals Grid */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Activity size={12} color="#0f6e6e" /> Latest Vitals
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Blood Pressure', value: activePatient.vitals.bp, icon: <Activity size={14} />, color: '#dc2626', bg: '#fef2f2' },
                  { label: 'Heart Rate', value: activePatient.vitals.hr, icon: <Heart size={14} />, color: '#e11d48', bg: '#fff1f2' },
                  { label: 'Temperature', value: activePatient.vitals.temp, icon: <Thermometer size={14} />, color: '#d97706', bg: '#fffbeb' },
                  { label: 'SpO₂', value: activePatient.vitals.spo2, icon: <Wind size={14} />, color: '#0f6e6e', bg: '#f0fdfa' },
                ].map((v) => (
                  <div key={v.label} style={{
                    background: v.bg, borderRadius: 10, padding: '10px 10px',
                    border: `1px solid ${v.bg}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: v.color, marginBottom: 4 }}>
                      {v.icon}
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: '#64748b' }}>{v.label}</span>
                    </div>
                    <strong style={{ fontSize: 12.5, color: '#0f172a', lineHeight: 1 }}>{v.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Weight</span>
              <strong style={{ fontSize: 13, color: '#0f172a' }}>{activePatient.vitals.weight}</strong>
            </div>

            {/* Consultation Reason */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageSquare size={11} color="#0f6e6e" /> Consultation Reason
              </div>
              <p style={{ fontSize: 12, color: '#1e293b', margin: '0 0 10px', lineHeight: 1.5 }}>
                {activePatient.reason}
              </p>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Clinical History
              </div>
              <p style={{ fontSize: 11.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {activePatient.history}
              </p>
            </div>

            {/* Allergies */}
            <div style={{
              background: hasAllergy ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${hasAllergy ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <AlertTriangle size={12} color={hasAllergy ? '#dc2626' : '#0f6e6e'} />
                <strong style={{ fontSize: 11.5, color: hasAllergy ? '#991b1b' : '#0f6e6e' }}>
                  Allergies & Contraindications
                </strong>
              </div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                {activePatient.allergies.join(', ')}
              </div>
            </div>

            {/* Pain Region */}
            {activePatient.painRegion && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <strong style={{ fontSize: 11.5, color: '#92400e' }}>
                    Pain: {activePatient.painRegion.region}
                  </strong>
                  <span style={{
                    background: activePatient.painRegion.color === 'red' ? '#dc2626' : '#f59e0b',
                    color: '#ffffff', fontSize: 10, fontWeight: 800,
                    padding: '1px 7px', borderRadius: 4,
                  }}>
                    {activePatient.painRegion.severity}/10
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#78350f', margin: 0, lineHeight: 1.4 }}>
                  {activePatient.painRegion.notes}
                </p>
              </div>
            )}

            {/* EHR Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => onOpenChart(activePatient)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'linear-gradient(135deg, #0f6e6e, #0a5454)',
                  color: '#ffffff', border: 'none', borderRadius: 10,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: '0 4px 12px rgba(15,110,110,0.2)',
                  transition: 'opacity 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Activity size={13} /> Open 3D Body Map
              </button>
              <button
                type="button"
                onClick={() => onOpenPrescription(`${activePatient.patientName} (${activePatient.patientAge}y · ${activePatient.patientGender})`)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#ffffff', color: '#0f6e6e',
                  border: '1.5px solid #0f6e6e', borderRadius: 10,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
              >
                <Pill size={13} /> Write E-Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
