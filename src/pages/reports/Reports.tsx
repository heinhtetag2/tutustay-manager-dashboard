import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Portal } from '@/shared/ui/portal';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Search,
  Download,
  Flag,
  FileSearch,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Eye,
  XCircle,
  RotateCcw,
  X,
} from 'lucide-react';

import { Skeleton } from '@/shared/ui/skeleton';
import { BrandSelect } from '@/shared/ui/brand-select';
import { MobileFilterButton, MobileFilterSheet, FilterField } from '@/shared/ui/mobile-filter-sheet';
import { useResizableColumns, ColResizeHandle, ColLeftDivider, type ColumnDef } from '@/shared/ui/resizable-columns';
import type {
  Report,
  ReportReason,
  ReportSeverity,
  ReportStatus,
} from './reports-data';
import { DEMO_REPORTS } from './reports-data';

type StatusFilter = 'All' | ReportStatus;
type SeverityFilter = 'All' | ReportSeverity;
type ReasonFilter = 'All' | ReportReason;
type ActionType = 'review' | 'resolve' | 'dismiss' | 'reopen';

function getStatusStyles(status: ReportStatus) {
  switch (status) {
    case 'Open':
      return { badge: 'bg-[var(--warning-tint)] text-[var(--warning)]', Icon: AlertTriangle };
    case 'Reviewing':
      return { badge: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', Icon: Eye };
    case 'Resolved':
      return { badge: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle };
    case 'Dismissed':
      return { badge: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', Icon: XCircle };
  }
}

function severityToNumber(severity: ReportSeverity): number {
  switch (severity) {
    case 'Low': return 1;
    case 'Medium': return 2;
    case 'High': return 3;
    case 'Critical': return 4;
  }
}

function getSeverityColor(severity: ReportSeverity): string {
  switch (severity) {
    case 'Low': return 'bg-[var(--success-strong)]';
    case 'Medium': return 'bg-[var(--warning-strong)]';
    case 'High': return 'bg-[var(--danger-strong)]';
    case 'Critical': return 'bg-[var(--danger-deep)]';
  }
}

function getSeverityTextColor(severity: ReportSeverity): string {
  switch (severity) {
    case 'Low': return 'text-[var(--text-tertiary)]';
    case 'Medium': return 'text-[var(--warning)]';
    case 'High': return 'text-[var(--danger)]';
    case 'Critical': return 'text-[var(--danger-deep)]';
  }
}

function SeverityMeter({ severity }: { severity: ReportSeverity }) {
  const filled = severityToNumber(severity);
  const color = getSeverityColor(severity);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i <= filled ? color : 'bg-[var(--border-default)]'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium tabular-nums ${getSeverityTextColor(severity)}`}>{severity}</span>
    </div>
  );
}

const REPORT_COLS: ColumnDef[] = [
  { key: 'reportedUser', w: 280, min: 200 },
  { key: 'reason', w: 130, min: 100 },
  { key: 'survey', w: 220, min: 140 },
  { key: 'severity', w: 150, min: 120 },
  { key: 'reporter', w: 150, min: 110 },
  { key: 'reported', w: 140, min: 110 },
  { key: 'status', w: 140, min: 110 },
  { key: 'actions', w: 170, min: 140, resizable: false },
];

export default function Reports() {
  const { t } = useTranslation();
  const { widths: colWidths, onResizeStart } = useResizableColumns(REPORT_COLS);

  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [confirming, setConfirming] = useState<
    | { report: Report; action: ActionType }
    | null
  >(null);

  // Simulate fetching report data so the page shows its loading (skeleton) state on first load. Swap this for a real query later.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(id);
  }, []);

  const applyAction = () => {
    if (!confirming) return;
    const { report, action } = confirming;
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== report.id) return r;
        if (action === 'review') return { ...r, status: 'Reviewing' };
        if (action === 'resolve') return { ...r, status: 'Resolved' };
        if (action === 'dismiss') return { ...r, status: 'Dismissed' };
        if (action === 'reopen') return { ...r, status: 'Open' };
        return r;
      }),
    );
    setConfirming(null);
  };

  const actionMeta = confirming
    ? {
        review: {
          title: t('Start review?'),
          description: t('The report will be moved into review. The reported respondent stays active until you resolve or dismiss it.'),
          cta: t('Start review'),
          tone: 'brand' as const,
        },
        resolve: {
          title: t('Resolve report?'),
          description: t('Mark this report as actioned. Use this once moderation has handled the reported behavior.'),
          cta: t('Resolve'),
          tone: 'success' as const,
        },
        dismiss: {
          title: t('Dismiss report?'),
          description: t('The report will be closed with no action taken against the respondent. You can reopen it later.'),
          cta: t('Dismiss'),
          tone: 'danger' as const,
        },
        reopen: {
          title: t('Reopen report?'),
          description: t('The report will return to the open queue for moderation.'),
          cta: t('Reopen'),
          tone: 'brand' as const,
        },
      }[confirming.action]
    : null;

  const counts = useMemo(
    () => ({
      total: reports.length,
      open: reports.filter((r) => r.status === 'Open').length,
      reviewing: reports.filter((r) => r.status === 'Reviewing').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
      highSeverity: reports.filter((r) => r.severity === 'High' || r.severity === 'Critical').length,
    }),
    [reports],
  );

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'All' ||
    severityFilter !== 'All' ||
    reasonFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSeverityFilter('All');
    setReasonFilter('All');
  };

  // Count of active secondary filters (search + status live on the bar, excluded).
  const activeFilterCount =
    (severityFilter !== 'All' ? 1 : 0) +
    (reasonFilter !== 'All' ? 1 : 0);

  const severityOptions = [
    { value: 'All', label: t('All Severities') },
    { value: 'Low', label: t('Low') },
    { value: 'Medium', label: t('Medium') },
    { value: 'High', label: t('High') },
    { value: 'Critical', label: t('Critical') },
  ];
  const reasonOptions = [
    { value: 'All', label: t('Any reason') },
    { value: 'Spam', label: t('Spam') },
    { value: 'Fraud', label: t('Fraud') },
    { value: 'Low quality', label: t('Low quality') },
    { value: 'Abuse', label: t('Abuse') },
    { value: 'Off-topic', label: t('Off-topic') },
  ];
  const statusOptions = [
    { value: 'All', label: t('All Statuses') },
    { value: 'Open', label: t('Open') },
    { value: 'Reviewing', label: t('Reviewing') },
    { value: 'Resolved', label: t('Resolved') },
    { value: 'Dismissed', label: t('Dismissed') },
  ];

  const visible = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    if (reasonFilter !== 'All' && r.reason !== reasonFilter) return false;
    if (
      searchQuery &&
      !r.reportedName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.reportedEmail.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.surveyTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const stats = [
    {
      title: 'Total reports',
      Icon: Flag,
      value: String(counts.total),
      subtitle: `${counts.open} ${t('open')} · ${counts.reviewing} ${t('reviewing')}`,
    },
    {
      title: 'Open reports',
      Icon: AlertTriangle,
      value: String(counts.open),
      subtitle: t('Awaiting moderation'),
    },
    {
      title: 'High severity',
      Icon: ShieldAlert,
      value: String(counts.highSeverity),
      subtitle: t('High or critical'),
    },
    {
      title: 'Resolved',
      Icon: CheckCircle,
      value: String(counts.resolved),
      subtitle: t('Closed this period'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Reports')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {counts.total} {t('reports')} · {counts.open} {t('open')} · {counts.highSeverity} {t('high severity')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors bg-white shadow-none cursor-pointer">
            <Download className="w-4 h-4" />
            {t('Export CSV')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
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
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            {loading ? (
              <>
                <Skeleton className="h-7 sm:h-8 w-16 mt-0.5" />
                <Skeleton className="h-3 w-24 mt-2 sm:mt-3" />
              </>
            ) : (
              <>
                <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
                <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Filters — desktop (sm+) */}
      <div className="hidden sm:flex flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search reports...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={severityFilter}
            onValueChange={(v) => setSeverityFilter(v as SeverityFilter)}
            leftIcon={<ShieldAlert />}
            className="sm:w-auto"
            options={severityOptions}
          />

          <BrandSelect
            value={reasonFilter}
            onValueChange={(v) => setReasonFilter(v as ReasonFilter)}
            leftIcon={<Flag />}
            className="sm:w-auto"
            options={reasonOptions}
          />

          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<CheckCircle />}
            className="sm:w-auto"
            options={statusOptions}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0"
              title={t('Clear filters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters — mobile (search + Filters sheet trigger) */}
      <div className="sm:hidden flex flex-col gap-3 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search reports...')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <div className="flex gap-2">
          <MobileFilterButton count={activeFilterCount} onClick={() => setIsFilterOpen(true)} label={t('Filters')} className="flex-1" />
          <BrandSelect value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} leftIcon={<CheckCircle />} className="flex-1" options={statusOptions} />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <MobileFilterSheet
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onClear={clearFilters}
        onApply={() => setIsFilterOpen(false)}
        title={t('Filters')}
        clearLabel={t('Clear all')}
        applyLabel={t('Show results')}
      >
        <FilterField label={t('Severity')}>
          <BrandSelect value={severityFilter} onValueChange={(v) => setSeverityFilter(v as SeverityFilter)} leftIcon={<ShieldAlert />} className="w-full" options={severityOptions} />
        </FilterField>
        <FilterField label={t('Reason')}>
          <BrandSelect value={reasonFilter} onValueChange={(v) => setReasonFilter(v as ReasonFilter)} leftIcon={<Flag />} className="w-full" options={reasonOptions} />
        </FilterField>
      </MobileFilterSheet>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        {/* Desktop: full data table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: '100%' }}>
            <colgroup>
              {REPORT_COLS.map((c) => (
                <col key={c.key} style={{ width: colWidths[c.key] }} />
              ))}
            </colgroup>
            <thead>
              <tr className="group/head border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium select-none">
                {([
                  { key: 'reportedUser', label: t('Reported user'), pad: 'pl-6 pr-3' },
                  { key: 'reason', label: t('Reason'), pad: 'px-6' },
                  { key: 'survey', label: t('Survey'), pad: 'px-6' },
                  { key: 'severity', label: t('Severity'), pad: 'px-6' },
                  { key: 'reporter', label: t('Reporter'), pad: 'px-6' },
                  { key: 'reported', label: t('Reported'), pad: 'px-6' },
                  { key: 'status', label: t('Status'), pad: 'px-6' },
                  { key: 'actions', label: t('Actions'), pad: 'px-6', align: 'text-right', resizable: false },
                ] as const).map((c, i) => (
                  <th key={c.key} className={`group/col relative py-4 font-medium text-[11px] tracking-wider uppercase transition-colors hover:bg-[var(--surface-subtle)] ${c.pad}`}>
                    {i > 0 && <ColLeftDivider />}
                    <span className={`block truncate ${'align' in c && c.align ? c.align : ''}`}>{c.label}</span>
                    {!('resizable' in c && c.resizable === false) && (
                      <ColResizeHandle onPointerDown={(e) => onResizeStart(c.key, e)} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <ReportRowSkeleton key={i} />)
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileSearch className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t('No reports found')}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{hasActiveFilters ? t('No reports match these filters.') : t('Reports will appear here.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((r, index) => {
                  const statusStyle = getStatusStyles(r.status);
                  const isClosed = r.status === 'Resolved' || r.status === 'Dismissed';
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      {/* Reported user */}
                      <td className="pl-6 pr-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                            {r.initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">{r.reportedName}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{r.id} · {r.reportedEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)]">
                          {t(r.reason)}
                        </span>
                      </td>

                      {/* Survey */}
                      <td className="px-6 py-4">
                        <div className="min-w-0 max-w-[200px]">
                          <div className="text-[var(--text-primary)] truncate">{r.surveyTitle}</div>
                          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{t(r.surveyCategory)}</div>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="px-6 py-4">
                        <SeverityMeter severity={r.severity} />
                      </td>

                      {/* Reporter */}
                      <td className="px-6 py-4 text-[var(--text-tertiary)]">
                        {r.reporter === 'System' ? t('System') : r.reporter}
                      </td>

                      {/* Reported */}
                      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">
                        <span title={format(new Date(r.reportedAt), 'MMM d, yyyy')}>
                          {formatDistanceToNow(new Date(r.reportedAt), { addSuffix: true })}
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
                          {isClosed ? (
                            <button
                              onClick={() => setConfirming({ report: r, action: 'reopen' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-border)] transition-colors cursor-pointer"
                              title={t('Reopen report')}
                            >
                              <RotateCcw className="w-3 h-3" />
                              {t('Reopen')}
                            </button>
                          ) : (
                            <>
                              {r.status === 'Open' ? (
                                <button
                                  onClick={() => setConfirming({ report: r, action: 'review' })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-border)] transition-colors cursor-pointer"
                                  title={t('Start review')}
                                >
                                  <Eye className="w-3 h-3" />
                                  {t('Review')}
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirming({ report: r, action: 'resolve' })}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)] hover:bg-[var(--success-tint-2)] transition-colors cursor-pointer"
                                  title={t('Resolve report')}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  {t('Resolve')}
                                </button>
                              )}
                              <button
                                onClick={() => setConfirming({ report: r, action: 'dismiss' })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--danger-tint)] text-[var(--danger)] hover:bg-[var(--danger-border)] transition-colors cursor-pointer"
                                title={t('Dismiss report')}
                              >
                                <XCircle className="w-3 h-3" />
                                {t('Dismiss')}
                              </button>
                            </>
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

        {/* Mobile: stacked cards (hidden on desktop) */}
        <div className="md:hidden divide-y divide-[var(--surface-subtle)]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <ReportCardSkeleton key={i} />)
          ) : visible.length === 0 ? (
            <div className="px-6 py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <FileSearch className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('No reports found')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{hasActiveFilters ? t('No reports match these filters.') : t('Reports will appear here.')}</p>
              </div>
            </div>
          ) : (
            visible.map((r, index) => (
              <ReportRowCard
                key={r.id}
                report={r}
                index={index}
                onAction={(action) => setConfirming({ report: r, action })}
                t={t}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          {loading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">
              {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.total} {t('reports')}
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              disabled
              className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('Previous')}
            </button>
            <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[var(--brand-primary)] rounded-md bg-[var(--brand-primary)] text-white tabular-nums cursor-default">
              1
            </button>
            <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
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
                    {confirming.report.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--text-primary)] text-sm truncate">{confirming.report.reportedName}</div>
                    <div className="text-[var(--text-secondary)] text-xs truncate">{confirming.report.id} · {t(confirming.report.reason)}</div>
                  </div>
                </div>
                {actionMeta.tone === 'danger' && (
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('You can reopen this report later.')}
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
                      : actionMeta.tone === 'success'
                        ? 'bg-[var(--success-strong)] hover:bg-[var(--success)]'
                        : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]'
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

/** Placeholder row shown in the desktop table while reports load. */
function ReportRowSkeleton() {
  return (
    <tr>
      <td className="pl-6 pr-3 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20 mt-2" />
      </td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

/** Placeholder card shown in the mobile list while reports load. */
function ReportCardSkeleton() {
  return (
    <div className="px-4 py-4">
      {/* Identity row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>
      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="col-span-2 space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-4">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

function ReportRowCard({ report: r, index, onAction, t }: { report: Report; index: number; onAction: (action: ActionType) => void; t: (k: string) => string }) {
  const statusStyle = getStatusStyles(r.status);
  const isClosed = r.status === 'Resolved' || r.status === 'Dismissed';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="px-4 py-4 hover:bg-[var(--surface-muted)] transition-colors"
    >
      {/* Identity row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
          {r.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[var(--text-primary)] truncate">{r.reportedName}</div>
          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{r.id} · {r.reportedEmail}</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full shrink-0 ${statusStyle.badge}`}>
          <statusStyle.Icon className="w-3 h-3" />
          {t(r.status)}
        </span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Reason')}</div>
          <div className="mt-0.5">
            <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)]">
              {t(r.reason)}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Severity')}</div>
          <div className="mt-1"><SeverityMeter severity={r.severity} /></div>
        </div>
        <div className="min-w-0 col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Survey')}</div>
          <div className="text-sm text-[var(--text-primary)] truncate mt-0.5">{r.surveyTitle}</div>
          <div className="text-xs text-[var(--text-secondary)] truncate">{t(r.surveyCategory)}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Reporter')}</div>
          <div className="text-sm text-[var(--text-primary)] truncate mt-0.5">{r.reporter === 'System' ? t('System') : r.reporter}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">{t('Reported')}</div>
          <div className="text-sm text-[var(--text-tertiary)] tabular-nums mt-0.5" title={format(new Date(r.reportedAt), 'MMM d, yyyy')}>
            {formatDistanceToNow(new Date(r.reportedAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-4 flex-wrap">
        {isClosed ? (
          <button
            onClick={() => onAction('reopen')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-border)] transition-colors cursor-pointer"
            title={t('Reopen report')}
          >
            <RotateCcw className="w-3 h-3" />
            {t('Reopen')}
          </button>
        ) : (
          <>
            {r.status === 'Open' ? (
              <button
                onClick={() => onAction('review')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-border)] transition-colors cursor-pointer"
                title={t('Start review')}
              >
                <Eye className="w-3 h-3" />
                {t('Review')}
              </button>
            ) : (
              <button
                onClick={() => onAction('resolve')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)] hover:bg-[var(--success-tint-2)] transition-colors cursor-pointer"
                title={t('Resolve report')}
              >
                <CheckCircle className="w-3 h-3" />
                {t('Resolve')}
              </button>
            )}
            <button
              onClick={() => onAction('dismiss')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--danger-tint)] text-[var(--danger)] hover:bg-[var(--danger-border)] transition-colors cursor-pointer"
              title={t('Dismiss report')}
            >
              <XCircle className="w-3 h-3" />
              {t('Dismiss')}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
