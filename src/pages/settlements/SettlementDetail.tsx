import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import {
  ChevronRight,
  Landmark,
  Coins,
  Percent,
  Receipt,
  Banknote,
  Hash,
  CalendarRange,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  formatAmount,
  commissionAmount,
  netAmount,
  settlementStatusClass,
} from './settlements-data';
import { useSettlements } from './use-settlements';

export default function SettlementDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const settlement = useSettlements((s) => s.settlements.find((x) => x.id === id));
  const markPaid = useSettlements((s) => s.markPaid);

  if (!settlement) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Settlement not found.')}</p>
          <button onClick={() => navigate('/settlements')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            {t('Back to Settlement')}
          </button>
        </div>
      </div>
    );
  }

  const commission = commissionAmount(settlement);
  const net = netAmount(settlement);
  const period = `${format(new Date(settlement.periodStart), 'MMM d')} – ${format(new Date(settlement.periodEnd), 'MMM d, yyyy')}`;

  const stats = [
    { title: 'Gross revenue', Icon: Coins, value: formatAmount(settlement.grossAmount), subtitle: `${settlement.bookingsCount} ${t('bookings')}` },
    { title: 'Commission', Icon: Percent, value: `−${formatAmount(commission)}`, subtitle: `${Math.round(settlement.commissionRate * 100)}% ${t('platform fee')}` },
    { title: 'Adjustments', Icon: Receipt, value: settlement.adjustments > 0 ? `−${formatAmount(settlement.adjustments)}` : '—', subtitle: t('Refunds & cancellations') },
    { title: 'Net payout', Icon: Banknote, value: formatAmount(net), subtitle: t('Amount transferred') },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/settlements')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">{t('Settlement')}</button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">{settlement.reference}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{settlement.reference}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${settlementStatusClass(settlement.status)}`}>{t(settlement.status)}</span>
              <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{period}</span>
            </div>
          </div>
        </div>

        {settlement.status !== 'Paid' && (
          <button
            onClick={() => markPaid(settlement.id, new Date().toISOString())}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('Mark as paid')}
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: breakdown */}
        <section className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Settlement details')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Period, revenue and payout breakdown')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
            <InfoRow Icon={CalendarRange} label={t('Period')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{period}</span></InfoRow>
            <InfoRow Icon={Hash} label={t('Bookings')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{settlement.bookingsCount}</span></InfoRow>
            <InfoRow Icon={Coins} label={t('Gross revenue')}><span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(settlement.grossAmount)}</span></InfoRow>
            <InfoRow Icon={Percent} label={t('Commission')}><span className="text-sm text-[var(--text-primary)] tabular-nums">−{formatAmount(commission)} · {Math.round(settlement.commissionRate * 100)}%</span></InfoRow>
            <InfoRow Icon={Receipt} label={t('Adjustments')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{settlement.adjustments > 0 ? `−${formatAmount(settlement.adjustments)}` : '—'}</span></InfoRow>
            <InfoRow Icon={Banknote} label={t('Net payout')}><span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(net)}</span></InfoRow>
            <InfoRow Icon={Landmark} label={t('Payout method')}><span className="text-sm text-[var(--text-primary)]">{settlement.payoutMethod}</span></InfoRow>
            <InfoRow Icon={Clock} label={settlement.status === 'Paid' ? t('Settled on') : t('Scheduled for')}>
              <span className="text-sm text-[var(--text-primary)] tabular-nums">
                {settlement.status === 'Paid'
                  ? settlement.settledAt ? format(new Date(settlement.settledAt), 'MMM d, yyyy') : '—'
                  : settlement.scheduledFor ? format(new Date(settlement.scheduledFor), 'MMM d, yyyy') : '—'}
              </span>
            </InfoRow>
          </div>
        </section>

        {/* Right: payout summary */}
        <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Payout')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('How the net payout is calculated')}</p>
          </div>
          <div className="px-6 py-5">
            <div className="text-3xl font-serif text-[var(--text-primary)] tabular-nums leading-none">{formatAmount(net)}</div>
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full mt-3 ${settlementStatusClass(settlement.status)}`}>{t(settlement.status)}</span>

            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{t('Gross revenue')}</span>
                <span className="text-[var(--text-primary)] tabular-nums">{formatAmount(settlement.grossAmount)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{t('Commission')} · {Math.round(settlement.commissionRate * 100)}%</span>
                <span className="text-[var(--text-primary)] tabular-nums">−{formatAmount(commission)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{t('Adjustments')}</span>
                <span className="text-[var(--text-primary)] tabular-nums">{settlement.adjustments > 0 ? `−${formatAmount(settlement.adjustments)}` : '—'}</span>
              </li>
              <li className="flex items-center justify-between border-t border-[var(--surface-subtle)] pt-2.5">
                <span className="font-medium text-[var(--text-primary)]">{t('Net payout')}</span>
                <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(net)}</span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-[var(--surface-subtle)] flex items-start gap-2.5">
              <Landmark className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
              <div className="text-xs text-[var(--text-secondary)]">
                <div className="text-[var(--text-primary)]">{settlement.payoutMethod}</div>
                <div className="mt-0.5 tabular-nums">
                  {settlement.status === 'Paid'
                    ? `${t('Settled')} ${settlement.settledAt ? format(new Date(settlement.settledAt), 'MMM d, yyyy') : ''}`
                    : `${t('Scheduled')} ${settlement.scheduledFor ? format(new Date(settlement.scheduledFor), 'MMM d, yyyy') : ''}`}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function InfoRow({ Icon, label, children }: { Icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 text-[var(--text-tertiary)]">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}
