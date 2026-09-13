'use client';

import { useState, useEffect } from 'react';
import { 
  Stethoscope, Search, Download, Eye, CheckCircle, XCircle, 
  AlertCircle, ShieldAlert, Award, FileText, Calendar, 
  Clock, Check, UserCheck, ShieldOff, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { exportToCsv } from '@/lib/exportCsv';
import { liveApi } from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import type { Doctor, VerificationStatus } from '@/types';

// Mock comprehensive doctor registrations with all verification assets
const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-101',
    firstName: 'Amina',
    lastName: 'Bello',
    email: 'amina.bello@ominipulse.ai',
    phone: '+234 803 123 4567',
    specialization: 'Cardiology',
    licenseNo: 'LIC-98347102',
    hospital: 'Lagos General Hospital',
    yearsExp: 8,
    rating: 4.8,
    verificationStatus: 'pending',
    isApproved: false,
    createdAt: '2026-06-04T10:00:00Z',
    verificationSubmittedAt: '2026-06-04T10:15:00Z',
    documentsCount: 3,
    govIdUrl: 'gov_id_bello.png',
    licenseUrl: 'license_bello.pdf',
    selfieUrl: 'selfie_bello.png',
  },
  {
    id: 'doc-102',
    firstName: 'Felix',
    lastName: 'Okafor',
    email: 'felix.okafor@ominipulse.ai',
    phone: '+234 805 987 6543',
    specialization: 'Pediatrics',
    licenseNo: 'LIC-10492837',
    hospital: 'Victoria Island Specialist Clinic',
    yearsExp: 12,
    rating: 4.9,
    verificationStatus: 'approved',
    isApproved: true,
    createdAt: '2026-06-03T14:30:00Z',
    verificationSubmittedAt: '2026-06-03T14:45:00Z',
    verificationReviewedAt: '2026-06-04T09:00:00Z',
    verificationReviewedBy: 'super_admin_1',
    documentsCount: 3,
    govIdUrl: 'gov_id_okafor.png',
    licenseUrl: 'license_okafor.pdf',
    selfieUrl: 'selfie_okafor.png',
  },
  {
    id: 'doc-103',
    firstName: 'Blessing',
    lastName: 'Okoro',
    email: 'blessing.okoro@ominipulse.ai',
    phone: '+234 812 345 6789',
    specialization: 'Neurology',
    licenseNo: 'LIC-49381029',
    hospital: 'Eko Medical Center',
    yearsExp: 5,
    rating: 4.0,
    verificationStatus: 'rejected',
    isApproved: false,
    createdAt: '2026-06-02T09:15:00Z',
    verificationSubmittedAt: '2026-06-02T09:30:00Z',
    verificationReviewedAt: '2026-06-02T16:00:00Z',
    verificationReviewedBy: 'verification_admin_1',
    rejectionReason: 'The submitted Medical License certificate is expired (validity ended Dec 2025). Please re-submit a current document.',
    documentsCount: 3,
    govIdUrl: 'gov_id_okoro.png',
    licenseUrl: 'license_okoro.pdf',
    selfieUrl: 'selfie_okoro.png',
  },
  {
    id: 'doc-104',
    firstName: 'David',
    lastName: 'Okoye',
    email: 'david.okoye@ominipulse.ai',
    phone: '+234 901 234 5678',
    specialization: 'Dermatology',
    licenseNo: 'LIC-38491024',
    hospital: 'Lagos General Hospital',
    yearsExp: 6,
    rating: 4.6,
    verificationStatus: 'approved',
    isApproved: true,
    createdAt: '2026-05-30T11:20:00Z',
    verificationSubmittedAt: '2026-05-30T11:40:00Z',
    verificationReviewedAt: '2026-05-30T15:10:00Z',
    verificationReviewedBy: 'verification_admin_2',
    documentsCount: 3,
    govIdUrl: 'gov_id_okoye.png',
    licenseUrl: 'license_okoye.pdf',
    selfieUrl: 'selfie_okoye.png',
  },
  {
    id: 'doc-105',
    firstName: 'Oluwaseun',
    lastName: 'Adeyemi',
    email: 'seun.adeyemi@ominipulse.ai',
    phone: '+234 802 888 9999',
    specialization: 'Orthopedics',
    licenseNo: 'LIC-77491028',
    hospital: 'Lekki Orthopedic Center',
    yearsExp: 15,
    rating: 4.7,
    verificationStatus: 'suspended',
    isApproved: false,
    createdAt: '2026-05-28T08:10:00Z',
    verificationSubmittedAt: '2026-05-28T08:30:00Z',
    verificationReviewedAt: '2026-05-28T14:00:00Z',
    verificationReviewedBy: 'super_admin_1',
    rejectionReason: 'Suspended due to reported operational malpractice, pending internal medical board investigation.',
    documentsCount: 3,
    govIdUrl: 'gov_id_adeyemi.png',
    licenseUrl: 'license_adeyemi.pdf',
    selfieUrl: 'selfie_adeyemi.png',
  },
  {
    id: 'doc-106',
    firstName: 'Maria',
    lastName: 'Ezenwa',
    email: 'maria.ezenwa@ominipulse.ai',
    phone: '+234 810 555 4444',
    specialization: 'Psychiatry',
    licenseNo: 'LIC-55102938',
    hospital: 'Eko Medical Center',
    yearsExp: 9,
    rating: 4.2,
    verificationStatus: 'pending',
    isApproved: false,
    createdAt: '2026-06-05T16:40:00Z',
    verificationSubmittedAt: '2026-06-05T17:00:00Z',
    documentsCount: 3,
    govIdUrl: 'gov_id_ezenwa.png',
    licenseUrl: 'license_ezenwa.pdf',
    selfieUrl: 'selfie_ezenwa.png',
  }
];

