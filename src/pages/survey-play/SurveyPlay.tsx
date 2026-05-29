import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  CalendarIcon,
  ChevronDown,
  Trophy,
  Wallet,
  Clock,
  Lock,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TRUST_LEVELS } from '@/shared/config/business';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import {
  DEMO_FEED_SURVEYS,
  USER_TRUST_LEVEL,
} from '@/pages/survey-feed/survey-feed-data';
import {
  buildQuestions,
  isAnswered,
  type Question,
  type AnswerMap,
} from './questions';

function formatMnt(value: number): string {
  return `₩${value.toLocaleString('en-US')}`;
}

export default function SurveyPlay() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const survey = useMemo(
    () => DEMO_FEED_SURVEYS.find((s) => s.id === id),
    [id],
  );

  const questions = useMemo(
    () => (survey ? buildQuestions(survey) : []),
    [survey],
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [done, setDone] = useState(false);

  // Seed Ranking answers with default order on first view so the default
  // ordering is a valid submission without forcing the user to drag.
  useEffect(() => {
    const q = questions[index];
    if (q?.type === 'Ranking' && answers[q.id] === undefined) {
      setAnswers((prev) => ({ ...prev, [q.id]: q.options.slice() }));
    }
  }, [index, questions, answers]);

  if (!survey) return <Navigate to="/survey-feed" replace />;
  if (survey.requiredTrustLevel > USER_TRUST_LEVEL) {
    return <Navigate to={`/survey-feed/${survey.id}`} replace />;
  }

  const total = questions.length;
  const current = questions[index];
  const canAdvance = current ? isAnswered(current, answers[current.id]) : false;
  const progress = ((index + (canAdvance ? 1 : 0)) / total) * 100;

  const setAnswer = (value: AnswerMap[string]) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const onNext = () => {
    if (!canAdvance) return;
    if (index === total - 1) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };
  const onPrev = () => setIndex((i) => Math.max(0, i - 1));
  const onExit = () => navigate(`/survey-feed/${survey.id}`);

  if (done) {
    return (
      <SuccessScreen
        surveyId={survey.id}
        surveyTitle={survey.title}
        rewardMnt={survey.rewardMnt}
        answerCount={total}
        onBack={() => navigate('/survey-feed')}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex-1 overflow-y-auto w-full bg-[var(--surface-muted)] flex flex-col"
    >
      {/* Top bar */}
      <div className="px-4 sm:px-6 md:px-8 xl:px-12 pt-6 pb-4 bg-[var(--surface-muted)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <div className="text-xs text-[var(--text-secondary)] truncate">
                {survey.companyName}
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                {survey.title}
              </div>
            </div>
            <button
              onClick={onExit}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
              aria-label={t('Exit')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[var(--border-default)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--brand-primary)]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
              {index + 1} / {total}
            </div>
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 xl:px-12 pb-12">
        <div className="max-w-2xl mx-auto pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-medium text-[var(--brand-primary)] mb-2 uppercase tracking-wider">
                {t('Question')} {index + 1}
              </div>
              <h2 className="text-xl font-serif text-[var(--text-primary)] leading-snug mb-2">
                {current.prompt}
              </h2>
              <span className="inline-flex text-xs font-medium text-[var(--brand-primary)] bg-[var(--brand-tint)] px-2 py-0.5 rounded-md mb-3">
                {t('Required')}
              </span>
              {current.helper && (
                <p className="text-xs text-[var(--text-secondary)] mb-5 mt-1">{current.helper}</p>
              )}

              <div className="mt-5">
                <QuestionInput
                  question={current}
                  value={answers[current.id]}
                  onChange={setAnswer}
                />
              </div>

              {/* Inline actions */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-[var(--border-default)]">
                <button
                  onClick={onPrev}
                  disabled={index === 0}
                  className={cn(
                    'h-10 px-4 inline-flex items-center gap-2 border border-[var(--border-default)] text-sm font-medium rounded-md transition-colors',
                    index === 0
                      ? 'text-[var(--text-muted)] cursor-not-allowed'
                      : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] cursor-pointer',
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('Previous')}
                </button>
                <button
                  onClick={onNext}
                  disabled={!canAdvance}
                  className={cn(
                    'h-10 px-5 inline-flex items-center gap-2 text-white text-sm font-medium rounded-md transition-colors',
                    canAdvance
                      ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] cursor-pointer'
                      : 'bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed',
                  )}
                >
                  {index === total - 1 ? t('Submit') : t('Next')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerMap[string];
  onChange: (v: AnswerMap[string]) => void;
}) {
  const { t } = useTranslation();

  switch (question.type) {
    case 'Scale': {
      const selected = value as number | undefined;
      const points = Array.from(
        { length: question.max - question.min + 1 },
        (_, i) => question.min + i,
      );
      return (
        <div>
          <div className="grid grid-cols-5 gap-2">
            {points.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={cn(
                  'h-12 rounded-md border text-sm font-medium tabular-nums transition-colors cursor-pointer',
                  selected === n
                    ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                    : 'bg-white border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)]',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {(question.minLabel || question.maxLabel) && (
            <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
              <span>{question.minLabel}</span>
              <span>{question.maxLabel}</span>
            </div>
          )}
        </div>
      );
    }

    case 'Single Choice': {
      const selected = value as string | undefined;
      return (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const active = selected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-colors cursor-pointer',
                  active
                    ? 'bg-[var(--brand-tint)] border-[var(--brand-primary)] text-[var(--text-primary)]'
                    : 'bg-white border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
                )}
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
                    active ? 'border-[var(--brand-primary)]' : 'border-[var(--border-strong)]',
                  )}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
                </span>
                <span className="flex-1 font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      );
    }

    case 'Multi Choice': {
      const selected = (value as string[] | undefined) ?? [];
      const toggle = (opt: string) => {
        if (selected.includes(opt)) {
          onChange(selected.filter((o) => o !== opt));
        } else {
          onChange([...selected, opt]);
        }
      };
      return (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const active = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-colors cursor-pointer',
                  active
                    ? 'bg-[var(--brand-tint)] border-[var(--brand-primary)] text-[var(--text-primary)]'
                    : 'bg-white border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
                )}
              >
                <span
                  className={cn(
                    'w-4 h-4 rounded-[4px] border-2 shrink-0 flex items-center justify-center transition-colors',
                    active ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-[var(--border-strong)]',
                  )}
                >
                  {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="flex-1 font-medium">{opt}</span>
              </button>
            );
          })}
        </div>
      );
    }

    case 'Short Text': {
      return (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? t('Type your answer')}
          className="w-full px-4 py-3 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors"
          autoFocus
        />
      );
    }

    case 'Long Text': {
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? t('Type your answer')}
          rows={6}
          className="w-full px-4 py-3 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors resize-none leading-relaxed"
          autoFocus
        />
      );
    }

    case 'Date': {
      const selected = value instanceof Date ? value : undefined;
      return (
        <DatePickerField
          value={selected}
          onChange={(d) => onChange(d)}
          placeholder={t('Pick a date')}
        />
      );
    }

    case 'Ranking': {
      const order = (value as string[] | undefined) ?? question.options;
      return (
        <RankingList
          items={order}
          onReorder={(next) => onChange(next)}
        />
      );
    }

    case 'Matrix': {
      const map = (value as Record<string, string> | undefined) ?? {};
      return (
        <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--surface-muted)]">
                  <th className="text-left font-medium text-[var(--text-secondary)] px-4 py-3 min-w-[180px]">
                    &nbsp;
                  </th>
                  {question.columns.map((col) => (
                    <th
                      key={col}
                      className="font-medium text-[var(--text-secondary)] px-3 py-3 text-center text-xs whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows.map((row, ri) => (
                  <tr
                    key={row}
                    className={cn(
                      'border-b border-[var(--surface-subtle)]',
                      ri === question.rows.length - 1 && 'border-b-0',
                    )}
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)] font-medium align-middle">
                      {row}
                    </td>
                    {question.columns.map((col) => {
                      const active = map[row] === col;
                      return (
                        <td key={col} className="px-3 py-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => onChange({ ...map, [row]: col })}
                            className={cn(
                              'w-4 h-4 rounded-full border-2 transition-colors cursor-pointer',
                              active
                                ? 'border-[var(--brand-primary)] bg-white'
                                : 'border-[var(--border-strong)] hover:border-[var(--text-muted)]',
                            )}
                          >
                            {active && (
                              <span className="block w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }
}

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (d: Date) => void;
  placeholder: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'h-10 px-3 inline-flex items-center gap-2 bg-white border border-[var(--border-default)] rounded-md text-sm transition-colors cursor-pointer min-w-[220px]',
          'hover:bg-[var(--surface-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]',
          open && 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]',
        )}
      >
        <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        <span
          className={cn(
            'flex-1 text-left tabular-nums',
            value ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]',
          )}
        >
          {value ? format(value, 'MMM d, yyyy') : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--text-secondary)] transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-30 bg-white border border-[var(--border-default)] rounded-md shadow-[0_4px_16px_rgba(44,38,39,0.08)] p-2"
            style={{
              '--primary': 'var(--brand-primary)',
              '--primary-foreground': '#FFFFFF',
            } as React.CSSProperties}
          >
            <CalendarUI
              mode="single"
              selected={value}
              onSelect={(d) => {
                if (d) {
                  onChange(d);
                  setOpen(false);
                }
              }}
              className="p-0"
            />
            {value && (
              <div className="px-2 pb-1 pt-2 border-t border-[var(--surface-subtle)] mt-2 text-xs text-[var(--text-secondary)] tabular-nums">
                {t('Selected')}: {format(value, 'EEEE, MMMM d, yyyy')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mock user state — in a real app this would come from the user's profile + wallet history.
const MOCK_RESPONSES_COMPLETED = 6;
const MOCK_WALLET_BEFORE_MNT = 32_000;
const USER_NAME_FIRST = 'Hein';

const TRUST_LEVEL_PERKS: Record<number, string> = {
  2: 'Higher-reward surveys',
  3: 'Higher rewards and exclusive surveys',
  4: 'Priority matching and premium surveys',
  5: 'Partner-tier rewards and early access',
};

function formatMntPlain(v: number): string {
  return `₩${v.toLocaleString('en-US')}`;
}

function SuccessScreen({
  surveyId,
  surveyTitle,
  rewardMnt,
  answerCount,
  onBack,
}: {
  surveyId: string;
  surveyTitle: string;
  rewardMnt: number;
  answerCount: number;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [celebrate] = useState(true);

  const completed = MOCK_RESPONSES_COMPLETED + 1;
  const nextLevel = TRUST_LEVELS.find(
    (l) => l.minResponses > completed,
  );
  const currentLevel = [...TRUST_LEVELS]
    .reverse()
    .find((l) => l.minResponses <= completed);
  const toNext = nextLevel
    ? Math.max(0, nextLevel.minResponses - completed)
    : 0;
  const progressPct = nextLevel
    ? Math.min(
        100,
        ((completed - (currentLevel?.minResponses ?? 0)) /
          (nextLevel.minResponses - (currentLevel?.minResponses ?? 0))) *
          100,
      )
    : 100;

  const walletBalance = MOCK_WALLET_BEFORE_MNT + rewardMnt;

  const nextSurvey = useMemo(() => {
    return [...DEMO_FEED_SURVEYS]
      .filter(
        (s) =>
          s.id !== surveyId &&
          s.requiredTrustLevel <= USER_TRUST_LEVEL &&
          s.spotsLeft > 0,
      )
      .sort((a, b) => b.matchPercent - a.matchPercent)[0];
  }, [surveyId]);

  return (
    <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[var(--surface-muted)] relative">
      {celebrate && <Confetti />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-xl mx-auto text-center pt-12 relative z-10"
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 18,
            delay: 0.1,
          }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--success-tint)] text-[var(--success)] mb-5 relative"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.35, duration: 0.35 }}
            className="flex"
          >
            <Check className="w-8 h-8" strokeWidth={3} />
          </motion.div>
          {/* Pulse ring */}
          <motion.span
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-[var(--success)]"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="text-3xl font-serif text-[var(--text-primary)] mb-2"
        >
          {t('Nice work,')} {USER_NAME_FIRST}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-8"
        >
          {t('You finished')}{' '}
          <span className="font-medium text-[var(--text-primary)]">{surveyTitle}</span>.{' '}
          {t('Your reward is on its way to your wallet.')}
        </motion.p>

        {/* Hero reward */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="bg-white border border-[var(--border-default)] rounded-md p-6 mb-4 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[var(--brand-tint)] opacity-70 pointer-events-none" />
          <div className="relative">
            <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              {t('Reward earned')}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.35 }}
              className="text-4xl font-serif font-medium text-[var(--brand-primary)] tabular-nums lining-nums leading-tight"
            >
              {formatMntPlain(rewardMnt)}
            </motion.div>
            <div className="text-xs text-[var(--text-secondary)] mt-2 tabular-nums">
              {answerCount} {t('answers submitted')}
            </div>
          </div>
        </motion.div>

        {/* Wallet callout */}
        <motion.button
          type="button"
          onClick={() => navigate('/wallet')}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="w-full bg-white border border-[var(--border-default)] rounded-md px-4 py-3 mb-4 flex items-center justify-between gap-3 hover:border-[var(--brand-border)] transition-colors cursor-pointer group text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-[var(--text-tertiary)]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[var(--text-secondary)]">{t('Wallet balance')}</div>
              <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums lining-nums">
                {formatMntPlain(walletBalance)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0">
            {t('View wallet')}
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.button>

        {/* Trust progress */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-white border border-[var(--border-default)] rounded-md p-5 mb-4 text-left"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {nextLevel
                    ? `${t('Trust Lv.')}${nextLevel.level} · ${nextLevel.label}`
                    : `${t('Trust Lv.')}${currentLevel?.level} · ${currentLevel?.label}`}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {nextLevel
                    ? toNext > 0
                      ? `${toNext} ${t('more to unlock')}`
                      : t('Unlocked!')
                    : t('Top level reached')}
                </div>
              </div>
            </div>
            <div className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
              {completed}
              {nextLevel ? ` / ${nextLevel.minResponses}` : ''}
            </div>
          </div>

          <div className="h-2 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-[var(--brand-primary)]"
            />
          </div>

          {nextLevel && TRUST_LEVEL_PERKS[nextLevel.level] && (
            <div className="mt-3 pt-3 border-t border-[var(--surface-subtle)] flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Lock className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
              <span>
                <span className="text-[var(--text-secondary)]">
                  {t('Unlock at Trust Lv.')}{nextLevel.level}:
                </span>{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {t(TRUST_LEVEL_PERKS[nextLevel.level])}
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Next recommended survey */}
        {nextSurvey && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.3 }}
            className="mb-6 text-left"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-sm font-medium text-[var(--text-tertiary)]">
                {t('Recommended for you next')}
              </div>
              <button
                onClick={() => navigate('/survey-feed')}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {t('See all')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/survey-feed/${nextSurvey.id}`)}
              className="group w-full bg-white border border-[var(--border-default)] rounded-md p-4 flex items-center gap-4 hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer text-left"
            >
              <div className="w-11 h-11 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] text-sm font-medium shrink-0">
                {nextSurvey.companyInitials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs text-[var(--text-secondary)] truncate mb-0.5">
                  {nextSurvey.companyName}
                </div>
                <div className="text-sm font-medium text-[var(--text-primary)] truncate mb-1">
                  {nextSurvey.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--brand-primary)] tabular-nums lining-nums">
                    {formatMntPlain(nextSurvey.rewardMnt)}
                  </span>
                  <span className="text-[var(--border-strong)]">·</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {nextSurvey.durationMin} {t('min')}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] group-hover:bg-[var(--brand-primary)] flex items-center justify-center transition-colors shrink-0">
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-white transition-colors" />
              </div>
            </button>
          </motion.div>
        )}

        {/* Back to feed (secondary now) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <button
            onClick={onBack}
            className="h-10 px-5 inline-flex items-center gap-2 border border-[var(--border-default)] bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] text-sm font-medium rounded-md transition-colors cursor-pointer"
          >
            {t('Back to feed')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(() => {
    const palette = ['var(--brand-primary)', 'var(--success)', 'var(--warning-strong)', 'var(--text-primary)', 'var(--border-default)'];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 480,
      y: 80 + Math.random() * 220,
      rot: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.15,
      color: palette[i % palette.length],
      size: 4 + Math.random() * 6,
      shape: i % 3,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-full overflow-visible z-0">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rot, opacity: 0 }}
          transition={{
            duration: 1.4 + Math.random() * 0.6,
            delay: p.delay,
            ease: [0.2, 0.6, 0.4, 1],
          }}
          className="absolute top-20 left-1/2"
          style={{
            width: p.size,
            height: p.shape === 1 ? p.size * 0.5 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 0 ? '999px' : p.shape === 1 ? '2px' : '0px',
            transform: 'translate(-50%, 0)',
          }}
        />
      ))}
    </div>
  );
}

function RankingList({
  items,
  onReorder,
}: {
  items: string[];
  onReorder: (next: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((label, i) => (
            <SortableRankingItem key={label} id={label} rank={i + 1} label={label} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRankingItem({
  id,
  rank,
  label,
}: {
  id: string;
  rank: number;
  label: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 pl-3 pr-4 py-3 bg-white border rounded-md select-none',
        isDragging
          ? 'border-[var(--brand-primary)] shadow-[0_8px_24px_rgba(44,38,39,0.12)] z-10 relative'
          : 'border-[var(--border-default)] hover:border-[var(--brand-border)]',
      )}
    >
      <span className="w-6 text-center text-sm font-medium text-[var(--text-muted)] tabular-nums shrink-0">
        {rank}
      </span>
      <button
        type="button"
        aria-label="Drag to reorder"
        className={cn(
          'p-1 -ml-1 rounded cursor-grab touch-none text-[var(--text-muted)] hover:text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0',
          isDragging && 'cursor-grabbing text-[var(--brand-primary)] hover:text-[var(--brand-primary)]',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 text-sm font-medium text-[var(--text-primary)] min-w-0 truncate">
        {label}
      </span>
    </li>
  );
}
