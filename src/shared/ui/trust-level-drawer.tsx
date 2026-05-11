import { useTranslation } from 'react-i18next';
import { X, Check, Lock, Trophy } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';
import { TRUST_LEVELS, type TrustLevel } from '@/shared/config/business';

type UserTrustStats = {
  level: TrustLevel['level'];
  responsesCompleted: number;
  avgQuality: number;
};

export function TrustLevelDrawer({
  open,
  onOpenChange,
  stats,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: UserTrustStats;
}) {
  const { t } = useTranslation();
  const current = TRUST_LEVELS.find((l) => l.level === stats.level) ?? TRUST_LEVELS[0];
  const next = TRUST_LEVELS.find((l) => l.level === stats.level + 1);

  const progress = next
    ? {
        responsesPct: clamp(stats.responsesCompleted / next.minResponses),
        qualityPct: next.minAvgQuality
          ? clamp(stats.avgQuality / next.minAvgQuality)
          : 1,
      }
    : null;

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[#EBEBEB]">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#EBEBEB] shrink-0">
          <DrawerTitle className="text-base font-medium text-[#1A1A1A]">
            {t('Trust Level')}
          </DrawerTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-[#616161] hover:bg-[#F3F3F3] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DrawerDescription className="sr-only">
            {t('Your current trust level and what unlocks at higher levels.')}
          </DrawerDescription>

          {/* Current level card */}
          <div className="px-6 pt-6 pb-5">
            <div className="bg-[#F3F3F3] rounded-md p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-[#FF3C21]" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs text-[#616161] mb-0.5">{t('You are here')}</div>
                  <div className="text-base font-medium text-[#1A1A1A]">
                    L{current.level} · {current.label}
                  </div>
                </div>
              </div>

              {next ? (
                <div className="space-y-3">
                  <div className="text-xs text-[#616161]">
                    {t('Progress to')} L{next.level} · {next.label}
                  </div>
                  <ProgressItem
                    label={t('Completed responses')}
                    value={`${stats.responsesCompleted} / ${next.minResponses}`}
                    pct={progress?.responsesPct ?? 0}
                  />
                  {next.minAvgQuality !== null && (
                    <ProgressItem
                      label={t('Average quality')}
                      value={`${stats.avgQuality}% / ${next.minAvgQuality}%`}
                      pct={progress?.qualityPct ?? 0}
                    />
                  )}
                </div>
              ) : (
                <div className="text-xs text-[#616161]">
                  {t("You've reached the top level. Keep earning quality rewards.")}
                </div>
              )}
            </div>
          </div>

          {/* Ladder */}
          <div className="px-6 pb-6">
            <h3 className="text-[13px] font-medium text-[#1A1A1A] mb-3">
              {t('All levels')}
            </h3>
            <div className="space-y-2">
              {TRUST_LEVELS.map((lvl) => (
                <LevelRow
                  key={lvl.level}
                  lvl={lvl}
                  isCurrent={lvl.level === stats.level}
                  isUnlocked={lvl.level <= stats.level}
                />
              ))}
            </div>
          </div>

          {/* How to level up */}
          <div className="px-6 pb-6">
            <h3 className="text-[13px] font-medium text-[#1A1A1A] mb-3">
              {t('How to level up')}
            </h3>
            <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-[#4A4A4A] leading-relaxed">
              <li>
                {t('Complete more surveys — each quality response counts toward your total.')}
              </li>
              <li>
                {t("Keep your quality score high. Rushed or straight-lined responses pull your average down.")}
              </li>
              <li>
                {t('Your quality average is rolling — a single bad response does not reset it.')}
              </li>
            </ul>
          </div>

          {/* Benefits note */}
          <div className="px-6 pb-8">
            <div className="bg-[#FFF1EE] rounded-md p-4 flex gap-3">
              <span className="text-[#FF3C21] font-medium shrink-0">{t('Why it matters')}</span>
              <p className="text-sm text-[#4A4A4A]">
                {t('Higher trust levels unlock higher-paying surveys, faster payouts, and invite-only paid panels.')}
              </p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ProgressItem({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-[#4A4A4A]">{label}</span>
        <span className="font-medium text-[#1A1A1A] tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-white rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FF3C21] rounded-full transition-all"
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
    </div>
  );
}

function LevelRow({
  lvl,
  isCurrent,
  isUnlocked,
}: {
  lvl: TrustLevel;
  isCurrent: boolean;
  isUnlocked: boolean;
}) {
  const benefits: Record<TrustLevel['level'], string> = {
    1: 'Basic paid surveys',
    2: 'Rewards up to ₩15,000',
    3: 'Premium brand surveys · invite-only panels',
    4: 'Rewards up to ₩50,000 · same-day withdrawals',
    5: 'Partner-tier surveys · priority support',
  };
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md border transition-colors',
        isCurrent
          ? 'border-[#FFC1B5] bg-[#FFF1EE]'
          : 'border-[#EBEBEB] bg-white',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
          'bg-[#F3F3F3]',
        )}
      >
        {isUnlocked ? (
          <Check className="w-4 h-4 text-[#4A4A4A]" strokeWidth={1.75} />
        ) : (
          <Lock className="w-4 h-4 text-[#4A4A4A]" strokeWidth={1.75} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-[#1A1A1A]">
            L{lvl.level} · {lvl.label}
          </span>
          {isCurrent && (
            <span className="text-[10px] font-medium text-[#FF3C21] bg-white px-1.5 py-0.5 rounded-md">
              Current
            </span>
          )}
        </div>
        <div className="text-xs text-[#616161]">
          {lvl.minResponses === 0
            ? 'Starting level'
            : `${lvl.minResponses}+ responses${lvl.minAvgQuality ? ` · ${lvl.minAvgQuality}%+ quality` : ''}`}
        </div>
        <div className="text-xs text-[#4A4A4A] mt-1">{benefits[lvl.level]}</div>
      </div>
    </div>
  );
}

function clamp(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
