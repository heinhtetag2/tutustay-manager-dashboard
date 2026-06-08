import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Portal } from '@/shared/ui/portal';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Search,
  Download,
  CheckCircle,
  Users,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Ban,
  ShieldCheck,
  Wallet,
  Coins,
  X,
  TrendingUp,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import { MobileFilterButton, MobileFilterSheet, FilterField } from '@/shared/ui/mobile-filter-sheet';
import type { Respondent, RespondentStatus, TrustLevel } from './respondent-data';
import { DEMO_RESPONDENTS } from './respondent-data';

type StatusFilter = 'All' | RespondentStatus;
type LevelFilter = 'All' | TrustLevel;
type EarnFilter = 'All' | 'under-100k' | '100k-300k' | '300k-500k' | 'over-500k';

const EARN_RANGES: Record<Exclude<EarnFilter, 'All'>, [number, number]> = {
  'under-100k': [0, 100_000],
  '100k-300k': [100_000, 300_000],
  '300k-500k': [300_000, 500_000],
  'over-500k': [500_000, Number.POSITIVE_INFINITY],
};

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}

function getStatusStyles(status: RespondentStatus) {
  switch (status) {
    case 'Active':
      return { badge: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle };
    case 'Warned':
      return { badge: 'bg-[var(--warning-tint)] text-[var(--warning)]', Icon: AlertTriangle };
    case 'Suspended':
      return { badge: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: Ban };
  }
}

function getQualityStyles(score: number) {
  if (score >= 80) return { bar: 'bg-[var(--success-strong)]', text: 'text-[var(--success)]' };
  if (score >= 60) return { bar: 'bg-[var(--warning-strong)]', text: 'text-[var(--warning)]' };
  return { bar: 'bg-[var(--danger-strong)]', text: 'text-[var(--danger)]' };
}

function getLevelColor(level: TrustLevel): string {
  switch (level) {
    case 'L1': return 'bg-[var(--danger-strong)]';
    case 'L2': return 'bg-[var(--brand-primary)]';
    case 'L3': return 'bg-[var(--warning-strong)]';
    case 'L4': return 'bg-[var(--brand-primary-hover)]';
    case 'L5': return 'bg-[var(--success-strong)]';
  }
}

function levelToNumber(level: TrustLevel): number {
  return Number(level.substring(1));
}

function TrustMeter({ level }: { level: TrustLevel }) {
  const filled = levelToNumber(level);
  const color = getLevelColor(level);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= filled ? color : 'bg-[var(--border-default)]'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[var(--text-tertiary)] tabular-nums">{level}</span>
    </div>
  );
}

