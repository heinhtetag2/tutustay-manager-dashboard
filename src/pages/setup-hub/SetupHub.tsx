import { useMemo } from 'react';
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

  const { steps, completed, total, pct, allDone } = useMemo(() => setupProgress(property), [property]);
  const review = property.reviewStatus;
  const submitted = review === 'Submitted';
  const approved = review === 'Approved';
  const rejected = review === 'Rejected';
  // Only the manager-actionable states (Draft/Rejected) expose the journey CTA.
  const editable = review === 'Draft' || review === 'Rejected';
  const nextIndex = editable ? steps.findIndex((s) => !s.complete) : -1;
  const openStep = (step: number) => navigate(`/hotel/setup?step=${step}&from=/setup`);

  const submitForReview = () => updateProperty({ reviewStatus: 'Submitted', submittedAt: new Date().toISOString(), reviewNote: undefined });
  const withdraw = () => updateProperty({ reviewStatus: 'Draft', submittedAt: undefined });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Setup hub')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
          {approved
            ? t('Your property is approved and taking bookings.')
            : submitted
              ? t('Your property is submitted and waiting on review.')
              : allDone
                ? t('Everything’s filled in — submit your property for review to go live.')
                : t('A few steps to get your property live and ready to take bookings.')}
        </p>
      </div>

      {/* Review status banner */}
      {submitted && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3.5 rounded-md bg-[var(--warning-tint)] border border-[var(--warning-border,var(--warning-tint))]">
          <Clock className="w-5 h-5 text-[var(--warning-strong)] mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-[var(--warning-strong)]">{t('Submitted for review')}</span>
            <span className="text-[var(--text-secondary)]"> — {t('our team is reviewing your property. We’ll let you know once it’s approved and live.')}
            {property.submittedAt ? ` ${t('Submitted')} ${new Date(property.submittedAt).toLocaleDateString()}.` : ''}</span>
          </div>
        </div>
      )}
      {approved && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3.5 rounded-md bg-[var(--success-tint)] border border-[var(--success-border,var(--success-tint))]">
          <CheckCircle2 className="w-5 h-5 text-[var(--success)] mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-[var(--success)]">{t('Approved & live')}</span>
            <span className="text-[var(--text-secondary)]"> — {t('your property is approved and visible to guests.')}</span>
          </div>
        </div>
      )}
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
        <div className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Your setup journey')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">{completed} {t('of')} {total} {t('done')}</p>
            </div>
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
                      {s.complete ? (
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

        {/* Right rail */}
        <div className="space-y-6 lg:sticky lg:top-8">
          {/* Progress ring */}
          <div className="bg-white border border-[var(--border-default)] rounded-md shadow-none p-6 flex flex-col items-center text-center">
            <ProgressRing pct={approved || submitted ? 100 : pct} done={approved} />
            <div className="mt-4 text-sm font-medium text-[var(--text-primary)]">
              {approved
                ? t('Live')
                : submitted
                  ? t('Under review')
                  : allDone
                    ? t('Ready to submit')
                    : `${total - completed} ${total - completed === 1 ? t('step left') : t('steps left')}`}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              {approved
                ? t('Your property is approved and visible to guests.')
                : submitted
                  ? t('We’re reviewing your property. This usually takes a day.')
                  : allDone
                    ? t('Everything’s filled in — submit it for review to go live.')
                    : t('Finish the remaining steps, then submit for review.')}
            </p>

            {/* State-aware action */}
            {editable && !allDone && nextIndex >= 0 && (
              <button
                onClick={() => openStep(steps[nextIndex].step)}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                {t('Continue setup')}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {editable && allDone && (
              <button
                onClick={submitForReview}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {rejected ? t('Resubmit for review') : t('Submit for review')}
              </button>
            )}
            {submitted && (
              <button
                onClick={withdraw}
                className="mt-4 w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              >
                {t('Withdraw submission')}
              </button>
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
