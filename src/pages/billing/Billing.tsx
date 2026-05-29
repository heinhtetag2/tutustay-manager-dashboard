import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Portal } from '@/shared/ui/portal';
import {
  CreditCard,
  Sparkles,
  Check,
  ArrowRight,
  Building2,
  Smartphone,
  Landmark,
  ChevronRight,
  Receipt,
  X,
  Download,
} from 'lucide-react';

type PackageId = 'starter' | 'popular' | 'growth' | 'enterprise';
type PaymentId = 'qpay' | 'social' | 'bank';

interface Pkg {
  id: PackageId;
  name: string;
  amount: string;
  bonus?: string;
  badge?: string;
}

const PACKAGES: Pkg[] = [
  { id: 'starter', name: 'Starter', amount: '₩100K' },
  { id: 'popular', name: 'Popular', amount: '₩500K', bonus: '+₩50K bonus', badge: 'Most Popular' },
  { id: 'growth', name: 'Growth', amount: '₩1,000K', bonus: '+₩150K bonus', badge: '15% bonus' },
  { id: 'enterprise', name: 'Enterprise', amount: '₩5,000K', bonus: '+₩1,000K bonus', badge: '20% bonus' },
];

type InvoiceStatus = 'Paid' | 'Upcoming' | 'Overdue';
interface Invoice {
  id: string;
  dueDate: string;
  issueDate: string;
  description: string;
  status: InvoiceStatus;
  total: number | null;
  paymentMethod: string;
  periodStart: string;
  periodEnd: string;
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-05', dueDate: 'May 14, 2026', issueDate: 'May 14, 2026', description: 'Monthly invoice', status: 'Upcoming', total: null, paymentMethod: 'QPay', periodStart: 'May 14, 2026', periodEnd: 'Jun 14, 2026' },
  { id: 'INV-2026-04', dueDate: 'Apr 14, 2026', issueDate: 'Apr 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'QPay', periodStart: 'Apr 14, 2026', periodEnd: 'May 14, 2026' },
  { id: 'INV-2026-03', dueDate: 'Mar 14, 2026', issueDate: 'Mar 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'Bank Transfer', periodStart: 'Mar 14, 2026', periodEnd: 'Apr 14, 2026' },
  { id: 'INV-2026-02', dueDate: 'Feb 14, 2026', issueDate: 'Feb 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'QPay', periodStart: 'Feb 14, 2026', periodEnd: 'Mar 14, 2026' },
  { id: 'INV-2026-01', dueDate: 'Jan 14, 2026', issueDate: 'Jan 14, 2026', description: 'Monthly invoice', status: 'Paid', total: 500_000, paymentMethod: 'Social Pay', periodStart: 'Jan 14, 2026', periodEnd: 'Feb 14, 2026' },
];

type ActivityKind = 'subscription' | 'topup';

interface Activity {
  id: string;
  kind: ActivityKind;
  date: string;
  label: string;
  status: InvoiceStatus;
  amount: number | null;
  method: string;
  invoice: Invoice;
}

const subscriptionActivities: Activity[] = INVOICES.map((inv) => ({
  id: inv.id,
  kind: 'subscription',
  date: inv.issueDate,
  label: 'Growth plan — monthly subscription',
  status: inv.status,
  amount: inv.total,
  method: inv.paymentMethod,
  invoice: inv,
}));

const topupActivities: Activity[] = [
  { id: 'TOP-2026-04-21', kind: 'topup', date: 'Apr 21, 2026', label: 'Credit top-up — Growth package', status: 'Paid', amount: 1_000_000, method: 'QPay', invoice: { id: 'TOP-2026-04-21', dueDate: 'Apr 21, 2026', issueDate: 'Apr 21, 2026', description: 'Credit top-up — Growth package', status: 'Paid', total: 1_000_000, paymentMethod: 'QPay', periodStart: 'Apr 21, 2026', periodEnd: 'One-time' } },
  { id: 'TOP-2026-04-10', kind: 'topup', date: 'Apr 10, 2026', label: 'Credit top-up — Popular package', status: 'Paid', amount: 500_000, method: 'Bank Transfer', invoice: { id: 'TOP-2026-04-10', dueDate: 'Apr 10, 2026', issueDate: 'Apr 10, 2026', description: 'Credit top-up — Popular package', status: 'Paid', total: 500_000, paymentMethod: 'Bank Transfer', periodStart: 'Apr 10, 2026', periodEnd: 'One-time' } },
];

const ACTIVITY: Activity[] = [...subscriptionActivities, ...topupActivities].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

function formatMnt(value: number): string {
  return `₩${value.toLocaleString('en-US')}`;
}

export default function Billing() {
  const { t } = useTranslation();
  const [selectedPkg, setSelectedPkg] = useState<PackageId | null>('popular');
  const [selectedPayment, setSelectedPayment] = useState<PaymentId>('qpay');
  const [openInvoice, setOpenInvoice] = useState<Invoice | null>(null);

  const renewsOn = new Date();
  renewsOn.setDate(renewsOn.getDate() + 23);
  const renewsLabel = renewsOn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const paymentMethods: { id: PaymentId; label: string; Icon: React.ElementType }[] = [
    { id: 'qpay', label: 'QPay', Icon: Smartphone },
    { id: 'social', label: 'Social Pay', Icon: CreditCard },
    { id: 'bank', label: 'Bank Transfer', Icon: Landmark },
  ];

  const selectedPackageObj = PACKAGES.find((p) => p.id === selectedPkg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Billing & Credits')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t('Manage your credits and view transaction history.')}
        </p>
      </div>

      {/* Hero — Available Credits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative overflow-hidden bg-[var(--text-primary)] rounded-md p-8 mb-8"
      >
        {/* Soft brand glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full bg-[var(--brand-primary)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 w-[320px] h-[320px] rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2">{t('Available Credits')}</p>
            <h2 className="text-5xl font-medium text-white mb-4 tabular-nums tracking-tight">₩450,000</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-md text-[11px] font-medium text-white backdrop-blur-sm">
              <Building2 className="w-3 h-3" />
              {t('GROWTH plan')}
            </span>
          </div>

          <div className="shrink-0 p-2.5 bg-white/10 border border-white/15 rounded-md text-white/80 backdrop-blur-sm">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Top Up Credits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-[var(--border-default)] rounded-md p-6 mb-6 shadow-none"
      >
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="text-base font-medium text-[var(--text-primary)]">{t('Top Up Credits')}</h3>
        </div>

        {/* Package grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {PACKAGES.map((pkg) => {
            const isActive = selectedPkg === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg.id)}
                className={`relative text-left p-4 rounded-md border transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-tint)]'
                    : 'border-[var(--border-default)] bg-white hover:border-[var(--brand-border)]'
                }`}
              >
                {pkg.badge && (
                  <span
                    className={`absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-full ${
                      isActive
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'bg-[var(--brand-tint)] text-[var(--brand-primary)]'
                    }`}
                  >
                    {t(pkg.badge)}
                  </span>
                )}
                <div className="text-sm font-medium text-[var(--text-tertiary)] mb-1">{t(pkg.name)}</div>
                <div className={`text-2xl font-medium tabular-nums ${isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'}`}>
                  {pkg.amount}
                </div>
                {pkg.bonus && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--success)]">
                    <Sparkles className="w-3 h-3" />
                    {pkg.bonus}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment methods */}
        <div className="mb-5">
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            {t('Payment method')}
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map(({ id, label, Icon }) => {
              const isActive = selectedPayment === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPayment(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-tint)] text-[var(--brand-primary)]'
                      : 'border-[var(--border-default)] bg-white text-[var(--text-tertiary)] hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={!selectedPkg}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
            selectedPkg
              ? 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] cursor-pointer'
              : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'
          }`}
        >
          {selectedPackageObj
            ? `${t('Purchase')} ${selectedPackageObj.amount}`
            : t('Select a package')}
          {selectedPkg && <ArrowRight className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Your Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white border border-[var(--border-default)] rounded-md p-6 mb-6 shadow-none"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[var(--text-primary)]">
                {t('Your Plan')} <span className="text-[var(--text-secondary)] font-normal">— {t('Growth')}</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('Next monthly invoice due')} <span className="tabular-nums">{renewsLabel}</span>
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            {t('Upgrade plan')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {[
            'Up to 20 active surveys',
            '5,000 responses/month',
            'Advanced analytics',
            'Priority support',
            'Demographic targeting',
            'Custom branding',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--success-tint)] text-[var(--success)] shrink-0">
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
              {t(feature)}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Billing Activity — subscription invoices + credit top-ups */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden shadow-none"
      >
        <div className="px-6 pt-5 pb-4">
          <h3 className="text-base font-medium text-[var(--text-primary)]">{t('Billing Activity')}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {t('Your subscription invoices and credit top-ups')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium">
                <th className="px-6 py-3 font-medium">{t('Date')}</th>
                <th className="px-6 py-3 font-medium">{t('Description')}</th>
                <th className="px-6 py-3 font-medium">{t('Status')}</th>
                <th className="px-6 py-3 font-medium text-right">{t('Amount')}</th>
                <th className="px-6 py-3 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {ACTIVITY.map((item, index) => {
                const statusBadge =
                  item.status === 'Paid'
                    ? 'bg-[var(--success-tint)] text-[var(--success)]'
                    : item.status === 'Overdue'
                    ? 'bg-[var(--danger-tint)] text-[var(--danger-strong)]'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]';

                const Icon = item.kind === 'subscription' ? Receipt : Sparkles;

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => setOpenInvoice(item.invoice)}
                    className="hover:bg-[var(--surface-muted)] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--surface-subtle)] text-[var(--text-tertiary)] shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="font-medium text-[var(--text-primary)]">{t(item.label)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusBadge}`}>
                        {t(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium tabular-nums text-[var(--text-primary)]">
                      {item.amount === null ? <span className="text-[var(--text-muted)]">—</span> : formatMnt(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors" />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Invoice Detail Drawer */}
      <Portal>
      <AnimatePresence>
        {openInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenInvoice(null)}
            className="fixed inset-0 bg-[var(--text-primary)]/30 z-50 flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white h-full overflow-y-auto border-l border-[var(--border-default)] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-[var(--surface-subtle)] flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${
                      openInvoice.status === 'Paid'
                        ? 'bg-[var(--success-tint)] text-[var(--success)]'
                        : openInvoice.status === 'Overdue'
                        ? 'bg-[var(--danger-tint)] text-[var(--danger-strong)]'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-medium text-[var(--text-primary)]">{t(openInvoice.description)}</h2>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${
                          openInvoice.status === 'Paid'
                            ? 'bg-[var(--success-tint)] text-[var(--success)]'
                            : openInvoice.status === 'Overdue'
                            ? 'bg-[var(--danger-tint)] text-[var(--danger-strong)]'
                            : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'
                        }`}
                      >
                        {t(openInvoice.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {t('Invoice issue date')} <span className="tabular-nums">{openInvoice.issueDate}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenInvoice(null)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer shrink-0"
                  aria-label={t('Close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Meta grid */}
              <div className="px-6 py-5 border-b border-[var(--surface-subtle)] grid grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">{t('Due date')}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{openInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">{t('Status')}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t(openInvoice.status)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">{t('Invoice number')}</p>
                  <button className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors tabular-nums cursor-pointer">
                    {openInvoice.id}
                  </button>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">{t('Payment method')}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t(openInvoice.paymentMethod)}</p>
                </div>
              </div>

              {/* Monthly costs */}
              <div className="px-6 py-5 border-b border-[var(--surface-subtle)]">
                <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">{t('Monthly costs')}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {t('This covers your workspace from')}{' '}
                  <span className="tabular-nums">{openInvoice.periodStart}</span> {t('to')}{' '}
                  <span className="tabular-nums">{openInvoice.periodEnd}</span>.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">{t('Growth plan — monthly subscription')}</span>
                    <span className="text-[var(--text-primary)] font-medium tabular-nums">
                      {openInvoice.total !== null ? formatMnt(500_000) : formatMnt(500_000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">{t('5,000 response credits included')}</span>
                    <span className="text-[var(--text-primary)] font-medium tabular-nums">₩0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">{t('Additional top-up credits')}</span>
                    <span className="text-[var(--text-primary)] font-medium tabular-nums">₩0</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="px-6 py-5 border-b border-[var(--surface-subtle)] space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-tertiary)]">{t('Subtotal')}</span>
                  <span className="text-[var(--text-primary)] font-medium tabular-nums">{formatMnt(500_000)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-tertiary)]">{t('VAT (0%)')}</span>
                  <span className="text-[var(--text-primary)] font-medium tabular-nums">₩0</span>
                </div>
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-[var(--surface-subtle)]">
                  <span className="text-base font-medium text-[var(--text-primary)]">{t('Total')}</span>
                  <span className="text-base font-medium text-[var(--text-primary)] tabular-nums">
                    {openInvoice.total === null ? formatMnt(500_000) : formatMnt(openInvoice.total)}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="px-6 py-5 mt-auto">
                <button
                  disabled={openInvoice.status === 'Upcoming'}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    openInvoice.status === 'Upcoming'
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed'
                      : 'bg-white text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-muted)] cursor-pointer'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('Download invoice')}
                </button>
                {openInvoice.status === 'Upcoming' && (
                  <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">
                    {t('Available after this invoice is paid.')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </motion.div>
  );
}