export default function Respondents() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [respondents, setRespondents] = useState<Respondent[]>(DEMO_RESPONDENTS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All');
  const [earnFilter, setEarnFilter] = useState<EarnFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [confirming, setConfirming] = useState<
    | { respondent: Respondent; action: 'warn' | 'suspend' | 'reinstate' }
    | null
  >(null);

  const applyAction = () => {
    if (!confirming) return;
    const { respondent, action } = confirming;
    setRespondents((prev) =>
      prev.map((r) => {
        if (r.id !== respondent.id) return r;
        if (action === 'warn') return { ...r, status: 'Warned', warnings: r.warnings + 1 };
        if (action === 'suspend') return { ...r, status: 'Suspended' };
        if (action === 'reinstate') return { ...r, status: 'Active' };
        return r;
      }),
    );
    setConfirming(null);
  };

  const actionMeta = confirming
    ? {
        warn: {
          title: t('Issue warning?'),
          description: t('A warning will be recorded and the respondent will be notified. Repeated warnings can lead to suspension.'),
          cta: t('Issue warning'),
          tone: 'warning' as const,
        },
        suspend: {
          title: t('Suspend respondent?'),
          description: t("The respondent will lose access to take surveys. You can reinstate them later from the Suspended tab."),
          cta: t('Suspend'),
          tone: 'danger' as const,
        },
        reinstate: {
          title: t('Reinstate respondent?'),
          description: t('Access will be restored and the respondent can take surveys again.'),
          cta: t('Reinstate'),
          tone: 'success' as const,
        },
      }[confirming.action]
    : null;

  const counts = useMemo(
    () => ({
      total: respondents.length,
      active: respondents.filter((r) => r.status === 'Active').length,
      warned: respondents.filter((r) => r.status === 'Warned').length,
      suspended: respondents.filter((r) => r.status === 'Suspended').length,
      totalEarned: respondents.reduce((acc, r) => acc + r.earnedMnt, 0),
      avgQuality: Math.round(
        respondents.reduce((acc, r) => acc + r.qualityScore, 0) / Math.max(1, respondents.length),
      ),
    }),
    [respondents],
  );

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'All' ||
    levelFilter !== 'All' ||
    earnFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setLevelFilter('All');
    setEarnFilter('All');
  };

  // Count of active secondary filters (search + status live on the bar, excluded).
  const activeFilterCount =
    (levelFilter !== 'All' ? 1 : 0) +
    (earnFilter !== 'All' ? 1 : 0);

  const levelOptions = [
    { value: 'All', label: t('All Levels') },
    { value: 'L1', label: t('L1') },
    { value: 'L2', label: t('L2') },
    { value: 'L3', label: t('L3') },
    { value: 'L4', label: t('L4') },
    { value: 'L5', label: t('L5') },
  ];
  const earnOptions = [
    { value: 'All', label: t('Any earnings') },
    { value: 'under-100k', label: t('Under 100K') },
    { value: '100k-300k', label: t('100K – 300K') },
    { value: '300k-500k', label: t('300K – 500K') },
    { value: 'over-500k', label: t('Over 500K') },
  ];
  const statusOptions = [
    { value: 'All', label: t('All Statuses') },
    { value: 'Active', label: t('Active') },
    { value: 'Warned', label: t('Warned') },
    { value: 'Suspended', label: t('Suspended') },
  ];

  const visible = respondents.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (levelFilter !== 'All' && r.trustLevel !== levelFilter) return false;
    if (earnFilter !== 'All') {
      const [min, max] = EARN_RANGES[earnFilter];
      if (r.earnedMnt < min || r.earnedMnt >= max) return false;
    }
    if (
      searchQuery &&
      !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = [
    {
      title: 'Total respondents',
      Icon: Users,
      value: String(counts.total),
      subtitle: `${counts.active} ${t('active')} · ${counts.warned} ${t('warned')}`,
    },
    {
      title: 'Active accounts',
      Icon: UserCheck,
      value: String(counts.active),
      subtitle: t('Eligible for surveys'),
    },
    {
      title: 'Avg. quality score',
      Icon: TrendingUp,
      value: `${counts.avgQuality}%`,
      subtitle: t('Across all respondents'),
    },
    {
      title: 'Total earnings',
      Icon: Wallet,
      value: formatMnt(counts.totalEarned),
      subtitle: t('Lifetime payout volume'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Respondents')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {counts.total} {t('registered respondents')} · {counts.warned} {t('warned')} · {counts.suspended} {t('suspended')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors bg-white shadow-none cursor-pointer">
            <Download className="w-4 h-4" />
            {t('Export CSV')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters — desktop (sm+) */}
      <div className="hidden sm:flex flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search respondents...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={levelFilter}
            onValueChange={(v) => setLevelFilter(v as LevelFilter)}
            leftIcon={<ShieldCheck />}
            className="sm:w-auto"
            options={levelOptions}
          />

          <BrandSelect
            value={earnFilter}
            onValueChange={(v) => setEarnFilter(v as EarnFilter)}
            leftIcon={<Coins />}
            className="sm:w-auto"
            options={earnOptions}
          />

          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<CheckCircle />}
            className="sm:w-auto"
            options={statusOptions}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0"
              title={t('Clear filters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters — mobile (search + Filters sheet trigger) */}
      <div className="sm:hidden flex flex-col gap-3 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search respondents...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <div className="flex gap-2">
          <MobileFilterButton count={activeFilterCount} onClick={() => setIsFilterOpen(true)} label={t('Filters')} className="flex-1" />
          <BrandSelect value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} leftIcon={<CheckCircle />} className="flex-1" options={statusOptions} />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <MobileFilterSheet
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onClear={clearFilters}
        onApply={() => setIsFilterOpen(false)}
        title={t('Filters')}
        clearLabel={t('Clear all')}
        applyLabel={t('Show results')}
      >
        <FilterField label={t('Trust')}>
          <BrandSelect value={levelFilter} onValueChange={(v) => setLevelFilter(v as LevelFilter)} leftIcon={<ShieldCheck />} className="w-full" options={levelOptions} />
        </FilterField>
        <FilterField label={t('Earned')}>
          <BrandSelect value={earnFilter} onValueChange={(v) => setEarnFilter(v as EarnFilter)} leftIcon={<Coins />} className="w-full" options={earnOptions} />
        </FilterField>
      </MobileFilterSheet>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        {/* Desktop: full data table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium">
                <th className="pl-6 pr-3 py-4 font-medium text-[11px] tracking-wider uppercase">{t('User')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Trust')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Surveys')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Quality score')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Earned')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Last active')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Warnings')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    {t('No respondents match these filters.')}
                  </td>
                </tr>
              ) : (
                visible.map((r, index) => {
                  const statusStyle = getStatusStyles(r.status);
                  const quality = getQualityStyles(r.qualityScore);
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      onClick={() => navigate(`/respondents/${r.id.toLowerCase()}`)}
                      className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    >
                      {/* User */}
                      <td className="pl-6 pr-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                            {r.initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">{r.name}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{r.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Trust */}
                      <td className="px-6 py-4">
                        <TrustMeter level={r.trustLevel} />
                      </td>

                      {/* Surveys */}
                      <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums font-medium">
                        {r.surveys}
                      </td>

                      {/* Quality score */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-24 h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 ${quality.bar} rounded-full`}
                              style={{ width: `${r.qualityScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium tabular-nums ${quality.text}`}>
                            {r.qualityScore}%
                          </span>
                        </div>
                      </td>

                      {/* Earned */}
                      <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums font-medium">
                        {formatMnt(r.earnedMnt)}
                      </td>

                      {/* Last active */}
                      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">
                        <span title={format(new Date(r.lastActive), 'MMM d, yyyy')}>
                          {formatDistanceToNow(new Date(r.lastActive), { addSuffix: true })}
                        </span>
                      </td>

                      {/* Warnings */}
                      <td className="px-6 py-4 tabular-nums">
                        <span className={r.warnings === 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--danger)] font-medium'}>
                          {r.warnings}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}
                        >
                          <statusStyle.Icon className="w-3 h-3" />
                          {t(r.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== 'Suspended' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ respondent: r, action: 'warn' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--warning-tint)] text-[var(--warning)] hover:bg-[var(--warning-border)] transition-colors cursor-pointer"
                              title={t('Warn respondent')}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {t('Warn')}
                            </button>
                          )}
                          {r.status !== 'Suspended' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ respondent: r, action: 'suspend' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--danger-tint)] text-[var(--danger)] hover:bg-[var(--danger-border)] transition-colors cursor-pointer"
                              title={t('Suspend respondent')}
                            >
                              <Ban className="w-3 h-3" />
                              {t('Suspend')}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ respondent: r, action: 'reinstate' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)] hover:bg-[var(--success-tint-2)] transition-colors cursor-pointer"
                              title={t('Reinstate respondent')}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {t('Reinstate')}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards (hidden on desktop) */}
        <div className="md:hidden divide-y divide-[var(--surface-subtle)]">
          {visible.length === 0 ? (
            <div className="px-6 py-12 text-center text-[var(--text-secondary)]">
              {t('No respondents match these filters.')}
            </div>
          ) : (
            visible.map((r, index) => (
              <RespondentCard
                key={r.id}
                respondent={r}
                index={index}
                onOpen={() => navigate(`/respondents/${r.id.toLowerCase()}`)}
                onAction={(action) => setConfirming({ respondent: r, action })}
                t={t}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          <span className="text-sm text-[var(--text-secondary)]">
            {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.total} {t('respondents')}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('Previous')}
            </button>
            <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[var(--brand-primary)] rounded-md bg-[var(--brand-primary)] text-white tabular-nums cursor-default">
              1
            </button>
            <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
              {t('Next')}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <Portal>
      <AnimatePresence>
        {confirming && actionMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">{actionMeta.title}</h2>
                <button
                  onClick={() => setConfirming(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{actionMeta.description}</p>
                <div className="mt-3 p-3 bg-white border border-[var(--border-default)] rounded-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                    {confirming.respondent.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--text-primary)] text-sm truncate">{confirming.respondent.name}</div>
                    <div className="text-[var(--text-secondary)] text-xs truncate">{confirming.respondent.email}</div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This can be reversed from the Suspended tab.')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={applyAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors cursor-pointer ${
                    actionMeta.tone === 'danger'
                      ? 'bg-[var(--danger-strong)] hover:bg-[var(--danger)]'
                      : actionMeta.tone === 'warning'
                        ? 'bg-[var(--warning-strong)] hover:bg-[var(--warning)]'
                        : 'bg-[var(--success-strong)] hover:bg-[var(--success)]'
                  }`}
                >
                  {actionMeta.cta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function RespondentCard({ respondent: r, index, onOpen, onAction, t }: { respondent: Respondent; index: number; onOpen: () => void; onAction: (action: 'warn' | 'suspend' | 'reinstate') => void; t: (k: string) => string }) {
  const statusStyle = getStatusStyles(r.status);
  const quality = getQualityStyles(r.qualityScore);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onOpen}
      className="px-4 py-4 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
    >
      {/* Identity row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
          {r.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[var(--text-primary)] truncate">{r.name}</div>
          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{r.email}</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full shrink-0 ${statusStyle.badge}`}>
          <statusStyle.Icon className="w-3 h-3" />
          {t(r.status)}
        </span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Trust')}</div>
          <div className="mt-1"><TrustMeter level={r.trustLevel} /></div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Surveys')}</div>
          <div className="text-sm text-[var(--text-primary)] font-medium tabular-nums mt-0.5">{r.surveys}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Quality score')}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="relative w-20 h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
              <div className={`absolute inset-y-0 left-0 ${quality.bar} rounded-full`} style={{ width: `${r.qualityScore}%` }} />
            </div>
            <span className={`text-xs font-medium tabular-nums ${quality.text}`}>{r.qualityScore}%</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Earned')}</div>
          <div className="text-sm text-[var(--text-primary)] font-medium tabular-nums mt-0.5">{formatMnt(r.earnedMnt)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Last active')}</div>
          <div className="text-sm text-[var(--text-tertiary)] tabular-nums mt-0.5" title={format(new Date(r.lastActive), 'MMM d, yyyy')}>
            {formatDistanceToNow(new Date(r.lastActive), { addSuffix: true })}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Warnings')}</div>
          <div className={`text-sm tabular-nums mt-0.5 ${r.warnings === 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--danger)] font-medium'}`}>{r.warnings}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-4 flex-wrap">
        {r.status !== 'Suspended' && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction('warn'); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--warning-tint)] text-[var(--warning)] hover:bg-[var(--warning-border)] transition-colors cursor-pointer"
            title={t('Warn respondent')}
          >
            <AlertTriangle className="w-3 h-3" />
            {t('Warn')}
          </button>
        )}
        {r.status !== 'Suspended' ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAction('suspend'); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--danger-tint)] text-[var(--danger)] hover:bg-[var(--danger-border)] transition-colors cursor-pointer"
            title={t('Suspend respondent')}
          >
            <Ban className="w-3 h-3" />
            {t('Suspend')}
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAction('reinstate'); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)] hover:bg-[var(--success-tint-2)] transition-colors cursor-pointer"
            title={t('Reinstate respondent')}
          >
            <CheckCircle className="w-3 h-3" />
            {t('Reinstate')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
