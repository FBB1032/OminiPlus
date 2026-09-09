'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Stethoscope, Building2, Pill, Calendar, Bot, Users, Activity,
  TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle,
  ArrowRight, Eye, Zap, Shield, BarChart3, Globe, Star, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS, NAV_SECTIONS } from '@/store/permissionStore';
import { liveApi } from '@/services/api';
import { timeAgo } from '@/lib/utils';
import type { AdminRole, DashboardStats } from '@/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CHART_DATA = [
  { day: 'Mon', booked: 420, completed: 380 },
  { day: 'Tue', booked: 490, completed: 440 },
  { day: 'Wed', booked: 530, completed: 500 },
  { day: 'Thu', booked: 720, completed: 660 },
  { day: 'Fri', booked: 650, completed: 590 },
  { day: 'Sat', booked: 380, completed: 350 },
  { day: 'Sun', booked: 280, completed: 260 },
];

const PIE_DATA = [
  { name: 'Video Consult', value: 45, color: '#2563eb' },
  { name: 'In-Person', value: 35, color: '#06b6d4' },
  { name: 'Phone', value: 20, color: '#a855f7' },
];

const PENDING_DOCTORS = [
  { id: 'd1', name: 'Dr. Amina Bello', specialty: 'Cardiology', hospital: 'Lagos General', docs: '3/3', submitted: '2024-06-04T10:00:00Z' },
  { id: 'd2', name: 'Dr. Felix Okafor', specialty: 'Pediatrics', hospital: 'Victoria Island Hospital', docs: '3/3', submitted: '2024-06-03T14:30:00Z' },
  { id: 'd3', name: 'Dr. Grace Adekunle', specialty: 'Dermatology', hospital: 'Eko Medical Center', docs: '2/3', submitted: '2024-06-03T09:15:00Z' },
];

const RECENT_ACTIVITY = [
  { id: 1, text: 'Dr. Sarah Eke approved by Admin', type: 'success', time: '5 min ago', icon: CheckCircle2 },
  { id: 2, text: 'AI flagged prompt — high severity', type: 'error', time: '12 min ago', icon: AlertTriangle },
  { id: 3, text: 'New hospital onboarding request', type: 'info', time: '25 min ago', icon: Building2 },
  { id: 4, text: 'Dr. Musa Umar verification rejected', type: 'warning', time: '1 hr ago', icon: Shield },
  { id: 5, text: '3 new appointment disputes filed', type: 'warning', time: '2 hr ago', icon: Calendar },
];

const ACTIVITY_STYLES: Record<string, { bg: string; color: string }> = {
  success: { bg: '#f0fdf4', color: '#16a34a' },
  error: { bg: '#fef2f2', color: '#dc2626' },
  info: { bg: '#eff6ff', color: '#2563eb' },
  warning: { bg: '#fffbeb', color: '#d97706' },
};

// Quick Access is now derived dynamically from NAV_SECTIONS based on role permissions.
// See usage inside DashboardPage below.

