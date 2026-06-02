import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { format, isSameMonth } from 'date-fns';
import {
  CheckCircle2,
  Clock,
  Coins,
  Percent,
  Search,
  ListFilter,
  Calendar as CalendarIcon,
  Download,
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  formatAmount,
  commissionAmount,
  netAmount,
  settlementStatusClass,
  SETTLEMENT_STATUSES,
  type SettlementStatus,
} from './settlements-data';
import { useSettlements } from './use-settlements';

const NOW = new Date('2026-06-02T10:00:00');

type StatusFilter = 'All' | SettlementStatus;
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
  const [chartMetric, setChartMetric] = useState<ChartMetric>('net');

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
      return true;
    })
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  // Net payout per period, oldest → newest, for the chart.
  const chartData = useMemo(
    () =>
      [...settlements]
        .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
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
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Track payouts of your booking revenue — gross, commission, and net.')}</p>
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
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
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
                filtered.map((s) => (
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
