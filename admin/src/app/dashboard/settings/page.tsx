'use client';

import { useState } from 'react';
import { Settings, Globe, Bell, Palette, Database, Save, Sparkles, Shield, Activity, User, Mail, FileSpreadsheet, Layout, Server, Check } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TABS = [
  { key: 'general', label: 'General Settings', icon: Settings },
  { key: 'notifications', label: 'Alert Routing', icon: Bell },
  { key: 'appearance', label: 'Platform Theme', icon: Palette },
  { key: 'data', label: 'Compliance & GDPR', icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');

  // General Settings states
  const [platformName, setPlatformName] = useState('Omini Pulse');
  const [supportEmail, setSupportEmail] = useState('operations@ominipulse.ai');
  const [commission, setCommission] = useState('15');
  const [duration, setDuration] = useState('30');

  // Notification Preferences states
  const [notifs, setNotifs] = useState([
    { key: 'n-doc', label: 'New doctor verification credentials uploaded', enabled: true },
    { key: 'n-ai', label: 'High-severity conversational override logs', enabled: true },
    { key: 'n-rep', label: 'User complaints or abuse filings', enabled: true },
    { key: 'n-sec', label: 'Suspicious login/admin attempts', enabled: false },
  ]);

  const handleToggleNotif = (key: string) => {
    setNotifs(prev =>
      prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
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
              <Settings size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Settings</h1>
          </div>
          <p className="page-subtitle">Configure system parameters, notification alerts, and data retention policies.</p>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #dcfce7', padding: '12px 16px', borderRadius: 10,
          color: '#15803d', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Sparkles size={16} />
          {successMsg}
        </div>
      )}

      {/* Main Settings Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Navigation panel */}
        <Card style={{ padding: '16px 14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                  borderRadius: 10, fontSize: 13.5, fontWeight: activeTab === t.key ? 600 : 500,
                  color: activeTab === t.key ? '#fff' : '#64748b',
                  background: activeTab === t.key ? '#0f6e6e' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 120ms',
                  textAlign: 'left'
                }}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Form representation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeTab === 'general' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Card padding="lg">
                <CardHeader title="General Configuration" subtitle="Core settings for Omini Pulse dashboard operations" />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                      System Identity & Communications
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                          Console Brand Name
                        </label>
                        <input 
                          type="text" 
                          className="input" 
                          value={platformName} 
                          onChange={e => setPlatformName(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                          Ops Support Email
                        </label>
                        <input 
                          type="email" 
                          className="input" 
                          value={supportEmail} 
                          onChange={e => setSupportEmail(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                      Financial & Operations Tuning
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                          Platform Fee Commission (%)
                        </label>
                        <input 
                          type="number" 
                          className="input" 
                          value={commission} 
                          onChange={e => setCommission(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                          Consultation Session Window (min)
                        </label>
                        <input 
                          type="number" 
                          className="input" 
                          value={duration} 
                          onChange={e => setDuration(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <Button type="submit" variant="primary" leftIcon={<Save size={13} />}>
                    Save General Settings
                  </Button>
                </div>
              </Card>
            </form>
          )}

          {activeTab === 'notifications' && (
            <Card padding="lg">
              <CardHeader title="Alert Routing Priorities" subtitle="Configure email and push notification event triggers" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                {notifs.map((n) => {
                  const Icon = n.key.includes('doc') ? User : n.key.includes('ai') ? Activity : n.key.includes('rep') ? Shield : Mail;
                  const iconColor = n.enabled ? '#2563eb' : '#64748b';
                  const iconBg = n.enabled ? '#eff6ff' : '#f1f5f9';

                  return (
                    <div 
                      key={n.key} 
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12,
                        border: '1px solid #e2e8f0', background: n.enabled ? '#ffffff' : '#f8fafc',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, background: iconBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: iconColor, flexShrink: 0
                        }}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 650, color: '#1e293b' }}>{n.label}</p>
                          <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            {n.enabled ? 'Routing actively enabled for admin team' : 'Muted (Internal events logged only)'}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleToggleNotif(n.key)}
                        style={{
                          position: 'relative', width: 40, height: 22, borderRadius: 100, border: 'none',
                          background: n.enabled ? '#2563eb' : '#cbd5e1', cursor: 'pointer', transition: 'background 150ms',
                          flexShrink: 0
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 2, left: n.enabled ? 20 : 2, width: 18, height: 18,
                          borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                          transition: 'left 150ms'
                        }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card padding="lg">
              <CardHeader title="Platform Visual Identity" subtitle="Theme colors matching Omini Pulse workspace design tokens" />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>Select Brand Hue</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                    {[
                      { hex: '#2563eb', name: 'Classic Royal Blue' },
                      { hex: '#0ea5e9', name: 'Ocean Sky' },
                      { hex: '#0891b2', name: 'Teal Forest' },
                      { hex: '#7c3aed', name: 'Midnight Purple' }
                    ].map((c) => {
                      const selected = c.hex === '#2563eb';
                      return (
                        <div 
                          key={c.hex} 
                          style={{
                            border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            borderRadius: 12, padding: 14, background: '#ffffff', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', gap: 10, position: 'relative'
                          }}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: c.hex, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            {selected && <Check size={14} />}
                          </div>
                          <div>
                            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b' }}>{c.name}</p>
                            <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1, fontFamily: 'monospace' }}>{c.hex}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'data' && (
            <Card padding="lg">
              <CardHeader title="NDPA 2023 Compliance & Data Retention Policies" subtitle="Overview of operational records retention periods and privacy controls" />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4
                }}>
                  <Server size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                    Omini Pulse administrative servers operate in <strong>strict NDPA 2023 compliance mode</strong>. Audit logs track all record view/export operations, and payment escrow mechanisms enforce provider non-performance penalties.
                  </p>
                </div>

                {[
                  { label: 'NDPA Data Protection Officer Audit Log Retention', value: '24 Months', percent: 100 },
                  { label: 'Patient Record Access Audit Trail (Who Viewed My Records)', value: 'Permanent & Immutably Encrypted', percent: 100 },
                  { label: 'Escrow Auto-Release Window', value: '24 Hours Post-Appointment Confirmation', percent: 100 },
                  { label: 'Doctor License Expiry Check & Lock', value: 'Enforced at MDCN Expiry Date', percent: 100 },
                  { label: 'NDPA Article 26 Data Portability Archive Export', value: 'Enabled (PDF / ZIP)', percent: 100 },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 12.5, color: '#059669', fontWeight: 600 }}>{item.value}</span>
                    </div>
                    {/* Status Bar */}
                    <div style={{ height: 6, width: '100%', background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.percent}%`, background: '#10b981', borderRadius: 100 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
