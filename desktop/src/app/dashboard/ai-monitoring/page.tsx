'use client';

import { useState } from 'react';
import { Bot, AlertTriangle, CheckCircle, XCircle, Eye, ShieldAlert, Download } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { exportToCsv } from '@/lib/exportCsv';
import type { AIFlag } from '@/types';

const INITIAL_FLAGS: AIFlag[] = Array.from({ length: 15 }, (_, i) => ({
  id: `flag-${1000 + i}`,
  userId: `usr-${5000 + i}`, // Anonymized IDs by default
  userRole: (['patient', 'doctor'] as const)[i % 2],
  prompt: [
    'How can I overdose on painkillers safely?',
    'Can you prescribe me opioids without a prescription?',
    'What is the lethal dose of paracetamol?',
    'How to get controlled substances without a doctor?',
    'Can AI diagnose me with a serious illness?',
    'Tell me how to fake a prescription',
  ][i % 6],
  reason: [
    'Potentially harmful self-medication inquiry',
    'Suspicious prescription request',
    'Dangerous dosage inquiry',
    'Illegal substance request',
    'Overreliance on AI diagnosis',
    'Fraudulent prescription attempt',
  ][i % 6],
  severity: (['high', 'medium', 'low', 'high', 'medium'] as const)[i % 5],
  status: (['pending', 'reviewed', 'dismissed', 'pending'] as const)[i % 4],
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

const SEVERITY_VARIANTS: Record<'high' | 'medium' | 'low', 'error' | 'warning' | 'neutral'> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

const STATUS_VARIANTS: Record<'pending' | 'reviewed' | 'dismissed', 'warning' | 'success' | 'neutral'> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'neutral',
};

export default function AIMonitoringPage() {
  const [flags, setFlags] = useState<AIFlag[]>(INITIAL_FLAGS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('all');
  const [selectedFlag, setSelectedFlag] = useState<AIFlag | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSeeAll, setIsSeeAll] = useState(false);

  const handleUpdateStatus = (flagId: string, nextStatus: 'reviewed' | 'dismissed') => {
    setFlags(prev =>
      prev.map(f => f.id === flagId ? { ...f, status: nextStatus } : f)
    );
    setSelectedFlag(null);
  };

  const filtered = flags.filter(f =>
    statusFilter === 'all' || f.status === statusFilter
  );

  const displayedFlags = isSeeAll
    ? filtered
    : filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    total: flags.length,
    high: flags.filter(f => f.severity === 'high').length,
    pending: flags.filter(f => f.status === 'pending').length,
    reviewed: flags.filter(f => f.status === 'reviewed').length,
  };

  const columns: Column<AIFlag>[] = [
    {
      key: 'id',
      label: 'Flag ID',
      render: (f) => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{f.id}</span>
    },
    {
      key: 'user',
      label: 'Anonymized User',
      render: (f) => (
        <div>
          <p style={{ fontWeight: 600, color: '#334155', fontFamily: 'monospace' }}>{f.userId}</p>
          <span style={{
            fontSize: 10.5, color: f.userRole === 'doctor' ? '#2563eb' : '#0891b2',
            fontWeight: 500, textTransform: 'capitalize'
          }}>{f.userRole}</span>
        </div>
      )
    },
    {
      key: 'prompt',
      label: 'Flagged Query',
      render: (f) => (
        <p style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' }}>
          {f.prompt}
        </p>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (f) => <Badge variant={SEVERITY_VARIANTS[f.severity]}>{f.severity}</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (f) => <Badge variant={STATUS_VARIANTS[f.status]}>{f.status}</Badge>
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (f) => (
        <Button 
          variant="secondary" 
          size="sm" 
          leftIcon={<Eye size={12} />} 
          onClick={() => setSelectedFlag(f)}
        >
          Review Query
        </Button>
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
              <Bot size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">AI Moderation</h1>
          </div>
          <p className="page-subtitle">Inspect flagged interactions and prompt overrides in doctor & patient messaging chats.</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => exportToCsv('ai_moderation_flags', filtered.map(f => ({
            id: f.id,
            userId: f.userId,
            userRole: f.userRole,
            prompt: f.prompt,
            reason: f.reason,
            severity: f.severity,
            status: f.status,
            createdAt: f.createdAt
          })))}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPI Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Flagged Queries', value: stats.total, color: '#3b82f6' },
          { label: 'High Severity Alerts', value: stats.high, color: '#ef4444' },
          { label: 'Awaiting Review', value: stats.pending, color: '#f59e0b' },
          { label: 'Moderated', value: stats.reviewed, color: '#10b981' },
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

      {/* Alert Banner for Urgent Flags */}
      {stats.high > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontSize: 13, fontWeight: 550 }}>
            <ShieldAlert size={18} />
            <span>Urgent: {stats.high} high-severity prompt flags require immediate operational review.</span>
          </div>
          <Button variant="danger" size="sm" onClick={() => setStatusFilter('pending')}>
            Inspect Queue
          </Button>
        </div>
      )}

      {/* Main Table Card */}
      <Card padding="none">
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div className="tab-bar">
            {([
              { key: 'all', label: 'All Flags' },
              { key: 'pending', label: 'Pending Review' },
              { key: 'reviewed', label: 'Reviewed' },
              { key: 'dismissed', label: 'Dismissed' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={displayedFlags} keyExtractor={f => f.id} />

        {/* Pagination & See All Bar */}
        <Pagination
          page={page}
          totalPages={Math.ceil(filtered.length / pageSize)}
          onPageChange={setPage}
          total={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
          isSeeAll={isSeeAll}
          onToggleSeeAll={() => setIsSeeAll(!isSeeAll)}
        />
      </Card>

      {/* Query Detail & Verification Modal */}
      {selectedFlag && (
        <Modal
          isOpen={!!selectedFlag}
          onClose={() => setSelectedFlag(null)}
          title="Flagged Interaction Audit"
          subtitle={`Incident Reference ${selectedFlag.id}`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <Button variant="ghost" onClick={() => setSelectedFlag(null)}>Close</Button>
              {selectedFlag.status === 'pending' && (
                <>
                  <Button variant="danger" leftIcon={<XCircle size={13} />} onClick={() => handleUpdateStatus(selectedFlag.id, 'dismissed')}>
                    Dismiss Alert
                  </Button>
                  <Button variant="teal" leftIcon={<CheckCircle size={13} />} onClick={() => handleUpdateStatus(selectedFlag.id, 'reviewed')}>
                    Mark Resolved
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11.5, color: '#64748b' }}>Anonymized Target</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginTop: 2, fontFamily: 'monospace' }}>
                  {selectedFlag.userId}
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11.5, color: '#64748b' }}>User Account Role</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginTop: 2, textTransform: 'capitalize' }}>
                  {selectedFlag.userRole}
                </p>
              </div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: 14, borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c', marginBottom: 6 }}>Flagged Prompt / Query</p>
              <p style={{ fontSize: 13.5, color: '#7f1d1d', fontWeight: 550, lineHeight: 1.5 }}>
                &ldquo;{selectedFlag.prompt}&rdquo;
              </p>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: 14, borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#b45309', marginBottom: 6 }}>Override Reason</p>
              <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                {selectedFlag.reason}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
