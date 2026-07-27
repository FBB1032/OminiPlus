import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

// Matches mobile Avatar component:
// AvatarSize: xs=28, sm=36, md=44, lg=56, xl=72, '2xl'=96
// Uses dynamic color-coded initials with rounded-full

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizes = {
  xs: 'w-7 h-7 text-[10px]',    // 28px
  sm: 'w-9 h-9 text-xs',        // 36px
  md: 'w-11 h-11 text-sm',      // 44px
  lg: 'w-14 h-14 text-base',    // 56px
  xl: 'w-[72px] h-[72px] text-xl',  // 72px
  '2xl': 'w-24 h-24 text-2xl',  // 96px
};

// Color bg combos from mobile theme (using primary/secondary/green/orange/purple palette)
const bgColors = [
  'bg-[#EFF6FF] text-[#2563EB]',  // primary
  'bg-[#ECFEFF] text-[#0E7490]',  // teal
  'bg-[#F5F3FF] text-[#7C3AED]',  // purple/admin
  'bg-[#ECFDF5] text-[#059669]',  // green
  'bg-[#FFF1F2] text-[#E11D48]',  // rose
  'bg-[#FFFBEB] text-[#D97706]',  // amber
];

function getColorIndex(name: string) {
  let hash = 0;
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return Math.abs(hash) % bgColors.length;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const parts = name.split(' ');
  const initials = getInitials(parts[0] ?? '', parts[1] ?? '');
  const colorClass = bgColors[getColorIndex(name)];

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 overflow-hidden',
      sizes[size],
      !src && colorClass,
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}