export default function DashboardPage() {
  const router = useRouter();
  const admin = useAuthStore(s => s.admin);
  const adminRole: AdminRole = (admin?.role as AdminRole) || 'admin';

  // Live platform KPIs from https://ominipulse.onrender.com/api/admin/dashboard
  // (falls back to the demo figures when unreachable / cold-started).
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (adminRole === 'doctor') {
      router.replace('/dashboard/doctor-portal');
    } else if (adminRole === 'admin') {
      router.replace('/dashboard/hospitals');
    } else if (adminRole === 'pharmacist') {
      router.replace('/dashboard/hospital-portal?tab=pharmacy');
    } else if (adminRole === 'lab_technician') {
      router.replace('/dashboard/hospital-portal?tab=laboratory');
    } else if (adminRole === 'nurse') {
      router.replace('/dashboard/hospital-portal?tab=wards');
    } else if (adminRole === 'receptionist') {
      router.replace('/dashboard/hospital-portal?tab=appointments');
    } else if (adminRole === 'blood_officer') {
      router.replace('/dashboard/hospital-portal?tab=blood');
    } else {
      router.replace('/dashboard/hospital-portal');
    }
  }, [router, adminRole]);

  const permissions = ROLE_PERMISSIONS[adminRole] || [];
  const hasPermission = (p: string) => permissions.includes(p as any);

  useEffect(() => {
    let cancelled = false;
    liveApi.getDashboardStats().then((s) => {
      if (!cancelled && s) setStats(s);
    });
    return () => { cancelled = true; };
  }, []);

  const ICON_MAP: Record<string, any> = {
    Stethoscope, Building2, Pill, Calendar, Bot, BarChart3,
    LayoutDashboard: Activity, Bell: Zap, ScrollText: Eye, ShieldCheck: Shield, Settings: Globe,
  };
  const TILE_COLORS: Record<string, { color: string; bg: string }> = {
    dashboard:       { color: '#0f6e6e', bg: '#e6f4f4' },
    'doctor-portal': { color: '#0f6e6e', bg: '#e6f4f4' },
    doctors:         { color: '#2563eb', bg: '#eff6ff' },
    hospitals:       { color: '#0891b2', bg: '#ecfeff' },
    pharmacies:      { color: '#7c3aed', bg: '#faf5ff' },
    appointments:    { color: '#16a34a', bg: '#f0fdf4' },
    'ai-monitoring': { color: '#7c3aed', bg: '#faf5ff' },
    reports:         { color: '#d97706', bg: '#fffbeb' },
    'audit-logs':    { color: '#64748b', bg: '#f8fafc' },
    security:        { color: '#dc2626', bg: '#fef2f2' },
  };

  // Doctors get portal-specific shortcuts instead of admin nav items
  const DOCTOR_QUICK_ACCESS = [
    { label: 'Patient Queue',   href: '/dashboard/doctor-portal?tab=queue',         icon: Users,     color: '#2563eb', bg: '#eff6ff' },
    { label: 'SOAP Notes',      href: '/dashboard/doctor-portal?tab=notes',         icon: FileText,  color: '#0f6e6e', bg: '#f0fdfa' },
    { label: 'Issue E-Rx',      href: '/dashboard/doctor-portal?tab=prescriptions', icon: Pill,      color: '#16a34a', bg: '#f0fdf4' },
    { label: 'AI Differential', href: '/dashboard/doctor-portal?tab=ai',            icon: Bot,       color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'My Schedule',     href: '/dashboard/doctor-portal?tab=schedule',      icon: Calendar,  color: '#ea580c', bg: '#fff7ed' },
    { label: 'Patient Reviews', href: '/dashboard/doctor-portal?tab=reviews',       icon: Star,      color: '#d97706', bg: '#fffbeb' },
  ];

  const quickAccessItems = adminRole === 'doctor'
    ? DOCTOR_QUICK_ACCESS
    : NAV_SECTIONS
        .flatMap(s => s.items)
        .filter(item =>
          hasPermission(item.permission) &&
          !['dashboard', 'notifications', 'settings'].includes(item.key)
        )
        .map(item => ({
          label: item.label,
          href: item.href,
          icon: ICON_MAP[item.icon] || Activity,
          color: TILE_COLORS[item.key]?.color ?? '#374151',
          bg: TILE_COLORS[item.key]?.bg ?? '#f9fafb',
        }));

  const roleLabel = ROLE_LABELS[adminRole];
  const roleColor = ROLE_COLORS[adminRole];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 className="page-title">Dashboard</h1>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
            background: roleColor.bg, color: roleColor.color,
          }}>
            {roleLabel}
          </span>
        </div>
        <p className="page-subtitle">
          Welcome back, {admin?.firstName || 'Admin'}. Here&apos;s your operational overview.
        </p>
      </div>

      {/* ── KPI Stat Cards ───────────────────────────────────────── */}
      {/* Live values from /api/admin/dashboard; demo values while loading/offline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {hasPermission('doctors.view') && (
          <StatCard
            label="Verified Doctors"
            value={stats ? String(stats.activeUsers) : '—'}
            change={stats ? 'live from backend' : 'connecting…'}
            changeType="up"
            icon={<Stethoscope size={18} />}
            accentColor="#2563eb"
          />
        )}
        {hasPermission('doctors.verify') && (
          <StatCard
            label="Pending Approvals"
            value={stats ? String(stats.pendingVerifications) : '—'}
            change={stats ? 'live from backend' : 'connecting…'}
            changeType="warning"
            icon={<Clock size={18} />}
            accentColor="#d97706"
          />
        )}
        {hasPermission('hospitals.view') && (
          <StatCard
            label="Partner Hospitals"
            value={stats ? String(stats.totalHospitals) : '—'}
            change={stats ? 'live from backend' : 'connecting…'}
            changeType="up"
            icon={<Building2 size={18} />}
            accentColor="#0891b2"
          />
        )}
        {hasPermission('appointments.view_overview') && (
          <StatCard
            label="Today's Appointments"
            value={stats ? String(stats.totalAppointments) : '—'}
            change={stats ? 'live from backend' : 'connecting…'}
            changeType="neutral"
            icon={<Calendar size={18} />}
            accentColor="#16a34a"
          />
        )}
        {hasPermission('ai_monitoring.view') && (
          <StatCard
            label="AI Flags"
            value={stats ? String(stats.flaggedAIPrompts) : '—'}
            change={stats ? 'live from backend' : 'connecting…'}
            changeType="warning"
            icon={<AlertTriangle size={18} />}
            accentColor="#ef4444"
          />
        )}
      </div>



      {/* ── Quick Access + Live Banner ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 24 }}>
        {/* Quick Access */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Quick Access</h3>
          {quickAccessItems.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>No shortcuts available for your role.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12 }}>
              {quickAccessItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '16px 12px', borderRadius: 12, background: '#fafafa',
                    border: '1px solid #f3f4f6', textDecoration: 'none',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = item.bg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#fafafa'; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                  }}>
                    <item.icon size={20} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#374151', textAlign: 'center' }}>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Platform Summary */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8e8',
          borderRadius: 14,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>Platform Summary</p>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>Real-time system activity</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Active Consultations', value: '24', color: '#0f6e6e' },
              { label: 'Doctors Online', value: '186', color: '#2563eb' },
              { label: 'Patients in Queue', value: '12', color: '#7c3aed' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13, color: '#64748b' }}>{item.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/appointments"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 18, padding: '10px 0', borderRadius: 10,
              background: '#f1f5f9',
              color: '#334155', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              border: '1px solid #e2e8f0',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            <Calendar size={14} /> View All Appointments
          </Link>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }}>
        {/* Area Chart */}
        <div className="chart-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Appointment Volume</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>This week · daily breakdown</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <ChartLegend color="#2563eb" label="Booked" />
              <ChartLegend color="#06b6d4" label="Completed" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
              />
              <Area type="monotone" dataKey="booked" stroke="#2563eb" strokeWidth={2} fill="url(#colorBooked)" />
              <Area type="monotone" dataKey="completed" stroke="#06b6d4" strokeWidth={2} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-container">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Appt. Types</h3>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, marginBottom: 12 }}>This week</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {PIE_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {PIE_DATA.map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 13, color: '#374151' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Pending Verifications + Recent Activity ───── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        {/* Pending Doctor Verifications */}
        {hasPermission('doctors.verify') && (
          <div className="table-container">
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Pending Verifications</h3>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Doctors awaiting review</p>
              </div>
              <Link href="/dashboard/doctors" className="btn btn-sm btn-secondary" style={{ textDecoration: 'none' }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Hospital</th>
                  <th>Docs</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {PENDING_DOCTORS.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{
                          background: '#eff6ff', color: '#2563eb',
                        }}>
                          {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 500 }}>{doc.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{doc.specialty}</span></td>
                    <td>{doc.hospital}</td>
                    <td>
                      <span style={{
                        fontSize: 12, fontWeight: 500,
                        color: doc.docs === '3/3' ? '#16a34a' : '#d97706',
                      }}>
                        {doc.docs}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{timeAgo(doc.submitted)}</td>
                    <td>
                      <Link href="/dashboard/doctors" className="btn btn-sm btn-primary" style={{ textDecoration: 'none' }}>
                        <Eye size={12} /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Recent Activity</h3>
            <Link href="/dashboard/audit-logs" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          <div>
            {RECENT_ACTIVITY.map((item) => {
              const s = ACTIVITY_STYLES[item.type];
              return (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon" style={{ background: s.bg, color: s.color }}>
                    <item.icon size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{item.text}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, change, changeType, icon, accentColor }: {
  label: string; value: string; change: string;
  changeType: 'up' | 'down' | 'warning' | 'neutral';
  icon: React.ReactNode; accentColor: string;
}) {
  const changeColor = { up: '#16a34a', down: '#dc2626', warning: '#d97706', neutral: '#9ca3af' }[changeType];
  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : null;

  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${accentColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p className="stat-label">{label}</p>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${accentColor}12`, color: accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      <p className="stat-value">{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
        {ChangeIcon && <ChangeIcon size={12} style={{ color: changeColor }} />}
        <span className="stat-change" style={{ color: changeColor }}>{change}</span>
      </div>
    </div>
  );
}

function VitalStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ color, opacity: 0.8 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: '#9ca3af' }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</p>
      </div>
    </div>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
    </div>
  );
}
