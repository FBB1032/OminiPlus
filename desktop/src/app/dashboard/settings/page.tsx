'use client';

import { useState } from 'react';
import {
  Settings, Globe, Bell, Palette, Database, Save, Sparkles, Shield, Activity, User,
  Mail, FileSpreadsheet, Layout, Server, Check, CheckCircle2, AlertTriangle, Download,
  FileText, Lock, Clock, Sun, Moon, Monitor, ChevronRight, RefreshCw, Sliders, ExternalLink,
  Phone, DollarSign, ShieldCheck, HardDrive, Eye
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const TABS = [
  { key: 'general', label: 'General Configuration', icon: Settings, desc: 'Console branding, operational window & fees' },
  { key: 'notifications', label: 'Alert Routing Priorities', icon: Bell, desc: 'Real-time triggers, emergency overrides & push' },
  { key: 'appearance', label: 'Platform Theme & Identity', icon: Palette, desc: 'Brand accent hues, dark mode & live UI preview' },
  { key: 'data', label: 'NDPA 2023 & GDPR Compliance', icon: Database, desc: 'Data retention schedules & cryptographic audit' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');

  // General Settings states
  const [platformName, setPlatformName] = useState('OminiPulse Clinical Cloud');
  const [supportEmail, setSupportEmail] = useState('operations@ominipulse.ai');
  const [jurisdiction, setJurisdiction] = useState('Federal Republic of Nigeria (MDCN & NDPC)');
  const [commission, setCommission] = useState('10');
  const [duration, setDuration] = useState('30');
  const [bufferTime, setBufferTime] = useState('5');
  const [emergencyPhone, setEmergencyPhone] = useState('112 / 199 (National Emergency Dispatch)');

  // Notification Preferences states
  const [notifFilter, setNotifFilter] = useState<'all' | 'critical' | 'clinical' | 'security'>('all');
  const [notifs, setNotifs] = useState([
    {
      key: 'n-ai',
      category: 'critical',
      priority: 'CRITICAL',
      label: 'High-Severity AI Clinical Escalation',
      desc: 'Triggers emergency broadcast when AI triage flags acute coronary syndrome, stroke, or maternal distress.',
      channels: ['Push Notification', 'SMS Alert', 'In-App Siren'],
      enabled: true
    },
    {
      key: 'n-doc',
      category: 'clinical',
      priority: 'HIGH',
      label: 'Clinician Verification & MDCN License Upload',
      desc: 'Routes newly submitted physician practicing licenses to the Medical Verification Committee.',
      channels: ['Admin Portal', 'Email Digest'],
      enabled: true
    },
    {
      key: 'n-rep',
      category: 'clinical',
      priority: 'HIGH',
      label: 'Patient Malpractice & Care Quality Filings',
      desc: 'Immediately opens incident case files with cryptographically signed regulatory tracking IDs.',
      channels: ['Compliance Dashboard', 'Legal Desk Email'],
      enabled: true
    },
    {
      key: 'n-sec',
      category: 'security',
      priority: 'HIGH',
      label: 'Suspicious Administrative Login & Brute-Force',
      desc: 'Locks portal account and alerts Security Operations Center after 3 failed 2FA attempts.',
      channels: ['SOC Stream', 'Security SMS', 'Email'],
      enabled: true
    },
    {
      key: 'n-escrow',
      category: 'clinical',
      priority: 'MEDIUM',
      label: 'Escrow Dispute & Consultation Cancellation Claims',
      desc: 'Alerts finance desk when automated escrow release requires manual clinician reconciliation.',
      channels: ['Billing Ledger', 'Email'],
      enabled: false
    },
    {
      key: 'n-lab',
      category: 'clinical',
      priority: 'STANDARD',
      label: 'Diagnostic Lab Results & Pathology Sync',
      desc: 'Notifies primary physicians when integrated laboratory results arrive for active patients.',
      channels: ['In-App Push', 'EHR Banner'],
      enabled: true
    },
  ]);

  // Appearance & Visual Identity states
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [brandColor, setBrandColor] = useState('#0f6e6e');
  const [highContrast, setHighContrast] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);

  // Compliance Export Feedback
  const [auditRunning, setAuditRunning] = useState(false);

  const handleToggleNotif = (key: string) => {
    setNotifs(prev =>
      prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('General system configuration successfully saved and synchronized across all nodes.');
  };

  const handleRunAudit = () => {
    setAuditRunning(true);
    setTimeout(() => {
      setAuditRunning(false);
      triggerToast('NDPA 2023 Automated Privacy & Cryptographic Ledger Audit: 100% COMPLIANT (0 infractions).');
    }, 1500);
  };

  const filteredNotifs = notifs.filter(n => {
    if (notifFilter === 'all') return true;
    return n.category === notifFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        background: '#ffffff',
        padding: '24px 28px',
        borderRadius: 18,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: '#e6f4f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f6e6e',
            boxShadow: '0 2px 10px rgba(15,110,110,0.15)'
          }}>
            <Settings size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                System Configuration & Compliance
              </h1>
              <span style={{
                background: '#f0fdfa',
                color: '#0f6e6e',
                border: '1px solid #ccfbf1',
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 800
              }}>
                Production Core v2.4
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              Administer clinical workflows, real-time alert routing, visual identity tokens, and NDPA 2023 legal policies.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ShieldCheck size={14} />}
            onClick={handleRunAudit}
            disabled={auditRunning}
          >
            {auditRunning ? 'Running NDPA Audit...' : 'Run NDPA Audit'}
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          padding: '14px 18px',
          borderRadius: 12,
          color: '#065f46',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 2px 10px rgba(5,150,105,0.08)'
        }}>
          <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Main Layout: Nav Tabs + Content Stage ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Navigation Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: isSelected ? '1.5px solid #0f6e6e' : '1.5px solid transparent',
                  background: isSelected ? '#f0fdfa' : 'transparent',
                  color: isSelected ? '#0f6e6e' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 140ms ease',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isSelected ? '#0f6e6e' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  transition: 'all 140ms ease'
                }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: isSelected ? 800 : 700, display: 'block', color: isSelected ? '#0f6e6e' : '#1e293b' }}>
                    {t.label}
                  </span>
                  <span style={{ fontSize: 11, color: isSelected ? '#0f766e' : '#94a3b8', lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                    {t.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: GENERAL CONFIGURATION                                      */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                background: '#ffffff',
                borderRadius: 18,
                padding: '28px 30px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 26
              }}>
                {/* Section Header */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Settings size={20} style={{ color: '#0f6e6e' }} />
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      General Configuration
                    </h2>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                    Core parameters for system identity, operational session bounds, and escrow clearing rules.
                  </p>
                </div>

                {/* Sub-block 1: System Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={15} style={{ color: '#0f6e6e' }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Clinical System Identity & Dispatch
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        Console Brand Name
                      </label>
                      <input
                        type="text"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        Emergency Ops & Dispatch Email
                      </label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        Clinical Regulatory Jurisdiction
                      </label>
                      <input
                        type="text"
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        National Emergency SOS Auto-Dial
                      </label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                {/* Sub-block 2: Operations & Telehealth Session Tuning */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={15} style={{ color: '#0f6e6e' }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Telehealth & Scheduling Operations
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        Default Consultation Duration (min)
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="15">15 Minutes (Brief Review)</option>
                        <option value="30">30 Minutes (Standard Clinical)</option>
                        <option value="45">45 Minutes (Specialist Extended)</option>
                        <option value="60">60 Minutes (Comprehensive)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        Post-Consultation Buffer (min)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={bufferTime}
                        onChange={(e) => setBufferTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                        Platform Fee Commission (%)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="25"
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #cbd5e1',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: 20,
                  marginTop: 8
                }}>
                  <Button
                    type="submit"
                    variant="teal"
                    leftIcon={<Save size={14} />}
                  >
                    Save General Configuration
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ALERT ROUTING PRIORITIES                                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '28px 30px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 22
            }}>
              {/* Header & Filter Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bell size={20} style={{ color: '#0f6e6e' }} />
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Alert Routing Priorities
                    </h2>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                    Configure real-time event dispatchers, clinical emergency overrides, and credentialing alerts.
                  </p>
                </div>

                {/* Filter Chips */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 3 }}>
                  {[
                    { key: 'all', label: 'All Alerts' },
                    { key: 'critical', label: 'Critical Overrides' },
                    { key: 'clinical', label: 'Clinical' },
                    { key: 'security', label: 'Security' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setNotifFilter(f.key as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: notifFilter === f.key ? '#0f6e6e' : 'transparent',
                        color: notifFilter === f.key ? '#ffffff' : '#64748b',
                        transition: 'all 120ms'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert List Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredNotifs.map((n) => {
                  const isCritical = n.priority === 'CRITICAL';
                  const isHigh = n.priority === 'HIGH';

                  return (
                    <div
                      key={n.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 22px',
                        borderRadius: 14,
                        border: `1.5px solid ${n.enabled ? (isCritical ? '#fecaca' : '#ccfbf1') : '#e2e8f0'}`,
                        background: n.enabled ? (isCritical ? '#fef2f2' : '#ffffff') : '#f8fafc',
                        gap: 16,
                        boxShadow: n.enabled ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                        transition: 'all 140ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: n.enabled
                            ? (isCritical ? '#fee2e2' : '#e6f4f4')
                            : '#f1f5f9',
                          color: n.enabled
                            ? (isCritical ? '#dc2626' : '#0f6e6e')
                            : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2
                        }}>
                          {isCritical ? <AlertTriangle size={18} /> : <Bell size={18} />}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                              {n.label}
                            </span>
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#0f6e6e',
                              color: '#ffffff'
                            }}>
                              {n.priority}
                            </span>
                          </div>

                          <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                            {n.desc}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Active Channels:</span>
                            {n.channels.map((ch, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: n.enabled ? '#0f6e6e' : '#94a3b8',
                                  background: n.enabled ? '#f0fdfa' : '#f1f5f9',
                                  padding: '2px 8px',
                                  borderRadius: 6
                                }}
                              >
                                {ch}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Fluid Modern Switch */}
                      <button
                        type="button"
                        onClick={() => {
                          handleToggleNotif(n.key);
                          triggerToast(`Alert routing updated for: ${n.label}`);
                        }}
                        style={{
                          position: 'relative',
                          width: 46,
                          height: 26,
                          borderRadius: 999,
                          border: 'none',
                          background: n.enabled ? '#0f6e6e' : '#cbd5e1',
                          cursor: 'pointer',
                          transition: 'background 150ms ease',
                          flexShrink: 0
                        }}
                        title={n.enabled ? 'Disable Alert Routing' : 'Enable Alert Routing'}
                      >
                        <span style={{
                          position: 'absolute',
                          top: 3,
                          left: n.enabled ? 23 : 3,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'left 150ms ease'
                        }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: PLATFORM THEME & VISUAL IDENTITY                          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'appearance' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '28px 30px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}>
              {/* Header */}
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Palette size={20} style={{ color: '#0f6e6e' }} />
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Platform Visual Identity & Clinical Theme
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Manage hospital workspace color tokens, contrast ratios, and dark/light clinical viewports.
                </p>
              </div>

              {/* Theme Mode Selector (Day / Night Duty) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Clinical Viewport Mode
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {[
                    { id: 'light', title: 'Daylight Shift', desc: 'High-clarity medical white with clean borders', icon: Sun, bg: '#ffffff', border: '#cbd5e1' },
                    { id: 'dark', title: 'Night Ward Shift', desc: 'Dark slate palette engineered for low-light wards', icon: Moon, bg: '#0f172a', border: '#334155' },
                    { id: 'system', title: 'System Synchronized', desc: 'Automatically matches your desktop OS mode', icon: Monitor, bg: '#f8fafc', border: '#cbd5e1' },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = themeMode === mode.id;

                    return (
                      <div
                        key={mode.id}
                        onClick={() => {
                          setThemeMode(mode.id as any);
                          triggerToast(`Clinical viewport switched to: ${mode.title}`);
                        }}
                        style={{
                          border: isSelected ? '2px solid #0f6e6e' : '1.5px solid #e2e8f0',
                          borderRadius: 14,
                          padding: 16,
                          background: isSelected ? '#f0fdfa' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          transition: 'all 120ms ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: isSelected ? '#0f6e6e' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={18} />
                          </div>
                          {isSelected && (
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#0f6e6e', background: '#ccfbf1', padding: '2px 8px', borderRadius: 6 }}>
                              Active
                            </span>
                          )}
                        </div>

                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {mode.title}
                          </p>
                          <p style={{ fontSize: 11.5, color: '#64748b', margin: '3px 0 0', lineHeight: 1.3 }}>
                            {mode.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brand Accent Hue Palette */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Brand Primary Accent Hue
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  {[
                    { hex: '#0f6e6e', name: 'OminiPulse Emerald Teal', role: 'Official Clinical Primary' },
                    { hex: '#0284c7', name: 'Deep Sea Medical Blue', role: 'Cardiology & Emergency' },
                    { hex: '#2563eb', name: 'Royal Administrative Cobalt', role: 'Hospital Network' },
                    { hex: '#7c3aed', name: 'Amethyst Orchid Purple', role: 'Specialty Surgery' },
                  ].map((c) => {
                    const isSelected = brandColor === c.hex;

                    return (
                      <div
                        key={c.hex}
                        onClick={() => {
                          setBrandColor(c.hex);
                          triggerToast(`Platform accent hue updated to: ${c.name}`);
                        }}
                        style={{
                          border: isSelected ? `2px solid ${c.hex}` : '1.5px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '16px 14px',
                          background: isSelected ? `${c.hex}08` : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          transition: 'all 120ms ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: c.hex,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            boxShadow: `0 2px 8px ${c.hex}40`
                          }}>
                            {isSelected && <Check size={16} />}
                          </div>
                          <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                            {c.hex}
                          </span>
                        </div>

                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {c.name}
                          </p>
                          <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                            {c.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Interactive UI Preview Stage */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Live Interface Component Preview ({brandColor})
                  </span>
                  <span style={{ fontSize: 11.5, color: '#0f6e6e', fontWeight: 700 }}>
                    WCAG 2.1 AAA Contrast Compliant
                  </span>
                </div>

                <div style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: brandColor }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      Telehealth Examination Suite
                    </span>
                    <span style={{
                      background: `${brandColor}15`,
                      color: brandColor,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      Live 1080p Stream
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      style={{
                        background: brandColor,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Primary Action
                    </button>
                    <button
                      type="button"
                      style={{
                        background: '#ffffff',
                        color: brandColor,
                        border: `1.5px solid ${brandColor}`,
                        borderRadius: 8,
                        padding: '7px 14px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Outline Action
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: NDPA 2023 COMPLIANCE & DATA RETENTION POLICIES             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'data' && (
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '28px 30px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 22
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={22} style={{ color: '#059669' }} />
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      NDPA 2023 Compliance & Data Retention Policies
                    </h2>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                    Statutory medical records retention periods, patient data portability, and cryptographic ledger immutability.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={14} />}
                    onClick={() => triggerToast('Downloaded NDPA Audit Trail (CSV export).')}
                  >
                    Export Audit CSV
                  </Button>
                  <Button
                    variant="teal"
                    size="sm"
                    leftIcon={<FileText size={14} />}
                    onClick={() => triggerToast('Official NDPA Compliance Certificate downloaded (PDF).')}
                  >
                    Compliance Certificate
                  </Button>
                </div>
              </div>

              {/* Regulatory Standing Verified Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
                border: '1.5px solid #a7f3d0',
                borderRadius: 14,
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#059669',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#065f46', display: 'block' }}>
                      Nigeria Data Protection Act (NDPA 2023) Certified System
                    </span>
                    <span style={{ fontSize: 12, color: '#047857', display: 'block', marginTop: 2 }}>
                      Designated DPO Registration: NDPC/DPO/2026/0881 · In-Country Tier-3 Cloud Hosting (Lagos Sovereignty Zone)
                    </span>
                  </div>
                </div>

                <span style={{
                  background: '#ffffff',
                  border: '1px solid #6ee7b7',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: 12,
                  padding: '5px 12px',
                  borderRadius: 8
                }}>
                  100% Statutory Compliant
                </span>
              </div>

              {/* Data Retention Policies Schedule */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Operational Records Retention & Destruction Protocols
                </span>

                {[
                  {
                    title: 'Medical EHR & Consultation Transcripts',
                    law: 'Federal Ministry of Health & MDCN Mandate',
                    retention: '10 Years Post-Care',
                    encryption: 'AES-256 GCM',
                    status: 'Active Protocol'
                  },
                  {
                    title: 'Patient Chart Access Trail (Who Viewed My Health Record)',
                    law: 'NDPA 2023 Article 24 & NDPR Section 2',
                    retention: 'Permanent & Immutably Hashed',
                    encryption: 'SHA-256 Merkle Ledger',
                    status: 'Active Protocol'
                  },
                  {
                    title: 'Clinician Verification Vault & MDCN Practicing Certificates',
                    law: 'Medical and Dental Practitioners Act Cap M8',
                    retention: 'Active Practice + 5 Years',
                    encryption: 'Restricted Multi-Sig Vault',
                    status: 'Active Protocol'
                  },
                  {
                    title: 'Telehealth Payment Escrow & Payout Clearing Records',
                    law: 'CAMA 2020 & FIRS Financial Compliance',
                    retention: '7 Years Fiscal Audit',
                    encryption: 'Encrypted Ledger',
                    status: 'Active Protocol'
                  },
                  {
                    title: 'Emergency AI Triage & Clinical Escalation Logs',
                    law: 'Clinical Safety & Quality Assurance Directive',
                    retention: '3 Years Rolling Retention',
                    encryption: 'Zero-Knowledge At-Rest',
                    status: 'Active Protocol'
                  },
                ].map((policy, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#f0fdfa',
                        color: '#0f6e6e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Lock size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', display: 'block' }}>
                          {policy.title}
                        </span>
                        <span style={{ fontSize: 11.5, color: '#64748b' }}>
                          {policy.law} · Standard: <strong style={{ color: '#0f6e6e' }}>{policy.encryption}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#0f6e6e',
                        background: '#e6f4f4',
                        padding: '4px 10px',
                        borderRadius: 8
                      }}>
                        {policy.retention}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <CheckCircle2 size={13} /> {policy.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
