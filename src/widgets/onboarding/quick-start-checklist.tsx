import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronRight, Rocket, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useOnboarding } from './use-onboarding';
import { useOnboardingProgress } from './use-onboarding-progress';
import { RecommendedNextStep } from './recommended-next-step';

/**
 * Persistent "Get started" launchpad pinned to the top of the Dashboard.
 * Surfaces the real setup steps + first actions, and the recommended next step.
 * Hidden once everything is complete; collapsible to a compact pill meanwhile.
 */
export function QuickStartChecklist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const collapsed = useOnboarding((s) => s.checklistCollapsed);
  const toggle = useOnboarding((s) => s.toggleChecklist);
  const { items, completed, total, allDone, nextStep } = useOnboardingProgress();

  // Once the user has finished everything, retire the launchpad.
  if (allDone) return null;

  return (
    <motion.div
      data-tour="quickstart"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 bg-white border border-[var(--border-default)] rounded-md overflow-hidden"
    >
      {/* Header */}
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--surface-muted)] transition-colors"
      >
        <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
          <Rocket className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[var(--text-primary)]">{t('Get started')}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {completed}/{total} {t('done')} · {t('Finish to go live and take bookings')}
          </div>
        </div>
        {/* progress bar */}
        <div className="hidden sm:block w-28 h-1.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden shrink-0">
          <div
            className="h-full bg-[var(--brand-primary)] rounded-full transition-all"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[var(--surface-subtle)]">
              <div className="pt-4">
                <RecommendedNextStep next={nextStep} />
              </div>

              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className="group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md hover:bg-[var(--surface-muted)] transition-colors text-left"
                    >
                      <span
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border',
                          item.done
                            ? 'bg-[var(--success)] border-[var(--success)] text-white'
                            : 'border-[var(--border-strong)] text-transparent',
                        )}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-sm',
                            item.done
                              ? 'text-[var(--text-tertiary)] line-through'
                              : 'text-[var(--text-primary)] font-medium',
                          )}
                        >
                          {t(item.title)}
                        </span>
                        {item.optional && (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
                            {t('Optional')}
                          </span>
                        )}
                        <span className="block text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug">
                          {t(item.desc)}
                        </span>
                      </span>
                      {!item.done && (
                        <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-[var(--text-tertiary)] px-2.5 leading-relaxed">
                {t('Finishing setup unlocks going live, taking bookings, and getting paid.')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
