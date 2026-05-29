import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Shield, ArrowRight, ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';

type Step = 'intro' | 'verify' | 'backup' | 'done';

const BACKUP_CODES = [
  'H4N2-9K7Q', 'R5P1-M3XB', 'T8VZ-LQ62', 'W1CA-8NJ0',
  'B6YD-3F5R', 'K9ME-L7DS', 'Q3XT-2AHP', 'U7WK-V4BN',
];

export function TwoStepDrawer({
  open,
  onOpenChange,
  phone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('intro');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const codeValid = /^\d{6}$/.test(code);

  const reset = () => {
    setStep('intro');
    setCode('');
    setCopied(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(BACKUP_CODES.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[var(--border-default)]">
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[var(--border-default)] shrink-0">
          {step !== 'intro' && step !== 'done' && (
            <button
              onClick={() => setStep(step === 'backup' ? 'verify' : 'intro')}
              className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
              aria-label={t('Back')}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)] flex-1">
            {t('Two-step verification')}
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
            {t('Set up two-step verification to protect your account.')}
          </DrawerDescription>

          {step === 'intro' && (
            <div className="space-y-5">
              <div className="bg-[var(--surface-subtle)] rounded-md p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-[var(--brand-primary)]" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-base font-medium text-[var(--text-primary)] mb-1">
                    {t('Protect your earnings')}
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                    {t("Once enabled, you'll enter a 6-digit code from an SMS every time you sign in on a new device.")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">
                  {t('How it works')}
                </h3>
                <ol className="space-y-3">
                  <Step n={1} title={t('We send a code to your phone')} description={phone} />
                  <Step n={2} title={t('You enter it to finish signing in')} description={t('Takes about 10 seconds.')} />
                  <Step n={3} title={t("You'll get 8 backup codes")} description={t('Keep them somewhere safe in case you lose your phone.')} />
                </ol>
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
                  type="button"
                  onClick={() => setStep('verify')}
                  className="flex-1 h-10 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  {t('Send me a code')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!codeValid) return;
                setStep('backup');
              }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {t('Enter the 6-digit code')}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {t('We sent it to')}{' '}
                  <span className="font-medium text-[var(--text-primary)]">{phone}</span>.{' '}
                  {t('The code expires in 10 minutes.')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {t('Verification code')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-3 bg-white border border-[var(--border-default)] rounded-md text-center text-2xl font-medium tabular-nums tracking-[0.5em] text-[var(--text-primary)] placeholder:text-[var(--border-strong)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
                <button
                  type="button"
                  className="mt-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {t("Didn't get it? Resend in 30s.")}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!codeValid}
                  className={cn(
                    'w-full h-10 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
                    codeValid
                      ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white cursor-pointer'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed',
                  )}
                >
                  {t('Verify')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </form>
          )}

          {step === 'backup' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {t('Save your backup codes')}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {t('If you lose access to your phone, use one of these codes to sign in. Each code works once.')}
                </p>
              </div>

              <div className="bg-[var(--surface-subtle)] rounded-md p-4 grid grid-cols-2 gap-2 font-mono">
                {BACKUP_CODES.map((c) => (
                  <div key={c} className="px-3 py-2 bg-white rounded-md text-sm text-[var(--text-primary)] tabular-nums text-center">
                    {c}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={copyCodes}
                className={cn(
                  'w-full h-10 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
                  copied
                    ? 'bg-[var(--success-tint)] text-[var(--success)]'
                    : 'border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]',
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    {t('Copied all codes')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={1.75} />
                    {t('Copy all codes')}
                  </>
                )}
              </button>

              <div className="bg-[var(--brand-tint)] rounded-md p-4 flex gap-3">
                <span className="text-[var(--brand-primary)] font-medium shrink-0">{t('Save them')}</span>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {t("These codes won't be shown again. Store them in a password manager or write them down.")}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('done')}
                  className="w-full h-10 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  {t("I've saved my codes")}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="pt-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6 text-[var(--success)]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                {t('Two-step verification enabled')}
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-sm mb-6">
                {t("From now on you'll enter a code from SMS when you sign in on a new device. Your account is safer now.")}
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

function Step({ n, title, description }: { n: number; title: string; description: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 text-[11px] font-medium text-[var(--text-tertiary)] tabular-nums">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)]">{title}</div>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{description}</p>
      </div>
    </li>
  );
}
