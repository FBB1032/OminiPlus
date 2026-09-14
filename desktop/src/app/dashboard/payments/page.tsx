'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Search, Download, Eye, CheckCircle, XCircle,
  AlertTriangle, Clock, ArrowUpRight, ArrowDownLeft, ShieldCheck,
  Building2, Stethoscope, RefreshCcw, DollarSign, Wallet, RefreshCw
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { liveApi, getApiErrorMessage } from '@/services/api';
import type { PaymentTransaction, PaymentStatus } from '@/types';

export default function PaymentsPage() {
  // Live escrow ledger (https://ominipulse.onrender.com/api/admin/payments)
  // — no fallback; failures render an explicit error state.
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isSeeAll, setIsSeeAll] = useState(false);

  // Dialog actions state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    txId: string;
    action: 'release_escrow' | 'refund';
    reference: string;
    amount: number;
    doctorName: string;
  } | null>(null);

  // Load the live payments ledger. Errors surface as an explicit error state.
  const loadPayments = useCallback(async () => {
    try {
      const live = await liveApi.getPayments();
      setTransactions(live);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  // Filter & Search Logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      tx.patientName.toLowerCase().includes(search.toLowerCase()) ||
      tx.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      tx.appointmentId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedTransactions = isSeeAll
    ? filteredTransactions
    : filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  // KPI calculations
  const totalVolume = transactions.reduce((acc, tx) => acc + (tx.status !== 'refunded' ? tx.amount : 0), 0);
  const escrowHeld = transactions
    .filter((tx) => tx.status === 'escrowed')
    .reduce((acc, tx) => acc + tx.amount, 0);
  const doctorPayouts = transactions
    .filter((tx) => tx.status === 'completed')
    .reduce((acc, tx) => acc + tx.doctorPayout, 0);
  const platformRevenue = transactions
    .filter((tx) => tx.status === 'completed')
    .reduce((acc, tx) => acc + tx.platformFee, 0);

  const handleConfirmAction = () => {
    if (!actionDialog) return;
    const { txId, action } = actionDialog;

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== txId) return tx;
        if (action === 'release_escrow') {
          return {
            ...tx,
            status: 'completed',
            escrowReleased: true,
            escrowReleasedAt: new Date().toISOString(),
          };
        }
        if (action === 'refund') {
          return {
            ...tx,
            status: 'refunded',
            escrowReleased: false,
            refundReason: 'Administrative manual refund issued.',
            refundedAt: new Date().toISOString(),
          };
        }
        return tx;
      })
    );

    setActionDialog(null);
  };

  const handleExportCSV = () => {
    const headers = 'Reference,Date,Patient,Doctor,Service,Gross Amount (NGN),Platform Fee (NGN),Doctor Payout (NGN),Status,Method,Escrow Released\n';
    const rows = filteredTransactions.map(t =>
      `"${t.reference}","${t.createdAt}","${t.patientName}","${t.doctorName}","${t.serviceType}",${t.amount},${t.platformFee},${t.doctorPayout},"${t.status}","${t.method}","${t.escrowReleased ? 'Yes' : 'No'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ominipulse_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (val: number) => {
    return `₦${val.toLocaleString()}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#ecfdf5', color: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Payments & Escrow
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                Consultation fee escrow management, clinician disbursements, and audit logs
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download size={15} style={{ marginRight: 6 }} />
          Export Financial Ledger
        </Button>
      </div>

      {/* Live data connection state */}
      {isLoading && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af',
          borderRadius: 10, padding: '14px 16px', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <RefreshCw size={15} className="animate-spin" />
          Loading the escrow ledger from the live database…
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
              Failed to load payments from the live database
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#dc2626' }}>
              {loadError} — check your connection and role, then retry.
            </p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={12} />} onClick={() => { setIsLoading(true); void loadPayments(); }}>
            Retry
          </Button>
        </div>
      )}

      {/* ── KPI Financial Metrics ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Processed Volume</span>
            <DollarSign size={18} style={{ color: '#2563eb' }} />
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 0' }}>{formatCurrency(totalVolume)}</p>
          <span style={{ fontSize: 11.5, color: '#10b981', fontWeight: 500 }}>Total gross patient charges</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Escrow Balance</span>
            <Clock size={18} style={{ color: '#d97706' }} />
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#d97706', margin: '8px 0 0' }}>{formatCurrency(escrowHeld)}</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Held until consultation concluded</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Doctor Payouts</span>
            <ArrowUpRight size={18} style={{ color: '#059669' }} />
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#059669', margin: '8px 0 0' }}>{formatCurrency(doctorPayouts)}</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Disbursed (85% net rate)</span>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Platform Revenue</span>
            <Wallet size={18} style={{ color: '#7c3aed' }} />
          </div>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#7c3aed', margin: '8px 0 0' }}>{formatCurrency(platformRevenue)}</p>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Earned fee share (15%)</span>
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
              placeholder="Search reference, patient, doctor, or appointment ID..."
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
            {(['all', 'escrowed', 'completed', 'refunded'] as const).map((tab) => (
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
                {tab === 'escrowed' ? 'In Escrow' : tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Payments Ledger Table ───────────────────────────────────────────── */}
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Transaction Ref</th>
                <th style={{ padding: '12px 16px' }}>Patient & Doctor</th>
                <th style={{ padding: '12px 16px' }}>Gross Amount</th>
                <th style={{ padding: '12px 16px' }}>Doctor Payout</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 120ms' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Reference & Date */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {tx.reference}
                      </p>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.method.toUpperCase()}
                      </span>
                    </td>

                    {/* Patient & Doctor */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
                        {tx.patientName}
                      </p>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>
                        → {tx.doctorName}
                      </span>
                    </td>

                    {/* Gross Amount */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(tx.amount)}
                      </p>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Platform Fee: {formatCurrency(tx.platformFee)}
                      </span>
                    </td>

                    {/* Doctor Payout */}
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#059669' }}>
                        {formatCurrency(tx.doctorPayout)}
                      </p>
                      <span style={{ fontSize: 11, color: tx.escrowReleased ? '#10b981' : '#d97706' }}>
                        {tx.escrowReleased ? 'Released' : 'In Escrow'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px' }}>
                      {tx.status === 'escrowed' && (
                        <Badge variant="warning">Held in Escrow</Badge>
                      )}
                      {tx.status === 'completed' && (
                        <Badge variant="success">Completed</Badge>
                      )}
                      {tx.status === 'refunded' && (
                        <Badge variant="error">Refunded</Badge>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          title="View Ledger Details"
                        >
                          <Eye size={15} style={{ marginRight: 4 }} />
                          Details
                        </Button>

                        {tx.status === 'escrowed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setActionDialog({
                              open: true,
                              txId: tx.id,
                              action: 'release_escrow',
                              reference: tx.reference,
                              amount: tx.doctorPayout,
                              doctorName: tx.doctorName,
                            })}
                          >
                            Release
                          </Button>
                        )}

                        {tx.status === 'escrowed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActionDialog({
                              open: true,
                              txId: tx.id,
                              action: 'refund',
                              reference: tx.reference,
                              amount: tx.amount,
                              doctorName: tx.doctorName,
                            })}
                          >
                            Refund
                          </Button>
                        )}
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
          totalPages={Math.ceil(filteredTransactions.length / pageSize)}
          onPageChange={setPage}
          total={filteredTransactions.length}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
          isSeeAll={isSeeAll}
          onToggleSeeAll={() => setIsSeeAll(!isSeeAll)}
        />
      </Card>

      {/* ── Transaction Detail Modal ────────────────────────────────────────── */}
      {selectedTx && (
        <Modal
          isOpen={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title="Payment & Escrow Transaction Record"
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Identity */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0'
            }}>
              <div>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>TRANSACTION REFERENCE</span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                  {selectedTx.reference}
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  Initiated on {new Date(selectedTx.createdAt).toLocaleString()}
                </span>
              </div>
              <Badge variant={selectedTx.status === 'completed' ? 'success' : selectedTx.status === 'escrowed' ? 'warning' : 'error'}>
                {selectedTx.status.toUpperCase()}
              </Badge>
            </div>

            {/* Financial Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>GROSS CHARGED</span>
                <p style={{ margin: '6px 0 0', fontSize: 17, color: '#0f172a', fontWeight: 700 }}>
                  {formatCurrency(selectedTx.amount)}
                </p>
                <span style={{ fontSize: 11, color: '#64748b' }}>Paid via {selectedTx.method}</span>
              </div>

              <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>PLATFORM FEE (15%)</span>
                <p style={{ margin: '6px 0 0', fontSize: 17, color: '#7c3aed', fontWeight: 700 }}>
                  {formatCurrency(selectedTx.platformFee)}
                </p>
                <span style={{ fontSize: 11, color: '#64748b' }}>Platform commission</span>
              </div>

              <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>DOCTOR SHARE (85%)</span>
                <p style={{ margin: '6px 0 0', fontSize: 17, color: '#059669', fontWeight: 700 }}>
                  {formatCurrency(selectedTx.doctorPayout)}
                </p>
                <span style={{ fontSize: 11, color: selectedTx.escrowReleased ? '#10b981' : '#d97706' }}>
                  {selectedTx.escrowReleased ? 'Disbursed to bank' : 'Held in escrow'}
                </span>
              </div>
            </div>

            {/* Participants */}
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>SESSION DETAILS</span>
              <p style={{ margin: '6px 0 2px', fontSize: 13, color: '#0f172a' }}>
                <strong>Patient:</strong> {selectedTx.patientName} (ID: {selectedTx.patientId})
              </p>
              <p style={{ margin: '2px 0 2px', fontSize: 13, color: '#0f172a' }}>
                <strong>Clinician:</strong> {selectedTx.doctorName} (ID: {selectedTx.doctorId})
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#0f172a' }}>
                <strong>Consultation:</strong> {selectedTx.serviceType} (Ref: {selectedTx.appointmentId})
              </p>
            </div>

            {/* Escrow Rule Note */}
            <div style={{
              padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #dcfce7',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12.5, color: '#15803d', fontWeight: 600 }}>
                  Automated Escrow Protection
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#166534' }}>
                  Funds are secured in escrow until the telehealth consultation concludes successfully, protecting patients and clinicians against cancellations.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <Button variant="outline" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirmation Dialog for Release / Refund ───────────────────────── */}
      {actionDialog && (
        <ConfirmDialog
          isOpen={actionDialog.open}
          onClose={() => setActionDialog(null)}
          onConfirm={handleConfirmAction}
          title={actionDialog.action === 'release_escrow' ? 'Release Escrow to Clinician' : 'Issue Full Patient Refund'}
          message={
            actionDialog.action === 'release_escrow'
              ? `Are you sure you want to release the escrow payment of ${formatCurrency(actionDialog.amount)} to ${actionDialog.doctorName}? This confirms the consultation concluded successfully.`
              : `Are you sure you want to issue a full refund of ${formatCurrency(actionDialog.amount)} to the patient for transaction ${actionDialog.reference}?`
          }
          confirmLabel={actionDialog.action === 'release_escrow' ? 'Release Payment' : 'Issue Refund'}
          variant={actionDialog.action === 'release_escrow' ? 'primary' : 'danger'}
        />
      )}
    </div>
  );
}
