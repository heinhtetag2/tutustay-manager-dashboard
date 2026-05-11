import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams, Navigate } from 'react-router';
import { motion } from 'motion/react';
import { QualityGuidelinesDrawer } from '@/shared/ui/quality-guidelines-drawer';
import { CompanyInfoDrawer } from '@/shared/ui/company-info-drawer';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  Users,
  HelpCircle,
  Wallet,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import {
  DEMO_FEED_SURVEYS,
  USER_TRUST_LEVEL,
  totalQuestions,
} from '@/pages/survey-feed/survey-feed-data';
import {
  DEMO_FILLED_SURVEYS,
  type FilledSurvey,
} from '@/pages/my-surveys/my-surveys-data';

function formatMnt(value: number): string {
  return `₩${value.toLocaleString('en-US')}`;
}

export default function SurveyTake() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  // History view when navigating in from /my-surveys/:id — id is the FilledSurvey id.
  // Feed view otherwise — id is the FeedSurvey id.
  const isHistoryView = location.pathname.startsWith('/my-surveys/');

  const filled = useMemo(
    () =>
      isHistoryView
        ? DEMO_FILLED_SURVEYS.find((s) => s.id === id)
        : undefined,
    [id, isHistoryView],
  );

  const survey = useMemo(() => {
    if (isHistoryView) {
      if (!filled) return undefined;
      return DEMO_FEED_SURVEYS.find((s) => s.id === filled.surveyId);
    }
    return DEMO_FEED_SURVEYS.find((s) => s.id === id);
  }, [id, isHistoryView, filled]);

  if (!survey) {
    return <Navigate to={isHistoryView ? '/my-surveys' : '/survey-feed'} replace />;
  }

  const alreadyFilled = isHistoryView && !!filled;
  const locked = !alreadyFilled && survey.requiredTrustLevel > USER_TRUST_LEVEL;
  const questionCount = totalQuestions(survey);

  const stats = alreadyFilled && filled
    ? [
        {
          Icon: Wallet,
          label:
            filled.status === 'paid' || filled.status === 'held'
              ? t('Reward earned')
              : t('Reward pending'),
          value: formatMnt(filled.rewardMnt),
          accent: filled.status !== 'rejected',
          muted: filled.status === 'rejected',
        },
        {
          Icon: CheckCircle2,
          label: t('Quality score'),
          value:
            filled.status === 'under-review' ? '—' : `${filled.qualityScore}%`,
        },
        {
          Icon: Clock,
          label: t('Submitted'),
          value: format(new Date(filled.completedAt), 'MMM d, yyyy'),
        },
        {
          Icon: HelpCircle,
          label: t('Questions'),
          value: String(questionCount),
        },
      ]
    : [
        {
          Icon: Wallet,
          label: t('Reward'),
          value: formatMnt(survey.rewardMnt),
          accent: true,
          muted: false,
        },
        {
          Icon: Clock,
          label: t('Est. Time'),
          value: `${survey.durationMin} ${t('min')}`,
        },
        {
          Icon: Users,
          label: t('Spots left'),
          value: String(survey.spotsLeft),
        },
        {
          Icon: HelpCircle,
          label: t('Questions'),
          value: String(questionCount),
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[#FAFAFA]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(alreadyFilled ? '/my-surveys' : '/survey-feed')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {alreadyFilled ? t('Back to My Surveys') : t('Back')}
        </button>

        {/* Header card */}
        <div className="bg-white border border-[#EBEBEB] rounded-md p-6 mb-4">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setCompanyOpen(true)}
                className="w-12 h-12 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#4A4A4A] text-sm font-medium shrink-0 hover:bg-[#EBEBEB] transition-colors cursor-pointer"
                aria-label={t('About this company')}
              >
                {survey.companyInitials}
              </button>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setCompanyOpen(true)}
                  className="inline-flex items-center gap-0.5 text-sm text-[#616161] hover:text-[#FF3C21] transition-colors cursor-pointer mb-1"
                >
                  <span>{survey.companyName}</span>
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
                <h1 className="text-2xl font-serif text-[#1A1A1A] leading-tight">
                  {survey.title}
                </h1>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#4A4A4A] leading-relaxed mb-5">
            {survey.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex text-xs font-medium text-[#4A4A4A] bg-[#F3F3F3] px-2 py-0.5 rounded-md">
              {survey.category}
            </span>
            {alreadyFilled && filled ? (
              <StatusPill status={filled.status} />
            ) : (
              <span
                className={cn(
                  'inline-flex text-xs font-medium px-2 py-0.5 rounded-md tabular-nums',
                  survey.matchPercent >= 90
                    ? 'text-[#047857] bg-[#ECFDF5]'
                    : survey.matchPercent >= 75
                      ? 'text-[#B45309] bg-[#FFFBEB]'
                      : 'text-[#4A4A4A] bg-[#F3F3F3]',
                )}
              >
                {survey.matchPercent}% {t('match')}
              </span>
            )}
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-[#EBEBEB] rounded-md p-4"
            >
              <div className="flex items-center gap-1.5 text-xs text-[#616161] mb-2">
                <s.Icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <div
                className={cn(
                  'text-lg font-medium tabular-nums lining-nums',
                  s.muted
                    ? 'text-[#8A8A8A] line-through'
                    : s.accent
                      ? 'text-[#FF3C21]'
                      : 'text-[#1A1A1A]',
                )}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Question breakdown — hidden on history view (user already completed) */}
        {!alreadyFilled && (
          <div className="bg-white border border-[#EBEBEB] rounded-md overflow-hidden mb-6">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-medium text-[#1A1A1A]">
                {t('Question Breakdown')}
              </h2>
              <p className="text-xs text-[#616161] mt-0.5">
                {questionCount} {t('questions in total')}
              </p>
            </div>
            <ul className="divide-y divide-[#F3F3F3] border-t border-[#F3F3F3]">
              {survey.breakdown.map((b) => (
                <li
                  key={b.type}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span className="text-sm text-[#4A4A4A]">{t(b.type)}</span>
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-md bg-[#F3F3F3] text-xs font-medium text-[#1A1A1A] tabular-nums">
                    {b.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA / Completion summary */}
        {alreadyFilled && filled ? (
          <CompletionBanner
            filled={filled}
            onViewWallet={() => navigate('/wallet')}
            onViewGuidelines={() => setGuidelinesOpen(true)}
          />
        ) : locked ? (
          <div className="bg-white border border-[#EBEBEB] rounded-md p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#4A4A4A]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#1A1A1A]">
                {t('Trust Level')} {survey.requiredTrustLevel} {t('required')}
              </div>
              <div className="text-xs text-[#616161] mt-0.5">
                {t('Complete more surveys to unlock this one.')}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(`/survey-feed/${survey.id}/play`)}
            className="w-full h-12 inline-flex items-center justify-center gap-2 bg-[#FF3C21] hover:bg-[#E63419] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
          >
            {t('Start Survey')}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <QualityGuidelinesDrawer open={guidelinesOpen} onOpenChange={setGuidelinesOpen} />
      <CompanyInfoDrawer
        open={companyOpen}
        onOpenChange={setCompanyOpen}
        companyName={survey.companyName}
      />
    </motion.div>
  );
}

function StatusPill({ status }: { status: FilledSurvey['status'] }) {
  const { t } = useTranslation();
  const map = {
    paid: { tone: 'text-[#047857] bg-[#ECFDF5]', label: t('Paid') },
    held: { tone: 'text-[#B45309] bg-[#FFFBEB]', label: t('Held 24h') },
    'under-review': {
      tone: 'text-[#1D4ED8] bg-[#EFF6FF]',
      label: t('Under review'),
    },
    rejected: { tone: 'text-[#B91C1C] bg-[#FEF2F2]', label: t('Rejected') },
  } as const;
  const v = map[status];
  return (
    <span
      className={cn(
        'inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-md',
        v.tone,
      )}
    >
      {v.label}
    </span>
  );
}

function CompletionBanner({
  filled,
  onViewWallet,
  onViewGuidelines,
}: {
  filled: FilledSurvey;
  onViewWallet: () => void;
  onViewGuidelines: () => void;
}) {
  const { t } = useTranslation();

  const completedAt = new Date(filled.completedAt);
  // 24h hold release window
  const releaseAt = new Date(completedAt.getTime() + 24 * 60 * 60 * 1000);
  // Estimate review window: 48h after submission
  const reviewByAt = new Date(completedAt.getTime() + 48 * 60 * 60 * 1000);

  const meta = (() => {
    switch (filled.status) {
      case 'paid':
        return {
          title: t('Submitted and paid'),
          pillTone: 'text-[#047857] bg-[#ECFDF5]',
          pillLabel: t('Paid'),
          amountTone: 'text-[#FF3C21]',
          rewardLabel: t('Reward paid'),
          ctaLabel: t('View wallet'),
          ctaAction: 'wallet' as const,
        };
      case 'held':
        return {
          title: t('Reward on 24-hour hold'),
          pillTone: 'text-[#B45309] bg-[#FFFBEB]',
          pillLabel: t('Held 24h'),
          amountTone: 'text-[#FF3C21]',
          rewardLabel: t('Reward (pending release)'),
          ctaLabel: t('View wallet'),
          ctaAction: 'wallet' as const,
        };
      case 'under-review':
        return {
          title: t('Response under review'),
          pillTone: 'text-[#1D4ED8] bg-[#EFF6FF]',
          pillLabel: t('Under review'),
          amountTone: 'text-[#4A4A4A]',
          rewardLabel: t('Pending reward'),
          ctaLabel: null,
          ctaAction: 'none' as const,
        };
      case 'rejected':
        return {
          title: t('Response rejected'),
          pillTone: 'text-[#B91C1C] bg-[#FEF2F2]',
          pillLabel: t('Rejected'),
          amountTone: 'text-[#8A8A8A] line-through',
          rewardLabel: t('Reward (not paid)'),
          ctaLabel: t('Read quality guidelines'),
          ctaAction: 'guidelines' as const,
        };
    }
  })();

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-md overflow-hidden">
      {/* Header — title + timestamp */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-base font-medium text-[#1A1A1A]">
          {meta.title}
        </h2>
        <p className="text-xs text-[#616161] mt-0.5 tabular-nums">
          {t('Submitted')}{' '}
          {format(completedAt, "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      {/* Itemized receipt rows */}
      <dl className="border-t border-[#F3F3F3] divide-y divide-[#F3F3F3]">
        <ReceiptRow label={meta.rewardLabel}>
          <span
            className={cn(
              'font-serif font-medium text-lg tabular-nums lining-nums',
              meta.amountTone,
            )}
          >
            {formatMnt(filled.rewardMnt)}
          </span>
        </ReceiptRow>

        {filled.status !== 'under-review' && (
          <ReceiptRow label={t('Quality score')}>
            <QualityValue
              score={filled.qualityScore}
              status={filled.status}
            />
          </ReceiptRow>
        )}

        <ReceiptRow label={t('Status')}>
          <span
            className={cn(
              'inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-md',
              meta.pillTone,
            )}
          >
            {meta.pillLabel}
          </span>
        </ReceiptRow>

        {/* Status-specific extra rows */}
        {filled.status === 'paid' && (
          <>
            <ReceiptRow label={t('Paid on')}>
              <span className="text-[#1A1A1A] font-medium tabular-nums lining-nums">
                {format(completedAt, 'MMM d, yyyy')}
              </span>
            </ReceiptRow>
            <ReceiptRow label={t('Deposit to')}>
              <span className="text-[#1A1A1A] font-medium">
                {t('Linked wallet')}
              </span>
            </ReceiptRow>
          </>
        )}

        {filled.status === 'held' && (
          <>
            <ReceiptRow label={t('Releases')}>
              <span className="text-[#B45309] font-medium tabular-nums lining-nums">
                {format(releaseAt, "MMM d 'at' h:mm a")}
              </span>
            </ReceiptRow>
            <ReceiptRow label={t('Deposit to')}>
              <span className="text-[#1A1A1A] font-medium">
                {t('Linked wallet')}
              </span>
            </ReceiptRow>
          </>
        )}

        {filled.status === 'under-review' && (
          <ReceiptRow label={t('Reviewed by')}>
            <span className="text-[#1D4ED8] font-medium tabular-nums lining-nums">
              {format(reviewByAt, "MMM d 'at' h:mm a")}
            </span>
          </ReceiptRow>
        )}

        {filled.status === 'rejected' && (
          <ReceiptRow label={t('Reason')}>
            <span className="text-[#B91C1C] font-medium text-right">
              {t('Quality below threshold')}
            </span>
          </ReceiptRow>
        )}
      </dl>

      {/* Status-specific helper text */}
      {filled.status === 'under-review' && (
        <div className="border-t border-[#F3F3F3] px-5 py-3 text-xs text-[#616161] leading-relaxed">
          {t("We'll notify you as soon as the review completes. No action needed from you.")}
        </div>
      )}
      {filled.status === 'rejected' && (
        <div className="border-t border-[#F3F3F3] px-5 py-3 text-xs text-[#616161] leading-relaxed">
          {t('This response was flagged during review and is not eligible for a reward.')}
        </div>
      )}

      {/* Footer CTA */}
      {meta.ctaAction !== 'none' && (
        <div className="border-t border-[#F3F3F3] p-3">
          {meta.ctaAction === 'wallet' && (
            <button
              onClick={onViewWallet}
              className="w-full h-10 inline-flex items-center justify-center gap-2 bg-[#FF3C21] hover:bg-[#E63419] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
            >
              {meta.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {meta.ctaAction === 'guidelines' && (
            <button
              type="button"
              onClick={onViewGuidelines}
              className="w-full h-10 inline-flex items-center justify-center gap-2 border border-[#EBEBEB] text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] text-sm font-medium rounded-md transition-colors cursor-pointer"
            >
              {meta.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function QualityValue({
  score,
  status,
}: {
  score: number;
  status: FilledSurvey['status'];
}) {
  const tone =
    status === 'rejected'
      ? 'text-[#B91C1C]'
      : score >= 90
        ? 'text-[#047857]'
        : score >= 75
          ? 'text-[#1A1A1A]'
          : 'text-[#B45309]';
  return (
    <span className={cn('font-medium tabular-nums lining-nums', tone)}>
      {score}%
    </span>
  );
}

function ReceiptRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-xs text-[#616161]">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
