import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Hand,
  LayoutDashboard,
  CalendarPlus,
  Wallet,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Portal } from '@/shared/ui/portal';
import { useOnboarding } from './use-onboarding';

interface Slide {
  Icon: LucideIcon;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    Icon: LayoutDashboard,
    title: 'Run your day from one screen',
    body: 'The Dashboard shows arrivals, revenue, and the requests waiting on you — your day at a glance.',
  },
  {
    Icon: CalendarPlus,
    title: 'How a booking flows',
    body: 'A guest sends a Booking Request → you Approve it → it becomes a Reservation → completed stays roll up into Settlements (your payouts).',
  },
  {
    Icon: Wallet,
    title: 'Set up once, then you’re live',
    body: 'Finish the quick property setup to go live, take real bookings, and get paid. The checklist is waiting on your dashboard.',
  },
];

/** First-run welcome + 3-slide product introduction. */
export function WelcomeModal() {
  const { t } = useTranslation();
  const welcomeOpen = useOnboarding((s) => s.welcomeOpen);
  const closeWelcome = useOnboarding((s) => s.closeWelcome);
  const startTour = useOnboarding((s) => s.startTour);
  // step 0 = welcome cover; 1..3 = intro slides
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!welcomeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWelcome();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [welcomeOpen, closeWelcome]);

  if (!welcomeOpen) return null;

  const isCover = step === 0;
  const slide = SLIDES[step - 1];
  const isLast = step === SLIDES.length;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          key="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[rgba(44,38,39,0.45)]"
          onClick={closeWelcome}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-xl shadow-[0_24px_64px_rgba(44,38,39,0.24)] overflow-hidden"
          >
            <button
              type="button"
              onClick={closeWelcome}
              aria-label={t('Close')}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-md text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-7 pt-8 pb-6">
              {/* Icon medallion */}
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center mb-5">
                {isCover ? (
                  <Hand className="w-6 h-6" strokeWidth={1.75} />
                ) : (
                  <slide.Icon className="w-6 h-6" strokeWidth={1.75} />
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  {isCover ? (
                    <>
                      <h2 className="text-2xl font-serif text-[var(--text-primary)]">
                        {t('Welcome to TutuStay')} 👋
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {t(
                          'Your command center for running the property — bookings, rooms, guests, and payouts, all in one place.',
                        )}
                      </p>
                      <div className="mt-4 flex items-start gap-2 rounded-md bg-[var(--surface-muted)] border border-[var(--border-default)] px-3 py-2.5">
                        <Sparkles className="w-4 h-4 text-[var(--brand-primary)] mt-0.5 shrink-0" />
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {t(
                            'You’re exploring with sample data, so feel free to click around — nothing here is real yet.',
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-serif text-[var(--text-primary)]">{t(slide.title)}</h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                        {t(slide.body)}
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-7 pb-7 pt-1">
              {/* progress dots (intro slides only) */}
              {!isCover && (
                <div className="flex items-center gap-1.5 mb-5">
                  {SLIDES.map((_, i) => (
                    <span
                      key={i}
                      className={
                        'h-1.5 rounded-full transition-all ' +
                        (i === step - 1
                          ? 'w-5 bg-[var(--brand-primary)]'
                          : 'w-1.5 bg-[var(--surface-subtle)]')
                      }
                    />
                  ))}
                </div>
              )}

              {isCover ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {t('Take the 60-second tour')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeWelcome}
                    className="w-full h-10 inline-flex items-center justify-center rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    {t('Skip — I’ll explore')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-1"
                  >
                    {t('Back')}
                  </button>
                  {isLast ? (
                    <button
                      type="button"
                      onClick={startTour}
                      className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      {t('Show me around')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
                      className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      {t('Next')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}
