import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
  ArrowRight,
  ClipboardCheck,
  Trophy,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import {
  format,
  differenceInDays,
  startOfDay,
  startOfMonth,
  isWithinInterval,
  subDays,
  subMonths,
  isSameMonth,
} from 'date-fns';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/shared/lib/cn';
import { DEMO_FILLED_SURVEYS } from '@/pages/my-surveys/my-surveys-data';
import {
  DEMO_FEED_SURVEYS,
  USER_TRUST_LEVEL,
} from '@/pages/survey-feed/survey-feed-data';
import { DEMO_WALLET } from '@/pages/wallet/wallet-data';
import { TRUST_LEVELS } from '@/shared/config/business';

type RangeKey = '7d' | '30d' | 'this_month' | 'last_month';

function formatMnt(value: number): string {
  return `₩${value.toLocaleString('en-US')}`;
}

function formatMntCompact(value: number): string {
  if (value >= 1_000_000) return `₩${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₩${Math.round(value / 1_000)}K`;
  return `₩${value}`;
}

const USER_FIRST_NAME = 'Hein';
const NOW = new Date('2026-04-22T10:00:00');

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [range, setRange] = useState<RangeKey>('30d');

  // ── Stats ─────────────────────────────────────────────────────────────
  const thisMonthEarned = useMemo(() => {
    return DEMO_FILLED_SURVEYS.filter(
      (s) =>
        s.status === 'paid' &&
        isSameMonth(new Date(s.completedAt), NOW),
    ).reduce((sum, s) => sum + s.rewardMnt, 0);
  }, []);

  const completedCount = DEMO_FILLED_SURVEYS.filter(
    (s) => s.status === 'paid' || s.status === 'held',
  ).length;

  const pendingRewards = DEMO_FILLED_SURVEYS.filter(
    (s) => s.status === 'held' || s.status === 'under-review',
  ).reduce((sum, s) => sum + s.rewardMnt, 0);

  const currentLevel = [...TRUST_LEVELS]
    .reverse()
    .find((l) => l.minResponses <= completedCount);
  const nextLevel = TRUST_LEVELS.find((l) => l.level === (currentLevel?.level ?? 1) + 1);
  const levelProgress = nextLevel
    ? Math.min(
        100,
        ((completedCount - (currentLevel?.minResponses ?? 0)) /
          (nextLevel.minResponses - (currentLevel?.minResponses ?? 0))) *
          100,
      )
    : 100;

  const stats = [
    {
      title: 'Wallet balance',
      value: formatMntCompact(DEMO_WALLET.availableMnt),
      Icon: Wallet,
      subtitle: pendingRewards > 0
        ? `${formatMntCompact(pendingRewards)} ${t('pending')}`
        : t('Available to withdraw'),
      href: '/wallet',
      accent: true,
    },
    {
      title: 'This month',
      value: formatMntCompact(thisMonthEarned),
      Icon: Coins,
      subtitle: t('Earned in April'),
      href: '/my-surveys',
    },
    {
      title: 'Surveys completed',
      value: String(completedCount),
      Icon: ClipboardCheck,
      subtitle: t('Lifetime responses'),
      href: '/my-surveys',
    },
    {
      title: 'Trust level',
      value: `${t('Lv.')}${currentLevel?.level ?? 1} · ${currentLevel?.label ?? 'Newcomer'}`,
      Icon: Trophy,
      subtitle: nextLevel
        ? `${nextLevel.minResponses - completedCount} ${t('to Lv.')}${nextLevel.level}`
        : t('Top level reached'),
      href: '/my-surveys',
      progress: nextLevel ? levelProgress : undefined,
    },
  ];

  // ── Chart: earnings over time ────────────────────────────────────────
  const {
    chartData,
    rangeTotal,
    rangeTrend,
    rangeSubtitle,
    rangeSurveys,
    rangeAvgPerBucket,
    bucketUnit,
  } = useMemo(() => {
    const paid = DEMO_FILLED_SURVEYS.filter((s) => s.status === 'paid');
    return buildEarningsChart(paid, range);
  }, [range]);

  // ── Earnings by category ─────────────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { earned: number; count: number }>();
    DEMO_FILLED_SURVEYS.filter((s) => s.status === 'paid').forEach((s) => {
      const prev = map.get(s.category) ?? { earned: 0, count: 0 };
      map.set(s.category, {
        earned: prev.earned + s.rewardMnt,
        count: prev.count + 1,
      });
    });
    const rows = Array.from(map.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.earned - a.earned);
    const max = rows[0]?.earned ?? 0;
    return { rows, max };
  }, []);

  // ── Recent activity feed (blended) ───────────────────────────────────
  type FeedEvent = {
    kind: 'paid' | 'held-release' | 'under-review' | 'level-up' | 'new-match';
    date: string;
    primary: string;
    secondary: string;
    amount?: number;
    href: string;
  };

  const activity: FeedEvent[] = useMemo(() => {
    const events: FeedEvent[] = [];
    DEMO_FILLED_SURVEYS.forEach((s) => {
      if (s.status === 'paid') {
        events.push({
          kind: 'paid',
          date: s.completedAt,
          primary: s.title,
          secondary: `${s.companyName} · ${t('reward paid')}`,
          amount: s.rewardMnt,
          href: `/survey-feed/${s.surveyId}`,
        });
      } else if (s.status === 'under-review') {
        events.push({
          kind: 'under-review',
          date: s.completedAt,
          primary: s.title,
          secondary: `${s.companyName} · ${t('under review')}`,
          amount: s.rewardMnt,
          href: `/survey-feed/${s.surveyId}`,
        });
      } else if (s.status === 'held') {
        events.push({
          kind: 'held-release',
          date: s.completedAt,
          primary: s.title,
          secondary: `${s.companyName} · ${t('on 24h hold')}`,
          amount: s.rewardMnt,
          href: `/survey-feed/${s.surveyId}`,
        });
      }
    });
    return events
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);
  }, [t]);

  const feedIcon = (kind: FeedEvent['kind']) => {
    const tone = 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]';
    switch (kind) {
      case 'paid':
        return { Icon: CheckCircle2, tone };
      case 'held-release':
        return { Icon: Clock, tone };
      case 'under-review':
        return { Icon: AlertTriangle, tone };
      case 'level-up':
        return { Icon: Trophy, tone };
      case 'new-match':
        return { Icon: Sparkles, tone };
    }
  };

  const feedPill = (kind: FeedEvent['kind']): { tone: string; label: string } | null => {
    switch (kind) {
      case 'held-release':
        return { tone: 'text-[var(--warning)] bg-[var(--warning-tint)]', label: t('Held') };
      case 'under-review':
        return { tone: 'text-[var(--brand-primary-hover)] bg-[var(--brand-tint)]', label: t('Under review') };
      case 'level-up':
        return { tone: 'text-[var(--brand-primary)] bg-[var(--brand-tint)]', label: t('Level up') };
      case 'new-match':
        return { tone: 'text-[var(--brand-primary)] bg-[var(--brand-tint)]', label: t('New match') };
      case 'paid':
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)]">
            {t('Welcome back,')} {USER_FIRST_NAME}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('Your earnings, progress, and surveys at a glance.')}
          </p>
        </div>
        <button
          onClick={() => navigate('/survey-feed')}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-md transition-colors cursor-pointer w-full sm:w-auto"
        >
          {t('Browse surveys')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.title}
            onClick={() => navigate(stat.href)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="text-left bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {t(stat.title)}
              </span>
              <div
                className={cn(
                  'p-2 rounded-md transition-colors',
                  stat.accent
                    ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white',
                )}
              >
                <stat.Icon className="w-4 h-4" />
              </div>
            </div>
            <div
              className={cn(
                'text-2xl font-medium tabular-nums lining-nums truncate',
                stat.accent ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]',
              )}
            >
              {stat.value}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{stat.subtitle}</div>
            {stat.progress !== undefined && (
              <div className="h-1 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-[var(--brand-primary)] transition-all"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Earnings chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white border border-[var(--border-default)] rounded-md p-4 sm:p-6 shadow-none mb-6"
      >
        <div className="flex justify-between items-start mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-medium text-[var(--text-primary)]">
              {t('Earnings')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">
              {t('Reward payments')} {t(rangeSubtitle)}
            </p>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-medium text-[var(--text-primary)] tabular-nums lining-nums">
                {formatMntCompact(rangeTotal)}
              </div>
              {rangeTrend !== null && (
                <div
                  className={cn(
                    'text-xs font-medium flex items-center gap-0.5',
                    rangeTrend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger-strong)]',
                  )}
                >
                  {rangeTrend >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(rangeTrend).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-2 tabular-nums flex-wrap">
              <span>
                {rangeSurveys} {rangeSurveys === 1 ? t('survey') : t('surveys')}
              </span>
              <span className="text-[var(--border-strong)]">·</span>
              <span>
                {t('Avg')} {formatMntCompact(rangeAvgPerBucket)}{' '}
                {bucketUnit === 'day' ? t('/ day') : t('/ week')}
              </span>
              {rangeSurveys > 0 && (
                <>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span>
                    {formatMnt(Math.round(rangeTotal / rangeSurveys))} {t('per survey')}
                  </span>
                </>
              )}
            </div>
          </div>
          <BrandSelect
            value={range}
            onValueChange={(v) => setRange(v as RangeKey)}
            leftIcon={<Calendar />}
            ariaLabel={t('Range')}
            className="sm:w-auto"
            options={[
              { value: '7d', label: t('Last 7 days') },
              { value: '30d', label: t('Last 30 days') },
              { value: 'this_month', label: t('This month') },
              { value: 'last_month', label: t('Last month') },
            ]}
          />
        </div>
        <div className="h-[200px] sm:h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-subtle)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}K` : String(v))}
              />
              <Tooltip
                cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={<EarningsTooltip bucketUnit={bucketUnit} t={t} />}
              />
              {rangeAvgPerBucket > 0 && (
                <ReferenceLine
                  y={rangeAvgPerBucket}
                  stroke="var(--text-muted)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: `${t('Avg')} ${formatMntCompact(rangeAvgPerBucket)}`,
                    position: 'right',
                    fill: 'var(--text-secondary)',
                    fontSize: 11,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEarnings)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two-up: Keep going + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Earnings by category */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-4 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                {t('Earnings by category')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('Where your rewards come from')}
              </p>
            </div>
            <button
              onClick={() => navigate('/my-surveys')}
              className="flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer shrink-0"
            >
              {t('See all')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {categoryBreakdown.rows.length === 0 ? (
            <div className="border-t border-[var(--surface-subtle)] px-6 py-8 text-center text-sm text-[var(--text-secondary)]">
              {t('No paid rewards yet.')}
            </div>
          ) : (
            <ul className="border-t border-[var(--surface-subtle)] px-4 sm:px-6 py-4 space-y-3.5">
              {categoryBreakdown.rows.map((row) => {
                const pct = categoryBreakdown.max === 0
                  ? 0
                  : (row.earned / categoryBreakdown.max) * 100;
                return (
                  <li key={row.category}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-medium text-[var(--text-primary)]">
                        {row.category}
                      </span>
                      <span className="flex items-center gap-2 text-[var(--text-secondary)] tabular-nums">
                        <span>
                          {row.count} {row.count === 1 ? t('survey') : t('surveys')}
                        </span>
                        <span className="text-[var(--border-strong)]">·</span>
                        <span className="font-medium text-[var(--text-primary)] lining-nums">
                          {formatMnt(row.earned)}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.7,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="h-full bg-[var(--brand-primary)] rounded-full"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-4 sm:px-6 pt-5 pb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                {t('Recent activity')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('Latest rewards and status changes')}
              </p>
            </div>
            <button
              onClick={() => navigate('/my-surveys')}
              className="flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer shrink-0"
            >
              {t('View all')}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ol className="divide-y divide-[var(--surface-subtle)] border-t border-[var(--surface-subtle)]">
            {activity.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm text-[var(--text-secondary)]">
                {t('No recent activity.')}
              </li>
            ) : (
              activity.map((ev, i) => {
                const { Icon, tone } = feedIcon(ev.kind);
                const pill = feedPill(ev.kind);
                return (
                  <li key={`${ev.kind}-${i}`}>
                    <button
                      onClick={() => navigate(ev.href)}
                      className="w-full flex items-center gap-3 px-4 sm:px-6 py-3.5 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    >
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', tone)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {ev.primary}
                          </span>
                          {pill && (
                            <span
                              className={cn(
                                'text-[10px] font-medium px-1.5 py-0.5 rounded-md',
                                pill.tone,
                              )}
                            >
                              {pill.label}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                          {ev.secondary} · {format(new Date(ev.date), 'MMM d')}
                        </div>
                      </div>
                      {ev.amount !== undefined && (
                        <div
                          className={cn(
                            'text-sm font-medium tabular-nums lining-nums shrink-0',
                            ev.kind === 'paid' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]',
                          )}
                        >
                          {ev.kind === 'paid' ? '+' : ''}
                          {formatMnt(ev.amount)}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ol>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface ChartPoint {
  name: string;
  value: number;
  surveys: number;
  date: Date;
}

function EarningsTooltip({
  active,
  payload,
  bucketUnit,
  t,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  bucketUnit: 'day' | 'week';
  t: (key: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const label =
    bucketUnit === 'day' ? format(p.date, 'EEE, MMM d') : `${p.name} · ${format(p.date, 'MMM d')}`;
  return (
    <div className="bg-[var(--text-primary)] text-white rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-[var(--text-muted)] mb-1">{label}</div>
      <div className="font-medium tabular-nums lining-nums">{formatMnt(p.value)}</div>
      <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">
        {p.surveys} {p.surveys === 1 ? t('survey') : t('surveys')}
      </div>
    </div>
  );
}

function buildEarningsChart(
  paidSurveys: typeof DEMO_FILLED_SURVEYS,
  range: RangeKey,
): {
  chartData: ChartPoint[];
  rangeTotal: number;
  rangeTrend: number | null;
  rangeSubtitle: string;
  rangeSurveys: number;
  rangeAvgPerBucket: number;
  bucketUnit: 'day' | 'week';
} {
  const today = startOfDay(NOW);

  let from: Date;
  let to: Date = today;
  let buckets: 'day' | 'week' = 'day';
  let subtitle = '';

  switch (range) {
    case '7d':
      from = subDays(today, 6);
      buckets = 'day';
      subtitle = 'in the last 7 days';
      break;
    case '30d':
      from = subDays(today, 29);
      buckets = 'week';
      subtitle = 'in the last 30 days';
      break;
    case 'this_month':
      from = startOfMonth(today);
      buckets = 'week';
      subtitle = 'this month';
      break;
    case 'last_month':
    default:
      from = startOfMonth(subMonths(today, 1));
      to = subDays(startOfMonth(today), 1);
      buckets = 'week';
      subtitle = 'last month';
      break;
  }

  // Build daily or weekly buckets (skeleton only — values come from demo pattern below)
  let chartData: ChartPoint[] = [];
  if (buckets === 'day') {
    const days = differenceInDays(to, from) + 1;
    for (let i = 0; i < days; i++) {
      const d = subDays(to, days - 1 - i);
      chartData.push({
        name: format(d, 'EEE'),
        value: 0,
        surveys: 0,
        date: d,
      });
    }
  } else {
    const weeks = Math.ceil((differenceInDays(to, from) + 1) / 7);
    for (let i = 0; i < weeks; i++) {
      const start = subDays(to, (weeks - i) * 7 - 1);
      chartData.push({
        name: `Wk ${i + 1}`,
        value: 0,
        surveys: 0,
        date: start,
      });
    }
  }

  // Demo values — zigzag patterns per range so the line actually has life
  const DEMO_PATTERNS: Record<RangeKey, { values: number[]; surveys: number[] }> = {
    '7d': {
      values: [6500, 2000, 11500, 4000, 14500, 3500, 9000],
      surveys: [2, 1, 3, 1, 3, 1, 2],
    },
    '30d': {
      values: [18500, 9500, 22000, 12500, 19000],
      surveys: [5, 3, 6, 4, 5],
    },
    this_month: {
      values: [14500, 26000, 10500, 22500, 8500],
      surveys: [4, 6, 3, 5, 2],
    },
    last_month: {
      values: [21000, 12000, 27500, 15000, 19500],
      surveys: [5, 3, 7, 4, 5],
    },
  };

  const pattern = DEMO_PATTERNS[range];
  chartData.forEach((p, i) => {
    p.value = pattern.values[i % pattern.values.length];
    p.surveys = pattern.surveys[i % pattern.surveys.length];
  });

  const rangeTotal = chartData.reduce((sum, p) => sum + p.value, 0);
  const rangeSurveys = chartData.reduce((sum, p) => sum + p.surveys, 0);

  // Trend vs a plausible prior period — varies by range so each view tells its own story
  const prevMultiplier: Record<RangeKey, number> = {
    '7d': 0.82,
    '30d': 1.12,
    this_month: 0.94,
    last_month: 1.05,
  };
  const prevTotal = Math.round(rangeTotal * prevMultiplier[range]);
  const rangeTrend = prevTotal === 0 ? null : ((rangeTotal - prevTotal) / prevTotal) * 100;

  const rangeAvgPerBucket =
    chartData.length === 0 ? 0 : Math.round(rangeTotal / chartData.length);

  return {
    chartData,
    rangeTotal,
    rangeTrend,
    rangeSubtitle: subtitle,
    rangeSurveys,
    rangeAvgPerBucket,
    bucketUnit: buckets,
  };
}
