'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Stethoscope, Building2, Pill, Calendar,
  Bot, Bell, BarChart3, ScrollText, ShieldCheck, Settings,
  ChevronLeft, LogOut,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from '@/store/permissionStore';
import type { AdminRole, Permission } from '@/types';
import type { LucideIcon } from 'lucide-react';

// ─── Icon Registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Stethoscope, Building2, Pill, Calendar,
  Bot, Bell, BarChart3, ScrollText, ShieldCheck, Settings,
};

// ─── Nav definition (permission-gated) ────────────────────────────────────────
const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; icon: string; permission: Permission }[];
}[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', permission: 'dashboard.view' },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/dashboard/doctors', label: 'Doctors', icon: 'Stethoscope', permission: 'doctors.view' },
      { href: '/dashboard/hospitals', label: 'Hospitals', icon: 'Building2', permission: 'hospitals.view' },
      { href: '/dashboard/pharmacies', label: 'Pharmacies', icon: 'Pill', permission: 'pharmacies.view' },
      { href: '/dashboard/appointments', label: 'Appointments', icon: 'Calendar', permission: 'appointments.view_overview' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/dashboard/ai-monitoring', label: 'AI Monitoring', icon: 'Bot', permission: 'ai_monitoring.view' },
      { href: '/dashboard/notifications', label: 'Notifications', icon: 'Bell', permission: 'notifications.view' },
      { href: '/dashboard/reports', label: 'Reports', icon: 'BarChart3', permission: 'reports.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: 'ScrollText', permission: 'audit_logs.view' },
      { href: '/dashboard/security', label: 'Security', icon: 'ShieldCheck', permission: 'security.view' },
      { href: '/dashboard/settings', label: 'Settings', icon: 'Settings', permission: 'settings.view' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { admin, logout } = useAuthStore();

  const adminRole = admin?.role || 'super_admin';
  const permissions = ROLE_PERMISSIONS[adminRole] || [];

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

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
          height: 64,
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              height: 38,
              width: collapsed ? 38 : 164,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}>
              <Image
                src="/logo.png"
                alt="OminiPlus"
                width={collapsed ? 30 : 156}
                height={collapsed ? 30 : 32}
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
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
                      {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

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
