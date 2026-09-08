'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield, Key, Lock, AlertTriangle, CheckCircle2, ShieldAlert,
  Plus, Download, Clock, Globe, ShieldCheck, UserCheck, RefreshCw,
  Sliders, User, X, Check, Eye, Trash2, Smartphone, Terminal, Ban
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { exportToCsv } from '@/lib/exportCsv';
import type { Admin, AdminRole } from '@/types';

export interface SecurityEvent {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  ipAddress: string;
  location: string;
  time: string;
  mitigated: boolean;
}

export interface SecurityPolicy {
  key: string;
  title: string;
  category: 'Access Control' | 'Data Protection' | 'Threat Defense';
  desc: string;
  enabled: boolean;
  complianceRef: string;
}

const INITIAL_SECURITY_POLICIES: SecurityPolicy[] = [
  {
    key: 'mfa_enforced',
    title: 'Mandatory Multi-Factor Authentication (MFA / 2FA)',
    category: 'Access Control',
    desc: 'Require FIDO2 WebAuthn hardware token or TOTP authenticator for all platform administrator and hospital coordinator logins.',
    enabled: true,
    complianceRef: 'NDPA 2023 §30 / SOC2 CC6.1',
  },
  {
    key: 'ndpa_ehr_shield',
    title: 'NDPA Zero-Knowledge Clinical Vault Shield',
    category: 'Data Protection',
    desc: 'Strictly prohibit platform administrators from viewing unencrypted patient clinical EHR charts, 3D anatomical body maps, and doctor notes.',
    enabled: true,
    complianceRef: 'NDPA 2023 §30 / HIPAA Privacy Rule',
  },
  {
    key: 'brute_force_jail',
    title: 'Adaptive Brute-Force Rate Limiting & Jail',
    category: 'Threat Defense',
    desc: 'Automatically engage firewall block for remote IPs after 5 sequential authentication failures within a 60-second window.',
    enabled: true,
    complianceRef: 'ISO 27001 A.9.4.2',
  },
  {
    key: 'session_timeout',
    title: 'Zero-Trust Session Inactivity Expiry (15 Mins)',
    category: 'Access Control',
    desc: 'Terminate console sessions after 15 minutes of idle time. Mandates credential re-authentication for privileged operations.',
    enabled: true,
    complianceRef: 'SOC2 CC6.3',
  },
  {
    key: 'ip_allowlist',
    title: 'Institutional IP Range & VPN Allowlisting',
    category: 'Access Control',
    desc: 'Restrict platform super-admin access strictly to approved hospital static IPs and encrypted enterprise VPN subnets.',
    enabled: false,
    complianceRef: 'ISO 27001 A.13.1.1',
  },
  {
    key: 'merkle_audit_seal',
    title: 'Cryptographic SHA-256 Merkle Audit Sealing',
    category: 'Data Protection',
    desc: 'Require cryptographic SHA-256 signature chain generation for every privileged permission or facility status transition.',
    enabled: true,
    complianceRef: 'NDPA 2023 §31 / Audit Standards',
  },
];

const INITIAL_ADMINS: Admin[] = [
  {
    id: 'adm-01',
    email: 'sarah.chen@ominipulse.ai',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'admin',
    isTwoFactorEnabled: true,
    createdAt: '2025-01-10',
    lastLogin: '2 minutes ago',
  },
  {
    id: 'adm-02',
    email: 'mark.davis@ominipulse.ai',
    firstName: 'Mark',
    lastName: 'Davis',
    role: 'admin',
    isTwoFactorEnabled: true,
    createdAt: '2025-02-15',
    lastLogin: '45 minutes ago',
  },
  {
    id: 'adm-03',
    email: 'ibrahim.bello@ominipulse.ai',
    firstName: 'Ibrahim',
    lastName: 'Bello',
    role: 'admin',
    isTwoFactorEnabled: true,
    createdAt: '2025-04-01',
    lastLogin: '3 hours ago',
  },
];

