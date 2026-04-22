import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';

export function ChangeEmailDrawer({
  open,
  onOpenChange,
  currentEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'sent'>('form');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim()) &&
    newEmail.trim().toLowerCase() !== currentEmail.toLowerCase() &&
    password.length >= 6;

  const reset = () => {
    setStep('form');
    setNewEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[#EBEBEB]">
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#EBEBEB] shrink-0">
          <DrawerTitle className="text-base font-medium text-[#1A1A1A]">
            {t('Change email')}
          </DrawerTitle>
          <button
            onClick={() => handleOpenChange(false)}
            className="p-1.5 text-[#616161] hover:bg-[#F3F3F3] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <DrawerDescription className="sr-only">
            {t('Change the email address linked to your iDap account.')}
          </DrawerDescription>

          {step === 'form' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isValid) return;
                setStep('sent');
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  {t('Current email')}
                </label>
                <div className="px-3 py-2.5 bg-[#F3F3F3] rounded-md text-sm text-[#616161]">
                  {currentEmail}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  {t('New email')}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full px-3 py-2.5 bg-white border border-[#EBEBEB] rounded-md text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF3C21] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  {t('Confirm with your password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 bg-white border border-[#EBEBEB] rounded-md text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF3C21] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#616161] hover:text-[#1A1A1A] transition-colors"
                    aria-label={showPassword ? t('Hide password') : t('Show password')}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#616161] mt-2">
                  {t("We ask for your password to confirm it's really you.")}
                </p>
              </div>

              <div className="bg-[#F3F3F3] rounded-md p-4 flex gap-3">
                <Mail className="w-4 h-4 text-[#4A4A4A] shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-xs text-[#4A4A4A] leading-relaxed">
                  {t("We'll send a verification link to your new email. Your old email will keep working until you click that link.")}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 h-10 rounded-md border border-[#EBEBEB] text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className={cn(
                    'flex-1 h-10 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
                    isValid
                      ? 'bg-[#FF3C21] hover:bg-[#E63419] text-white cursor-pointer'
                      : 'bg-[#F3F3F3] text-[#8A8A8A] cursor-not-allowed',
                  )}
                >
                  {t('Send verification')}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#F3F3F3] flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6 text-[#047857]" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
                {t('Check your inbox')}
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-sm mb-6">
                {t("We sent a verification link to")}{' '}
                <span className="font-medium text-[#1A1A1A]">{newEmail}</span>
                {t(". Click it within 24 hours to finish the change. Your current email keeps working until then.")}
              </p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="px-5 h-10 rounded-md bg-[#FF3C21] hover:bg-[#E63419] text-white text-sm font-medium transition-colors"
              >
                {t('Done')}
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="mt-3 text-xs text-[#616161] hover:text-[#1A1A1A] transition-colors"
              >
                {t('Used the wrong email? Send again.')}
              </button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
