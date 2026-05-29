import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Search,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock,
  ArrowUpDown,
  CheckCircle,
} from 'lucide-react';
import {
  format,
  isToday,
  isYesterday,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isSameMonth,
  startOfDay,
} from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  DEMO_FILLED_SURVEYS,
  type FilledSurvey,
  type FilledStatus,
} from './my-surveys-data';

type StatusFilter = 'all' | FilledStatus;
type SortKey = 'newest' | 'oldest' | 'reward-high' | 'reward-low';

function formatMnt(v: number): string {
  return `₩${v.toLocaleString('en-US')}`;
}

function formatMntCompact(v: number): string {
  if (v >= 1_000_000) return `₩${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₩${Math.round(v / 1_000)}K`;
  return `₩${v}`;
}

// Human-friendly timestamp. Recent items get relative ("3h ago"),
// older items get absolute dates for scan-ability.
function formatRelativeTime(date: Date, now: Date): string {
  if (isToday(date)) {
    const mins = differenceInMinutes(now, date);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = differenceInHours(now, date);
    return `${hrs}h ago`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  const daysAgo = differenceInDays(startOfDay(now), startOfDay(date));
  if (daysAgo < 7) {
    return `${daysAgo}d ago`;
  }
  return format(date, 'MMM d, yyyy');
}

interface TimeBucket {
  key: string;
  label: string;
  order: number;
}

function getBucket(date: Date, now: Date): TimeBucket {
  if (isToday(date)) return { key: 'today', label: 'Today', order: 0 };
  if (isYesterday(date)) return { key: 'yesterday', label: 'Yesterday', order: 1 };
  const daysAgo = differenceInDays(startOfDay(now), startOfDay(date));
  if (daysAgo < 7) return { key: 'this-week', label: 'This week', order: 2 };
  if (isSameMonth(date, now))
    return { key: 'this-month', label: 'Earlier this month', order: 3 };
  const yearMonth = format(date, 'yyyy-MM');
  const asDate = new Date(date.getFullYear(), date.getMonth(), 1);
  // Larger order = older bucket; subtract epoch ms so ordering is monotonic
  const order = 4 + (Date.now() - asDate.getTime()) / 86_400_000;
  return {
    key: yearMonth,
    label: format(date, 'MMMM yyyy'),
    order,
  };
}

export default function MySurveys() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    let list = DEMO_FILLED_SURVEYS.slice();
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case 'oldest':
        list.sort(
          (a, b) =>
            new Date(a.completedAt).getTime() -
            new Date(b.completedAt).getTime(),
        );
        break;
      case 'reward-high':
        list.sort((a, b) => b.rewardMnt - a.rewardMnt);
        break;
      case 'reward-low':
        list.sort((a, b) => a.rewardMnt - b.rewardMnt);
        break;
      case 'newest':
      default:
        list.sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
        );
    }
    return list;
  }, [query, statusFilter, sort]);

  const stats = useMemo(() => {
    const completed = DEMO_FILLED_SURVEYS.filter(
      (s) => s.status === 'paid' || s.status === 'held',
    ).length;
    const lifetimeEarned = DEMO_FILLED_SURVEYS.filter(
      (s) => s.status === 'paid',
    ).reduce((sum, s) => sum + s.rewardMnt, 0);
    const pendingItems = DEMO_FILLED_SURVEYS.filter(
      (s) => s.status === 'held' || s.status === 'under-review',
    );
    const pendingRewards = pendingItems.reduce(
      (sum, s) => sum + s.rewardMnt,
      0,
    );
    const qualityScores = DEMO_FILLED_SURVEYS.filter(
      (s) => s.qualityScore > 0,
    ).map((s) => s.qualityScore);
    const avgQuality =
      qualityScores.length === 0
        ? 0
        : Math.round(
            qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length,
          );
    const accepted = DEMO_FILLED_SURVEYS.filter(
      (s) => s.status !== 'rejected' && s.status !== 'under-review',
    ).length;
    const reviewed = DEMO_FILLED_SURVEYS.filter(
      (s) => s.status !== 'under-review',
    ).length;
    const acceptanceRate =
      reviewed === 0 ? 0 : Math.round((accepted / reviewed) * 100);
    return {
      completed,
      lifetimeEarned,
      avgQuality,
      acceptanceRate,
      pendingRewards,
      pendingCount: pendingItems.length,
    };
  }, []);

  const statCards = [
    {
      title: 'Surveys completed',
      value: String(stats.completed),
      Icon: ClipboardCheck,
      subtitle: t('Total responses submitted'),
      accent: false,
    },
    {
      title: 'Pending rewards',
      value: formatMntCompact(stats.pendingRewards),
      Icon: Clock,
      subtitle:
        stats.pendingCount > 0
          ? `${stats.pendingCount} ${t('awaiting payout')}`
          : t('None in flight'),
      accent: stats.pendingRewards > 0,
    },
    {
      title: 'Lifetime earned',
      value: formatMntCompact(stats.lifetimeEarned),
      Icon: Sparkles,
      subtitle: t('Paid rewards'),
      accent: false,
    },
    {
      title: 'Avg. quality',
      value: `${stats.avgQuality}%`,
      Icon: TrendingUp,
      subtitle: `${stats.acceptanceRate}% ${t('acceptance rate')}`,
      accent: false,
    },
  ];

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
            {t('My Surveys')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t("Everything you've filled — including what's paid, pending review, and in progress.")}
          </p>
        </div>
        <button
          onClick={() => navigate('/survey-feed')}
          className="h-10 px-4 inline-flex items-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
        >
          {t('Find more surveys')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {t(card.title)}
              </span>
              <div
                className={cn(
                  'p-2 rounded-md transition-colors',
                  card.accent
                    ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white',
                )}
              >
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div
              className={cn(
                'text-2xl font-medium tabular-nums lining-nums',
                card.accent ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]',
              )}
            >
              {card.value}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </motion.div>
        ))}
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
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<CheckCircle />}
            ariaLabel={t('Status')}
            className="sm:w-auto"
            options={[
              { value: 'all', label: t('All statuses') },
              { value: 'paid', label: t('Paid') },
              { value: 'held', label: t('Held 24h') },
              { value: 'under-review', label: t('Under review') },
              { value: 'rejected', label: t('Rejected') },
            ]}
          />
          <BrandSelect
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
            leftIcon={<ArrowUpDown />}
            ariaLabel={t('Sort')}
            className="sm:w-auto"
            options={[
              { value: 'newest', label: t('Newest first') },
              { value: 'oldest', label: t('Oldest first') },
              { value: 'reward-high', label: t('Highest reward') },
              { value: 'reward-low', label: t('Lowest reward') },
            ]}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[var(--border-default)] rounded-md py-16 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {t('No surveys match your filters.')}
          </p>
        </div>
      ) : sort === 'newest' || sort === 'oldest' ? (
        <GroupedList
          items={filtered}
          onOpen={(filledId) => navigate(`/my-surveys/${filledId}`)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden"
        >
          <ol className="divide-y divide-[var(--surface-subtle)]">
            {filtered.map((s) => (
              <FilledRow
                key={s.id}
                survey={s}
                onOpen={() => navigate(`/my-surveys/${s.id}`)}
              />
            ))}
          </ol>
        </motion.div>
      )}
    </motion.div>
  );
}

