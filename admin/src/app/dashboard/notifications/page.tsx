'use client';

import { useState } from 'react';
import { Bell, Send, Users, Stethoscope, Globe, Plus, Download, Mail, Clock } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Notification } from '@/types';

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'App Maintenance Window', body: 'We will be performing scheduled maintenance on June 10th from 2AM–4AM WAT. Services may be briefly unavailable.', type: 'system', targetAudience: 'all', status: 'sent', sentAt: '2026-06-04T09:00:00Z', createdAt: '2026-06-04T08:00:00Z' },
  { id: 'n2', title: 'New Feature: Video Consultations', body: 'We\'ve launched HD video consultations! Book your next appointment as a video call.', type: 'announcement', targetAudience: 'patients', status: 'sent', sentAt: '2026-06-03T12:00:00Z', createdAt: '2026-06-03T11:00:00Z' },
  { id: 'n3', title: 'Doctor Verification Reminder', body: 'Please complete your profile verification to start accepting consultations.', type: 'reminder', targetAudience: 'doctors', status: 'sent', sentAt: '2026-06-02T10:00:00Z', createdAt: '2026-06-02T09:00:00Z' },
  { id: 'n4', title: 'Holiday Hours Notice', body: 'Support hours will be limited on June 12th for the public holiday.', type: 'announcement', targetAudience: 'all', status: 'draft', createdAt: '2026-06-05T08:00:00Z' },
  { id: 'n5', title: 'Scheduled Maintenance', body: 'Routine server maintenance scheduled for June 15th midnight.', type: 'system', targetAudience: 'all', status: 'scheduled', scheduledAt: '2026-06-15T00:00:00Z', createdAt: '2026-06-05T10:00:00Z' },
];

const AUDIENCE_ICONS = {
  all: <Globe size={13} style={{ color: '#2563eb' }} />,
  patients: <Users size={13} style={{ color: '#0ea5e9' }} />,
  doctors: <Stethoscope size={13} style={{ color: '#10b981' }} />,
};

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'neutral'> = {
  sent: 'success',
  scheduled: 'warning',
  draft: 'neutral',
};

const TYPE_VARIANTS: Record<string, 'primary' | 'warning' | 'info' | 'neutral'> = {
  announcement: 'primary',
  reminder: 'warning',
  alert: 'info',
  system: 'neutral',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showCompose, setShowCompose] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  // Compose Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'doctors' | 'patients'>('all');
  const [type, setType] = useState<'announcement' | 'reminder' | 'alert' | 'system'>('announcement');

  const handleSendNotification = (status: 'sent' | 'draft') => {
    if (!title.trim() || !body.trim()) return;

    const newNotif: Notification = {
      id: `n-${Date.now()}`,
      title,
      body,
      type,
      targetAudience: audience,
      status,
      createdAt: new Date().toISOString(),
      sentAt: status === 'sent' ? new Date().toISOString() : undefined,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setShowCompose(false);
    setTitle('');
    setBody('');
    setAudience('all');
    setType('announcement');
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
              <Bell size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Broadcast Center</h1>
          </div>
          <p className="page-subtitle">Publish system announcements, send target push reminders, and configure notification campaigns.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">
            <Download size={14} /> Export Logs
          </button>
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setShowCompose(true)}>
            Compose Broadcast
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Dispatched Messages', value: notifications.filter(n => n.status === 'sent').length, icon: Send, iconColor: '#16a34a', bg: '#f0fdf4' },
          { label: 'Scheduled Broadcasts', value: notifications.filter(n => n.status === 'scheduled').length, icon: Clock, iconColor: '#d97706', bg: '#fffbeb' },
          { label: 'Active Drafts', value: notifications.filter(n => n.status === 'draft').length, icon: Mail, iconColor: '#64748b', bg: '#f1f5f9' },
        ].map((s, idx) => (
          <div key={idx} style={{
            background: '#ffffff', border: '1px solid #f3f4f6', borderRadius: 12, padding: '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, flexShrink: 0
            }}>
              <s.icon size={20} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{s.value}</p>
              <p style={{ fontSize: 12.5, fontWeight: 500, color: '#64748b', marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Broadcast list card */}
      <Card padding="none">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b' }}>Notification Logs</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(showAll ? notifications : notifications.slice(0, 10)).map((n) => (
            <div 
              key={n.id} 
              style={{
                display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
                transition: 'background 120ms'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Bell size={16} style={{ color: '#2563eb' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 650, color: '#1e293b' }}>{n.title}</h4>
                  <Badge variant={STATUS_VARIANTS[n.status]}>{n.status}</Badge>
                </div>
                
                <p style={{ fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>{n.body}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
                  <Badge variant={TYPE_VARIANTS[n.type]} size="sm">{n.type}</Badge>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                    {AUDIENCE_ICONS[n.targetAudience]}
                    <span style={{ textTransform: 'capitalize' }}>Audience: {n.targetAudience}</span>
                  </span>
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    {n.sentAt ? `Sent: ${new Date(n.sentAt).toLocaleString()}` : n.scheduledAt ? `Scheduled: ${new Date(n.scheduledAt).toLocaleString()}` : `Created: ${new Date(n.createdAt).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length > 10 && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Showing {showAll ? notifications.length : Math.min(10, notifications.length)} of {notifications.length} notifications
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show First 10' : `See All (${notifications.length})`}
            </Button>
          </div>
        )}
      </Card>

      {/* Compose Notification Modal */}
      {showCompose && (
        <Modal
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          title="Compose Platform Broadcast"
          subtitle="Deploy push announcements or reminder streams"
          footer={
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
              <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => handleSendNotification('draft')}>Save Draft</Button>
              <Button variant="primary" leftIcon={<Send size={13} />} onClick={() => handleSendNotification('sent')}>
                Dispatch Broadcast
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Broadcast Title
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Scheduled Network Upgrade"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Message Body
              </label>
              <textarea
                className="input"
                style={{ height: 100, resize: 'none', padding: '8px 12px' }}
                placeholder="Compose notification message detail..."
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Target Audience
                </label>
                <select 
                  className="select"
                  value={audience}
                  onChange={e => setAudience(e.target.value as any)}
                >
                  <option value="all">All Users</option>
                  <option value="doctors">Doctors Only</option>
                  <option value="patients">Patients Only</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Broadcast Type
                </label>
                <select 
                  className="select"
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                >
                  <option value="announcement">Announcement</option>
                  <option value="reminder">Reminder</option>
                  <option value="alert">Alert</option>
                  <option value="system">System Warning</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
