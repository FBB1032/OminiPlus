'use client';

import { useState } from 'react';
import { 
  Pill, Search, Download, Eye, CheckCircle, XCircle, 
  AlertCircle, Award, FileText, Calendar, 
  Clock, Check, UserCheck, ShieldOff, AlertTriangle, Plus
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Pharmacy, PartnerStatus } from '@/types';

// Extend Pharmacy interface locally to include rich verification metadata
interface VerificationPharmacy extends Pharmacy {
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  rejectionReason?: string;
  documentsCount: number;
  permitUrl?: string;
  pharmacistLicenseUrl?: string;
}

const INITIAL_PHARMACIES: VerificationPharmacy[] = [
  {
    id: 'ph-101',
    name: 'HealthPlus Pharmacy Victoria Island',
    address: 'Plot 14, Adeola Odeku Street',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 809 321 0001',
    email: 'vi@healthplus.ng',
    licenseNo: 'PH-LIC-20091',
    partnerStatus: 'pending',
    operationalStatus: 'open',
    createdAt: '2026-06-04T10:00:00Z',
    verificationSubmittedAt: '2026-06-04T10:15:00Z',
    documentsCount: 2,
    permitUrl: 'pharmacy_permit_healthplus.png',
    pharmacistLicenseUrl: 'pharmacist_license_healthplus.pdf',
  },
  {
    id: 'ph-102',
    name: 'MedX Pharmacy Lekki',
    address: 'Block 12, Phase 1, Lekki',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 805 111 2222',
    email: 'lekki@medx.ng',
    licenseNo: 'PH-LIC-10492',
    partnerStatus: 'active',
    operationalStatus: 'open',
    createdAt: '2026-06-03T14:30:00Z',
    verificationSubmittedAt: '2026-06-03T14:45:00Z',
    verificationReviewedAt: '2026-06-04T09:00:00Z',
    verificationReviewedBy: 'super_admin_1',
    documentsCount: 2,
    permitUrl: 'pharmacy_permit_medx.png',
    pharmacistLicenseUrl: 'pharmacist_license_medx.pdf',
  },
  {
    id: 'ph-103',
    name: 'CliniPlus Pharmacy Ikeja',
    address: '22 Allen Avenue, Ikeja',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 812 345 0001',
    email: 'ikeja@cliniplus.ng',
    licenseNo: 'PH-LIC-49381',
    partnerStatus: 'rejected',
    operationalStatus: 'closed',
    createdAt: '2026-06-02T09:15:00Z',
    verificationSubmittedAt: '2026-06-02T09:30:00Z',
    verificationReviewedAt: '2026-06-02T16:00:00Z',
    verificationReviewedBy: 'verification_admin_1',
    rejectionReason: 'The Pharmacy Premises Permit is expired (validity ended Dec 2025). Please re-submit the renewed 2026 Premises Permit.',
    documentsCount: 2,
    permitUrl: 'pharmacy_permit_cliniplus.png',
    pharmacistLicenseUrl: 'pharmacist_license_cliniplus.pdf',
  },
  {
    id: 'ph-104',
    name: 'PharmaCare Abuja',
    address: 'Capital Plaza, Wuse II',
    city: 'Abuja',
    country: 'Nigeria',
    phone: '+234 901 222 3333',
    email: 'wuse@pharmacare.ng',
    licenseNo: 'PH-LIC-38491',
    partnerStatus: 'active',
    operationalStatus: 'open',
    createdAt: '2026-05-30T11:20:00Z',
    verificationSubmittedAt: '2026-05-30T11:40:00Z',
    verificationReviewedAt: '2026-05-30T15:10:00Z',
    verificationReviewedBy: 'verification_admin_2',
    documentsCount: 2,
    permitUrl: 'pharmacy_permit_pharmacare.png',
    pharmacistLicenseUrl: 'pharmacist_license_pharmacare.pdf',
  },
  {
    id: 'ph-105',
    name: 'RxNow Pharmacy Port Harcourt',
    address: '50 Trans Amadi Road',
    city: 'Port Harcourt',
    country: 'Nigeria',
    phone: '+234 802 888 7777',
    email: 'rxnow_ph@rxnow.ng',
    licenseNo: 'PH-LIC-77491',
    partnerStatus: 'suspended',
    operationalStatus: 'closed',
    createdAt: '2026-05-28T08:10:00Z',
    verificationSubmittedAt: '2026-05-28T08:30:00Z',
    verificationReviewedAt: '2026-05-28T14:00:00Z',
    verificationReviewedBy: 'super_admin_1',
    rejectionReason: 'Suspended pending pharmaceutical audit due to anomalies in prescription fulfillment trails.',
    documentsCount: 2,
    permitUrl: 'pharmacy_permit_rxnow.png',
    pharmacistLicenseUrl: 'pharmacist_license_rxnow.pdf',
  }
];

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<VerificationPharmacy[]>(INITIAL_PHARMACIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartnerStatus>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<VerificationPharmacy | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<{ title: string; url: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Onboard Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLicenseNo, setNewLicenseNo] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleCreatePharmacy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLicenseNo.trim() || !newCity.trim()) return;

    const newPharm: VerificationPharmacy = {
      id: `ph-${Date.now()}`,
      name: newName,
      licenseNo: newLicenseNo,
      address: 'OminiPlus Partner Pharmacy Address',
      city: newCity || 'Lagos',
      country: 'Nigeria',
      phone: newPhone || '+234 800 000 0000',
      email: newEmail || 'contact@partner.ominiplus.ai',
      partnerStatus: 'pending',
      operationalStatus: 'open',
      createdAt: new Date().toISOString(),
      documentsCount: 2,
      permitUrl: 'pharmacy_permit.png',
      pharmacistLicenseUrl: 'pharmacist_license.pdf',
    };

    setPharmacies(prev => [newPharm, ...prev]);
    setIsNewModalOpen(false);
    setNewName('');
    setNewLicenseNo('');
    setNewCity('');
    setNewPhone('');
    setNewEmail('');
  };

  // Dialog Actions State
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend';
    pharmacyId: string;
  } | null>(null);

  // Filter & Search Logic
  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.licenseNo.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.partnerStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = pharmacies.length;
  const pendingCount = pharmacies.filter((p) => p.partnerStatus === 'pending').length;
  const activeCount = pharmacies.filter((p) => p.partnerStatus === 'active').length;
  const rejectedCount = pharmacies.filter((p) => p.partnerStatus === 'rejected').length;
  const suspendedCount = pharmacies.filter((p) => p.partnerStatus === 'suspended').length;

  // Handle Action Trigger
  const openConfirmDialog = (type: 'approve' | 'reject' | 'suspend', pharmacyId: string) => {
    setConfirmAction({ type, pharmacyId });
  };

  // Perform State Updates
  const handleConfirmAction = (reason?: string) => {
    if (!confirmAction) return;

    const { type, pharmacyId } = confirmAction;
    setPharmacies((prev) => 
      prev.map((p) => {
        if (p.id !== pharmacyId) return p;
        
        return {
          ...p,
          partnerStatus: type === 'approve' ? 'active' : type === 'reject' ? 'rejected' : 'suspended',
          rejectionReason: reason || undefined,
          verificationReviewedAt: new Date().toISOString(),
          verificationReviewedBy: 'super_admin_1',
        };
      })
    );

    // Update the currently open details modal so it reflects state instantly
    if (selectedPharmacy && selectedPharmacy.id === pharmacyId) {
      setSelectedPharmacy((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          partnerStatus: type === 'approve' ? 'active' : type === 'reject' ? 'rejected' : 'suspended',
          rejectionReason: reason || undefined,
          verificationReviewedAt: new Date().toISOString(),
          verificationReviewedBy: 'super_admin_1',
        };
      });
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
              <Pill size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Pharmacy Verification</h1>
          </div>
          <p className="page-subtitle">Verify pharmacy premises permits, pharmacist operating licenses, and audit drug fulfillment credentials.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">
            <Download size={14} /> Export CSV
          </button>
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsNewModalOpen(true)}>
            Add Pharmacy
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Pharmacies', value: totalCount, border: '#cbd5e1' },
          { label: 'Pending Review', value: pendingCount, border: '#f59e0b', highlight: true },
          { label: 'Approved & Active', value: activeCount, border: '#22c55e' },
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
                  padding: '2px 6px', borderRadius: 4
                }}>Requires Audit</span>
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
              placeholder="Search by name, license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              { key: 'active', label: 'Active' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'suspended', label: 'Suspended' },
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

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Pharmacy Outlet</th>
                <th>License & Registry</th>
                <th>Facility Address</th>
                <th>Submitted Permits</th>
                <th>Fulfillment Operations</th>
                <th>Partner Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={28} style={{ color: '#94a3b8' }} />
                      <p style={{ fontWeight: 500 }}>No pharmacies match the criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (showAll ? filteredPharmacies : filteredPharmacies.slice(0, 10)).map((pharm) => {
                  return (
                    <tr key={pharm.id}>
                      {/* Name & Contact */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#eff6ff', color: '#2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, border: '1.5px solid #dbeafe'
                          }}>
                            {pharm.name[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1e293b' }}>{pharm.name}</p>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{pharm.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* License */}
                      <td>
                        <p style={{ fontSize: 12.5, fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>{pharm.licenseNo}</p>
                      </td>

                      {/* Address */}
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, color: '#334155', fontSize: 13 }}>{pharm.address}</p>
                          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{pharm.city}, {pharm.country}</p>
                        </div>
                      </td>

                      {/* Submitted permits */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Badge variant="teal" size="sm">
                            <FileText size={10} /> {pharm.documentsCount}/2 Files
                          </Badge>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {pharm.verificationSubmittedAt ? new Date(pharm.verificationSubmittedAt).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Operations status */}
                      <td>
                        <Badge variant={pharm.operationalStatus === 'open' ? 'success' : 'neutral'} size="sm">
                          {pharm.operationalStatus === 'open' ? 'Open' : 'Closed'}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge variant={
                          pharm.partnerStatus === 'active' ? 'success' : 
                          pharm.partnerStatus === 'pending' ? 'warning' :
                          pharm.partnerStatus === 'rejected' ? 'error' : 'admin'
                        }>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%', 
                            background: pharm.partnerStatus === 'active' ? '#22c55e' : 
                                        pharm.partnerStatus === 'pending' ? '#f59e0b' : 
                                        pharm.partnerStatus === 'rejected' ? '#ef4444' : '#a855f7', 
                            display: 'inline-block' 
                          }} />
                          {pharm.partnerStatus.charAt(0).toUpperCase() + pharm.partnerStatus.slice(1)}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            leftIcon={<Eye size={12} />}
                            onClick={() => setSelectedPharmacy(pharm)}
                          >
                            Review
                          </Button>
                          
                          {pharm.partnerStatus === 'pending' && (
                            <>
                              <Button 
                                variant="teal" 
                                size="sm" 
                                leftIcon={<CheckCircle size={12} />}
                                onClick={() => openConfirmDialog('approve', pharm.id)}
                              />
                              <Button 
                                variant="danger" 
                                size="sm"
                                leftIcon={<XCircle size={12} />}
                                onClick={() => openConfirmDialog('reject', pharm.id)}
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

        {filteredPharmacies.length > 10 && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Showing {showAll ? filteredPharmacies.length : Math.min(10, filteredPharmacies.length)} of {filteredPharmacies.length} pharmacy outlets
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show First 10' : `See All (${filteredPharmacies.length})`}
            </Button>
          </div>
        )}
      </Card>

      {/* Verification Details Modal */}
      {selectedPharmacy && (
        <Modal
          isOpen={!!selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
          title="Pharmacy Verification Review"
          subtitle={`Review premise permits and drug credentials for ${selectedPharmacy.name}`}
          size="xl"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {selectedPharmacy.partnerStatus !== 'pending' && (
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    Reviewed on {selectedPharmacy.verificationReviewedAt ? new Date(selectedPharmacy.verificationReviewedAt).toLocaleString() : 'N/A'}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setSelectedPharmacy(null)}>Close</Button>
                {selectedPharmacy.partnerStatus === 'pending' && (
                  <>
                    <Button 
                      variant="danger" 
                      onClick={() => openConfirmDialog('reject', selectedPharmacy.id)}
                    >
                      Reject Application
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => openConfirmDialog('approve', selectedPharmacy.id)}
                    >
                      Approve & Activate
                    </Button>
                  </>
                )}
                {selectedPharmacy.partnerStatus === 'active' && (
                  <Button 
                    variant="danger" 
                    onClick={() => openConfirmDialog('suspend', selectedPharmacy.id)}
                  >
                    Suspend Partner
                  </Button>
                )}
                {selectedPharmacy.partnerStatus === 'suspended' && (
                  <Button 
                    variant="teal" 
                    onClick={() => openConfirmDialog('approve', selectedPharmacy.id)}
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
              
              {/* Pharmacy Details Summary */}
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
                  width: 56, height: 56, borderRadius: 12, 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 20, fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  flexShrink: 0
                }}>
                  {selectedPharmacy.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>{selectedPharmacy.name}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>{selectedPharmacy.email} · {selectedPharmacy.phone}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 0 }}>{selectedPharmacy.address}, {selectedPharmacy.city}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    <Badge variant="teal">Premises License: {selectedPharmacy.licenseNo}</Badge>
                    <Badge variant="neutral">Fulfillment Ops: {selectedPharmacy.operationalStatus.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>

              {/* Document Previews */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Submitted Regulatory Files
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  {/* Pharmacy Premises Permit */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'border-color 150ms'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Pharmacy Premises Permit Certificate', url: '/images/mock-permit.png' });
                      setIsPreviewOpen(true);
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <div style={{
                      height: 100, background: '#f1f5f9', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                      <Award size={28} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Premises Permit</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{selectedPharmacy.permitUrl || 'premises_permit.png'}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} /> Preview Document
                    </span>
                  </div>

                  {/* Pharmacist Operating License */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'border-color 150ms'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Superintendent Pharmacist Operating License', url: '/images/mock-pharmacist-license.png' });
                      setIsPreviewOpen(true);
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <div style={{
                      height: 100, background: '#f1f5f9', borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#64748b'
                    }}>
                      <FileText size={28} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Pharmacist License</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{selectedPharmacy.pharmacistLicenseUrl || 'pharmacist_license.pdf'}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} /> Preview Document
                    </span>
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
                    selectedPharmacy.partnerStatus === 'active' ? '#f0fdf4' : 
                    selectedPharmacy.partnerStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${
                    selectedPharmacy.partnerStatus === 'active' ? '#bbf7d0' : 
                    selectedPharmacy.partnerStatus === 'pending' ? '#fef3c7' : '#fecaca'
                  }`,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {selectedPharmacy.partnerStatus.toUpperCase()}
                  </p>
                  {selectedPharmacy.rejectionReason && (
                    <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6, lineHeight: 1.4 }}>
                      <strong>Reason:</strong> {selectedPharmacy.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Audit Workflow Log
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
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Registry Created</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedPharmacy.createdAt ? new Date(selectedPharmacy.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', background: '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}><Check size={10} /></div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Permit Files Uploaded</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedPharmacy.verificationSubmittedAt ? new Date(selectedPharmacy.verificationSubmittedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', 
                      background: selectedPharmacy.partnerStatus === 'pending' ? '#e2e8f0' : '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}>
                      {selectedPharmacy.partnerStatus === 'pending' ? <Clock size={9} style={{ color: '#64748b' }} /> : <Check size={10} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                        {selectedPharmacy.partnerStatus === 'pending' ? 'Pending Ops Audit' : `Reviewed & ${selectedPharmacy.partnerStatus}`}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedPharmacy.verificationReviewedAt ? new Date(selectedPharmacy.verificationReviewedAt).toLocaleString() : 'Awaiting review...'}
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
                    Secure OminiPlus Document Portal (SSL Encrypted)
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
                  File: {selectedPharmacy?.name.toLowerCase().replace(/\s+/g, '_')}_permit.png<br />
                  Ref: {selectedPharmacy?.licenseNo}<br />
                  Hash: SHA-256 (6a8f89bc...)
                </div>
                <span style={{ fontSize: 11, color: '#3b82f6', background: 'rgba(37,99,235,0.1)', padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>
                  Active Encrypted Stream
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: 12.5, color: '#64748b', textAlign: 'center' }}>
              For security and HIPAA compliance, all pharmaceutical license logs are served through access-controlled channels.
            </p>
          </div>
        </Modal>
      )}

      {/* Onboard New Pharmacy Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Onboard New Pharmacy Partner"
          subtitle="Register a new pharmacy outlet or retail drug dispensing facility"
        >
          <form onSubmit={handleCreatePharmacy} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Pharmacy Name *
              </label>
              <input
                type="text"
                required
                className="input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. HealthPlus Pharmacy Lekki"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  License Number *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newLicenseNo}
                  onChange={e => setNewLicenseNo(e.target.value)}
                  placeholder="e.g. PH-LIC-58291"
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  City Location *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  placeholder="e.g. Lagos"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Phone Connection
                </label>
                <input
                  type="text"
                  className="input"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+234..."
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  General Inquiry Email
                </label>
                <input
                  type="email"
                  className="input"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="contact@pharmacy.com"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Onboard Pharmacy</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Modals */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
          title={
            confirmAction.type === 'approve' ? 'Approve Pharmacy Partner' :
            confirmAction.type === 'reject' ? 'Reject Pharmacy Partner' : 'Suspend Pharmacy Partner'
          }
          message={
            confirmAction.type === 'approve' 
              ? 'Are you sure you want to approve this pharmacy? They will get instant access to the platform services and receive a push approval notification.'
              : confirmAction.type === 'reject'
              ? 'Are you sure you want to reject this pharmacy registration? Please provide a detailed rejection explanation so they can rectify and resubmit.'
              : 'Are you sure you want to suspend this pharmacy profile? They will be blocked from logging into the partner services immediately.'
          }
          confirmLabel={
            confirmAction.type === 'approve' ? 'Approve & Activate' :
            confirmAction.type === 'reject' ? 'Reject Application' : 'Suspend Partner'
          }
          variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
          requireReason={confirmAction.type === 'reject'}
          reasonPlaceholder="Enter rejection feedback for the applicant..."
        />
      )}
    </div>
  );
}
