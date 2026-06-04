import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Check,
  ArrowRight,
  Pencil,
  Globe,
  CalendarCheck,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useHotel } from '@/pages/hotel/use-hotel';
import { setupProgress } from './setup-progress';

type TFn = (key: string) => string;

/** Outcomes the manager unlocks by finishing setup — gives the page substance. */
const UNLOCKS = [
  { Icon: Globe, label: 'Go live', desc: 'Your property appears to guests once setup is complete.' },
  { Icon: CalendarCheck, label: 'Take bookings', desc: 'Accept reservations and manage your calendar.' },
  { Icon: Wallet, label: 'Get paid', desc: 'Receive booking settlements to your bank.' },
];

function ProgressRing({ pct, done }: { pct: number; done: boolean }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = done ? 'var(--success)' : 'var(--brand-primary)';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-subtle)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-medium text-[var(--text-primary)] tabular-nums leading-none">{pct}%</span>
        <span className="text-[11px] text-[var(--text-tertiary)] mt-1">{done ? 'complete' : 'set up'}</span>
      </div>
    </div>
  );
}

export default function SetupHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const property = useHotel((s) => s.property);

  const updateProperty = useHotel((s) => s.updateProperty);

  const { steps, completed, total, pct, allRequiredDone, requiredRemaining } = useMemo(() => setupProgress(property), [property]);
  const review = property.reviewStatus;
  const live = !!property.live;
  const editing = review === 'Approved' && !!property.editing;
  const pendingEdits = !!property.pendingEdits;
  // A submission from an already-live listing is a re-review (stays live); a first
  // submission is the initial pending-approval flow.
  const changesUnderReview = review === 'Submitted' && live;
  const firstReview = review === 'Submitted' && !live;
  const submitted = review === 'Submitted';
  const approved = review === 'Approved';
  const rejected = review === 'Rejected';
  // Initial setup flow (never been approved) — owns the ring's Continue/Submit CTAs.
  const initialEditable = review === 'Draft' || review === 'Rejected';
  // Manager can edit during Draft/Rejected, or after explicitly unlocking a live listing.
  const editable = initialEditable || editing;
  // Highlight the next required step only — the optional one shouldn't gate submission.
  const nextIndex = editable ? steps.findIndex((s) => !s.complete && !s.optional) : -1;
  const openStep = (step: number) => navigate(`/hotel/setup?step=${step}&from=/setup`);

  const submitForReview = () => updateProperty({ reviewStatus: 'Submitted', submittedAt: new Date().toISOString(), reviewNote: undefined });
  // Editing a live listing — changes are held until re-approved; the listing stays live.
  const startEditing = () => updateProperty({ editing: true, pendingEdits: false, live: true });
  const cancelEditing = () => updateProperty({ editing: false, pendingEdits: false });
  const resubmitChanges = () =>
    updateProperty({ reviewStatus: 'Submitted', submittedAt: new Date().toISOString(), editing: false, pendingEdits: false, reviewNote: undefined });

  // Simulated super-admin review: once submitted there's no withdraw — the manager
  // waits, and the property is auto-approved ~1 minute after submission. Anchored to
  // submittedAt so the approval still fires at the right time across reloads/navigation.
  // Approval marks the listing live (and stays live through later edit/re-review cycles).
  const REVIEW_MS = 60_000;
  useEffect(() => {
    if (review !== 'Submitted' || !property.submittedAt) return;
    const remaining = REVIEW_MS - (Date.now() - new Date(property.submittedAt).getTime());
    const approve = () => updateProperty({ reviewStatus: 'Approved', live: true, editing: false, pendingEdits: false, reviewNote: undefined });
    if (remaining <= 0) {
      approve();
      return;
    }
    const id = setTimeout(approve, remaining);
    return () => clearTimeout(id);
  }, [review, property.submittedAt, updateProperty]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Set up your property')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
          {editing
            ? t('Editing your live listing — changes go live once they’re re-approved.')
            : changesUnderReview
              ? t('Your listing stays live while we review your latest changes.')
              : approved
                ? t('Your property is approved and taking bookings.')
                : firstReview
                  ? t('Your property is submitted and waiting on review.')
                  : allRequiredDone
                    ? t('Everything’s filled in — submit your property for review to go live.')
                    : t('A few steps to get your property live and ready to take bookings.')}
        </p>
      </div>

      {/* Review status banner */}
      {rejected && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3.5 rounded-md bg-[var(--danger-tint)] border border-[var(--danger-border,var(--danger-tint))]">
          <XCircle className="w-5 h-5 text-[var(--danger)] mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-[var(--danger)]">{t('Changes needed')}</span>
            <span className="text-[var(--text-secondary)]"> — {property.reviewNote || t('Please review your details and resubmit for approval.')}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: the journey */}
        <div className="lg:col-span-2 space-y-6">
        {/* Changes-under-review card — the listing stays live while edits are re-reviewed. */}
        {changesUnderReview && (
          <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
            <div className="px-6 py-6 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[var(--warning-tint)] text-[var(--warning-strong)] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Changes under review')}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--success-tint)] text-[var(--success)]">
                    <Globe className="w-3 h-3" /> {t('Still live')}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('Your current listing stays live and keeps taking bookings. Your edits go live once they’re re-approved.')}
                </p>
                {property.submittedAt && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2 tabular-nums">
                    {t('Resubmitted')}{' '}
                    {new Date(property.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--warning-tint)]">
                  <span className="relative flex w-2 h-2">
                    <motion.span
                      className="absolute inline-flex w-full h-full rounded-full bg-[var(--warning-strong)]"
                      animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--warning-strong)]" />
                  </span>
                  <span className="text-xs font-medium text-[var(--warning-strong)]">{t('Reviewing changes')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending-approval waiting card — shown while the first submission is with the super-admin team. */}
        {firstReview && (
          <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
            <div className="px-6 py-6 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[var(--warning-tint)] text-[var(--warning-strong)] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Pending approval')}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('Your property is with our team for review. Most reviews finish within a day.')}
                </p>
                {property.submittedAt && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-2 tabular-nums">
                    {t('Submitted')}{' '}
                    {new Date(property.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}

                {/* What happens next */}
                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                    {t('Our team verifies your details and contract.')}
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <Mail className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                    {t('We’ll email you the moment it’s approved and live.')}
                  </li>
                </ul>

                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--warning-tint)]">
                  <span className="relative flex w-2 h-2">
                    <motion.span
                      className="absolute inline-flex w-full h-full rounded-full bg-[var(--warning-strong)]"
                      animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--warning-strong)]" />
                  </span>
                  <span className="text-xs font-medium text-[var(--warning-strong)]">{t('Reviewing now')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approved & live — the super-admin accepted; the property is visible to guests. */}
        {approved && !editing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden"
          >
            <div className="px-6 py-6 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[var(--success-tint)] text-[var(--success)] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('You’re approved & live')}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('Our team approved your property — it’s now visible to guests and ready to take bookings.')}
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <Globe className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
                    {t('Your listing is live for guests to find and book.')}
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <CalendarCheck className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
                    {t('Reservations now flow straight into your calendar.')}
                  </li>
                </ul>
                <div className="mt-5 flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                  >
                    {t('Go to dashboard')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={startEditing}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t('Edit details')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Editing a live listing — checklist unlocks; changes need re-approval to go live. */}
        {editing && (
          <div className="bg-white border border-[var(--brand-border)] rounded-md overflow-hidden">
            <div className="px-6 py-6 flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Editing your live listing')}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--success-tint)] text-[var(--success)]">
                    <Globe className="w-3 h-3" /> {t('Still live')}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {pendingEdits
                    ? t('Edit any step below. Your changes go live once our team re-approves them — your current listing stays up until then.')
                    : t('Edit any step below. When you’re done, resubmit for review — your listing stays live the whole time.')}
                </p>
                <div className="mt-5 flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={resubmitChanges}
                    disabled={!pendingEdits}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--brand-primary)]"
                  >
                    <Send className="w-4 h-4" />
                    {t('Resubmit for review')}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                </div>
                {!pendingEdits && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-3 leading-relaxed">
                    {t('Make a change to a step to enable resubmitting.')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Your setup journey')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">{completed} {t('of')} {total} {t('done')}</p>
            </div>
            {editing ? (
              <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)]">{t('Editing')}</span>
            ) : submitted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)]"><Lock className="w-3 h-3" />{t('Locked while under review')}</span>
            ) : null}
          </div>

          <ol className="px-6 py-2">
            {steps.map((s, i) => {
              const isNext = i === nextIndex;
              const isLast = i === steps.length - 1;
              return (
                <li key={s.key} className="relative flex gap-4 pb-2">
                  {/* Connector line + node */}
                  <div className="flex flex-col items-center">
                    <span
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold transition-colors ${
                        s.complete
                          ? 'bg-[var(--success)] text-white'
                          : isNext
                            ? 'bg-[var(--brand-primary)] text-white'
                            : 'bg-white border-2 border-[var(--border-strong)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      {s.complete ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    {!isLast && <span className={`w-0.5 flex-1 my-1 ${s.complete ? 'bg-[var(--success)]/40' : 'bg-[var(--surface-subtle)]'}`} />}
                  </div>

                  {/* Content */}
                  {isNext ? (
                    <div className="flex-1 min-w-0 mb-4 rounded-md border border-[var(--brand-border)] bg-[var(--brand-tint)]/30 p-4 -mt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{t(s.title)}</span>
                        {s.optional && (
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)]">{t('Optional')}</span>
                        )}
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--brand-primary)] text-white">{t('Up next')}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{t(s.desc)}</p>
                      <button
                        onClick={() => openStep(s.step)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--text-primary)] rounded-md hover:bg-[var(--text-primary)]/90 transition-colors cursor-pointer"
                      >
                        {t('Complete this step')}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0 mb-4 py-1.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${s.complete ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{t(s.title)}</span>
                          {s.optional && !s.complete && (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)]">{t('Optional')}</span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{t(s.desc)}</p>
                      </div>
                      {!editable ? null : s.complete ? (
                        <button
                          onClick={() => openStep(s.step)}
                          title={t('Edit')}
                          aria-label={`${t('Edit')} ${t(s.title)}`}
                          className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openStep(s.step)}
                          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer mt-0.5"
                        >
                          {t('Complete')}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6 lg:sticky lg:top-8">
          {/* Progress ring */}
          <div className="bg-white border border-[var(--border-default)] rounded-md shadow-none p-6 flex flex-col items-center text-center">
            <ProgressRing pct={approved || submitted ? 100 : pct} done={approved} />
            <div className="mt-4 text-sm font-medium text-[var(--text-primary)]">
              {approved
                ? t('Live')
                : changesUnderReview
                  ? t('Live · under review')
                  : firstReview
                    ? t('Under review')
                    : allRequiredDone
                      ? t('Ready to submit')
                      : `${requiredRemaining} ${requiredRemaining === 1 ? t('step left') : t('steps left')}`}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {editing
                ? t('Resubmit your changes to send them for re-approval.')
                : approved
                  ? t('Your property is approved and visible to guests.')
                  : changesUnderReview
                    ? t('Your listing stays live while we review your changes.')
                    : firstReview
                      ? t('We’re reviewing your property. This usually takes a day.')
                      : allRequiredDone
                        ? t('Everything’s filled in — submit it for review to go live.')
                        : t('Finish the remaining steps, then submit for review.')}
            </p>

            {/* State-aware action — only the initial setup flow drives the ring CTA. */}
            {initialEditable && !allRequiredDone && nextIndex >= 0 && (
              <button
                onClick={() => openStep(steps[nextIndex].step)}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                {t('Continue setup')}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {initialEditable && allRequiredDone && (
              <button
                onClick={submitForReview}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {rejected ? t('Resubmit for review') : t('Submit for review')}
              </button>
            )}
            {firstReview && (
              <p className="mt-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
                {t('Sit tight — we’ll email you the moment your property is approved.')}
              </p>
            )}
            {changesUnderReview && (
              <p className="mt-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
                {t('Your listing stays live — we’ll email you when your changes are approved.')}
              </p>
            )}
          </div>

          {/* What you unlock */}
          <div className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--surface-subtle)]">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('What finishing unlocks')}</h3>
            </div>
            <ul className="divide-y divide-[var(--surface-subtle)]">
              {UNLOCKS.map((u) => (
                <li key={u.label} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                    <u.Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{t(u.label)}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{t(u.desc)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
