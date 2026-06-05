import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, ExternalLink, ShieldCheck, Briefcase, MapPin, Users, CheckCircle2,
  ArrowRight, ArrowLeft, Flag, Slash, RotateCcw,
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';
import { getCompanyByName } from '@/shared/data/companies';

type View = 'main' | 'report';

const REPORT_REASONS = [
  'Suspicious or misleading survey content',
  'Privacy concerns with how they use responses',
  'Surveys are too long for the reward offered',
  'Repeated low-quality or broken questions',
  'Something else',
];

export function CompanyInfoDrawer({
  open,
  onOpenChange,
  companyName,
  onViewMoreSurveys,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onViewMoreSurveys?: () => void;
}) {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('main');
  const [blocked, setBlocked] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState('');

  const company = getCompanyByName(companyName);

  const resetAndClose = () => {
    setView('main');
    setReason('');
    setNote('');
    onOpenChange(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) resetAndClose();
    else onOpenChange(o);
  };

  if (!company) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[var(--border-default)]">
        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[var(--border-default)] shrink-0">
          {view === 'report' && (
            <button
              onClick={() => {
                setView('main');
                setReason('');
                setNote('');
              }}
              className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
              aria-label={t('Back')}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)] flex-1">
            {view === 'report' ? t('Report this company') : t('About this company')}
          </DrawerTitle>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DrawerDescription className="sr-only">
            {t('Information about the company running this survey.')}
          </DrawerDescription>

          {view === 'main' ? (
            <MainView
              company={company}
              blocked={blocked}
              reportSent={reportSent}
              onOpenReport={() => setView('report')}
              onToggleBlock={() => setBlocked((b) => !b)}
              onViewMoreSurveys={onViewMoreSurveys}
            />
          ) : (
            <ReportView
              companyName={company.name}
              reason={reason}
              setReason={setReason}
              note={note}
              setNote={setNote}
              onCancel={() => {
                setView('main');
                setReason('');
                setNote('');
              }}
              onSubmit={() => {
                setReportSent(true);
                setView('main');
                setReason('');
                setNote('');
              }}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MainView({
  company,
  blocked,
  reportSent,
  onOpenReport,
  onToggleBlock,
  onViewMoreSurveys,
}: {
  company: ReturnType<typeof getCompanyByName> & {};
  blocked: boolean;
  reportSent: boolean;
  onOpenReport: () => void;
  onToggleBlock: () => void;
  onViewMoreSurveys?: () => void;
}) {
  const { t } = useTranslation();
  if (!company) return null;

  return (
    <>
      {/* Identity */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] text-base font-medium shrink-0">
            {company.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">{company.name}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)] bg-[var(--success-tint)] px-1.5 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" strokeWidth={2} />
                {t('Verified')}
              </span>
              {blocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--danger)] bg-[var(--danger-tint)] px-1.5 py-0.5 rounded-md">
                  <Slash className="w-3 h-3" strokeWidth={2} />
                  {t('Blocked')}
                </span>
              )}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">{company.industry}</div>
          </div>
        </div>

        <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{company.description}</p>
      </div>

      {/* Quick facts */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 gap-0 bg-white border border-[var(--border-default)] rounded-md divide-y divide-[var(--surface-subtle)]">
          <FactRow Icon={Briefcase} label={t('Industry')} value={company.industry} />
          <FactRow Icon={MapPin} label={t('Headquarters')} value={company.headquarters} />
          <FactRow Icon={Users} label={t('Size')} value={`${company.employees} ${t('employees')}`} />
          <FactRow
            Icon={ShieldCheck}
            label={t('Verified on iDap')}
            value={t('Since') + ' ' + company.verifiedSince}
          />
        </div>
      </div>

      {/* Track record */}
      <div className="px-6 pb-6">
        <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">
          {t('Track record on iDap')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={t('Surveys run')} value={String(company.totalSurveys)} />
          <StatCard
            label={t('Avg. reward')}
            value={`${Math.round(company.avgRewardMnt / 1000)}K`}
          />
          <StatCard
            label={t('Acceptance')}
            value={`${company.acceptanceRate}%`}
            tone="green"
          />
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
          {t("Acceptance rate is the share of submitted responses that pass quality review. Higher means this company's surveys are well-designed.")}
        </p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">{t('Actions')}</h3>
        <div className="space-y-2">
          {onViewMoreSurveys && (
            <ActionRow
              label={t('See more surveys from this company')}
              onClick={onViewMoreSurveys}
              Icon={ArrowRight}
            />
          )}
          <ActionRow
            label={t('Visit website')}
            description={company.website.replace(/^https?:\/\//, '')}
            onClick={() => window.open(company.website, '_blank', 'noopener,noreferrer')}
            Icon={ExternalLink}
          />
          <ActionRow
            label={
              reportSent ? t('Report sent — thank you') : t('Report this company')
            }
            description={
              reportSent
                ? t("The iDap Trust team is reviewing it. We'll email you if we need more detail.")
                : t('Send a note to the iDap Trust team — reviewed within 48 hours.')
            }
            onClick={reportSent ? undefined : onOpenReport}
            Icon={Flag}
            disabled={reportSent}
            tone={reportSent ? 'success' : 'default'}
          />
          {blocked ? (
            <ActionRow
              label={t('Unblock this company')}
              description={t("You'll start seeing matching surveys from them in your feed again.")}
              onClick={onToggleBlock}
              Icon={RotateCcw}
              tone="default"
            />
          ) : (
            <ActionRow
              label={t('Block this company')}
              description={t("Hide every survey from this company in your feed. You can undo this any time.")}
              onClick={onToggleBlock}
              Icon={Slash}
              tone="destructive"
            />
          )}
        </div>
      </div>

      <div className="px-6 pb-8">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {t("iDap verifies every company before they can run surveys. Individual responses are never shared with companies — only aggregated, anonymized results.")}
        </p>
      </div>
    </>
  );
}

function ReportView({
  companyName,
  reason,
  setReason,
  note,
  setNote,
  onCancel,
  onSubmit,
}: {
  companyName: string;
  reason: string;
  setReason: (r: string) => void;
  note: string;
  setNote: (n: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const canSubmit = reason.length > 0;

  return (
    <div className="px-6 py-6 space-y-5">
      <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
        {t('Your report goes to the iDap Trust team. We review every report within 48 hours and may pause the company while we investigate.')}{' '}
        <span className="text-[var(--text-secondary)]">
          {t("Reporting is anonymous to the company — they'll never see that it was you.")}
        </span>
      </p>

      <div>
        <div className="text-sm font-medium text-[var(--text-primary)] mb-2">
          {t("What's the issue with")}{' '}
          <span className="text-[var(--brand-primary)]">{companyName}</span>?
        </div>
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer transition-colors',
                reason === r
                  ? 'border-[var(--brand-border)] bg-[var(--brand-tint)]'
                  : 'border-[var(--border-default)] bg-white hover:border-[var(--brand-border)]',
              )}
            >
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-[var(--brand-primary)]"
              />
              <span className="text-sm text-[var(--text-primary)]">{r}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {t('Additional detail')}{' '}
          <span className="text-[var(--text-secondary)] font-normal">{t('(optional)')}</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder={t('Which survey or question was it? Anything specific we should look at?')}
          rows={4}
          className="w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors resize-none"
        />
        <div className="flex justify-end text-[11px] text-[var(--text-secondary)] mt-1 tabular-nums">
          {note.length} / 500
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-md border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            'flex-1 h-10 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
            canSubmit
              ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white cursor-pointer'
              : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] cursor-not-allowed',
          )}
        >
          {t('Send report')}
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function FactRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span className="text-sm font-medium text-[var(--text-primary)] text-right">{value}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'green';
}) {
  return (
    <div className="bg-white border border-[var(--border-default)] rounded-md p-3">
      <div className="text-[11px] text-[var(--text-secondary)] mb-1">{label}</div>
      <div
        className={cn(
          'text-lg font-medium tabular-nums',
          tone === 'green' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ActionRow({
  label,
  description,
  onClick,
  Icon,
  disabled = false,
  tone = 'default',
}: {
  label: string;
  description?: string;
  onClick?: () => void;
  Icon: React.ElementType;
  disabled?: boolean;
  tone?: 'default' | 'destructive' | 'success';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-md border transition-colors text-left',
        disabled
          ? 'border-[var(--border-default)] bg-[var(--surface-muted)] cursor-default'
          : 'border-[var(--border-default)] bg-white hover:border-[var(--brand-border)] cursor-pointer',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
          tone === 'success'
            ? 'bg-[var(--success-tint)] text-[var(--success)]'
            : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]',
        )}
      >
        {tone === 'success' ? (
          <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
        ) : (
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm font-medium',
            tone === 'destructive' && !disabled ? 'text-[var(--danger-strong)]' : 'text-[var(--text-primary)]',
          )}
        >
          {label}
        </div>
        {description && (
          <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{description}</div>
        )}
      </div>
    </button>
  );
}
