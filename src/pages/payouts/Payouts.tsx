import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { Portal } from '@/shared/ui/portal';
import {
  Search,
  Download,
  CheckCircle2,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
  Ban,
  Loader,
  Receipt,
  TrendingUp,
  Wallet,
  X,
  Check,
  Building2,
} from 'lucide-react';

import { Skeleton } from '@/shared/ui/skeleton';
import { BrandSelect } from '@/shared/ui/brand-select';
import { MobileFilterButton, MobileFilterSheet, FilterField } from '@/shared/ui/mobile-filter-sheet';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import type { Payout, PayoutGateway, PayoutStatus } from './payout-data';
import { DEMO_PAYOUTS } from './payout-data';

type StatusFilter = 'All' | PayoutStatus;
type GatewayFilter = 'All' | PayoutGateway;
type BulkAction = 'approve' | 'reject';
type RowAction = 'approve' | 'reject' | 'retry';

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}

function formatMntExact(value: number): string {
  return `${value.toLocaleString('en-US')}`;
}

function getStatusStyles(status: PayoutStatus) {
  switch (status) {
    case 'Pending':    return { badge: 'bg-[var(--warning-tint)] text-[var(--warning)]', Icon: Clock };
    case 'Processing': return { badge: 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]', Icon: Loader };
    case 'Completed':  return { badge: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 };
    case 'Failed':     return { badge: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: Ban };
  }
}

function getGatewayStyles(gateway: PayoutGateway) {
  switch (gateway) {
    case 'QPay':          return 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]';
    case 'Bonum':         return 'bg-[var(--brand-tint)] text-[var(--warning)]';
    case 'Social Pay':    return 'bg-[var(--accent-violet-tint)] text-[var(--accent-violet-deep)]';
    case 'Bank Transfer': return 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]';
  }
}

