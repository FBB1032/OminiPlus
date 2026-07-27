import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

// Matches mobile Input component:
// height: 52px (Layout.inputHeight)
// borderRadius: 12px (BorderRadius.lg)  
// borderWidth: 1.5
// borderColor: Colors.border (#E2E8F0)
// fontSize: 15 (FontSize.base)
// label: 13px medium (FontSize.sm, FontWeight.medium)

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label className="text-[13px] font-medium text-text-secondary">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              // Mobile: inputHeight=52, borderRadius.lg=12, borderWidth=1.5, borderColor=border
              'w-full h-[52px] bg-surface border-[1.5px] border-border rounded-lg text-[15px] text-text-primary placeholder:text-neutral-400',
              'focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all duration-150',
              leftIcon ? 'pl-11 pr-4' : 'px-4',
              rightIcon ? 'pr-11' : '',
              error ? 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export function Select({ label, error, options, containerClassName, className, ...props }: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
      <select
        className={cn(
          'w-full h-[52px] bg-surface border-[1.5px] border-border rounded-lg text-[15px] text-text-primary px-4',
          'focus:outline-none focus:border-primary-600 transition-all duration-150',
          error ? 'border-error' : '',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-surface border-[1.5px] border-border rounded-lg text-[15px] text-text-primary px-4 py-3 resize-none',
            'focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all duration-150',
            error ? 'border-error' : '',
            className
          )}
          rows={4}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Search bar — matches mobile SearchBar component style
interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({ containerClassName, className, ...props }: SearchBarProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <input
        className={cn(
          'w-full h-[48px] bg-surface border-[1.5px] border-border rounded-xl text-[15px] text-text-primary placeholder:text-neutral-400 pl-11 pr-4',
          'focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all duration-150',
          className
        )}
        {...props}
      />
    </div>
  );
}
