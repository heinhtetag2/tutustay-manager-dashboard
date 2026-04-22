import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Save,
  Rocket,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  GripVertical,
  Zap,
  CheckCircle2,
  Calendar,
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
import { PLATFORM_FEE, TRUST_LEVELS } from '@/shared/config/business';
import { BrandSelect } from '@/shared/ui/brand-select';
import type { BuilderQuestion } from '@/shared/lib/mock-questions';

type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'short_text'
  | 'long_text'
  | 'rating';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  short_text: 'Short Text',
  long_text: 'Long Text',
  rating: 'Rating (1–5)',
};

const SURVEY_CATEGORIES = ['Social', 'Product', 'Brand', 'Market Research', 'Other'] as const;

function needsOptions(type: QuestionType) {
  return type === 'single_choice' || type === 'multiple_choice';
}

function makeId() {
  return `q_${Math.random().toString(36).slice(2, 9)}`;
}

function formatMnt(n: number) {
  return `₮${n.toLocaleString('en-US')}`;
}

interface SurveyPrefill {
  title?: string;
  description?: string;
  category?: string;
  reward?: number;
  maxResponses?: number;
  estMinutes?: number;
  trustLevel?: 1 | 2 | 3 | 4 | 5;
  endDate?: string;
  anonymous?: boolean;
  questions?: BuilderQuestion[];
}

