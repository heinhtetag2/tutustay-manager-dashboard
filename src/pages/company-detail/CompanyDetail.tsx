import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  UserCircle2,
  CheckCircle2,
  Clock,
  Ban,
  RotateCcw,
  X,
  XCircle,
  AlertCircle,
  Wallet,
  ClipboardList,
  Users,
  CalendarDays,
  CreditCard,
  TrendingUp,
  Sparkles,
  Receipt,
  LayoutDashboard,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/drawer';

import {
  findCompanyById,
  type Company,
  type CompanyActivityKind,
  type CompanyPlan,
  type CompanyStatus,
} from '@/pages/companies/company-data';
import { DEMO_SURVEYS, type Survey, type SurveyStatus } from '@/pages/surveys/survey-data';
import { Portal } from '@/shared/ui/portal';
import { STAT_TONE } from '@/shared/ui/stat-tone';

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
}

function getStatusStyles(status: CompanyStatus) {
  switch (status) {
    case 'Pending':
      return { badge: 'bg-[var(--warning-tint)] text-[var(--warning)]', Icon: Clock };
    case 'Approved':
      return { badge: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 };
    case 'Suspended':
      return { badge: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: Ban };
  }
}

function getPlanStyles(plan: CompanyPlan) {
  switch (plan) {
    case 'Enterprise':
      return 'bg-[var(--brand-tint)] text-[var(--warning)]';
    case 'Growth':
      return 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]';
    case 'Starter':
      return 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]';
  }
}

function getSurveyStatusStyles(status: SurveyStatus) {
  switch (status) {
    case 'Active':    return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Draft':     return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Paused':    return 'bg-[var(--warning-tint)] text-[var(--warning)]';
    case 'Completed': return 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]';
    case 'Rejected':  return 'bg-[var(--danger-tint)] text-[var(--danger)]';
  }
}

function activityIcon(kind: CompanyActivityKind) {
  switch (kind) {
    case 'joined':          return { Icon: UserCircle2,    tone: 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]' };
    case 'approved':        return { Icon: CheckCircle2,   tone: 'bg-[var(--success-tint)] text-[var(--success)]' };
    case 'survey-launched': return { Icon: ClipboardList,  tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]' };
    case 'payout':          return { Icon: Receipt,        tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]' };
    case 'topup':           return { Icon: Sparkles,       tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]' };
    case 'suspended':       return { Icon: Ban,            tone: 'bg-[var(--danger-tint)] text-[var(--danger)]' };
  }
}

