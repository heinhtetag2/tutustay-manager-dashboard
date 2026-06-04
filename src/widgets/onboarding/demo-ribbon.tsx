import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical, X } from 'lucide-react';
import { useOnboarding } from './use-onboarding';

/** Slim, dismissible banner clarifying that everything on screen is sample data. */
export function DemoDataRibbon() {
  const { t } = useTranslation();
  const dismissed = useOnboarding((s) => s.ribbonDismissed);
  const dismissRibbon = useOnboarding((s) => s.dismissRibbon);

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 overflow-hidden border-b border-[var(--brand-border,var(--border-default))] bg-[var(--brand-tint)]"
        >
          <div className="flex items-center gap-2.5 px-4 md:px-6 py-2">
            <FlaskConical className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] leading-snug min-w-0">
              <span className="font-medium text-[var(--text-primary)]">
                {t('You’re viewing sample data.')}
              </span>{' '}
              {t('Numbers, guests, and bookings here are examples so you can explore freely.')}
            </p>
            <button
              type="button"
              onClick={dismissRibbon}
              aria-label={t('Dismiss')}
              className="ml-auto p-1 rounded-md text-[var(--text-tertiary)] hover:bg-white/60 hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
