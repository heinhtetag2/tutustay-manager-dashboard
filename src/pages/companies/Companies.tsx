import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { Portal } from '@/shared/ui/portal';
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  Building2,
  Wallet,
  UserCheck,
  X,
  XCircle,
  AlertCircle,
  CheckCircle,
  Tag,
  RotateCcw,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import type { Company, CompanyPlan, CompanyStatus } from './company-data';
import { DEMO_COMPANIES } from './company-data';

type StatusFilter = 'All' | CompanyStatus;
type PlanFilter = 'All' | CompanyPlan;

function formatMnt(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${Math.round(value / 1_000)}K`;
  return `₮${value}`;
}

function getStatusStyles(status: CompanyStatus) {
  switch (status) {
    case 'Pending':
      return {
        badge: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
        Icon: Clock,
      };
    case 'Approved':
      return {
        badge: 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]',
        Icon: CheckCircle2,
      };
    case 'Suspended':
      return {
        badge: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
        Icon: Ban,
      };
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

export default function Companies() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>(DEMO_COMPANIES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirming, setConfirming] = useState<
    | { company: Company; action: 'approve' | 'reject' | 'suspend' | 'reinstate' }
    | null
  >(null);

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'All' || planFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPlanFilter('All');
  };

  const counts = useMemo(
    () => ({
      All: companies.length,
      Pending: companies.filter((c) => c.status === 'Pending').length,
      Approved: companies.filter((c) => c.status === 'Approved').length,
      Suspended: companies.filter((c) => c.status === 'Suspended').length,
    }),
    [companies],
  );

  const visible = companies.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (planFilter !== 'All' && c.plan !== planFilter) return false;
    if (
      searchQuery &&
      !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const applyAction = () => {
    if (!confirming) return;
    const { company, action } = confirming;
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== company.id) return c;
        if (action === 'approve' || action === 'reinstate') return { ...c, status: 'Approved' };
        if (action === 'reject') return { ...c, status: 'Suspended' };
        if (action === 'suspend') return { ...c, status: 'Suspended' };
        return c;
      }),
    );
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
          <h1 className="text-3xl font-serif text-[#1A1A1A]">{t('Companies')}</h1>
          <p className="text-sm text-[#616161] mt-1">
            {counts.All} {t('total')} · {counts.Pending} {t('pending')} · {counts.Approved} {t('approved')}
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
            title: 'Total companies',
            Icon: Building2,
            value: String(counts.All),
            subtitle: `${counts.Approved} ${t('approved')} · ${counts.Suspended} ${t('suspended')}`,
          },
          {
            title: 'Awaiting review',
            Icon: Clock,
            value: String(counts.Pending),
            subtitle: t('Pending approval'),
          },
          {
            title: 'Active accounts',
            Icon: UserCheck,
            value: String(counts.Approved),
            subtitle: t('With platform access'),
          },
          {
            title: 'Total spent',
            Icon: Wallet,
            value: formatMnt(
              companies.reduce((acc, c) => acc + c.totalSpentMnt, 0),
            ),
            subtitle: t('Lifetime across all plans'),
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
            placeholder={t('Search companies...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={planFilter}
            onValueChange={(v) => setPlanFilter(v as PlanFilter)}
            leftIcon={<Tag />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Plans') },
              { value: 'Starter', label: t('Starter') },
              { value: 'Growth', label: t('Growth') },
              { value: 'Enterprise', label: t('Enterprise') },
            ]}
          />

          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<CheckCircle />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Statuses') },
              { value: 'Pending', label: t('Pending') },
              { value: 'Approved', label: t('Approved') },
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
                <th className="pl-6 pr-3 py-4 font-medium text-[11px] tracking-wider uppercase">
                  {t('Company')}
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">
                  {t('Status')}
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">
                  {t('Plan')}
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">
                  {t('Surveys')}
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">
                  {t('Total Spent')}
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase">
                  {t('Joined')}
                </th>
                <th className="px-6 py-4 font-medium text-[11px] tracking-wider uppercase text-right">
                  {t('Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F3]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#616161]">
                    {t('No companies match these filters.')}
                  </td>
                </tr>
              ) : (
                visible.map((company, index) => {
                  const statusStyle = getStatusStyles(company.status);
                  return (
                    <motion.tr
                      key={company.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => navigate(`/companies/${company.id.toLowerCase()}`)}
                      className="hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                    >
                      {/* Company */}
                      <td className="pl-6 pr-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-sm font-medium shrink-0">
                            {company.initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#1A1A1A] truncate">
                              {company.name}
                            </div>
                            <div className="text-xs text-[#616161] truncate mt-0.5">
                              {company.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle.badge}`}
                        >
                          <statusStyle.Icon className="w-3 h-3" />
                          {t(company.status)}
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getPlanStyles(
                            company.plan,
                          )}`}
                        >
                          {t(company.plan)}
                        </span>
                      </td>

                      {/* Surveys */}
                      <td className="px-6 py-4 text-[#1A1A1A] tabular-nums font-medium">
                        {company.surveys}
                      </td>

                      {/* Total spent */}
                      <td className="px-6 py-4 text-[#1A1A1A] tabular-nums font-medium">
                        {formatMnt(company.totalSpentMnt)}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-[#4A4A4A] tabular-nums">
                        <span title={format(new Date(company.joined), 'MMM d, yyyy')}>
                          {formatDistanceToNow(new Date(company.joined), { addSuffix: true })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {company.status === 'Pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ company, action: 'approve' }); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {t('Approve')}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirming({ company, action: 'reject' }); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-white text-[#4A4A4A] border border-[#EBEBEB] hover:bg-[#F3F3F3] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                {t('Reject')}
                              </button>
                            </>
                          )}
                          {company.status === 'Approved' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ company, action: 'suspend' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] hover:bg-[#FECACA] transition-colors cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                              {t('Suspend')}
                            </button>
                          )}
                          {company.status === 'Suspended' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirming({ company, action: 'reinstate' }); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
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
            {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.All} {t('companies')}
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F3F3] shrink-0">
                <h2 className="text-lg font-medium text-[#1A1A1A]">{actionMeta.title}</h2>
                <button
                  onClick={() => setConfirming(null)}
                  className="text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-white">
                <p className="text-[#4A4A4A] text-sm leading-relaxed">
                  {actionMeta.description}
                </p>
                <div className="mt-3 p-3 bg-white border border-[#EBEBEB] rounded-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-sm font-medium shrink-0">
                    {confirming.company.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[#1A1A1A] text-sm truncate">
                      {confirming.company.name}
                    </div>
                    <div className="text-[#616161] text-xs truncate">
                      {confirming.company.email}
                    </div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[#B91C1C] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This action can be reversed from the Suspended tab.')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F3F3F3] bg-white shrink-0">
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 text-sm font-medium text-[#4A4A4A] bg-white border border-[#EBEBEB] rounded-md hover:bg-[#F3F3F3] transition-colors shadow-none cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={applyAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-none cursor-pointer ${
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
