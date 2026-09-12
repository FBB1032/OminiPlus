'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Send, Users, Stethoscope, Globe, Plus, Download, Mail, Clock, CheckCheck } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { exportToCsv } from '@/lib/exportCsv';
import { liveApi } from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import type { Notification } from '@/types';

const INITIAL_NOTIFICATIONS: (Notification & { isRead?: boolean })[] = [
  { id: 'n1', title: 'App Maintenance Window', body: 'We will be performing scheduled maintenance on June 10th from 2AM–4AM WAT. Services may be briefly unavailable.', type: 'system', targetAudience: 'all', status: 'sent', sentAt: '2026-06-04T09:00:00Z', createdAt: '2026-06-04T08:00:00Z', isRead: false },
  { id: 'n2', title: 'New Feature: Video Consultations', body: 'We\'ve launched HD video consultations! Book your next appointment as a video call.', type: 'announcement', targetAudience: 'patients', status: 'sent', sentAt: '2026-06-03T12:00:00Z', createdAt: '2026-06-03T11:00:00Z', isRead: false },
  { id: 'n3', title: 'Doctor Verification Reminder', body: 'Please complete your profile verification to start accepting consultations.', type: 'reminder', targetAudience: 'doctors', status: 'sent', sentAt: '2026-06-02T10:00:00Z', createdAt: '2026-06-02T09:00:00Z', isRead: true },
  { id: 'n4', title: 'Holiday Hours Notice', body: 'Support hours will be limited on June 12th for the public holiday.', type: 'announcement', targetAudience: 'all', status: 'draft', createdAt: '2026-06-05T08:00:00Z', isRead: true },
  { id: 'n5', title: 'Scheduled Maintenance', body: 'Routine server maintenance scheduled for June 15th midnight.', type: 'system', targetAudience: 'all', status: 'scheduled', scheduledAt: '2026-06-15T00:00:00Z', createdAt: '2026-06-05T10:00:00Z', isRead: false },
];

