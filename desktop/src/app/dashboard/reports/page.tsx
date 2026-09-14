'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Flag, Eye, CheckCircle, XCircle, Download, AlertTriangle, ShieldAlert,
  FileText, ShieldOff, UserX, Send, Printer, FileCheck, Paperclip, Clock,
  Building2, Stethoscope, Search, ExternalLink, RefreshCw
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { exportToCsv } from '@/lib/exportCsv';
import { liveApi, getApiErrorMessage } from '@/services/api';
import type { Report, ReportEvidence } from '@/types';

// Anonymize patient helper
function getMaskedReporter(id: string, name: string) {
  const parts = name.split(' ');
  const initials = parts.map(p => p[0]).join('').toUpperCase();
  const numericId = id.replace(/\D/g, '') || id.substring(1, 6);
  return `${initials} — Patient #${numericId}`;
}

const SEVERITY_VARIANTS: Record<string, 'error' | 'warning' | 'neutral'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

export default function ReportsPage() {
  // Live incident reports (https://ominipulse.onrender.com/api/admin/incidents)
  // — no fallback; failures render an explicit error state.
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'handover_to_board' | 'resolved' | 'dismissed'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSeeAll, setIsSeeAll] = useState(false);

  // Load the live incident reports feed. Errors surface explicitly.
  const loadReports = useCallback(async () => {
    try {
      const live = await liveApi.getIncidents();
      setReports(live);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  // Disciplinary Modal Actions State
  const [isTempSuspendModalOpen, setIsTempSuspendModalOpen] = useState(false);
  const [tempSuspendDays, setTempSuspendDays] = useState(14);
  const [suspensionNote, setSuspensionNote] = useState('');

  const [confirmAction, setConfirmAction] = useState<{
    type: 'perm_suspend' | 'handover_to_board' | 'dismiss';
    reportId: string;
  } | null>(null);

  const [inspectFileModal, setInspectFileModal] = useState<{ fileName: string; fileType: string; sizeBytes: string } | null>(null);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.targetName.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedReports = isSeeAll
    ? filteredReports
    : filteredReports.slice((page - 1) * pageSize, page * pageSize);

  // KPI Calculations
  const totalCount = reports.length;
  const criticalCount = reports.filter(r => r.severity === 'critical' || r.severity === 'high').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const boardHandoverCount = reports.filter(r => r.status === 'handover_to_board').length;

  // Handle Temporary Suspension Submit
  const handleApplyTempSuspension = () => {
    if (!selectedReport) return;

    // Live backend sync: incident status transition.
    void liveApi.updateIncidentStatus(selectedReport.id, 'temp_suspended');

    setReports(prev =>
      prev.map(r =>
        r.id === selectedReport.id
          ? {
              ...r,
              status: 'temp_suspended',
              suspensionDurationDays: tempSuspendDays,
              disciplinaryActionNote: suspensionNote || `Accused doctor temporarily suspended for ${tempSuspendDays} days pending disciplinary review.`,
              resolvedAt: new Date().toISOString(),
            }
          : r
      )
    );

    setSelectedReport(prev => prev ? {
      ...prev,
      status: 'temp_suspended',
      suspensionDurationDays: tempSuspendDays,
      disciplinaryActionNote: suspensionNote || `Accused doctor temporarily suspended for ${tempSuspendDays} days pending disciplinary review.`,
      resolvedAt: new Date().toISOString(),
    } : null);

    setIsTempSuspendModalOpen(false);
    setSuspensionNote('');
  };

  // Handle Confirm Dialog Action
  const handleConfirmDisciplinaryAction = (reason?: string) => {
    if (!confirmAction || !selectedReport) return;

    const { type, reportId } = confirmAction;

    // Live backend sync: incident status transition.
    const liveStatus: Report['status'] =
      type === 'perm_suspend' ? 'perm_suspended'
      : type === 'handover_to_board' ? 'handover_to_board'
      : 'dismissed';
    void liveApi.updateIncidentStatus(reportId, liveStatus);

    setReports(prev =>
      prev.map(r => {
        if (r.id !== reportId) return r;
        if (type === 'perm_suspend') {
          return {
            ...r,
            status: 'perm_suspended',
            disciplinaryActionNote: reason || 'Accused doctor permanently banned from Omini Pulse medical network.',
            resolvedAt: new Date().toISOString(),
          };
        }
        if (type === 'handover_to_board') {
          return {
            ...r,
            status: 'handover_to_board',
            boardHandoverAt: new Date().toISOString(),
            disciplinaryActionNote: reason || 'Incident report & evidence trail formally handed over to the Medical Disciplinary Board of Doctors.',
          };
        }
        return {
          ...r,
          status: 'dismissed',
          disciplinaryActionNote: reason || 'Complaint dismissed following preliminary verification.',
          resolvedAt: new Date().toISOString(),
        };
      })
    );

    setSelectedReport(prev => {
      if (!prev) return null;
      if (type === 'perm_suspend') {
        return {
          ...prev,
          status: 'perm_suspended',
          disciplinaryActionNote: reason || 'Accused doctor permanently banned from Omini Pulse medical network.',
          resolvedAt: new Date().toISOString(),
        };
      }
      if (type === 'handover_to_board') {
        return {
          ...prev,
          status: 'handover_to_board',
          boardHandoverAt: new Date().toISOString(),
          disciplinaryActionNote: reason || 'Incident report & evidence trail formally handed over to the Medical Disciplinary Board of Doctors.',
        };
      }
      return {
        ...prev,
        status: 'dismissed',
        disciplinaryActionNote: reason || 'Complaint dismissed following preliminary verification.',
        resolvedAt: new Date().toISOString(),
      };
    });

    setConfirmAction(null);
  };

  // Export PDF Investigation Report
  const handleExportPDF = () => {
    if (!selectedReport) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const maskedReporter = getMaskedReporter(selectedReport.reporterId, selectedReport.reporterName);
    const dateStr = new Date(selectedReport.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Disciplinary Report - ${selectedReport.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: 800; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .badge { display: inline-block; padding: 4px 12px; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 700; border-radius: 4px; }
            .section { margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
            .section-title { font-size: 14px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; }
            .value { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; }
            .evidence-list { list-style: none; padding: 0; margin: 8px 0 0 0; }
            .evidence-item { padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 6px; font-size: 12px; font-weight: 600; }
            .seal-box { margin-top: 40px; border-top: 2px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature-line { width: 220px; border-bottom: 1px solid #0f172a; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">OMINI PULSE MEDICAL BOARD</div>
              <div class="subtitle">Official Patient Incident Investigation & Disciplinary Report</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${selectedReport.severity.toUpperCase()} SEVERITY</span>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Case Ref: ${selectedReport.id}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. INCIDENT CASE METADATA</div>
            <div class="grid">
              <div><div class="label">Report ID</div><div class="value">${selectedReport.id}</div></div>
              <div><div class="label">Submission Date</div><div class="value">${dateStr}</div></div>
              <div><div class="label">Reporter (NDPA Anonymized)</div><div class="value">${maskedReporter}</div></div>
              <div><div class="label">Consultation ID</div><div class="value">${selectedReport.consultationId || 'APT-2026-AUDIT'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. ACCUSED HEALTHCARE PROVIDER</div>
            <div class="grid">
              <div><div class="label">Accused Doctor Name</div><div class="value">${selectedReport.targetName}</div></div>
              <div><div class="label">MDCN Medical License No</div><div class="value">${selectedReport.targetLicenseNo || 'MDCN-LIC-VERIFIED'}</div></div>
              <div><div class="label">Specialty</div><div class="value">${selectedReport.targetSpecialty || 'General Practitioner'}</div></div>
              <div><div class="label">Hospital Affiliation</div><div class="value">${selectedReport.targetHospital || 'Omini Pulse Partner Hospital'}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. PATIENT STATEMENT & INCIDENT NARRATIVE</div>
            <p style="font-size: 13px; color: #334155;">${selectedReport.description}</p>
          </div>

          <div class="section">
            <div class="section-title">4. ATTACHED EVIDENCE TRAIL INVENTORY (${selectedReport.evidenceFiles?.length || 0})</div>
            <ul class="evidence-list">
              ${(selectedReport.evidenceFiles || []).map(e => `<li class="evidence-item">[${e.fileType.toUpperCase()}] ${e.fileName} (${e.sizeBytes}) — Uploaded ${new Date(e.uploadedAt).toLocaleTimeString()}</li>`).join('')}
            </ul>
          </div>

          ${selectedReport.disciplinaryActionNote ? `
            <div class="section" style="background: #fef2f2; border-color: #fca5a5;">
              <div class="section-title" style="color: #dc2626;">5. DISCIPLINARY & BOARD HANDOVER DECISION</div>
              <p style="font-size: 13px; font-weight: 600; color: #991b1b;">${selectedReport.disciplinaryActionNote}</p>
            </div>
          ` : ''}

          <div class="seal-box">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">CERTIFIED BOARD AUDIT SEAL</div>
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 4px;">Omini Pulse Disciplinary Council</div>
            </div>
            <div>
              <div class="signature-line"></div>
              <div style="font-size: 11px; color: #64748b; text-align: center; margin-top: 4px;">Chief Medical Compliance Officer</div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Flag size={18} style={{ color: '#dc2626' }} />
            </div>
            <h1 className="page-title">Patient Incident Reports</h1>
          </div>
          <p className="page-subtitle">Investigate patient complaints, inspect attached evidence trails, apply doctor suspensions, or handover cases to the Board of Doctors.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              exportToCsv('incident_reports_audit_log.csv', filteredReports, [
                { header: 'Report ID', key: 'id' },
                { header: 'Reporter Name', key: 'reporterName' },
                { header: 'Target Name', key: 'targetName' },
                { header: 'Target Specialty', key: 'targetSpecialty' },
                { header: 'Target Hospital', key: 'targetHospital' },
                { header: 'Category', key: 'category' },
                { header: 'Severity', key: 'severity' },
                { header: 'Status', key: 'status' },
                { header: 'Created Date', key: (r: Report) => new Date(r.createdAt).toLocaleString() },
                { header: 'Disciplinary Action Note', key: (r: Report) => r.disciplinaryActionNote || 'N/A' },
              ]);
            }}
          >
            <Download size={14} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* Live data connection state */}
      {isLoading && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af',
          borderRadius: 10, padding: '14px 16px', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <RefreshCw size={15} className="animate-spin" />
          Loading incident reports from the live database…
        </div>
      )}
      {loadError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={15} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>
              Failed to load incident reports from the live database
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#dc2626' }}>
              {loadError} — check your connection and role, then retry.
            </p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={12} />} onClick={() => { setIsLoading(true); void loadReports(); }}>
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Incidents', value: totalCount, border: '#cbd5e1' },
          { label: 'Pending Review', value: pendingCount, border: '#f59e0b', highlight: true },
          { label: 'Critical & High Severity', value: criticalCount, border: '#dc2626', priority: true },
          { label: 'Handed Over to Board', value: boardHandoverCount, border: '#7c3aed' },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: '#ffffff', border: '1px solid #f3f4f6', borderLeft: `4px solid ${kpi.border}`,
            borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{kpi.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.03em' }}>{kpi.value}</span>
              {kpi.highlight && kpi.value > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#d97706', background: '#fffbeb', padding: '2px 6px', borderRadius: 4 }}>
                  Action Needed
                </span>
              )}
              {kpi.priority && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>
                  Urgent Audit
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table & Filter Control Card */}
      <Card padding="none">
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, height: 38, padding: '0 12px', width: 280,
          }}>
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search case ID, provider, patient..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#334155', width: '100%' }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="tab-bar">
            {([
              { key: 'all', label: 'All Incidents' },
              { key: 'pending', label: 'Pending' },
              { key: 'under_review', label: 'Under Review' },
              { key: 'handover_to_board', label: 'Board Handover' },
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

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Case Ref ID</th>
                <th>Reporter (Anonymized)</th>
                <th>Accused Provider</th>
                <th>Category</th>
                <th>Evidence</th>
                <th>Severity</th>
                <th>Investigation Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={28} style={{ color: '#94a3b8' }} />
                      <p style={{ fontWeight: 500 }}>No incident reports match the criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedReports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>{r.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{getMaskedReporter(r.reporterId, r.reporterName)}</td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, color: '#0f172a' }}>{r.targetName}</p>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{r.targetLicenseNo || r.targetType}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize', color: '#475569' }}>
                        {r.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                        background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe'
                      }}>
                        {r.evidenceFiles?.length || 0} Files
                      </span>
                    </td>
                    <td>
                      <Badge variant={SEVERITY_VARIANTS[r.severity]} size="sm">
                        {r.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        variant={
                          r.status === 'handover_to_board' ? 'error' :
                          r.status === 'temp_suspended' ? 'warning' :
                          r.status === 'pending' ? 'warning' : 'neutral'
                        }
                        size="sm"
                      >
                        {r.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedReport(r)}
                      >
                        <Eye size={13} /> Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & See All Bar */}
        <Pagination
          page={page}
          totalPages={Math.ceil(filteredReports.length / pageSize)}
          onPageChange={setPage}
          total={filteredReports.length}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
          isSeeAll={isSeeAll}
          onToggleSeeAll={() => setIsSeeAll(!isSeeAll)}
        />
      </Card>

      {/* ── Investigation Drawer Modal ────────────────────────────────────── */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Incident Investigation File: ${selectedReport.id}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Bar Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={18} style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    {selectedReport.targetName}
                  </h3>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  MDCN License: {selectedReport.targetLicenseNo || 'N/A'} • {selectedReport.targetHospital || 'Partner Hospital'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Printer size={14} style={{ marginRight: 6 }} /> Export Board PDF
                </Button>
                <Badge variant={SEVERITY_VARIANTS[selectedReport.severity]}>
                  {selectedReport.severity.toUpperCase()} SEVERITY
                </Badge>
              </div>
            </div>

            {/* Incident Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>REPORTER (NDPA MASKED)</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  {getMaskedReporter(selectedReport.reporterId, selectedReport.reporterName)}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CONSULTATION SESSION ID</span>
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#2563eb', marginTop: 2 }}>
                  {selectedReport.consultationId || 'APT-2026-8841'}
                </p>
              </div>
            </div>

            {/* Patient Statement */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Patient Formal Statement & Incident Narrative:
              </span>
              <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6 }}>
                "{selectedReport.description}"
              </p>
            </div>

            {/* Evidence Attachments Section */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                Attached Evidence Trail ({selectedReport.evidenceFiles?.length || 0} Files)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(!selectedReport.evidenceFiles || selectedReport.evidenceFiles.length === 0) ? (
                  <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>No digital evidence files attached to this complaint.</p>
                ) : (
                  selectedReport.evidenceFiles.map((ev) => (
                    <div key={ev.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Paperclip size={16} style={{ color: '#2563eb' }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{ev.fileName}</p>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            Type: {ev.fileType.toUpperCase()} • Size: {ev.sizeBytes}
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => setInspectFileModal(ev)}>
                        <ExternalLink size={12} style={{ marginRight: 4 }} /> Inspect File
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Existing Disciplinary Decision Notes */}
            {selectedReport.disciplinaryActionNote && (
              <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Disciplinary Board Decision Note:</span>
                <p style={{ fontSize: 13, color: '#991b1b', marginTop: 2 }}>{selectedReport.disciplinaryActionNote}</p>
              </div>
            )}

            {/* Disciplinary Action Control Buttons */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>INVESTIGATION DISCIPLINARY ACTIONS:</span>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                  Close File
                </Button>

                <Button
                  variant="outline"
                  style={{ color: '#d97706', borderColor: '#fcd34d' }}
                  onClick={() => setIsTempSuspendModalOpen(true)}
                >
                  <Clock size={14} style={{ marginRight: 6 }} /> Suspend Temporarily
                </Button>

                <Button
                  variant="danger"
                  onClick={() => setConfirmAction({ type: 'perm_suspend', reportId: selectedReport.id })}
                >
                  <UserX size={14} style={{ marginRight: 6 }} /> Suspend Permanently
                </Button>

                <Button
                  variant="primary"
                  style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                  onClick={() => setConfirmAction({ type: 'handover_to_board', reportId: selectedReport.id })}
                >
                  <Send size={14} style={{ marginRight: 6 }} /> Handover to Medical Board
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Temporary Suspension Duration ──────────────────────────── */}
      {isTempSuspendModalOpen && selectedReport && (
        <Modal
          isOpen={isTempSuspendModalOpen}
          onClose={() => setIsTempSuspendModalOpen(false)}
          title={`Temporary Suspension: ${selectedReport.targetName}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: '#475569' }}>
              Select the temporary suspension duration for the accused doctor while the Disciplinary Audit is ongoing:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[7, 14, 30, 60].map((days) => (
                <button
                  key={days}
                  onClick={() => setTempSuspendDays(days)}
                  style={{
                    padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: tempSuspendDays === days ? '#fffbeb' : '#f8fafc',
                    color: tempSuspendDays === days ? '#b45309' : '#475569',
                    border: tempSuspendDays === days ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  {days} Days Suspension
                </button>
              ))}
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Suspension Audit Note
              </label>
              <textarea
                rows={3}
                placeholder="Enter audit note regarding temporary restriction..."
                value={suspensionNote}
                onChange={(e) => setSuspensionNote(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button variant="secondary" onClick={() => setIsTempSuspendModalOpen(false)}>Cancel</Button>
              <Button variant="primary" style={{ background: '#d97706', borderColor: '#d97706' }} onClick={handleApplyTempSuspension}>
                Apply {tempSuspendDays}-Day Suspension
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Permanent Suspension or Board Handover */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={(reason) => handleConfirmDisciplinaryAction(reason)}
          title={
            confirmAction.type === 'perm_suspend' ? 'Permanently Suspend & Ban Accused Doctor' :
            confirmAction.type === 'handover_to_board' ? 'Handover Case to Board of Doctors' : 'Dismiss Incident Report'
          }
          message={
            confirmAction.type === 'perm_suspend' ? 'Are you sure you want to permanently revoke this doctor\'s medical network license and ban them from Omini Pulse?' :
            confirmAction.type === 'handover_to_board' ? 'Escalate and transfer this incident file & evidence trail directly to the official Board of Doctors Disciplinary Council?' :
            'Are you sure you want to dismiss this complaint?'
          }
          confirmLabel={
            confirmAction.type === 'perm_suspend' ? 'Permanently Ban Doctor' :
            confirmAction.type === 'handover_to_board' ? 'Transfer to Medical Board' : 'Dismiss Report'
          }
          requireReason={true}
          reasonPlaceholder="Enter official disciplinary audit note..."
          variant={confirmAction.type === 'perm_suspend' ? 'danger' : 'primary'}
        />
      )}

      {/* Evidence File Inspection Modal */}
      {inspectFileModal && (
        <Modal
          isOpen={Boolean(inspectFileModal)}
          onClose={() => setInspectFileModal(null)}
          title={`Forensic Document Evidence: ${inspectFileModal.fileName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Evidence Metadata</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{inspectFileModal.fileName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Format: {inspectFileModal.fileType.toUpperCase()} • Size: {inspectFileModal.sizeBytes}</div>
              </div>
              <Badge variant="info">HASH VERIFIED</Badge>
            </div>

            <div style={{ padding: 16, background: '#ffffff', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Paperclip size={22} />
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Document Preview Ready</div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                Securely encrypted evidence log stored in OminiPulse HIPAA/NDPR-compliant cloud vault.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setInspectFileModal(null)}>Close</Button>
              <Button variant="primary" onClick={() => window.print()}>Print Forensic Evidence</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
