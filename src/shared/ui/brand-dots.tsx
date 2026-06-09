/**
 * Three bouncing dots in the brand color — the app's loading indicator.
 * Used by the boot splash and the route-transition pill. Drives the
 * `dot-bounce` keyframe (index.css) with a staggered per-dot delay.
 *
 *   <BrandDots />                       // default
 *   <BrandDots size="w-1.5 h-1.5" />    // compact, e.g. inline pill
 */
export function BrandDots({ size = 'w-2.5 h-2.5', className = '' }: { size?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${size} rounded-full bg-[var(--brand-primary)]`}
          style={{ animation: 'dot-bounce 1s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
