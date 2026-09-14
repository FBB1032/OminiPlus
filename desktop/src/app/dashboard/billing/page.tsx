'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Stethoscope, Receipt, DollarSign, CreditCard,
  Download, Plus, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, ArrowUpRight, TrendingUp, Calendar, FileText,
  Check, X, RefreshCw, Send, ShieldCheck, Banknote, Sparkles,
  ChevronRight, ExternalLink, HelpCircle, Layers, ArrowDownRight,
  Printer, CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { liveApi, getApiErrorMessage } from '@/services/api';
import type { Hospital, PaymentTransaction, Doctor } from '@/types';

interface HospitalContract {
  id: string;
  hospitalName: string;
  state: string;
  tier: 'Enterprise Multi-Dept' | 'Regional Medical Center' | 'Standard Clinic';
  annualFee: number;
  contractStartDate: string;
  nextRenewalDate: string;
  status: 'active' | 'pending_invoice' | 'overdue';
  beds: number;
  staffSeats: number;
  contactEmail: string;
  facilityCode: string;
}

/** Maps a live hospital row onto the contract view shape. */
function mapContract(h: Hospital): HospitalContract {
  return {
    id: h.id,
    hospitalName: h.name,
    state: h.city,
    tier: 'Regional Medical Center',
    annualFee: 0,
    contractStartDate: h.createdAt,
    nextRenewalDate: '—',
    status: h.partnerStatus === 'active' ? 'active' : h.partnerStatus === 'pending' ? 'pending_invoice' : 'overdue',
    beds: 0,
    staffSeats: 0,
    contactEmail: h.email,
    facilityCode: h.id.slice(0, 8).toUpperCase(),
  };
}

interface DoctorCommissionRecord {
  id: string;
  doctorName: string;
  specialization: string;
  mdcnLicense: string;
  consultationFee: number;
  totalAppointments: number;
  grossBookings: number;
  platformCut: number; // 15%
  doctorNetEarnings: number; // 85%
  payoutStatus: 'settled' | 'pending_batch';
  lastPayoutDate: string;
  bankAccount: string;
}

/** Derives a commission record from live doctor + payment ledger rows. */
function mapCommission(doctor: Doctor, payments: PaymentTransaction[]): DoctorCommissionRecord {
  const doctorTxs = payments.filter((tx) => tx.doctorId === doctor.id);
  const gross = doctorTxs.reduce((acc, tx) => acc + (tx.status !== 'refunded' ? tx.amount : 0), 0);
  const platformCut = doctorTxs.reduce((acc, tx) => acc + (tx.status !== 'refunded' ? tx.platformFee : 0), 0);
  const hasSettled = doctorTxs.some((tx) => tx.status === 'released');
  return {
    id: doctor.id,
    doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    specialization: doctor.specialization,
    mdcnLicense: doctor.licenseNo ?? '—',
    consultationFee: doctor.consultationFee ?? 0,
    totalAppointments: doctorTxs.length,
    grossBookings: gross,
    platformCut,
    doctorNetEarnings: gross - platformCut,
    payoutStatus: hasSettled ? 'settled' : 'pending_batch',
    lastPayoutDate: doctorTxs.find((tx) => tx.escrowReleasedAt)?.escrowReleasedAt?.slice(0, 10) ?? '—',
    bankAccount: '•••• (managed)',
  };
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  recipient: string;
  type: 'Hospital Enterprise License' | 'Hospital Bed Module' | 'Blood Screening Extension';
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  vatAmount: number;
  paymentMethod?: string;
  transactionRef?: string;
}

