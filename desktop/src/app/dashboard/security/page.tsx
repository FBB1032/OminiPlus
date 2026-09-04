'use client';

import { useState } from 'react';
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Monitor, ShieldAlert, Plus, Download, Clock, Globe } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { ROLE_LABELS, ROLE_COLORS } from '@/store/permissionStore';
import type { Admin, AdminRole } from '@/types';

const INITIAL_EVENTS = [
  { id: 1, type: 'warning', message: 'Failed login attempt from IP 45.132.22.1', time: '12 min ago' },
  { id: 2, type: 'info', message: 'Admin Sarah Chen logged in from new device', time: '1 hr ago' },
  { id: 3, type: 'success', message: '2FA enabled for admin account mark.davis@ominipulse.ai', time: '2 hr ago' },
  { id: 4, type: 'error', message: '5 consecutive failed login attempts — IP temporarily blocked', time: '3 hr ago' },
  { id: 5, type: 'info', message: 'Password changed for admin admin@ominipulse.ai', time: '1 day ago' },
];

const INITIAL_ADMINS: Admin[] = [
  { id: 'adm-1', email: 'sarah.chen@ominipulse.ai',      firstName: 'Sarah',    lastName: 'Chen',    role: 'admin',  isTwoFactorEnabled: true,  createdAt: '2025-01-01', lastLogin: '2 min ago' },
  { id: 'adm-2', email: 'mark.davis@ominipulse.ai',       firstName: 'Mark',     lastName: 'Davis',   role: 'admin',  isTwoFactorEnabled: true,  createdAt: '2025-02-15', lastLogin: '1 hr ago' },
  { id: 'adm-3', email: 'doctor.portal@ominipulse.ai',    firstName: 'Dr. Folake', lastName: 'Ademola', role: 'doctor', isTwoFactorEnabled: false, createdAt: '2025-03-10', lastLogin: '3 hr ago' },
];

const EVENT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  warning: { bg: '#fffbeb', color: '#b45309', border: '#fef3c7' },
  info: { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' },
  success: { bg: '#f0fdf4', color: '#15803d', border: '#dcfce7' },
  error: { bg: '#fef2f2', color: '#b91c1c', border: '#fee2e2' },
};

