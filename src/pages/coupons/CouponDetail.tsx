import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
import {
  ChevronRight,
  BadgePercent,
  Percent,
  Coins,
  CreditCard,
  Calendar as CalendarIcon,
  CalendarRange,
  Hash,
  Tag,
  Clock,
  DoorOpen,
  Pencil,
  Power,
  Trash2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Portal } from '@/shared/ui/portal';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import { formatAmount } from '@/pages/reservations/reservations-data';
import {
  couponStatus,
  couponStatusClass,
  formatDiscount,
} from './coupons-data';
import { useCoupons } from './use-coupons';
import { CouponFormSheet } from './CouponFormSheet';

const NOW = new Date('2026-06-02T10:00:00');

export default function CouponDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const coupon = useCoupons((s) => s.coupons.find((c) => c.id === id));
  const toggleCoupon = useCoupons((s) => s.toggleCoupon);
  const removeCoupon = useCoupons((s) => s.removeCoupon);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!coupon) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Coupon not found.')}</p>
          <button onClick={() => navigate('/coupons')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            {t('Back to Coupon Management')}
          </button>
        </div>
      </div>
    );
  }

  const status = couponStatus(coupon, NOW);
  const daysLeft = differenceInDays(new Date(coupon.expiresAt), NOW);
  const usagePct = coupon.usageLimit > 0 ? Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100) : 0;
  const remaining = coupon.usageLimit > 0 ? Math.max(0, coupon.usageLimit - coupon.usedCount) : null;

  const stats = [
    {
      title: 'Discount',
      Icon: Percent,
      value: coupon.discountType === 'Percentage' ? `${coupon.value}%` : formatAmount(coupon.value),
      subtitle: coupon.discountType === 'Percentage' ? t('Percentage off') : t('Fixed amount off'),
      tone: 'info' as const,
    },
    {
      title: 'Redemptions',
      Icon: Coins,
      value: String(coupon.usedCount),
      subtitle: coupon.usageLimit > 0 ? `${t('of')} ${coupon.usageLimit} ${t('limit')}` : t('Unlimited'),
      tone: 'purple' as const,
    },
    {
      title: 'Minimum spend',
      Icon: CreditCard,
      value: coupon.minSpend > 0 ? formatAmount(coupon.minSpend) : '—',
      subtitle: coupon.minSpend > 0 ? t('To qualify') : t('No minimum'),
      tone: 'success' as const,
    },
    {
      title: 'Expires in',
      Icon: CalendarIcon,
      value: status === 'Expired' ? t('Ended') : `${Math.max(0, daysLeft)} ${t('days')}`,
      subtitle: format(new Date(coupon.expiresAt), 'MMM d, yyyy'),
      tone: 'warning' as const,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/coupons')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">{t('Coupon Management')}</button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">{coupon.code}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <BadgePercent className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{coupon.code}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${couponStatusClass(status)}`}>{t(status)}</span>
              <span className="text-sm text-[var(--text-tertiary)]">{coupon.description}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Edit / Delete hidden for now — coupon control handled by super-admin. */}
          {/* Enable/disable only applies once the super-admin has approved the coupon. */}
          {coupon.approval === 'Approved' && (
            coupon.enabled ? (
              <button onClick={() => toggleCoupon(coupon.id)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                <Power className="w-4 h-4" />
                {t('Disable')}
              </button>
            ) : (
              <button onClick={() => toggleCoupon(coupon.id)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer">
                <Power className="w-4 h-4" />
                {t('Enable')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Approval banner */}
      {coupon.approval === 'Pending' && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3 rounded-md bg-[var(--warning-tint)] border border-[var(--warning-tint)]">
          <Clock className="w-4 h-4 text-[var(--warning-strong)] mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-[var(--warning-strong)]">{t('Awaiting super-admin approval')}</span>
            <span className="text-[var(--text-secondary)]">
              {' — '}{t('this coupon is not live yet.')}
              {coupon.submittedAt ? ` ${t('Submitted')} ${format(new Date(coupon.submittedAt), 'MMM d, yyyy')}.` : ''}
            </span>
          </div>
        </div>
      )}
      {coupon.approval === 'Rejected' && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3 rounded-md bg-[var(--danger-tint)] border border-[var(--danger-tint)]">
          <XCircle className="w-4 h-4 text-[var(--danger)] mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-[var(--danger)]">{t('Rejected by super-admin')}</span>
            {coupon.reviewNote && <span className="text-[var(--text-secondary)]"> — {coupon.reviewNote}</span>}
            <span className="text-[var(--text-secondary)]"> {t('Edit and resubmit for approval.')}</span>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className={`p-2 rounded-md transition-colors ${STAT_TONE[card.tone]}`}>
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: details */}
        <section className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Coupon details')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Discount rules and validity')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
            <InfoRow Icon={Tag} label={t('Discount type')}><span className="text-sm text-[var(--text-primary)]">{coupon.discountType === 'Percentage' ? t('Percentage') : t('Fixed amount')}</span></InfoRow>
            <InfoRow Icon={Percent} label={t('Discount')}><span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatDiscount(coupon)}</span></InfoRow>
            <InfoRow Icon={CreditCard} label={t('Minimum spend')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{coupon.minSpend > 0 ? formatAmount(coupon.minSpend) : t('No minimum')}</span></InfoRow>
            <InfoRow Icon={Hash} label={t('Usage limit')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{coupon.usageLimit > 0 ? coupon.usageLimit : t('Unlimited')}</span></InfoRow>
            <InfoRow Icon={CalendarIcon} label={t('Starts')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{format(new Date(coupon.startsAt), 'MMM d, yyyy')}</span></InfoRow>
            <InfoRow Icon={CalendarRange} label={t('Expires')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{format(new Date(coupon.expiresAt), 'MMM d, yyyy')}</span></InfoRow>
            <InfoRow Icon={Clock} label={t('Created')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{format(new Date(coupon.createdAt), 'MMM d, yyyy')}</span></InfoRow>
            <InfoRow Icon={ShieldCheck} label={t('Approval')}><span className="text-sm text-[var(--text-primary)]">{coupon.approval === 'Pending' ? t('Pending review') : t(coupon.approval)}</span></InfoRow>
            <InfoRow Icon={Clock} label={t('Submitted')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{coupon.submittedAt ? format(new Date(coupon.submittedAt), 'MMM d, yyyy') : '—'}</span></InfoRow>
            <InfoRow Icon={DoorOpen} label={t('Applies to')}>
              {coupon.roomTypes.length === 0 ? (
                <span className="text-sm text-[var(--text-primary)]">{t('All room types')}</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {coupon.roomTypes.map((rt) => (
                    <span key={rt} className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)]">{t(rt)}</span>
                  ))}
                </div>
              )}
            </InfoRow>
          </div>
        </section>

        {/* Right: redemptions */}
        <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Redemptions')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('How often this coupon has been used')}</p>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-[var(--text-primary)] tabular-nums leading-none">{coupon.usedCount}</span>
              <span className="text-sm text-[var(--text-secondary)]">{coupon.usageLimit > 0 ? `${t('of')} ${coupon.usageLimit}` : t('times used')}</span>
            </div>
            {coupon.usageLimit > 0 && (
              <>
                <div className="h-2 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden mt-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${usagePct}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-[var(--brand-primary)] rounded-full" />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-2 tabular-nums">{remaining} {t('redemptions remaining')}</p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Edit sheet */}
      <AnimatePresence>
        {isEditOpen && <CouponFormSheet coupon={coupon} onClose={() => setIsEditOpen(false)} />}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {isDeleteOpen && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[var(--text-primary)]/30 z-50"
              onClick={() => setIsDeleteOpen(false)}
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
                    <h3 className="text-base font-medium text-[var(--text-primary)]">{t('Delete coupon?')}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug">
                      {t('This will permanently remove')} <span className="font-medium text-[var(--text-primary)]">{coupon.code}</span>. {t('This action cannot be undone.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-6">
                  <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
                  <button onClick={() => { removeCoupon(coupon.id); navigate('/coupons'); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--danger)] rounded-md hover:bg-[var(--danger-strong)] transition-colors cursor-pointer">
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
