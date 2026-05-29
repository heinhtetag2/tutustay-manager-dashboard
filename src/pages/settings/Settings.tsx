import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, ExternalLink, ChevronDown, Upload, Trash2, ShieldAlert,
  UserCircle, Wallet, SlidersHorizontal, Bell, Globe,
  ShieldCheck, Laptop, UserSquare2, Gift, Share2, X, ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/shared/lib/cn';
import PaymentMethodsSection from './PaymentMethodsSection';
import { InviteFriendsDrawer } from '@/shared/ui/invite-friends-drawer';
import { ChangeEmailDrawer } from '@/shared/ui/change-email-drawer';
import { ChangePasswordDrawer } from '@/shared/ui/change-password-drawer';
import { TwoStepDrawer } from '@/shared/ui/two-step-drawer';
import { DeleteAccountDrawer } from '@/shared/ui/delete-account-drawer';
import { BlockedCompaniesDrawer } from '@/shared/ui/blocked-companies-drawer';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { CURRENCIES, type CurrencyCode } from '@/shared/lib/currency';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('Account');
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState<'nav' | 'content'>('nav');

  const navigation = [
    {
      category: t('Personal'),
      items: [
        {
          id: 'Account',
          label: t('Account'),
          icon: UserCircle,
          keywords: 'email password two-step mfa verification profile name phone delete referral invite friends login security',
        },
        {
          id: 'Demographics',
          label: t('Demographics'),
          icon: UserSquare2,
          keywords: 'age gender city district education income employment matching profile',
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
          keywords: 'qpay bonum socialpay withdrawal gateway linked bank payout',
        },
      ],
    },
    {
      category: t('Preferences'),
      items: [
        {
          id: 'Survey preferences',
          label: t('Survey preferences'),
          icon: SlidersHorizontal,
          keywords: 'categories minimum reward maximum duration qualify filter interested match',
        },
        {
          id: 'Notifications',
          label: t('Notifications'),
          icon: Bell,
          keywords: 'push email in-app quiet hours reward withdrawal trust',
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
                {t('By using iDap you acknowledge and agree to abide by the')}{' '}
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
              ) : activeSection === 'Demographics' ? (
                <DemographicsPanel t={t} />
              ) : activeSection === 'Survey preferences' ? (
                <SurveyPreferencesPanel t={t} />
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
  const [inviteOpen, setInviteOpen] = useState(false);
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

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Phone number')}</label>
            <div className="flex gap-3">
              <div className="relative w-28 shrink-0">
                <select className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                  <option>+976</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
              <input
                type="tel"
                defaultValue="99 12 34 56"
                className="flex-1 px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
              />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {t('Used for SMS confirmations and QPay payouts.')}
            </p>
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

      {/* Referral */}
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Invite friends')}</h3>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="w-full bg-white border border-[var(--border-default)] rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left hover:border-[var(--brand-border)] transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[var(--brand-primary)]" strokeWidth={1.75} />
            </div>
            <div>
              <span className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {t('Earn ₩5,000 per qualified friend')}
              </span>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('They complete one paid survey — you both get ₩5,000. No limit.')}
              </p>
            </div>
          </div>
          <span className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white bg-[var(--brand-primary)] shrink-0 whitespace-nowrap">
            {t('Share link')}
            <Share2 className="w-4 h-4" strokeWidth={1.75} />
          </span>
        </button>
      </div>

      <InviteFriendsDrawer open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Delete */}
      <div>
        <h3 className="text-lg font-medium text-[var(--danger-strong)] mb-4">{t('Delete account')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors hover:border-[var(--danger-tint)]">
          <div>
            <span className="block text-sm font-medium text-[var(--danger-strong)] mb-1">{t('Danger zone')}</span>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('Permanently delete your account, responses, and unreleased rewards. This cannot be undone.')}
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

function DemographicsPanel({ t }: { t: TFn }) {
  return (
    <div className="space-y-8 pb-20">
      <p className="text-sm text-[var(--text-secondary)] max-w-3xl -mt-4 leading-relaxed">
        {t('These details decide which surveys match you. Keep them accurate — companies pay more for well-matched respondents, and iDap uses them only for matching.')}
      </p>

      <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('Age range')}
            </label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>18–24</option>
                <option>25–34</option>
                <option>35–44</option>
                <option>45–54</option>
                <option>55+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('Gender')}
            </label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>{t('Prefer not to say')}</option>
                <option>{t('Male')}</option>
                <option>{t('Female')}</option>
                <option>{t('Non-binary')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('City')}
            </label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>Ulaanbaatar</option>
                <option>Erdenet</option>
                <option>Darkhan</option>
                <option>Choibalsan</option>
                <option>{t('Other')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('District / khoroo')}
            </label>
            <input
              type="text"
              placeholder="Sükhbaatar, Khoroo 1"
              className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('Education')}
            </label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>{t('High school')}</option>
                <option>{t("Bachelor's")}</option>
                <option>{t("Master's")}</option>
                <option>{t('Doctorate')}</option>
                <option>{t('Other')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('Employment')}
            </label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>{t('Full-time')}</option>
                <option>{t('Part-time')}</option>
                <option>{t('Self-employed')}</option>
                <option>{t('Student')}</option>
                <option>{t('Unemployed')}</option>
                <option>{t('Retired')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            {t('Monthly household income (KRW)')}
          </label>
          <div className="relative">
            <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
              <option>{t('Under ₩500,000')}</option>
              <option>₩500,000 – ₩1,000,000</option>
              <option>₩1,000,000 – ₩2,000,000</option>
              <option>₩2,000,000 – ₩5,000,000</option>
              <option>{t('Over ₩5,000,000')}</option>
              <option>{t('Prefer not to say')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {t('Used for matching only. Never shared in individual responses.')}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-md text-sm font-medium transition-colors">
          {t('Save changes')}
        </button>
      </div>
    </div>
  );
}

function SurveyPreferencesPanel({ t }: { t: TFn }) {
  const categories = [
    { key: 'Social', label: t('Social') },
    { key: 'Brand', label: t('Brand') },
    { key: 'Product', label: t('Product') },
    { key: 'HR', label: t('HR') },
    { key: 'Finance', label: t('Finance') },
    { key: 'Other', label: t('Other') },
  ];
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Interested categories')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {t('Show more surveys from these categories in your feed.')}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => (
              <CategoryChip key={c.key} label={c.label} defaultOn={i < 3} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Match filters')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {t('Minimum reward')}
              </label>
              <div className="relative">
                <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                  <option>{t('Any')}</option>
                  <option>₩1,000+</option>
                  <option>₩5,000+</option>
                  <option>₩10,000+</option>
                  <option>₩15,000+</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {t('Maximum duration')}
              </label>
              <div className="relative">
                <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                  <option>{t('Any')}</option>
                  <option>5 {t('min')}</option>
                  <option>10 {t('min')}</option>
                  <option>15 {t('min')}</option>
                  <option>20 {t('min')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              </div>
            </div>
          </div>

          <ToggleRow
            label={t('Only show surveys I qualify for')}
            description={t("Hide surveys above your current trust level so you don't see locked cards.")}
            defaultOn={false}
          />
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel({ t }: { t: TFn }) {
  const rows = [
    {
      label: t('New matching survey'),
      description: t('When a new survey hits your feed with a match of 85%+.'),
    },
    {
      label: t('Reward paid'),
      description: t('When a reward lands in your wallet (instant or after the 24h hold).'),
    },
    {
      label: t('Response held for review'),
      description: t('When a response is pending quality review.'),
    },
    {
      label: t('Response rejected'),
      description: t('When a response fails quality checks and no reward is paid.'),
    },
    {
      label: t('Trust level up'),
      description: t('When you unlock the next trust level and higher-paying surveys.'),
    },
    {
      label: t('Withdrawal status'),
      description: t('Updates on pending, paid, or failed withdrawals.'),
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
              {t('Language used across the iDap interface.')}
            </p>
            <div className="relative">
              <select
                className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              {t('Timezone')}
            </label>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {t('Used for submission times and hold-release countdowns.')}
            </p>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>Asia/Ulaanbaatar (UTC+8)</option>
                <option>Asia/Tokyo (UTC+9)</option>
                <option>Asia/Seoul (UTC+9)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyPicker t={t} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {t('Date format')}
            </label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors cursor-pointer">
                <option>MMM d, yyyy</option>
                <option>dd/MM/yyyy</option>
                <option>yyyy-MM-dd</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
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
  const [blockedOpen, setBlockedOpen] = useState(false);
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Visibility')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-5">
          <ToggleRow
            label={t('Show on leaderboard')}
            description={t('Let other respondents see your anonymized trust level and streaks.')}
            defaultOn
          />
          <div className="h-px w-full bg-[var(--surface-subtle)]" />
          <ToggleRow
            label={t('Include me in survey panels')}
            description={t('Allow iDap to invite you to targeted paid panels that match your profile.')}
            defaultOn
          />
          <div className="h-px w-full bg-[var(--surface-subtle)]" />
          <ToggleRow
            label={t('Share anonymized responses in public reports')}
            description={t('Aggregated only — never your individual answers or identity.')}
            defaultOn={false}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">{t('Your data')}</h3>
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('Download my data')}</span>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('Export every survey response, reward, and withdrawal as a CSV bundle.')}
              </p>
            </div>
            <button className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 whitespace-nowrap">
              {t('Request export')}
            </button>
          </div>
          <div className="h-px w-full bg-[var(--surface-subtle)]" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t('Blocked companies')}</span>
              <p className="text-sm text-[var(--text-secondary)]">
                {t("Surveys from these companies won't appear in your feed.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBlockedOpen(true)}
              className="px-4 py-2.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              {t('Manage')}
            </button>
          </div>
        </div>
      </div>

      <BlockedCompaniesDrawer open={blockedOpen} onOpenChange={setBlockedOpen} />
    </div>
  );
}

function SessionsPanel({ t }: { t: TFn }) {
  const sessions = [
    { device: 'MacBook Pro · Chrome', where: 'Ulaanbaatar, MN', when: t('Active now'), current: true },
    { device: 'iPhone 15 · iDap App', where: 'Ulaanbaatar, MN', when: t('2 hours ago'), current: false },
    { device: 'Windows · Firefox', where: 'Erdenet, MN', when: t('3 days ago'), current: false },
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
