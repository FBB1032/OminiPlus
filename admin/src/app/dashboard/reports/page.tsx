'use client';

import { useState } from 'react';
import { Flag, Eye, CheckCircle, XCircle, Download, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, Column } from '@/components/ui/Table';
import type { Report } from '@/types';

// Helper to mask patients
function getMaskedReporter(id: string, name: string) {
  const parts = name.split(' ');
  const initials = parts.map(p => p[0]).join('').toUpperCase();
  const numericId = id.replace(/\D/g, '') || id.substring(1, 6);
  return `${initials} — P-${numericId}`;
}

const INITIAL_REPORTS: Report[] = Array.from({ length: 15 }, (_, i) => ({
  id: `rep-${1000 + i}`,
  reporterId: `pat-${4900 + i}`,
  reporterName: ['Aisha Okonkwo', 'Babatunde Balogun', 'Chioma Nwachukwu', 'Efe Adebayo'][i % 4],
  targetId: `t-${i}`,
  targetName: ['Dr. Tunde Alao', 'MedBridge Pharmacy', 'Lagos General Hospital', 'Dr. Amina Bello'][i % 4],
  targetType: (['doctor', 'pharmacy', 'hospital', 'doctor'] as const)[i % 4],
  category: (['fake_credentials', 'inappropriate_behavior', 'fraud', 'spam', 'other'] as const)[i % 5],
  description: 'Suspicious consultation behaviors reported. The target provider may have misstated credentials or conducted poor practice.',
  status: (['pending', 'under_review', 'resolved', 'dismissed', 'pending'] as const)[i % 5],
  severity: (['high', 'medium', 'low', 'critical', 'medium'] as const)[i % 5],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const STATUS_VARIANTS: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  pending: 'warning',
  under_review: 'info',
  resolved: 'success',
  dismissed: 'neutral',
};

const SEVERITY_VARIANTS: Record<string, 'error' | 'warning' | 'neutral'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'resolved' | 'dismissed'>('all');
  const [showAll, setShowAll] = useState(false);

  const handleUpdateStatus = (reportId: string, nextStatus: 'resolved' | 'dismissed' | 'under_review') => {
    setReports(prev =>
      prev.map(r => r.id === reportId ? { ...r, status: nextStatus, resolvedAt: nextStatus === 'resolved' ? new Date().toISOString() : undefined } : r)
    );
    setSelectedReport(null);
  };

  const filtered = reports.filter(r =>
    statusFilter === 'all' || r.status === statusFilter
  );

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.severity === 'critical' || r.severity === 'high').length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const columns: Column<Report>[] = [
    {
      key: 'id',
      label: 'Report ID',
      render: (r) => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{r.id}</span>
    },
    {
      key: 'reporter',
      label: 'Reporter (Anonymized)',
      render: (r) => (
        <span style={{ fontWeight: 550, color: '#334155' }}>
          {getMaskedReporter(r.reporterId, r.reporterName)}
        </span>
      )
    },
    {
      key: 'target',
      label: 'Accused Target',
      render: (r) => (
        <div>
          <p style={{ fontWeight: 600, color: '#1e293b' }}>{r.targetName}</p>
          <span style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'capitalize' }}>{r.targetType}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Incident Type',
      render: (r) => (
        <span style={{ textTransform: 'capitalize', color: '#475569', fontSize: 12.5 }}>
          {r.category.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (r) => <Badge variant={SEVERITY_VARIANTS[r.severity]}>{r.severity}</Badge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge variant={STATUS_VARIANTS[r.status]}>{r.status.replace(/_/g, ' ')}</Badge>
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <Button 
          variant="secondary" 
          size="sm" 
          leftIcon={<Eye size={12} />} 
          onClick={() => setSelectedReport(r)}
        >
          Investigate
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
              <Flag size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Reports & Complaints</h1>
          </div>
          <p className="page-subtitle">Moderate user-submitted abuse files, fake credential flags, and platform disputes.</p>
        </div>

        <button className="btn btn-secondary">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Complaints', value: stats.total, color: '#3b82f6' },
          { label: 'Critical/High Issues', value: stats.critical, color: '#ef4444' },
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
          { label: 'Resolved Tickets', value: stats.resolved, color: '#10b981' },
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
              { key: 'all', label: 'All Incidents' },
              { key: 'pending', label: 'Pending' },
              { key: 'under_review', label: 'Under Review' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'dismissed', label: 'Dismissed' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={showAll ? filtered : filtered.slice(0, 10)} keyExtractor={r => r.id} />

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
              Showing {showAll ? filtered.length : Math.min(10, filtered.length)} of {filtered.length} reports
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

      {/* Investigation Details Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Incident Investigation Summary"
          subtitle={`Ticket ID Reference: ${selectedReport.id}`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <Button variant="ghost" onClick={() => setSelectedReport(null)}>Close</Button>
              {selectedReport.status === 'pending' && (
                <Button variant="secondary" onClick={() => handleUpdateStatus(selectedReport.id, 'under_review')}>
                  Begin Ops Review
                </Button>
              )}
              {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
                <>
                  <Button variant="danger" leftIcon={<XCircle size={13} />} onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}>
                    Dismiss Dispute
                  </Button>
                  <Button variant="teal" leftIcon={<CheckCircle size={13} />} onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}>
                    Resolve Complaint
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11.5, color: '#64748b' }}>Anonymized Reporter</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                  {getMaskedReporter(selectedReport.reporterId, selectedReport.reporterName)}
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11.5, color: '#64748b' }}>Accused Provider Target</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                  {selectedReport.targetName} ({selectedReport.targetType.toUpperCase()})
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 11.5, color: '#64748b' }}>Reporter Statement</p>
              <p style={{ fontSize: 13, color: '#334155', marginTop: 6, lineHeight: 1.5 }}>
                {selectedReport.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#64748b' }}>Incident Category</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 2, textTransform: 'capitalize' }}>
                  {selectedReport.category.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#64748b' }}>Report Date</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