const INITIAL_EVENTS: SecurityEvent[] = [
  {
    id: 'sec-evt-101',
    type: 'critical',
    title: 'Brute-Force Login Attack Blocked',
    message: '5 sequential failed administrator password attempts from unauthorized foreign IP.',
    ipAddress: '45.132.22.1',
    location: 'Bucharest, Romania',
    time: '18 minutes ago',
    mitigated: true,
  },
  {
    id: 'sec-evt-102',
    type: 'info',
    title: 'Privileged Console Session Authenticated',
    message: 'Sarah Chen logged in with WebAuthn YubiKey hardware token verification.',
    ipAddress: '102.89.34.112',
    location: 'Lagos, Nigeria',
    time: '42 minutes ago',
    mitigated: true,
  },
  {
    id: 'sec-evt-103',
    type: 'warning',
    title: 'New Device Authentication Handshake',
    message: 'Administrator login detected from new macOS device. 2FA push approved by user.',
    ipAddress: '197.210.65.88',
    location: 'Abuja, Nigeria',
    time: '2 hours ago',
    mitigated: true,
  },
  {
    id: 'sec-evt-104',
    type: 'success',
    title: 'Automated TLS Certificate Renewal',
    message: 'All API and telehealth WebSocket endpoints re-verified with Let’s Encrypt 4096-bit RSA.',
    ipAddress: 'Internal System Gateway',
    location: 'Cloud Infrastructure',
    time: '5 hours ago',
    mitigated: true,
  },
  {
    id: 'sec-evt-105',
    type: 'info',
    title: 'NDPA Zero-Knowledge Vault Audit Completed',
    message: 'Automated cryptographic check verified that zero clinical patient records leaked to admin console.',
    ipAddress: '10.0.4.12',
    location: 'Local Compliance Vault',
    time: '8 hours ago',
    mitigated: true,
  },
];

