import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Clock,
  Users,
  ListChecks,
  ArrowUpDown,
  Lock,
  Search,
  Trophy,
} from 'lucide-react';
import { BrandSelect } from '@/shared/ui/brand-select';
import { TrustLevelDrawer } from '@/shared/ui/trust-level-drawer';
import { cn } from '@/shared/lib/cn';
import {
  DEMO_FEED_SURVEYS,
  USER_TRUST_LEVEL,
  type FeedSurvey,
  type SurveyCategory,
} from './survey-feed-data';
import { DEMO_FILLED_SURVEYS } from '@/pages/my-surveys/my-surveys-data';

type CategoryFilter = 'all' | SurveyCategory;
type SortKey = 'recommended' | 'reward' | 'duration' | 'newest';

function formatMnt(value: number): string {
  return `${value.toLocaleString('en-US')}`;
}

function matchTone(percent: number): string {
  if (percent >= 90) return 'text-[var(--success)] bg-[var(--success-tint)]';
  if (percent >= 75) return 'text-[var(--warning)] bg-[var(--warning-tint)]';
  return 'text-[var(--text-tertiary)] bg-[var(--surface-subtle)]';
}

function spotsTone(left: number, total: number): {
  bar: string;
  label: string;
} {
  const ratio = left / total;
  if (ratio <= 0.15) return { bar: 'bg-[var(--danger)]', label: 'text-[var(--danger)]' };
  if (ratio <= 0.5) return { bar: 'bg-[var(--brand-primary)]', label: 'text-[var(--brand-primary)]' };
  return { bar: 'bg-[var(--success)]', label: 'text-[var(--success)]' };
}

export default function SurveyFeed() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [query, setQuery] = useState('');
  const [trustOpen, setTrustOpen] = useState(false);

  const trustStats = useMemo(() => {
    const completed = DEMO_FILLED_SURVEYS.filter((s) => s.status !== 'rejected');
    const avgQuality = completed.length
      ? Math.round(
          completed.reduce((sum, s) => sum + s.qualityScore, 0) / completed.length,
        )
      : 0;
    return {
      level: USER_TRUST_LEVEL as 1 | 2 | 3 | 4 | 5,
      responsesCompleted: completed.length,
      avgQuality,
    };
  }, []);

  const filtered = useMemo(() => {
    let list = DEMO_FEED_SURVEYS.slice();
    if (category !== 'all') list = list.filter((s) => s.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case 'reward':
        list.sort((a, b) => b.rewardMnt - a.rewardMnt);
        break;
      case 'duration':
        list.sort((a, b) => a.durationMin - b.durationMin);
        break;
      case 'newest':
        list.sort((a, b) => (a.id < b.id ? 1 : -1));
        break;
      case 'recommended':
      default:
        list.sort((a, b) => b.matchPercent - a.matchPercent);
    }
    return list;
  }, [category, sort, query]);

  const availableCount = filtered.filter(
    (s) => s.requiredTrustLevel <= USER_TRUST_LEVEL,
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)]">
            {t('Survey Feed')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('Surveys matched to your profile. Complete them to earn rewards and level up your trust.')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setTrustOpen(true)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-white border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--brand-border)] transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-[var(--brand-primary)]" strokeWidth={1.75} />
            {t('Trust Lv.')} {USER_TRUST_LEVEL}
          </button>
          <span className="text-xs text-[var(--text-secondary)] tabular-nums leading-7">
            {availableCount} {t('of')} {filtered.length} {t('available')}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search surveys or companies...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={category}
            onValueChange={(v) => setCategory(v as CategoryFilter)}
            leftIcon={<ListChecks />}
            ariaLabel={t('Category')}
            className="sm:w-auto"
            options={[
              { value: 'all', label: t('All Categories') },
              { value: 'Social', label: t('Social') },
              { value: 'Product', label: t('Product') },
              { value: 'HR', label: t('HR') },
              { value: 'Brand', label: t('Brand') },
              { value: 'Finance', label: t('Finance') },
              { value: 'Other', label: t('Other') },
            ]}
          />
          <BrandSelect
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
            leftIcon={<ArrowUpDown />}
            ariaLabel={t('Sort')}
            className="sm:w-auto"
            options={[
              { value: 'recommended', label: t('Recommended') },
              { value: 'reward', label: t('Highest reward') },
              { value: 'duration', label: t('Shortest') },
              { value: 'newest', label: t('Newest') },
            ]}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[var(--border-default)] rounded-md py-16 text-center">
          <p className="text-sm text-[var(--text-secondary)]">{t('No surveys match your filters.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((survey, i) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              delay={Math.min(i, 8) * 0.04}
              onOpen={() => navigate(`/survey-feed/${survey.id}`)}
            />
          ))}
        </div>
      )}

      <TrustLevelDrawer open={trustOpen} onOpenChange={setTrustOpen} stats={trustStats} />
    </motion.div>
  );
}

function SurveyCard({
  survey,
  delay,
  onOpen,
}: {
  survey: FeedSurvey;
  delay: number;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const locked = survey.requiredTrustLevel > USER_TRUST_LEVEL;
  const spots = spotsTone(survey.spotsLeft, survey.spotsTotal);
  const filledRatio = Math.max(
    0,
    Math.min(1, 1 - survey.spotsLeft / survey.spotsTotal),
  );

  return (
    <motion.button
      type="button"
      onClick={locked ? undefined : onOpen}
      disabled={locked}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'relative text-left bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col transition-colors',
        locked
          ? 'cursor-not-allowed'
          : 'hover:border-[var(--brand-border)] cursor-pointer',
      )}
    >
      <div className={cn('flex flex-col gap-4', locked && 'opacity-30')}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] text-[11px] font-medium shrink-0">
              {survey.companyInitials}
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {survey.companyName}
            </span>
          </div>
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-md tabular-nums shrink-0',
              matchTone(survey.matchPercent),
            )}
          >
            {survey.matchPercent}%
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-[var(--text-primary)] leading-snug">
          {survey.title}
        </h3>

        {/* Reward + duration */}
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-[var(--brand-primary)] tabular-nums">
            {formatMnt(survey.rewardMnt)}
          </span>
          <span className="flex items-center gap-1 text-[var(--text-secondary)] tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            {survey.durationMin} {t('min')}
          </span>
        </div>

        {/* Spots left */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
              <Users className="w-3.5 h-3.5" />
              {t('Spots left')}
            </span>
            <span className={cn('font-medium tabular-nums', spots.label)}>
              {survey.spotsLeft}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', spots.bar)}
              style={{ width: `${filledRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Category tag */}
        <div>
          <span className="inline-flex text-xs font-medium text-[var(--text-tertiary)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-md">
            {survey.category}
          </span>
        </div>
      </div>

      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-white/70 backdrop-blur-[1px] px-6 text-center">
          <div className="w-9 h-9 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {t('Trust Level')} {survey.requiredTrustLevel} {t('required')}
          </div>
          <div className="text-xs text-[var(--text-secondary)] leading-snug max-w-[240px]">
            {t('Complete more surveys to increase your trust level')}
          </div>
        </div>
      )}
    </motion.button>
  );
}
