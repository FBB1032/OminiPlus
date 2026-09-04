'use client';

import React, { useState } from 'react';
import {
  Building2, Stethoscope, Receipt, DollarSign, CreditCard,
  Download, Plus, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, ArrowUpRight, TrendingUp, Calendar, FileText,
  Check, X, RefreshCw, Send, ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

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
}

const INITIAL_HOSPITAL_CONTRACTS: HospitalContract[] = [
  {
    id: 'CTR-HSP-001',
    hospitalName: 'National Hospital Abuja',
    state: 'FCT Abuja',
    tier: 'Enterprise Multi-Dept',
    annualFee: 2500000,
    contractStartDate: '2026-01-01',
    nextRenewalDate: '2027-01-01',
    status: 'active',
    beds: 250,
    staffSeats: 120,
    contactEmail: 'admin@nationalhospital.gov.ng',
  },
  {
    id: 'CTR-HSP-002',
    hospitalName: 'Lagos University Teaching Hospital (LUTH)',
    state: 'Lagos',
    tier: 'Enterprise Multi-Dept',
    annualFee: 2200000,
    contractStartDate: '2026-02-15',
    nextRenewalDate: '2027-02-15',
    status: 'active',
    beds: 200,
    staffSeats: 90,
    contactEmail: 'accounts@luth.org.ng',
  },
  {
    id: 'CTR-HSP-003',
    hospitalName: 'XYZ Specialist Hospital Kaduna',
    state: 'Kaduna',
    tier: 'Standard Clinic',
    annualFee: 1200000,
    contractStartDate: '2026-01-15',
    nextRenewalDate: '2027-01-15',
    status: 'active',
    beds: 80,
    staffSeats: 45,
    contactEmail: 'i.sani@xyzspecialist.ng',
  },
  {
    id: 'CTR-HSP-004',
    hospitalName: 'Aminu Kano Teaching Hospital',
    state: 'Kano',
    tier: 'Regional Medical Center',
    annualFee: 1800000,
    contractStartDate: '2025-06-01',
    nextRenewalDate: '2026-06-01',
    status: 'overdue',
    beds: 180,
    staffSeats: 70,
    contactEmail: 'billing@akth.gov.ng',
  },
];

interface DoctorCommissionRecord {
  id: string;
  doctorName: string;
  specialization: string;
  consultationFee: number;
  totalAppointments: number;
  grossBookings: number;
  platformCut: number; // 15%
  doctorNetEarnings: number;
  payoutStatus: 'settled' | 'pending_batch';
}

const INITIAL_DOCTOR_COMMISSIONS: DoctorCommissionRecord[] = [
  {
    id: 'DOC-COM-01',
    doctorName: 'Dr. Folake Adeyemi',
    specialization: 'Consultant Physician & Cardiology',
    consultationFee: 20000,
    totalAppointments: 184,
    grossBookings: 3680000,
    platformCut: 552000,
    doctorNetEarnings: 3128000,
    payoutStatus: 'settled',
  },
  {
    id: 'DOC-COM-02',
    doctorName: 'Dr. Ahmed Bello',
    specialization: 'Cardiology Specialist',
    consultationFee: 25000,
    totalAppointments: 142,
    grossBookings: 3550000,
    platformCut: 532500,
    doctorNetEarnings: 3017500,
    payoutStatus: 'settled',
  },
  {
    id: 'DOC-COM-03',
    doctorName: 'Dr. Sarah Danladi',
    specialization: 'Pediatrics & Neonatology',
    consultationFee: 15000,
    totalAppointments: 210,
    grossBookings: 3150000,
    platformCut: 472500,
    doctorNetEarnings: 2677500,
    payoutStatus: 'pending_batch',
  },
  {
    id: 'DOC-COM-04',
    doctorName: 'Dr. Emeka Eze',
    specialization: 'General Practice & Family Medicine',
    consultationFee: 10000,
    totalAppointments: 295,
    grossBookings: 2950000,
    platformCut: 442500,
    doctorNetEarnings: 2507500,
    payoutStatus: 'settled',
  },
];

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  recipient: string;
  type: 'Hospital Enterprise License' | 'Hospital Bed Module' | 'Blood Screening Extension';
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'OMP-INV-2026-084',
    recipient: 'National Hospital Abuja',
    type: 'Hospital Enterprise License',
    amount: 2500000,
    issueDate: '2026-01-02',
    dueDate: '2026-02-02',
    status: 'paid',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'OMP-INV-2026-092',
    recipient: 'XYZ Specialist Hospital Kaduna',
    type: 'Hospital Enterprise License',
    amount: 1200000,
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'paid',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'OMP-INV-2026-105',
    recipient: 'Lagos University Teaching Hospital',
    type: 'Hospital Enterprise License',
    amount: 2200000,
    issueDate: '2026-02-15',
    dueDate: '2026-03-15',
    status: 'paid',
  },
  {
    id: 'INV-004',
    invoiceNumber: 'OMP-INV-2026-118',
    recipient: 'Aminu Kano Teaching Hospital',
    type: 'Hospital Enterprise License',
    amount: 1800000,
    issueDate: '2026-05-15',
    dueDate: '2026-06-01',
    status: 'overdue',
  },
];

