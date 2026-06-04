import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Portal } from '@/shared/ui/portal';

export type Placement = 'top' | 'bottom' | 'left' | 'right';

const PAD = 6;
const CARD_W = 300;

/** Track a target element's viewport rect; scroll it into view once, then follow it. */
function useRect(target: string, stepKey: number) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  React.useEffect(() => {
    let timer = 0;
    let tries = 0;
    let scrolled = false;
    const read = () => (document.querySelector(target) as HTMLElement | null)?.getBoundingClientRect() ?? null;
    const measure = () => {
      const el = document.querySelector(target) as HTMLElement | null;
      if (el) {
        if (!scrolled) {
          scrolled = true;
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        setRect(el.getBoundingClientRect());
      } else if (tries < 40) {
        tries += 1;
        timer = window.setTimeout(measure, 60) as unknown as number;
        return;
      } else {
        setRect(null);
      }
    };
    measure();
    const onChange = () => { const r = read(); if (r) setRect(r); };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    // Keep following while modals slide in / layout settles (no scroll event fires then).
    const iv = window.setInterval(onChange, 250);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(iv);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [target, stepKey]);
  return rect;
}

/**
 * A single coach-mark: dims the screen, cuts a spotlight hole over the target,
 * and shows a card with Skip / Back / Next. Used to build guided flows.
 */
export function Spotlight({
  target,
  title,
  body,
  placement = 'bottom',
  index,
  count,
  nextLabel,
  onNext,
  onBack,
  onSkip,
}: {
  target: string;
  title: string;
  body: string;
  placement?: Placement;
  index: number;
  count: number;
  nextLabel?: string;
  onNext: () => void;
  onBack?: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const rect = useRect(target, index);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onBack?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onBack, onSkip]);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isLast = index === count - 1;

  let cardStyle: React.CSSProperties;
  if (rect) {
    if (placement === 'left') {
      cardStyle = { left: Math.max(rect.left - CARD_W - 14, 12), top: clamp(rect.top, 12, vh - 220) };
    } else if (placement === 'right') {
      cardStyle = { left: Math.min(rect.right + 14, vw - CARD_W - 12), top: clamp(rect.top, 12, vh - 220) };
    } else if (placement === 'top') {
      cardStyle = { left: clamp(rect.left, 12, vw - CARD_W - 12), top: Math.max(rect.top - 12, 12), transform: 'translateY(-100%)' };
    } else {
      cardStyle = { left: clamp(rect.left, 12, vw - CARD_W - 12), top: Math.min(rect.bottom + 12, vh - 220) };
    }
  } else {
    cardStyle = { left: vw / 2 - CARD_W / 2, top: vh / 2 - 100 };
  }

  return (
    <Portal>
      {/* Click-blocker so the app underneath isn't interacted with mid-flow. */}
      <div className="fixed inset-0 z-[75]" />

      {rect ? (
        <div
          className="fixed z-[76] rounded-lg pointer-events-none transition-all duration-200"
          style={{
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(44,38,39,0.55)',
            outline: '2px solid var(--brand-primary)',
            outlineOffset: '2px',
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[76] bg-[rgba(44,38,39,0.55)] pointer-events-none" />
      )}

      <div
        className="fixed z-[77] bg-white rounded-lg shadow-[0_16px_48px_rgba(44,38,39,0.28)] p-4"
        style={{ ...cardStyle, width: CARD_W }}
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className={
                'h-1.5 rounded-full transition-all ' +
                (i === index ? 'w-4 bg-[var(--brand-primary)]' : 'w-1.5 bg-[var(--surface-subtle)]')
              }
            />
          ))}
        </div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">{t(title)}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{t(body)}</p>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('Skip tour')}
          </button>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-8 px-3 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors"
              >
                {t('Back')}
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="h-8 px-3.5 rounded-md bg-[var(--brand-primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {t(nextLabel ?? (isLast ? 'Done' : 'Next'))}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}