export default function SecurityPage() {
  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllAdmins, setShowAllAdmins] = useState(false);
  
  // Invite form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');

  // Policy Settings state
  const [policies, setPolicies] = useState([
    { key: 'tfa', label: '2-Factor Authentication', desc: 'Enforce 2FA checks for all administrative logins', enabled: true },
    { key: 'ipAllow', label: 'IP Allowlisting', desc: 'Restrict operations logins to approved institutional networks', enabled: false },
    { key: 'timeout', label: 'Session Timeout', desc: 'Automatically terminate admin operations after 8 hours of inactivity', enabled: true },
    { key: 'brute', label: 'Brute Force Protection', desc: 'Lock remote IP access temporarily after 5 sequential failures', enabled: true },
  ]);

  const handleTogglePolicy = (key: string) => {
    setPolicies(prev =>
      prev.map(p => p.key === key ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return;

    const newAdmin: Admin = {
      id: `adm-${Date.now()}`,
      email,
      firstName,
      lastName,
      role,
      isTwoFactorEnabled: false,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    setAdmins(prev => [...prev, newAdmin]);
    setIsInviteOpen(false);
    setEmail('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Security Center</h1>
          </div>
          <p className="page-subtitle">Configure authorization constraints, oversee console logins, and verify admin roles.</p>
        </div>

        <button className="btn btn-secondary">
          <Download size={14} /> Audit Export
        </button>
      </div>

      {/* Security Status KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {[
          { label: 'Security Compliance', value: '94/100', color: '#16a34a', bg: '#f0fdf4', icon: Shield },
          { label: 'Active Console Sessions', value: '3 Active', color: '#0f6e6e', bg: '#e6f4f4', icon: Monitor },
          { label: 'Temporarily Blocked IPs', value: '4 Blocks', color: '#dc2626', bg: '#fef2f2', icon: Lock },
        ].map((s, idx) => (
          <Card key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{s.value}</p>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0
            }}>
              <s.icon size={20} />
            </div>
          </Card>
        ))}
      </div>

      {/* Security Logs feed Card */}
      <Card padding="lg">
        <CardHeader title="Realtime Security Events" subtitle="Audited security override activities" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {(showAllEvents ? events : events.slice(0, 10)).map((e) => {
            const styles = EVENT_STYLES[e.type] || EVENT_STYLES.info;
            return (
              <div key={e.id} style={{
                display: 'flex', gap: 14, padding: '16px 20px', borderRadius: 12, border: `1px solid ${styles.border}`,
                background: styles.bg, color: styles.color, fontSize: 13.5
              }}>
                <ShieldAlert size={18} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, lineHeight: 1.4 }}>{e.message}</p>
                  <p style={{ fontSize: 11.5, opacity: 0.8, marginTop: 4 }}>{e.time}</p>
                </div>
              </div>
            );
          })}
          {events.length > 10 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllEvents(!showAllEvents)} style={{ alignSelf: 'center', marginTop: 8 }}>
              {showAllEvents ? 'Show First 10' : `See All Events (${events.length})`}
            </Button>
          )}
        </div>
      </Card>

      {/* Admins manager Card */}
      <Card padding="lg">
        <CardHeader 
          title="Administrative Access Control" 
          subtitle="Verify role configuration clearances"
          action={
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsInviteOpen(true)}>
              Add Admin
            </Button>
          }
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {(showAllAdmins ? admins : admins.slice(0, 10)).map((a) => {
            const roleColor = ROLE_COLORS[a.role] || { bg: '#f1f5f9', color: '#475569' };
            return (
              <div key={a.email} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 12,
                background: '#f8fafc', border: '1px solid #e2e8e0'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: '#0f6e6e', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                  flexShrink: 0
                }}>
                  {a.firstName[0]}{a.lastName[0]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 650, color: '#1e293b' }}>{a.firstName} {a.lastName}</p>
                    <Badge variant="admin" size="sm" style={{ background: roleColor.bg, color: roleColor.color }}>
                      {ROLE_LABELS[a.role]}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{a.email} · Last Login: {a.lastLogin}</p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {a.isTwoFactorEnabled ? (
                    <Badge variant="success" size="sm">2FA Active</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">No 2FA</Badge>
                  )}
                </div>
              </div>
            );
          })}
          {admins.length > 10 && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllAdmins(!showAllAdmins)} style={{ alignSelf: 'center', marginTop: 8 }}>
              {showAllAdmins ? 'Show First 10' : `See All Admins (${admins.length})`}
            </Button>
          )}
        </div>
      </Card>

      {/* Policy Settings section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.015em' }}>Security Controls & Policies</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Configure baseline login and session constraints</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {policies.map((p) => {
            const Icon = p.key === 'tfa' ? Key : p.key === 'ipAllow' ? Globe : p.key === 'timeout' ? Clock : ShieldAlert;
            return (
              <Card 
                key={p.key} 
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: 24,
                  transition: 'all 200ms ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: p.enabled ? '#e6f4f4' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: p.enabled ? '#0f6e6e' : '#64748b',
                    }}>
                      <Icon size={18} />
                    </div>
                    <Badge variant={p.enabled ? 'success' : 'neutral'} size="sm">
                      {p.enabled ? 'Enforced' : 'Disabled'}
                    </Badge>
                  </div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{p.label}</h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>{p.desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                    {p.enabled ? 'Click to disable' : 'Click to enable'}
                  </span>
                  <button 
                    onClick={() => handleTogglePolicy(p.key)}
                    style={{
                      position: 'relative', width: 42, height: 24, borderRadius: 100, border: 'none',
                      background: p.enabled ? '#0f6e6e' : '#cbd5e1', cursor: 'pointer', transition: 'background 150ms'
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 2, left: p.enabled ? 20 : 2, width: 20, height: 20,
                      borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      transition: 'left 150ms'
                    }} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invite Admin Modal */}
      {isInviteOpen && (
        <Modal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Grant Console Security Clearance"
          subtitle="Invite a new administrator account to operations dashboard"
        >
          <form onSubmit={handleInviteAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Corporate Email *
              </label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@ominipulse.ai"
              />
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Operational Role Clearance *
              </label>
              <select 
                className="select"
                value={role}
                onChange={e => setRole(e.target.value as any)}
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Grant Clearance</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
