import { useEffect, useRef, useState } from 'react';

/**
 * useSkeletonDelay
 *
 * Ensures the skeleton stays visible for at least `minMs` milliseconds
 * (default 150ms) even if data loads instantly. This prevents a jarring
 * layout flash and gives a polished perceived-performance feel.
 *
 * @param isLoading  — the raw loading state from React Query (or any async source)
 * @param minMs      — minimum time (ms) the skeleton must be shown (default: 150)
 * @returns          — a boolean; true while skeleton should be displayed
 */
export function useSkeletonDelay(isLoading: boolean, minMs = 150): boolean {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Data started loading — record the start time and show skeleton
      startedAt.current = Date.now();
      setShowSkeleton(true);
    } else {
      // Data finished loading — ensure skeleton was shown for at least minMs
      const elapsed = startedAt.current ? Date.now() - startedAt.current : minMs;
      const remaining = Math.max(0, minMs - elapsed);

      timerRef.current = setTimeout(() => {
        setShowSkeleton(false);
      }, remaining);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, minMs]);

  return showSkeleton;
}
