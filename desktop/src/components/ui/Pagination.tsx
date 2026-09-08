import React from 'react';
import { ChevronLeft, ChevronRight, Eye, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  total?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  isSeeAll?: boolean;
  onToggleSeeAll?: () => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  isLoading,
  total = 0,
  pageSize = 10,
  onPageSizeChange,
  isSeeAll = false,
  onToggleSeeAll,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = isSeeAll ? total : Math.min(page * pageSize, total);

  // Generate numbered pages array
  const pages = Array.from({ length: Math.min(safeTotalPages, 7) }, (_, i) => {
    if (safeTotalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= safeTotalPages - 3) return safeTotalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* Left: Range and Total Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Showing{' '}
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            {isSeeAll ? `1–${total}` : total === 0 ? '0' : `${start}–${end}`}
          </span>{' '}
          of <span style={{ fontWeight: 700, color: '#0f172a' }}>{total}</span> entries
        </p>

        {/* See All / Paged Toggle */}
        {onToggleSeeAll && total > 5 && (
          <button
            type="button"
            onClick={onToggleSeeAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              background: isSeeAll ? '#eff6ff' : '#f8fafc',
              color: isSeeAll ? '#2563eb' : '#64748b',
              border: `1px solid ${isSeeAll ? '#93c5fd' : '#e2e8f0'}`,
              cursor: 'pointer',
              transition: 'all 120ms',
            }}
            title={isSeeAll ? 'Switch to Paginated View' : 'See All Entries on One Page'}
          >
            <Eye size={13} />
            {isSeeAll ? 'Switch to Pages (1–5)' : 'See All'}
          </button>
        )}

        {/* Page size dropdown if provided */}
        {onPageSizeChange && !isSeeAll && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '2px 6px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation (Hidden if See All is active) */}
      {!isSeeAll && safeTotalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          {/* Prev */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              background: '#ffffff',
              color: page <= 1 ? '#cbd5e1' : '#475569',
              border: '1px solid #e2e8f0',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 120ms',
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {/* Numbered Page Buttons */}
          {pages.map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: isActive ? '1px solid #0f6e6e' : '1px solid #e2e8f0',
                  background: isActive ? '#0f6e6e' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 120ms',
                }}
              >
                {p}
              </button>
            );
          })}

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= safeTotalPages || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              background: '#ffffff',
              color: page >= safeTotalPages ? '#cbd5e1' : '#475569',
              border: '1px solid #e2e8f0',
              cursor: page >= safeTotalPages ? 'not-allowed' : 'pointer',
              transition: 'all 120ms',
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
