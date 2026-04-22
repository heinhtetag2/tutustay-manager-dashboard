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

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${Math.round(value / 1_000)}K`;
  return `₮${value}`;
}

function getStatusStyles(status: CompanyStatus) {
  switch (status) {
    case 'Pending':
      return { badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]', Icon: Clock };
    case 'Approved':
      return { badge: 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]', Icon: CheckCircle2 };
    case 'Suspended':
      return { badge: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]', Icon: Ban };
  }
}

function getPlanStyles(plan: CompanyPlan) {
  switch (plan) {
    case 'Enterprise':
      return 'bg-[#FFF1EE] text-[#C2410C] border border-[#FED7AA]';
    case 'Growth':
      return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]';
    case 'Starter':
      return 'bg-[#F3F3F3] text-[#4A4A4A] border border-[#EBEBEB]';
  }
}

function getSurveyStatusStyles(status: SurveyStatus) {
  switch (status) {
    case 'Active':    return 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]';
    case 'Draft':     return 'bg-[#F3F3F3] text-[#616161] border border-[#EBEBEB]';
    case 'Paused':    return 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]';
    case 'Completed': return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]';
    case 'Rejected':  return 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]';
  }
}

function activityIcon(kind: CompanyActivityKind) {
  switch (kind) {
    case 'joined':          return { Icon: UserCircle2,    tone: 'bg-[#F3F3F3] text-[#4A4A4A]' };
    case 'approved':        return { Icon: CheckCircle2,   tone: 'bg-[#ECFDF5] text-[#047857]' };
    case 'survey-launched': return { Icon: ClipboardList,  tone: 'bg-[#FFF1EE] text-[#FF3C21]' };
    case 'payout':          return { Icon: Receipt,        tone: 'bg-[#EFF6FF] text-[#1D4ED8]' };
    case 'topup':           return { Icon: Sparkles,       tone: 'bg-[#FFF1EE] text-[#FF3C21]' };
    case 'suspended':       return { Icon: Ban,            tone: 'bg-[#FEF2F2] text-[#B91C1C]' };
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
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA] min-h-full">
        <nav className="flex items-center gap-2 text-sm text-[#616161] mb-4">
          <button
            onClick={() => navigate('/companies')}
            className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            {t('Companies')}
          </button>
          <span className="text-[#D4D4D4]">/</span>
          <span className="text-[#1A1A1A] font-medium">{t('Not found')}</span>
        </nav>
        <div className="max-w-md mx-auto text-center mt-16">
          <div className="w-12 h-12 rounded-full bg-[#F3F3F3] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-5 h-5 text-[#616161]" />
          </div>
          <h2 className="text-lg font-medium text-[#1A1A1A]">{t('Company not found')}</h2>
          <p className="text-sm text-[#616161] mt-1">
            {t("This company may have been removed or the link is invalid.")}
          </p>
          <button
            onClick={() => navigate('/companies')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors cursor-pointer"
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
    },
    {
      title: 'Total spent',
      Icon: Wallet,
      value: formatMnt(company.totalSpentMnt),
      subtitle: t('Lifetime on the platform'),
    },
    {
      title: 'Total responses',
      Icon: Users,
      value: company.responses.toLocaleString(),
      subtitle: t('Collected across surveys'),
    },
    {
      title: 'Member since',
      Icon: CalendarDays,
      value: format(new Date(company.joined), 'MMM yyyy'),
      subtitle: formatDistanceToNow(new Date(company.joined), { addSuffix: true }),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA] min-h-full"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#616161] mb-4">
        <button
          onClick={() => navigate('/companies')}
          className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          {t('Companies')}
        </button>
        <span className="text-[#D4D4D4]">/</span>
        <span className="text-[#1A1A1A] font-medium">{company.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-xl font-medium shrink-0">
            {company.initial}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-3xl font-serif text-[#1A1A1A] leading-tight">{company.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}>
                <statusStyle.Icon className="w-3 h-3" />
                {t(company.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(company.plan)}`}>
                {t(company.plan)}
              </span>
              <span className="text-sm text-[#616161]">·</span>
              <span className="text-sm text-[#4A4A4A]">{company.industry}</span>
            </div>
          </div>
        </div>

        {/* Primary status-based actions */}
        <div className="flex items-center gap-2 shrink-0">
          {company.status === 'Pending' && (
            <>
              <button
                onClick={() => setConfirming({ action: 'reject' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-[#616161]" />
                {t('Reject')}
              </button>
              <button
                onClick={() => setConfirming({ action: 'approve' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#059669] rounded-md hover:bg-[#047857] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('Approve company')}
              </button>
            </>
          )}
          {company.status === 'Approved' && (
            <button
              onClick={() => setConfirming({ action: 'suspend' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#B91C1C] bg-white border border-[#FECACA] rounded-md hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              {t('Suspend')}
            </button>
          )}
          {company.status === 'Suspended' && (
            <button
              onClick={() => setConfirming({ action: 'reinstate' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#059669] rounded-md hover:bg-[#047857] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {t('Reinstate')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#EBEBEB] mb-6 overflow-x-auto">
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
                isActive ? 'text-[#1A1A1A]' : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              {tab.label}
              {'count' in tab && tab.count !== undefined && (
                <span className="text-[#616161] font-normal tabular-nums">({tab.count})</span>
              )}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[#FF3C21] rounded-full" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="bg-white border border-[#EBEBEB] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[#FFC1B5] transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-[#616161]">{t(card.title)}</span>
                  <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A] group-hover:bg-[#FF3C21] group-hover:text-white transition-colors">
                    <card.Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-medium text-[#1A1A1A]">{card.value}</div>
                <div className="text-xs text-[#4A4A4A] mt-2">{card.subtitle}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <section className="lg:col-span-2 bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F3F3F3]">
              <h2 className="text-base font-medium text-[#1A1A1A]">{t('Company details')}</h2>
              <p className="text-xs text-[#616161] mt-0.5">{t('Contact and organization info')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={UserCircle2} label={t('Primary contact')}>
                <div className="text-sm font-medium text-[#1A1A1A]">{company.contactPerson}</div>
                <div className="text-xs text-[#616161]">{company.contactRole}</div>
              </InfoRow>
              <InfoRow Icon={Mail} label={t('Email')}>
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm text-[#1A1A1A] hover:text-[#FF3C21] transition-colors break-all"
                >
                  {company.email}
                </a>
              </InfoRow>
              <InfoRow Icon={Phone} label={t('Phone')}>
                <span className="text-sm text-[#1A1A1A] tabular-nums">{company.phone}</span>
              </InfoRow>
              <InfoRow Icon={Globe} label={t('Website')}>
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[#1A1A1A] hover:text-[#FF3C21] transition-colors"
                >
                  {company.website}
                </a>
              </InfoRow>
              <InfoRow Icon={Building2} label={t('Industry')}>
                <span className="text-sm text-[#1A1A1A]">{company.industry}</span>
              </InfoRow>
              <InfoRow Icon={Users} label={t('Team size')}>
                <span className="text-sm text-[#1A1A1A]">{company.teamSize}</span>
              </InfoRow>
              <div className="sm:col-span-2">
                <InfoRow Icon={MapPin} label={t('Address')}>
                  <span className="text-sm text-[#1A1A1A] leading-snug">{company.address}</span>
                </InfoRow>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F3F3F3]">
                <h2 className="text-base font-medium text-[#1A1A1A]">{t('Plan summary')}</h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#616161]">{t('Current plan')}</div>
                    <div className="mt-1 inline-flex">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(company.plan)}`}>
                        {t(company.plan)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#616161]">{t('Renews')}</div>
                    <div className="text-sm font-medium text-[#1A1A1A] tabular-nums mt-1">
                      {format(new Date(company.renewalDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[#616161]" />
                  {t('Manage billing')}
                </button>
              </div>
            </section>

            <section className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F3F3F3]">
                <h2 className="text-base font-medium text-[#1A1A1A]">{t('Activity')}</h2>
                <p className="text-xs text-[#616161] mt-0.5">{t('Recent account events')}</p>
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
                        <div className="text-sm font-medium text-[#1A1A1A]">{t(event.label)}</div>
                        {event.detail && (
                          <div className="text-xs text-[#616161] mt-0.5">{t(event.detail)}</div>
                        )}
                        <div className="text-xs text-[#616161] mt-1 tabular-nums">
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
          className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F3F3]">
            <div>
              <h2 className="text-base font-medium text-[#1A1A1A]">{t('Recent surveys')}</h2>
              <p className="text-xs text-[#616161] mt-0.5">
                {t('Surveys run by this company')}
              </p>
            </div>
            <button
              onClick={() => navigate('/surveys')}
              className="text-xs font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors cursor-pointer"
            >
              {t('View all')}
            </button>
          </div>
          <div className="divide-y divide-[#F3F3F3]">
            {companySurveys.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#616161]">
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
                  className="px-6 py-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-[#1A1A1A] truncate">
                        {survey.title}
                      </div>
                      <div className="text-xs text-[#616161] mt-0.5">
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
                    <div className="relative flex-1 h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#FF3C21] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#4A4A4A] tabular-nums shrink-0">
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
          className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[#F3F3F3]">
            <h2 className="text-base font-medium text-[#1A1A1A]">{t('Plan & billing')}</h2>
            <p className="text-xs text-[#616161] mt-0.5">
              {t('Subscription, balance, and lifetime spend')}
            </p>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[#616161]">{t('Current plan')}</div>
                <div className="mt-1 inline-flex">
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(company.plan)}`}>
                    {t(company.plan)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#616161]">{t('Renews')}</div>
                <div className="text-sm font-medium text-[#1A1A1A] tabular-nums mt-1">
                  {format(new Date(company.renewalDate), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="h-px bg-[#F3F3F3]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[#FAFAFA] rounded-md">
                <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-[#4A4A4A] border border-[#EBEBEB]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#616161]">{t('Credit balance')}</div>
                  <div className="text-base font-medium text-[#1A1A1A] tabular-nums">
                    {formatMnt(company.creditsBalanceMnt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#FAFAFA] rounded-md">
                <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-[#4A4A4A] border border-[#EBEBEB]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#616161]">{t('Lifetime spend')}</div>
                  <div className="text-base font-medium text-[#1A1A1A] tabular-nums">
                    {formatMnt(company.totalSpentMnt)}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsBillingHistoryOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#616161]" />
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
            className="fixed inset-0 bg-[#1A1A1A]/30 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-sm shadow-none border border-[#F3F3F3] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F3F3]">
                <h2 className="text-lg font-medium text-[#1A1A1A]">{actionMeta.title}</h2>
                <button
                  onClick={() => setConfirming(null)}
                  className="text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-[#4A4A4A] text-sm leading-relaxed">{actionMeta.description}</p>
                <div className="mt-3 p-3 bg-white border border-[#EBEBEB] rounded-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-sm font-medium shrink-0">
                    {company.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#1A1A1A] text-sm truncate">{company.name}</div>
                    <div className="text-[#616161] text-xs truncate">{company.email}</div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[#B91C1C] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This action can be reversed from the Suspended tab.')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F3F3F3]">
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={applyAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors cursor-pointer ${
                    actionMeta.tone === 'danger'
                      ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                      : 'bg-[#059669] hover:bg-[#047857]'
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
      <div className="w-8 h-8 rounded-md bg-[#F3F3F3] flex items-center justify-center text-[#4A4A4A] shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[#616161] mb-0.5">{label}</div>
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
    case 'Paid':     return 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]';
    case 'Upcoming': return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]';
    case 'Overdue':  return 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]';
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
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[#EBEBEB] p-0">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#F3F3F3] flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0">
              <DrawerTitle className="text-base font-medium text-[#1A1A1A]">
                {t('Billing history')}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-[#616161] mt-0.5 truncate">
                {company.name} · {t(company.plan)}
              </DrawerDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors cursor-pointer shrink-0"
              aria-label={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary strip */}
          <div className="px-6 py-4 border-b border-[#F3F3F3] grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3 bg-[#FAFAFA] rounded-md">
              <div className="text-xs text-[#616161]">{t('Credit balance')}</div>
              <div className="text-lg font-medium text-[#1A1A1A] tabular-nums mt-1">
                {formatMnt(company.creditsBalanceMnt)}
              </div>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded-md">
              <div className="text-xs text-[#616161]">{t('Lifetime spend')}</div>
              <div className="text-lg font-medium text-[#1A1A1A] tabular-nums mt-1">
                {formatMnt(company.totalSpentMnt)}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Invoices */}
            <section className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#1A1A1A]">{t('Invoices')}</h3>
                <span className="text-xs text-[#616161] tabular-nums">{invoices.length}</span>
              </div>
              <div className="border border-[#EBEBEB] rounded-md overflow-hidden">
                {invoices.map((inv, i) => (
                  <div
                    key={inv.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < invoices.length - 1 ? 'border-b border-[#F3F3F3]' : ''
                    } hover:bg-[#FAFAFA] transition-colors`}
                  >
                    <div className="w-9 h-9 rounded-md bg-[#F3F3F3] flex items-center justify-center text-[#4A4A4A] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-medium text-[#1A1A1A] truncate">
                          {inv.id}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-full ${getInvoiceStatusStyles(inv.status)}`}
                        >
                          {t(inv.status)}
                        </span>
                      </div>
                      <div className="text-xs text-[#616161] mt-0.5 truncate">
                        {inv.periodLabel} · {inv.method}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[#1A1A1A] tabular-nums">
                        {formatMnt(inv.amountMnt)}
                      </div>
                      <button
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#4A4A4A] hover:text-[#FF3C21] transition-colors cursor-pointer"
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

            <div className="h-px bg-[#F3F3F3] mx-6" />

            {/* Credit transactions */}
            <section className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[#1A1A1A]">{t('Credit transactions')}</h3>
                <span className="text-xs text-[#616161] tabular-nums">{transactions.length}</span>
              </div>
              <ol className="space-y-3">
                {transactions.map((tx, i) => {
                  const isIncoming = tx.amountMnt > 0;
                  const toneIcon = isIncoming
                    ? 'bg-[#ECFDF5] text-[#047857]'
                    : 'bg-[#FFF1EE] text-[#FF3C21]';
                  const Icon = tx.kind === 'topup' || tx.kind === 'refund'
                    ? ArrowDownLeft
                    : tx.kind === 'bonus'
                      ? Sparkles
                      : ArrowUpRight;
                  return (
                    <li key={i} className="flex gap-3 p-3 bg-white border border-[#F3F3F3] rounded-md">
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${toneIcon}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1A1A1A]">{t(tx.label)}</div>
                        <div className="text-xs text-[#616161] mt-0.5 truncate">{t(tx.detail)}</div>
                        <div className="text-xs text-[#616161] mt-1 tabular-nums">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium tabular-nums shrink-0 ${
                          isIncoming ? 'text-[#047857]' : 'text-[#B91C1C]'
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
          <div className="px-6 py-4 border-t border-[#F3F3F3] bg-white shrink-0 flex items-center gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              {t('Close')}
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF3C21] rounded-md hover:bg-[#E63419] transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
              {t('Download statement')}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
