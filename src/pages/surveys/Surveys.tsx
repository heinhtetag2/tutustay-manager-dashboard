import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  Search,
  Download,
  X,
  Calendar,
  Check,
  Pause,
  Play,
  XCircle,
  RotateCcw,
  AlertCircle,
  ClipboardList,
  Users,
  Wallet,
  ShieldCheck,
  List,
  CheckCircle,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react';

import type { Survey, SurveyCategory, SurveyStatus } from './survey-data';
import { DEMO_SURVEYS } from './survey-data';
import { Portal } from '@/shared/ui/portal';

function formatMnt(value: number): string {
  return `₮${value.toLocaleString('en-US')}`;
}

function getStatusStyles(status: SurveyStatus) {
  switch (status) {
    case 'Active':    return { badge: 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]', Icon: CheckCircle2 };
    case 'Draft':     return { badge: 'bg-[#F3F3F3] text-[#616161] border border-[#EBEBEB]', Icon: Clock };
    case 'Paused':    return { badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]', Icon: Pause };
    case 'Completed': return { badge: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]', Icon: CheckCircle };
    case 'Rejected':  return { badge: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]', Icon: Ban };
  }
}

export default function Surveys() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<SurveyCategory | 'All'>('All');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [surveys, setSurveys] = useState<Survey[]>(DEMO_SURVEYS);
  const [confirming, setConfirming] = useState<
    | { survey: Survey; action: 'pause' | 'resume' | 'reject' | 'reinstate' }
    | null
  >(null);

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'All' ||
    categoryFilter !== 'All' ||
    dateRange !== undefined;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setDateRange(undefined);
    setSelectedPreset(null);
  };

  const visibleSurveys = surveys.filter((s) => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !s.title.toLowerCase().includes(q) &&
        !s.companyName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (dateRange?.from) {
      const created = new Date(s.createdAt);
      if (created < dateRange.from) return false;
      if (dateRange.to && created > dateRange.to) return false;
    }
    return true;
  });

  const totalActive = surveys.filter((s) => s.status === 'Active').length;
  const totalPaused = surveys.filter((s) => s.status === 'Paused').length;
  const totalRejected = surveys.filter((s) => s.status === 'Rejected').length;
  const totalResponses = surveys.reduce((acc, s) => acc + s.responsesCurrent, 0);
  const totalSpent = surveys.reduce((acc, s) => acc + s.rewardMnt * s.responsesCurrent, 0);

  const applyAction = () => {
    if (!confirming) return;
    const { survey, action } = confirming;
    setSurveys((prev) =>
      prev.map((s) => {
        if (s.id !== survey.id) return s;
        if (action === 'pause')     return { ...s, status: 'Paused' };
        if (action === 'resume')    return { ...s, status: 'Active' };
        if (action === 'reject')    return { ...s, status: 'Rejected' };
        if (action === 'reinstate') return { ...s, status: 'Active' };
        return s;
      }),
    );
    setConfirming(null);
  };

  const actionMeta = confirming
    ? {
        pause: {
          title: t('Pause survey?'),
          description: t('The survey will stop accepting new responses. The company can resume it, or you can reinstate it later.'),
          cta: t('Pause'),
          tone: 'warning' as const,
        },
        resume: {
          title: t('Resume survey?'),
          description: t('The survey will start accepting responses again.'),
          cta: t('Resume'),
          tone: 'success' as const,
        },
        reject: {
          title: t('Reject survey?'),
          description: t('The survey will be marked as rejected and removed from respondent feeds. The company will be notified.'),
          cta: t('Reject'),
          tone: 'danger' as const,
        },
        reinstate: {
          title: t('Reinstate survey?'),
          description: t('The survey will be restored to active and appear in respondent feeds again.'),
          cta: t('Reinstate'),
          tone: 'success' as const,
        },
      }[confirming.action]
    : null;

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
          <h1 className="text-3xl font-serif text-[#1A1A1A]">{t('Survey Moderation')}</h1>
          <p className="text-sm text-[#616161] mt-1">
            {surveys.length} {t('total surveys across all companies')} · {totalActive} {t('active')} · {totalPaused} {t('paused')} · {totalRejected} {t('rejected')}
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
        {[
          {
            title: 'Active surveys',
            Icon: ClipboardList,
            value: String(totalActive),
            subtitle: `${surveys.length} ${t('total across platform')}`,
          },
          {
            title: 'Total responses',
            Icon: Users,
            value: totalResponses.toLocaleString(),
            subtitle: t('Collected to date'),
          },
          {
            title: 'Reward paid',
            Icon: Wallet,
            value: formatMnt(totalSpent),
            subtitle: t('Across active campaigns'),
          },
          {
            title: 'Awaiting review',
            Icon: Clock,
            value: String(surveys.filter((s) => s.status === 'Draft').length),
            subtitle: t('Drafts from companies'),
          },
        ].map((card, i) => (
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
            placeholder={t('Search surveys or companies...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-[#EBEBEB] bg-white rounded-md text-sm font-medium text-[#4A4A4A] hover:bg-[#F3F3F3] focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] transition-colors shadow-none cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#616161]" />
              {dateRange?.from
                ? (dateRange.to ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : format(dateRange.from, 'MMM d, yyyy'))
                : t('Created Date')}
            </button>

            {isDateRangeOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#EBEBEB] rounded-md z-10 flex shadow-none">
                <div className="w-48 border-r border-[#EBEBEB] p-2 flex flex-col gap-1">
                  {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 12 months', 'Custom date range'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setSelectedPreset(preset);
                        if (preset === 'Last 7 days') setDateRange({ from: subDays(new Date(), 7), to: new Date() });
                        else if (preset === 'Last 30 days') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                        else if (preset === 'Last 90 days') setDateRange({ from: subDays(new Date(), 90), to: new Date() });
                        else if (preset === 'Last 12 months') setDateRange({ from: subMonths(new Date(), 12), to: new Date() });
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors shadow-none cursor-pointer ${
                        selectedPreset === preset
                          ? 'bg-[#F3F3F3] text-[#1A1A1A] font-medium'
                          : 'text-[#4A4A4A] hover:bg-white'
                      }`}
                    >
                      {t(preset)}
                      {selectedPreset === preset && <Check className="w-4 h-4 text-[#1A1A1A]" />}
                    </button>
                  ))}
                </div>
                <div className="p-4" style={{ '--primary': '#FF3C21', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}>
                  <CalendarUI
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setSelectedPreset('Custom date range');
                    }}
                    numberOfMonths={2}
                    className="border-0 shadow-none p-0"
                  />
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#F3F3F3]">
                    <button
                      onClick={() => {
                        setDateRange(undefined);
                        setSelectedPreset('Custom date range');
                        setIsDateRangeOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors shadow-none cursor-pointer"
                    >
                      {t('Clear')}
                    </button>
                    <button
                      onClick={() => setIsDateRangeOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#FF3C21] rounded-md hover:bg-[#E63419] transition-colors shadow-none cursor-pointer"
                    >
                      {t('Apply')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <BrandSelect
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as SurveyCategory | 'All')}
            leftIcon={<List />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Categories') },
              { value: 'Social', label: t('Social') },
              { value: 'Product', label: t('Product') },
              { value: 'Brand', label: t('Brand') },
              { value: 'Other', label: t('Other') },
            ]}
          />

          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as SurveyStatus | 'All')}
            leftIcon={<CheckCircle />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Statuses') },
              { value: 'Active', label: t('Active') },
              { value: 'Draft', label: t('Draft') },
              { value: 'Paused', label: t('Paused') },
              { value: 'Completed', label: t('Completed') },
              { value: 'Rejected', label: t('Rejected') },
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
                <th className="pl-6 pr-3 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Survey')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Company')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Status')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Responses')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Reward')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Trust req.')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">{t('Created')}</th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F3]">
              {visibleSurveys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#616161]">
                    {t('No surveys match these filters.')}
                  </td>
                </tr>
              ) : visibleSurveys.map((survey, index) => {
                const pct = Math.min(100, Math.round((survey.responsesCurrent / Math.max(1, survey.responsesTarget)) * 100));
                const statusStyle = getStatusStyles(survey.status);
                const canPause = survey.status === 'Active';
                const canResume = survey.status === 'Paused';
                const canReject = survey.status !== 'Rejected' && survey.status !== 'Completed';
                const isRejected = survey.status === 'Rejected';
                return (
                  <motion.tr
                    key={survey.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/surveys/${survey.id.toLowerCase()}`)}
                  >
                    {/* Survey */}
                    <td className="pl-6 pr-3 py-4">
                      <div className="font-medium text-[#1A1A1A]">{survey.title}</div>
                      <div className="text-xs text-[#616161] mt-0.5">{t(survey.category)}</div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/companies/${survey.companyId.toLowerCase()}`); }}
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF3C21] transition-colors cursor-pointer"
                      >
                        {survey.companyName}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}>
                        <statusStyle.Icon className="w-3 h-3" />
                        {t(survey.status)}
                      </span>
                    </td>

                    {/* Responses */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-24 h-1.5 bg-[#F3F3F3] rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-[#FF3C21] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#4A4A4A] tabular-nums">
                          {survey.responsesCurrent}/{survey.responsesTarget}
                        </span>
                      </div>
                    </td>

                    {/* Reward */}
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] tabular-nums">
                      {formatMnt(survey.rewardMnt)}
                    </td>

                    {/* Trust req. */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#F3F3F3] text-[#4A4A4A] border border-[#EBEBEB]">
                        <ShieldCheck className="w-3 h-3" />
                        {t('Level')} {survey.trustLevel}+
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">
                      <span title={format(new Date(survey.createdAt), 'MMM d, yyyy')}>
                        {formatDistanceToNow(new Date(survey.createdAt), { addSuffix: true })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {isRejected ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirming({ survey, action: 'reinstate' }); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {t('Reinstate')}
                          </button>
                        ) : (
                          <>
                            {canPause && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ survey, action: 'pause' }); }}
                                className="p-1.5 text-[#616161] hover:text-[#B45309] hover:bg-[#FFFBEB] rounded-md transition-colors cursor-pointer"
                                title={t('Pause survey')}
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            {canResume && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ survey, action: 'resume' }); }}
                                className="p-1.5 text-[#616161] hover:text-[#047857] hover:bg-[#ECFDF5] rounded-md transition-colors cursor-pointer"
                                title={t('Resume survey')}
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {canReject && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ survey, action: 'reject' }); }}
                                className="p-1.5 text-[#616161] hover:text-[#B91C1C] hover:bg-[#FEF2F2] rounded-md transition-colors cursor-pointer"
                                title={t('Reject survey')}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F3F3F3] bg-white">
          <span className="text-sm text-[#616161]">
            {t('Showing')} 1 {t('to')} {visibleSurveys.length} {t('of')} {surveys.length} {t('surveys')}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[#EBEBEB] rounded-md bg-white text-[#616161] hover:bg-[#F3F3F3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div className="mt-3 p-3 bg-white border border-[#EBEBEB] rounded-md">
                  <div className="font-medium text-[#1A1A1A] text-sm">{confirming.survey.title}</div>
                  <div className="text-[#616161] text-xs mt-1">
                    {confirming.survey.companyName} · {t(confirming.survey.category)} · <span className="font-medium text-[#1A1A1A]">{formatMnt(confirming.survey.rewardMnt)}</span>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[#B91C1C] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('The company will be notified of this action.')}
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
