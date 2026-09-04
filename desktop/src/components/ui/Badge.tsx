import { cn } from '@/lib/utils';

// Matches mobile app status badge patterns
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'teal' | 'admin';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Colors match mobile Colors.status.* tokens
const variantStyles = {
  success: 'bg-[#DCFCE7] text-[#16A34A]',
  warning: 'bg-[#FEF9C3] text-[#CA8A04]',
  error: 'bg-[#FEE2E2] text-[#DC2626]',
  info: 'bg-[#DBEAFE] text-[#1D4ED8]',
  neutral: 'bg-[#F1F5F9] text-[#475569]',
  primary: 'bg-[#EFF6FF] text-[#2563EB]',
  teal: 'bg-[#ECFEFF] text-[#0E7490]',
  admin: 'bg-[#F5F3FF] text-[#7C3AED]',
};

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5 font-semibold',
  md: 'text-xs px-2.5 py-1 font-semibold',
};

export function Badge({ variant = 'neutral', size = 'md', children, className, style }: BadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
