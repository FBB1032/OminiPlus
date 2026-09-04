'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Matches mobile AppModal component:
// backgroundColor: Colors.surface (#FFF)
// borderRadius: BorderRadius['3xl'] (24px) on the panel
// backdrop: semi-transparent black
// title: FontSize.md(17) FontWeight.bold, color: dark
// padding: Spacing[5] (20px)

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', footer }: ModalProps) {
  // Scroll locking removed to allow background scrolling as requested.

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      {/* Backdrop — Glassmorphism effect */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'all 200ms ease'
        }}
      />
 
      {/* Panel — matches mobile modal card: white, borderRadius['3xl']=24 */}
      <div 
        className={cn(
          'relative w-full bg-white flex flex-col',
          sizes[size]
        )}
        style={{
          position: 'relative',
          borderRadius: 24,
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
          zIndex: 10,
          animation: 'modalSlideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header — matches mobile modal title row */}
        {(title || subtitle) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            flexShrink: 0
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* FontSize.md=17, bold, dark color */}
              {title && <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>{title}</h2>}
              {subtitle && <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0 }}>{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: '#f1f5f9', color: '#64748b', border: 'none',
                cursor: 'pointer', transition: 'all 150ms', flexShrink: 0
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <X size={15} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: 16, top: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%',
              background: '#f1f5f9', color: '#64748b', border: 'none',
              cursor: 'pointer', transition: 'all 150ms', zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            <X size={15} />
          </button>
        )}
 
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{children}</div>
 
        {/* Footer — matches mobile modal footer */}
        {footer && (
          <div style={{
            borderTop: '1px solid #f1f5f9',
            padding: '16px 24px',
            background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'end',
            gap: 12, flexShrink: 0
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
