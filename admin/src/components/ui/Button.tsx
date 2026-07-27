import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: '#2563eb',
    color: '#ffffff',
    border: '1px solid transparent',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1), inset 0 1px 0 rgba(255,255,255,0.12)',
  },
  teal: {
    background: '#0ea5e9',
    color: '#ffffff',
    border: '1px solid transparent',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
  },
  secondary: {
    background: '#f9fafb',
    color: '#374151',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  },
  outline: {
    background: '#ffffff',
    color: '#374151',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  },
  ghost: {
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid transparent',
  },
  danger: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: 34, padding: '0 14px', fontSize: 13, gap: 6, borderRadius: 7 },
  md: { height: 40, padding: '0 18px', fontSize: 14, gap: 7, borderRadius: 9 },
  lg: { height: 46, padding: '0 24px', fontSize: 15, gap: 8, borderRadius: 10 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, className, children, disabled, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed', className)}
        style={{
          ...variantStyles[variant],
          ...sizeStyles[size],
          fontFamily: 'inherit',
          letterSpacing: '-0.01em',
          ...style,
        }}
        {...props}
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