export default function SecurityPage() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>(INITIAL_SECURITY_POLICIES);
  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [eventFilter, setEventFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Invite Admin State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin');

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleTogglePolicy = (key: string) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.key === key) {
          const next = !p.enabled;
          triggerFeedback(`Policy "${p.title}" is now ${next ? 'ACTIVATED' : 'DEACTIVATED'}`);
          return { ...p, enabled: next };
        }
        return p;
      })
    );
  };

  const handleRevokeSession = (adminId: string, adminName: string) => {
    if (confirm(`Revoke active administrative session token for ${adminName}? The user will be immediately logged out.`)) {
      triggerFeedback(`Session token revoked for ${adminName}. User must re-authenticate with 2FA.`);
    }
  };

  const handleBlacklistIP = (ip: string) => {
    triggerFeedback(`Remote IP ${ip} permanently blacklisted in platform firewall.`);
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteFirstName.trim() || !inviteLastName.trim()) {
      triggerFeedback('Please fill in all administrator credentials.');
      return;
    }

    const newAdm: Admin = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      email: inviteEmail.trim(),
      firstName: inviteFirstName.trim(),
      lastName: inviteLastName.trim(),
      role: inviteRole,
      isTwoFactorEnabled: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Pending Invitation',
    };

    setAdmins((prev) => [...prev, newAdm]);
    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteFirstName('');
    setInviteLastName('');
    triggerFeedback(`Secure invitation dispatched to ${newAdm.email} with mandatory 2FA enrollment link.`);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => eventFilter === 'all' || e.type === eventFilter);
  }, [events, eventFilter]);

  const handleExportSecurityCSV = () => {
    exportToCsv(
      'OmniPlus_Security_Incident_Telemetry.csv',
      events.map((e) => ({
        Event_ID: e.id,
        Severity: e.type,
        Title: e.title,
        Description: e.message,
        IP_Address: e.ipAddress,
        Location: e.location,
        Time: e.time,
        Mitigated: e.mitigated ? 'Yes (Neutralized)' : 'Pending',
      }))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 36, zIndex: 99999,
          background: '#0f6e6e', color: '#ffffff', padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <CheckCircle2 size={16} color="#5eead4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ── Top Header & Posture Hero ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#e6f4f4', color: '#0f6e6e',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Security & Zero-Trust Governance Center
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                Enterprise posture monitoring, privileged identity governance, and NDPA 2023 medical confidentiality enforcement
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={handleExportSecurityCSV} leftIcon={<Download size={14} />}>
            Export Security Telemetry
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)} leftIcon={<Plus size={14} />}>
            Invite Platform Admin
          </Button>
        </div>
      </div>

      {/* ── Security Posture Banner ───────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '20px 24px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#34d399', flexShrink: 0
          }}>
            <Lock size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Platform Security Posture: Optimal (98/100)
              </h2>
              <span style={{
                background: '#064e3b',
                color: '#34d399',
                border: '1px solid #059669',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <ShieldCheck size={12} />
                SOC 2 Type II & NDPA Compliant
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.5 }}>
              All endpoints protected via TLS 1.3 encryption. Patient clinical health charts and 3D body maps remain zero-knowledge to platform administrative operators.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: '#cbd5e1' }}>
          <div>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: 11 }}>Active Threats</span>
            <strong style={{ fontSize: 14, color: '#34d399' }}>0 Critical</strong>
          </div>
          <div style={{ width: 1, height: 28, background: '#334155' }} />
          <div>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: 11 }}>MFA Compliance</span>
            <strong style={{ fontSize: 14, color: '#ffffff' }}>100% Enforced</strong>
          </div>
        </div>
      </div>

      {/* ── Executive Metric KPI Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>Privileged Admin Sessions</span>
            <Key size={18} color="#0f6e6e" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '8px 0 0' }}>{admins.length} Active</p>
          <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>All sessions MFA authenticated</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>WAF & Brute Force Blocks</span>
            <ShieldAlert size={18} color="#b91c1c" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#b91c1c', margin: '8px 0 0' }}>14 Blocked</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Zero penetration into core services</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>Clinical Vault Privacy Shield</span>
            <Lock size={18} color="#059669" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#059669', margin: '8px 0 0' }}>Enforced</p>
          <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>Zero-knowledge to platform admin</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>Data Encryption Standard</span>
            <ShieldCheck size={18} color="#2563eb" />
          </div>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#2563eb', margin: '8px 0 0' }}>AES-256</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>End-to-end TLS 1.3 in transit</span>
        </Card>
      </div>

      {/* ── Enterprise Security Policy Matrix ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Zero-Trust Security & Data Protection Policies
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
              Granular controls governing console authentication, network tunneling, and medical data shielding
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {policies.map((p) => (
            <Card
              key={p.key}
              style={{
                padding: '20px 22px',
                border: `1.5px solid ${p.enabled ? '#0f6e6e' : '#e2e8f0'}`,
                background: p.enabled ? '#f0fdfa' : '#ffffff',
                transition: 'all 150ms',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: p.enabled ? '#0f6e6e' : '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {p.category}
                    </span>
                    <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '3px 0 0' }}>
                      {p.title}
                    </h3>
                  </div>

                  {/* Interactive Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleTogglePolicy(p.key)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: p.enabled ? '#0f6e6e' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 200ms',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: 3,
                      left: p.enabled ? 23 : 3,
                      transition: 'left 200ms',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>

                <p style={{ fontSize: 12.5, color: '#475569', margin: '8px 0 0', lineHeight: 1.5 }}>
                  {p.desc}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10 }}>
                <span style={{ color: '#64748b' }}>Standard: <strong>{p.complianceRef}</strong></span>
                <span style={{
                  color: p.enabled ? '#0f6e6e' : '#64748b',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  {p.enabled ? <CheckCircle2 size={12} /> : null}
                  {p.enabled ? 'ACTIVE & ENFORCED' : 'DISABLED'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── 2-Column Section: Admins Directory + Live Incident Feed ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>

        {/* Left: Privileged Platform Administrators */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Privileged Platform Administrators ({admins.length})
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                Staff accounts with system configuration, billing, and facility oversight rights
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsInviteOpen(true)} leftIcon={<Plus size={14} />}>
              Add Admin
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>Administrator</th>
                  <th style={{ padding: '12px 16px' }}>Role & MFA</th>
                  <th style={{ padding: '12px 16px' }}>Last Activity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Session Control</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adm) => (
                  <tr key={adm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: '#e6f4f4', color: '#0f6e6e',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 12
                        }}>
                          {adm.firstName[0]}{adm.lastName[0]}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                            {adm.firstName} {adm.lastName}
                          </p>
                          <span style={{ fontSize: 11, color: '#64748b' }}>{adm.email}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{
                          background: '#f1f5f9', color: '#334155',
                          padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          width: 'fit-content'
                        }}>
                          Platform Admin
                        </span>
                        <span style={{
                          background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
                          padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', gap: 3, width: 'fit-content'
                        }}>
                          <ShieldCheck size={10} /> MFA Active
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12 }}>
                      {adm.lastLogin}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRevokeSession(adm.id, `${adm.firstName} ${adm.lastName}`)}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Live Security Threat Stream */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Live Security Telemetry Stream
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                WAF triggers, brute-force interventions, and MFA challenges
              </p>
            </div>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value as any)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 11.5,
                fontWeight: 700,
                color: '#334155',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="all">All Events</option>
              <option value="critical">Critical Attacks</option>
              <option value="warning">Warnings</option>
              <option value="info">System Info</option>
            </select>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
            {filteredEvents.map((evt) => {
              const isCrit = evt.type === 'critical';
              const isWarn = evt.type === 'warning';
              const isSuccess = evt.type === 'success';

              const badgeColor = isCrit
                ? { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', icon: ShieldAlert }
                : isWarn
                ? { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: AlertTriangle }
                : isSuccess
                ? { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: CheckCircle2 }
                : { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', icon: Globe };

              const Icon = badgeColor.icon;

              return (
                <div
                  key={evt.id}
                  style={{
                    background: badgeColor.bg,
                    border: `1px solid ${badgeColor.border}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={14} color={badgeColor.color} />
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {evt.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{evt.time}</span>
                  </div>

                  <p style={{ margin: 0, fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                    {evt.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11, color: '#64748b' }}>
                    <span style={{ fontFamily: 'monospace' }}>
                      {evt.ipAddress} • {evt.location}
                    </span>
                    {isCrit && (
                      <button
                        type="button"
                        onClick={() => handleBlacklistIP(evt.ipAddress)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fecaca',
                          color: '#b91c1c',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <Ban size={10} /> Blacklist IP
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* ── Invite Platform Administrator Modal ──────────────────────────────── */}
      {isInviteOpen && (
        <Modal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Invite Platform Security Administrator"
          size="md"
        >
          <form onSubmit={handleInviteAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 12,
              color: '#475569',
              lineHeight: 1.4
            }}>
              <strong>Security Protocol:</strong> Newly invited administrators must complete 2FA device binding (FIDO2 or Authenticator App) before gaining console access. All operations are logged to the immutable SHA-256 audit ledger.
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                First Name
              </label>
              <input
                type="text"
                required
                value={inviteFirstName}
                onChange={(e) => setInviteFirstName(e.target.value)}
                placeholder="e.g. Samuel"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1.5px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                Last Name
              </label>
              <input
                type="text"
                required
                value={inviteLastName}
                onChange={(e) => setInviteLastName(e.target.value)}
                placeholder="e.g. Adeleke"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1.5px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                Official Work Email
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. s.adeleke@ominipulse.ai"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1.5px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                Privileged Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1.5px solid #cbd5e1', fontSize: 13, color: '#0f172a',
                  background: '#ffffff', boxSizing: 'border-box'
                }}
              >
                <option value="admin">Platform Super-Admin (Full Infrastructure & Facility Oversight)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button variant="outline" type="button" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" leftIcon={<Plus size={14} />}>
                Dispatch Secure Invite
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