export default function CompanyDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const initial = id ? findCompanyById(id) : undefined;
  const [company, setCompany] = useState<Company | undefined>(initial);
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'billing'>('overview');
  const [isBillingHistoryOpen, setIsBillingHistoryOpen] = useState(false);
  const [confirming, setConfirming] = useState<
    | { action: 'approve' | 'reject' | 'suspend' | 'reinstate' }
    | null
  >(null);

  if (!company) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
          <button
            onClick={() => navigate('/companies')}
            className="font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {t('Companies')}
          </button>
          <span className="text-[var(--border-strong)]">/</span>
          <span className="text-[var(--text-primary)] font-medium">{t('Not found')}</span>
        </nav>
        <div className="max-w-md mx-auto text-center mt-16">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-5 h-5 text-[var(--text-secondary)]" />
          </div>
          <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Company not found')}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t("This company may have been removed or the link is invalid.")}
          </p>
          <button
            onClick={() => navigate('/companies')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Companies')}
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyles(company.status);

  const applyAction = () => {
    if (!confirming) return;
    setCompany((prev) => {
      if (!prev) return prev;
      if (confirming.action === 'approve' || confirming.action === 'reinstate')
        return { ...prev, status: 'Approved' };
      if (confirming.action === 'reject' || confirming.action === 'suspend')
        return { ...prev, status: 'Suspended' };
      return prev;
    });
    setConfirming(null);
  };

  const actionMeta = confirming
    ? {
        approve: {
          title: t('Approve company?'),
          description: t('This company will gain full access to launch surveys and purchase credits.'),
          cta: t('Approve'),
          tone: 'success' as const,
        },
        reject: {
          title: t('Reject application?'),
          description: t('This company will not be able to access the platform. You can reinstate them later.'),
          cta: t('Reject'),
          tone: 'danger' as const,
        },
        suspend: {
          title: t('Suspend company?'),
          description: t('All active surveys will be paused and the team will lose access until reinstated.'),
          cta: t('Suspend'),
          tone: 'danger' as const,
        },
        reinstate: {
          title: t('Reinstate company?'),
          description: t('Access will be restored and any previously paused surveys can be resumed.'),
          cta: t('Reinstate'),
          tone: 'success' as const,
        },
      }[confirming.action]
    : null;

  const companySurveys: Survey[] = DEMO_SURVEYS.filter((s) => s.companyId === company.id);

  const stats = [
    {
      title: 'Total surveys',
      Icon: ClipboardList,
      value: String(company.surveys),
      subtitle: `${companySurveys.filter((s) => s.status === 'Active').length} ${t('currently active')}`,
      tone: 'brand' as const,
    },
    {
      title: 'Total spent',
      Icon: Wallet,
      value: formatMnt(company.totalSpentMnt),
      subtitle: t('Lifetime on the platform'),
      tone: 'success' as const,
    },
    {
      title: 'Total responses',
      Icon: Users,
      value: company.responses.toLocaleString(),
      subtitle: t('Collected across surveys'),
      tone: 'info' as const,
    },
    {
      title: 'Member since',
      Icon: CalendarDays,
      value: format(new Date(company.joined), 'MMM yyyy'),
      subtitle: formatDistanceToNow(new Date(company.joined), { addSuffix: true }),
      tone: 'purple' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
        <button
          onClick={() => navigate('/companies')}
          className="font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {t('Companies')}
        </button>
        <span className="text-[var(--border-strong)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">{company.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-xl font-medium shrink-0">
            {company.initial}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight">{company.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}>
                <statusStyle.Icon className="w-3 h-3" />
                {t(company.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(company.plan)}`}>
                {t(company.plan)}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">·</span>
              <span className="text-sm text-[var(--text-tertiary)]">{company.industry}</span>
            </div>
          </div>
        </div>

        {/* Primary status-based actions */}
        <div className="flex items-center gap-2 shrink-0">
          {company.status === 'Pending' && (
            <>
              <button
                onClick={() => setConfirming({ action: 'reject' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-[var(--text-secondary)]" />
                {t('Reject')}
              </button>
              <button
                onClick={() => setConfirming({ action: 'approve' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('Approve company')}
              </button>
            </>
          )}
          {company.status === 'Approved' && (
            <button
              onClick={() => setConfirming({ action: 'suspend' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              {t('Suspend')}
            </button>
          )}
          {company.status === 'Suspended' && (
            <button
              onClick={() => setConfirming({ action: 'reinstate' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {t('Reinstate')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-default)] mb-6 overflow-x-auto">
        {([
          { id: 'overview', Icon: LayoutDashboard, label: t('Overview') },
          { id: 'surveys',  Icon: ClipboardList,   label: t('Surveys'),  count: companySurveys.length },
          { id: 'billing',  Icon: CreditCard,      label: t('Billing') },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              {tab.label}
              {'count' in tab && tab.count !== undefined && (
                <span className="text-[var(--text-secondary)] font-normal tabular-nums">({tab.count})</span>
              )}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[var(--brand-primary)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
            {stats.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
              >
                <div className="flex justify-between items-start mb-1.5 sm:mb-4">
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
                  <div className={`p-2 rounded-md transition-colors ${STAT_TONE[card.tone]}`}>
                    <card.Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
                <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <section className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Company details')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Contact and organization info')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={UserCircle2} label={t('Primary contact')}>
                <div className="text-sm font-medium text-[var(--text-primary)]">{company.contactPerson}</div>
                <div className="text-xs text-[var(--text-secondary)]">{company.contactRole}</div>
              </InfoRow>
              <InfoRow Icon={Mail} label={t('Email')}>
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors break-all"
                >
                  {company.email}
                </a>
              </InfoRow>
              <InfoRow Icon={Phone} label={t('Phone')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{company.phone}</span>
              </InfoRow>
              <InfoRow Icon={Globe} label={t('Website')}>
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors"
                >
                  {company.website}
                </a>
              </InfoRow>
              <InfoRow Icon={Building2} label={t('Industry')}>
                <span className="text-sm text-[var(--text-primary)]">{company.industry}</span>
              </InfoRow>
              <InfoRow Icon={Users} label={t('Team size')}>
                <span className="text-sm text-[var(--text-primary)]">{company.teamSize}</span>
              </InfoRow>
              <div className="sm:col-span-2">
                <InfoRow Icon={MapPin} label={t('Address')}>
                  <span className="text-sm text-[var(--text-primary)] leading-snug">{company.address}</span>
                </InfoRow>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Plan summary')}</h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--text-secondary)]">{t('Current plan')}</div>
                    <div className="mt-1 inline-flex">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(company.plan)}`}>
                        {t(company.plan)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[var(--text-secondary)]">{t('Renews')}</div>
                    <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums mt-1">
                      {format(new Date(company.renewalDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[var(--text-secondary)]" />
                  {t('Manage billing')}
                </button>
              </div>
            </section>

            <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Activity')}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Recent account events')}</p>
              </div>
              <ol className="px-6 py-5 space-y-5">
                {company.activity.map((event, i) => {
                  const { Icon, tone } = activityIcon(event.kind);
                  return (
                    <li key={`${event.kind}-${i}`} className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tone}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{t(event.label)}</div>
                        {event.detail && (
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t(event.detail)}</div>
                        )}
                        <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
          </div>
        </motion.div>
      )}

      {/* Surveys tab */}
      {activeTab === 'surveys' && (
        <motion.section
          key="surveys"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Recent surveys')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('Surveys run by this company')}
              </p>
            </div>
            <button
              onClick={() => navigate('/surveys')}
              className="text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              {t('View all')}
            </button>
          </div>
          <div className="divide-y divide-[var(--surface-subtle)]">
            {companySurveys.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
                {t('No surveys yet for this company.')}
              </div>
            ) : companySurveys.map((survey) => {
              const pct = Math.min(
                100,
                Math.round((survey.responsesCurrent / Math.max(1, survey.responsesTarget)) * 100),
              );
              return (
                <div
                  key={survey.id}
                  onClick={() => navigate(`/surveys/${survey.id.toLowerCase()}`)}
                  className="px-6 py-4 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-[var(--text-primary)] truncate">
                        {survey.title}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {t(survey.category)} · {formatMnt(survey.rewardMnt)} {t('per response')}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getSurveyStatusStyles(survey.status)} shrink-0`}
                    >
                      {t(survey.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[var(--brand-primary)] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-tertiary)] tabular-nums shrink-0">
                      {survey.responsesCurrent}/{survey.responsesTarget}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Billing tab */}
      {activeTab === 'billing' && (
        <motion.section
          key="billing"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Plan & billing')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {t('Subscription, balance, and lifetime spend')}
            </p>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--text-secondary)]">{t('Current plan')}</div>
                <div className="mt-1 inline-flex">
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(company.plan)}`}>
                    {t(company.plan)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--text-secondary)]">{t('Renews')}</div>
                <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums mt-1">
                  {format(new Date(company.renewalDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--surface-subtle)]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[var(--surface-muted)] rounded-md">
                <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-[var(--text-tertiary)] border border-[var(--border-default)]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--text-secondary)]">{t('Credit balance')}</div>
                  <div className="text-base font-medium text-[var(--text-primary)] tabular-nums">
                    {formatMnt(company.creditsBalanceMnt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[var(--surface-muted)] rounded-md">
                <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-[var(--text-tertiary)] border border-[var(--border-default)]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--text-secondary)]">{t('Lifetime spend')}</div>
                  <div className="text-base font-medium text-[var(--text-primary)] tabular-nums">
                    {formatMnt(company.totalSpentMnt)}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsBillingHistoryOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[var(--text-secondary)]" />
              {t('View billing history')}
            </button>
          </div>
        </motion.section>
      )}

      <BillingHistoryDrawer
        company={company}
        open={isBillingHistoryOpen}
        onOpenChange={setIsBillingHistoryOpen}
      />

      {/* Confirm Modal */}
      <Portal>
      <AnimatePresence>
        {confirming && actionMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">{actionMeta.title}</h2>
                <button
                  onClick={() => setConfirming(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">{actionMeta.description}</p>
                <div className="mt-3 p-3 bg-white border border-[var(--border-default)] rounded-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                    {company.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--text-primary)] text-sm truncate">{company.name}</div>
                    <div className="text-[var(--text-secondary)] text-xs truncate">{company.email}</div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This action can be reversed from the Suspended tab.')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={applyAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors cursor-pointer ${
                    actionMeta.tone === 'danger'
                      ? 'bg-[var(--danger-strong)] hover:bg-[var(--danger)]'
                      : 'bg-[var(--success-strong)] hover:bg-[var(--success)]'
                  }`}
                >
                  {actionMeta.cta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function InfoRow({
  Icon,
  label,
  children,
}: {
  Icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}

type InvoiceStatus = 'Paid' | 'Upcoming' | 'Overdue';

type Invoice = {
  id: string;
  issueDate: string;
  periodLabel: string;
  amountMnt: number;
  status: InvoiceStatus;
  method: string;
};

type CreditTx = {
  kind: 'topup' | 'deduction' | 'bonus' | 'refund';
  label: string;
  detail: string;
  amountMnt: number;
  date: string;
};

function buildInvoices(company: Company): Invoice[] {
  const monthly = company.plan === 'Enterprise' ? 1_000_000 : company.plan === 'Growth' ? 500_000 : 100_000;
  const months = ['Apr', 'Mar', 'Feb', 'Jan', 'Dec', 'Nov'];
  const yearFor = (i: number) => (i < 4 ? 2026 : 2025);
  const statuses: InvoiceStatus[] = ['Upcoming', 'Paid', 'Paid', 'Paid', 'Paid', 'Paid'];
  const methods = ['QPay', 'Bank Transfer', 'QPay', 'Social Pay', 'QPay', 'Bank Transfer'];
  return months.map((m, i) => ({
    id: `INV-${yearFor(i)}-${String(i + 1).padStart(2, '0')}-${company.id.split('-')[1]}`,
    issueDate: `${yearFor(i)}-${String(12 - ((i + 8) % 12)).padStart(2, '0')}-14`,
    periodLabel: `${m} ${yearFor(i)}`,
    amountMnt: monthly,
    status: statuses[i],
    method: methods[i],
  }));
}

function buildCreditTransactions(company: Company): CreditTx[] {
  return [
    {
      kind: 'topup',
      label: 'Credit top-up',
      detail: `${company.plan} monthly add-on · ${formatMnt(company.plan === 'Enterprise' ? 1_000_000 : 500_000)}`,
      amountMnt: company.plan === 'Enterprise' ? 1_000_000 : 500_000,
      date: '2026-04-14',
    },
    {
      kind: 'deduction',
      label: 'Survey rewards',
      detail: 'Organizational Culture Survey · 112 responses',
      amountMnt: -56_000,
      date: '2026-04-10',
    },
    {
      kind: 'bonus',
      label: 'Bonus credits',
      detail: 'Growth package bonus applied',
      amountMnt: 100_000,
      date: '2026-04-14',
    },
    {
      kind: 'deduction',
      label: 'Survey rewards',
      detail: 'Brand Perception Study · 87 responses',
      amountMnt: -43_500,
      date: '2026-03-22',
    },
    {
      kind: 'topup',
      label: 'Credit top-up',
      detail: 'Monthly add-on',
      amountMnt: 500_000,
      date: '2026-03-14',
    },
    {
      kind: 'refund',
      label: 'Invalidated responses refund',
      detail: 'Quality score below threshold · 8 responses',
      amountMnt: 4_000,
      date: '2026-03-05',
    },
  ];
}

function getInvoiceStatusStyles(status: InvoiceStatus) {
  switch (status) {
    case 'Paid':     return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Upcoming': return 'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]';
    case 'Overdue':  return 'bg-[var(--danger-tint)] text-[var(--danger)]';
  }
}

function BillingHistoryDrawer({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const invoices = buildInvoices(company);
  const transactions = buildCreditTransactions(company);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[var(--border-default)] p-0">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-medium text-[var(--text-primary)]">
                {t('Billing history')}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-[var(--text-secondary)] mt-0.5 truncate">
                {company.name} · {t(company.plan)}
              </DrawerDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer shrink-0"
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary strip */}
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)] grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3 bg-[var(--surface-muted)] rounded-md">
              <div className="text-xs text-[var(--text-secondary)]">{t('Credit balance')}</div>
              <div className="text-lg font-medium text-[var(--text-primary)] tabular-nums mt-1">
                {formatMnt(company.creditsBalanceMnt)}
              </div>
            </div>
            <div className="p-3 bg-[var(--surface-muted)] rounded-md">
              <div className="text-xs text-[var(--text-secondary)]">{t('Lifetime spend')}</div>
              <div className="text-lg font-medium text-[var(--text-primary)] tabular-nums mt-1">
                {formatMnt(company.totalSpentMnt)}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Invoices */}
            <section className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Invoices')}</h3>
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">{invoices.length}</span>
              </div>
              <div className="border border-[var(--border-default)] rounded-md overflow-hidden">
                {invoices.map((inv, i) => (
                  <div
                    key={inv.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < invoices.length - 1 ? 'border-b border-[var(--surface-subtle)]' : ''
                    } hover:bg-[var(--surface-muted)] transition-colors`}
                  >
                    <div className="w-9 h-9 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {inv.id}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-full ${getInvoiceStatusStyles(inv.status)}`}
                        >
                          {t(inv.status)}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {inv.periodLabel} · {inv.method}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                        {formatMnt(inv.amountMnt)}
                      </div>
                      <button
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                        title={t('Download')}
                      >
                        <Download className="w-3 h-3" />
                        {t('PDF')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-[var(--surface-subtle)] mx-6" />

            {/* Credit transactions */}
            <section className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Credit transactions')}</h3>
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">{transactions.length}</span>
              </div>
              <ol className="space-y-3">
                {transactions.map((tx, i) => {
                  const isIncoming = tx.amountMnt > 0;
                  const toneIcon = isIncoming
                    ? 'bg-[var(--success-tint)] text-[var(--success)]'
                    : 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
                  const Icon = tx.kind === 'topup' || tx.kind === 'refund'
                    ? ArrowDownLeft
                    : tx.kind === 'bonus'
                      ? Sparkles
                      : ArrowUpRight;
                  return (
                    <li key={i} className="flex gap-3 p-3 bg-white border border-[var(--surface-subtle)] rounded-md">
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${toneIcon}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{t(tx.label)}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{t(tx.detail)}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium tabular-nums shrink-0 ${
                          isIncoming ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                        }`}
                      >
                        {isIncoming ? '+' : '−'}
                        {formatMnt(Math.abs(tx.amountMnt))}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--surface-subtle)] bg-white shrink-0 flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              {t('Close')}
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
              {t('Download statement')}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
