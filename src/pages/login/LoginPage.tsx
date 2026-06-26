import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Check, TrendingUp } from 'lucide-react';
import { Smartphone } from 'lucide-react';
import { useSession } from '@/shared/state/use-session';
import { MobileDemoModal } from './MobileDemoModal';

/* ============================================================================
   LOGIN  —  route: /login  (full page, outside the app shell)
   Split layout: brand panel (architecture photo + soft gradient) + sign-in
   form. Demo only —
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
  const [demoOpen, setDemoOpen] = useState(false);

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
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden bg-[var(--color-base-ocean-80)] bg-cover bg-center"
        style={{ backgroundImage: 'url(/login-resort.jpg)' }}
      >
        {/* Soft neutral gradient — just enough to keep the white text legible,
            no colour tint so the photo shows through. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(12,14,18,0.45) 0%, rgba(12,14,18,0.12) 32%, rgba(12,14,18,0.30) 66%, rgba(12,14,18,0.82) 100%)' }}
        />

        {/* Soft glow */}
        <div
          className="absolute -top-24 -right-24 w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)' }}
        />

        {/* Ambient product preview — two glass cards (revenue + live booking).
            Bleeds off the right edge; sits in the empty upper area. */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: 28, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="absolute top-[11%] -right-12 w-[360px] hidden xl:block pointer-events-none select-none"
        >
          {/* Revenue card */}
          <div className="rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-md p-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] text-white/60">{t('Revenue')} · {t('This month')}</div>
                <div className="text-2xl font-semibold tabular-nums mt-0.5">MMK 4.8M</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-data-green-30)] bg-white/10 rounded-full px-2 py-0.5">
                <TrendingUp className="w-3 h-3" /> 12%
              </span>
            </div>
            <svg viewBox="0 0 280 70" className="w-full h-16 mt-3" preserveAspectRatio="none">
              <defs>
                <linearGradient id="loginSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <path d="M0,55 L40,48 L80,52 L120,33 L160,38 L200,20 L240,26 L280,10 L280,70 L0,70 Z" fill="url(#loginSpark)" />
              <path d="M0,55 L40,48 L80,52 L120,33 L160,38 L200,20 L240,26 L280,10" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>

          {/* Floating booking card */}
          <div className="mt-3 ml-10 rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-md p-3 shadow-2xl flex items-center gap-3">
            <span className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center text-xs font-medium shrink-0">A</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{t('New booking')} · {t('Deluxe')}</div>
              <div className="text-[11px] text-white/55 truncate">Aria Nguyen · 2 {t('nights')}</div>
            </div>
            <span className="text-[11px] text-white/70 tabular-nums shrink-0">MMK 160k</span>
          </div>
        </motion.div>

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

            {/* Live demo — opens the guest-app phone preview */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--border-default)]" /></div>
              <span className="relative mx-auto block w-fit bg-[var(--surface-muted)] px-3 text-xs text-[var(--text-secondary)]">{t('or')}</span>
            </div>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="w-full h-10 rounded-md border border-[var(--border-strong)] bg-white text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" /> {t('View live demo')}
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

      <MobileDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
