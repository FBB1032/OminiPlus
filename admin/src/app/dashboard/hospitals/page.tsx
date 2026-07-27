'use client';

import { useState } from 'react';
import { 
  Building2, Search, Download, Eye, CheckCircle, XCircle, 
  Award, FileText, Clock, Check, Plus, AlertCircle
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Hospital, PartnerStatus } from '@/types';

interface VerificationHospital extends Hospital {
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  rejectionReason?: string;
  documentsCount: number;
  permitUrl?: string;
  operationsLicenseUrl?: string;
}

const INITIAL_HOSPITALS: VerificationHospital[] = [
  {
    id: 'h-101',
    name: 'Lagos General Hospital Marina',
    address: '1-4 Broad Street, Lagos Island',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 803 000 0001',
    email: 'marina@lagosgeneral.gov.ng',
    website: 'https://lagosgeneral.gov.ng',
    partnerStatus: 'pending',
    doctorCount: 42,
    createdAt: '2026-06-04T10:00:00Z',
    verificationSubmittedAt: '2026-06-04T10:15:00Z',
    documentsCount: 2,
    permitUrl: 'hospital_premises_permit_lagos.png',
    operationsLicenseUrl: 'healthcare_operations_license_lagos.pdf',
  },
  {
    id: 'h-102',
    name: 'Victoria Island Medical Center',
    address: 'Plot 24, Karimu Kotun Street',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 805 987 0001',
    email: 'info@vimc.ng',
    website: 'https://vimc.ng',
    partnerStatus: 'active',
    doctorCount: 28,
    createdAt: '2026-06-03T14:30:00Z',
    verificationSubmittedAt: '2026-06-03T14:45:00Z',
    verificationReviewedAt: '2026-06-04T09:00:00Z',
    verificationReviewedBy: 'super_admin_1',
    documentsCount: 2,
    permitUrl: 'hospital_premises_permit_vimc.png',
    operationsLicenseUrl: 'healthcare_operations_license_vimc.pdf',
  },
  {
    id: 'h-103',
    name: 'Eko Medical Center Ikeja',
    address: '31 Mobolaji Bank Anthony Way',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 812 345 0002',
    email: 'contact@ekomc.ng',
    website: 'https://ekomc.ng',
    partnerStatus: 'rejected',
    doctorCount: 35,
    createdAt: '2026-06-02T09:15:00Z',
    verificationSubmittedAt: '2026-06-02T09:30:00Z',
    verificationReviewedAt: '2026-06-02T16:00:00Z',
    verificationReviewedBy: 'verification_admin_1',
    rejectionReason: 'The Health Facility Monitoring and Accreditation Agency (HEFAMAA) license was expired. Please upload the active 2026 renewal receipt.',
    documentsCount: 2,
    permitUrl: 'hospital_premises_permit_eko.png',
    operationsLicenseUrl: 'healthcare_operations_license_eko.pdf',
  }
];

