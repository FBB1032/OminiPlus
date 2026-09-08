import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// Table matches mobile list/card pattern:
// Row bg: white surface
// Border: Colors.border #E2E8F0
// Header: neutral-50 (#F8FAFC), xs text, medium weight, uppercase
// Cell text: FontSize.sm=13, color: text.primary

export function Table<T>({ columns, data, keyExtractor, onRowClick, isLoading, emptyMessage = 'No data found', className }: TableProps<T>) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    // Header: 11px medium, uppercase, neutral-500 — matches mobile list section headers
                    'text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wide px-5 py-3.5 whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col text-neutral-300">
                        <ChevronUp size={9} />
                        <ChevronDown size={9} className="-mt-1" />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 bg-neutral-100 rounded animate-pulse-soft" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-[13px] text-text-secondary py-12">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'bg-surface transition-colors',
                    // Matches mobile list item: hover state with neutral-50
                    onRowClick && 'cursor-pointer hover:bg-[#F8FAFC]'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        // FontSize.sm=13, text.primary color
                        'px-5 py-4 text-[13px] text-text-primary whitespace-nowrap',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                      )}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
