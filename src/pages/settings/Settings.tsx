import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Search, ExternalLink, ChevronDown, Upload, Trash2, ShieldAlert,
  UserCircle, Wallet, Bell, Globe,
  ShieldCheck, Laptop, X, ArrowLeft,
  Building2, ScrollText, Briefcase, Star, Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/shared/lib/cn';
import PaymentMethodsSection from './PaymentMethodsSection';
import { useHotel } from '@/pages/hotel/use-hotel';
import { AMENITIES, type ContractStatus } from '@/pages/hotel/hotel-data';
import { ImageCropper } from '@/pages/agents/ImageCropper';
import { ChangeEmailDrawer } from '@/shared/ui/change-email-drawer';
import { ChangePasswordDrawer } from '@/shared/ui/change-password-drawer';
import { TwoStepDrawer } from '@/shared/ui/two-step-drawer';
import { DeleteAccountDrawer } from '@/shared/ui/delete-account-drawer';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { CURRENCIES, type CurrencyCode } from '@/shared/lib/currency';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { DATE_FORMATS } from '@/shared/lib/date-format';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  // Deep-link to a section via ?section=... (e.g. from the Setup hub's Edit links).
  const initialSection = params.get('section') || 'Account';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState<'nav' | 'content'>(params.get('section') ? 'content' : 'nav');

  const navigation = [
    {
      category: t('Personal'),
      items: [
        {
          id: 'Account',
          label: t('Account'),
          icon: UserCircle,
          keywords: 'email password two-step mfa verification profile name phone delete login security',
        },
      ],
    },
    {
      category: t('Payments'),
      items: [
        {
          id: 'Payment methods',
          label: t('Payment methods'),
          icon: Wallet,
          keywords: 'qpay bonum socialpay settlement gateway linked bank payout',
        },
      ],
    },
    {
      category: t('Preferences'),
      items: [
        {
          id: 'Notifications',
          label: t('Notifications'),
          icon: Bell,
          keywords: 'push email in-app quiet hours booking reservation settlement review',
        },
        {
          id: 'Language & region',
          label: t('Language & region'),
          icon: Globe,
          keywords: 'language timezone currency mnt date format region',
        },
      ],
    },
    {
      category: t('Privacy & security'),
      items: [
        {
          id: 'Privacy & data',
          label: t('Privacy & data'),
          icon: ShieldCheck,
          keywords: 'leaderboard visibility panels anonymized download export csv blocked companies block',
        },
        {
          id: 'Sessions',
          label: t('Sessions'),
          icon: Laptop,
          keywords: 'device sign out logged security',
        },
      ],
    },
  ];

  const q = query.trim().toLowerCase();
  const filteredNavigation = q
    ? navigation
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (i) =>
              i.label.toLowerCase().includes(q) ||
              g.category.toLowerCase().includes(q) ||
              i.keywords.toLowerCase().includes(q),
          ),
        }))
        .filter((g) => g.items.length > 0)
    : navigation;

  const totalMatches = filteredNavigation.reduce((n, g) => n + g.items.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full bg-[var(--surface-muted)] flex-col md:flex-row overflow-hidden w-full max-w-none"
    >
      {/* Settings Navigation Sidebar */}
      <div
        className={cn(
          'md:w-64 md:block border-r border-[var(--border-default)] bg-white flex-col shrink-0 h-full overflow-y-auto',
          mobileView === 'nav' ? 'flex w-full' : 'hidden md:flex',
        )}
      >
        <div className="p-4 shrink-0">
          <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Settings')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder={t('Search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('Clear search')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 px-2 pb-4 space-y-6">
          {filteredNavigation.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                {t('No settings match')}{' '}
                <span className="font-medium text-[var(--text-primary)]">"{query}"</span>
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
              >
                {t('Clear search')}
              </button>
            </div>
          ) : (
            <>
              {q && (
                <div className="px-3 text-[11px] text-[var(--text-secondary)] tabular-nums">
                  {totalMatches} {totalMatches === 1 ? t('result') : t('results')} {t('for')}{' '}
                  <span className="font-medium text-[var(--text-primary)]">"{query}"</span>
                </div>
              )}
              {filteredNavigation.map((group) => (
                <div key={group.category}>
                  <div className="px-3 mb-2 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    {group.category}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = activeSection === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setMobileView('content');
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3',
                            isActive
                              ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] font-medium'
                              : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]',
                          )}
                        >
                          <Icon
                            strokeWidth={1.75}
                            className={cn('w-4 h-4', isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]')}
                          />
                          <HighlightedLabel label={item.label} query={q} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-14 w-full',
          mobileView === 'content' ? 'block' : 'hidden md:block',
        )}
      >
        <div className="max-w-4xl mx-auto">
          {/* Mobile back button */}
          <button
            type="button"
            onClick={() => setMobileView('nav')}
            className="md:hidden inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Settings')}
          </button>

          {/* Page Header */}
          <div className="mb-8 md:mb-10">
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              {navigation.find((g) => g.items.some((i) => i.id === activeSection))?.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-serif text-[var(--text-primary)] mt-1">{t(activeSection)}</h1>

            {activeSection === 'Account' && (
              <p className="text-sm text-[var(--text-secondary)] mt-8 leading-relaxed max-w-3xl">
                {t('By using TutuStay you acknowledge and agree to abide by the')}{' '}
                <a href="#" className="font-medium underline hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1">
                  {t('Usage Policy')} <ExternalLink className="w-3 h-3" />
                </a>{' '}
                {t('and')}{' '}
                <a href="#" className="font-medium underline hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1">
                  {t('Terms of Use')} <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            )}
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'Payment methods' ? (
                <PaymentMethodsSection />
              ) : activeSection === 'Account' ? (
                <AccountPanel i18n={i18n} t={t} />
              ) : activeSection === 'Notifications' ? (
                <NotificationsPanel t={t} />
              ) : activeSection === 'Language & region' ? (
                <LanguageRegionPanel t={t} i18n={i18n} />
              ) : activeSection === 'Privacy & data' ? (
                <PrivacyDataPanel t={t} />
              ) : activeSection === 'Sessions' ? (
                <SessionsPanel t={t} />
              ) : (
                <PlaceholderPanel title={activeSection} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

type TFn = (key: string) => string;

function AccountPanel({ t }: { i18n: unknown; t: TFn }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [twoStepOpen, setTwoStepOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <div className="space-y-8 pb-20">
      {/* About you */}
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('About you')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6">
          {/* Profile image */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              {t('Profile image')}
            </label>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xl font-medium shrink-0">
                HH
              </div>
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  {t('Upload a JPG or PNG up to 5MB. Shown on your respondent profile.')}
                </p>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
                  <Upload className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                  {t('Upload image')}
                </button>
              </div>
            </div>
          </div>

          {/* First / Last */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('First name')}</label>
              <input
                type="text"
                defaultValue="Hein"
                className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Last name')}</label>
              <input
                type="text"
                defaultValue="Htet"
                className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Gender / Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Gender')}</label>
              <div className="relative">
                <select defaultValue="Male" className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                  <option value="Male">{t('Male')}</option>
                  <option value="Female">{t('Female')}</option>
                  <option value="Other">{t('Other')}</option>
                  <option value="Prefer not to say">{t('Prefer not to say')}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Address')}</label>
              <input
                type="text"
                defaultValue="No.20 Kyat Kone Street"
                className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Phone number')}</label>
            <div className="flex gap-3">
              <div className="relative w-28 shrink-0">
                <select className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                  <option>+95</option>
                  <option>+976</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
              <input
                type="tel"
                defaultValue="09 54 55 45 45"
                className="flex-1 px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {t('Used for SMS confirmations and settlement payouts.')}
            </p>
          </div>
        </div>
      </div>

      {/* Account status — read-only */}
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Account status')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md divide-y divide-[var(--surface-subtle)]">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <span className="text-sm text-[var(--text-secondary)]">{t('Status')}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              {t('Activated')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <span className="text-sm text-[var(--text-secondary)]">{t('Member since')}</span>
            <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">2026-05-26</span>
          </div>
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <span className="text-sm text-[var(--text-secondary)]">{t('Last login')}</span>
            <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">2026-06-03</span>
          </div>
        </div>
      </div>

      {/* Login details */}
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Login details')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-8">
          {/* Email */}
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Email')}</label>
              <input
                type="email"
                value="heincise@gmail.com"
                readOnly
                className="w-full px-3 py-2.5 bg-[var(--surface-subtle)] border border-transparent rounded-md text-sm text-[var(--text-secondary)] cursor-not-allowed"
              />
            </div>
            <button
              type="button"
              onClick={() => setEmailOpen(true)}
              className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              {t('Change email')}
            </button>
          </div>

          <div className="h-px w-full bg-[var(--border-default)]" />

          {/* Password */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('Password')}</span>
              <p className="text-sm text-[var(--text-secondary)]">{t('Last changed 3 months ago.')}</p>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              {t('Change password')}
            </button>
          </div>

          <div className="h-px w-full bg-[var(--border-default)]" />

          {/* MFA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {t('Two-step verification')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--danger-tint)] text-[var(--danger-strong)] text-[10px] font-medium">
                  {t('Not enabled')}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('Protect your account and your earnings with an extra sign-in step.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTwoStepOpen(true)}
              className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              {t('Enable')}
            </button>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div>
        <h3 className="text-lg font-medium text-[var(--danger-strong)] mb-4">{t('Delete account')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors hover:border-[var(--danger-tint)]">
          <div>
            <span className="block text-sm font-medium text-[var(--danger-strong)] mb-1">{t('Danger zone')}</span>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('Permanently delete your account and all associated data. This cannot be undone.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--surface-subtle)] rounded-md text-sm font-medium text-[var(--danger-strong)] hover:bg-[var(--danger-tint)] hover:border-[var(--danger-tint)] transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            {t('Delete my account')}
          </button>
        </div>
      </div>

      <ChangeEmailDrawer open={emailOpen} onOpenChange={setEmailOpen} currentEmail="heincise@gmail.com" />
      <ChangePasswordDrawer open={passwordOpen} onOpenChange={setPasswordOpen} />
      <TwoStepDrawer open={twoStepOpen} onOpenChange={setTwoStepOpen} phone="+976 99 12 34 56" />
      <DeleteAccountDrawer open={deleteOpen} onOpenChange={setDeleteOpen} heldMnt={8000} balanceMnt={0} />
    </div>
  );
}

function NotificationsPanel({ t }: { t: TFn }) {
  const rows = [
    {
      label: t('New booking request'),
      description: t('When a guest submits a new request that needs your decision.'),
    },
    {
      label: t('Reservation confirmed'),
      description: t('When a booking is approved and added to your calendar.'),
    },
    {
      label: t('Arrivals & departures'),
      description: t("A daily summary of who's checking in and out."),
    },
    {
      label: t('Booking cancelled'),
      description: t('When a guest or the system cancels a confirmed booking.'),
    },
    {
      label: t('Settlement paid'),
      description: t('When a payout lands in your settlement bank account.'),
    },
    {
      label: t('New guest review'),
      description: t('When a guest leaves a review for one of your stays.'),
    },
  ];
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
        {/* Table header — desktop only */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] items-center gap-6 px-6 py-3 border-b border-[var(--border-default)] text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          <span>{t('Event')}</span>
          <span className="w-16 text-center">{t('In-app')}</span>
          <span className="w-16 text-center">{t('Email')}</span>
          <span className="w-16 text-center">{t('Push')}</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.label}
            className="px-4 sm:px-6 py-4 border-b border-[var(--surface-subtle)] last:border-b-0 md:grid md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-6"
          >
            <div className="mb-3 md:mb-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">{r.label}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{r.description}</div>
            </div>
            {/* Mobile: 3 rows of [label left, toggle right]. Desktop: contents → directly into parent grid. */}
            <div className="flex flex-col divide-y divide-[var(--surface-subtle)] border-t border-[var(--surface-subtle)] md:contents md:divide-y-0 md:border-0">
              <div className="flex items-center justify-between py-2.5 md:py-0 md:block md:w-16">
                <span className="text-xs text-[var(--text-tertiary)] md:hidden">{t('In-app')}</span>
                <div className="flex justify-end md:justify-center"><Switch defaultOn /></div>
              </div>
              <div className="flex items-center justify-between py-2.5 md:py-0 md:block md:w-16">
                <span className="text-xs text-[var(--text-tertiary)] md:hidden">{t('Email')}</span>
                <div className="flex justify-end md:justify-center"><Switch defaultOn /></div>
              </div>
              <div className="flex items-center justify-between py-2.5 md:py-0 md:block md:w-16">
                <span className="text-xs text-[var(--text-tertiary)] md:hidden">{t('Push')}</span>
                <div className="flex justify-end md:justify-center"><Switch /></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--border-default)] rounded-md p-6">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{t('Quiet hours')}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t("We won't push notifications to your phone during these hours.")}
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5">{t('From')}</label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5">{t('To')}</label>
            <input
              type="time"
              defaultValue="08:00"
              className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageRegionPanel({ t, i18n }: { t: TFn; i18n: { language: string; changeLanguage: (l: string) => void } }) {
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              {t('Display language')}
            </label>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {t('Language used across the TutuStay interface.')}
            </p>
            <div className="relative">
              <select
                className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="my">မြန်မာ</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              {t('Timezone')}
            </label>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {t('Used for check-in/check-out times and booking timestamps.')}
            </p>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>Asia/Yangon (UTC+6:30)</option>
                <option>Asia/Bangkok (UTC+7)</option>
                <option>Asia/Singapore (UTC+8)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyPicker t={t} />
          <DateFormatPicker t={t} />
        </div>
      </div>
    </div>
  );
}

function DateFormatPicker({ t }: { t: TFn }) {
  const { dateFormat, setDateFormat, formatDate } = useDateFormat();
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
        {t('Date format')}
      </label>
      <div className="relative">
        <select
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value)}
          className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
        >
          {DATE_FORMATS.map((d) => (
            <option key={d.pattern} value={d.pattern}>
              {d.pattern} — {d.example}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">
        {t('Preview:')} <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatDate(new Date('2026-01-05'))}</span>
      </p>
    </div>
  );
}