const AUDIENCE_ICONS: Record<string, React.ReactNode> = {
  all: <Globe size={13} style={{ color: '#2563eb' }} />,
  patients: <Users size={13} style={{ color: '#0ea5e9' }} />,
  doctors: <Stethoscope size={13} style={{ color: '#10b981' }} />,
  staff: <Users size={13} style={{ color: '#8b5cf6' }} />,
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
  const [notifications, setNotifications] = useState<(Notification & { isRead?: boolean; recipients?: number })[]>(INITIAL_NOTIFICATIONS);
  const [showCompose, setShowCompose] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [feedback, setFeedback] = useState('');

  const triggerFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  }, []);

  // Load live broadcast history; keep the demo set on any failure.
  const loadBroadcasts = useCallback(async () => {
    const live = await liveApi.getBroadcasts();
    if (live && live.length > 0) {
      const mapped: (Notification & { isRead: boolean; recipients?: number })[] = live.map((b) => ({
        id: b.id,
        title: b.title,
        body: b.body,
        type: b.type,
        targetAudience: b.targetAudience,
        status: b.status,
        sentAt: b.sentAt ?? undefined,
        scheduledAt: b.scheduledAt ?? undefined,
        createdAt: b.createdAt,
        isRead: b.status !== 'sent',
        recipients: b.recipientCount || undefined,
      }));
      setNotifications(mapped);
      setIsLive(true);
    }
  }, []);

  useEffect(() => {
    void loadBroadcasts();
    // Realtime: dispatches from ANY admin session (or the scheduled sweep)
    // appear here instantly — universal delivery accounting.
    const unsubscribe = realtimeService.subscribe((msg) => {
      if (msg.event === 'broadcast.delivered') {
        void loadBroadcasts();
        const recipients = (msg.payload as { recipients?: number }).recipients;
        triggerFeedback(`Broadcast "${(msg.payload as { title?: string }).title ?? ''}" delivered to ${recipients ?? '?'} recipients.`);
      }
    });
    return unsubscribe;
  }, [loadBroadcasts, triggerFeedback]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'doctors' | 'patients' | 'staff'>('all');
  const [type, setType] = useState<'announcement' | 'reminder' | 'alert' | 'system'>('announcement');

  const handleSendNotification = async (status: 'sent' | 'draft') => {
    if (!title.trim() || !body.trim()) return;

    if (isLive) {
      // Live path: create the broadcast server-side, then dispatch it.
      // The fan-out writes one notifications row per recipient and pushes
      // a realtime event to every connected admin/desktop session.
      const created = await liveApi.createBroadcast({ title, body, type, targetAudience: audience });
      if (created) {
        if (status === 'sent') {
          const dispatched = await liveApi.dispatchBroadcast(created.id);
          triggerFeedback(
            dispatched
              ? `Broadcast dispatched to ${dispatched.recipients} recipients.`
              : 'Broadcast saved but dispatch failed — retry from the log.'
          );
        } else {
          triggerFeedback('Broadcast draft saved.');
        }
        await loadBroadcasts();
        setShowCompose(false);
        setTitle('');
        setBody('');
        setAudience('all');
        setType('announcement');
        return;
      }
      triggerFeedback('Live backend unreachable — broadcast saved locally only.');
    }

    // Demo/offline fallback (local state only)
    const newNotif: Notification & { isRead?: boolean } = {
      id: `n-${Date.now()}`,
      title,
      body,
      type,
      targetAudience: audience,
      status,
      createdAt: new Date().toISOString(),
      sentAt: status === 'sent' ? new Date().toISOString() : undefined,
      isRead: false,
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
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={markAllAsRead}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCheck size={14} />
              Mark All Read
              <span style={{
                background: '#0F6E6E', color: '#fff', fontSize: 10.5,
                fontWeight: 700, borderRadius: 999, padding: '1px 7px',
              }}>{unreadCount}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => exportToCsv('notifications_broadcast_logs', notifications.map(n => ({
              id: n.id,
              title: n.title,
              body: n.body,
              type: n.type,
              targetAudience: n.targetAudience,
              status: n.status,
              sentAt: n.sentAt || '',
              createdAt: n.createdAt
            })))}
          >
            <Download size={14} /> Export Logs
          </button>
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setShowCompose(true)}>
            Compose Broadcast
          </Button>
        </div>
      </div>

      {/* Delivery feedback toast (realtime dispatch confirmations) */}
      {feedback && (
        <div style={{
          background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46',
          borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600,
        }}>
          {feedback}
        </div>
      )}

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
              onClick={() => markAsRead(n.id)}
              style={{
                display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
                transition: 'background 120ms', cursor: 'pointer',
                borderLeft: !n.isRead ? '3px solid #0F6E6E' : '3px solid transparent',
                background: !n.isRead ? '#f0fdfa' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = !n.isRead ? '#e6faf6' : '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = !n.isRead ? '#f0fdfa' : 'transparent'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Bell size={16} style={{ color: '#2563eb' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: n.isRead ? 500 : 700, color: '#1e293b' }}>{n.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {!n.isRead && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#0F6E6E', flexShrink: 0,
                        display: 'inline-block',
                      }} />
                    )}
                    <Badge variant={STATUS_VARIANTS[n.status]}>{n.status}</Badge>
                  </div>
                </div>
                
                <p style={{ fontSize: 13, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>{n.body}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
                  <Badge variant={TYPE_VARIANTS[n.type]} size="sm">{n.type}</Badge>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                    {AUDIENCE_ICONS[n.targetAudience] ?? <Users size={13} style={{ color: '#64748b' }} />}
                    <span style={{ textTransform: 'capitalize' }}>Audience: {n.targetAudience}</span>
                  </span>
                  {n.recipients != null && n.recipients > 0 && (
                    <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                      Delivered to {n.recipients} recipients
                    </span>
                  )}
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
                  <option value="staff">Hospital Staff Only</option>
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