export default function Payouts() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [payouts, setPayouts] = useState<Payout[]>(DEMO_PAYOUTS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [gatewayFilter, setGatewayFilter] = useState<GatewayFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<
    | { kind: 'bulk'; action: BulkAction; ids: string[] }
    | { kind: 'row'; action: RowAction; payout: Payout }
    | null
  >(null);

  // Simulate fetching the list so the table shows its loading (skeleton) state on first load. Swap this for a real query later.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(id);
  }, []);

  const counts = useMemo(
    () => ({
      total: payouts.length,
      pending: payouts.filter((p) => p.status === 'Pending').length,
      processing: payouts.filter((p) => p.status === 'Processing').length,
      completed: payouts.filter((p) => p.status === 'Completed').length,
      failed: payouts.filter((p) => p.status === 'Failed').length,
      pendingAmount: payouts
        .filter((p) => p.status === 'Pending')
        .reduce((acc, p) => acc + p.amountMnt, 0),
      completedToday: payouts.filter((p) => p.status === 'Completed').length,
      completedTodayAmount: payouts
        .filter((p) => p.status === 'Completed')
        .reduce((acc, p) => acc + p.amountMnt, 0),
    }),
    [payouts],
  );

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'All' || gatewayFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setGatewayFilter('All');
  };

  // Count of active secondary filters (search + status live on the bar, excluded).
  const activeFilterCount = gatewayFilter !== 'All' ? 1 : 0;

  const gatewayOptions = [
    { value: 'All', label: t('All gateways') },
    { value: 'QPay', label: t('QPay') },
    { value: 'Bonum', label: t('Bonum') },
    { value: 'Social Pay', label: t('Social Pay') },
    { value: 'Bank Transfer', label: t('Bank Transfer') },
  ];
  const statusOptions = [
    { value: 'All', label: t('All Statuses') },
    { value: 'Pending', label: t('Pending') },
    { value: 'Processing', label: t('Processing') },
    { value: 'Completed', label: t('Completed') },
    { value: 'Failed', label: t('Failed') },
  ];

  const visible = payouts.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (gatewayFilter !== 'All' && p.gateway !== gatewayFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.respondentName.toLowerCase().includes(q) &&
        !p.respondentEmail.toLowerCase().includes(q) &&
        !p.account.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const selectablePendingIds = visible
    .filter((p) => p.status === 'Pending')
    .map((p) => p.id);
  const allSelectedInView =
    selectablePendingIds.length > 0 &&
    selectablePendingIds.every((id) => selected.has(id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelectedInView) selectablePendingIds.forEach((id) => next.delete(id));
      else selectablePendingIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyAction = () => {
    if (!confirming) return;
    const ids =
      confirming.kind === 'bulk'
        ? confirming.ids
        : [confirming.payout.id];

    setPayouts((prev) =>
      prev.map((p) => {
        if (!ids.includes(p.id)) return p;
        if (confirming.action === 'approve') return { ...p, status: 'Processing' };
        if (confirming.action === 'reject')  return { ...p, status: 'Failed' };
        if (confirming.action === 'retry')   return { ...p, status: 'Processing' };
        return p;
      }),
    );
    if (confirming.kind === 'bulk') setSelected(new Set());
    setConfirming(null);
  };

  const confirmingPayout =
    confirming?.kind === 'row' ? confirming.payout : null;
  const confirmingCount =
    confirming?.kind === 'bulk' ? confirming.ids.length : 1;

  const actionMeta = confirming
    ? {
        approve: {
          title:
            confirming.kind === 'bulk'
              ? t('Approve {{n}} payouts?', { n: confirmingCount })
              : t('Approve payout?'),
          description: t('Funds will be released to the respondent via the selected gateway. This moves the payout to processing.'),
          cta: confirming.kind === 'bulk' ? t('Approve all') : t('Approve'),
          tone: 'success' as const,
        },
        reject: {
          title:
            confirming.kind === 'bulk'
              ? t('Reject {{n}} payouts?', { n: confirmingCount })
              : t('Reject payout?'),
          description: t('The payout will be marked as failed and the amount returned to the respondent balance.'),
          cta: confirming.kind === 'bulk' ? t('Reject all') : t('Reject'),
          tone: 'danger' as const,
        },
        retry: {
          title: t('Retry payout?'),
          description: t('The payout will be resubmitted to the gateway for processing.'),
          cta: t('Retry'),
          tone: 'success' as const,
        },
      }[confirming.action]
    : null;

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
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Payout Management')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('Review and release respondent withdrawal requests')}
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
        {[
          {
            title: 'Pending requests',
            tone: 'warning' as const,
            Icon: Clock,
            value: String(counts.pending),
            subtitle: formatMnt(counts.pendingAmount) + ' ' + t('awaiting release'),
          },
          {
            title: 'Pending amount',
            tone: 'amber' as const,
            Icon: Wallet,
            value: formatMnt(counts.pendingAmount),
            subtitle: `${counts.pending} ${t('requests')}`,
          },
          {
            title: 'Released today',
            tone: 'success' as const,
            Icon: CheckCircle2,
            value: String(counts.completedToday),
            subtitle: formatMnt(counts.completedTodayAmount) + ' ' + t('paid out'),
          },
          {
            title: "Today's volume",
            tone: 'purple' as const,
            Icon: TrendingUp,
            value: formatMnt(counts.completedTodayAmount),
            subtitle: t('Across all gateways'),
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className={`p-2 rounded-md transition-colors ${STAT_TONE[card.tone]}`}>
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            {loading ? (
              <>
                <Skeleton className="h-7 sm:h-8 w-16 mt-0.5" />
                <Skeleton className="h-3 w-24 mt-2 sm:mt-3" />
              </>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
                <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
              </>
            )}
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
            placeholder={t('Search respondents or accounts...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={gatewayFilter}
            onValueChange={(v) => setGatewayFilter(v as GatewayFilter)}
            leftIcon={<Building2 />}
            className="sm:w-auto"
            options={gatewayOptions}
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
            placeholder={t('Search respondents or accounts...')}
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
        <FilterField label={t('Gateway')}>
          <BrandSelect value={gatewayFilter} onValueChange={(v) => setGatewayFilter(v as GatewayFilter)} leftIcon={<Building2 />} className="w-full" options={gatewayOptions} />
        </FilterField>
      </MobileFilterSheet>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between gap-3 mb-3 px-4 py-2.5 bg-[var(--brand-tint)] border border-[var(--warning-border-2)] rounded-md"
          >
            <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <span className="font-medium tabular-nums">{selected.size}</span>
              <span className="text-[var(--text-tertiary)]">{t('selected')}</span>
              <button
                onClick={() => setSelected(new Set())}
                className="ml-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {t('Clear')}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setConfirming({ kind: 'bulk', action: 'reject', ids: [...selected] })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-[var(--danger)] border border-[var(--danger-border)] hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                {t('Reject selected')}
              </button>
              <button
                onClick={() =>
                  setConfirming({ kind: 'bulk', action: 'approve', ids: [...selected] })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--success-strong)] text-white hover:bg-[var(--success)] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('Approve selected')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        {/* Desktop: full data table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium">
                <th className="pl-6 pr-3 py-4 w-10">
                  <Checkbox
                    checked={allSelectedInView}
                    onChange={toggleSelectAll}
                    disabled={selectablePendingIds.length === 0}
                    ariaLabel={t('Select all pending')}
                  />
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Respondent')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Amount')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Gateway')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Account')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Requested')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <PayoutRowSkeleton key={i} />)
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Wallet className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t('No payouts found')}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{hasActiveFilters ? t('No payouts match these filters.') : t('Payouts will appear here.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((p, index) => {
                  const statusStyle = getStatusStyles(p.status);
                  const isSelectable = p.status === 'Pending';
                  const isChecked = selected.has(p.id);
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      onClick={() => navigate(`/respondents/${p.respondentId.toLowerCase()}`)}
                      className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                    >
                      <td className="pl-6 pr-3 py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          onChange={() => toggleSelect(p.id)}
                          disabled={!isSelectable}
                          ariaLabel={t('Select payout')}
                        />
                      </td>

                      {/* Respondent */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                            {p.initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">{p.respondentName}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{p.respondentEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)] tabular-nums">
                        {formatMntExact(p.amountMnt)}
                      </td>

                      {/* Gateway */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getGatewayStyles(p.gateway)}`}>
                          {p.gateway}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums font-mono text-xs">
                        {p.account}
                      </td>

                      {/* Requested */}
                      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">
                        <span title={format(new Date(p.requestedAt), 'MMM d, yyyy HH:mm')}>
                          {formatDistanceToNow(new Date(p.requestedAt), { addSuffix: true })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}
                        >
                          <statusStyle.Icon className={`w-3 h-3 ${p.status === 'Processing' ? 'animate-spin' : ''}`} />
                          {t(p.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'Pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ kind: 'row', action: 'approve', payout: p }); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)] hover:bg-[var(--success-tint-2)] transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {t('Approve')}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ kind: 'row', action: 'reject', payout: p }); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-white text-[var(--text-tertiary)] border border-[var(--border-default)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                {t('Reject')}
                              </button>
                            </>
                          )}
                          {p.status === 'Failed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ kind: 'row', action: 'retry', payout: p }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--brand-tint)] text-[var(--warning)] hover:bg-[var(--warning-border-2)] transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {t('Retry')}
                            </button>
                          )}
                          {(p.status === 'Processing' || p.status === 'Completed') && (
                            <span className="text-xs text-[var(--text-muted)]">—</span>
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
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <PayoutCardSkeleton key={i} />)
          ) : visible.length === 0 ? (
            <div className="px-6 py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <Wallet className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('No payouts found')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{hasActiveFilters ? t('No payouts match these filters.') : t('Payouts will appear here.')}</p>
              </div>
            </div>
          ) : (
            visible.map((p, index) => (
              <PayoutCard
                key={p.id}
                payout={p}
                index={index}
                selected={selected.has(p.id)}
                onToggle={() => toggleSelect(p.id)}
                onOpen={() => navigate(`/respondents/${p.respondentId.toLowerCase()}`)}
                onRowAction={(action) => setConfirming({ kind: 'row', action, payout: p })}
                t={t}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          {loading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">
              {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.total} {t('payouts')}
            </span>
          )}
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
                {confirmingPayout && (
                  <div className="mt-3 p-3 bg-white border border-[var(--border-default)] rounded-md flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                      {confirmingPayout.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--text-primary)] text-sm truncate">
                        {confirmingPayout.respondentName}
                      </div>
                      <div className="text-[var(--text-secondary)] text-xs truncate">
                        {confirmingPayout.gateway} · {confirmingPayout.account}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                      {formatMntExact(confirmingPayout.amountMnt)}
                    </div>
                  </div>
                )}
                {confirming.kind === 'bulk' && (
                  <div className="mt-3 p-3 bg-[var(--surface-muted)] border border-[var(--border-default)] rounded-md">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">{t('Total amount')}</span>
                      <span className="font-medium text-[var(--text-primary)] tabular-nums">
                        {formatMntExact(
                          payouts
                            .filter((p) => confirming.ids.includes(p.id))
                            .reduce((acc, p) => acc + p.amountMnt, 0),
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('The amount will return to the respondent balance.')}
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

function PayoutCard({
  payout: p,
  index,
  selected,
  onToggle,
  onOpen,
  onRowAction,
  t,
}: {
  payout: Payout;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onRowAction: (action: RowAction) => void;
  t: (k: string) => string;
}) {
  const statusStyle = getStatusStyles(p.status);
  const isSelectable = p.status === 'Pending';
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
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Checkbox
            checked={selected}
            onChange={onToggle}
            disabled={!isSelectable}
            ariaLabel={t('Select payout')}
          />
        </div>
        <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
          {p.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[var(--text-primary)] truncate">{p.respondentName}</div>
          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{p.respondentEmail}</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full shrink-0 ${statusStyle.badge}`}>
          <statusStyle.Icon className={`w-3 h-3 ${p.status === 'Processing' ? 'animate-spin' : ''}`} />
          {t(p.status)}
        </span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pl-7">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Amount')}</div>
          <div className="text-sm text-[var(--text-primary)] font-medium tabular-nums mt-0.5">{formatMntExact(p.amountMnt)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Gateway')}</div>
          <div className="mt-0.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getGatewayStyles(p.gateway)}`}>
              {p.gateway}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Account')}</div>
          <div className="text-xs text-[var(--text-tertiary)] tabular-nums font-mono mt-1 truncate">{p.account}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Requested')}</div>
          <div className="text-sm text-[var(--text-primary)] tabular-nums mt-0.5" title={format(new Date(p.requestedAt), 'MMM d, yyyy HH:mm')}>
            {formatDistanceToNow(new Date(p.requestedAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(p.status === 'Pending' || p.status === 'Failed') && (
        <div className="flex items-center gap-1.5 mt-4 pl-7" onClick={(e) => e.stopPropagation()}>
          {p.status === 'Pending' && (
            <>
              <button
                onClick={() => onRowAction('approve')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)] hover:bg-[var(--success-tint-2)] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                {t('Approve')}
              </button>
              <button
                onClick={() => onRowAction('reject')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-white text-[var(--text-tertiary)] border border-[var(--border-default)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <XCircle className="w-3 h-3" />
                {t('Reject')}
              </button>
            </>
          )}
          {p.status === 'Failed' && (
            <button
              onClick={() => onRowAction('retry')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--brand-tint)] text-[var(--warning)] hover:bg-[var(--warning-border-2)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              {t('Retry')}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/** Placeholder row shown in the desktop table while payouts load. */
function PayoutRowSkeleton() {
  return (
    <tr>
      <td className="pl-6 pr-3 py-4"><Skeleton className="h-4 w-4 rounded" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full ml-auto" /></td>
    </tr>
  );
}

/** Placeholder card shown in the mobile list while payouts load. */
function PayoutCardSkeleton() {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded shrink-0" />
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pl-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  disabled,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-checked={checked}
      role="checkbox"
      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]'
          : 'bg-white border-[var(--border-strong)] hover:border-[var(--brand-primary)]'
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </button>
  );
}