function CurrencyPicker({ t }: { t: TFn }) {
  const { currency, setCurrency, format } = useCurrency();
  const codes = Object.keys(CURRENCIES) as CurrencyCode[];
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
        {t('Currency display')}
      </label>
      <div className="relative">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
        >
          {codes.map((c) => (
            <option key={c} value={c}>
              {CURRENCIES[c].symbol} {c} – {t(CURRENCIES[c].label)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">
        {t('Preview:')} <span className="font-medium text-[var(--text-primary)] tabular-nums">{format(15000)}</span>
      </p>
    </div>
  );
}

function PrivacyDataPanel({ t }: { t: TFn }) {
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Visibility')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-5">
          <ToggleRow
            label={t('Show contact details to guests')}
            description={t('Let confirmed guests see your front-desk phone and email before arrival.')}
            defaultOn
          />
          <div className="h-px w-full bg-[var(--surface-subtle)]" />
          <ToggleRow
            label={t('Feature my property in promotions')}
            description={t('Allow TutuStay to include your property in seasonal deals and campaigns.')}
            defaultOn
          />
          <div className="h-px w-full bg-[var(--surface-subtle)]" />
          <ToggleRow
            label={t('Share anonymized performance benchmarks')}
            description={t('Aggregated only — helps compare occupancy and rates across similar properties.')}
            defaultOn={false}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Your data')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('Download my data')}</span>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('Export your reservations, settlements, and property details as a CSV bundle.')}
              </p>
            </div>
            <button className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 whitespace-nowrap">
              {t('Request export')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionsPanel({ t }: { t: TFn }) {
  const sessions = [
    { device: 'MacBook Pro · Chrome', where: 'Yangon, MM', when: t('Active now'), current: true },
    { device: 'iPhone 15 · TutuStay App', where: 'Yangon, MM', when: t('2 hours ago'), current: false },
    { device: 'Windows · Firefox', where: 'Mandalay, MM', when: t('3 days ago'), current: false },
  ];
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
        {sessions.map((s, i) => (
          <div
            key={s.device}
            className={cn(
              'flex items-center justify-between gap-4 px-6 py-4',
              i !== sessions.length - 1 && 'border-b border-[var(--surface-subtle)]',
            )}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-9 h-9 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0">
                <Laptop className="w-4 h-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">{s.device}</span>
                  {s.current && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--success-tint)] text-[var(--success)] text-[10px] font-medium">
                      {t('Current')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                  {s.where} · {s.when}
                </div>
              </div>
            </div>
            {!s.current && (
              <button className="px-3 py-1.5 border border-[var(--border-default)] rounded-md text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0">
                {t('Sign out')}
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--danger-strong)] hover:bg-[var(--danger-tint)] hover:border-[var(--danger-tint)] transition-colors">
        {t('Sign out of all other sessions')}
      </button>
    </div>
  );
}

function HighlightedLabel({ label, query }: { label: string; query: string }) {
  if (!query) return <>{label}</>;
  const idx = label.toLowerCase().indexOf(query);
  if (idx === -1) return <>{label}</>;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-sm">
        {label.slice(idx, idx + query.length)}
      </mark>
      {label.slice(idx + query.length)}
    </>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-[var(--surface-subtle)] rounded-full flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8 text-[var(--text-secondary)]" strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">{title}</h2>
      <p className="text-[var(--text-secondary)]">This section is currently under construction.</p>
    </div>
  );
}

function Switch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        on ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-strong)]',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          on ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  defaultOn = false,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
        <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{description}</div>
      </div>
      <div className="pt-1 shrink-0">
        <Switch defaultOn={defaultOn} />
      </div>
    </div>
  );
}

function CategoryChip({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
        on
          ? 'bg-[var(--brand-tint)] border-[var(--brand-border)] text-[var(--brand-primary)]'
          : 'bg-white border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--brand-border)]',
      )}
    >
      {label}
    </button>
  );
}

