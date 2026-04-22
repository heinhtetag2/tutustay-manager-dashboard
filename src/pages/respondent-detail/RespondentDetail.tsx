import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { Portal } from '@/shared/ui/portal';
import {
  ArrowLeft,
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Smartphone,
  Wallet,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Ban,
  Clock,
  X,
  XCircle,
  Users,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';

import {
  findRespondentById,
  type Respondent,
  type RespondentEvent,
  type RespondentPayout,
  type RespondentStatus,
  type RespondentSurvey,
  type TrustLevel,
} from '@/pages/respondents/respondent-data';

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${Math.round(value / 1_000)}K`;
  return `₮${value}`;
}

function getStatusStyles(status: RespondentStatus) {
  switch (status) {
    case 'Active':    return { badge: 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]', Icon: CheckCircle2 };
    case 'Warned':    return { badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]', Icon: AlertTriangle };
    case 'Suspended': return { badge: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]', Icon: Ban };
  }
}

function getQualityStyles(score: number) {
  if (score >= 80) return { bar: 'bg-[#059669]', text: 'text-[#047857]' };
  if (score >= 60) return { bar: 'bg-[#D97706]', text: 'text-[#B45309]' };
  return { bar: 'bg-[#DC2626]', text: 'text-[#B91C1C]' };
}

function getLevelColor(level: TrustLevel): string {
  switch (level) {
    case 'L1': return 'bg-[#DC2626]';
    case 'L2': return 'bg-[#FF3C21]';
    case 'L3': return 'bg-[#D97706]';
    case 'L4': return 'bg-[#1D4ED8]';
    case 'L5': return 'bg-[#059669]';
  }
}

function getSurveyStatusStyles(status: RespondentSurvey['status']) {
  return status === 'Accepted'
    ? 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]'
    : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]';
}

function getPayoutStatusStyles(status: RespondentPayout['status']) {
  switch (status) {
    case 'Paid':    return 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]';
    case 'Pending': return 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]';
    case 'Failed':  return 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]';
  }
}

function TrustMeter({ level }: { level: TrustLevel }) {
  const filled = Number(level.substring(1));
  const color = getLevelColor(level);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= filled ? color : 'bg-[#EBEBEB]'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[#4A4A4A] tabular-nums">{level}</span>
    </div>
  );
}

function eventIcon(kind: RespondentEvent['kind']) {
  switch (kind) {
    case 'joined':    return { Icon: UserCircle2,  tone: 'bg-[#F3F3F3] text-[#4A4A4A]' };
    case 'survey':    return { Icon: ClipboardList, tone: 'bg-[#FFF1EE] text-[#FF3C21]' };
    case 'payout':    return { Icon: Receipt,      tone: 'bg-[#EFF6FF] text-[#1D4ED8]' };
    case 'warning':   return { Icon: AlertTriangle, tone: 'bg-[#FFFBEB] text-[#B45309]' };
    case 'suspended': return { Icon: Ban,          tone: 'bg-[#FEF2F2] text-[#B91C1C]' };
    case 'milestone': return { Icon: Sparkles,     tone: 'bg-[#ECFDF5] text-[#047857]' };
  }
}

export default function RespondentDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const initial = id ? findRespondentById(id) : undefined;
  const [respondent, setRespondent] = useState<Respondent | undefined>(initial);
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'payouts'>('overview');
  const [confirming, setConfirming] = useState<
    | { action: 'warn' | 'suspend' | 'reinstate' }
    | null
  >(null);

  if (!respondent) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA] min-h-full">
        <nav className="flex items-center gap-2 text-sm text-[#616161] mb-4">
          <button
            onClick={() => navigate('/respondents')}
            className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            {t('Respondents')}
          </button>
          <span className="text-[#D4D4D4]">/</span>
          <span className="text-[#1A1A1A] font-medium">{t('Not found')}</span>
        </nav>
        <div className="max-w-md mx-auto text-center mt-16">
          <div className="w-12 h-12 rounded-full bg-[#F3F3F3] flex items-center justify-center mx-auto mb-4">
            <Users className="w-5 h-5 text-[#616161]" />
          </div>
          <h2 className="text-lg font-medium text-[#1A1A1A]">{t('Respondent not found')}</h2>
          <p className="text-sm text-[#616161] mt-1">
            {t('This respondent may have been removed or the link is invalid.')}
          </p>
          <button
            onClick={() => navigate('/respondents')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Respondents')}
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyles(respondent.status);
  const quality = getQualityStyles(respondent.qualityScore);

  const applyAction = () => {
    if (!confirming) return;
    setRespondent((prev) => {
      if (!prev) return prev;
      if (confirming.action === 'warn')
        return { ...prev, status: 'Warned', warnings: prev.warnings + 1 };
      if (confirming.action === 'suspend') return { ...prev, status: 'Suspended' };
      if (confirming.action === 'reinstate') return { ...prev, status: 'Active' };
      return prev;
    });
    setConfirming(null);
  };

  const actionMeta = confirming
    ? {
        warn: {
          title: t('Issue warning?'),
          description: t('A warning will be recorded and the respondent will be notified. Repeated warnings can lead to suspension.'),
          cta: t('Issue warning'),
          tone: 'warning' as const,
        },
        suspend: {
          title: t('Suspend respondent?'),
          description: t('The respondent will lose access to take surveys. You can reinstate them later.'),
          cta: t('Suspend'),
          tone: 'danger' as const,
        },
        reinstate: {
          title: t('Reinstate respondent?'),
          description: t('Access will be restored and the respondent can take surveys again.'),
          cta: t('Reinstate'),
          tone: 'success' as const,
        },
      }[confirming.action]
    : null;

  const stats = [
    {
      title: 'Surveys completed',
      Icon: ClipboardList,
      value: String(respondent.surveys),
      subtitle: `${respondent.rejectedResponses} ${t('rejected')}`,
    },
    {
      title: 'Quality score',
      Icon: TrendingUp,
      value: `${respondent.qualityScore}%`,
      subtitle: t('Average across surveys'),
    },
    {
      title: 'Total earned',
      Icon: Wallet,
      value: formatMnt(respondent.earnedMnt),
      subtitle: t('Lifetime on the platform'),
    },
    {
      title: 'Member since',
      Icon: CalendarDays,
      value: format(new Date(respondent.joined), 'MMM yyyy'),
      subtitle: formatDistanceToNow(new Date(respondent.joined), { addSuffix: true }),
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
          onClick={() => navigate('/respondents')}
          className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          {t('Respondents')}
        </button>
        <span className="text-[#D4D4D4]">/</span>
        <span className="text-[#1A1A1A] font-medium">{respondent.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-xl font-medium shrink-0">
            {respondent.initial}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[#1A1A1A] leading-tight mb-1.5">
              {respondent.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}>
                <statusStyle.Icon className="w-3 h-3" />
                {t(respondent.status)}
              </span>
              <TrustMeter level={respondent.trustLevel} />
              <span className="text-sm text-[#616161]">·</span>
              <span className="text-sm text-[#4A4A4A]">{respondent.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {respondent.status !== 'Suspended' && (
            <button
              onClick={() => setConfirming({ action: 'warn' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#B45309] bg-white border border-[#FDE68A] rounded-md hover:bg-[#FFFBEB] transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('Warn')}
            </button>
          )}
          {respondent.status !== 'Suspended' ? (
            <button
              onClick={() => setConfirming({ action: 'suspend' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#B91C1C] bg-white border border-[#FECACA] rounded-md hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              {t('Suspend')}
            </button>
          ) : (
            <button
              onClick={() => setConfirming({ action: 'reinstate' })}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#059669] rounded-md hover:bg-[#047857] transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('Reinstate')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#EBEBEB] mb-6 overflow-x-auto">
        {([
          { id: 'overview', Icon: LayoutDashboard, label: t('Overview') },
          { id: 'surveys',  Icon: ClipboardList,   label: t('Surveys'),  count: respondent.surveys },
          { id: 'payouts',  Icon: Receipt,         label: t('Payouts') },
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
            {/* Profile */}
            <section className="lg:col-span-2 bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F3F3F3]">
                <h2 className="text-base font-medium text-[#1A1A1A]">{t('Profile')}</h2>
                <p className="text-xs text-[#616161] mt-0.5">{t('Demographic and account info')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
                <InfoRow Icon={Mail} label={t('Email')}>
                  <a
                    href={`mailto:${respondent.email}`}
                    className="text-sm text-[#1A1A1A] hover:text-[#FF3C21] transition-colors break-all"
                  >
                    {respondent.email}
                  </a>
                </InfoRow>
                <InfoRow Icon={Phone} label={t('Phone')}>
                  <span className="text-sm text-[#1A1A1A] tabular-nums">{respondent.phone}</span>
                </InfoRow>
                <InfoRow Icon={UserCircle2} label={t('Age · Gender')}>
                  <span className="text-sm text-[#1A1A1A]">
                    {respondent.age} · {t(respondent.gender)}
                  </span>
                </InfoRow>
                <InfoRow Icon={MapPin} label={t('Location')}>
                  <span className="text-sm text-[#1A1A1A]">
                    {respondent.district}, {t('Ulaanbaatar')}
                  </span>
                </InfoRow>
                <InfoRow Icon={Briefcase} label={t('Occupation')}>
                  <span className="text-sm text-[#1A1A1A]">{respondent.occupation}</span>
                </InfoRow>
                <InfoRow Icon={Smartphone} label={t('Device preference')}>
                  <span className="text-sm text-[#1A1A1A]">{t(respondent.devicePref)}</span>
                </InfoRow>
                <InfoRow Icon={Wallet} label={t('Payout method')}>
                  <span className="text-sm text-[#1A1A1A]">{respondent.preferredPayout}</span>
                </InfoRow>
                <InfoRow Icon={Clock} label={t('Avg. completion')}>
                  <span className="text-sm text-[#1A1A1A] tabular-nums">
                    {respondent.avgCompletionMin} {t('min')}
                  </span>
                </InfoRow>
              </div>
            </section>

            {/* Right column */}
            <div className="space-y-4">
              <section className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F3F3F3]">
                  <h2 className="text-base font-medium text-[#1A1A1A]">{t('Trust & quality')}</h2>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#616161]">{t('Trust level')}</span>
                      <TrustMeter level={respondent.trustLevel} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[#616161]">{t('Quality score')}</span>
                      <span className={`text-sm font-medium tabular-nums ${quality.text}`}>
                        {respondent.qualityScore}%
                      </span>
                    </div>
                    <div className="relative w-full h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 ${quality.bar} rounded-full`}
                        style={{ width: `${respondent.qualityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-[#F3F3F3]" />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-[#616161]">{t('Warnings')}</div>
                      <div className={`text-base font-medium tabular-nums ${respondent.warnings > 0 ? 'text-[#B91C1C]' : 'text-[#1A1A1A]'}`}>
                        {respondent.warnings}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#616161]">{t('Rejected')}</div>
                      <div className="text-base font-medium text-[#1A1A1A] tabular-nums">
                        {respondent.rejectedResponses}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F3F3F3]">
                  <h2 className="text-base font-medium text-[#1A1A1A]">{t('Activity')}</h2>
                  <p className="text-xs text-[#616161] mt-0.5">{t('Recent account events')}</p>
                </div>
                <ol className="px-6 py-5 space-y-5">
                  {respondent.events.map((event, i) => {
                    const { Icon, tone } = eventIcon(event.kind);
                    return (
                      <li key={`${event.kind}-${i}`} className="flex gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tone}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#1A1A1A]">{t(event.label)}</div>
                          {event.detail && (
                            <div className="text-xs text-[#616161] mt-0.5">{event.detail}</div>
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
          <div className="px-6 py-4 border-b border-[#F3F3F3]">
            <h2 className="text-base font-medium text-[#1A1A1A]">{t('Recent surveys')}</h2>
            <p className="text-xs text-[#616161] mt-0.5">
              {t('Surveys this respondent has completed')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#EBEBEB] text-[#4A4A4A] font-medium bg-[#F3F3F3]">
                  <th className="pl-6 pr-3 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Survey')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Company')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Quality')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Reward')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Completed')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">{t('Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F3F3]">
                {respondent.recentSurveys.map((s) => {
                  const q = getQualityStyles(s.qualityScore);
                  return (
                    <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="pl-6 pr-3 py-4 font-medium text-[#1A1A1A]">{s.title}</td>
                      <td className="px-6 py-4 text-[#4A4A4A]">{s.company}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-20 h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 ${q.bar} rounded-full`}
                              style={{ width: `${s.qualityScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium tabular-nums ${q.text}`}>
                            {s.qualityScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1A1A1A] tabular-nums">
                        {formatMnt(s.rewardMnt)}
                      </td>
                      <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">
                        {format(new Date(s.completedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getSurveyStatusStyles(s.status)}`}
                        >
                          {t(s.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {/* Payouts tab */}
      {activeTab === 'payouts' && (
        <motion.section
          key="payouts"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[#EBEBEB] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[#F3F3F3] flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-[#1A1A1A]">{t('Payouts')}</h2>
              <p className="text-xs text-[#616161] mt-0.5">
                {t('Payment history and preferred method')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#616161]">{t('Prefers')}:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#F3F3F3] text-[#1A1A1A] font-medium">
                {respondent.preferredPayout}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#EBEBEB] text-[#4A4A4A] font-medium bg-[#F3F3F3]">
                  <th className="pl-6 pr-3 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Payout ID')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Method')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Date')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Amount')}</th>
                  <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">{t('Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F3F3]">
                {respondent.recentPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="pl-6 pr-3 py-4 font-medium text-[#1A1A1A] tabular-nums">{p.id.toUpperCase()}</td>
                    <td className="px-6 py-4 text-[#4A4A4A]">{p.method}</td>
                    <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">
                      {format(new Date(p.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] tabular-nums">
                      {formatMnt(p.amountMnt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPayoutStatusStyles(p.status)}`}
                      >
                        {t(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

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
                    {respondent.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#1A1A1A] text-sm truncate">{respondent.name}</div>
                    <div className="text-[#616161] text-xs truncate">{respondent.email}</div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[#B91C1C] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This can be reversed later.')}
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
                      : actionMeta.tone === 'warning'
                        ? 'bg-[#D97706] hover:bg-[#B45309]'
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
