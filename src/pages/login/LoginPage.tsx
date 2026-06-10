import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Check, Building2, CalendarCheck, Wallet } from 'lucide-react';
import { useSession } from '@/shared/state/use-session';

/* ============================================================================
   LOGIN  —  route: /login  (full page, outside the app shell)
   Split layout: brand panel (ocean gradient) + sign-in form. Demo only —
   submitting goes straight to the dashboard.
   ============================================================================ */

const fieldInput =
  'w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)] transition-colors';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signIn = useSession((s) => s.signIn);
  const [email, setEmail] = useState('manager@auroragrand.mn');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 1;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // Sign in, then walk the manager through onboarding before the dashboard.
    signIn();
    navigate('/hotel/setup?from=/');
  };

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] grid grid-cols-1 lg:grid-cols-2">
      {/* ── Brand panel ───────────────────────────────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: 'linear-gradient(155deg, var(--color-base-ocean-80) 0%, var(--color-base-ocean-60) 100%)' }}
      >
        {/* Soft glow */}
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

        {/* Value prop */}
        <div className="relative max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-serif leading-tight"
          >
            {t('Run your property from one calm screen.')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-sm text-white/75 mt-4 leading-relaxed"
          >
            {t('Bookings, rooms, guests, and payouts — managed in one place, beautifully.')}
          </motion.p>

          <ul className="mt-8 space-y-3">
            {[
              { Icon: CalendarCheck, label: t('Accept and manage bookings in real time') },
              { Icon: Building2, label: t('Set up room types, rates, and availability') },
              { Icon: Wallet, label: t('Track revenue and get paid on time') },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/85">
                <span className="w-7 h-7 rounded-md bg-white/12 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </span>
                {label}
              </li>
            ))}
          </ul>
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
          <h2 className="text-3xl font-serif text-[var(--text-primary)]">{t('Welcome back')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">{t('Sign in to your manager dashboard.')}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">{t('Email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('you@example.com')}
                  className={fieldInput}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">{t('Password')}</label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer">
                  {t('Forgot password?')}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('Enter your password')}
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

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember((v) => !v)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  remember ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white' : 'bg-white border-[var(--border-strong)]'
                }`}
              >
                {remember && <Check className="w-3 h-3" strokeWidth={3} />}
              </button>
              <span className="text-sm text-[var(--text-secondary)]">{t('Keep me signed in')}</span>
            </label>

            <button
              type="submit"
              disabled={!valid}
              className="w-full h-10 rounded-md bg-[var(--brand-primary)] text-white text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('Sign in')}
            </button>
          </form>

          <p className="text-sm text-[var(--text-secondary)] text-center mt-8">
            {t('Trouble signing in?')}{' '}
            <a href="mailto:support@tutustay.com" className="font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer">
              {t('Contact support')}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
