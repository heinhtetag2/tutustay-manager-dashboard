import { useTranslation } from 'react-i18next';
import { X, Clock, Zap, XCircle, AlertTriangle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';

export function QualityGuidelinesDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[var(--border-default)]">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border-default)] shrink-0">
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)]">
            {t('Quality Guidelines')}
          </DrawerTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Meta */}
        <div className="px-6 pt-5 pb-2 flex items-center gap-2 text-xs text-[var(--text-secondary)] shrink-0">
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>3 {t('min read')}</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span>{t('Updated Apr 22, 2026')}</span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <DrawerDescription className="sr-only">
            {t('How quality scores work and what raises or lowers them.')}
          </DrawerDescription>

          <div className="space-y-6 text-sm leading-relaxed text-[var(--text-tertiary)]">
            <p>
              {t("Every response you submit is scored from 0 to 100. That score decides whether you get paid instantly, wait 24 hours, or don't get paid. Here's what iDap looks for.")}
            </p>

            {/* Score bands */}
            <Section title={t('How your response is scored')}>
              <div className="space-y-2">
                <ScoreRow
                  Icon={Zap}
                  iconColor="text-[var(--success)]"
                  label={t('80 – 100')}
                  title={t('Paid instantly')}
                  description={t('Reward lands in your wallet in seconds.')}
                />
                <ScoreRow
                  Icon={Clock}
                  iconColor="text-[var(--warning)]"
                  label={t('50 – 79')}
                  title={t('Held for 24 hours')}
                  description={t('Released automatically after review.')}
                />
                <ScoreRow
                  Icon={XCircle}
                  iconColor="text-[var(--danger)]"
                  label={t('20 – 49')}
                  title={t('No reward')}
                  description={t('Response does not meet the quality bar.')}
                />
                <ScoreRow
                  Icon={AlertTriangle}
                  iconColor="text-[var(--danger)]"
                  label={t('0 – 19')}
                  title={t('Flagged')}
                  description={t('Repeated flags can lower your trust level.')}
                />
              </div>
            </Section>

            {/* What raises */}
            <Section title={t('What raises your score')}>
              <ul className="list-disc list-outside pl-5 space-y-2">
                <li>{t('Take enough time on each question — rushing is the biggest red flag.')}</li>
                <li>{t('Read the question, then answer what was actually asked.')}</li>
                <li>{t('Vary your scale answers honestly instead of picking the same number every time.')}</li>
                <li>{t('Write real, specific answers in open-text fields.')}</li>
              </ul>
            </Section>

            {/* What lowers */}
            <Section title={t('What lowers your score')}>
              <ul className="list-disc list-outside pl-5 space-y-2">
                <li>{t('Finishing much faster than the expected time.')}</li>
                <li>{t('Straight-lining — same option on every question.')}</li>
                <li>{t("Gibberish, emoji-only, or pasted text in open answers.")}</li>
                <li>{t('Contradicting your earlier answers.')}</li>
              </ul>
            </Section>

            {/* Tip */}
            <div className="bg-[var(--brand-tint)] rounded-md p-4 flex gap-3">
              <span className="text-[var(--brand-primary)] font-medium shrink-0">{t('Tip')}</span>
              <p className="text-[var(--text-tertiary)]">
                {t('One rejection does not drop your trust level. A thoughtful next response resets the pattern and keeps your level on track.')}
              </p>
            </div>

            <Section title={t('If you believe it was wrong')}>
              <p>
                {t('Contact support from your rejected response. If we made a mistake, we will re-review it within 7 days and release the reward.')}
              </p>
            </Section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">{title}</h3>
      {children}
    </section>
  );
}

function ScoreRow({
  Icon,
  iconColor,
  label,
  title,
  description,
}: {
  Icon: React.ElementType;
  iconColor: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0">
        <Icon className={cn('w-4 h-4', iconColor)} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
          <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">{label}</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
