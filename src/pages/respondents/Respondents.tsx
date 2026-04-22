import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Portal } from '@/shared/ui/portal';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Search,
  Download,
  CheckCircle,
  Users,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Ban,
  ShieldCheck,
  Wallet,
  Coins,
  X,
  TrendingUp,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import type { Respondent, RespondentStatus, TrustLevel } from './respondent-data';
import { DEMO_RESPONDENTS } from './respondent-data';

type StatusFilter = 'All' | RespondentStatus;
type LevelFilter = 'All' | TrustLevel;
type EarnFilter = 'All' | 'under-100k' | '100k-300k' | '300k-500k' | 'over-500k';

const EARN_RANGES: Record<Exclude<EarnFilter, 'All'>, [number, number]> = {
  'under-100k': [0, 100_000],
  '100k-300k': [100_000, 300_000],
  '300k-500k': [300_000, 500_000],
  'over-500k': [500_000, Number.POSITIVE_INFINITY],
};

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${Math.round(value / 1_000)}K`;
  return `₮${value}`;
}

function getStatusStyles(status: RespondentStatus) {
  switch (status) {
    case 'Active':
      return { badge: 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]', Icon: CheckCircle };
    case 'Warned':
      return { badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]', Icon: AlertTriangle };
    case 'Suspended':
      return { badge: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]', Icon: Ban };
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

function levelToNumber(level: TrustLevel): number {
  return Number(level.substring(1));
}

function TrustMeter({ level }: { level: TrustLevel }) {
  const filled = levelToNumber(level);
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

export default function Respondents() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [respondents, setRespondents] = useState<Respondent[]>(DEMO_RESPONDENTS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All');
  const [earnFilter, setEarnFilter] = useState<EarnFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirming, setConfirming] = useState<
    | { respondent: Respondent; action: 'warn' | 'suspend' | 'reinstate' }
    | null
  >(null);

  const applyAction = () => {
    if (!confirming) return;
    const { respondent, action } = confirming;
    setRespondents((prev) =>
      prev.map((r) => {
        if (r.id !== respondent.id) return r;
        if (action === 'warn') return { ...r, status: 'Warned', warnings: r.warnings + 1 };
        if (action === 'suspend') return { ...r, status: 'Suspended' };
        if (action === 'reinstate') return { ...r, status: 'Active' };
        return r;
      }),
    );
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
          description: t("The respondent will lose access to take surveys. You can reinstate them later from the Suspended tab."),
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

  const counts = useMemo(
    () => ({
      total: respondents.length,
      active: respondents.filter((r) => r.status === 'Active').length,
      warned: respondents.filter((r) => r.status === 'Warned').length,
      suspended: respondents.filter((r) => r.status === 'Suspended').length,
      totalEarned: respondents.reduce((acc, r) => acc + r.earnedMnt, 0),
      avgQuality: Math.round(
        respondents.reduce((acc, r) => acc + r.qualityScore, 0) / Math.max(1, respondents.length),
      ),
    }),
    [respondents],
  );

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'All' ||
    levelFilter !== 'All' ||
    earnFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setLevelFilter('All');
    setEarnFilter('All');
  };

  const visible = respondents.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (levelFilter !== 'All' && r.trustLevel !== levelFilter) return false;
    if (earnFilter !== 'All') {
      const [min, max] = EARN_RANGES[earnFilter];
      if (r.earnedMnt < min || r.earnedMnt >= max) return false;
    }
    if (
      searchQuery &&
      !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = [
    {
      title: 'Total respondents',
      Icon: Users,
      value: String(counts.total),
      subtitle: `${counts.active} ${t('active')} · ${counts.warned} ${t('warned')}`,
    },
    {
      title: 'Active accounts',
      Icon: UserCheck,
      value: String(counts.active),
      subtitle: t('Eligible for surveys'),
    },
    {
      title: 'Avg. quality score',
      Icon: TrendingUp,
      value: `${counts.avgQuality}%`,
      subtitle: t('Across all respondents'),
    },
    {
      title: 'Total earnings',
      Icon: Wallet,
      value: formatMnt(counts.totalEarned),
      subtitle: t('Lifetime payout volume'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A]">{t('Respondents')}</h1>
          <p className="text-sm text-[#616161] mt-1">
            {counts.total} {t('registered respondents')} · {counts.warned} {t('warned')} · {counts.suspended} {t('suspended')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#EBEBEB] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer">
            <Download className="w-4 h-4" />
            {t('Export CSV')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616161]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search respondents...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={levelFilter}
            onValueChange={(v) => setLevelFilter(v as LevelFilter)}
            leftIcon={<ShieldCheck />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Levels') },
              { value: 'L1', label: t('L1') },
              { value: 'L2', label: t('L2') },
              { value: 'L3', label: t('L3') },
              { value: 'L4', label: t('L4') },
              { value: 'L5', label: t('L5') },
            ]}
          />

          <BrandSelect
            value={earnFilter}
            onValueChange={(v) => setEarnFilter(v as EarnFilter)}
            leftIcon={<Coins />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('Any earnings') },
              { value: 'under-100k', label: t('Under ₮100K') },
              { value: '100k-300k', label: t('₮100K – ₮300K') },
              { value: '300k-500k', label: t('₮300K – ₮500K') },
              { value: 'over-500k', label: t('Over ₮500K') },
            ]}
          />

          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<CheckCircle />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Statuses') },
              { value: 'Active', label: t('Active') },
              { value: 'Warned', label: t('Warned') },
              { value: 'Suspended', label: t('Suspended') },
            ]}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center w-9 h-9 text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-full transition-colors border border-transparent hover:border-[#EBEBEB] shadow-none cursor-pointer flex-shrink-0"
              title={t('Clear filters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-[#F3F3F3] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#EBEBEB] text-[#4A4A4A] font-medium bg-[#F3F3F3]">
                <th className="pl-6 pr-3 py-4 font-medium text-[11px] tracking-wider uppercase">{t('User')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Trust')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Surveys')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Quality score')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Earned')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Last active')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Warnings')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F3]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#616161]">
                    {t('No respondents match these filters.')}
                  </td>
                </tr>
              ) : (
                visible.map((r, index) => {
                  const statusStyle = getStatusStyles(r.status);
                  const quality = getQualityStyles(r.qualityScore);
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      onClick={() => navigate(`/respondents/${r.id.toLowerCase()}`)}
                      className="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                    >
                      {/* User */}
                      <td className="pl-6 pr-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-sm font-medium shrink-0">
                            {r.initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#1A1A1A] truncate">{r.name}</div>
                            <div className="text-xs text-[#616161] truncate mt-0.5">{r.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Trust */}
                      <td className="px-6 py-4">
                        <TrustMeter level={r.trustLevel} />
                      </td>

                      {/* Surveys */}
                      <td className="px-6 py-4 text-[#1A1A1A] tabular-nums font-medium">
                        {r.surveys}
                      </td>

                      {/* Quality score */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-24 h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 ${quality.bar} rounded-full`}
                              style={{ width: `${r.qualityScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium tabular-nums ${quality.text}`}>
                            {r.qualityScore}%
                          </span>
                        </div>
                      </td>

                      {/* Earned */}
                      <td className="px-6 py-4 text-[#1A1A1A] tabular-nums font-medium">
                        {formatMnt(r.earnedMnt)}
                      </td>

                      {/* Last active */}
                      <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">
                        <span title={format(new Date(r.lastActive), 'MMM d, yyyy')}>
                          {formatDistanceToNow(new Date(r.lastActive), { addSuffix: true })}
                        </span>
                      </td>

                      {/* Warnings */}
                      <td className="px-6 py-4 tabular-nums">
                        <span className={r.warnings === 0 ? 'text-[#616161]' : 'text-[#B91C1C] font-medium'}>
                          {r.warnings}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}
                        >
                          <statusStyle.Icon className="w-3 h-3" />
                          {t(r.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== 'Suspended' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ respondent: r, action: 'warn' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] hover:bg-[#FDE68A] transition-colors cursor-pointer"
                              title={t('Warn respondent')}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {t('Warn')}
                            </button>
                          )}
                          {r.status !== 'Suspended' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ respondent: r, action: 'suspend' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] hover:bg-[#FECACA] transition-colors cursor-pointer"
                              title={t('Suspend respondent')}
                            >
                              <Ban className="w-3 h-3" />
                              {t('Suspend')}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ respondent: r, action: 'reinstate' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                              title={t('Reinstate respondent')}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {t('Reinstate')}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F3F3] bg-white">
          <span className="text-sm text-[#616161]">
            {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.total} {t('respondents')}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#EBEBEB] rounded-md bg-white text-[#616161] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('Previous')}
            </button>
            <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[#FF3C21] rounded-md bg-[#FF3C21] text-white tabular-nums cursor-default">
              1
            </button>
            <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#EBEBEB] rounded-md bg-white text-[#4A4A4A] hover:bg-[#F3F3F3] transition-colors cursor-pointer">
              {t('Next')}
            </button>
          </div>
        </div>
      </div>

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
                    {confirming.respondent.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#1A1A1A] text-sm truncate">{confirming.respondent.name}</div>
                    <div className="text-[#616161] text-xs truncate">{confirming.respondent.email}</div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[#B91C1C] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This can be reversed from the Suspended tab.')}
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
