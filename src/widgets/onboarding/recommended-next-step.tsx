import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { NextStep } from './use-onboarding-progress';

/** The single highest-value action, shown as a hero CTA atop the checklist. */
export function RecommendedNextStep({ next }: { next: NextStep }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 rounded-lg bg-[var(--brand-primary)] px-4 py-3.5 text-white">
      <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-white/70 font-medium">
          {t('Recommended next step')}
        </div>
        <div className="text-sm font-medium leading-tight mt-0.5">{t(next.title)}</div>
        <div className="text-xs text-white/80 mt-0.5 leading-snug">{t(next.body)}</div>
      </div>
      <button
        type="button"
        onClick={() => navigate(next.href)}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-white px-3 h-9 text-sm font-medium text-[var(--brand-primary)] hover:bg-white/90 transition-colors"
      >
        {t(next.cta)}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
