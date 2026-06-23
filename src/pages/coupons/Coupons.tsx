import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, addDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  TicketPercent,
  BadgePercent,
  CheckCircle2,
  Clock,
  Coins,
  Plus,
  Search,
  ListFilter,
  Calendar as CalendarIcon,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { BrandSelect } from '@/shared/ui/brand-select';
import { MobileFilterButton, MobileFilterSheet, FilterField } from '@/shared/ui/mobile-filter-sheet';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { Portal } from '@/shared/ui/portal';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import { formatAmount } from '@/pages/reservations/reservations-data';
import {
  couponStatus,
  couponStatusClass,
  formatDiscount,
  formatScope,
  COUPON_STATUSES,
  type CouponStatus,
  type Coupon,
} from './coupons-data';
import { useCoupons } from './use-coupons';
import { CouponFormSheet } from './CouponFormSheet';
import { InfoTooltip } from '@/shared/ui/info-tooltip';
import { GLOSSARY } from '@/widgets/onboarding/glossary';

const NOW = new Date('2026-06-02T10:00:00');

/**
 * What the date range targets. Coupons carry a validity window (startsAt →
 * expiresAt), so the same range answers different manager questions depending
 * on the mode: which coupons are live during the window, which expire in it
 * (renewals), or which start in it (scheduling).
 */
const DATE_MODES = [
  { key: 'during', label: 'Valid during' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'starting', label: 'Starting' },
] as const;
type DateMode = (typeof DATE_MODES)[number]['key'];

type StatusFilter = 'All' | CouponStatus;

