import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';

export function ChangePasswordDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const checks = useMemo(
    () => ({
      length: next.length >= 8,
      letter: /[a-zA-Z]/.test(next),
      number: /\d/.test(next),
      match: next.length > 0 && next === confirm,
    }),
    [next, confirm],
  );
  const allPass = checks.length && checks.letter && checks.number && checks.match;
  const canSubmit = allPass && current.length >= 6;

  const reset = () => {
    setStep('form');
    setCurrent('');
    setNext('');
    setConfirm('');
    setShowCurrent(false);
    setShowNext(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[var(--border-default)]">
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border-default)] shrink-0">
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)]">
            {t('Change password')}
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
            {t('Update the password used to sign in to your iDap account.')}
          </DrawerDescription>

          {step === 'form' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                setStep('done');
              }}
              className="space-y-5"
            >
              <PasswordInput
                label={t('Current password')}
                value={current}
                onChange={setCurrent}
                show={showCurrent}
                onToggle={() => setShowCurrent((s) => !s)}
                autoFocus
              />

              <PasswordInput
                label={t('New password')}
                value={next}
                onChange={setNext}
                show={showNext}
                onToggle={() => setShowNext((s) => !s)}
              />

              <PasswordInput
                label={t('Confirm new password')}
                value={confirm}
                onChange={setConfirm}
                show={showNext}
                onToggle={() => setShowNext((s) => !s)}
                showToggle={false}
              />

              <div className="bg-[var(--surface-subtle)] rounded-md p-4 space-y-2">
                <CheckItem ok={checks.length} label={t('At least 8 characters')} />
                <CheckItem ok={checks.letter} label={t('Contains a letter')} />
                <CheckItem ok={checks.number} label={t('Contains a number')} />
                <CheckItem ok={checks.match} label={t('Both new password fields match')} />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 h-10 rounded-md border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    'flex-1 h-10 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
                    canSubmit
                      ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white cursor-pointer'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed',
                  )}
                >
                  {t('Update password')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6 text-[var(--success)]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                {t('Password updated')}
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-sm mb-6">
                {t("You've been signed out of other sessions. Use your new password next time you sign in on another device.")}
              </p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="px-5 h-10 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium transition-colors"
              >
                {t('Done')}
              </button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoFocus = false,
  showToggle = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoFocus?: boolean;
  showToggle?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 pr-10 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
          ok ? 'bg-[var(--success)] text-white' : 'bg-white text-[var(--text-muted)]',
        )}
      >
        {ok && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
      </div>
      <span className={cn(ok ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>{label}</span>
    </div>
  );
}
