import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
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
  Trash2,
} from 'lucide-react';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Portal } from '@/shared/ui/portal';
import { formatAmount } from '@/pages/reservations/reservations-data';
import {
  couponStatus,
  couponStatusClass,
  formatDiscount,
  formatScope,
  COUPON_STATUSES,
  type CouponStatus,
} from './coupons-data';
import { useCoupons } from './use-coupons';
import { CouponFormSheet } from './CouponFormSheet';

const NOW = new Date('2026-06-02T10:00:00');

type StatusFilter = 'All' | CouponStatus;

export default function Coupons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const coupons = useCoupons((s) => s.coupons);
  const removeCoupon = useCoupons((s) => s.removeCoupon);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
    { title: 'Total coupons', Icon: TicketPercent, value: String(counts.total), subtitle: t('All coupons') },
    { title: 'Active', Icon: CheckCircle2, value: String(counts.active), subtitle: t('Redeemable now') },
    { title: 'Redemptions', Icon: Coins, value: formatAmount(counts.redemptions), subtitle: t('Total times used') },
    { title: 'Expiring soon', Icon: Clock, value: String(counts.expiringSoon), subtitle: t('Within 14 days') },
  ];

  const query = search.trim().toLowerCase();
  const filtered = withStatus.filter(({ coupon, status }) => {
    if (statusFilter !== 'All' && status !== statusFilter) return false;
    if (query && !`${coupon.code} ${coupon.description}`.toLowerCase().includes(query)) return false;
    return true;
  });

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
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-md transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('New coupon')}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search by code or description')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
        </div>
        <BrandSelect
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          leftIcon={<ListFilter />}
          className="sm:w-auto"
          options={[{ value: 'All', label: t('All statuses') }, ...COUPON_STATUSES.map((s) => ({ value: s, label: t(s) }))]}
        />
      </div>

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)]">
                <th className="pl-6 pr-3 py-4 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle" aria-label={t('Select all')} />
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Code')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Discount')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Applies to')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Validity')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Usage')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">{t('No coupons match your filters.')}</td>
                  {/* colSpan accounts for the select column + 6 data columns */}
                </tr>
              ) : (
                filtered.map(({ coupon: c, status }) => {
                  const usagePct = c.usageLimit > 0 ? Math.min(100, (c.usedCount / c.usageLimit) * 100) : 0;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/coupons/${c.id}`)}
                      className={`border-b border-[var(--surface-subtle)] last:border-0 transition-colors cursor-pointer group ${selected.has(c.id) ? 'bg-[var(--brand-tint)]/40' : 'hover:bg-[var(--surface-muted)]'}`}
                    >
                      <td className="pl-6 pr-3 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle" aria-label={t('Select row')} />
                      </td>
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
