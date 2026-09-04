'use client';

import { useState } from 'react';
import { ScrollText, Search, Download, Globe, Clock, User, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import type { AuditLog } from '@/types';

const ACTIONS = [
  'Approved doctor verification', 'Rejected doctor application', 'Suspended doctor account',
  'Reactivated doctor account', 'Added hospital partner', 'Sent push notification',
  'Updated system settings', 'Reviewed AI flag', 'Dismissed report',
  'Updated pharmacy status', 'Changed admin role', 'Terminated admin session'
];

const MOCK_LOGS: AuditLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: `log-${1000 + i}`,
  adminId: `adm-${(i % 3) + 1}`,
  adminName: ['Sarah Chen', 'Mark Davis', 'System Automator'][i % 3],
  action: ACTIONS[i % ACTIONS.length],
  resource: ['Doctor', 'Hospital', 'Pharmacy', 'Notification', 'Report', 'Security', 'Settings'][i % 7],
  resourceId: `res-${200 + i}`,
  ipAddress: `192.168.10.${10 + i}`,
  userAgent: 'Chrome/124.0 on macOS',
  createdAt: new Date(Date.now() - i * 1800000).toISOString(),
}));

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filtered = MOCK_LOGS.filter(l =>
    !search || 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.adminName.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (l) => (
        <span style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
          {new Date(l.createdAt).toLocaleString()}
        </span>
      )
    },
    {
      key: 'adminName',
      label: 'Authorized Admin',
      render: (l) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700
          }}>
            {l.adminName[0]}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: '#334155' }}>{l.adminName}</span>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', marginLeft: 6 }}>{l.adminId}</span>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Operation Activity',
      render: (l) => <span style={{ color: '#1e293b', fontWeight: 500 }}>{l.action}</span>
    },
    {
      key: 'resource',
      label: 'System Resource',
      render: (l) => (
        <div>
          <Badge variant="neutral" size="sm">{l.resource}</Badge>
          <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#94a3b8', marginLeft: 6 }}>
            {l.resourceId}
          </span>
        </div>
      )
    },
    {
      key: 'ipAddress',
      label: 'Connection IP',
      render: (l) => (
        <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: 12.5 }}>
          {l.ipAddress}
        </span>
      )
    }
  ];

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
              <ScrollText size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Security Audit Log</h1>
          </div>
          <p className="page-subtitle">Immutable compliance trails of all administrative and operations changes.</p>
        </div>

        <button className="btn btn-secondary">
          <Download size={14} /> Export Logs
        </button>
      </div>

      {/* KPI stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Operations Logs', value: MOCK_LOGS.length },
          { label: 'Active Admins Today', value: 3 },
          { label: 'Distinct Security Events', value: 12 },
        ].map((s, idx) => (
          <div key={idx} style={{
            background: '#ffffff', border: '1px solid #f3f4f6', borderRadius: 12, padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.03em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <Card padding="none">
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, height: 38, padding: '0 12px', width: 320,
          }}>
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search logs by action or admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: '#334155', width: '100%', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Immutable Logs Table */}
      <Card padding="none">
        <Table columns={columns} data={showAll ? filtered : filtered.slice(0, 10)} keyExtractor={l => l.id} />

        {filtered.length > 10 && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Showing {showAll ? filtered.length : Math.min(10, filtered.length)} of {filtered.length} audit logs
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show First 10' : `See All (${filtered.length})`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
