import * as React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Portal } from '@/shared/ui/portal';
import { cn } from '@/shared/lib/cn';
import { GLOSSARY } from '@/widgets/onboarding/glossary';

/**
 * Small `(i)` affordance that reveals a definition on hover, focus or tap.
 * Hand-rolled (no global provider) and portalled so it escapes overflow clips.
 */
export function InfoTooltip({
  label,
  className,
  side = 'top',
}: {
  /** The explanatory text. */
  label: string;
  className?: string;
  side?: 'top' | 'bottom';
}) {
  const { t } = useTranslation();
  const ref = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);

  const show = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: r.left + r.width / 2,
      top: side === 'top' ? r.top : r.bottom,
    });
    setOpen(true);
  }, [side]);

  const hide = React.useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={t('More info')}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          open ? hide() : show();
        }}
        className={cn(
          'inline-flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors align-middle cursor-help',
          className,
        )}
      >
        <Info className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
      {open && pos && (
        <Portal>
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              transform:
                side === 'top'
                  ? 'translate(-50%, calc(-100% - 8px))'
                  : 'translate(-50%, 8px)',
            }}
            className="z-[80] w-[240px] max-w-[78vw] rounded-md bg-[var(--text-primary)] text-white text-xs leading-relaxed px-3 py-2 shadow-[0_8px_28px_rgba(44,38,39,0.22)] pointer-events-none"
          >
            {t(label)}
          </div>
        </Portal>
      )}
    </>
  );
}

/**
 * A glossary term rendered with its `(i)` definition. Looks copy up from the
 * shared GLOSSARY by `name`; falls back to children/name for the visible label.
 */
export function Term({
  name,
  children,
  className,
  side,
}: {
  name: keyof typeof GLOSSARY;
  children?: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom';
}) {
  const def = GLOSSARY[name];
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {children ?? name}
      {def && <InfoTooltip label={def} side={side} />}
    </span>
  );
}