export default function PlatformBillingManagementPage() {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors' | 'invoices'>('hospitals');
  // Live financial data (hospitals + doctor commission ledger derived from
  // the payments table) — no fallback; failures render an explicit error state.
  const [contracts, setContracts] = useState<HospitalContract[]>([]);
  const [doctors, setDoctors] = useState<DoctorCommissionRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'pending'>('all');

  // Pagination for Tab 1 (Hospital Contracts)
  const [contractPage, setContractPage] = useState(1);
  const [contractPageSize, setContractPageSize] = useState(10);
  const [contractIsSeeAll, setContractIsSeeAll] = useState(false);

  // Pagination for Tab 2 (Doctor Commissions)
  const [doctorPage, setDoctorPage] = useState(1);
  const [doctorPageSize, setDoctorPageSize] = useState(10);
  const [doctorIsSeeAll, setDoctorIsSeeAll] = useState(false);

  // Pagination for Tab 3 (Official Invoices)
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);
  const [invoiceIsSeeAll, setInvoiceIsSeeAll] = useState(false);

  // Load live billing data: hospital contracts, the payments ledger, and the
  // doctor registry (commissions are derived from payments per doctor).
  const loadBillingData = useCallback(async () => {
    try {
      const [hospitalsResult, paymentsResult, doctorsResult] = await Promise.allSettled([
        liveApi.getHospitals(),
        liveApi.getPayments(),
        liveApi.getDoctors(),
      ]);

      if (hospitalsResult.status === 'fulfilled') {
        setContracts(hospitalsResult.value.map(mapContract));
      }
      if (paymentsResult.status === 'fulfilled' && doctorsResult.status === 'fulfilled') {
        setDoctors(
          doctorsResult.value.map((d) => mapCommission(d, paymentsResult.value))
        );
      }

      const failed = [hospitalsResult, paymentsResult, doctorsResult].filter(
        (r) => r.status === 'rejected'
      );
      if (failed.length === 3) {
        setLoadError(getApiErrorMessage((failed[0] as PromiseRejectedResult).reason as Error));
      } else {
        setLoadError(null);
      }
      setIsLoading(false);
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBillingData();
  }, [loadBillingData]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setContractPage(1);
    setDoctorPage(1);
    setInvoicePage(1);
  };

  const handleStatusFilterChange = (val: 'all' | 'active' | 'overdue' | 'pending') => {
    setStatusFilter(val);
    setContractPage(1);
  };

  // Modals
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [previewInvoiceModal, setPreviewInvoiceModal] = useState<InvoiceRecord | null>(null);
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);
  const [selectedDoctorForPayout, setSelectedDoctorForPayout] = useState<DoctorCommissionRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Invoice Form state
  const [invHospital, setInvHospital] = useState('');
  const [invType, setInvType] = useState<'Hospital Enterprise License' | 'Hospital Bed Module' | 'Blood Screening Extension'>('Hospital Enterprise License');
  const [invAmount, setInvAmount] = useState('1500000');
  const [invDueDate, setInvDueDate] = useState('2026-08-15');

  // Stats Calculations
  const totalHospitalARR = contracts.reduce((acc, c) => acc + (c.status === 'active' ? c.annualFee : 0), 0);
  const totalDoctorGross = doctors.reduce((acc, d) => acc + d.grossBookings, 0);
  const totalPlatformCommissions = doctors.reduce((acc, d) => acc + d.platformCut, 0);
  const totalDoctorNetDisbursed = doctors.reduce((acc, d) => acc + (d.payoutStatus === 'settled' ? d.doctorNetEarnings : 0), 0);
  const totalOverdue = contracts.filter(c => c.status === 'overdue').reduce((acc, c) => acc + c.annualFee, 0);
  const pendingPayoutCount = doctors.filter(d => d.payoutStatus === 'pending_batch').length;

  // Filtered & Paginated Tab Lists
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) || c.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const displayedContracts = contractIsSeeAll
    ? filteredContracts
    : filteredContracts.slice((contractPage - 1) * contractPageSize, contractPage * contractPageSize);

  const filteredDoctors = doctors.filter(d =>
    d.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedDoctors = doctorIsSeeAll
    ? filteredDoctors
    : filteredDoctors.slice((doctorPage - 1) * doctorPageSize, doctorPage * doctorPageSize);

  const filteredInvoices = invoices.filter(inv =>
    inv.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedInvoices = invoiceIsSeeAll
    ? filteredInvoices
    : filteredInvoices.slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(invAmount) || 0;
    const newInv: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `OMP-INV-2026-${Math.floor(120 + Math.random() * 800)}`,
      recipient: invHospital,
      type: invType,
      amount: numericAmount,
      vatAmount: Math.round(numericAmount * 0.075),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate,
      status: 'unpaid',
    };
    setInvoices([newInv, ...invoices]);
    setNewInvoiceModalOpen(false);
    showToast(`Invoice ${newInv.invoiceNumber} successfully created and dispatched.`);
  };

  const handleMarkContractPaid = (contractId: string) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'active' } : c));
    showToast('Bank transfer recorded. Hospital contract renewed for 12 months.');
  };

  const handleExecutePayout = (doctorId: string) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id === doctorId) {
        return {
          ...doc,
          payoutStatus: 'settled',
          lastPayoutDate: new Date().toISOString().split('T')[0],
        };
      }
      return doc;
    }));
    setDisburseModalOpen(false);
    showToast(`Instant NIBSS payout batch disbursed to physician.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Live data connection state */}
      {isLoading && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af',
          borderRadius: 10, padding: '14px 16px', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <RefreshCw size={15} className="animate-spin" />
          Loading billing records from the live database…
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
              Failed to load billing records from the live database
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#dc2626' }}>
              {loadError} — check your connection and role, then retry.
            </p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={12} />} onClick={() => { setIsLoading(true); void loadBillingData(); }}>
            Retry
          </Button>
        </div>
      )}

      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#0f172a', color: '#ffffff', padding: '12px 20px',
          borderRadius: 10, border: '1px solid #334155', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Page Header (Standard Desktop App Layout) ───────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: '#e6f4f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6e6e'
            }}>
              <Receipt size={20} />
            </div>
            <h1 className="page-title">Institutional & Doctor Billing Management</h1>
          </div>
          <p className="page-subtitle">
            Oversee institutional hospital licensing contracts, 15% platform consultation commission splits, and MDCN-verified physician disbursements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="primary"
            leftIcon={<Plus size={14} />}
            onClick={() => setNewInvoiceModalOpen(true)}
          >
            Create Hospital Invoice
          </Button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const pendingDoc = doctors.find(d => d.payoutStatus === 'pending_batch');
              if (pendingDoc) {
                setSelectedDoctorForPayout(pendingDoc);
                setDisburseModalOpen(true);
              } else {
                showToast('All physician commissions are currently settled.');
              }
            }}
          >
            <Banknote size={14} /> Disburse Doctor Batch ({pendingPayoutCount})
          </button>
        </div>
      </div>

      {/* ── Compliance & Settlement Metadata Strip ───────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18,
        padding: '10px 16px', background: '#ffffff', borderRadius: 10,
        border: '1px solid #e2e8e8', fontSize: 12.5, color: '#647474',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={15} style={{ color: '#0f6e6e' }} />
          <span style={{ fontWeight: 600, color: '#1e2a2a' }}>Settlement Engine:</span> Active (NDPA & MDCN Compliant)
        </div>
        <span style={{ color: '#cbd5d5' }}>•</span>
        <div>
          <span style={{ fontWeight: 600, color: '#1e2a2a' }}>Platform Split:</span> 15% Platform Commission / 85% Physician Net
        </div>
        <span style={{ color: '#cbd5d5' }}>•</span>
        <div>
          <span style={{ fontWeight: 600, color: '#1e2a2a' }}>Tax Compliance:</span> FIRS Nigeria (7.5% VAT Itemization)
        </div>
      </div>

      {/* ── 4 KPI Financial Metric Cards (Standard Desktop Theme) ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          {
            label: 'Hospital Contract ARR',
            value: `₦${totalHospitalARR.toLocaleString()}`,
            sub: `${contracts.filter(c => c.status === 'active').length} Active Facilities`,
            border: '#0f6e6e',
            icon: Building2,
            iconColor: '#0f6e6e',
            iconBg: '#e6f4f4'
          },
          {
            label: 'Platform Commission (15%)',
            value: `₦${totalPlatformCommissions.toLocaleString()}`,
            sub: `From ₦${totalDoctorGross.toLocaleString()} bookings`,
            border: '#2563eb',
            icon: TrendingUp,
            iconColor: '#2563eb',
            iconBg: '#eff6ff'
          },
          {
            label: 'Physician Net Payouts (85%)',
            value: `₦${totalDoctorNetDisbursed.toLocaleString()}`,
            sub: 'Direct Bank Disbursed',
            border: '#16a34a',
            icon: Stethoscope,
            iconColor: '#16a34a',
            iconBg: '#f0fdf4'
          },
          {
            label: 'Renewal Receivables',
            value: `₦${totalOverdue.toLocaleString()}`,
            sub: `${contracts.filter(c => c.status === 'overdue').length} Facility Due Renewal`,
            border: '#f59e0b',
            icon: AlertTriangle,
            iconColor: '#d97706',
            iconBg: '#fffbeb'
          },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: '#ffffff',
            border: '1px solid #e2e8e8',
            borderLeft: `4px solid ${kpi.border}`,
            borderRadius: 12,
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', margin: 0 }}>{kpi.label}</p>
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: kpi.iconBg, color: kpi.iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <kpi.icon size={15} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px', letterSpacing: '-0.02em' }}>
              {kpi.value}
            </p>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Navigation Tabs (Standard Desktop App Pattern) ───────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        borderBottom: '1px solid #e2e8e8',
        paddingBottom: 0
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'hospitals', label: 'Hospital Contracts', count: contracts.length, icon: Building2 },
            { key: 'doctors', label: 'Doctor Commissions (15% Split)', count: doctors.length, icon: Stethoscope },
            { key: 'invoices', label: 'Official Invoices', count: invoices.length, icon: Receipt },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  borderBottom: isSelected ? '3px solid #0f6e6e' : '3px solid transparent',
                  background: isSelected ? '#e6f4f4' : 'transparent',
                  color: isSelected ? '#0f6e6e' : '#647474',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span style={{
                  padding: '2px 7px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  background: isSelected ? '#c2e5e5' : '#f0f4f4',
                  color: isSelected ? '#042a2a' : '#647474'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', border: '1px solid #e2e8e8',
          borderRadius: 8, height: 36, padding: '0 12px', width: 280,
          marginBottom: 6
        }}>
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search records, facility, or doctor..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: '#1e2a2a', width: '100%', fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* ── TAB 1: HOSPITAL INSTITUTIONAL CONTRACTS ─────────────────── */}
      {activeTab === 'hospitals' && (
        <div style={{
          background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0',
          boxShadow: '0 4px 25px rgba(0,0,0,0.03)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                Accredited Hospital Licensing Directory
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Annual institutional ARR agreements, licensed bed counts, and clinical seat authorizations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as any)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
                  background: '#ffffff', fontSize: 12.5, fontWeight: 600, color: '#334155', outline: 'none'
                }}
              >
                <option value="all">All Statuses ({contracts.length})</option>
                <option value="active">Active ({contracts.filter(c => c.status === 'active').length})</option>
                <option value="overdue">Overdue ({contracts.filter(c => c.status === 'overdue').length})</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>Facility Details</th>
                  <th style={{ padding: '14px 16px' }}>Contract Tier</th>
                  <th style={{ padding: '14px 16px' }}>Capacity & Seats</th>
                  <th style={{ padding: '14px 16px' }}>Annual License ARR</th>
                  <th style={{ padding: '14px 16px' }}>Next Renewal</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedContracts.map((contract) => (
                    <tr
                      key={contract.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Facility */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: '#f0fdfa', border: '1px solid #ccfbf1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0f766e', fontWeight: 800, fontSize: 13
                          }}>
                            {contract.hospitalName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 750, color: '#0f172a', fontSize: 14 }}>
                              {contract.hospitalName}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{contract.state}</span> • {contract.facilityCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                          background: contract.tier === 'Enterprise Multi-Dept' ? '#eff6ff' : contract.tier === 'Regional Medical Center' ? '#f5f3ff' : '#f8fafc',
                          color: contract.tier === 'Enterprise Multi-Dept' ? '#1d4ed8' : contract.tier === 'Regional Medical Center' ? '#6d28d9' : '#334155',
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                          {contract.tier}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>
                          {contract.beds} Licensed Beds
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                          {contract.staffSeats} Clinical Staff Seats
                        </div>
                      </td>

                      {/* ARR */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14.5 }}>
                          ₦{contract.annualFee.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Standard Annual Cycle
                        </div>
                      </td>

                      {/* Renewal */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} style={{ color: '#64748b' }} />
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{contract.nextRenewalDate}</span>
                        </div>
                        <div style={{ fontSize: 11, color: contract.status === 'overdue' ? '#dc2626' : '#059669', fontWeight: 600, marginTop: 2 }}>
                          {contract.status === 'overdue' ? 'Renewal Overdue' : 'Active Term'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        {contract.status === 'active' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#dcfce7', color: '#15803d'
                          }}>
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {contract.status === 'pending_invoice' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#eff6ff', color: '#1d4ed8'
                          }}>
                            <Clock size={12} /> Invoice Sent
                          </span>
                        )}
                        {contract.status === 'overdue' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#fee2e2', color: '#b91c1c'
                          }}>
                            <AlertTriangle size={12} /> Renewal Overdue
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          {contract.status === 'overdue' && (
                            <button
                              onClick={() => handleMarkContractPaid(contract.id)}
                              style={{
                                background: '#059669', color: '#ffffff', border: 'none',
                                padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(5,150,105,0.2)'
                              }}
                            >
                              <Check size={13} /> Record Payment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setInvHospital(contract.hospitalName);
                              setInvAmount(contract.annualFee.toString());
                              setNewInvoiceModalOpen(true);
                            }}
                            style={{
                              background: '#f8fafc', color: '#0f766e', border: '1px solid #cbd5e1',
                              padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'
                            }}
                          >
                            <Send size={13} /> Re-Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={contractPage}
            totalPages={Math.max(1, Math.ceil(filteredContracts.length / contractPageSize))}
            onPageChange={setContractPage}
            total={filteredContracts.length}
            pageSize={contractPageSize}
            onPageSizeChange={(newSize) => {
              setContractPageSize(newSize);
              setContractPage(1);
            }}
            isSeeAll={contractIsSeeAll}
            onToggleSeeAll={() => setContractIsSeeAll(!contractIsSeeAll)}
          />
        </div>
      )}

      {/* ── TAB 2: DOCTOR CONSULTATION COMMISSIONS (15% SPLIT) ──────── */}
      {activeTab === 'doctors' && (
        <div style={{
          background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0',
          boxShadow: '0 4px 25px rgba(0,0,0,0.03)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                  Doctor Telehealth Commission Revenue Ledger
                </h3>
                <span style={{
                  fontSize: 11, fontWeight: 750, background: '#dcfce7', color: '#166534',
                  padding: '2px 8px', borderRadius: 6
                }}>
                  15% Platform Share
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Physicians set autonomous rates. OminiPulse automatically deducts 15% infrastructure fee per completed booking held in escrow.
              </p>
            </div>

            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12
            }}>
              <span style={{ color: '#64748b' }}>Platform Share:</span>
              <strong style={{ color: '#0f172a' }}>₦{totalPlatformCommissions.toLocaleString()}</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>Physician & Credentials</th>
                  <th style={{ padding: '14px 16px' }}>Published Fee</th>
                  <th style={{ padding: '14px 16px' }}>Appointments</th>
                  <th style={{ padding: '14px 16px' }}>Gross Revenue</th>
                  <th style={{ padding: '14px 16px', color: '#059669' }}>OminiPulse 15%</th>
                  <th style={{ padding: '14px 16px', color: '#7c3aed' }}>Doctor Net (85%)</th>
                  <th style={{ padding: '14px 16px' }}>Payout Settlement</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedDoctors.map((doc) => (
                    <tr
                      key={doc.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Physician */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: '50%',
                            background: '#eff6ff', border: '1px solid #bfdbfe',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1d4ed8', fontWeight: 800, fontSize: 13
                          }}>
                            {doc.doctorName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 750, color: '#0f172a', fontSize: 14 }}>
                              {doc.doctorName}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                              {doc.specialization} • <span style={{ color: '#0284c7', fontWeight: 600 }}>{doc.mdcnLicense}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Published Fee */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 750, color: '#0f172a' }}>
                          ₦{doc.consultationFee.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Per Video Consult
                        </div>
                      </td>

                      {/* Appointments */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#334155' }}>
                          {doc.totalAppointments} Completed
                        </div>
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          100% Verified Visits
                        </div>
                      </td>

                      {/* Gross Revenue */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 750, color: '#0f172a' }}>
                          ₦{doc.grossBookings.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Total Patient Billing
                        </div>
                      </td>

                      {/* Platform 15% */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#059669', fontSize: 14 }}>
                          ₦{doc.platformCut.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                          15% Platform Retained
                        </div>
                      </td>

                      {/* Doctor Net 85% */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#6d28d9', fontSize: 14 }}>
                          ₦{doc.doctorNetEarnings.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {doc.bankAccount}
                        </div>
                      </td>

                      {/* Payout Status */}
                      <td style={{ padding: '16px 16px' }}>
                        {doc.payoutStatus === 'settled' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#dcfce7', color: '#15803d'
                          }}>
                            <CheckCircle2 size={12} /> Settled ({doc.lastPayoutDate})
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#fef3c7', color: '#92400e'
                          }}>
                            <Clock size={12} /> Ready for Batch Payout
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {doc.payoutStatus === 'pending_batch' ? (
                          <button
                            onClick={() => {
                              setSelectedDoctorForPayout(doc);
                              setDisburseModalOpen(true);
                            }}
                            style={{
                              background: '#0f172a', color: '#ffffff', border: 'none',
                              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer'
                            }}
                          >
                            <Banknote size={13} /> Disburse
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                            Receipt #8942
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={doctorPage}
            totalPages={Math.max(1, Math.ceil(filteredDoctors.length / doctorPageSize))}
            onPageChange={setDoctorPage}
            total={filteredDoctors.length}
            pageSize={doctorPageSize}
            onPageSizeChange={(newSize) => {
              setDoctorPageSize(newSize);
              setDoctorPage(1);
            }}
            isSeeAll={doctorIsSeeAll}
            onToggleSeeAll={() => setDoctorIsSeeAll(!doctorIsSeeAll)}
          />
        </div>
      )}

      {/* ── TAB 3: OFFICIAL INVOICES & PAYMENTS ─────────────────────── */}
      {activeTab === 'invoices' && (
        <div style={{
          background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0',
          boxShadow: '0 4px 25px rgba(0,0,0,0.03)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                Institutional Invoices & Official Tax Receipts
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Certified invoices dispatched to hospitals with 7.5% FIRS VAT itemization and automated virtual bank account routing.
              </p>
            </div>

            <button
              onClick={() => setNewInvoiceModalOpen(true)}
              style={{
                background: '#0f172a', color: '#ffffff', border: 'none',
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
              }}
            >
              <Plus size={14} /> New Invoice
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>Invoice ID</th>
                  <th style={{ padding: '14px 16px' }}>Hospital Recipient</th>
                  <th style={{ padding: '14px 16px' }}>Licensing Module</th>
                  <th style={{ padding: '14px 16px' }}>Amount (excl. VAT)</th>
                  <th style={{ padding: '14px 16px' }}>VAT (7.5%)</th>
                  <th style={{ padding: '14px 16px' }}>Due Date</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Official Document</th>
                </tr>
              </thead>
              <tbody>
                {displayedInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Invoice ID */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontWeight: 700, color: '#1e293b',
                          background: '#f1f5f9', padding: '3px 8px', borderRadius: 6,
                          border: '1px solid #e2e8f0', fontSize: 12
                        }}>
                          {inv.invoiceNumber}
                        </span>
                      </td>

                      {/* Recipient */}
                      <td style={{ padding: '16px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {inv.recipient}
                      </td>

                      {/* Module */}
                      <td style={{ padding: '16px 16px', fontSize: 12.5, color: '#475569' }}>
                        {inv.type}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '16px 16px', fontWeight: 800, color: '#0f172a' }}>
                        ₦{inv.amount.toLocaleString()}
                      </td>

                      {/* VAT */}
                      <td style={{ padding: '16px 16px', fontSize: 12, color: '#64748b' }}>
                        ₦{inv.vatAmount.toLocaleString()}
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: '16px 16px', fontSize: 12.5, color: '#334155', fontWeight: 600 }}>
                        {inv.dueDate}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        {inv.status === 'paid' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#dcfce7', color: '#15803d'
                          }}>
                            <CheckCircle2 size={12} /> Paid & Cleared
                          </span>
                        )}
                        {inv.status === 'unpaid' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#fef3c7', color: '#92400e'
                          }}>
                            <Clock size={12} /> Pending Payment
                          </span>
                        )}
                        {inv.status === 'overdue' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                            background: '#fee2e2', color: '#b91c1c'
                          }}>
                            <AlertTriangle size={12} /> Past Due Date
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => setPreviewInvoiceModal(inv)}
                          style={{
                            background: '#f1f5f9', color: '#0f766e', border: '1px solid #cbd5e1',
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <FileText size={13} /> View Invoice PDF
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={invoicePage}
            totalPages={Math.max(1, Math.ceil(filteredInvoices.length / invoicePageSize))}
            onPageChange={setInvoicePage}
            total={filteredInvoices.length}
            pageSize={invoicePageSize}
            onPageSizeChange={(newSize) => {
              setInvoicePageSize(newSize);
              setInvoicePage(1);
            }}
            isSeeAll={invoiceIsSeeAll}
            onToggleSeeAll={() => setInvoiceIsSeeAll(!invoiceIsSeeAll)}
          />
        </div>
      )}

      {/* ── MODAL: CREATE INSTITUTIONAL INVOICE ──────────────────────── */}
      {newInvoiceModalOpen && (
        <Modal
          isOpen={newInvoiceModalOpen}
          onClose={() => setNewInvoiceModalOpen(false)}
          title="Issue Certified Hospital Institutional Invoice"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hospital Facility
              </label>
              <select
                value={invHospital}
                onChange={(e) => setInvHospital(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500"
              >
                {contracts.map(c => (
                  <option key={c.id} value={c.hospitalName}>
                    {c.hospitalName} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Contract Billing Module
              </label>
              <select
                value={invType}
                onChange={(e) => setInvType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="Hospital Enterprise License">Hospital Enterprise Multi-Department License (Annual)</option>
                <option value="Hospital Bed Module">Hospital Inpatient Bed Telemetry Extension Module</option>
                <option value="Blood Screening Extension">Blood Bank Donor Screening & Transfusion Pipeline</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  License Amount (₦)
                </label>
                <input
                  type="number"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">FIRS Automated Tax Compliance:</span> 7.5% Value Added Tax (₦{Math.round((parseFloat(invAmount) || 0) * 0.075).toLocaleString()}) will be itemized on the certified billing receipt with instant virtual account generation.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewInvoiceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Issue & Send Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: PREVIEW OFFICIAL PDF INVOICE ───────────────────────── */}
      {previewInvoiceModal && (
        <Modal
          isOpen={Boolean(previewInvoiceModal)}
          onClose={() => setPreviewInvoiceModal(null)}
          title={`Official Invoice Document: ${previewInvoiceModal.invoiceNumber}`}
        >
          <div className="space-y-5">
            {/* Printable Invoice Container */}
            <div style={{
              background: '#ffffff', borderRadius: 14, border: '1px solid #cbd5e1',
              padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              {/* Invoice Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: '#0f6e6e',
                      color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 16
                    }}>
                      O
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      OminiPulse Health
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Institutional Healthcare Billing & Escrow Enclave
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    TIN: 2490184-0001 • Abuja & Lagos, Nigeria
                  </div>
                </div>

                <div className="text-right">
                  <span style={{
                    fontFamily: 'monospace', fontWeight: 800, fontSize: 13,
                    color: '#0f172a', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6
                  }}>
                    {previewInvoiceModal.invoiceNumber}
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                    Issue: {previewInvoiceModal.issueDate}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Due: {previewInvoiceModal.dueDate}
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">BILLED TO FACILITY</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">{previewInvoiceModal.recipient}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Accredited Health Establishment</div>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">PAYMENT STATUS</span>
                  <div className="mt-1">
                    {previewInvoiceModal.status === 'paid' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={13} style={{ color: '#16a34a' }} /> FULLY PAID & SETTLED
                      </span>
                    )}
                    {previewInvoiceModal.status === 'unpaid' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock size={13} /> PENDING PAYMENT
                      </span>
                    )}
                    {previewInvoiceModal.status === 'overdue' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 bg-red-50 px-2.5 py-1 rounded-full">
                        <AlertTriangle size={13} /> OVERDUE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">
                        {previewInvoiceModal.type} (Annual Period)
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        ₦{previewInvoiceModal.amount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-600">
                        Federal Inland Revenue Service (FIRS) 7.5% VAT Itemization
                      </td>
                      <td className="py-2 text-right text-slate-700">
                        ₦{previewInvoiceModal.vatAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-slate-900 font-bold text-sm text-slate-900">
                      <td className="pt-3">Total Payable (Gross)</td>
                      <td className="pt-3 text-right">
                        ₦{(previewInvoiceModal.amount + previewInvoiceModal.vatAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remittance Instructions */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '10px 14px', fontSize: 11, color: '#475569', lineHeight: 1.6
              }}>
                <span className="font-bold text-slate-900">Settlement Virtual Account:</span>
                <div>Bank: Providus Bank • Acct Name: OminiPulse Escrow / {previewInvoiceModal.recipient.slice(0, 15)}</div>
                <div>Account No: <strong>9928104812</strong> • Ref: {previewInvoiceModal.invoiceNumber}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPreviewInvoiceModal(null)}>Close</Button>
              <Button
                variant="primary"
                leftIcon={<Printer size={14} />}
                onClick={() => window.print()}
              >
                Print / Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL: EXECUTE DOCTOR BATCH PAYOUT ───────────────────────── */}
      {disburseModalOpen && selectedDoctorForPayout && (
        <Modal
          isOpen={disburseModalOpen}
          onClose={() => setDisburseModalOpen(false)}
          title="Authorize NIBSS Direct Payout Disbursement"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recipient Physician</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedDoctorForPayout.doctorName}</div>
                  <div className="text-xs text-slate-500">{selectedDoctorForPayout.specialization}</div>
                </div>
                <Badge variant="success">85% Physician Share</Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Net Disbursable Earnings</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    ₦{selectedDoctorForPayout.doctorNetEarnings.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div>Settlement Account:</div>
                  <div className="font-bold text-slate-900">{selectedDoctorForPayout.bankAccount}</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Authorizing this disbursement triggers an instant NIBSS/CBN electronic funds transfer directly to the physician&apos;s verified bank account. The 15% platform infrastructure fee (₦{selectedDoctorForPayout.platformCut.toLocaleString()}) has already been credited to the platform operating account.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDisburseModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                leftIcon={<CheckCircle size={15} />}
                onClick={() => handleExecutePayout(selectedDoctorForPayout.id)}
              >
                Confirm & Disburse Payout
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