export default function Coupons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const coupons = useCoupons((s) => s.coupons);
  const removeCoupon = useCoupons((s) => s.removeCoupon);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateMode, setDateMode] = useState<DateMode>('during');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Simulate fetching the list so the table shows its loading (skeleton) state on first load. Swap this for a real query later.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(id);
  }, []);

  const modeLabel = DATE_MODES.find((m) => m.key === dateMode)!.label;
  const dateLabel = dateRange?.from
    ? `${t(modeLabel)} ${dateRange.to ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}` : format(dateRange.from, 'MMM d')}`
    : t('Validity date');

  const withStatus = useMemo(
    () => coupons.map((c) => ({ coupon: c, status: couponStatus(c, NOW) })),
    [coupons],
  );

  const counts = {
    total: coupons.length,
    active: withStatus.filter((x) => x.status === 'Active').length,
    redemptions: coupons.reduce((n, c) => n + c.usedCount, 0),
    expiringSoon: withStatus.filter(
      (x) => x.status === 'Active' && differenceInDays(new Date(x.coupon.expiresAt), NOW) <= 14,
    ).length,
  };

  const stats = [
    { title: 'Total coupons', Icon: TicketPercent, value: String(counts.total), subtitle: t('All coupons'), tone: 'brand' as const },
    { title: 'Active', Icon: CheckCircle2, value: String(counts.active), subtitle: t('Redeemable now'), tone: 'success' as const },
    { title: 'Redemptions', Icon: Coins, value: formatAmount(counts.redemptions), subtitle: t('Total times used'), tone: 'info' as const },
    { title: 'Expiring soon', Icon: Clock, value: String(counts.expiringSoon), subtitle: t('Within 14 days'), tone: 'warning' as const },
  ];

  const query = search.trim().toLowerCase();
  const filtered = withStatus.filter(({ coupon, status }) => {
    if (statusFilter !== 'All' && status !== statusFilter) return false;
    if (query && !`${coupon.code} ${coupon.description}`.toLowerCase().includes(query)) return false;
    // Date filter — the mode decides what the range targets.
    if (dateRange?.from) {
      const from = dateRange.from;
      const to = dateRange.to ?? dateRange.from;
      const starts = new Date(coupon.startsAt);
      const expires = new Date(coupon.expiresAt);
      if (dateMode === 'during') {
        // Validity window overlaps the range.
        if (!(starts <= to && expires >= from)) return false;
      } else if (dateMode === 'expiring') {
        // Expiry date falls inside the range.
        if (!(expires >= from && expires <= to)) return false;
      } else if (dateMode === 'starting') {
        // Start date falls inside the range.
        if (!(starts >= from && starts <= to)) return false;
      }
    }
    return true;
  });

  const hasActiveFilters = query !== '' || statusFilter !== 'All' || !!dateRange?.from;
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setDateRange(undefined);
    setSelectedPreset('');
  };

  // Status lives on the mobile bar; only the date range remains as a secondary filter.
  const activeFilterCount = (dateRange?.from ? 1 : 0);

  const statusOptions = [{ value: 'All', label: t('All statuses') }, ...COUPON_STATUSES.map((s) => ({ value: s, label: t(s) }))];
  const datePresets = ['This month', 'Next 30 days', 'Next 90 days', 'This year', 'Custom date range'];
  const applyDatePreset = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === 'This month') setDateRange({ from: startOfMonth(NOW), to: endOfMonth(NOW) });
    else if (preset === 'Next 30 days') setDateRange({ from: NOW, to: addDays(NOW, 30) });
    else if (preset === 'Next 90 days') setDateRange({ from: NOW, to: addMonths(NOW, 3) });
    else if (preset === 'This year') setDateRange({ from: new Date(NOW.getFullYear(), 0, 1), to: new Date(NOW.getFullYear(), 11, 31) });
  };

  // Bulk selection (matches the Rooms table pattern).
  const visibleIds = filtered.map((x) => x.coupon.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleAll = () => setSelected((prev) => {
    const next = new Set(prev);
    if (allSelected) visibleIds.forEach((id) => next.delete(id));
    else visibleIds.forEach((id) => next.add(id));
    return next;
  });
  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const confirmBulkDelete = () => {
    selected.forEach((id) => removeCoupon(id));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Coupon Management')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Create discounts that attract new guests and bring past ones back.')}</p>
        </div>
        {/* Create coupon hidden for now — coupon creation handled by super-admin. */}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                {t(card.title)}
                {GLOSSARY[card.title] && <InfoTooltip label={GLOSSARY[card.title]} />}
              </span>
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
                <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
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
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search by code or description')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
        </div>
        <BrandSelect
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          leftIcon={<ListFilter />}
          className="sm:w-auto"
          options={statusOptions}
        />

        {/* Validity date-range filter */}
        <div className="relative">
          <button onClick={() => setIsDateOpen((v) => !v)} className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-none cursor-pointer ${dateRange?.from ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]' : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'}`}>
            <CalendarIcon className="w-4 h-4" />
            {dateLabel}
          </button>
          {isDateOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
              <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--border-default)] rounded-md z-20 flex shadow-[0_4px_16px_rgba(44,38,39,0.08)]">
                <div className="w-52 border-r border-[var(--border-default)] p-2 flex flex-col gap-1">
                  {datePresets.map((preset) => (
                    <button key={preset} onClick={() => applyDatePreset(preset)}
                      className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm whitespace-nowrap rounded-md transition-colors shadow-none cursor-pointer ${selectedPreset === preset ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}>
                      {t(preset)}
                      {selectedPreset === preset && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                    </button>
                  ))}
                </div>
                <div className="p-4" style={{ '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as CSSProperties}>
                  {/* Mode toggle — what the range targets. */}
                  <div className="flex p-0.5 mb-3 bg-[var(--surface-subtle)] rounded-md">
                    {DATE_MODES.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setDateMode(m.key)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[5px] transition-colors cursor-pointer ${dateMode === m.key ? 'bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(44,38,39,0.08)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        {t(m.label)}
                      </button>
                    ))}
                  </div>
                  <CalendarUI mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={(range) => { setDateRange(range); setSelectedPreset('Custom date range'); }} numberOfMonths={2} className="border-0 shadow-none p-0" />
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--surface-subtle)]">
                    <button onClick={() => { setDateRange(undefined); setSelectedPreset('Custom date range'); setIsDateOpen(false); }} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer">{t('Clear')}</button>
                    <button onClick={() => setIsDateOpen(false)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors shadow-none cursor-pointer"><Check className="w-4 h-4" />{t('Apply')}</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0" title={t('Clear filters')}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters — mobile (search + Filters sheet trigger + Status) */}
      <div className="sm:hidden flex flex-col gap-3 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search by code or description')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
        </div>
        <div className="flex gap-2">
          <MobileFilterButton count={activeFilterCount} onClick={() => setIsFilterOpen(true)} label={t('Filters')} className="flex-1" />
          <BrandSelect value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} leftIcon={<ListFilter />} className="flex-1" options={statusOptions} />
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
        <FilterField label={t('Validity date')}>
          {/* Mode toggle — what the range targets. */}
          <div className="flex p-0.5 mb-3 bg-[var(--surface-subtle)] rounded-md">
            {DATE_MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setDateMode(m.key)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[5px] transition-colors cursor-pointer ${dateMode === m.key ? 'bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(44,38,39,0.08)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                {t(m.label)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyDatePreset(preset)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                  selectedPreset === preset
                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]'
                    : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'
                }`}
              >
                {t(preset)}
              </button>
            ))}
          </div>
          {/* Calendar only appears for a custom range — keeps the sheet short for the common preset case. */}
          {selectedPreset === 'Custom date range' && (
            <div className="flex justify-center mt-3" style={{ '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as CSSProperties}>
              <CalendarUI
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => { setDateRange(range); setSelectedPreset('Custom date range'); }}
                numberOfMonths={1}
                className="border border-[var(--border-default)] rounded-md p-2"
                classNames={{ table: 'border-collapse space-x-1', row: 'flex mt-2' }}
              />
            </div>
          )}
        </FilterField>
      </MobileFilterSheet>

      {/* Bulk selection bar */}
      <AnimatePresence initial={false}>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -6, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md">
              <span className="text-sm font-medium text-[var(--brand-primary)] tabular-nums">{selected.size} {t('selected')}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white rounded-md transition-colors cursor-pointer">{t('Clear')}</button>
                <button onClick={() => setBulkDeleting(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />{t('Delete')}
                </button>
              </div>
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
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)]">
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Code')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Discount')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Applies to')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Validity')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Usage')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <CouponRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <TicketPercent className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t('No coupons found')}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{t('No coupons match your filters.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(({ coupon: c, status }) => {
                  const usagePct = c.usageLimit > 0 ? Math.min(100, (c.usedCount / c.usageLimit) * 100) : 0;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/coupons/${c.id}`)}
                      className="border-b border-[var(--surface-subtle)] last:border-0 transition-colors cursor-pointer group hover:bg-[var(--surface-muted)]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                            <BadgePercent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--text-primary)]">{c.code}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate max-w-[260px]">{c.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)] tabular-nums">{formatDiscount(c)}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] max-w-[200px] truncate">{formatScope(c)}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] tabular-nums">
                        <span className="inline-flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                          {format(new Date(c.startsAt), 'MMM d')} – {format(new Date(c.expiresAt), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 tabular-nums text-[var(--text-secondary)]">
                          <span>{c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''}</span>
                          {c.usageLimit > 0 && (
                            <div className="w-16 h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--brand-primary)] rounded-full" style={{ width: `${usagePct}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${couponStatusClass(status)}`}>{t(status)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards (hidden on desktop) */}
        <div className="md:hidden divide-y divide-[var(--surface-subtle)]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <CouponCardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <TicketPercent className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('No coupons found')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{t('No coupons match your filters.')}</p>
              </div>
            </div>
          ) : (
            filtered.map(({ coupon, status }, index) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                status={status}
                index={index}
                selected={selected.has(coupon.id)}
                onToggle={() => toggleOne(coupon.id)}
                onOpen={() => navigate(`/coupons/${coupon.id}`)}
                t={t}
              />
            ))
          )}
        </div>
      </div>

      {/* Create coupon sheet */}
      <AnimatePresence>
        {isCreateOpen && <CouponFormSheet coupon={null} onClose={() => setIsCreateOpen(false)} />}
      </AnimatePresence>

      {/* Bulk delete confirmation */}
      <AnimatePresence>
        {bulkDeleting && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[var(--text-primary)]/30 z-50"
              onClick={() => setBulkDeleting(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-sm bg-white border border-[var(--border-default)] rounded-md shadow-[0_8px_28px_rgba(44,38,39,0.14)] p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-[var(--danger-tint)] text-[var(--danger)] flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-[var(--text-primary)]">{t('Delete')} {selected.size} {selected.size === 1 ? t('coupon') : t('coupons')}?</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug">
                      {t('This permanently removes the selected coupons. This action cannot be undone.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-6">
                  <button onClick={() => setBulkDeleting(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
                  <button onClick={confirmBulkDelete} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--danger)] rounded-md hover:bg-[var(--danger-strong)] transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                    {t('Delete')}
                  </button>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Placeholder row shown in the desktop table while coupons load. */
function CouponRowSkeleton() {
  return (
    <tr>
      <td className="pl-6 pr-3 py-4"><Skeleton className="h-4 w-4 rounded" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
    </tr>
  );
}

/** Placeholder card shown in the mobile list while coupons load. */
function CouponCardSkeleton() {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded shrink-0" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pl-7">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="col-span-2 space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="col-span-2 space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

function CouponCard({ coupon: c, status, index, selected, onToggle, onOpen, t }: { coupon: Coupon; status: CouponStatus; index: number; selected: boolean; onToggle: () => void; onOpen: () => void; t: (k: string) => string }) {
  const usagePct = c.usageLimit > 0 ? Math.min(100, (c.usedCount / c.usageLimit) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onOpen}
      className="px-4 py-4 transition-colors cursor-pointer hover:bg-[var(--surface-muted)]"
    >
      {/* Identity row */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
          <BadgePercent className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[var(--text-primary)] truncate">{c.code}</div>
          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{c.description}</div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full shrink-0 ${couponStatusClass(status)}`}>{t(status)}</span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pl-11">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Discount')}</div>
          <div className="text-sm text-[var(--text-primary)] font-medium tabular-nums mt-0.5">{formatDiscount(c)}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Applies to')}</div>
          <div className="text-sm text-[var(--text-primary)] mt-0.5 truncate">{formatScope(c)}</div>
        </div>
        <div className="col-span-2 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Validity')}</div>
          <div className="text-sm text-[var(--text-primary)] tabular-nums mt-0.5 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
            <span className="truncate">{format(new Date(c.startsAt), 'MMM d')} – {format(new Date(c.expiresAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Usage')}</div>
          <div className="flex items-center gap-2 tabular-nums text-sm text-[var(--text-primary)] mt-0.5">
            <span>{c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''}</span>
            {c.usageLimit > 0 && (
              <div className="w-16 h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--brand-primary)] rounded-full" style={{ width: `${usagePct}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
