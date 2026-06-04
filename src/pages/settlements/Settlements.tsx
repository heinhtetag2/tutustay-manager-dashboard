import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { format, isSameMonth, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  CheckCircle2,
  Clock,
  Coins,
  Percent,
  Search,
  ListFilter,
  Calendar as CalendarIcon,
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import {
  formatAmount,
  commissionAmount,
  netAmount,
  settlementStatusClass,
  SETTLEMENT_STATUSES,
  type SettlementStatus,
} from './settlements-data';
import { useSettlements } from './use-settlements';
import { InfoTooltip } from '@/shared/ui/info-tooltip';
import { GLOSSARY } from '@/widgets/onboarding/glossary';

const NOW = new Date('2026-06-02T10:00:00');

type StatusFilter = 'All' | SettlementStatus;
type AmountFilter = 'All' | 'lt1m' | '1to3m' | 'gt3m';
type ChartMetric = 'net' | 'gross' | 'commission';
const METRICS: Record<ChartMetric, { label: string; title: string; subtitle: string }> = {
  net: { label: 'Net payout', title: 'Net payout by period', subtitle: 'Amount paid out each settlement period' },
  gross: { label: 'Gross revenue', title: 'Gross revenue by period', subtitle: 'Booking revenue collected each period' },
  commission: { label: 'Commission', title: 'Commission by period', subtitle: 'Platform fee each period' },
};

export default function Settlements() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settlements = useSettlements((s) => s.settlements);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('All');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('net');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Custom date range');

  const counts = useMemo(() => {
    const paidOut = settlements.filter((s) => s.status === 'Paid').reduce((n, s) => n + netAmount(s), 0);
    const pending = settlements.filter((s) => s.status !== 'Paid');
    const pendingPayout = pending.reduce((n, s) => n + netAmount(s), 0);
    const monthGross = settlements
      .filter((s) => isSameMonth(new Date(s.periodStart), NOW))
      .reduce((n, s) => n + s.grossAmount, 0);
    const commission = settlements.reduce((n, s) => n + commissionAmount(s), 0);
    return { paidOut, pendingPayout, pendingCount: pending.length, monthGross, commission };
  }, [settlements]);

  const stats = [
    { title: 'Paid out', Icon: CheckCircle2, value: formatAmount(counts.paidOut), subtitle: t('Settled to date') },
    { title: 'Pending payout', Icon: Clock, value: formatAmount(counts.pendingPayout), subtitle: `${counts.pendingCount} ${counts.pendingCount === 1 ? t('settlement') : t('settlements')}` },
    { title: 'This month gross', Icon: Coins, value: formatAmount(counts.monthGross), subtitle: t('Booking revenue') },
    { title: 'Platform fees', Icon: Percent, value: formatAmount(counts.commission), subtitle: t('Commission to date') },
  ];

  const query = search.trim().toLowerCase();
  const filtered = settlements
    .filter((s) => {
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (query && !s.reference.toLowerCase().includes(query)) return false;
      if (dateRange?.from) {
        const from = dateRange.from;
        const to = dateRange.to ?? dateRange.from;
        // Keep settlements whose period overlaps the selected range.
        if (new Date(s.periodEnd) < from || new Date(s.periodStart) > to) return false;
      }
      if (amountFilter !== 'All') {
        const net = netAmount(s);
        if (amountFilter === 'lt1m' && net >= 1_000_000) return false;
        if (amountFilter === '1to3m' && (net < 1_000_000 || net > 3_000_000)) return false;
        if (amountFilter === 'gt3m' && net <= 3_000_000) return false;
      }
      return true;
    })
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  const dateLabel = dateRange?.from
    ? dateRange.to && +dateRange.to !== +dateRange.from
      ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : t('Any period');
  const hasActiveFilters = search !== '' || statusFilter !== 'All' || amountFilter !== 'All' || !!dateRange?.from;
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setAmountFilter('All');
    setDateRange(undefined);
    setSelectedPreset('Custom date range');
  };

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search, statusFilter, amountFilter, dateRange]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // Net payout per period for the chart — most recent 8 periods, so it stays readable.
  const chartData = useMemo(
    () =>
      [...settlements]
        .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
        .slice(-8)
        .map((s) => ({ name: format(new Date(s.periodStart), 'MMM d'), net: netAmount(s), gross: s.grossAmount, commission: commissionAmount(s), status: s.status, ref: s.reference })),
    [settlements],
  );

  // Where the gross revenue goes: net payout vs commission vs adjustments.
  const composition = useMemo(() => {
    const gross = settlements.reduce((n, s) => n + s.grossAmount, 0);
    const commission = settlements.reduce((n, s) => n + commissionAmount(s), 0);
    const adjustments = settlements.reduce((n, s) => n + s.adjustments, 0);
    return { gross, commission, adjustments, net: gross - commission - adjustments };
  }, [settlements]);
  const compositionData = [
    { name: 'Net payout', value: composition.net, color: 'var(--brand-primary)' },
    { name: 'Commission', value: composition.commission, color: 'var(--brand-accent)' },
    { name: 'Adjustments', value: composition.adjustments, color: 'var(--warning-strong)' },
  ].filter((d) => d.value > 0);

  const exportCsv = () => {
    const header = ['Reference', 'Period start', 'Period end', 'Bookings', 'Gross', 'Commission', 'Adjustments', 'Net payout', 'Status'];
    const rows = filtered.map((s) => [s.reference, s.periodStart, s.periodEnd, s.bookingsCount, s.grossAmount, commissionAmount(s), s.adjustments, netAmount(s), s.status]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settlements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Settlement')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('See how each booking becomes a payout — gross revenue, commission, and what lands in your account.')}</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-default)] text-[var(--text-primary)] text-sm font-medium rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          {t('Export CSV')}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)]">
                {t(card.title)}
                {GLOSSARY[card.title] && <InfoTooltip label={GLOSSARY[card.title]} />}
              </span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts: net payout by period (2/3) + payout composition (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md p-6 shadow-none"
        >
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t(METRICS[chartMetric].title)}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t(METRICS[chartMetric].subtitle)}</p>
            </div>
            <BrandSelect
              value={chartMetric}
              onValueChange={(v) => setChartMetric(v as ChartMetric)}
              leftIcon={<ListFilter />}
              ariaLabel={t('Metric')}
              className="sm:w-auto"
              options={(Object.keys(METRICS) as ChartMetric[]).map((m) => ({ value: m, label: t(METRICS[m].label) }))}
            />
          </div>
          <div className="h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 6, right: 6, left: -20, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))} />
                <Tooltip cursor={{ fill: 'var(--surface-subtle)' }} content={<PayoutTooltip metric={chartMetric} metricLabel={t(METRICS[chartMetric].label)} t={t} />} />
                <Bar dataKey={chartMetric} fill="var(--brand-primary)" radius={[3, 3, 0, 0]} maxBarSize={40} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white border border-[var(--border-default)] rounded-md p-6 shadow-none flex flex-col"
        >
          <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Payout composition')}</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Total gross across all settlements')}</p>
          <div className="flex-1 flex items-center gap-5 mt-4">
            <div className="relative w-[128px] h-[128px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={compositionData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={62} paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {compositionData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-medium text-[var(--text-primary)] tabular-nums leading-none">
                  {composition.gross >= 1_000_000 ? `${(composition.gross / 1_000_000).toFixed(1)}M` : `${Math.round(composition.gross / 1000)}K`}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)] mt-1">{t('gross')}</span>
              </div>
            </div>
            <ul className="flex-1 min-w-0 space-y-2.5">
              {compositionData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[var(--text-secondary)] truncate">{t(d.name)}</span>
                  </span>
                  <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(d.value)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 text-sm border-t border-[var(--surface-subtle)] pt-2.5">
                <span className="font-medium text-[var(--text-primary)]">{t('Gross total')}</span>
                <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(composition.gross)}</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search by reference')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
        </div>
        <BrandSelect
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          leftIcon={<ListFilter />}
          className="sm:w-auto"
          options={[{ value: 'All', label: t('All statuses') }, ...SETTLEMENT_STATUSES.map((s) => ({ value: s, label: t(s) }))]}
        />

        {/* Period date-range filter */}
        <div className="relative">
          <button onClick={() => setIsDateOpen((v) => !v)} className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-none cursor-pointer ${dateRange?.from ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]' : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'}`}>
            <CalendarIcon className="w-4 h-4" />
            {dateLabel}
          </button>
          {isDateOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
              <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--border-default)] rounded-md z-20 flex shadow-[0_4px_16px_rgba(44,38,39,0.08)]">
                <div className="w-48 border-r border-[var(--border-default)] p-2 flex flex-col gap-1">
                  {['This month', 'Last 30 days', 'Last 90 days', 'This year', 'Custom date range'].map((preset) => (
                    <button key={preset} onClick={() => {
                        setSelectedPreset(preset);
                        if (preset === 'This month') setDateRange({ from: startOfMonth(NOW), to: endOfMonth(NOW) });
                        else if (preset === 'Last 30 days') setDateRange({ from: subDays(NOW, 30), to: NOW });
                        else if (preset === 'Last 90 days') setDateRange({ from: subDays(NOW, 90), to: NOW });
                        else if (preset === 'This year') setDateRange({ from: new Date('2026-01-01'), to: new Date('2026-12-31') });
                      }}
                      className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm whitespace-nowrap rounded-md transition-colors shadow-none cursor-pointer ${selectedPreset === preset ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}>
                      {t(preset)}
                      {selectedPreset === preset && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                    </button>
                  ))}
                </div>
                <div className="p-4" style={{ '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}>
                  <CalendarUI mode="range" defaultMonth={dateRange?.from ?? NOW} selected={dateRange} onSelect={(range) => { setDateRange(range); setSelectedPreset('Custom date range'); }} numberOfMonths={2} className="border-0 shadow-none p-0" />
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--surface-subtle)]">
                    <button onClick={() => { setDateRange(undefined); setSelectedPreset('Custom date range'); setIsDateOpen(false); }} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer">{t('Clear')}</button>
                    <button onClick={() => setIsDateOpen(false)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors shadow-none cursor-pointer"><Check className="w-4 h-4" />{t('Apply')}</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <BrandSelect
          value={amountFilter}
          onValueChange={(v) => setAmountFilter(v as AmountFilter)}
          leftIcon={<Coins />}
          className="sm:w-auto"
          options={[
            { value: 'All', label: t('Any amount') },
            { value: 'lt1m', label: t('Under 1M') },
            { value: '1to3m', label: t('1M – 3M') },
            { value: 'gt3m', label: t('Over 3M') },
          ]}
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0" title={t('Clear filters')}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)]">
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Reference')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Period')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-center">{t('Bookings')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Gross')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Commission')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Net payout')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">{t('No settlements match your filters.')}</td>
                </tr>
              ) : (
                pageRows.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/settlements/${s.id}`)}
                    className="border-b border-[var(--surface-subtle)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)] tabular-nums">{s.reference}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] tabular-nums">
                      <span className="inline-flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                        {format(new Date(s.periodStart), 'MMM d')} – {format(new Date(s.periodEnd), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums text-center">{s.bookingsCount}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] tabular-nums">{formatAmount(s.grossAmount)}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] tabular-nums">−{formatAmount(commissionAmount(s))}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(netAmount(s))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${settlementStatusClass(s.status)}`}>{t(s.status)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
            <span className="text-sm text-[var(--text-secondary)] tabular-nums">{t('Showing')} {rangeStart} {t('to')} {rangeEnd} {t('of')} {filtered.length} {t('settlements')}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3 inline-flex items-center gap-1 text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />{t('Previous')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border rounded-md tabular-nums transition-colors cursor-pointer ${p === currentPage ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--border-default)] bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3 inline-flex items-center gap-1 text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                {t('Next')}<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PayoutTooltip({
  active,
  payload,
  metric,
  metricLabel,
  t,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; net: number; gross: number; commission: number; status: string; ref: string } }>;
  metric: ChartMetric;
  metricLabel: string;
  t: (key: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[var(--text-primary)] text-white rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-[var(--text-muted)] mb-1">{p.ref} · {p.name}</div>
      <div className="font-medium tabular-nums">{formatAmount(p[metric])}</div>
      <div className="text-[var(--text-muted)] mt-0.5">{metricLabel} · {t(p.status)}</div>
    </div>
  );
}
