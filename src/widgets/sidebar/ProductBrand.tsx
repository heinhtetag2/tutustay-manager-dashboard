import { Hexagon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

// ── Swap in the real product logo here ──────────────────────────────────────
// Drop a file into src/assets/logos/ (e.g. tutustay.svg) and uncomment:
//   import logoUrl from '@/assets/logos/tutustay.svg';
// Then set USE_IMAGE to true. The placeholder wordmark below is the fallback.
const logoUrl: string | null = null;
const USE_IMAGE = false;
// ─────────────────────────────────────────────────────────────────────────────

/** The product brand mark — a rounded square. Swap the inner content for a real
 *  logo by flipping USE_IMAGE above; until then it's a styled placeholder. */
function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('rounded-md bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0 overflow-hidden', className)}>
      {USE_IMAGE && logoUrl ? (
        <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
      ) : (
        <Hexagon className="w-3.5 h-3.5" />
      )}
    </span>
  );
}

/** "Powered by TutuStay" footer brand, pinned at the bottom of the sidebar.
 *  Collapses to just the brand mark when the sidebar is collapsed. */
export function ProductBrand({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();

  if (collapsed) {
    return (
      <div className="flex justify-center py-1.5" title={`${t('Powered by')} TutuStay`}>
        <BrandMark className="w-7 h-7" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <BrandMark className="w-7 h-7" />
      <div className="min-w-0 leading-tight">
        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{t('Powered by')}</div>
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">TutuStay</div>
      </div>
    </div>
  );
}
