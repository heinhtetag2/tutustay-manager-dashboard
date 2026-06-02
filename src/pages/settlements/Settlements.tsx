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
  CalendarRange,
} from 'lucide-react';
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

export default function Settlements() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settlements = useSettlements((s) => s.settlements);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Settlement')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Track payouts of your booking revenue — gross, commission, and net.')}</p>
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
                        <CalendarRange className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
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
