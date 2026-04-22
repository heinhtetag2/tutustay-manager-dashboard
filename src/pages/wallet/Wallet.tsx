import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  Clock,
  Sparkles,
  Trophy,
  Smartphone,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Check,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { WITHDRAWAL } from '@/shared/config/business';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  usePaymentMethod,
  formatPaymentLabel,
  GATEWAY_LABEL,
} from '@/shared/state/payment-method';
import { DEMO_WALLET, type WalletTx } from './wallet-data';

function formatMnt(value: number): string {
  return `₮${value.toLocaleString('en-US')}`;
}

function formatMntCompact(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${Math.round(value / 1_000)}K`;
  return `₮${value}`;
}

type Filter = 'all' | 'reward' | 'withdrawal' | 'bonus';

export default function Wallet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const method = usePaymentMethod();
  const [w, setW] = useState(DEMO_WALLET);
  const [highlightTxId, setHighlightTxId] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>('all');
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return w.transactions;
    return w.transactions.filter((tx) => tx.kind === filter);
  }, [filter, w.transactions]);

  const canWithdraw = method !== null && w.availableMnt >= WITHDRAWAL.minMnt;
  const methodLabel = method ? formatPaymentLabel(method) : null;

  const onConfirm = (amountMnt: number): string => {
    const id = `tx-${Date.now()}`;
    setW((prev) => ({
      ...prev,
      availableMnt: prev.availableMnt - amountMnt,
      transactions: [
        {
          id,
          kind: 'withdrawal',
          amountMnt,
          status: 'processing',
          date: new Date().toISOString(),
          primary: method
            ? `Withdrawal to ${GATEWAY_LABEL[method.gateway]}`
            : 'Withdrawal',
          secondary: methodLabel
            ? methodLabel.split(' · ').slice(1).join(' · ')
            : '',
        },
        ...prev.transactions,
      ],
    }));
    return id;
  };

  const onDone = (txId: string) => {
    setWithdrawOpen(false);
    setHighlightTxId(txId);
    setFilter('all');
    // Clear highlight after the flash
    window.setTimeout(() => setHighlightTxId(null), 2500);
  };

  const stats = [
    {
      label: t('Pending'),
      value: formatMntCompact(w.pendingMnt),
      hint: `${t('Held 24h')}`,
      Icon: Clock,
    },
    {
      label: t('This month'),
      value: formatMntCompact(w.thisMonthMnt),
      hint: t('Earned in April'),
      Icon: ArrowUpRight,
    },
    {
      label: t('Lifetime'),
      value: formatMntCompact(w.lifetimeMnt),
      hint: t('All-time earnings'),
      Icon: Sparkles,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A]">{t('Wallet')}</h1>
          <p className="text-sm text-[#616161] mt-1">
            {t('Track your rewards, pending earnings, and withdrawals in one place.')}
          </p>
        </div>
      </div>

      {/* Hero balance card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white border border-[#EBEBEB] rounded-md p-5 mb-4 flex flex-col justify-center shadow-none hover:border-[#FFC1B5] transition-colors"
      >
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <span className="text-sm font-medium text-[#616161]">
              {t('Available balance')}
            </span>
            <div className="text-3xl font-medium text-[#1A1A1A] tabular-nums lining-nums mt-3 leading-none">
              <span className="text-[#FF3C21]">{formatMnt(w.availableMnt)}</span>
            </div>
            <div className="text-xs flex items-center gap-1.5 font-medium mt-3">
              <span className="text-[#047857] flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                +{formatMntCompact(15_000)} {t('today')}
              </span>
              <span className="text-[#D4D4D4]">•</span>
              <span className="text-[#616161] font-normal">
                {t('Min. withdraw')} {formatMntCompact(WITHDRAWAL.minMnt)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0 w-full sm:w-auto">
            {method ? (
              <>
                <button
                  onClick={() => setWithdrawOpen(true)}
                  disabled={!canWithdraw}
                  className={cn(
                    'h-10 px-5 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md transition-colors w-full sm:w-auto',
                    canWithdraw
                      ? 'bg-[#FF3C21] hover:bg-[#E63419] text-white cursor-pointer'
                      : 'bg-[#F3F3F3] text-[#8A8A8A] cursor-not-allowed',
                  )}
                >
                  {t('Withdraw')}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-xs text-[#616161] hover:text-[#1A1A1A] flex items-center justify-center sm:justify-start gap-1.5 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {methodLabel}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/settings')}
                  className="h-10 px-5 inline-flex items-center justify-center gap-2 bg-[#FF3C21] hover:bg-[#E63419] text-white text-sm font-medium rounded-md transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  {t('Link payment method')}
                </button>
                <div className="text-xs text-[#616161] text-center sm:text-right">
                  {t('Required to withdraw')}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="bg-white border border-[#EBEBEB] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[#FFC1B5] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[#616161]">{s.label}</span>
              <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A] group-hover:bg-[#FF3C21] group-hover:text-white transition-colors">
                <s.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-medium text-[#1A1A1A] tabular-nums lining-nums">
              {s.value}
            </div>
            <div className="text-xs text-[#4A4A4A] mt-2">{s.hint}</div>
          </motion.div>
        ))}
      </div>

      {/* Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-white border border-[#EBEBEB] rounded-md overflow-hidden"
      >
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-medium text-[#1A1A1A]">
              {t('Activity')}
            </h2>
            <p className="text-xs text-[#616161] mt-0.5">
              {t('Rewards, bonuses, and withdrawals')}
            </p>
          </div>
          <BrandSelect
            value={filter}
            onValueChange={(v) => setFilter(v as Filter)}
            ariaLabel={t('Filter')}
            className="sm:w-auto"
            options={[
              { value: 'all', label: t('All activity') },
              { value: 'reward', label: t('Rewards') },
              { value: 'bonus', label: t('Bonuses') },
              { value: 'withdrawal', label: t('Withdrawals') },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#616161] border-t border-[#F3F3F3]">
            {t('No activity to show yet.')}
          </div>
        ) : (
          <ol className="divide-y divide-[#F3F3F3] border-t border-[#F3F3F3]">
            {filtered.map((tx) => (
              <TxRow key={tx.id} tx={tx} highlight={tx.id === highlightTxId} />
            ))}
          </ol>
        )}
      </motion.div>

      {/* Withdraw drawer */}
      <AnimatePresence>
        {withdrawOpen && methodLabel && (
          <WithdrawDrawer
            available={w.availableMnt}
            method={methodLabel}
            onClose={() => setWithdrawOpen(false)}
            onConfirm={onConfirm}
            onDone={onDone}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TxRow({ tx, highlight }: { tx: WalletTx; highlight?: boolean }) {
  const { t } = useTranslation();
  const incoming = tx.kind !== 'withdrawal';

  const iconCircle = (() => {
    if (tx.kind === 'withdrawal') {
      return { tone: 'bg-[#F3F3F3] text-[#4A4A4A]', Icon: ArrowUpRight };
    }
    if (tx.status === 'held') {
      return { tone: 'bg-[#F3F3F3] text-[#4A4A4A]', Icon: Clock };
    }
    if (tx.kind === 'bonus') {
      return { tone: 'bg-[#F3F3F3] text-[#4A4A4A]', Icon: Trophy };
    }
    return { tone: 'bg-[#F3F3F3] text-[#4A4A4A]', Icon: CheckCircle2 };
  })();

  const { Icon, tone } = iconCircle;

  const statusPill = (() => {
    switch (tx.status) {
      case 'held':
        return { tone: 'text-[#B45309] bg-[#FFFBEB]', label: t('Held') };
      case 'processing':
        return { tone: 'text-[#1D4ED8] bg-[#EFF6FF]', label: t('Processing') };
      case 'failed':
        return { tone: 'text-[#B91C1C] bg-[#FEF2F2]', label: t('Failed') };
      case 'paid':
      default:
        return null;
    }
  })();

  return (
    <motion.li
      initial={highlight ? { backgroundColor: 'rgba(255,60,33,0.08)' } : false}
      animate={{ backgroundColor: 'rgba(255,60,33,0)' }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="flex items-center gap-3 px-4 sm:px-6 py-3.5"
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', tone)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[#1A1A1A] truncate">
            {tx.primary}
          </span>
          {statusPill && (
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-md',
                statusPill.tone,
              )}
            >
              {statusPill.label}
            </span>
          )}
        </div>
        <div className="text-xs text-[#616161] mt-0.5 tabular-nums">
          {tx.secondary} · {format(new Date(tx.date), 'MMM d, yyyy · h:mm a')}
        </div>
      </div>
      <div
        className={cn(
          'text-sm font-medium tabular-nums lining-nums shrink-0',
          incoming ? 'text-[#047857]' : 'text-[#1A1A1A]',
        )}
      >
        {incoming ? '+' : '−'}
        {formatMnt(tx.amountMnt)}
      </div>
    </motion.li>
  );
}

type DrawerStage = 'form' | 'processing' | 'success';

function WithdrawDrawer({
  available,
  method,
  onClose,
  onConfirm,
  onDone,
}: {
  available: number;
  method: string;
  onClose: () => void;
  onConfirm: (amountMnt: number) => string;
  onDone: (txId: string) => void;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<string>(String(available));
  const [stage, setStage] = useState<DrawerStage>('form');
  const [txId, setTxId] = useState<string | null>(null);

  const numericAmount = Number(amount.replace(/\D+/g, '')) || 0;
  const tooSmall = numericAmount < WITHDRAWAL.minMnt;
  const tooLarge = numericAmount > available;
  const invalid = tooSmall || tooLarge || numericAmount === 0;

  const submit = () => {
    if (invalid || stage !== 'form') return;
    setStage('processing');
    // Simulate network — commit the tx, then show success
    window.setTimeout(() => {
      const id = onConfirm(numericAmount);
      setTxId(id);
      setStage('success');
    }, 1100);
  };

  // Block closing mid-processing (user can close on form or success)
  const safeClose = () => {
    if (stage === 'processing') return;
    onClose();
  };

  // Move keyboard focus to the success Done button once it appears
  useEffect(() => {
    if (stage === 'success') {
      const el = document.getElementById('withdraw-done-btn');
      el?.focus();
    }
  }, [stage]);

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={safeClose}
        className="fixed inset-0 z-40 bg-black/40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-white border-l border-[#EBEBEB] flex flex-col"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#EBEBEB]">
          <h2 className="text-base font-medium text-[#1A1A1A]">
            {stage === 'success' ? t('Withdrawal sent') : t('Withdraw')}
          </h2>
          <button
            onClick={safeClose}
            disabled={stage === 'processing'}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              stage === 'processing'
                ? 'text-[#D4D4D4] cursor-not-allowed'
                : 'text-[#616161] hover:bg-[#F3F3F3] cursor-pointer',
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-5">
                  <div className="text-xs font-medium text-[#616161] mb-1.5">
                    {t('Amount')}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-serif text-[#616161] pointer-events-none">
                      ₮
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/\D+/g, ''))
                      }
                      className="w-full h-12 pl-8 pr-4 bg-white border border-[#EBEBEB] rounded-md text-lg font-medium text-[#1A1A1A] tabular-nums lining-nums focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] transition-colors"
                    />
                  </div>
                  <div className="text-xs text-[#616161] mt-1.5 flex items-center justify-between">
                    <span>
                      {t('Available')}: {formatMnt(available)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAmount(String(available))}
                      className="font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors cursor-pointer"
                    >
                      {t('Use max')}
                    </button>
                  </div>
                  {tooSmall && numericAmount > 0 && (
                    <div className="text-xs text-[#B91C1C] mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {t('Minimum withdrawal is')} {formatMnt(WITHDRAWAL.minMnt)}
                    </div>
                  )}
                  {tooLarge && (
                    <div className="text-xs text-[#B91C1C] mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {t('Exceeds available balance')}
                    </div>
                  )}
                </div>

                <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-md p-4 mb-5">
                  <div className="text-xs font-medium text-[#616161] mb-2">
                    {t('Deposit to')}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-white border border-[#EBEBEB] flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="text-sm font-medium text-[#1A1A1A]">{method}</div>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-[#616161]">
                  <li>• {t('Funds arrive within minutes on weekdays.')}</li>
                  <li>• {t('Amounts earned in the last 24h remain pending until released.')}</li>
                  <li>• {t('No fee on withdrawals to QPay.')}</li>
                </ul>
              </div>

              <div className="p-4 border-t border-[#EBEBEB] flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 px-4 border border-[#EBEBEB] text-sm font-medium text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] rounded-md transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  disabled={invalid}
                  onClick={submit}
                  className={cn(
                    'flex-1 h-10 px-4 text-sm font-medium rounded-md transition-colors',
                    invalid
                      ? 'bg-[#EBEBEB] text-[#8A8A8A] cursor-not-allowed'
                      : 'bg-[#FF3C21] hover:bg-[#E63419] text-white cursor-pointer',
                  )}
                >
                  {t('Withdraw')}{' '}
                  {numericAmount > 0 ? formatMntCompact(numericAmount) : ''}
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="mb-5 text-[#FF3C21]"
              >
                <Loader2 className="w-10 h-10" />
              </motion.div>
              <div className="text-lg font-serif text-[#1A1A1A] mb-1">
                {t('Sending')} {formatMnt(numericAmount)}
              </div>
              <div className="text-sm text-[#616161] max-w-[260px]">
                {t('Reaching')} {method}…
              </div>
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center pt-10">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 18,
                  }}
                  className="relative w-14 h-14 rounded-full bg-[#ECFDF5] text-[#047857] flex items-center justify-center mb-4"
                >
                  <Check className="w-7 h-7" strokeWidth={3} />
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-2 border-[#047857]"
                  />
                </motion.div>

                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-1">
                  {t('Withdrawal on its way')}
                </h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-[320px] mb-6">
                  {formatMnt(numericAmount)} {t('will land in')} {method}{' '}
                  {t('within a few minutes.')}
                </p>

                <div className="w-full bg-[#FAFAFA] border border-[#EBEBEB] rounded-md p-4 text-left">
                  <Row
                    label={t('Amount')}
                    value={formatMnt(numericAmount)}
                    emphasis
                  />
                  <Row label={t('Deposit to')} value={method} />
                  <Row
                    label={t('Status')}
                    value={
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-[#1D4ED8] bg-[#EFF6FF]">
                        {t('Processing')}
                      </span>
                    }
                  />
                  <Row
                    label={t('Estimated arrival')}
                    value={t('Within 5 min')}
                    last
                  />
                </div>
              </div>

              <div className="p-4 border-t border-[#EBEBEB] flex gap-3">
                <button
                  onClick={() => onClose()}
                  className="flex-1 h-10 px-4 border border-[#EBEBEB] text-sm font-medium text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] rounded-md transition-colors cursor-pointer"
                >
                  {t('Close')}
                </button>
                <button
                  id="withdraw-done-btn"
                  onClick={() => txId && onDone(txId)}
                  className="flex-1 h-10 px-4 inline-flex items-center justify-center gap-2 bg-[#FF3C21] hover:bg-[#E63419] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
                >
                  {t('View activity')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>,
    document.body,
  );
}

function Row({
  label,
  value,
  emphasis,
  last,
}: {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2.5',
        !last && 'border-b border-[#F3F3F3]',
      )}
    >
      <span className="text-xs text-[#616161]">{label}</span>
      <span
        className={cn(
          'text-sm tabular-nums lining-nums',
          emphasis
            ? 'font-medium text-[#FF3C21]'
            : 'font-medium text-[#1A1A1A]',
        )}
      >
        {value}
      </span>
    </div>
  );
}
