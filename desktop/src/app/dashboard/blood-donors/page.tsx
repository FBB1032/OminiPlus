'use client';

import { useState } from 'react';
import {
  Droplet, Search, Download, Eye, CheckCircle, XCircle,
  AlertCircle, Award, FileText, Calendar, MapPin,
  Clock, Check, UserCheck, ShieldOff, AlertTriangle, Plus, Phone
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { exportToCsv } from '@/lib/exportCsv';

interface VerificationBloodDonor {
  id: string;
  name: string;
  bloodGroup: 'O-' | 'O+' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  genotype: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  availabilityStatus: 'Available Anytime' | 'On-Call Emergency' | 'Temporarily Unavailable';
  partnerStatus: 'pending' | 'active' | 'rejected' | 'suspended';
  lastDonationDate: string;
  donationsCount: number;
  gender: string;
  age?: number;
  labReportUrl?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  rejectionReason?: string;
  donorCardUrl?: string;
  medicalCheckUrl?: string;
}

const INITIAL_DONORS: VerificationBloodDonor[] = [
  {
    id: 'bd-101',
    name: 'Samuel Okon',
    bloodGroup: 'O-',
    genotype: 'AA',
    city: 'Ikeja',
    region: 'Lagos',
    phone: '+234 802 345 6789',
    email: 'samuel.okon@gmail.com',
    availabilityStatus: 'Available Anytime',
    partnerStatus: 'active',
    lastDonationDate: '2025-11-10',
    donationsCount: 6,
    gender: 'Male',
    verificationSubmittedAt: '2025-11-01T10:00:00Z',
    verificationReviewedAt: '2025-11-02T14:30:00Z',
    verificationReviewedBy: 'super_admin_1',
    donorCardUrl: 'blood_donor_card_samuel.pdf',
    medicalCheckUrl: 'medical_clearance_samuel.pdf',
  },
  {
    id: 'bd-102',
    name: 'Grace Nwosu',
    bloodGroup: 'O+',
    genotype: 'AA',
    city: 'Victoria Island',
    region: 'Lagos',
    phone: '+234 803 987 6543',
    email: 'grace.nwosu@yahoo.com',
    availabilityStatus: 'Available Anytime',
    partnerStatus: 'active',
    lastDonationDate: '2025-12-01',
    donationsCount: 4,
    gender: 'Female',
    verificationSubmittedAt: '2025-11-20T09:15:00Z',
    verificationReviewedAt: '2025-11-21T11:00:00Z',
    verificationReviewedBy: 'verification_admin_1',
    donorCardUrl: 'blood_donor_card_grace.pdf',
    medicalCheckUrl: 'medical_clearance_grace.pdf',
  },
  {
    id: 'bd-103',
    name: 'Emmanuel Adebayo',
    bloodGroup: 'A+',
    genotype: 'AS',
    city: 'Yaba',
    region: 'Lagos',
    phone: '+234 812 444 5555',
    email: 'e.adebayo@healthnet.ng',
    availabilityStatus: 'On-Call Emergency',
    partnerStatus: 'pending',
    lastDonationDate: '2025-09-15',
    donationsCount: 9,
    gender: 'Male',
    verificationSubmittedAt: '2026-06-01T12:00:00Z',
    donorCardUrl: 'blood_donor_card_emmanuel.pdf',
    medicalCheckUrl: 'medical_clearance_emmanuel.pdf',
  },
  {
    id: 'bd-104',
    name: 'Kemi Fatimah',
    bloodGroup: 'B+',
    genotype: 'AA',
    city: 'Surulere',
    region: 'Lagos',
    phone: '+234 809 111 2233',
    email: 'kemi.fatimah@outlook.com',
    availabilityStatus: 'Available Anytime',
    partnerStatus: 'active',
    lastDonationDate: '2025-10-20',
    donationsCount: 3,
    gender: 'Female',
    verificationSubmittedAt: '2025-10-15T08:30:00Z',
    verificationReviewedAt: '2025-10-15T16:20:00Z',
    verificationReviewedBy: 'verification_admin_2',
    donorCardUrl: 'blood_donor_card_kemi.pdf',
    medicalCheckUrl: 'medical_clearance_kemi.pdf',
  },
  {
    id: 'bd-105',
    name: 'David Chidi',
    bloodGroup: 'AB+',
    genotype: 'AA',
    city: 'Lekki',
    region: 'Lagos',
    phone: '+234 701 555 7788',
    email: 'david.chidi@gmail.com',
    availabilityStatus: 'Available Anytime',
    partnerStatus: 'pending',
    lastDonationDate: '2025-08-05',
    donationsCount: 2,
    gender: 'Male',
    verificationSubmittedAt: '2026-06-03T15:40:00Z',
    donorCardUrl: 'blood_donor_card_david.pdf',
    medicalCheckUrl: 'medical_clearance_david.pdf',
  },
  {
    id: 'bd-106',
    name: 'Chinedu Eze',
    bloodGroup: 'O-',
    genotype: 'AA',
    city: 'Maitama',
    region: 'Abuja',
    phone: '+234 805 777 8899',
    email: 'chinedu.eze@abuja.gov.ng',
    availabilityStatus: 'Available Anytime',
    partnerStatus: 'active',
    lastDonationDate: '2025-12-14',
    donationsCount: 11,
    gender: 'Male',
    verificationSubmittedAt: '2025-12-10T11:00:00Z',
    verificationReviewedAt: '2025-12-11T09:30:00Z',
    verificationReviewedBy: 'super_admin_1',
    donorCardUrl: 'blood_donor_card_chinedu.pdf',
    medicalCheckUrl: 'medical_clearance_chinedu.pdf',
  },
  {
    id: 'bd-107',
    name: 'Aisha Bello',
    bloodGroup: 'A-',
    genotype: 'AA',
    city: 'Garki',
    region: 'Abuja',
    phone: '+234 818 222 3344',
    email: 'aisha.bello@fct.gov.ng',
    availabilityStatus: 'On-Call Emergency',
    partnerStatus: 'rejected',
    lastDonationDate: '2025-11-28',
    donationsCount: 5,
    gender: 'Female',
    verificationSubmittedAt: '2025-11-25T14:00:00Z',
    verificationReviewedAt: '2025-11-26T10:15:00Z',
    verificationReviewedBy: 'verification_admin_1',
    rejectionReason: 'Hemoglobin levels fell below minimum threshold requirement during medical evaluation.',
    donorCardUrl: 'blood_donor_card_aisha.pdf',
    medicalCheckUrl: 'medical_clearance_aisha.pdf',
  },
  {
    id: 'bd-108',
    name: 'Tunde Olawale',
    bloodGroup: 'B-',
    genotype: 'AS',
    city: 'Bodija',
    region: 'Ibadan',
    phone: '+234 803 333 4455',
    email: 'tunde.olawale@ibadan.edu.ng',
    availabilityStatus: 'Available Anytime',
    partnerStatus: 'active',
    lastDonationDate: '2025-10-10',
    donationsCount: 7,
    gender: 'Male',
    verificationSubmittedAt: '2025-10-01T16:00:00Z',
    verificationReviewedAt: '2025-10-02T12:00:00Z',
    verificationReviewedBy: 'super_admin_1',
    donorCardUrl: 'blood_donor_card_tunde.pdf',
    medicalCheckUrl: 'medical_clearance_tunde.pdf',
  },
  {
    id: 'bd-109',
    name: 'Ngozi Okafor',
    bloodGroup: 'AB-',
    genotype: 'AA',
    city: 'GRA',
    region: 'Port Harcourt',
    phone: '+234 806 666 9988',
    email: 'ngozi.okafor@ph-health.org',
    availabilityStatus: 'On-Call Emergency',
    partnerStatus: 'suspended',
    lastDonationDate: '2025-07-30',
    donationsCount: 8,
    gender: 'Female',
    verificationSubmittedAt: '2025-07-20T10:00:00Z',
    verificationReviewedAt: '2025-07-21T15:30:00Z',
    verificationReviewedBy: 'super_admin_1',
    rejectionReason: 'Temporary medical suspension following post-donation iron level evaluation.',
    donorCardUrl: 'blood_donor_card_ngozi.pdf',
    medicalCheckUrl: 'medical_clearance_ngozi.pdf',
  },
];

const REGIONS = ['All Regions', 'Lagos', 'Abuja', 'Ibadan', 'Port Harcourt'];
const BLOOD_GROUPS = ['All Groups', 'O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodDonorsPage() {
  const [donors, setDonors] = useState<VerificationBloodDonor[]>(INITIAL_DONORS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'suspended'>('all');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All Groups');
  const [selectedDonor, setSelectedDonor] = useState<VerificationBloodDonor | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSeeAll, setIsSeeAll] = useState(false);

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewLabDocModal, setViewLabDocModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRegion, setNewRegion] = useState('Lagos');
  const [newCity, setNewCity] = useState('');
  const [newBloodGroup, setNewBloodGroup] = useState<'O-' | 'O+' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O-');
  const [newGenotype, setNewGenotype] = useState('AA');

  // Dialog Actions State
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'suspend';
    donorId: string;
  } | null>(null);

  const handleCreateDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newCity.trim()) return;

    const newDonor: VerificationBloodDonor = {
      id: `bd-${Date.now()}`,
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@ominipulse.ai`,
      region: newRegion,
      city: newCity,
      bloodGroup: newBloodGroup,
      genotype: newGenotype,
      availabilityStatus: 'Available Anytime',
      partnerStatus: 'pending',
      lastDonationDate: new Date().toISOString().split('T')[0],
      donationsCount: 1,
      gender: 'Male',
      verificationSubmittedAt: new Date().toISOString(),
      donorCardUrl: 'donor_card_new.pdf',
      medicalCheckUrl: 'medical_clearance_new.pdf',
    };

    setDonors(prev => [newDonor, ...prev]);
    setIsNewModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCity('');
  };

  // Filter & Search Logic
  const filteredDonors = donors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);

    const matchesStatus = statusFilter === 'all' || d.partnerStatus === statusFilter;
    const matchesRegion = regionFilter === 'All Regions' || d.region === regionFilter;
    const matchesBlood = bloodGroupFilter === 'All Groups' || d.bloodGroup === bloodGroupFilter;

    return matchesSearch && matchesStatus && matchesRegion && matchesBlood;
  });

  const displayedDonors = isSeeAll
    ? filteredDonors
    : filteredDonors.slice((page - 1) * pageSize, page * pageSize);

  // KPI Calculations
  const totalCount = donors.length;
  const pendingCount = donors.filter((d) => d.partnerStatus === 'pending').length;
  const activeCount = donors.filter((d) => d.partnerStatus === 'active').length;
  const universalCount = donors.filter((d) => d.bloodGroup === 'O-').length;
  const suspendedCount = donors.filter((d) => d.partnerStatus === 'suspended').length;

  // Handle Action Trigger
  const openConfirmDialog = (type: 'approve' | 'reject' | 'suspend', donorId: string) => {
    setConfirmAction({ type, donorId });
  };

  // Perform State Updates
  const handleConfirmAction = (reason?: string) => {
    if (!confirmAction) return;

    const { type, donorId } = confirmAction;
    setDonors((prev) =>
      prev.map((d) => {
        if (d.id !== donorId) return d;

        return {
          ...d,
          partnerStatus: type === 'approve' ? 'active' : type === 'reject' ? 'rejected' : 'suspended',
          rejectionReason: reason || undefined,
          verificationReviewedAt: new Date().toISOString(),
          verificationReviewedBy: 'super_admin_1',
        };
      })
    );

    if (selectedDonor && selectedDonor.id === donorId) {
      setSelectedDonor((prev) => {
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
              width: 38, height: 38, borderRadius: 10, background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Droplet size={18} style={{ color: '#dc2626' }} />
            </div>
            <h1 className="page-title">Blood Donor Registry</h1>
          </div>
          <p className="page-subtitle">Categorized management of verified voluntary blood donors by region, city, and blood type.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => exportToCsv('blood_donors_registry', filteredDonors.map(d => ({
              id: d.id,
              name: d.name,
              bloodGroup: d.bloodGroup,
              genotype: d.genotype,
              city: d.city,
              region: d.region,
              phone: d.phone,
              email: d.email,
              status: d.partnerStatus,
              donationsCount: d.donationsCount,
              lastDonationDate: d.lastDonationDate
            })))}
          >
            <Download size={14} /> Export CSV
          </button>
          <Button variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsNewModalOpen(true)} style={{ background: '#dc2626', borderColor: '#dc2626' }}>
            Register Donor
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Donors', value: totalCount, border: '#cbd5e1' },
          { label: 'Pending Review', value: pendingCount, border: '#f59e0b', highlight: true },
          { label: 'Active Donors', value: activeCount, border: '#22c55e' },
          { label: 'Universal (O-)', value: universalCount, border: '#dc2626', priority: true },
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
              {kpi.priority && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#dc2626', background: '#fee2e2',
                  padding: '2px 6px', borderRadius: 4
                }}>High Priority</span>
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
              placeholder="Search by donor name, city, phone..."
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

          {/* Categorization Dropdowns (Region & Blood Group) */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              style={{
                height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#f8fafc', fontSize: 12.5, fontWeight: 600, color: '#334155', outline: 'none'
              }}
            >
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={bloodGroupFilter}
              onChange={(e) => {
                setBloodGroupFilter(e.target.value);
                setPage(1);
              }}
              style={{
                height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#f8fafc', fontSize: 12.5, fontWeight: 600, color: '#dc2626', outline: 'none'
              }}
            >
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>Blood: {bg}</option>
              ))}
            </select>
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
                <th>Voluntary Donor</th>
                <th>Blood Type & Genotype</th>
                <th>Region & Area</th>
                <th>Contact Phone</th>
                <th>Availability</th>
                <th>Partner Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={28} style={{ color: '#94a3b8' }} />
                      <p style={{ fontWeight: 500 }}>No blood donors match the criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedDonors.map((donor) => {
                  return (
                    <tr key={donor.id}>
                      {/* Name & Contact */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: donor.bloodGroup === 'O-' ? '#fee2e2' : '#eff6ff',
                            color: donor.bloodGroup === 'O-' ? '#dc2626' : '#2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, border: donor.bloodGroup === 'O-' ? '1.5px solid #fca5a5' : '1.5px solid #dbeafe'
                          }}>
                            {donor.name[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1e293b' }}>{donor.name}</p>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{donor.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Blood Group & Genotype */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                            fontWeight: 700, fontSize: 12,
                            background: donor.bloodGroup === 'O-' ? '#fee2e2' : '#f1f5f9',
                            color: donor.bloodGroup === 'O-' ? '#dc2626' : '#0f172a',
                            border: donor.bloodGroup === 'O-' ? '1px solid #fca5a5' : '1px solid #cbd5e1'
                          }}>
                            {donor.bloodGroup}
                          </span>
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>({donor.genotype})</span>
                        </div>
                      </td>

                      {/* Region & Area */}
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, color: '#334155', fontSize: 13 }}>{donor.region}</p>
                          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{donor.city}</p>
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td>
                        <p style={{ fontSize: 12.5, fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>{donor.phone}</p>
                      </td>

                      {/* Availability */}
                      <td>
                        <Badge variant={donor.availabilityStatus === 'Available Anytime' ? 'success' : 'warning'} size="sm">
                          {donor.availabilityStatus}
                        </Badge>
                      </td>

                      {/* Partner Status */}
                      <td>
                        <Badge
                          variant={
                            donor.partnerStatus === 'active' ? 'success' :
                            donor.partnerStatus === 'pending' ? 'warning' :
                            donor.partnerStatus === 'rejected' ? 'error' : 'neutral'
                          }
                          size="sm"
                        >
                          {donor.partnerStatus.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedDonor(donor)}
                          >
                            <Eye size={13} /> Details
                          </button>

                          {donor.partnerStatus === 'pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => openConfirmDialog('approve', donor.id)}
                              >
                                <CheckCircle size={13} /> Verify
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openConfirmDialog('reject', donor.id)}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}

                          {donor.partnerStatus === 'active' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626' }}
                              onClick={() => openConfirmDialog('suspend', donor.id)}
                            >
                              <ShieldOff size={13} /> Suspend
                            </button>
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
          totalPages={Math.ceil(filteredDonors.length / pageSize)}
          onPageChange={setPage}
          total={filteredDonors.length}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
          isSeeAll={isSeeAll}
          onToggleSeeAll={() => setIsSeeAll(!isSeeAll)}
        />
      </Card>

      {/* ── Donor Details Modal Drawer ──────────────────────────────────── */}
      {selectedDonor && (
        <Modal
          isOpen={!!selectedDonor}
          onClose={() => setSelectedDonor(null)}
          title="Blood Donor Verification & Medical Lab Credentials"
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700
                }}>
                  {selectedDonor.name[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{selectedDonor.name}</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    {selectedDonor.gender || 'Male'} • {selectedDonor.age || 28} Yrs • Phone: {selectedDonor.phone}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  selectedDonor.partnerStatus === 'active' ? 'success' :
                  selectedDonor.partnerStatus === 'pending' ? 'warning' : 'error'
                }
              >
                {selectedDonor.partnerStatus.toUpperCase()}
              </Badge>
            </div>

            {/* Mandatory Lab Report Section */}
            <div style={{
              background: '#f0f9ff', padding: 16, borderRadius: 12,
              border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: '#0284c7', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>Blood Group Lab Report Document</p>
                  <p style={{ fontSize: 12, color: '#0284c7' }}>
                    {selectedDonor.labReportUrl || `blood_lab_report_${selectedDonor.id}.pdf`} • Verified Lab Result Scan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewLabDocModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ background: '#ffffff', borderColor: '#7dd3fc', color: '#0369a1', fontWeight: 700, cursor: 'pointer' }}
              >
                View Document
              </button>
            </div>

            {/* Grid details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>BLOOD TYPE & GENOTYPE</span>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                  {selectedDonor.bloodGroup} ({selectedDonor.genotype})
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>LOCATION & CITY</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>
                  {selectedDonor.city}, {selectedDonor.region}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ACTIVE PHONE NUMBER</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4, fontFamily: 'monospace' }}>
                  {selectedDonor.phone}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>AVAILABILITY STATUS</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#059669', marginTop: 4 }}>
                  {selectedDonor.availabilityStatus}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>LAST DONATION DATE</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>
                  {selectedDonor.lastDonationDate}
                </p>
              </div>

              <div style={{ background: '#ffffff', padding: 14, borderRadius: 10, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PREVIOUS DONATIONS COUNT</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginTop: 4 }}>
                  {selectedDonor.donationsCount} Completed Donations
                </p>
              </div>
            </div>

            {selectedDonor.rejectionReason && (
              <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Audit Reason:</span>
                <p style={{ fontSize: 13, color: '#991b1b', marginTop: 2 }}>{selectedDonor.rejectionReason}</p>
              </div>
            )}

            {/* Action buttons inside detail modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <Button variant="secondary" onClick={() => setSelectedDonor(null)}>Close</Button>
              {selectedDonor.partnerStatus === 'pending' && (
                <>
                  <Button variant="danger" onClick={() => openConfirmDialog('reject', selectedDonor.id)}>Reject</Button>
                  <Button variant="primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => openConfirmDialog('approve', selectedDonor.id)}>Approve & Verify Donor</Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Register New Donor ──────────────────────────────────── */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Register Walk-in Blood Donor"
          size="md"
        >
          <form onSubmit={handleCreateDonor} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Samuel Okon"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: '100%', height: 38, paddingLeft: 10, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Region</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  style={{ width: '100%', height: 38, paddingLeft: 8, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  {REGIONS.filter(r => r !== 'All Regions').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>City / Area</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  style={{ width: '100%', height: 38, paddingLeft: 8, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  {(
                    {
                      'Lagos State': ['Ikeja', 'Victoria Island (VI)', 'Lekki Phase 1', 'Yaba', 'Surulere', 'Maryland', 'Ikoyi', 'Festac Town', 'Ajah', 'Alimosho'],
                      'FCT Abuja': ['Garki', 'Wuse Phase 2', 'Maitama', 'Jabi', 'Asokoro', 'Utako', 'Gwarinpa', 'Kubwa', 'Lugbe'],
                      'Rivers State': ['Port Harcourt (GRA)', 'Rumuokoro', 'Trans Amadi', 'Obio-Akpor', 'Eleme', 'Oyigbo'],
                      'Oyo State': ['Ibadan (Bodija)', 'Dugbe', 'Ring Road', 'Jericho', 'Mokola', 'Ogbomoso'],
                      'Enugu State': ['Enugu Urban', 'Independence Layout', 'GRA Enugu', 'New Haven', 'Nsukka'],
                      'Kano State': ['Kano Central', 'Sabon Gari', 'Nassarawa', 'Tarauni'],
                      'Delta State': ['Warri', 'Asaba', 'Effurun', 'Sapele'],
                      'Edo State': ['Benin City (GRA)', 'Uselu', 'Ekpoma'],
                      'Kaduna State': ['Kaduna Central', 'Barnawa', 'Tudun Wada', 'Zaria'],
                      'Ogun State': ['Abeokuta', 'Sagamu', 'Sango Ota', 'Ijebu Ode'],
                      'Anambra State': ['Awka', 'Onitsha', 'Nnewi'],
                      'Abia State': ['Umuahia', 'Aba'],
                      'Akwa Ibom State': ['Uyo', 'Eket'],
                      'Cross River State': ['Calabar Urban', 'Ikom'],
                      'Imo State': ['Owerri (World Bank)', 'Orlu'],
                      'Kwara State': ['Ilorin Central', 'Offa'],
                      'Plateau State': ['Jos South', 'Jos North'],
                    }[newRegion] || ['Ikeja', 'Central Area', 'Urban']
                  ).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Blood Group</label>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value as any)}
                  style={{ width: '100%', height: 38, paddingLeft: 8, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  {['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Genotype</label>
                <select
                  value={newGenotype}
                  onChange={(e) => setNewGenotype(e.target.value)}
                  style={{ width: '100%', height: 38, paddingLeft: 8, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                >
                  {['AA', 'AS', 'AC', 'Other'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Contact Phone</label>
              <input
                type="text"
                required
                placeholder="e.g. +234 802 000 1111"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                style={{ width: '100%', height: 38, paddingLeft: 10, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <Button type="button" variant="secondary" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>Register Donor</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={(reason) => handleConfirmAction(reason)}
          title={
            confirmAction.type === 'approve' ? 'Verify & Activate Donor' :
            confirmAction.type === 'reject' ? 'Reject Donor Credentials' : 'Suspend Donor Account'
          }
          message={
            confirmAction.type === 'approve' ? 'Are you sure you want to verify this voluntary donor? They will become eligible for live GPS dispatch.' :
            confirmAction.type === 'reject' ? 'Please specify the audit reason for rejecting this donor verification submission.' :
            'Are you sure you want to suspend this donor account?'
          }
          confirmLabel={
            confirmAction.type === 'approve' ? 'Verify Donor' :
            confirmAction.type === 'reject' ? 'Reject Credentials' : 'Suspend Account'
          }
          requireReason={confirmAction.type === 'reject' || confirmAction.type === 'suspend'}
          variant={confirmAction.type === 'approve' ? 'primary' : 'danger'}
        />
      )}

      {/* Lab Report Document Preview Modal */}
      {viewLabDocModal && selectedDonor && (
        <Modal
          isOpen={viewLabDocModal}
          onClose={() => setViewLabDocModal(false)}
          title={`Verified Blood Lab Report: ${selectedDonor.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Donor Identity</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{selectedDonor.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Blood Group: <strong style={{ color: '#dc2626' }}>{selectedDonor.bloodGroup}</strong> • Genotype: <strong>{selectedDonor.genotype}</strong></div>
              </div>
              <Badge variant="success">LAB VERIFIED</Badge>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Pathology & Serology Clearance Certificate</div>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                Attached Document: <strong>{selectedDonor.labReportUrl || `blood_lab_report_${selectedDonor.id}.pdf`}</strong>
              </p>
              <div style={{ marginTop: 10, padding: 10, background: '#ffffff', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, color: '#334155', lineHeight: 1.8 }}>
                <strong>• HIV I & II:</strong> Non-Reactive<br />
                <strong>• Hepatitis B (HBsAg):</strong> Negative<br />
                <strong>• Hepatitis C (HCV):</strong> Negative<br />
                <strong>• Syphilis (VDRL):</strong> Non-Reactive<br />
                <strong>• Hemoglobin Level:</strong> 14.8 g/dL (Cleared for Phlebotomy)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <Button variant="outline" onClick={() => setViewLabDocModal(false)}>Close</Button>
              <Button variant="primary" onClick={() => window.print()}>Print Clearance Slip</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
