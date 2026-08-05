'use client';

import { useState } from 'react';
import { Calendar, Video, Phone, MapPin, Clock, Search, Eye, Filter, Download, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, Column } from '@/components/ui/Table';
import type { Appointment, AppointmentStatus } from '@/types';

// Helper to format patient identity into initials + masked ID
function getMaskedPatient(id: string, firstName: string, lastName: string) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  const numericId = id.replace(/\D/g, '') || id.substring(1, 6);
  return `${initials} — P-${numericId}`;
}

const MOCK_APPOINTMENTS: Appointment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `appt-${1000 + i}`,
  patient: { 
    id: `pat-${4800 + i}`, 
    firstName: ['Aisha', 'Babatunde', 'Chioma', 'David', 'Efe', 'Funmi', 'Grace', 'Henry'][i % 8], 
    lastName: ['Okonkwo', 'Balogun', 'Nwachukwu', 'Adebayo', 'Eze', 'Okeke', 'Ojo', 'Bello'][i % 8] 
  },
  doctor: { 
    id: `doc-${200 + i}`, 
    firstName: 'Dr.', 
    lastName: ['Alao', 'Nwachukwu', 'Yusuf', 'Okafor', 'Bello', 'Okoye', 'Adeyemi', 'Ezenwa'][i % 8], 
    specialization: ['Cardiology', 'Pediatrics', 'Neurology', 'Dermatology', 'Orthopedics', 'Psychiatry', 'General Practice', 'Oncology'][i % 8] 
  },
  scheduledAt: new Date(Date.now() + (i - 5) * 86400000 + (i * 3600000)).toISOString(),
  duration: [15, 20, 30, 45][i % 4],
  type: (['video', 'in_person', 'phone'] as const)[i % 3],
  status: (['pending', 'approved', 'completed', 'cancelled', 'completed'] as const)[i % 5],
  reason: ['General Checkup', 'Follow-up consultation', 'Prescription renewal', 'Lab results review', 'Second opinion'][i % 5],
  consultationFee: 50 + (i % 5) * 25,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const STATUS_VARIANTS: Record<AppointmentStatus, 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'info',
  completed: 'success',
  cancelled: 'error',
};

const TYPE_ICONS = {
  video: <Video size={12} style={{ color: '#2563eb' }} />,
  phone: <Phone size={12} style={{ color: '#0ea5e9' }} />,
  in_person: <MapPin size={12} style={{ color: '#10b981' }} />,
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = appointments.filter((a) => {
    // Privacy-aware search (only search Doctor's name or Patient Initials/ID representation)
    const pMasked = getMaskedPatient(a.patient.id, a.patient.firstName, a.patient.lastName).toLowerCase();
    const dName = `Dr. ${a.doctor.lastName}`.toLowerCase();
    const matchesSearch = 
      pMasked.includes(search.toLowerCase()) || 
      dName.includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCancelAppointment = (apptId: string) => {
    setAppointments(prev => 
      prev.map(a => a.id === apptId ? { ...a, status: 'cancelled' } : a)
    );
    if (selectedAppt && selectedAppt.id === apptId) {
      setSelectedAppt(prev => prev ? { ...prev, status: 'cancelled' } : null);
    }
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (a) => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{a.id}</span>
    },
    {
      key: 'patient',
      label: 'Patient (Anonymized)',
      render: (a) => (
        <span style={{ fontWeight: 600, color: '#334155' }}>
          {getMaskedPatient(a.patient.id, a.patient.firstName, a.patient.lastName)}
        </span>
      )
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (a) => (
        <div>
          <p style={{ fontWeight: 550, color: '#1e293b' }}>Dr. {a.doctor.lastName}</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{a.doctor.specialization}</p>
        </div>
      )
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled Time',
      render: (a) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
          <Clock size={13} style={{ color: '#94a3b8' }} />
          <span>{new Date(a.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (a) => (
        <Badge variant="neutral" size="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {TYPE_ICONS[a.type]}
            <span style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</span>
          </div>
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (a) => (
        <Badge variant={STATUS_VARIANTS[a.status]}>{a.status}</Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (a) => (
        <Button variant="secondary" size="sm" leftIcon={<Eye size={12} />} onClick={() => setSelectedAppt(a)}>
          Audit Info
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '4px 0 10px' }} className="animate-fade-in">
      {/* Minimal Header Card */}
      <Card
        radius="2xl"
        style={{
          padding: '24px 28px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, background: '#f8fafc',
              border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Calendar size={18} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.2 }}>
                Appointment Oversight
              </h1>
              <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 6, lineHeight: 1.5, maxWidth: 720 }}>
                Monitor scheduled consultations, review session types, and audit transaction records.
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Minimal Controls + Table Card */}
      <Card
        padding="none"
        radius="2xl"
        style={{
          border: '1px solid #eef2f7',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Appointments
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                Use search and status filters to narrow the list.
              </p>
            </div>

            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px',
              borderRadius: 999, border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: 12, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap',
            }}>
              {filtered.length} records
            </span>
          </div>

          <div style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 16, height: 46, padding: '0 14px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}>
              <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by doctor or patient reference ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13.5, color: '#334155', width: '100%', fontFamily: 'inherit',
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="select"
              style={{
                width: 184,
                background: '#ffffff',
                borderRadius: 16,
                borderColor: '#e2e8f0',
                minHeight: 46,
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '10px 8px 8px' }}>
          <Table columns={columns} data={showAll ? filtered : filtered.slice(0, 10)} keyExtractor={(a) => a.id} />
        </div>

        {filtered.length > 10 && (
          <div style={{
            padding: '16px 24px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Showing {showAll ? filtered.length : Math.min(10, filtered.length)} of {filtered.length} appointments
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

      {/* Appointment Audit Details Modal */}
      {selectedAppt && (
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title="Appointment Audit Log"
          subtitle={`Oversight record for Consultation ${selectedAppt.id}`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              {selectedAppt.status !== 'cancelled' && selectedAppt.status !== 'completed' && (
                <Button variant="danger" onClick={() => handleCancelAppointment(selectedAppt.id)}>
                  Cancel Consultation
                </Button>
              )}
              <Button variant="ghost" onClick={() => setSelectedAppt(null)}>Close Oversight</Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Warning banner indicating restricted medical records */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fef3c7', padding: 12, borderRadius: 8,
              display: 'flex', gap: 8, color: '#b45309', fontSize: 12.5, lineHeight: 1.4
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <p>
                <strong>Privacy Protocol Active:</strong> Patient consultation transcripts, clinical notes, and prescription detail summaries are NDPA-shielded. Admins have access to transaction, duration, and session metadata logs only.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11.5, color: '#64748b' }}>Patient Reference</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                  {getMaskedPatient(selectedAppt.patient.id, selectedAppt.patient.firstName, selectedAppt.patient.lastName)}
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11.5, color: '#64748b' }}>Doctor Reference</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                  Dr. {selectedAppt.doctor.lastName} ({selectedAppt.doctor.specialization})
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#64748b' }}>Duration</p>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{selectedAppt.duration} Minutes</p>
              </div>
              
              <div>
                <p style={{ fontSize: 12, color: '#64748b' }}>Transaction Fee</p>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                  ${selectedAppt.consultationFee || 0} USD
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <p style={{ fontSize: 12, color: '#64748b' }}>General Reason for Visit</p>
              <p style={{ fontSize: 13, color: '#334155', fontWeight: 550, marginTop: 4 }}>
                {selectedAppt.reason}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