const STATUS_VARIANTS: Record<PartnerStatus, 'success' | 'warning' | 'neutral' | 'error'> = {
  active: 'success',
  pending: 'warning',
  inactive: 'neutral',
  suspended: 'error',
  rejected: 'error',
};

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<VerificationHospital[]>(INITIAL_HOSPITALS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartnerStatus>('all');
  const [selectedHospital, setSelectedHospital] = useState<VerificationHospital | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<{ title: string; url: string } | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Onboard Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Dialog Actions State
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend';
    hospitalId: string;
  } | null>(null);

  // Filter & Search Logic
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = 
      h.name.toLowerCase().includes(search.toLowerCase()) || 
      h.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || h.partnerStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = hospitals.length;
  const pendingCount = hospitals.filter((h) => h.partnerStatus === 'pending').length;
  const activeCount = hospitals.filter((h) => h.partnerStatus === 'active').length;
  const rejectedCount = hospitals.filter((h) => h.partnerStatus === 'rejected').length;
  const suspendedCount = hospitals.filter((h) => h.partnerStatus === 'suspended').length;

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCity.trim()) return;

    const newHosp: VerificationHospital = {
      id: `h-${Date.now()}`,
      name: newName,
      address: 'OminiPlus Partner Facility Address',
      city: newCity || 'Lagos',
      country: 'Nigeria',
      phone: newPhone || '+234 800 000 0000',
      email: newEmail || 'contact@partner.ominiplus.ai',
      partnerStatus: 'pending',
      doctorCount: 0,
      createdAt: new Date().toISOString(),
      documentsCount: 2,
      permitUrl: 'hospital_premises_permit.png',
      operationsLicenseUrl: 'healthcare_operations_license.pdf',
    };

    setHospitals(prev => [newHosp, ...prev]);
    setIsNewModalOpen(false);
    setNewName('');
    setNewCity('');
    setNewPhone('');
    setNewEmail('');
  };

  // Handle Action Trigger
  const openConfirmDialog = (type: 'approve' | 'reject' | 'suspend', hospitalId: string) => {
    setConfirmAction({ type, hospitalId });
  };

  // Perform State Updates
  const handleConfirmAction = (reason?: string) => {
    if (!confirmAction) return;

    const { type, hospitalId } = confirmAction;
    setHospitals((prev) => 
      prev.map((h) => {
        if (h.id !== hospitalId) return h;
        
        return {
          ...h,
          partnerStatus: type === 'approve' ? 'active' : type === 'reject' ? 'rejected' : 'suspended',
          rejectionReason: reason || undefined,
          verificationReviewedAt: new Date().toISOString(),
          verificationReviewedBy: 'super_admin_1',
        };
      })
    );

    if (selectedHospital && selectedHospital.id === hospitalId) {
      setSelectedHospital((prev) => {
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
              <Building2 size={18} style={{ color: '#2563eb' }} />
            </div>
            <h1 className="page-title">Hospital Verification</h1>
          </div>
          <p className="page-subtitle">Accredit healthcare systems, review clinical facility operations licenses, and activate partner networks.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">
            <Download size={14} /> Export CSV
          </button>
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsNewModalOpen(true)}>
            Add Hospital
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Hospital Partners', value: totalCount, border: '#cbd5e1' },
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
                }}>Requires Accreditation</span>
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
              placeholder="Search by name, city..."
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
              { key: 'all', label: 'All Networks' },
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
                <th>Healthcare Center</th>
                <th>Affiliated Doctors</th>
                <th>Location Details</th>
                <th>Accreditation Permits</th>
                <th>Onboard Date</th>
                <th>Partner Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={28} style={{ color: '#94a3b8' }} />
                      <p style={{ fontWeight: 500 }}>No hospital partners match the criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (showAll ? filteredHospitals : filteredHospitals.slice(0, 10)).map((hosp) => {
                  return (
                    <tr key={hosp.id}>
                      {/* Name & Contact */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#eff6ff', color: '#2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, border: '1.5px solid #dbeafe'
                          }}>
                            {hosp.name[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1e293b' }}>{hosp.name}</p>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{hosp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor Count */}
                      <td>
                        <p style={{ fontSize: 13, color: '#334155', fontWeight: 650 }}>{hosp.doctorCount || 0} Doctors</p>
                      </td>

                      {/* Location */}
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, color: '#334155', fontSize: 13 }}>{hosp.address}</p>
                          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{hosp.city}, {hosp.country}</p>
                        </div>
                      </td>

                      {/* Accreditation Files */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Badge variant="teal" size="sm">
                            <FileText size={10} /> {hosp.documentsCount}/2 Files
                          </Badge>
                        </div>
                      </td>

                      {/* Onboard Date */}
                      <td>
                        <span style={{ fontSize: 12.5, color: '#475569' }}>
                          {new Date(hosp.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <Badge variant={STATUS_VARIANTS[hosp.partnerStatus]}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%', 
                            background: hosp.partnerStatus === 'active' ? '#22c55e' : 
                                        hosp.partnerStatus === 'pending' ? '#f59e0b' : 
                                        hosp.partnerStatus === 'rejected' ? '#ef4444' : '#a855f7', 
                            display: 'inline-block' 
                          }} />
                          {hosp.partnerStatus.charAt(0).toUpperCase() + hosp.partnerStatus.slice(1)}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            leftIcon={<Eye size={12} />}
                            onClick={() => setSelectedHospital(hosp)}
                          >
                            Review
                          </Button>
                          
                          {hosp.partnerStatus === 'pending' && (
                            <>
                              <Button 
                                variant="teal" 
                                size="sm" 
                                leftIcon={<CheckCircle size={12} />}
                                onClick={() => openConfirmDialog('approve', hosp.id)}
                              />
                              <Button 
                                variant="danger" 
                                size="sm"
                                leftIcon={<XCircle size={12} />}
                                onClick={() => openConfirmDialog('reject', hosp.id)}
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

        {filteredHospitals.length > 10 && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Showing {showAll ? filteredHospitals.length : Math.min(10, filteredHospitals.length)} of {filteredHospitals.length} partner hospitals
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show First 10' : `See All (${filteredHospitals.length})`}
            </Button>
          </div>
        )}
      </Card>

      {/* Onboard New Hospital Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Onboard New Hospital Partner"
          subtitle="Affiliate a new hospital network or healthcare clinic facility"
        >
          <form onSubmit={handleCreateHospital} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Hospital Name *
              </label>
              <input
                type="text"
                required
                className="input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Reddington Specialist Hospital"
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
                  placeholder="contact@hospital.com"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Onboard Partner</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Verification Details Modal */}
      {selectedHospital && (
        <Modal
          isOpen={!!selectedHospital}
          onClose={() => setSelectedHospital(null)}
          title="Hospital Accreditation Review"
          subtitle={`Review premise permits and operations certificates for ${selectedHospital.name}`}
          size="xl"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {selectedHospital.partnerStatus !== 'pending' && (
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    Accredited on {selectedHospital.verificationReviewedAt ? new Date(selectedHospital.verificationReviewedAt).toLocaleString() : 'N/A'}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setSelectedHospital(null)}>Close</Button>
                {selectedHospital.partnerStatus === 'pending' && (
                  <>
                    <Button 
                      variant="danger" 
                      onClick={() => openConfirmDialog('reject', selectedHospital.id)}
                    >
                      Reject Application
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => openConfirmDialog('approve', selectedHospital.id)}
                    >
                      Approve & Accredit
                    </Button>
                  </>
                )}
                {selectedHospital.partnerStatus === 'active' && (
                  <Button 
                    variant="danger" 
                    onClick={() => openConfirmDialog('suspend', selectedHospital.id)}
                  >
                    Suspend Partner
                  </Button>
                )}
                {selectedHospital.partnerStatus === 'suspended' && (
                  <Button 
                    variant="teal" 
                    onClick={() => openConfirmDialog('approve', selectedHospital.id)}
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
              
              {/* Hospital Details Summary */}
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
                  {selectedHospital.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>{selectedHospital.name}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>{selectedHospital.email} · {selectedHospital.phone}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 0 }}>{selectedHospital.address}, {selectedHospital.city}</p>
                    {selectedHospital.website && (
                      <p style={{ fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                        <a href={selectedHospital.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 550 }}>
                          {selectedHospital.website.replace(/^https?:\/\//, '')}
                        </a>
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    <Badge variant="teal">Affiliated Staff: {selectedHospital.doctorCount} Doctors</Badge>
                  </div>
                </div>
              </div>

              {/* Document Previews */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Submitted Accreditations
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  {/* Hospital Premises Permit */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'border-color 150ms'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'Clinical Premises Permit Certificate', url: '/images/mock-permit.png' });
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
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{selectedHospital.permitUrl || 'premises_permit.png'}</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} /> Preview Document
                    </span>
                  </div>

                  {/* Healthcare Operations License */}
                  <div style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff',
                    display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', transition: 'border-color 150ms'
                  }}
                    onClick={() => {
                      setPreviewDocUrl({ title: 'HEFAMAA Healthcare Operations License', url: '/images/mock-operations-license.png' });
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
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Operations License</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{selectedHospital.operationsLicenseUrl || 'operations_license.pdf'}</p>
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
                    selectedHospital.partnerStatus === 'active' ? '#f0fdf4' : 
                    selectedHospital.partnerStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${
                    selectedHospital.partnerStatus === 'active' ? '#bbf7d0' : 
                    selectedHospital.partnerStatus === 'pending' ? '#fef3c7' : '#fecaca'
                  }`,
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {selectedHospital.partnerStatus.toUpperCase()}
                  </p>
                  {selectedHospital.rejectionReason && (
                    <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6, lineHeight: 1.4 }}>
                      <strong>Reason:</strong> {selectedHospital.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 650, color: '#334155', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Accreditation Timeline
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
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Application Received</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedHospital.createdAt ? new Date(selectedHospital.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', background: '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}><Check size={10} /></div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>HEFAMAA Permits Filed</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedHospital.verificationSubmittedAt ? new Date(selectedHospital.verificationSubmittedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 15, height: 15, borderRadius: '50%', 
                      background: selectedHospital.partnerStatus === 'pending' ? '#e2e8f0' : '#2563eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
                    }}>
                      {selectedHospital.partnerStatus === 'pending' ? <Clock size={9} style={{ color: '#64748b' }} /> : <Check size={10} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                        {selectedHospital.partnerStatus === 'pending' ? 'Accreditation Audit' : `Reviewed & ${selectedHospital.partnerStatus}`}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                        {selectedHospital.verificationReviewedAt ? new Date(selectedHospital.verificationReviewedAt).toLocaleString() : 'Awaiting compliance check...'}
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
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  File: {selectedHospital?.name.toLowerCase().replace(/\s+/g, '_')}_permit.png<br />
                  Ref: {selectedHospital?.id}<br />
                  Hash: SHA-256 (e9d8f33c...)
                </div>
                <span style={{ fontSize: 11, color: '#3b82f6', background: 'rgba(37,99,235,0.1)', padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>
                  Active Encrypted Stream
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: 12.5, color: '#64748b', textAlign: 'center' }}>
              For security and HIPAA compliance, all facility license logs are served through access-controlled channels.
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
            confirmAction.type === 'approve' ? 'Approve Hospital Accreditation' :
            confirmAction.type === 'reject' ? 'Reject Hospital Accreditation' : 'Suspend Hospital Partner'
          }
          message={
            confirmAction.type === 'approve' 
              ? 'Are you sure you want to accredit this hospital? They will get instant partner access to the platform services and receive a push approval notification.'
              : confirmAction.type === 'reject'
              ? 'Are you sure you want to reject this hospital accreditation? Please provide a detailed rejection explanation so they can rectify and resubmit.'
              : 'Are you sure you want to suspend this hospital partner? They will be blocked from access immediately.'
          }
          confirmLabel={
            confirmAction.type === 'approve' ? 'Approve & Accredit' :
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
