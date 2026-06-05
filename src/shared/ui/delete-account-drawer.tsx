import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, Trash2, ArrowLeft } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';

type Step = 'review' | 'confirm';

export function DeleteAccountDrawer({
  open,
  onOpenChange,
  heldMnt = 0,
  balanceMnt = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heldMnt?: number;
  balanceMnt?: number;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('review');
  const [reason, setReason] = useState<string>('');
  const [typed, setTyped] = useState('');

  const confirmOk = typed.trim().toUpperCase() === 'DELETE';
  const hasUnreleased = heldMnt > 0 || balanceMnt > 0;

  const reset = () => {
    setStep('review');
    setReason('');
    setTyped('');
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[var(--border-default)]">
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[var(--border-default)] shrink-0">
          {step === 'confirm' && (
            <button
              onClick={() => setStep('review')}
              className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
              aria-label={t('Back')}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)] flex-1">
            {t('Delete account')}
          </DrawerTitle>
          <button
            onClick={() => handleOpenChange(false)}
            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <DrawerDescription className="sr-only">
            {t('Permanently delete your iDap account and all associated data.')}
          </DrawerDescription>

          {step === 'review' ? (
            <div className="space-y-6">
              {/* Warning banner */}
              <div className="bg-[var(--danger-tint)] rounded-md p-4 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-[var(--danger-strong)] shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {t('This is permanent. You will not be able to recover your account, responses, or unreleased rewards.')}
                </p>
              </div>

              {/* What happens */}
              <div>
                <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">
                  {t("What happens when you delete")}
                </h3>
                <ul className="space-y-2.5 text-sm text-[var(--text-tertiary)] leading-relaxed">
                  <BulletRow text={t('Your profile, demographics, and survey history are erased within 30 days.')} />
                  <BulletRow text={t('Any  held for quality review is forfeited and not paid out.')} />
                  <BulletRow text={t('Available wallet balance must be withdrawn before you can delete.')} />
                  <BulletRow text={t("You won't be able to sign up again with the same email or phone for 90 days.")} />
                  <BulletRow text={t('Aggregated, anonymized responses already delivered to companies remain with them.')} />
                </ul>
              </div>

              {/* Balance warning */}
              {hasUnreleased && (
                <div className="bg-[var(--warning-tint)] rounded-md p-4">
                  <div className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    {t('You have unreleased rewards')}
                  </div>
                  <div className="space-y-1 text-xs text-[var(--text-tertiary)] tabular-nums">
                    {balanceMnt > 0 && (
                      <div className="flex justify-between">
                        <span>{t('Available balance')}</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {balanceMnt.toLocaleString('en-US')}
                        </span>
                      </div>
                    )}
                    {heldMnt > 0 && (
                      <div className="flex justify-between">
                        <span>{t('Held for review')}</span>
                        <span className="font-medium text-[var(--warning)]">
                          {heldMnt.toLocaleString('en-US')}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                    {t('Withdraw your balance first to keep that . Held rewards will be forfeited.')}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t('Help us improve — why are you leaving?')}{' '}
                  <span className="text-[var(--text-secondary)] font-normal">{t('(optional)')}</span>
                </label>
                <div className="space-y-2">
                  {[
                    t('Not enough surveys match me'),
                    t('Rewards are too small'),
                    t('Concerns about privacy'),
                    t('Taking a break'),
                    t('Other'),
                  ].map((r) => (
                    <label
                      key={r}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer transition-colors',
                        reason === r
                          ? 'border-[var(--brand-border)] bg-[var(--brand-tint)]'
                          : 'border-[var(--border-default)] bg-white hover:border-[var(--brand-border)]',
                      )}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-[var(--brand-primary)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 h-10 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium transition-colors"
                >
                  {t('Keep my account')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="flex-1 h-10 rounded-md border border-[var(--border-default)] text-sm font-medium text-[var(--danger-strong)] hover:bg-[var(--danger-tint)] hover:border-[var(--danger-tint)] transition-colors"
                >
                  {t('Continue to delete')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {t('Final confirmation')}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {t('Type')}{' '}
                  <span className="font-medium text-[var(--danger-strong)] tabular-nums">DELETE</span>{' '}
                  {t('in the box below to permanently remove your account.')}
                </p>
              </div>

              <input
                type="text"
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--border-strong)] tabular-nums uppercase focus:outline-none focus:border-[var(--danger-strong)] transition-colors"
              />

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="flex-1 h-10 rounded-md border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  {t('Go back')}
                </button>
                <button
                  type="button"
                  disabled={!confirmOk}
                  onClick={() => {
                    // Fire-and-forget in demo — would call API in production
                    handleOpenChange(false);
                  }}
                  className={cn(
                    'flex-1 h-10 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
                    confirmOk
                      ? 'bg-[var(--danger-strong)] hover:bg-[var(--danger)] text-white cursor-pointer'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed',
                  )}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  {t('Delete my account')}
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function BulletRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] mt-2 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
