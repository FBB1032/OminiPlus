'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { realtimeService } from '@/services/realtimeService';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { isSidebarCollapsed } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  // One shared realtime socket per authenticated console session — powers
  // live appointment sync, broadcast delivery, and moderation updates.
  useEffect(() => {
    if (isAuthenticated) {
      realtimeService.connect();
      return () => realtimeService.disconnect();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const sidebarW = isSidebarCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      {/* Main content — offset by sidebar width using CSS variable */}
      <div
        style={{
          marginLeft: sidebarW,
          transition: 'margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
      >
        <TopNav />
        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            background: '#f8fafa',
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
