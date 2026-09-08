'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

interface TopNavProps {
  pageTitle?: string;
}

export function TopNav({ pageTitle }: TopNavProps) {
  const router = useRouter();
  const { toggleMobileSidebar } = useUIStore();
  const { admin } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/dashboard/patients?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      height: 64,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8e8',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 36px',
      zIndex: 40,
    }}>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        style={{
          display: 'none',
          width: 36, height: 36,
          borderRadius: 8,
          background: '#f9fafb',
          border: '1px solid #f3f4f6',
          alignItems: 'center', justifyContent: 'center',
          color: '#374151', cursor: 'pointer',
          flexShrink: 0,
        }}
        className="mobile-menu-btn"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Page Title */}
      {pageTitle && (
        <h1 style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#111827',
          letterSpacing: '-0.02em',
          margin: 0,
          flexShrink: 0,
        }}>
          {pageTitle}
        </h1>
      )}

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        height: 34,
        padding: '0 12px',
        width: 220,
      }}>
        <Search size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          placeholder="Quick search… (press Enter)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchSubmit}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: '#374151', width: '100%',
            fontFamily: 'inherit',
          }}
        />
        <kbd style={{
          padding: '1px 5px', background: '#f3f4f6', border: '1px solid #e5e7eb',
          borderRadius: 4, fontSize: 10.5, color: '#9ca3af', fontFamily: 'inherit',
          letterSpacing: '-0.01em', flexShrink: 0,
        }}>↵</kbd>
      </div>

      {/* Notification bell */}
      <button
        type="button"
        onClick={() => router.push('/dashboard/notifications')}
        title="View Notifications"
        style={{
          position: 'relative',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8,
          background: '#f9fafb',
          border: '1px solid #f3f4f6',
          color: '#374151',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
      >
        <Bell size={16} />
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 6, height: 6, borderRadius: '50%',
          background: '#ef4444', border: '1.5px solid #fff',
        }} />
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: '#f3f4f6', flexShrink: 0 }} />

      {/* Admin profile */}
      {admin && (
        <div
          onClick={() => router.push('/dashboard/settings')}
          title="Open Account Settings"
          style={{
            display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', padding: '4px 6px',
            borderRadius: 8, transition: 'background 120ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 11.5, flexShrink: 0,
          }}>
            {admin.firstName?.[0]}{admin.lastName?.[0]}
          </div>
          <div style={{ display: 'none' }} className="admin-name-block">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              {admin.firstName} {admin.lastName}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {admin.role?.replace('_', ' ')}
            </p>
          </div>
          <ChevronDown size={13} style={{ color: '#9ca3af' }} />
        </div>
      )}
    </header>
  );
}
