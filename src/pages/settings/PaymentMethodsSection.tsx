import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import {
  Smartphone,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  usePaymentMethod,
  setPaymentMethod,
  formatPaymentLabel,
  GATEWAY_LABEL,
  type PaymentGateway,
  type PaymentMethod,
} from '@/shared/state/payment-method';

type EditState =
  | { kind: 'closed' }
  | { kind: 'editing' }
  | { kind: 'adding'; gateway: PaymentGateway }
  | { kind: 'confirm-remove' };

interface GatewayMeta {
  gateway: PaymentGateway;
  tagline: string;
  speed: string;
  fee: string;
  recommended?: boolean;
}

const GATEWAYS: GatewayMeta[] = [
  {
    gateway: 'qpay',
    tagline: 'Most popular in Mongolia',
    speed: 'Instant',
    fee: 'No fee',
    recommended: true,
  },
  {
    gateway: 'bonum',
    tagline: 'Bank-backed transfers',
    speed: '1–3 days',
    fee: 'No fee',
  },
  {
    gateway: 'socialpay',
    tagline: 'Golomt Bank wallet',
    speed: 'Instant',
    fee: 'No fee',
  },
];

export default function PaymentMethodsSection() {
  const { t } = useTranslation();
  const method = usePaymentMethod();
  const [edit, setEdit] = useState<EditState>({ kind: 'closed' });

  return (
    <div className="space-y-8 pb-20">
      {method ? (
        <>
          {/* Linked account */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
              {t('Linked account')}
            </h3>
            <div className="bg-white border border-[var(--border-default)] rounded-md p-4 sm:p-6">
              <LinkedAccount
                method={method}
                onEdit={() => setEdit({ kind: 'editing' })}
                onRemove={() => setEdit({ kind: 'confirm-remove' })}
              />
            </div>
          </div>

          {/* Supported methods */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
              {t('Supported methods')}
            </h3>
            <div className="bg-white border border-[var(--border-default)] rounded-md divide-y divide-[var(--surface-subtle)]">
              {GATEWAYS.map((g) => (
                <div key={g.gateway} className="flex items-center gap-3 px-4 sm:px-5 py-4">
                  <GatewayGlyph gateway={g.gateway} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {GATEWAY_LABEL[g.gateway]}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {g.speed} · {g.fee}
                    </div>
                  </div>
                  {method.gateway === g.gateway && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md text-[var(--success)] bg-[var(--success-tint)]">
                      {t('Linked')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <EmptyState
            onPick={(gateway) => setEdit({ kind: 'adding', gateway })}
          />
        </div>
      )}

      <AnimatePresence>
        {(edit.kind === 'editing' || edit.kind === 'adding') && (
          <EditMethodDrawer
            initial={edit.kind === 'editing' ? method : null}
            preselectedGateway={
              edit.kind === 'adding' ? edit.gateway : undefined
            }
            onClose={() => setEdit({ kind: 'closed' })}
            onSave={(next) => setPaymentMethod(next)}
            onDone={() => setEdit({ kind: 'closed' })}
          />
        )}

        {edit.kind === 'confirm-remove' && (
          <ConfirmRemoveModal
            onCancel={() => setEdit({ kind: 'closed' })}
            onConfirm={() => {
              setPaymentMethod(null);
              setEdit({ kind: 'closed' });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GatewayGlyph({
  gateway,
  size = 'md',
}: {
  gateway: PaymentGateway;
  size?: 'sm' | 'md' | 'lg';
}) {
  const tone = (() => {
    switch (gateway) {
      case 'qpay':
        return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
      case 'bonum':
        return 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]';
      case 'socialpay':
        return 'bg-[var(--success-tint)] text-[var(--success)]';
    }
  })();

  const letter = gateway === 'qpay' ? 'Q' : gateway === 'bonum' ? 'B' : 'S';

  const dims =
    size === 'lg' ? 'w-12 h-12 text-lg' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

  return (
    <div
      className={cn(
        'rounded-md flex items-center justify-center shrink-0 font-medium tracking-tight',
        dims,
        tone,
      )}
    >
      {letter}
    </div>
  );
}

function EmptyState({
  onPick,
}: {
  onPick: (gateway: PaymentGateway) => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Intro */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
          {t('Link a payment method')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('Choose where to receive your survey rewards.')}
        </p>
      </div>

      {/* Gateway cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {GATEWAYS.map((g) => (
          <button
            key={g.gateway}
            type="button"
            onClick={() => onPick(g.gateway)}
            className="group text-left bg-white border border-[var(--border-default)] rounded-md p-5 hover:border-[var(--brand-border)] transition-colors cursor-pointer flex items-start gap-3"
          >
            <GatewayGlyph gateway={g.gateway} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {GATEWAY_LABEL[g.gateway]}
                </span>
                {g.recommended && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-[var(--brand-primary)] bg-[var(--brand-tint)]">
                    {t('Recommended')}
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                {g.speed} · {g.fee}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0 mt-0.5" />
          </button>
        ))}
      </div>

      {/* Reassurance — single compact line */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
        {t('Used only to deposit your rewards. Change or remove anytime.')}
      </div>
    </div>
  );
}

function LinkedAccount({
  method,
  onEdit,
  onRemove,
}: {
  method: PaymentMethod;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4 min-w-0 sm:flex-1">
        <GatewayGlyph gateway={method.gateway} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--text-primary)] break-all">
              {formatPaymentLabel(method)}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-[var(--success)] bg-[var(--success-tint)] whitespace-nowrap">
              {t('Active')}
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            {method.accountName} · {t('Linked')}{' '}
            {format(new Date(method.linkedAt), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        <button
          onClick={onEdit}
          className="flex-1 sm:flex-none px-3 py-2 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          {t('Change')}
        </button>
        <button
          onClick={onRemove}
          className="flex-1 sm:flex-none px-3 py-2 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--danger-strong)] hover:bg-[var(--danger-tint)] hover:border-[var(--danger-tint)] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('Remove')}
        </button>
      </div>
    </div>
  );
}

type DrawerStage = 'form' | 'processing' | 'success';

function EditMethodDrawer({
  initial,
  preselectedGateway,
  onClose,
  onSave,
  onDone,
}: {
  initial: PaymentMethod | null;
  preselectedGateway?: PaymentGateway;
  onClose: () => void;
  onSave: (m: PaymentMethod) => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<DrawerStage>('form');
  const [gateway, setGateway] = useState<PaymentGateway>(
    initial?.gateway ?? preselectedGateway ?? 'qpay',
  );
  const [phone, setPhone] = useState(initial?.phone ?? '+976');
  const [accountName, setAccountName] = useState(initial?.accountName ?? '');
  const [finalMethod, setFinalMethod] = useState<PaymentMethod | null>(null);

  const digits = phone.replace(/\D/g, '');
  const phoneValid = digits.length >= 11 && digits.startsWith('976');
  const nameValid = accountName.trim().length >= 2;
  const valid = phoneValid && nameValid;

  const submit = () => {
    if (!valid || stage !== 'form') return;
    setStage('processing');
    window.setTimeout(() => {
      const next: PaymentMethod = {
        gateway,
        phone,
        accountName: accountName.trim(),
        linkedAt: initial?.linkedAt ?? new Date().toISOString(),
      };
      onSave(next);
      setFinalMethod(next);
      setStage('success');
    }, 1200);
  };

  const safeClose = () => {
    if (stage === 'processing') return;
    onClose();
  };

  const headerTitle = (() => {
    if (stage === 'success') {
      return initial ? t('Payment method updated') : t('Payment method linked');
    }
    return initial ? t('Change payment method') : t('Link payment method');
  })();

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
        className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-white border-l border-[var(--border-default)] flex flex-col"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-default)]">
          <h2 className="text-base font-medium text-[var(--text-primary)]">{headerTitle}</h2>
          <button
            onClick={safeClose}
            disabled={stage === 'processing'}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              stage === 'processing'
                ? 'text-[var(--border-strong)] cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] cursor-pointer',
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
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Chosen gateway preview */}
                <div className="bg-[var(--surface-muted)] border border-[var(--border-default)] rounded-md p-4 flex items-center gap-3">
                  <GatewayGlyph gateway={gateway} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {GATEWAY_LABEL[gateway]}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {GATEWAYS.find((g) => g.gateway === gateway)?.speed} ·{' '}
                      {GATEWAYS.find((g) => g.gateway === gateway)?.fee}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t('Gateway')}
                  </label>
                  <BrandSelect
                    value={gateway}
                    onValueChange={(v) => setGateway(v as PaymentGateway)}
                    ariaLabel={t('Gateway')}
                    leftIcon={<Smartphone />}
                    options={[
                      { value: 'qpay', label: 'QPay' },
                      { value: 'bonum', label: 'Bonum' },
                      { value: 'socialpay', label: 'SocialPay' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t('Phone number')}
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+976 9999 1212"
                    className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors"
                  />
                  {!phoneValid && digits.length > 3 && (
                    <div className="text-xs text-[var(--danger)] mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {t('Enter a valid Mongolian number (+976 ...)')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t('Account holder name')}
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={t('As it appears on your account')}
                    className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors"
                  />
                </div>

                <div className="bg-[var(--surface-muted)] border border-[var(--border-default)] rounded-md p-4 text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                  <span>
                    {t('We only use this account to deposit your survey rewards. You can change or remove it anytime.')}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-default)] flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 px-4 border border-[var(--border-default)] text-sm font-medium text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] rounded-md transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={submit}
                  disabled={!valid}
                  className={cn(
                    'flex-1 h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md transition-colors',
                    valid
                      ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white cursor-pointer'
                      : 'bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed',
                  )}
                >
                  <Check className="w-4 h-4" />
                  {initial ? t('Save changes') : t('Link account')}
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
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                className="mb-5 text-[var(--brand-primary)]"
              >
                <Loader2 className="w-10 h-10" />
              </motion.div>
              <div className="text-lg font-serif text-[var(--text-primary)] mb-1">
                {t('Verifying your account')}
              </div>
              <div className="text-sm text-[var(--text-secondary)] max-w-[280px]">
                {t('Connecting to')} {GATEWAY_LABEL[gateway]}…
              </div>
            </motion.div>
          )}

          {stage === 'success' && finalMethod && (
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
                  className="relative w-14 h-14 rounded-full bg-[var(--success-tint)] text-[var(--success)] flex items-center justify-center mb-4"
                >
                  <Check className="w-7 h-7" strokeWidth={3} />
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-2 border-[var(--success)]"
                  />
                </motion.div>

                <h3 className="text-2xl font-serif text-[var(--text-primary)] mb-1">
                  {GATEWAY_LABEL[finalMethod.gateway]} {t('linked')}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-[320px] mb-6">
                  {t('Your survey rewards will now deposit to this account.')}
                </p>

                <div className="w-full bg-[var(--surface-muted)] border border-[var(--border-default)] rounded-md p-4 text-left flex items-center gap-3">
                  <GatewayGlyph gateway={finalMethod.gateway} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {formatPaymentLabel(finalMethod)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {finalMethod.accountName}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-[var(--success)] bg-[var(--success-tint)]">
                    {t('Active')}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-default)]">
                <button
                  onClick={onDone}
                  className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
                >
                  {t('Done')}
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

function ConfirmRemoveModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onCancel]);

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(420px,92vw)] bg-white border border-[var(--border-default)] rounded-md p-5 shadow-[0_8px_32px_rgba(44,38,39,0.12)]"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-[var(--danger-tint)] text-[var(--danger)] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[var(--text-primary)]">
              {t('Remove payment method?')}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {t('You will not be able to withdraw rewards until you link a new account.')}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--border-default)] text-sm font-medium text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] rounded-md transition-colors cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[var(--danger-strong)] hover:bg-[var(--danger)] text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
          >
            {t('Remove')}
          </button>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}