export default function DoctorsPage() {
  // Live doctor registry (https://ominipulse.onrender.com/api) with the
  // built-in demo roster as offline fallback.
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [isLive, setIsLive] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<{ title: string; url: string; type: 'image' | 'pdf' } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSeeAll, setIsSeeAll] = useState(false);
  
  // Dialog Actions State
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend';
    docId: string;
  } | null>(null);

  // Load live doctor registry once; keep the demo roster on any failure.
  // Realtime: moderation events from any admin session refresh this list.
  useEffect(() => {
    let cancelled = false;
    liveApi.getDoctors().then((live) => {
      if (!cancelled) {
        if (live && live.length > 0) {
          setDoctors(live);
          setIsLive(true);
          setLoadError(null);
        } else {
          setLoadError('Live backend returned no data — showing demo roster');
        }
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((msg) => {
      if (msg.event === 'admin.users.changed') {
        liveApi.getDoctors().then((live) => {
          if (live && live.length > 0) {
            setDoctors(live);
            setIsLive(true);
            setLoadError(null);
          } else {
            setLoadError('Live refresh returned empty — using cached data');
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Filter & Search Logic
  const filteredDocs = doctors.filter((doc) => {
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(search.toLowerCase()) || 
      doc.licenseNo.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (doc.hospital && doc.hospital.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || doc.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedDocs = isSeeAll
    ? filteredDocs
    : filteredDocs.slice((page - 1) * pageSize, page * pageSize);

  // KPI Calculations
  const totalCount = doctors.length;
  const pendingCount = doctors.filter((d) => d.verificationStatus === 'pending').length;
  const approvedCount = doctors.filter((d) => d.verificationStatus === 'approved').length;
  const rejectedCount = doctors.filter((d) => d.verificationStatus === 'rejected').length;
  const suspendedCount = doctors.filter((d) => d.verificationStatus === 'suspended').length;

  // Handle Action Trigger
  const openConfirmDialog = (type: 'approve' | 'reject' | 'suspend', docId: string) => {
    setConfirmAction({ type, docId });
  };

  // Perform State Updates (optimistic local + best-effort live sync)
  const handleConfirmAction = (reason?: string) => {
    if (!confirmAction) return;

    const { type, docId } = confirmAction;
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;

        return {
          ...doc,
          verificationStatus: type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'suspended',
          isApproved: type === 'approve',
          rejectionReason: reason || undefined,
          verificationReviewedAt: new Date().toISOString(),
          verificationReviewedBy: 'super_admin_1',
        };
      })
    );

    // Update the currently open details modal so it reflects state instantly
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          verificationStatus: type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'suspended',
          isApproved: type === 'approve',
          rejectionReason: reason || undefined,
          verificationReviewedAt: new Date().toISOString(),
          verificationReviewedBy: 'super_admin_1',
        };
      });
    }

    // Live backend sync: verification decision (approve/reject) or suspension
    if (isLive) {
      if (type === 'suspend') {
        void liveApi.setUserStatus(docId, false);
      } else {
        void liveApi.verifyDoctor(docId, type, reason);
      }
    }

    setConfirmAction(null);
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
              <Stethoscope size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Doctor Verification</h1>
<span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                  background: isLive ? '#f0fdf4' : loadError ? '#fef2f2' : '#f8fafc',
                  color: isLive ? '#16a34a' : loadError ? '#dc2626' : '#64748b',
                }}>
                  {isLive ? 'Live data' : loadError ? 'Fallback mode' : 'Demo data'}
                </span>
          </div>
          <p className="page-subtitle">Verify doctor credentials, certificates, and review platform registration requests.</p>
        </div>
        
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => exportToCsv('doctors_registry', filteredDocs.map(d => ({
            id: d.id,
            name: `Dr. ${d.firstName} ${d.lastName}`,
            email: d.email,
            phone: d.phone,
            licenseNo: d.licenseNo,
            specialization: d.specialization,
            hospital: d.hospital || 'Independent Practice',
            yearsExp: d.yearsExp,
            verificationStatus: d.verificationStatus,
            createdAt: d.createdAt
          })))}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Registrants', value: totalCount, border: '#cbd5e1' },
          { label: 'Pending Review', value: pendingCount, border: '#f59e0b', highlight: true },
          { label: 'Approved & Active', value: approvedCount, border: '#22c55e' },
          { label: 'Rejected', value: rejectedCount, border: '#ef4444' },
          { label: 'Suspended', value: suspendedCount, border: '#7c3aed' },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: '#ffffff',
            border: '1px solid #f3f4f6',
            borderLeft: `4px solid ${kpi.border}`,
            borderRadius: 12,
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{kpi.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.03em' }}>{kpi.value}</span>
              {kpi.highlight && kpi.value > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#d97706', background: '#fffbeb',
                  padding: '2px 6px', borderRadius: 4, animation: 'pulse 2s infinite'
                }}>Requires Action</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Table Control Card */}
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
          {/* Search Box */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, height: 38, padding: '0 12px', width: 280,
          }}>
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, specialty, license..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: '#334155', width: '100%', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="tab-bar">
            {([
              { key: 'all', label: 'All Registries' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'suspended', label: 'Suspended' },
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
                <th>Doctor</th>
                <th>Medical Credentials</th>
                <th>Facility & Experience</th>
                <th>Submissions</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={28} style={{ color: '#94a3b8' }} />
                      <p style={{ fontWeight: 500 }}>No doctors match the selected filters</p>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>Try refining your search keyword or selecting a different status tab.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedDocs.map((doc) => {
                  const initial = doc.firstName[0] + doc.lastName[0];
                  
                  return (
                    <tr key={doc.id}>
                      {/* Name & Contact */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#eff6ff', color: '#2563eb',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 13, fontWeight: 700,
                            border: '1.5px solid #dbeafe'
                          }}>
                            {initial}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1e293b' }}>Dr. {doc.firstName} {doc.lastName}</p>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{doc.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* License & Specialty */}
                      <td>
                        <div>
                          <span style={{
                            background: '#f0fdf4', color: '#16a34a',
                            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                            display: 'inline-block', marginBottom: 4
                          }}>{doc.specialization}</span>
                          <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#475569' }}>{doc.licenseNo}</p>
                        </div>
                      </td>

                      {/* Facility & Experience */}
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, color: '#334155' }}>{doc.hospital || 'Private Clinic'}</p>
                          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{doc.yearsExp} Years Experience</p>
                        </div>
                      </td>

                      {/* Document Submissions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Badge variant="teal" size="sm">
                            <FileText size={10} /> {doc.documentsCount}/3 Docs
                          </Badge>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {doc.verificationSubmittedAt ? new Date(doc.verificationSubmittedAt).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge variant={
                          doc.verificationStatus === 'approved' ? 'success' : 
                          doc.verificationStatus === 'pending' ? 'warning' :
                          doc.verificationStatus === 'rejected' ? 'error' : 'admin'
                        }>
                          {doc.verificationStatus === 'approved' ? (
                            <CheckCircle size={12} style={{ marginRight: 4 }} />
                          ) : doc.verificationStatus === 'pending' ? (
                            <Clock size={12} style={{ marginRight: 4 }} />
                          ) : (
                            <XCircle size={12} style={{ marginRight: 4 }} />
                          )}
                          {doc.verificationStatus.charAt(0).toUpperCase() + doc.verificationStatus.slice(1)}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            leftIcon={<Eye size={12} />}
                            onClick={() => setSelectedDoc(doc)}
                          >
                            Review
                          </Button>
                          
                          {doc.verificationStatus === 'pending' && (
                            <>
                              <Button 
                                variant="teal" 
                                size="sm" 
                                leftIcon={<CheckCircle size={12} />}
                                onClick={() => openConfirmDialog('approve', doc.id)}
                              />
                              <Button 
                                variant="danger" 
                                size="sm" 
                                leftIcon={<XCircle size={12} />}
                                onClick={() => openConfirmDialog('reject', doc.id)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & See All Bar */}
        <Pagination
          page={page}
          totalPages={Math.ceil(filteredDocs.length / pageSize)}
          onPageChange={setPage}
          total={filteredDocs.length}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
          isSeeAll={isSeeAll}
          onToggleSeeAll={() => setIsSeeAll(!isSeeAll)}
        />
      </Card>

      {/* Verification Details Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title="Doctor Verification Review"
          subtitle={`Review registration details and files for Dr. ${selectedDoc.firstName} ${selectedDoc.lastName}`}
          size="xl"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {selectedDoc.verificationStatus !== 'pending' && (
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    Reviewed on {selectedDoc.verificationReviewedAt ? new Date(selectedDoc.verificationReviewedAt).toLocaleString() : 'N/A'}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setSelectedDoc(null)}>Close</Button>
                {selectedDoc.verificationStatus === 'pending' && (
                  <>
                    <Button 
                      variant="danger" 
                      onClick={() => openConfirmDialog('reject', selectedDoc.id)}
                    >
                      Reject Application
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => openConfirmDialog('approve', selectedDoc.id)}
                    >
                      Approve & Activate
                    </Button>
                  </>
                )}
                {selectedDoc.verificationStatus === 'approved' && (
                  <Button 
                    variant="danger" 
                    onClick={() => openConfirmDialog('suspend', selectedDoc.id)}
                  >
                    Suspend Doctor
                  </Button>
                )}
                {selectedDoc.verificationStatus === 'suspended' && (
                  <Button 
                    variant="teal" 
                    onClick={() => openConfirmDialog('approve', selectedDoc.id)}
                  >
                    Unsuspend & Reactivate
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            {/* Left: Documents and Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Doctor Details Summary */}
              <div style={{
                background: '#ffffff', 
                padding: 20, 
                borderRadius: 12, 
                border: '1px solid #e2e8f0',
                display: 'flex', 
                gap: 16,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 18, fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  flexShrink: 0
                }}>
                  {selectedDoc.firstName[0]}{selectedDoc.lastName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Dr. {selectedDoc.firstName} {selectedDoc.lastName}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>{selectedDoc.email} · {selectedDoc.phone || 'No phone'}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    <Badge variant="teal">{selectedDoc.specialization}</Badge>
                    <Badge variant="neutral">{selectedDoc.yearsExp} Years Exp</Badge>
                    <Badge variant="primary" style={{ fontFamily: 'monospace' }}>{selectedDoc.licenseNo}</Badge>
                  </div>
                </div>
              </div>

              {/* Document Previews */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Submitted Files
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {/* Medical License */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'MDCN Medical License Certificate', url: '/images/mock-license.png', type: 'image' });
                      setIsPreviewOpen(true);
                    }}
                  >
                    <div style={{
                      height: 80, background: '#f1f5f9', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>1. MDCN License</p>
                      <p style={{ fontSize: 10.5, color: '#059669', fontWeight: 600, marginTop: 1 }}>Valid until Dec 2026</p>
                    </div>
                  </div>

                  {/* Government ID */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Government ID / NIN', url: '/images/mock-gov-id.png', type: 'image' });
                      setIsPreviewOpen(true);
                    }}
                  >
                    <div style={{
                      height: 80, background: '#f1f5f9', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                      <Award size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>2. National ID / NIN</p>
                      <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>gov_id.png</p>
                    </div>
                  </div>

                  {/* Specialty Certificate - Mandatory for all */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#f0fdf4',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Specialty / Fellowship Certificate (WACP/FWACP)', url: '/images/mock-specialty.png', type: 'image' });
                      setIsPreviewOpen(true);
                    }}
                  >
                    <div style={{
                      height: 80, background: '#dcfce7', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#15803d'
                    }}>
                      <Award size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#065F46' }}>3. Specialty Cert (Mandatory)</p>
                      <p style={{ fontSize: 10.5, color: '#047857', fontWeight: 600, marginTop: 1 }}>WACP Fellowship Verified</p>
                    </div>
                  </div>

                  {/* Employment Letter */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Clinic Affiliation / Employment Letter', url: '/images/mock-employment.png', type: 'image' });
                      setIsPreviewOpen(true);
                    }}
                  >
                    <div style={{
                      height: 80, background: '#f1f5f9', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>4. Employment Letter</p>
                      <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>clinic_letter.pdf</p>
                    </div>
                  </div>

                  {/* Passport Photo */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Professional Passport Photo', url: '/images/mock-selfie.png', type: 'image' });
                      setIsPreviewOpen(true);
                    }}
                  >
                    <div style={{
                      height: 80, background: '#f1f5f9', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>5. Passport Photo</p>
                      <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>photo_headshot.jpg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Verification Status & Timeline */}
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verification Status
                </h4>
                <div style={{
                  background: 
                    selectedDoc.verificationStatus === 'approved' ? '#f0fdf4' : 
                    selectedDoc.verificationStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${
                    selectedDoc.verificationStatus === 'approved' ? '#bbf7d0' : 
                    selectedDoc.verificationStatus === 'pending' ? '#fef3c7' : '#fecaca'
                  }`,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {selectedDoc.verificationStatus.toUpperCase()}
                  </p>
                  {selectedDoc.rejectionReason && (
                    <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6, lineHeight: 1.4 }}>
                      <strong>Reason:</strong> {selectedDoc.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Workflow Log
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                  {/* Vertical Line */}
                  <div style={{
                    position: 'absolute', left: 7, top: 4, bottom: 4, width: 1.5, background: '#e2e8f0'
                  }} />

                  {/* Log Items */}
                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', background: '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}><Check size={10} /></div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Registration Submitted</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', background: '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}><Check size={10} /></div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>3 Verification Files Uploaded</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedDoc.verificationSubmittedAt ? new Date(selectedDoc.verificationSubmittedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', 
                      background: selectedDoc.verificationStatus === 'pending' ? '#e2e8f0' : '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}>
                      {selectedDoc.verificationStatus === 'pending' ? <Clock size={9} style={{ color: '#64748b' }} /> : <Check size={10} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                        {selectedDoc.verificationStatus === 'pending' ? 'Pending Ops Audit' : `Reviewed & ${selectedDoc.verificationStatus}`}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedDoc.verificationReviewedAt ? new Date(selectedDoc.verificationReviewedAt).toLocaleString() : 'Awaiting verification admin...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Image Viewer Modal */}
      {previewDocUrl && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewDocUrl(null);
          }}
          title={previewDocUrl.title}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: '100%',
              height: 380,
              background: '#0f172a',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Simulated Premium Document design inside modal overlay */}
              <div style={{
                color: '#fff',
                textAlign: 'center',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                background: 'rgba(30, 41, 59, 0.8)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                maxWidth: 420
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'rgba(37,99,235,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                }}>
                  <FileText size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{previewDocUrl.title}</h3>
                  <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                    Secure Omini Pulse Document Portal (SSL Encrypted)
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#e2e8f0',
                  textAlign: 'left',
                  width: '100%',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  File: {selectedDoc?.lastName.toLowerCase()}_credentials_verification.png<br />
                  Ref: {selectedDoc?.licenseNo}<br />
                  Hash: SHA-256 (6a8f89bc...)
                </div>
                <span style={{ fontSize: 11, color: '#3b82f6', background: 'rgba(37,99,235,0.1)', padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>
                  Active Encrypted Stream
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: 12.5, color: '#64748b', textAlign: 'center' }}>
              For security and NDPA compliance, all patient and doctor document logs are served through access-controlled channels.
            </p>
          </div>
        </Modal>
      )}

      {/* Confirmation Modals */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
          title={
            confirmAction.type === 'approve' ? 'Approve Registration' :
            confirmAction.type === 'reject' ? 'Reject Registration' : 'Suspend Account'
          }
          message={
            confirmAction.type === 'approve' 
              ? 'Are you sure you want to approve this doctor? They will get instant access to the platform services and receive a push approval notification.'
              : confirmAction.type === 'reject'
              ? 'Are you sure you want to reject this doctor registration? Please provide a detailed rejection explanation so they can rectify and resubmit.'
              : 'Are you sure you want to suspend this doctor profile? They will be blocked from logging into the mobile doctor app immediately.'
          }
          confirmLabel={
            confirmAction.type === 'approve' ? 'Approve & Activate' :
            confirmAction.type === 'reject' ? 'Reject Application' : 'Suspend Account'
          }
          variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
          requireReason={confirmAction.type === 'reject'}
          reasonPlaceholder="Enter rejection feedback for the applicant..."
        />
      )}
    </div>
  );
}
