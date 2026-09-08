'use client';

import React, { useState } from 'react';
import {
  Users, Search, Eye, ShieldCheck, ShieldAlert, Download,
  CheckCircle, XCircle, Clock, Calendar, FileText, Activity, AlertTriangle, Lock
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import type { Patient } from '@/types';

// Mock Patient Directory
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-4901',
    firstName: 'Aisha',
    lastName: 'Okonkwo',
    email: 'aisha.okonkwo@gmail.com',
    phone: '+234 803 111 2233',
    dateOfBirth: '1994-05-12',
    age: 32,
    gender: 'female',
    bloodGroup: 'O+',
    genotype: 'AA',
    totalAppointments: 6,
    lastVisitAt: '2026-06-03T10:00:00Z',
    isActive: true,
    createdAt: '2025-11-14T09:30:00Z',
  },
  {
    id: 'pat-4902',
    firstName: 'Babatunde',
    lastName: 'Balogun',
    email: 'babatunde.balogun@yahoo.com',
    phone: '+234 805 222 3344',
    dateOfBirth: '1988-11-20',
    age: 37,
    gender: 'male',
    bloodGroup: 'A+',
    genotype: 'AS',
    totalAppointments: 11,
    lastVisitAt: '2026-06-01T14:15:00Z',
    isActive: true,
    createdAt: '2025-08-20T11:00:00Z',
  },
  {
    id: 'pat-4903',
    firstName: 'Chioma',
    lastName: 'Nwachukwu',
    email: 'chioma.n@outlook.com',
    phone: '+234 812 333 4455',
    dateOfBirth: '1999-03-08',
    age: 27,
    gender: 'female',
    bloodGroup: 'B+',
    genotype: 'AA',
    totalAppointments: 4,
    lastVisitAt: '2026-05-28T16:30:00Z',
    isActive: true,
    createdAt: '2026-01-10T15:45:00Z',
  },
  {
    id: 'pat-4904',
    firstName: 'David',
    lastName: 'Adebayo',
    email: 'david.adebayo@gmail.com',
    phone: '+234 901 444 5566',
    dateOfBirth: '1976-08-15',
    age: 49,
    gender: 'male',
    bloodGroup: 'O-',
    genotype: 'AA',
    totalAppointments: 18,
    lastVisitAt: '2026-06-04T09:00:00Z',
    isActive: true,
    createdAt: '2025-06-12T08:00:00Z',
  },
  {
    id: 'pat-4905',
    firstName: 'Efe',
    lastName: 'Eze',
    email: 'efe.eze@icloud.com',
    phone: '+234 802 555 6677',
    dateOfBirth: '2001-12-04',
    age: 24,
    gender: 'male',
    bloodGroup: 'AB+',
    genotype: 'AS',
    totalAppointments: 2,
    lastVisitAt: '2026-04-19T11:20:00Z',
    isActive: false, // Suspended
    createdAt: '2026-02-02T13:10:00Z',
  },
  {
    id: 'pat-4906',
    firstName: 'Funmi',
    lastName: 'Okeke',
    email: 'funmi.okeke@gmail.com',
    phone: '+234 810 666 7788',
    dateOfBirth: '1992-07-25',
    age: 33,
    gender: 'female',
    bloodGroup: 'O+',
    genotype: 'AA',
    totalAppointments: 8,
    lastVisitAt: '2026-06-02T13:45:00Z',
    isActive: true,
    createdAt: '2025-10-05T10:20:00Z',
  },
  {
    id: 'pat-4907',
    firstName: 'Grace',
    lastName: 'Ojo',
    email: 'grace.ojo@yahoo.com',
    phone: '+234 814 777 8899',
    dateOfBirth: '1985-02-18',
    age: 41,
    gender: 'female',
    bloodGroup: 'A-',
    genotype: 'AA',
    totalAppointments: 15,
    lastVisitAt: '2026-05-30T15:00:00Z',
    isActive: true,
    createdAt: '2025-07-18T14:30:00Z',
  },
  {
    id: 'pat-4908',
    firstName: 'Henry',
    lastName: 'Bello',
    email: 'henry.bello@hotmail.com',
    phone: '+234 809 888 9900',
    dateOfBirth: '1990-09-30',
    age: 35,
    gender: 'male',
    bloodGroup: 'O+',
    genotype: 'SS',
    totalAppointments: 22,
    lastVisitAt: '2026-06-04T12:00:00Z',
    isActive: true,
    createdAt: '2025-05-09T09:15:00Z',
  },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isSeeAll, setIsSeeAll] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    patientId: string;
    action: 'suspend' | 'activate';
    patientName: string;
  } | null>(null);

  // Search & Filter
  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'suspended' && !p.isActive);

    return matchesSearch && matchesStatus;
  });

  const displayedPatients = isSeeAll
    ? filteredPatients
    : filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  // KPI calculations
  const totalCount = patients.length;
  const activeCount = patients.filter((p) => p.isActive).length;
  const suspendedCount = patients.filter((p) => !p.isActive).length;
  const totalConsultations = patients.reduce((acc, p) => acc + (p.totalAppointments || 0), 0);

  const handleToggleStatus = (patientId: string, currentActive: boolean) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    setConfirmDialog({
      open: true,
      patientId,
      action: currentActive ? 'suspend' : 'activate',
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog) return;
    const { patientId, action } = confirmDialog;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, isActive: action === 'activate' } : p
      )
    );

    if (selectedPatient && selectedPatient.id === patientId) {
      setSelectedPatient((prev) => (prev ? { ...prev, isActive: action === 'activate' } : null));
    }

    setConfirmDialog(null);
  };

  const handleExportCSV = () => {
    const headers = 'ID,First Name,Last Name,Email,Phone,Age,Gender,Blood Group,Genotype,Appointments,Status,Created At\n';
    const rows = filteredPatients.map(p =>
      `"${p.id}","${p.firstName}","${p.lastName}","${p.email}","${p.phone || ''}",${p.age || ''},"${p.gender || ''}","${p.bloodGroup || ''}","${p.genotype || ''}",${p.totalAppointments || 0},"${p.isActive ? 'Active' : 'Suspended'}","${p.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ominipulse_patients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#eff6ff', color: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Patient Management
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                Directory of registered patients, health profiles, and account status controls
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download size={15} style={{ marginRight: 6 }} />
          Export Patient List
        </Button>
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Total Patients</span>
            <Users size={18} style={{ color: '#2563eb' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>{totalCount}</p>
          <span style={{ fontSize: 11.5, color: '#10b981', fontWeight: 500 }}>Active registered accounts</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Active Accounts</span>
            <CheckCircle size={18} style={{ color: '#10b981' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#10b981', margin: '8px 0 0' }}>{activeCount}</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>In good standing</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Suspended Accounts</span>
            <ShieldAlert size={18} style={{ color: '#ef4444' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#ef4444', margin: '8px 0 0' }}>{suspendedCount}</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Policy / fraud restrictions</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Total Consultations</span>
            <Activity size={18} style={{ color: '#7c3aed' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#7c3aed', margin: '8px 0 0' }}>{totalConsultations}</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Sessions booked</span>
        </Card>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <Card style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID (e.g. pat-4901)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 9,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 3, borderRadius: 9 }}>
            {(['all', 'active', 'suspended'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: statusFilter === tab ? 600 : 500,
                  background: statusFilter === tab ? '#ffffff' : 'transparent',
                  color: statusFilter === tab ? '#0f172a' : '#64748b',
                  boxShadow: statusFilter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 120ms',
                }}
              >
                {tab}
                {tab === 'active' && ` (${activeCount})`}
                {tab === 'suspended' && ` (${suspendedCount})`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Patient Table ───────────────────────────────────────────────────── */}
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Patient</th>
                <th style={{ padding: '12px 16px' }}>Contact</th>
                <th style={{ padding: '12px 16px' }}>Medical Privacy & Security</th>
                <th style={{ padding: '12px 16px' }}>Consultations</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 120ms' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Patient Name & Avatar */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0
                        }}>
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
                            {patient.firstName} {patient.lastName}
                          </p>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>ID: {patient.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, color: '#334155' }}>{patient.email}</p>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>{patient.phone || 'No phone'}</span>
                    </td>

                    {/* Medical Privacy & Security Shield */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{
                          background: '#f8fafc',
                          color: '#0f6e6e',
                          border: '1px solid #ccfbf1',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          width: 'fit-content'
                        }}>
                          <Lock size={11} />
                          EHR Vault Shielded
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          Medical records zero-knowledge to admin
                        </span>
                      </div>
                    </td>

                    {/* Consultations */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
                        {patient.totalAppointments || 0} visits
                      </p>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        Last: {patient.lastVisitAt ? new Date(patient.lastVisitAt).toLocaleDateString() : 'Never'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={patient.isActive ? 'success' : 'error'}>
                        {patient.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                          title="View Profile"
                        >
                          <Eye size={15} style={{ marginRight: 4 }} />
                          View
                        </Button>

                        <Button
                          variant={patient.isActive ? 'danger' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleStatus(patient.id, patient.isActive)}
                        >
                          {patient.isActive ? 'Suspend' : 'Reactivate'}
                        </Button>
                      </div>
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
          totalPages={Math.ceil(filteredPatients.length / pageSize)}
          onPageChange={setPage}
          total={filteredPatients.length}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
          isSeeAll={isSeeAll}
          onToggleSeeAll={() => setIsSeeAll(!isSeeAll)}
        />
      </Card>

      {/* ── Patient Profile Detail Modal ────────────────────────────────────── */}
      {selectedPatient && (
        <Modal
          isOpen={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          title="Patient Account Oversight (Platform Administration)"
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Identity Card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, flexShrink: 0
              }}>
                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                  Patient Reference: {selectedPatient.id} • Registered {new Date(selectedPatient.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={selectedPatient.isActive ? 'success' : 'error'}>
                {selectedPatient.isActive ? 'Active Account' : 'Suspended Account'}
              </Badge>
            </div>

            {/* Profile Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>ACCOUNT IDENTITY</span>
                <p style={{ margin: '6px 0 2px', fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                  Email: {selectedPatient.email}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#0f172a', fontWeight: 500 }}>
                  Phone: {selectedPatient.phone || 'None specified'}
                </p>
              </div>

              <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>MEDICAL PRIVACY & ZERO-KNOWLEDGE VAULT</span>
                <p style={{ margin: '6px 0 2px', fontSize: 13, color: '#0f6e6e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Lock size={13} /> Clinical EHR & Biometrics Shielded
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  Diagnoses, vitals, 3D body maps, and prescriptions are strictly confidential to attending doctors.
                </p>
              </div>
            </div>

            {/* NDPA Medical Privacy Shield Protocol */}
            <div style={{
              padding: 14, background: '#f8fafc', borderRadius: 10, border: '1.5px solid #e2e8f0',
              display: 'flex', alignItems: 'flex-start', gap: 10
            }}>
              <ShieldCheck size={20} style={{ color: '#0f6e6e', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#0f172a', fontWeight: 700 }}>
                  NDPA 2023 & Medical Confidentiality Protocol Active
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
                  Platform Administrators are restricted from viewing clinical histories, vital signs, 3D body maps, or prescriptions. Platform operations are limited to account authentication, lifecycle status, and fraud protection.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <Button
                variant={selectedPatient.isActive ? 'danger' : 'primary'}
                onClick={() => handleToggleStatus(selectedPatient.id, selectedPatient.isActive)}
              >
                {selectedPatient.isActive ? 'Suspend Patient Account' : 'Reactivate Patient Account'}
              </Button>

              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirmation Dialog for Account Suspend / Activate ──────────────── */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.open}
          onClose={() => setConfirmDialog(null)}
          onConfirm={handleConfirmAction}
          title={confirmDialog.action === 'suspend' ? 'Suspend Patient Account' : 'Reactivate Patient Account'}
          message={
            confirmDialog.action === 'suspend'
              ? `Are you sure you want to suspend the account for ${confirmDialog.patientName}? They will not be able to book consultations or access tele-health services until reactivated.`
              : `Are you sure you want to restore full access for ${confirmDialog.patientName}?`
          }
          confirmLabel={confirmDialog.action === 'suspend' ? 'Suspend Account' : 'Reactivate'}
          variant={confirmDialog.action === 'suspend' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
}
