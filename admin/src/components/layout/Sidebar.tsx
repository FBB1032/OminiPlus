'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Stethoscope, Building2, Pill, Calendar, Droplet,
  Bot, Bell, BarChart3, ScrollText, ShieldCheck, Settings,
  ChevronLeft, LogOut, Smartphone, Users, FileText, FlaskConical, Star, Award, Lock, Video
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from '@/store/permissionStore';
import type { AdminRole, Permission } from '@/types';
import type { LucideIcon } from 'lucide-react';

// ─── Icon Registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Stethoscope, Building2, Pill, Calendar, Droplet,
  Bot, Bell, BarChart3, ScrollText, ShieldCheck, Settings, Smartphone,
  Users, FileText, FlaskConical, Star, Award, Lock, Video
};

// ─── Nav definition (permission-gated) ────────────────────────────────────────
const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; icon: string; permission: Permission; badge?: string }[];
}[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', permission: 'dashboard.view' },
    ],
  },
  {
    label: 'Doctor Workspace',
    items: [
      { href: '/dashboard/doctor-portal?tab=queue', label: 'Consultations Queue', icon: 'Users', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=notes', label: 'SOAP Clinical Notes', icon: 'FileText', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=prescriptions', label: 'Digital E-Prescriptions', icon: 'Pill', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=blood', label: 'Blood Donor Network (App)', icon: 'Droplet', permission: 'doctor_portal.view', badge: 'App Only' },
      { href: '/dashboard/doctor-portal?tab=ai', label: 'AI Symptom Assistant', icon: 'Bot', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=schedule', label: 'Weekly Availability', icon: 'Calendar', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=reviews', label: 'Ratings & Feedbacks', icon: 'Star', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=profile', label: 'Credentials & Bio', icon: 'Award', permission: 'doctor_portal.view' },
      { href: '/dashboard/doctor-portal?tab=app-locked', label: 'Live HD Telehealth (App)', icon: 'Lock', permission: 'doctor_portal.view', badge: 'App Only' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/doctors', label: 'Doctors', icon: 'Stethoscope', permission: 'doctors.view' },
      { href: '/dashboard/hospitals', label: 'Hospitals', icon: 'Building2', permission: 'hospitals.view' },
      { href: '/dashboard/pharmacies', label: 'Pharmacies', icon: 'Pill', permission: 'pharmacies.view' },
      { href: '/dashboard/blood-donors', label: 'Blood Donors', icon: 'Droplet', permission: 'blood_donors.view' },
      { href: '/dashboard/appointments', label: 'Appointments', icon: 'Calendar', permission: 'appointments.view_overview' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/dashboard/ai-monitoring', label: 'AI Monitoring', icon: 'Bot', permission: 'ai_monitoring.view' },
      { href: '/dashboard/reports', label: 'Reports', icon: 'BarChart3', permission: 'reports.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: 'ScrollText', permission: 'audit_logs.view' },
      { href: '/dashboard/security', label: 'Security', icon: 'ShieldCheck', permission: 'security.view' },
    ],
  },
];

function SidebarAppDownload({ collapsed }: { collapsed: boolean }) {
  const handlePlayStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://play.google.com/store/apps', '_blank');
  };

  const handleAppStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('https://apps.apple.com/app', '_blank');
  };

  if (collapsed) {
    return (
      <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid #1e293b' }}>
        <button
          type="button"
          onClick={handlePlayStore}
          title="Download OmniPulse Doctor App (Google Play & App Store)"
          style={{
            width: 34, height: 34, borderRadius: 8, background: '#1e293b',
            border: '1px solid #334155', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#38bdf8', cursor: 'pointer'
          }}
        >
          <Smartphone size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      margin: '8px 8px 10px', padding: '12px 10px', borderRadius: 12,
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0
        }}>
          <Smartphone size={14} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>Get OmniPulse App</p>
          <span style={{ fontSize: 9.5, color: '#94a3b8' }}>Doctor Mobile Edition</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
        {/* Google Play */}
        <button
          type="button"
          onClick={handlePlayStore}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#000000', color: '#ffffff', border: '1px solid #334155',
            borderRadius: 7, padding: '6px 10px', cursor: 'pointer',
            textAlign: 'left', width: '100%', transition: 'background 120ms'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0f172a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#000000'; }}
        >
          <svg width="14" height="15" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M47.2 24.2C44.4 27.1 42.8 31.7 42.8 37.7V474.3C42.8 480.3 44.4 484.9 47.2 487.8L48.6 489.1L285.8 252V246L48.6 8.8L47.2 24.2Z" fill="#00D2FF"/>
            <path d="M365 331.2L285.8 252V246L365 166.8L366.5 167.7L460.3 221C487.1 236.2 487.1 261.8 460.3 277L366.5 330.3L365 331.2Z" fill="#FFC900"/>
            <path d="M366.5 330.3L285.8 249L47.2 487.8C56 497.1 70.3 498.3 86.6 489.1L366.5 330.3Z" fill="#FF3333"/>
            <path d="M366.5 167.7L86.6 8.9C70.3-0.3 56 0.9 47.2 10.2L285.8 249L366.5 167.7Z" fill="#00E676"/>
          </svg>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', display: 'block', lineHeight: 1 }}>GET IT ON</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>Google Play</span>
          </div>
        </button>

        {/* Apple App Store */}
        <button
          type="button"
          onClick={handleAppStore}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#000000', color: '#ffffff', border: '1px solid #334155',
            borderRadius: 7, padding: '6px 10px', cursor: 'pointer',
            textAlign: 'left', width: '100%', transition: 'background 120ms'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0f172a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#000000'; }}
        >
          <svg width="14" height="15" viewBox="0 0 384 512" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 31.9 112.5c15.4 22.3 35.3 47.7 59.9 47 23.7-.7 33.2-15 61.6-15 28.1 0 36.7 15 61.1 14.3 25-.7 42.1-22.7 57.3-45 17.6-25.5 24.8-50.2 25.1-51.5-.6-.5-48.4-18.6-48.7-67.1zM289.4 86.8c16.3-19.8 27.6-47.4 24.3-75.1-23.7 1-52.6 15.8-69.4 35.5-14.8 17.1-27.9 45.3-24.3 72.3 26.3 2 53.1-13 69.4-32.7z"/>
          </svg>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', display: 'block', lineHeight: 1 }}>Download on the</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>App Store</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'queue';
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { admin, logout } = useAuthStore();

  const adminRole = admin?.role || 'admin';
  const permissions = ROLE_PERMISSIONS[adminRole] || [];

  const isActive = (href: string) => {
    if (href.startsWith('/dashboard/doctor-portal')) {
      if (!pathname.startsWith('/dashboard/doctor-portal')) return false;
      const targetTab = href.split('tab=')[1] || 'queue';
      return currentTab === targetTab;
    }
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  };

  const collapsed = isSidebarCollapsed;

  // Filter nav groups based on admin permissions
  const filteredGroups = NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => permissions.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const roleLabel = ROLE_LABELS[adminRole] || adminRole;
  const roleColor = ROLE_COLORS[adminRole] || { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 49, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
          background: '#0f172a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1), transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobileSidebarOpen ? 'translateX(0)' : undefined,
        }}
        className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand header */}
        <div style={{
          height: 76,
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0' : '0 8px 0 12px',
          gap: 4,
          flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden', flex: 1 }}>
            <div style={{
              height: 54,
              width: collapsed ? 42 : 225,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}>
              <Image
                src="/logo.png"
                alt="Omini Pulse"
                width={collapsed ? 38 : 220}
                height={collapsed ? 38 : 52}
                style={{ objectFit: 'contain', objectPosition: 'left center', width: '100%', height: '100%' }}
                onError={() => {}}
              />
            </div>
          </div>

          {/* Collapse button */}
          {!isMobileSidebarOpen && (
            <button
              onClick={toggleSidebar}
              style={{
                width: 22, height: 22,
                borderRadius: '50%',
                background: '#1e293b',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                flexShrink: 0,
                ...(collapsed ? {
                  position: 'absolute', right: -11, top: 19,
                  background: '#1e293b', border: '1px solid #334155',
                } : {}),
              }}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronLeft size={12} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 250ms' }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {/* Section label */}
              {!collapsed ? (
                <p className="sidebar-section-label">{group.label}</p>
              ) : (
                <div style={{ height: 1, background: '#1e293b', margin: '6px 4px 4px' }} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: collapsed ? '8px 0' : '7px 10px',
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: active ? 550 : 450,
                        color: active ? '#ffffff' : '#94a3b8',
                        background: active ? '#2563eb' : 'transparent',
                        textDecoration: 'none',
                        transition: 'background 120ms, color 120ms',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        boxShadow: active ? '0 2px 8px rgba(37,99,235,0.35)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = '#1e293b';
                          e.currentTarget.style.color = '#e2e8f0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#94a3b8';
                        }
                      }}
                    >
                      <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} />
                      {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                          {item.badge && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: '#f87171', background: '#451a1a',
                              padding: '1px 5px', borderRadius: 4, marginLeft: 4, flexShrink: 0
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom App Download Box */}
        <SidebarAppDownload collapsed={collapsed} />

        {/* Admin user footer */}
        {admin && (
          <div style={{
            borderTop: '1px solid #1e293b',
            padding: 10,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
            }}>
              {admin.firstName?.[0]}{admin.lastName?.[0]}
            </div>

            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#f1f5f9', fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {admin.firstName} {admin.lastName}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 9.5,
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 100,
                    marginTop: 2,
                    background: roleColor.bg,
                    color: roleColor.color,
                  }}>
                    {roleLabel}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 6,
                    background: 'transparent', border: 'none',
                    color: '#64748b', cursor: 'pointer',
                    transition: 'background 120ms, color 120ms',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
