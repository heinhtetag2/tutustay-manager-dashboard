import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  MailCheck,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

/* ============================================================================
   FORGOT PASSWORD  —  route: /forgot-password  (full page, outside the shell)
   Reuses the login split layout. A 3-step recovery flow:
     1. Email   — where to send the reset code
     2. Code    — enter the 6-digit code we "sent"
     3. Reset   — choose a new password
   …then a success screen back to sign in. Demo only — nothing is sent.
   ============================================================================ */

const fieldInput =
  'w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)] transition-colors';

type Step = 'email' | 'code' | 'reset' | 'done';
const FLOW: Step[] = ['email', 'code', 'reset'];

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const codeValid = code.length === 6;

  const checks = useMemo(
    () => ({
      length: next.length >= 8,
      letter: /[a-zA-Z]/.test(next),
      number: /\d/.test(next),
      match: next.length > 0 && next === confirm,
    }),
    [next, confirm],
  );
  const pwValid = checks.length && checks.letter && checks.number && checks.match;

  // Resend cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const sendCode = () => {
    if (!emailValid) return;
    setCooldown(30);
    setStep('code');
  };

  const stepIndex = FLOW.indexOf(step);

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] grid grid-cols-1 lg:grid-cols-2">
      {/* ── Brand panel ───────────────────────────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: 'linear-gradient(155deg, var(--color-base-ocean-80) 0%, var(--color-base-ocean-60) 100%)' }}
      >
        <div
          className="absolute -top-24 -right-24 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)' }}
        />

        {/* Logo placeholder */}
        <div
          aria-label="Logo placeholder"
          className="relative h-9 w-24 border border-dashed border-white/35 bg-white/5 rounded-md flex items-center justify-center text-[10px] font-medium tracking-wide text-white/70 select-none"
        >
          LOGO
        </div>

        <div className="relative max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-serif leading-tight"
          >
            {t('Locked out? It happens.')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-sm text-white/75 mt-4 leading-relaxed"
          >
            {t('Reset your password in a few quick steps and get back to running your property.')}
          </motion.p>
        </div>

        <div className="relative text-xs text-white/55">© {t('TutuStay — Manager Dashboard')}</div>
      </div>

      {/* ── Form panel ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Back to sign in */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Back to sign in')}
          </button>

          {/* Step progress (hidden on the success screen) */}
          {step !== 'done' && (
            <div className="flex items-center gap-1.5 mb-7">
              {FLOW.map((s, i) => (
                <span
                  key={s}
                  className={
                    'h-1.5 rounded-full transition-all ' +
                    (i <= stepIndex ? 'w-6 bg-[var(--brand-primary)]' : 'w-1.5 bg-[var(--border-strong)]')
                  }
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Step 1: email ─────────────────────────────────────── */}
              {step === 'email' && (
                <form onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
                  <StepIcon Icon={KeyRound} />
                  <h2 className="text-3xl font-serif text-[var(--text-primary)]">{t('Forgot your password?')}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("Enter the email linked to your account and we'll send you a 6-digit code to reset it.")}
                  </p>

                  <div className="mt-7">
                    <label htmlFor="reset-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">{t('Email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('you@example.com')}
                        className={fieldInput}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!emailValid}
                    className="mt-6 w-full h-10 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {t('Send reset code')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── Step 2: code ──────────────────────────────────────── */}
              {step === 'code' && (
                <form onSubmit={(e) => { e.preventDefault(); if (codeValid) setStep('reset'); }}>
                  <StepIcon Icon={MailCheck} />
                  <h2 className="text-3xl font-serif text-[var(--text-primary)]">{t('Check your email')}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t('We sent a 6-digit code to')} <span className="font-medium text-[var(--text-primary)]">{email}</span>. {t('Enter it below to continue.')}
                  </p>

                  <div className="mt-7">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Verification code')}</label>
                    <OtpInput value={code} onChange={setCode} />
                  </div>

                  <div className="mt-4 text-sm text-[var(--text-secondary)]">
                    {t("Didn't get it?")}{' '}
                    {cooldown > 0 ? (
                      <span className="text-[var(--text-tertiary)] tabular-nums">{t('Resend in')} {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCooldown(30)}
                        className="inline-flex items-center gap-1 font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('Resend code')}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!codeValid}
                    className="mt-6 w-full h-10 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {t('Verify code')}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCode(''); setStep('email'); }}
                    className="mt-3 w-full h-10 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                  >
                    {t('Use a different email')}
                  </button>
                </form>
              )}

              {/* ── Step 3: reset ─────────────────────────────────────── */}
              {step === 'reset' && (
                <form onSubmit={(e) => { e.preventDefault(); if (pwValid) setStep('done'); }}>
                  <StepIcon Icon={ShieldCheck} />
                  <h2 className="text-3xl font-serif text-[var(--text-primary)]">{t('Set a new password')}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("Create a strong password you'll remember.")}
                  </p>

                  <div className="mt-7 space-y-4">
                    <div>
                      <label htmlFor="new-pw" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">{t('New password')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                        <input
                          id="new-pw"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={next}
                          onChange={(e) => setNext(e.target.value)}
                          placeholder={t('Enter a new password')}
                          className={`${fieldInput} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          aria-label={showPw ? t('Hide password') : t('Show password')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirm-pw" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">{t('Confirm new password')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                        <input
                          id="confirm-pw"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder={t('Re-enter your new password')}
                          className={fieldInput}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-[var(--surface-subtle)] rounded-md p-4 space-y-2">
                    <CheckItem ok={checks.length} label={t('At least 8 characters')} />
                    <CheckItem ok={checks.letter} label={t('Contains a letter')} />
                    <CheckItem ok={checks.number} label={t('Contains a number')} />
                    <CheckItem ok={checks.match} label={t('Both password fields match')} />
                  </div>

                  <button
                    type="submit"
                    disabled={!pwValid}
                    className="mt-6 w-full h-10 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {t('Reset password')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── Success ───────────────────────────────────────────── */}
              {step === 'done' && (
                <div className="flex flex-col items-center text-center pt-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6, bounce: 0.45 }}
                    className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-8 h-8 text-[var(--success)]" strokeWidth={1.75} />
                  </motion.div>
                  <h2 className="text-3xl font-serif text-[var(--text-primary)]">{t('Password reset')}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed max-w-xs">
                    {t('Your password has been updated. You can now sign in with your new password.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="mt-7 w-full h-10 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                  >
                    {t('Back to sign in')}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ----------------------------- Pieces ----------------------------- */

function StepIcon({ Icon }: { Icon: typeof KeyRound }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center mb-5">
      <Icon className="w-6 h-6" strokeWidth={1.75} />
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={
          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 ' +
          (ok ? 'bg-[var(--success)] text-white' : 'bg-white text-[var(--text-muted)]')
        }
      >
        {ok && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
      </div>
      <span className={ok ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>{label}</span>
    </div>
  );
}

/** Six single-character boxes with auto-advance, backspace, and paste support. */
function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    onChange(arr.join('').slice(0, length));
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    onChange(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-full h-12 text-center text-lg font-medium tabular-nums bg-white border border-[var(--border-default)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors"
        />
      ))}
    </div>
  );
}
