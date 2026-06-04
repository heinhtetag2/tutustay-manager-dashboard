import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Portal } from '@/shared/ui/portal';
import { useOnboarding, type TourId } from './use-onboarding';

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  body: string;
  /** Preferred placement of the card relative to the target. */
  place: 'bottom' | 'top' | 'right';
}

interface TourConfig {
  /** Route the tour spotlights — the tour navigates here on start. */
  route: string;
  steps: TourStep[];
  /** Final-step CTA: label, and an optional route to navigate to on finish. */
  finish: { label: string; href?: string };
}

const TOURS: Record<TourId, TourConfig> = {
  dashboard: {
    route: '/',
    steps: [
      {
        target: 'dashboard-kpis',
        title: 'Your day’s headline numbers',
        body: 'Revenue, arrivals, departures, and requests waiting on you. Hover any (i) to learn what a metric means.',
        place: 'bottom',
      },
      {
        target: 'dashboard-performance',
        title: 'Hotel performance, explained',
        body: 'ADR, RevPAR and Occupancy are standard hotel metrics — each has an (i) that defines it in plain language.',
        place: 'bottom',
      },
      {
        target: 'sidebar-nav',
        title: 'Everything’s grouped here',
        body: 'Overview, your Team, Hotel operations, Marketing and Finance — all from the sidebar.',
        place: 'right',
      },
      {
        target: 'setup-ring',
        title: 'Start here',
        body: 'Finish setting up your property to go live. This ring tracks your progress as you go.',
        place: 'right',
      },
    ],
    finish: { label: 'Go to setup', href: '/setup' },
  },
};

const PAD = 6;
const CARD_W = 300;

function useTargetRect(target: string, active: boolean, step: number) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (!active) return;
    let raf = 0;
    let tries = 0;
    let scrolled = false;
    const measure = () => {
      const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
      if (el) {
        // Bring the target into view once per step; the scroll listener below
        // keeps the spotlight aligned while the smooth scroll animates.
        if (!scrolled) {
          scrolled = true;
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        setRect(el.getBoundingClientRect());
      } else if (tries < 30) {
        // Target not mounted yet (route/layout settling) — keep polling briefly.
        tries += 1;
        raf = window.setTimeout(measure, 60) as unknown as number;
        return;
      } else {
        setRect(null);
      }
    };
    measure();
    const onChange = () => {
      const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.clearTimeout(raf);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [target, active, step]);

  return rect;
}

/** Spotlight coach-mark tour engine — drives whichever named tour is active. */
export function ProductTour() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tourId = useOnboarding((s) => s.tourId);
  const step = useOnboarding((s) => s.tourStep);
  const setTourStep = useOnboarding((s) => s.setTourStep);
  const endTour = useOnboarding((s) => s.endTour);

  const config = tourId ? TOURS[tourId] : null;
  const active = !!config;
  const steps = config?.steps ?? [];

  // Each tour spotlights a specific route — make sure we're on it.
  React.useEffect(() => {
    if (config && location.pathname !== config.route) {
      navigate(config.route);
    }
  }, [config, location.pathname, navigate]);

  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour();
      if (e.key === 'ArrowRight' && step < steps.length - 1) setTourStep(step + 1);
      if (e.key === 'ArrowLeft' && step > 0) setTourStep(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, step, steps.length, setTourStep, endTour]);

  const current = steps[step];
  const rect = useTargetRect(current?.target ?? '', active, step);

  if (!config || !current) return null;

  const isLast = step === steps.length - 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Position the card relative to the target (fallback: screen center).
  let cardStyle: React.CSSProperties;
  if (rect) {
    if (current.place === 'right') {
      cardStyle = {
        left: Math.min(rect.right + 14, vw - CARD_W - 12),
        top: Math.min(Math.max(rect.top, 12), vh - 220),
      };
    } else if (current.place === 'top') {
      cardStyle = {
        left: Math.min(Math.max(rect.left, 12), vw - CARD_W - 12),
        top: Math.max(rect.top - 12, 12),
        transform: 'translateY(-100%)',
      };
    } else {
      cardStyle = {
        left: Math.min(Math.max(rect.left, 12), vw - CARD_W - 12),
        top: Math.min(rect.bottom + 12, vh - 220),
      };
    }
  } else {
    cardStyle = { left: vw / 2 - CARD_W / 2, top: vh / 2 - 100 };
  }

  return (
    <Portal>
      {/* Click-blocker so the app underneath isn't interacted with mid-tour. */}
      <div className="fixed inset-0 z-[75]" />

      {/* Spotlight — transparent hole with a huge shadow that dims everything else. */}
      {rect && (
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
      )}
      {/* When no target found, dim the whole screen so the card still reads. */}
      {!rect && <div className="fixed inset-0 z-[76] bg-[rgba(44,38,39,0.55)] pointer-events-none" />}

      {/* Step card */}
      <div
        className="fixed z-[77] bg-white rounded-lg shadow-[0_16px_48px_rgba(44,38,39,0.28)] p-4"
        style={{ ...cardStyle, width: CARD_W }}
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={
                'h-1.5 rounded-full transition-all ' +
                (i === step ? 'w-4 bg-[var(--brand-primary)]' : 'w-1.5 bg-[var(--surface-subtle)]')
              }
            />
          ))}
        </div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">{t(current.title)}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{t(current.body)}</p>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={endTour}
            className="text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('Skip tour')}
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setTourStep(step - 1)}
                className="h-8 px-3 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors"
              >
                {t('Back')}
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={() => {
                  endTour();
                  if (config.finish.href) navigate(config.finish.href);
                }}
                className="h-8 px-3.5 rounded-md bg-[var(--brand-primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                {t(config.finish.label)}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTourStep(step + 1)}
                className="h-8 px-3.5 rounded-md bg-[var(--brand-primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                {t('Next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
