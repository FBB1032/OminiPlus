import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

// Pagination styled to match mobile button/text tokens
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  total?: number;
  pageSize?: number;
}

export function Pagination({ page, totalPages, onPageChange, isLoading, total, pageSize = 10 }: PaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total ?? 0);

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      {/* Count text — matches mobile body2: 13px, text-secondary */}
      {total !== undefined && (
        <p className="text-[13px] text-text-secondary">
          Showing <span className="font-bold text-dark">{start}–{end}</span> of{' '}
          <span className="font-bold text-dark">{total}</span>
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="flex items-center gap-1 h-9 px-3 rounded-lg text-[13px] font-semibold text-text-secondary hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 text-[13px] font-bold rounded-lg transition-all',
              p === page
                // Active page: teal accent matching mobile's active state
                ? 'bg-[#0EA5E9] text-white'
                : 'text-text-secondary hover:bg-neutral-100'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="flex items-center gap-1 h-9 px-3 rounded-lg text-[13px] font-semibold text-text-secondary hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
