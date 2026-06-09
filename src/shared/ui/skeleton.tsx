import type { CSSProperties } from 'react';

/**
 * A loading placeholder block. Fills its box with the subtle surface tone and
 * sweeps a soft highlight across it (the `shimmer` keyframe in index.css) so it
 * reads as "content on the way" rather than empty state.
 *
 * Size it with width/height utility classes via `className`:
 *   <Skeleton className="h-4 w-24" />
 *   <Skeleton className="h-10 w-10 rounded-md" />
 */
export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded bg-[var(--surface-subtle)] ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}
