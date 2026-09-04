import { cn } from '@/lib/utils';
import { Loader2, Inbox } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'lg' | 'xl' | '2xl' | '3xl';
  style?: React.CSSProperties;
}

const paddings = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6',
};

const radii = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

export function Card({ children, className, padding = 'md', radius = '2xl', style }: CardProps) {
  return (
    <div
      className={cn(radii[radius], paddings[padding], className)}
      style={{
        background: '#ffffff',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[#f1f5f9]', className)}>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 0, lineHeight: 1.4 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

interface SkeletonProps { className?: string; }
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('rounded-lg animate-skeleton', className)} style={{ background: '#f3f4f6', minHeight: 12 }} />;
}

export function CardSkeleton() {
  return (
    <Card>
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin" style={{ color: '#2563eb' }} />
    </div>
  );
}export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div style={{
        width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
      }}>
        <Inbox size={22} style={{ color: '#94a3b8' }} />
      </div>
      <p className="empty-title" style={{ fontSize: 14.5, fontWeight: 650, color: '#1e293b' }}>{title}</p>
      {subtitle && <p className="empty-subtitle" style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