function FilledRow({
  survey,
  onOpen,
}: {
  survey: FilledSurvey;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const incoming = survey.status !== 'rejected';

  const statusPill = (() => {
    switch (survey.status) {
      case 'paid':
        return { tone: 'text-[var(--success)] bg-[var(--success-tint)]', label: t('Paid') };
      case 'held':
        return { tone: 'text-[var(--warning)] bg-[var(--warning-tint)]', label: t('Held 24h') };
      case 'under-review':
        return {
          tone: 'text-[var(--brand-primary-hover)] bg-[var(--brand-tint)]',
          label: t('Under review'),
        };
      case 'rejected':
        return { tone: 'text-[var(--danger)] bg-[var(--danger-tint)]', label: t('Rejected') };
    }
  })();

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group"
      >
        {/* Company avatar */}
        <div className="w-10 h-10 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] text-xs font-medium shrink-0">
          {survey.companyInitials}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {survey.title}
            </span>
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap',
                statusPill.tone,
              )}
            >
              {statusPill.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] tabular-nums flex-wrap">
            <span>{survey.companyName}</span>
            <span className="text-[var(--border-strong)]">·</span>
            <span>{survey.category}</span>
            <span className="text-[var(--border-strong)]">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {survey.durationMin} {t('min')}
            </span>
            <span className="text-[var(--border-strong)]">·</span>
            <span>{formatRelativeTime(new Date(survey.completedAt), new Date())}</span>
          </div>
        </div>

        {/* Reward + quality */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div
              className={cn(
                'text-sm font-medium tabular-nums lining-nums',
                incoming ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)] line-through',
              )}
            >
              {formatMnt(survey.rewardMnt)}
            </div>
            {survey.status === 'paid' || survey.status === 'held' ? (
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 tabular-nums">
                {t('Quality')} {survey.qualityScore}%
              </div>
            ) : survey.status === 'under-review' ? (
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {t('Reviewing')}
              </div>
            ) : (
              <div className="text-[11px] text-[var(--danger)] mt-0.5 tabular-nums">
                {t('Quality')} {survey.qualityScore}%
              </div>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors" />
        </div>
      </button>
    </li>
  );
}

function GroupedList({
  items,
  onOpen,
}: {
  items: FilledSurvey[];
  onOpen: (filledId: string) => void;
}) {
  const now = new Date();

  // Build ordered list of bucket groups based on the input sort order.
  const groups: { bucket: TimeBucket; items: FilledSurvey[] }[] = [];
  const seen = new Map<string, number>();
  for (const it of items) {
    const bucket = getBucket(new Date(it.completedAt), now);
    const idx = seen.get(bucket.key);
    if (idx === undefined) {
      seen.set(bucket.key, groups.length);
      groups.push({ bucket, items: [it] });
    } else {
      groups[idx].items.push(it);
    }
  }

  return (
    <div className="space-y-5">
      {groups.map(({ bucket, items }, i) => (
        <motion.div
          key={bucket.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i, 4) * 0.04 }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              {bucket.label}
            </span>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {items.length}
            </span>
          </div>
          <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
            <ol className="divide-y divide-[var(--surface-subtle)]">
              {items.map((s) => (
                <FilledRow
                  key={s.id}
                  survey={s}
                  onOpen={() => onOpen(s.id)}
                />
              ))}
            </ol>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