export default function SurveyBuilder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: SurveyPrefill } | null)?.prefill;
  const isEditing = Boolean(prefill);

  // Survey meta
  const [title, setTitle] = useState(prefill?.title ?? '');
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [category, setCategory] = useState<string>(prefill?.category ?? 'Market Research');

  // Reward & limits
  const [reward, setReward] = useState(prefill?.reward ?? 500);
  const [maxResponses, setMaxResponses] = useState(prefill?.maxResponses ?? 100);
  const [estMinutes, setEstMinutes] = useState(prefill?.estMinutes ?? 5);
  const [trustLevel, setTrustLevel] = useState<1 | 2 | 3 | 4 | 5>(prefill?.trustLevel ?? 1);
  const [endDate, setEndDate] = useState(() => {
    if (prefill?.endDate) return prefill.endDate;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [anonymous, setAnonymous] = useState(prefill?.anonymous ?? false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const endDateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEndDateOpen) return;
    const handler = (e: MouseEvent) => {
      if (endDateRef.current && !endDateRef.current.contains(e.target as Node)) {
        setIsEndDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEndDateOpen]);

  // Questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (prefill?.questions && prefill.questions.length > 0) {
      return prefill.questions.map((q) => ({
        id: q.id || makeId(),
        text: q.text,
        type: q.type as QuestionType,
        options: q.options.length > 0 ? q.options : ['', ''],
        required: q.required,
      }));
    }
    return [
      { id: makeId(), text: '', type: 'single_choice', options: ['', ''], required: true },
    ];
  });

  const addQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      { id: makeId(), text: '', type: 'single_choice', options: ['', ''], required: true },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.id !== id) : qs));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setQuestions((qs) => {
      const oldIndex = qs.findIndex((q) => q.id === active.id);
      const newIndex = qs.findIndex((q) => q.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return qs;
      return arrayMove(qs, oldIndex, newIndex);
    });
  };

  const moveQuestion = (id: string, dir: 'up' | 'down') => {
    setQuestions((qs) => {
      const i = qs.findIndex((q) => q.id === id);
      if (i < 0) return qs;
      const target = dir === 'up' ? i - 1 : i + 1;
      if (target < 0 || target >= qs.length) return qs;
      const next = qs.slice();
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  };

  const addOption = (qid: string) => {
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, options: [...q.options, ''] } : q)));
  };

  const updateOption = (qid: string, idx: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) }
          : q,
      ),
    );
  };

  const removeOption = (qid: string, idx: number) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== idx) }
          : q,
      ),
    );
  };

  // Derived
  const payout = reward * maxResponses;
  const platformFee = Math.round((payout * PLATFORM_FEE.defaultPct) / 100);
  const totalCost = payout + platformFee;

  const rewardFairness: { label: string; tone: 'good' | 'fair' | 'low' } = useMemo(() => {
    const perMinute = estMinutes > 0 ? reward / estMinutes : 0;
    if (perMinute >= 150) return { label: 'Generous', tone: 'good' };
    if (perMinute >= 100) return { label: '~ Fair', tone: 'fair' };
    return { label: 'Low', tone: 'low' };
  }, [reward, estMinutes]);

  const eligiblePool: Record<number, number> = { 1: 8500, 2: 5200, 3: 3100, 4: 1400, 5: 420 };
  const pool = eligiblePool[trustLevel];

  const estVelocity = Math.max(1, Math.round(pool * 0.012));
  const estDays = Math.max(1, Math.ceil(maxResponses / estVelocity));
  const bufferDays = Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / 86400000) - estDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-6 md:px-8 xl:px-12 py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-[#616161] mb-2">
            <button
              onClick={() => navigate('/surveys')}
              className="font-normal hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {t('Surveys')}
            </button>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[#1A1A1A] font-medium">{isEditing ? t('Edit Survey') : t('New Survey')}</span>
          </nav>
          <h1 className="text-3xl font-serif text-[#1A1A1A]">{isEditing ? t('Edit Survey') : t('Survey Builder')}</h1>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-[#EBEBEB] rounded-md text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors bg-white shadow-none cursor-pointer"
            onClick={() => navigate('/surveys')}
          >
            <Save className="w-4 h-4" />
            {t('Save Draft')}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#FF3C21] rounded-md text-sm font-medium text-white hover:bg-[#E63419] transition-colors shadow-none cursor-pointer"
            onClick={() => navigate('/surveys')}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            {isEditing ? t('Save Survey') : t('Publish Survey')}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Survey Settings */}
          <div className="bg-white rounded-md border border-[#EBEBEB] p-5">
            <h2 className="text-base font-medium text-[#1A1A1A] mb-4">{t('Survey Settings')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('Title')} <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('e.g. Customer Satisfaction 2025')}
                  className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('Description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('Tell respondents what this survey is about...')}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('Category')}
                </label>
                <BrandSelect
                  value={category}
                  onValueChange={setCategory}
                  options={SURVEY_CATEGORIES.map((c) => ({ value: c, label: t(c) }))}
                />
              </div>
            </div>
          </div>

          {/* Reward & Limits */}
          <div className="bg-white rounded-md border border-[#EBEBEB] p-5">
            <h2 className="text-base font-medium text-[#1A1A1A] mb-4">{t('Reward & Limits')}</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#4A4A4A]">{t('Reward (₮)')}</label>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        rewardFairness.tone === 'good'
                          ? 'bg-[#ECFDF5] text-[#047857]'
                          : rewardFairness.tone === 'fair'
                          ? 'bg-[#FFFBEB] text-[#B45309]'
                          : 'bg-[#FEF2F2] text-[#991B1B]'
                      }`}
                    >
                      {t(rewardFairness.label)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={reward}
                    onChange={(e) => setReward(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21]"
                  />
                  <p className="text-[11px] text-[#616161] mt-1">₮100/min · min ₮100</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                    {t('Max Responses')}
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={maxResponses}
                    onChange={(e) => setMaxResponses(Math.max(10, Number(e.target.value) || 10))}
                    className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21]"
                  />
                  <p className="text-[11px] text-[#616161] mt-1">{t('min 10 responses')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#4A4A4A]">{t('Est. Minutes')}</label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3F3F3] text-[#1A1A1A]">
                      <Zap className="w-3 h-3" />
                      {t('Auto')} ({estMinutes}m)
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={estMinutes}
                    onChange={(e) => setEstMinutes(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21]"
                  />
                  <p className="text-[11px] text-[#616161] mt-1">{t('shown to respondents')}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                    {t('Min Trust Level')}
                  </label>
                  <BrandSelect
                    value={String(trustLevel)}
                    onValueChange={(v) => setTrustLevel(Number(v) as 1 | 2 | 3 | 4 | 5)}
                    options={TRUST_LEVELS.map((lvl) => ({
                      value: String(lvl.level),
                      label: `${t('Level')} ${lvl.level} — ${t(lvl.label)}`,
                    }))}
                  />
                  <p className="text-[11px] text-[#616161] mt-1">~{pool.toLocaleString()} {t('eligible respondents')}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
                  {t('End Date')}
                </label>
                <div className="relative" ref={endDateRef}>
                  <button
                    type="button"
                    onClick={() => setIsEndDateOpen((o) => !o)}
                    className="w-full flex items-center gap-2 pl-9 pr-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm text-[#1A1A1A] font-normal hover:bg-white focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] transition-colors cursor-pointer text-left relative"
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616161]" />
                    {format(new Date(endDate), 'MMM d, yyyy')}
                  </button>

                  {isEndDateOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-white border border-[#EBEBEB] rounded-md z-20 p-3"
                      style={{ '--primary': '#FF3C21', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}
                    >
                      <CalendarUI
                        mode="single"
                        selected={new Date(endDate)}
                        onSelect={(date) => {
                          if (date) {
                            setEndDate(date.toISOString().slice(0, 10));
                            setIsEndDateOpen(false);
                          }
                        }}
                        disabled={{ before: new Date() }}
                        className="border-0 shadow-none p-0"
                      />
                    </div>
                  )}
                </div>
                <p className={`text-[11px] mt-1 flex items-center gap-1 ${bufferDays >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {t('Fills in')} ~{estDays}d · {bufferDays >= 0 ? `${bufferDays}d ${t('buffer')}` : t('not enough time')}
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D4D4D4] text-[#1A1A1A] focus:ring-[#FF3C21] accent-[#1A1A1A] cursor-pointer"
                />
                <div>
                  <div className="text-sm font-medium text-[#1A1A1A]">{t('Anonymous responses')}</div>
                  <p className="text-[11px] text-[#616161] mt-0.5">
                    {t('Respondent names are hidden. Age, gender & region are still included in your reports.')}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="bg-white rounded-md border border-[#EBEBEB] p-5">
            <h2 className="text-base font-medium text-[#1A1A1A] mb-4">{t('Estimated Cost')}</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#4A4A4A]">
                <span>{t('Respondent payouts')}</span>
                <span className="tabular-nums">{formatMnt(payout)}</span>
              </div>
              <div className="flex justify-between text-[#4A4A4A]">
                <span>{t('Platform fee')} ({PLATFORM_FEE.defaultPct}%)</span>
                <span className="tabular-nums">{formatMnt(platformFee)}</span>
              </div>
              <div className="border-t border-[#F3F3F3] pt-3 mt-1 flex justify-between items-baseline">
                <span className="font-medium text-[#1A1A1A]">{t('Total')}</span>
                <span className="font-semibold text-xl text-[#1A1A1A] tabular-nums">{formatMnt(totalCost)}</span>
              </div>
              <p className="text-[11px] text-[#616161] pt-0.5">
                {maxResponses} {t('responses')} × {formatMnt(reward)} + {t('fees')}
              </p>
            </div>

            <div className="mt-4 bg-white border border-[#F3F3F3] rounded-md p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-medium text-[#1A1A1A] mb-1">{t('Campaign looks healthy')}</div>
                  <div className="text-[#4A4A4A] leading-relaxed">
                    {t('Pool')}: ~{pool.toLocaleString()} {t('respondents at Level')} {trustLevel}+<br />
                    {t('Velocity')}: ~{estVelocity} {t('responses / day')}<br />
                    {t('Fill time')}: ~{estDays} {t('days to collect')} {maxResponses} {t('responses')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Questions */}
        <div>
          <h2 className="text-lg font-medium text-[#1A1A1A] mb-4">
            {t('Questions')} ({questions.length})
          </h2>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === questions.length - 1}
                    onChange={(patch) => updateQuestion(q.id, patch)}
                    onMove={(dir) => moveQuestion(q.id, dir)}
                    onRemove={() => removeQuestion(q.id)}
                    onAddOption={() => addOption(q.id)}
                    onUpdateOption={(i, v) => updateOption(q.id, i, v)}
                    onRemoveOption={(i) => removeOption(q.id, i)}
                    canRemove={questions.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={addQuestion}
            className="mt-4 w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-[#D4D4D4] bg-white hover:bg-white hover:border-[#FF3C21] transition-colors rounded-md text-[#1A1A1A] font-medium text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('Add Question')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<Question>) => void;
  onMove: (dir: 'up' | 'down') => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (idx: number, value: string) => void;
  onRemoveOption: (idx: number) => void;
}

function QuestionCard({
  question,
  index,
  isFirst,
  isLast,
  canRemove,
  onChange,
  onMove,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const showOptions = needsOptions(question.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-md border border-[#EBEBEB] overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F3F3F3] bg-white">
        <button
          {...listeners}
          className="text-[#616161] hover:text-[#1A1A1A] cursor-grab active:cursor-grabbing touch-none"
          title={t('Drag to reorder')}
          aria-label={t('Drag to reorder')}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F3F3] text-[#1A1A1A] text-xs font-medium">
          {index + 1}
        </div>
        <span className="text-sm font-medium text-[#1A1A1A]">
          {question.text.trim() || `${t('Question')} ${index + 1}`}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F3F3] text-[#4A4A4A] border border-[#EBEBEB]">
            {t(QUESTION_TYPE_LABEL[question.type])}
          </span>
          <button
            onClick={() => onMove('up')}
            disabled={isFirst}
            className="p-1.5 text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t('Move up')}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={isLast}
            className="p-1.5 text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t('Move down')}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            disabled={!canRemove}
            className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={t('Delete question')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
              {t('Question text')}
            </label>
            <input
              type="text"
              value={question.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder={t('Enter your question...')}
              className="w-full px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">
              {t('Type')}
            </label>
            <BrandSelect
              value={question.type}
              onValueChange={(v) => {
                const type = v as QuestionType;
                onChange({
                  type,
                  options: needsOptions(type) && question.options.length < 2 ? ['', ''] : question.options,
                });
              }}
              options={(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((k) => ({
                value: k,
                label: t(QUESTION_TYPE_LABEL[k]),
              }))}
            />
          </div>
        </div>

        {showOptions && (
          <div>
            <label className="block text-xs font-medium text-[#4A4A4A] mb-1.5">{t('Options')}</label>
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => onUpdateOption(i, e.target.value)}
                    placeholder={`${t('Option')} ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-white border border-[#EBEBEB] rounded-md text-sm focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161]"
                  />
                  <button
                    onClick={() => onRemoveOption(i)}
                    disabled={question.options.length <= 2}
                    className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={t('Remove option')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={onAddOption}
              className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] hover:text-[#000000] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('Add option')}
            </button>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="w-4 h-4 rounded border-[#D4D4D4] text-[#1A1A1A] focus:ring-[#FF3C21] accent-[#1A1A1A] cursor-pointer"
          />
          <span className="text-sm text-[#1A1A1A]">{t('Required question')}</span>
        </label>
      </div>
    </div>
  );
}