export default function PlatformBillingManagementPage() {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors' | 'invoices'>('hospitals');
  const [contracts, setContracts] = useState<HospitalContract[]>(INITIAL_HOSPITAL_CONTRACTS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [previewInvoiceModal, setPreviewInvoiceModal] = useState<InvoiceRecord | null>(null);

  // New Invoice Form state
  const [invHospital, setInvHospital] = useState(contracts[0]?.hospitalName || '');
  const [invType, setInvType] = useState<'Hospital Enterprise License' | 'Hospital Bed Module' | 'Blood Screening Extension'>('Hospital Enterprise License');
  const [invAmount, setInvAmount] = useState('1500000');
  const [invDueDate, setInvDueDate] = useState('2026-07-31');

  // Stats
  const totalHospitalARR = contracts.reduce((acc, c) => acc + (c.status === 'active' ? c.annualFee : 0), 0);
  const totalDoctorGross = INITIAL_DOCTOR_COMMISSIONS.reduce((acc, d) => acc + d.grossBookings, 0);
  const totalPlatformCommissions = INITIAL_DOCTOR_COMMISSIONS.reduce((acc, d) => acc + d.platformCut, 0);
  const totalOverdue = contracts.filter(c => c.status === 'overdue').reduce((acc, c) => acc + c.annualFee, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `OMP-INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      recipient: invHospital,
      type: invType,
      amount: parseFloat(invAmount) || 0,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invDueDate,
      status: 'unpaid',
    };
    setInvoices([newInv, ...invoices]);
    setNewInvoiceModalOpen(false);
  };

  const handleMarkContractPaid = (contractId: string) => {
    setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'active' } : c));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-blue-600" />
            Institutional & Doctor Billing Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Oversee hospital institutional licensing contracts, doctor consultation commissions (15% platform split), and automated payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setNewInvoiceModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
          >
            <Plus className="w-4 h-4" /> Create Institutional Invoice
          </Button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital ARR</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            ₦{totalHospitalARR.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
            {contracts.filter(c => c.status === 'active').length} Active Hospital Contracts
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Commission (15%)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            ₦{totalPlatformCommissions.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
            From ₦{totalDoctorGross.toLocaleString()} doctor bookings
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Net Disbursed</span>
            <Stethoscope className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-700">
            ₦{(totalDoctorGross - totalPlatformCommissions).toLocaleString()}
          </div>
          <span className="text-xs text-purple-600 font-semibold mt-1 inline-block">
            85% paid directly to physicians
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue Receivables</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            ₦{totalOverdue.toLocaleString()}
          </div>
          <span className="text-xs text-amber-600 font-medium mt-1 inline-block">
            1 facility pending contract renewal
          </span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'hospitals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Hospital Institutional Contracts ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'doctors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Doctor Consultation Commission (15% Cut)
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Issued Invoices & Payments ({invoices.length})
        </button>
      </div>

      {/* ── TAB 1: HOSPITAL INSTITUTIONAL CONTRACTS ───────────────────── */}
      {activeTab === 'hospitals' && (
        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hospital Licensing Contracts</h3>
              <p className="text-xs text-slate-500">
                Institutional pricing is undisclosed to the public and customized per facility capacity.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospital name or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Facility Name</th>
                  <th className="px-4 py-3">Contract Tier</th>
                  <th className="px-4 py-3">Beds / Staff Seats</th>
                  <th className="px-4 py-3">Annual License Fee</th>
                  <th className="px-4 py-3">Renewal Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts
                  .filter(c => c.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) || c.state.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{contract.hospitalName}</div>
                        <div className="text-xs text-slate-400 font-normal">{contract.state} • {contract.contactEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{contract.tier}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        <strong>{contract.beds}</strong> Beds • <strong>{contract.staffSeats}</strong> Staff Seats
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₦{contract.annualFee.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ yr</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {contract.nextRenewalDate}
                      </td>
                      <td className="px-4 py-3">
                        {contract.status === 'active' && (
                          <Badge variant="success">Active (Paid)</Badge>
                        )}
                        {contract.status === 'pending_invoice' && (
                          <Badge variant="info">Invoice Sent</Badge>
                        )}
                        {contract.status === 'overdue' && (
                          <Badge variant="error">Renewal Overdue</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {contract.status === 'overdue' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkContractPaid(contract.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3 h-3 mr-1" /> Record Bank Payment
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setInvHospital(contract.hospitalName);
                            setInvAmount(contract.annualFee.toString());
                            setNewInvoiceModalOpen(true);
                          }}
                          className="text-xs"
                        >
                          <Send className="w-3 h-3 mr-1" /> Re-Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 2: DOCTOR COMMISSION REVENUE ──────────────────────────── */}
      {activeTab === 'doctors' && (
        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Doctor Consultation Revenue & Platform 15% Share</h3>
              <p className="text-xs text-slate-500">
                Doctors set their own consultation fee. OminiPulse automatically deducts a 15% platform infrastructure fee per completed booking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                Fixed 15% Platform Split
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Physician</th>
                  <th className="px-4 py-3">Doctor Published Fee</th>
                  <th className="px-4 py-3">Consultations</th>
                  <th className="px-4 py-3">Gross Processed</th>
                  <th className="px-4 py-3 text-emerald-700">OminiPulse 15% Cut</th>
                  <th className="px-4 py-3 text-purple-700">Doctor Net (85%)</th>
                  <th className="px-4 py-3">Disbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_DOCTOR_COMMISSIONS.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{doc.doctorName}</div>
                      <div className="text-xs text-slate-400 font-normal">{doc.specialization}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      ₦{doc.consultationFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {doc.totalAppointments} visits
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ₦{doc.grossBookings.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-emerald-600">
                      ₦{doc.platformCut.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-purple-700">
                      ₦{doc.doctorNetEarnings.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {doc.payoutStatus === 'settled' ? (
                        <Badge variant="success">Settled to Bank</Badge>
                      ) : (
                        <Badge variant="warning">Batch Processing</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── TAB 3: INVOICES & PAYMENTS ─────────────────────────────────── */}
      {activeTab === 'invoices' && (
        <Card className="overflow-hidden border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Institutional Invoices & Receipts</h3>
              <p className="text-xs text-slate-500">Official billing records issued to accredited hospital facilities.</p>
            </div>
            <Button
              size="sm"
              onClick={() => setNewInvoiceModalOpen(true)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Invoice
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Hospital Recipient</th>
                  <th className="px-4 py-3">Contract Module</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {inv.recipient}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {inv.type}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₦{inv.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {inv.issueDate}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {inv.dueDate}
                    </td>
                    <td className="px-4 py-3">
                      {inv.status === 'paid' && <Badge variant="success">Paid</Badge>}
                      {inv.status === 'unpaid' && <Badge variant="warning">Pending</Badge>}
                      {inv.status === 'overdue' && <Badge variant="error">Overdue</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewInvoiceModal(inv)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Institutional Invoice Modal */}
      {newInvoiceModalOpen && (
        <Modal
          isOpen={newInvoiceModalOpen}
          onClose={() => setNewInvoiceModalOpen(false)}
          title="Create Institutional Hospital Invoice"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hospital Facility
              </label>
              <select
                value={invHospital}
                onChange={(e) => setInvHospital(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="Hospital Enterprise License">Hospital Enterprise License (Annual)</option>
                <option value="Hospital Bed Module">Hospital Inpatient Bed Expansion Module</option>
                <option value="Blood Screening Extension">Blood Bank Donor Pipeline Extension</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Invoice Amount (₦)
              </label>
              <input
                type="number"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
              />
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Issue & Send Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Official Invoice Modal */}
      {previewInvoiceModal && (
        <Modal
          isOpen={Boolean(previewInvoiceModal)}
          onClose={() => setPreviewInvoiceModal(null)}
          title={`Official Institutional Invoice: ${previewInvoiceModal.invoiceNumber}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Billed To Facility</span>
                  <div className="text-base font-bold text-slate-900">{previewInvoiceModal.recipient}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{previewInvoiceModal.type}</div>
                </div>
                <div>
                  {previewInvoiceModal.status === 'paid' && <Badge variant="success">PAID</Badge>}
                  {previewInvoiceModal.status === 'unpaid' && <Badge variant="warning">PENDING PAYMENT</Badge>}
                  {previewInvoiceModal.status === 'overdue' && <Badge variant="error">OVERDUE</Badge>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-500">Issue: {previewInvoiceModal.issueDate} • Due: {previewInvoiceModal.dueDate}</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    ₦{previewInvoiceModal.amount.toLocaleString()}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Verified FIRS Tax ID #OMP-9481</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This official invoice is generated by OminiPulse Institutional Healthcare Billing Escrow. Payments are settled automatically into the facility settlement account via dedicated virtual account transfer.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setPreviewInvoiceModal(null)}>Close</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.print()}
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
