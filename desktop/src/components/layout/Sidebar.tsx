'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Stethoscope, Building2, Pill, Calendar, Droplet,
  Bot, Bell, BarChart3, ScrollText, ShieldCheck, Settings,
  ChevronLeft, LogOut, Smartphone, Users, FileText, FlaskConical, Star, Award, Lock, Video, CreditCard, Receipt,
  Activity, AlertTriangle, ChevronDown, ChevronUp, MoreHorizontal, Clock, Shield, UserCheck, BedDouble
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { ROLE_LABELS, ROLE_COLORS } from '@/store/permissionStore';
import type { AdminRole } from '@/types';
import type { LucideIcon } from 'lucide-react';

// ─── Icon Registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Stethoscope, Building2, Pill, Calendar, Droplet,
  Bot, Bell, BarChart3, ScrollText, ShieldCheck, Settings, Smartphone,
  Users, FileText, FlaskConical, Star, Award, Lock, Video, CreditCard, Receipt,
  Activity, AlertTriangle, ChevronDown, ChevronUp, MoreHorizontal, Clock, Shield, UserCheck, BedDouble
};

interface NavItemDef {
  href: string;
  tab?: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
  hasMoreToggle?: boolean;
}

// ─── Role-Based Navigation Generator ──────────────────────────────────────────
function getNavigationForRole(role: AdminRole, isMoreHospitalOpen: boolean): NavGroupDef[] {
  switch (role) {
    case 'doctor':
      // Doctors only see their clinical practice workspace
      return [
        {
          label: 'Doctor Workspace',
          items: [
            { href: '/dashboard/doctor-portal?tab=dashboard', tab: 'dashboard', label: 'Clinical Dashboard', icon: 'Activity' },
            { href: '/dashboard/doctor-portal?tab=appointments', tab: 'appointments', label: 'Appointments Queue', icon: 'Calendar' },
            { href: '/dashboard/body-map', label: '3D Body Map & Charts', icon: 'Activity' },
            { href: '/dashboard/doctor-portal?tab=patients', tab: 'patients', label: 'Patients & EHR', icon: 'Users' },
            { href: '/dashboard/doctor-portal?tab=prescriptions', tab: 'prescriptions', label: 'Digital Prescriptions', icon: 'Pill' },
            { href: '/dashboard/doctor-portal?tab=schedule', tab: 'schedule', label: 'Duty Shifts & Hours', icon: 'Clock' },
            { href: '/dashboard/doctor-portal?tab=reviews', tab: 'reviews', label: 'Patient Reviews', icon: 'Star' },
            { href: '/dashboard/doctor-portal?tab=profile', tab: 'profile', label: 'Doctor Profile & MDCN', icon: 'Stethoscope' },
            { href: '/dashboard/notifications', label: 'Notifications', icon: 'Bell' },
          ],
        },
      ];

    case 'hospital_admin': {
      // Hospital Admin manages facility, staff, wards, pharmacy, lab, blood, services, and billing
      const primary: NavItemDef[] = [
        { href: '/dashboard/hospital-portal?tab=appointments', tab: 'appointments', label: 'Appointments', icon: 'Calendar' },
        { href: '/dashboard/hospital-portal?tab=patients', tab: 'patients', label: 'Hospital Patients', icon: 'Users' },
        { href: '/dashboard/hospital-portal?tab=wards', tab: 'wards', label: 'Wards & Beds Map', icon: 'BedDouble' },
        { href: '/dashboard/hospital-portal?tab=pharmacy', tab: 'pharmacy', label: 'Hospital Pharmacy', icon: 'Pill' },
        { href: '/dashboard/hospital-portal?tab=laboratory', tab: 'laboratory', label: 'Laboratory & Diagnostics', icon: 'FlaskConical' },
        { href: '/dashboard/hospital-portal?tab=doctors', tab: 'doctors', label: 'Doctors & Staff', icon: 'Stethoscope' }, // ONLY hospital_admin!
        { href: '/dashboard/hospital-portal?tab=blood', tab: 'blood', label: 'Blood & Donors', icon: 'Droplet' },
      ];

      const more: NavItemDef[] = [
        { href: '/dashboard/hospital-portal?tab=services', tab: 'services', label: 'Services & Pricing', icon: 'Activity' },
        { href: '/dashboard/hospital-portal?tab=billing', tab: 'billing', label: 'Billing & Subscriptions', icon: 'Receipt' },
        { href: '/dashboard/hospital-portal?tab=emergency', tab: 'emergency', label: 'Emergency Requests', icon: 'AlertTriangle' },
        { href: '/dashboard/hospital-portal?tab=profile', tab: 'profile', label: 'Hospital Profile', icon: 'Building2' },
        { href: '/dashboard/hospital-portal?tab=notifications', tab: 'notifications', label: 'Notifications', icon: 'Bell' },
        { href: '/dashboard/hospital-portal?tab=reports', tab: 'reports', label: 'Facility Reports', icon: 'BarChart3' },
        { href: '/dashboard/hospital-portal?tab=audit', tab: 'audit', label: 'Audit Logs', icon: 'ScrollText' },
      ];

      return [
        {
          label: 'Hospital Workplace',
          hasMoreToggle: true,
          items: isMoreHospitalOpen ? [...primary, ...more] : primary,
        },
      ];
    }

    case 'nurse':
      // Clinical Nurse sees triage queue, inpatient vitals, and ward beds
      return [
        {
          label: 'Clinical Triage & Wards',
          items: [
            { href: '/dashboard/hospital-portal?tab=appointments', tab: 'appointments', label: 'Triage Queue', icon: 'Calendar' },
            { href: '/dashboard/hospital-portal?tab=wards', tab: 'wards', label: 'Wards & Bed Care', icon: 'BedDouble' },
            { href: '/dashboard/hospital-portal?tab=patients', tab: 'patients', label: 'Inpatient Vitals', icon: 'Users' },
            { href: '/dashboard/hospital-portal?tab=notifications', tab: 'notifications', label: 'Notifications', icon: 'Bell' },
          ],
        },
      ];

    case 'receptionist':
      // Front desk sees arrivals, patient registrations, and bed assignments
      return [
        {
          label: 'Front Desk & Admissions',
          items: [
            { href: '/dashboard/hospital-portal?tab=appointments', tab: 'appointments', label: 'Arrivals & Check-In', icon: 'Calendar' },
            { href: '/dashboard/hospital-portal?tab=patients', tab: 'patients', label: 'Patient Registration', icon: 'Users' },
            { href: '/dashboard/hospital-portal?tab=wards', tab: 'wards', label: 'Bed Assignment Board', icon: 'BedDouble' },
            { href: '/dashboard/hospital-portal?tab=notifications', tab: 'notifications', label: 'Notifications', icon: 'Bell' },
          ],
        },
      ];

    case 'blood_officer':
      // Blood bank officer only manages blood inventory and shortage appeals
      return [
        {
          label: 'Blood Bank',
          items: [
            { href: '/dashboard/hospital-portal?tab=blood', tab: 'blood', label: 'Blood Bank & Donors', icon: 'Droplet' },
            { href: '/dashboard/hospital-portal?tab=emergency', tab: 'emergency', label: 'Shortage Appeals', icon: 'AlertTriangle' },
            { href: '/dashboard/hospital-portal?tab=notifications', tab: 'notifications', label: 'Notifications', icon: 'Bell' },
          ],
        },
      ];

    case 'pharmacist':
      // Hospital Pharmacist manages prescriptions dispensing, drug inventory, and inpatient medication charts
      return [
        {
          label: 'Pharmacy & Dispensary',
          items: [
            { href: '/dashboard/hospital-portal?tab=pharmacy', tab: 'pharmacy', label: 'Prescriptions & Stock', icon: 'Pill' },
            { href: '/dashboard/hospital-portal?tab=patients', tab: 'patients', label: 'Inpatient Drug Charts', icon: 'Users' },
            { href: '/dashboard/hospital-portal?tab=profile', tab: 'profile', label: 'Facility Profile', icon: 'Building2' },
            { href: '/dashboard/hospital-portal?tab=notifications', tab: 'notifications', label: 'Notifications', icon: 'Bell' },
          ],
        },
      ];

    case 'lab_technician':
      // Laboratory Scientist manages test orders, specimen pipeline, results entry, and blood bank crossmatch
      return [
        {
          label: 'Clinical Diagnostics',
          items: [
            { href: '/dashboard/hospital-portal?tab=laboratory', tab: 'laboratory', label: 'Diagnostic Lab Orders', icon: 'FlaskConical' },
            { href: '/dashboard/hospital-portal?tab=blood', tab: 'blood', label: 'Blood Bank Crossmatch', icon: 'Droplet' },
            { href: '/dashboard/hospital-portal?tab=patients', tab: 'patients', label: 'Specimen History', icon: 'Users' },
            { href: '/dashboard/hospital-portal?tab=profile', tab: 'profile', label: 'Facility Profile', icon: 'Building2' },
            { href: '/dashboard/hospital-portal?tab=notifications', tab: 'notifications', label: 'Notifications', icon: 'Bell' },
          ],
        },
      ];

    case 'admin':
    default:
      // Super / Platform Admin has full platform oversight (no hospital or doctor workplaces)
      return [
        {
          label: 'Platform Management',
          items: [
            { href: '/dashboard/hospitals', label: 'Hospitals', icon: 'Building2' },
            { href: '/dashboard/doctors', label: 'Doctors', icon: 'Stethoscope' },
            { href: '/dashboard/patients', label: 'Patients', icon: 'Users' },
            { href: '/dashboard/body-map', label: '3D Body Map Triage', icon: 'Activity' },
            { href: '/dashboard/appointments', label: 'Appointments', icon: 'Calendar' },
            { href: '/dashboard/billing', label: 'Institutional & Doctor Billing', icon: 'Receipt' },
            { href: '/dashboard/payments', label: 'Payments & Escrow', icon: 'CreditCard' },
            { href: '/dashboard/blood-donors', label: 'Blood Transfusions', icon: 'Droplet' },
            { href: '/dashboard/pharmacies', label: 'Pharmacies', icon: 'Pill', badge: 'Coming Soon' },
          ],
        },
        {
          label: 'System & Security',
          items: [
            { href: '/dashboard/ai-monitoring', label: 'AI Monitoring', icon: 'Bot' },
            { href: '/dashboard/reports', label: 'Reports & Analytics', icon: 'BarChart3' },
            { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: 'ScrollText' },
            { href: '/dashboard/security', label: 'Security', icon: 'ShieldCheck' },
          ],
        },
      ];
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') : null;
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { admin, logout } = useAuthStore();

  const [isMoreHospitalOpen, setIsMoreHospitalOpen] = useState(false);

  const adminRole: AdminRole = (admin?.role as AdminRole) || 'admin';

  // Auto-expand "More" if the active tab is one of the more items
  useEffect(() => {
    if (pathname === '/dashboard/hospital-portal' && currentTab && ['services', 'billing', 'emergency', 'profile', 'notifications', 'reports', 'audit'].includes(currentTab)) {
      setIsMoreHospitalOpen(true);
    }
  }, [pathname, currentTab]);

  const isItemActive = (href: string, tab?: string) => {
    if (tab) {
      if (pathname === '/dashboard/doctor-portal') {
        if (tab === 'dashboard') {
          return !currentTab || currentTab === 'dashboard';
        }
        return currentTab === tab;
      }
      return pathname === '/dashboard/hospital-portal' && currentTab === tab;
    }
    if (href === '/dashboard/hospital-portal') {
      return pathname === '/dashboard/hospital-portal' && !currentTab;
    }
    if (href === '/dashboard/doctor-portal') {
      return pathname === '/dashboard/doctor-portal' && (!currentTab || currentTab === 'dashboard');
    }
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || (pathname.startsWith(href) && !pathname.includes('hospital-portal') && !pathname.includes('doctor-portal'));
  };

  const collapsed = isSidebarCollapsed;
  const navGroups = getNavigationForRole(adminRole, isMoreHospitalOpen);
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
        {/* Brand header — clean logo with NO background */}
        <div style={{
          height: 76,
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0' : '0 8px 0 14px',
          gap: 4,
          flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'space-between',
          position: 'relative',
        }}>
          {!collapsed ? (
            <Link
              href={
                adminRole === 'doctor' ? '/dashboard/doctor-portal' :
                adminRole === 'admin' ? '/dashboard/hospitals' :
                adminRole === 'pharmacist' ? '/dashboard/hospital-portal?tab=pharmacy' :
                adminRole === 'lab_technician' ? '/dashboard/hospital-portal?tab=laboratory' :
                adminRole === 'nurse' ? '/dashboard/hospital-portal?tab=wards' :
                adminRole === 'blood_officer' ? '/dashboard/hospital-portal?tab=blood' :
                adminRole === 'receptionist' ? '/dashboard/hospital-portal?tab=appointments' :
                '/dashboard/hospital-portal'
              }
              style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', minWidth: 0, overflow: 'hidden', background: 'transparent' }}
            >
              <Image
                src="/logo.png"
                alt="OminiPulse"
                width={140}
                height={44}
                style={{ height: 38, width: 'auto', objectFit: 'contain', background: 'transparent' }}
                priority
              />
              <span style={{ fontSize: 9.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, padding: '2px 6px', background: '#1e293b', borderRadius: 4 }}>
                {adminRole === 'doctor' ? 'Doctor' : adminRole === 'admin' ? 'Admin' : adminRole === 'pharmacist' ? 'Pharmacy' : adminRole === 'lab_technician' ? 'Laboratory' : adminRole === 'nurse' ? 'Nurse' : adminRole === 'receptionist' ? 'Reception' : adminRole === 'blood_officer' ? 'Blood Bank' : 'Hospital'}
              </span>
            </Link>
          ) : (
            <Link
              href={
                adminRole === 'doctor' ? '/dashboard/doctor-portal' :
                adminRole === 'admin' ? '/dashboard/hospitals' :
                adminRole === 'pharmacist' ? '/dashboard/hospital-portal?tab=pharmacy' :
                adminRole === 'lab_technician' ? '/dashboard/hospital-portal?tab=laboratory' :
                '/dashboard/hospital-portal'
              }
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="OminiPulse"
            >
              <Image
                src="/logo.png"
                alt="OminiPulse"
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
                priority
              />
            </Link>
          )}

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

        {/* Dynamic Role-Based Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 6 }}>
              {/* Section label */}
              {!collapsed ? (
                <p className="sidebar-section-label">{group.label}</p>
              ) : (
                <div style={{ height: 1, background: '#1e293b', margin: '6px 4px 4px' }} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map((item, idx) => {
                  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
                  const active = isItemActive(item.href, item.tab);

                  return (
                    <div key={item.href}>
                      <Link
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
                          fontWeight: active ? 600 : 450,
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

                      {/* If Hospital Admin and this is item 4 (Services), render the More Toggle button */}
                      {group.hasMoreToggle && idx === 4 && (
                        <button
                          type="button"
                          onClick={() => setIsMoreHospitalOpen(!isMoreHospitalOpen)}
                          title={collapsed ? (isMoreHospitalOpen ? 'Fewer Tools' : 'More Tools (5)') : undefined}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: collapsed ? 'center' : 'space-between',
                            width: '100%',
                            padding: collapsed ? '8px 0' : '6px 10px',
                            borderRadius: 7,
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: '#94a3b8',
                            background: isMoreHospitalOpen ? '#1e293b' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 120ms',
                            marginTop: 2,
                            marginBottom: 2,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#1e293b';
                            e.currentTarget.style.color = '#e2e8f0';
                          }}
                          onMouseLeave={(e) => {
                            if (!isMoreHospitalOpen) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#94a3b8';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <MoreHorizontal size={16} style={{ flexShrink: 0, opacity: 0.8 }} />
                            {!collapsed && (
                              <span style={{ fontSize: 12, fontWeight: 600 }}>
                                {isMoreHospitalOpen ? 'Fewer Tools' : 'More (5)'}
                              </span>
                            )}
                          </div>
                          {!collapsed && (
                            <ChevronDown size={14} style={{ transform: isMoreHospitalOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', opacity: 0.7 }} />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer with Role Selector */}
        {admin && (
          <div style={{
            borderTop: '1px solid #1e293b',
            padding: 10,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              justifyContent: collapsed ? 'center' : 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
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
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {admin.firstName} {admin.lastName}
                    </p>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: roleColor.color, background: roleColor.bg,
                      padding: '1px 6px', borderRadius: 4, display: 'inline-block',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {roleLabel}
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <button
                  onClick={logout}
                  title="Log out"
                  style={{
                    background: 'transparent', border: 'none',
                    color: '#64748b', cursor: 'pointer', padding: 4,
                    borderRadius: 4, display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>

          </div>
        )}
      </aside>
    </>
  );
}
