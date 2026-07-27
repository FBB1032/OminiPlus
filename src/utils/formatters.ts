/**
 * Format an ISO date string to a human-readable date.
 * e.g. "June 3, 2026"
 */
export const formatDate = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
};

/**
 * Format an ISO date string to short date.
 * e.g. "Jun 3"
 */
export const formatShortDate = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
};

/**
 * Format an ISO date string to time.
 * e.g. "09:30 AM"
 */
export const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoString;
  }
};

/**
 * Format an ISO date string to date + time.
 * e.g. "Jun 3, 09:30 AM"
 */
export const formatDateTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${formatShortDate(isoString)}, ${formatTime(isoString)}`;
  } catch {
    return isoString;
  }
};

/**
 * Smart relative date label.
 * Returns "Today", "Tomorrow", "Yesterday", or short date.
 */
export const formatRelativeDay = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const today = new Date();
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = targetDate.getTime() - currentDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
};

/**
 * e.g. "2 hours ago", "3 days ago"
 */
export const formatTimeAgo = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
};

/**
 * Format currency.
 * e.g. 5000 → "$50.00"
 */
export const formatCurrency = (amountInCents: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
};

/**
 * Format phone number to readable form.
 * e.g. "2348012345678" → "+234 801 234 5678"
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
};

/**
 * Format a full name from parts.
 */
export const formatFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`.trim();

/**
 * Get initials from a full name.
 * e.g. "John Doe" → "JD"
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/**
 * Format appointment duration.
 * e.g. 90 → "1h 30m"
 */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
