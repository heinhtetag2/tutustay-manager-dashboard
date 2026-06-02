import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Portal } from '@/shared/ui/portal';
import {
  Pause,
  Play,
  XCircle,
  RotateCcw,
  Users,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Clock,
  AlertCircle,
  X,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  List,
  CheckCircle,
  ArrowUpRight,
  Info,
  LayoutDashboard,
  Building2,
  Ban,
  ShieldCheck,
} from 'lucide-react';
import { BrandSelect } from '@/shared/ui/brand-select';
import { findSurveyById, DEMO_SURVEYS, type Survey as SurveyRecord } from '@/pages/surveys/survey-data';

type QualityTier = 'High' | 'Medium' | 'Low';
type RewardStatus = 'Earned' | 'Pending' | 'Invalidated';

interface Response {
  id: string;
  respondent: string;
  quality: QualityTier;
  rewardStatus: RewardStatus;
  submittedLabel: string;
  answers: Record<string, string>;
}

interface QualityFactor {
  label: string;
  detail: string;
  passed: boolean;
}

type QuestionType = 'single' | 'rating' | 'text';

interface QuestionDef {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  /** 10-item deterministic cycle for demo distribution */
  pattern: string[];
  timeSec: number;
}

const QUALITY_FACTORS: QualityFactor[] = [
  { label: 'Response speed',   detail: 'Avg 12.4s/question — normal',            passed: true },
  { label: 'Straight-lining',  detail: 'No straight-lining detected',            passed: true },
  { label: 'Attention check',  detail: 'Passed all attention checks',            passed: true },
  { label: 'Position bias',    detail: 'Answer distribution looks natural',      passed: true },
  { label: 'Tab visibility',   detail: 'Stayed on tab throughout survey',        passed: true },
];

const QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    text: 'Which mobile banking app do you use most frequently?',
    type: 'single',
    options: ['TDB Digital', 'Khan Bank', 'Xac Bank', 'State Bank', 'Other'],
    pattern: ['TDB Digital', 'TDB Digital', 'TDB Digital', 'TDB Digital', 'Khan Bank', 'Khan Bank', 'Khan Bank', 'Xac Bank', 'State Bank', 'Other'],
    timeSec: 9,
  },
  {
    id: 'q2',
    text: 'How often do you make digital payments per week?',
    type: 'single',
    options: ['0 times', '1–5 times', '6–10 times', '11–20 times', '20+ times'],
    pattern: ['1–5 times', '1–5 times', '6–10 times', '6–10 times', '6–10 times', '6–10 times', '11–20 times', '11–20 times', '20+ times', '0 times'],
    timeSec: 13,
  },
  {
    id: 'q3',
    text: 'What is your primary reason for using digital payments?',
    type: 'single',
    options: ['No cash available', 'Convenience', 'Security', 'Discount offers', 'Other'],
    pattern: ['Convenience', 'Convenience', 'Convenience', 'No cash available', 'No cash available', 'No cash available', 'Security', 'Security', 'Discount offers', 'Other'],
    timeSec: 11,
  },
  {
    id: 'q4',
    text: 'Rate your overall satisfaction',
    type: 'rating',
    pattern: ['5', '5', '4', '4', '4', '4', '3', '3', '2', '1'],
    timeSec: 7,
  },
  {
    id: 'q5',
    text: 'Would you recommend this service to others?',
    type: 'single',
    options: ['Yes, definitely', 'Probably', 'Not sure', 'No'],
    pattern: ['Yes, definitely', 'Yes, definitely', 'Yes, definitely', 'Yes, definitely', 'Probably', 'Probably', 'Probably', 'Not sure', 'Not sure', 'No'],
    timeSec: 10,
  },
  {
    id: 'q6',
    text: 'What is the most useful feature?',
    type: 'single',
    options: ['Quick transfers', 'Bill payments', 'QR scan', 'International', 'Investment'],
    pattern: ['Quick transfers', 'Quick transfers', 'Quick transfers', 'Bill payments', 'Bill payments', 'QR scan', 'QR scan', 'International', 'Investment', 'Bill payments'],
    timeSec: 15,
  },
  {
    id: 'q7',
    text: 'Any suggestions for improvement?',
    type: 'text',
    pattern: [
      'Add more languages',
      'Better customer support',
      'Faster app performance',
      'Reduce transaction fees',
      'More payment options',
      'Add dark mode',
      '',
      '',
      'Support Apple Pay',
      '',
    ],
    timeSec: 23,
  },
];

function answerForResponse(questionIndex: number, responseIndex: number): string {
  const q = QUESTIONS[questionIndex];
  // Rotate pattern by question index so each question has a different distribution
  return q.pattern[(responseIndex + questionIndex * 3) % q.pattern.length];
}

interface Aggregation {
  type: QuestionType;
  total: number;
  distribution: Array<{ value: string; count: number; pct: number }>;
  avg?: number;
  texts?: string[];
}

function aggregateQuestion(q: QuestionDef, responses: Response[]): Aggregation {
  const total = responses.length;
  if (q.type === 'text') {
    const texts = responses.map((r) => r.answers[q.id]).filter((s) => s && s.trim().length > 0) as string[];
    return { type: 'text', total, distribution: [], texts };
  }
  const counts = new Map<string, number>();
  responses.forEach((r) => {
    const a = r.answers[q.id];
    if (a != null && a !== '') counts.set(a, (counts.get(a) ?? 0) + 1);
  });
  if (q.type === 'rating') {
    const sum = responses.reduce((acc, r) => acc + Number(r.answers[q.id] ?? 0), 0);
    const avg = total > 0 ? sum / total : 0;
    const distribution = ['5', '4', '3', '2', '1'].map((v) => {
      const count = counts.get(v) ?? 0;
      return { value: v, count, pct: total > 0 ? (count / total) * 100 : 0 };
    });
    return { type: 'rating', total, distribution, avg };
  }
  const distribution = (q.options ?? []).map((opt) => {
    const count = counts.get(opt) ?? 0;
    return { value: opt, count, pct: total > 0 ? (count / total) * 100 : 0 };
  });
  return { type: 'single', total, distribution };
}

function qualityScoreFor(tier: QualityTier) {
  return tier === 'High' ? 83 : tier === 'Medium' ? 62 : 28;
}

function multiplierFor(score: number) {
  if (score >= 90) return 1.2;
  if (score >= 85) return 1.1;
  if (score >= 80) return 1.0;
  if (score >= 75) return 0.9;
  return 0.8;
}

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s}s`;
}

const FIRST_NAMES = ['Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia', 'Ethan', 'Ava', 'Noah', 'Isabella', 'Liam', 'Mia', 'Lucas', 'Charlotte', 'Oliver', 'Amelia', 'Elijah', 'Harper', 'Benjamin'];
const LAST_NAMES  = ['Johnson', 'Chen', 'Wilson', 'Park', 'Martinez', 'Anderson', 'Brown', 'Garcia', 'Rodriguez', 'Lee', 'Kim', 'Nguyen', 'Patel', 'Singh', 'Smith', 'Taylor', 'Davies', 'Cohen', 'Yamamoto', 'O\'Connor'];
const QUALITY_CYCLE: QualityTier[] = ['High', 'High', 'High', 'High', 'Medium', 'High', 'High', 'Medium', 'High', 'Low'];
const STATUS_FOR_QUALITY: Record<QualityTier, RewardStatus> = {
  High: 'Earned',
  Medium: 'Pending',
  Low: 'Invalidated',
};

function submittedLabel(index: number): string {
  if (index === 0) return 'less than a minute ago';
  if (index === 1) return 'about 1 hour ago';
  if (index < 24) return `about ${index} hours ago`;
  const days = Math.floor(index / 24);
  return days === 1 ? 'about 1 day ago' : `${days} days ago`;
}

function generateResponses(count: number): Response[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last  = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    const quality = QUALITY_CYCLE[i % QUALITY_CYCLE.length];
    const answers: Record<string, string> = {};
    QUESTIONS.forEach((q, qi) => {
      answers[q.id] = answerForResponse(qi, i);
    });
    return {
      id: `r${i + 1}`,
      respondent: `${first} ${last}`,
      quality,
      rewardStatus: STATUS_FOR_QUALITY[quality],
      submittedLabel: submittedLabel(i),
      answers,
    };
  });
}


function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(current);
  pages.add(current - 1);
  pages.add(current + 1);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (current >= total - 2) {
    pages.add(total - 2);
    pages.add(total - 1);
  }

  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis');
    result.push(p);
    prev = p;
  }
  return result;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatMnt(n: number) {
  return `${n.toLocaleString('en-US')}`;
}

function qualityBadge(q: QualityTier) {
  switch (q) {
    case 'High':   return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Medium': return 'bg-[var(--warning-tint)] text-[var(--warning)]';
    case 'Low':    return 'bg-[var(--danger-tint)] text-[var(--danger-deep)]';
  }
}

function rewardStatusDisplay(s: RewardStatus) {
  switch (s) {
    case 'Earned':
      return { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Earned', className: 'text-[var(--success)]' };
    case 'Pending':
      return { icon: <Clock className="w-4 h-4" />, label: 'Pending', className: 'text-[var(--warning)]' };
    case 'Invalidated':
      return { icon: <AlertCircle className="w-4 h-4" />, label: 'Invalidated', className: 'text-[var(--danger-strong)]' };
  }
}

type DetailStatus = 'Active' | 'Paused' | 'Rejected';

interface SurveyDetailData {
  id: string;
  title: string;
  status: DetailStatus;
  category: string;
  questionCount: number;
  estMinutes: number;
  responsesCurrent: number;
  responsesTarget: number;
  completionRate: number;
  avgQuality: number;
  budgetSpent: number;
  rewardPerResponse: number;
  trustLevel: 1 | 2 | 3 | 4 | 5;
  anonymous: boolean;
  createdAt: string;
  createdLabel: string;
  endsLabel: string;
  endDate: string;
  description: string;
  companyId: string;
  companyName: string;
}

function buildInitialSurvey(id: string | undefined): SurveyDetailData {
  const source: SurveyRecord = findSurveyById(id) ?? DEMO_SURVEYS[0];
  const status: DetailStatus =
    source.status === 'Paused' ? 'Paused'
    : source.status === 'Rejected' ? 'Rejected'
    : 'Active';
  return {
    id: source.id,
    title: source.title,
    status,
    category: source.category,
    questionCount: QUESTIONS.length,
    estMinutes: source.lengthMinutes,
    responsesCurrent: source.responsesCurrent,
    responsesTarget: source.responsesTarget,
    completionRate: source.completionRate,
    avgQuality: source.avgQuality,
    budgetSpent: source.rewardMnt * source.responsesCurrent,
    rewardPerResponse: source.rewardMnt,
    trustLevel: source.trustLevel,
    anonymous: source.anonymous,
    createdAt: source.createdAt,
    createdLabel: source.createdLabel,
    endsLabel: source.endsLabel,
    endDate: source.endDate,
    description: source.description,
    companyId: source.companyId,
    companyName: source.companyName,
  };
}

export default function SurveyDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<SurveyDetailData>(() => buildInitialSurvey(id));

  const allResponses = useMemo(
    () => generateResponses(survey.responsesCurrent),
    [survey.responsesCurrent],
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isAnswersOpen, setIsAnswersOpen] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'responses'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<QualityTier | 'All'>('All');
  const [rewardFilter, setRewardFilter] = useState<RewardStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredResponses = allResponses.filter((r) => {
    if (qualityFilter !== 'All' && r.quality !== qualityFilter) return false;
    if (rewardFilter !== 'All' && r.rewardStatus !== rewardFilter) return false;
    if (searchQuery && !r.respondent.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * pageSize;
  const pageRows = filteredResponses.slice(pageStart, pageStart + pageSize);

  const hasActiveFilters = searchQuery !== '' || qualityFilter !== 'All' || rewardFilter !== 'All';
  const clearFilters = () => {
    setSearchQuery('');
    setQualityFilter('All');
    setRewardFilter('All');
    setCurrentPage(1);
  };

  const handleExportSummaryCsv = () => {
    const header = ['Question #', 'Question', 'Type', 'Answer', 'Count', 'Percentage'];
    const rows: string[][] = [header];
    QUESTIONS.forEach((q, i) => {
      const agg = aggregateQuestion(q, allResponses);
      const typeLabel = q.type === 'rating' ? 'Rating' : q.type === 'text' ? 'Short Text' : 'Single Choice';
      const qNum = String(i + 1);
      if (agg.type === 'rating') {
        rows.push([qNum, q.text, typeLabel, 'Average', (agg.avg ?? 0).toFixed(2), '']);
        agg.distribution.forEach((d) => {
          rows.push([qNum, q.text, typeLabel, `${d.value} stars`, String(d.count), `${d.pct.toFixed(1)}%`]);
        });
      } else if (agg.type === 'text') {
        const texts = agg.texts ?? [];
        if (texts.length === 0) {
          rows.push([qNum, q.text, typeLabel, '(no responses)', '0', '']);
        } else {
          texts.forEach((txt) => {
            rows.push([qNum, q.text, typeLabel, txt, '1', '']);
          });
        }
      } else {
        agg.distribution.forEach((d) => {
          rows.push([qNum, q.text, typeLabel, d.value, String(d.count), `${d.pct.toFixed(1)}%`]);
        });
      }
    });
    const slug = survey.title.toLowerCase().replace(/\s+/g, '-');
    downloadCsv(`${slug}-question-summary.csv`, rows);
  };

  const handleExportCsv = () => {
    const header = [
      'Respondent',
      'Quality',
      'Reward Status',
      'Submitted',
      ...QUESTIONS.map((q) => q.text),
    ];
    const rows = [
      header,
      ...filteredResponses.map((r) => [
        r.respondent,
        r.quality,
        r.rewardStatus,
        r.submittedLabel,
        ...QUESTIONS.map((q) => r.answers[q.id] ?? ''),
      ]),
    ];
    const slug = survey.title.toLowerCase().replace(/\s+/g, '-');
    downloadCsv(`${slug}-responses.csv`, rows);
  };

  const pct = Math.round((survey.responsesCurrent / survey.responsesTarget) * 100);
  const spotsRemaining = survey.responsesTarget - survey.responsesCurrent;
  const isActive = survey.status === 'Active';
  const isRejected = survey.status === 'Rejected';

  const togglePause = () => {
    setSurvey((s) => ({ ...s, status: s.status === 'Active' ? 'Paused' : 'Active' }));
  };

  const handleReject = () => {
    setSurvey((s) => ({ ...s, status: 'Rejected' }));
    setIsDeleteOpen(false);
  };

  const handleReinstate = () => {
    setSurvey((s) => ({ ...s, status: 'Active' }));
  };

  const statusBadge =
    survey.status === 'Active'
      ? 'bg-[var(--success-tint)] text-[var(--success)]'
      : survey.status === 'Paused'
        ? 'bg-[var(--warning-tint)] text-[var(--warning)]'
        : 'bg-[var(--danger-tint)] text-[var(--danger)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)]"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-2">
        <button
          onClick={() => navigate('/surveys')}
          className="font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {t('Surveys')}
        </button>
        <span className="text-[var(--border-strong)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">{t(survey.title)}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t(survey.title)}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusBadge}`}>
              {t(survey.status)}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => navigate(`/companies/${survey.companyId.toLowerCase()}`)}
              className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              {survey.companyName}
            </button>
            <span className="text-[var(--border-strong)]">·</span>
            <span>{t(survey.category)}</span>
            <span className="text-[var(--border-strong)]">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              {t('Level')} {survey.trustLevel}+
            </span>
            <span className="text-[var(--border-strong)]">·</span>
            <span>{survey.questionCount} {t('Questions')}</span>
            <span className="text-[var(--border-strong)]">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              {survey.estMinutes} {t('Min')}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          {isRejected ? (
            <button
              onClick={handleReinstate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors shadow-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {t('Reinstate')}
            </button>
          ) : (
            <>
              {isActive ? (
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--warning-border)] rounded-md text-sm font-medium text-[var(--warning)] bg-[var(--warning-tint)] hover:bg-[var(--warning-tint)] transition-colors shadow-none cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  {t('Pause')}
                </button>
              ) : (
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--success-tint-2)] rounded-md text-sm font-medium text-[var(--success)] bg-[var(--success-tint)] hover:bg-[var(--success-tint)] transition-colors shadow-none cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  {t('Resume')}
                </button>
              )}
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--danger-border)] rounded-md text-sm font-medium text-[var(--danger)] bg-white hover:bg-[var(--danger-tint)] transition-colors shadow-none cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                {t('Reject')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border-default)] mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {t('Overview')}
          {activeTab === 'overview' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[var(--brand-primary)] rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'responses' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('Responses')} <span className="text-[var(--text-secondary)] font-normal tabular-nums">({allResponses.length})</span>
          {activeTab === 'responses' && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[var(--brand-primary)] rounded-full" />}
        </button>
      </div>

      {activeTab === 'overview' && (<>
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          iconTone="brand"
          label={t('Responses')}
          value={`${survey.responsesCurrent} / ${survey.responsesTarget}`}
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconTone="green"
          label={t('Completion Rate')}
          value={`${survey.completionRate}%`}
        />
        <KpiCard
          icon={<BarChart3 className="w-5 h-5" />}
          iconTone="amber"
          label={t('Avg Quality')}
          value={survey.avgQuality.toFixed(1)}
        />
        <KpiCard
          icon={<DollarSign className="w-5 h-5" />}
          iconTone="blue"
          label={t('Budget Spent')}
          value={`${(survey.budgetSpent / 1000).toFixed(0)}K`}
        />
      </div>

      {/* Progress + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-6">
        {/* Response Progress */}
        <div className="bg-white rounded-md border border-[var(--border-default)] p-5">
          <h2 className="text-base font-medium text-[var(--text-primary)] mb-4">{t('Response Progress')}</h2>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-tertiary)] tabular-nums">
              {survey.responsesCurrent} {t('collected')}
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand-primary)] rounded-full transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {spotsRemaining} {t('spots remaining')}
          </p>

          <div className="mt-5 pt-4 border-t border-[var(--surface-subtle)]">
            <div className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              {t('Description')}
            </div>
            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{t(survey.description)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-md border border-[var(--border-default)] p-5">
          <h2 className="text-base font-medium text-[var(--text-primary)] mb-4">{t('Details')}</h2>

          <dl className="space-y-3 text-sm">
            <DetailRow label={t('Reward per response')} value={formatMnt(survey.rewardPerResponse)} />
            <DetailRow label={t('Trust level required')} value={`${t('Level')} ${survey.trustLevel}+`} />
            <DetailRow label={t('Anonymous')} value={survey.anonymous ? t('Yes') : t('No')} />
            <DetailRow
              label={t('Created')}
              value={
                <>
                  {format(new Date(survey.createdAt), 'MMM d, yyyy')}{' '}
                  <span className="text-[var(--text-secondary)] font-normal">({t(survey.createdLabel)})</span>
                </>
              }
            />
            <DetailRow
              label={t('Ends')}
              value={
                <>
                  {format(new Date(survey.endDate), 'MMM d, yyyy')}{' '}
                  <span className="text-[var(--text-secondary)] font-normal">({t(survey.endsLabel)})</span>
                </>
              }
            />
          </dl>
        </div>
      </div>

      {/* Question Summary */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden mb-6">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--surface-subtle)]">
          <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Question Summary')}</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--text-secondary)]">
              {t('Based on')} {allResponses.length} {t('responses')}
            </span>
            <button
              onClick={handleExportSummaryCsv}
              disabled={allResponses.length === 0}
              className="flex items-center gap-2 h-8 px-3 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('Export CSV')}
            </button>
          </div>
        </div>
        {QUESTIONS.map((q, i) => (
          <QuestionSummaryRow
            key={q.id}
            question={q}
            index={i}
            aggregation={aggregateQuestion(q, allResponses)}
            isLast={i === QUESTIONS.length - 1}
          />
        ))}
      </div>

      {/* Recent Responses */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
          <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Recent Responses')}</h2>
          <button
            onClick={() => setActiveTab('responses')}
            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-base-sand-90)] transition-colors cursor-pointer"
          >
            {t('View all')} →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium">
                <th className="px-6 py-4 font-medium">{t('Respondent')}</th>
                <th className="px-6 py-4 font-medium">{t('Quality')}</th>
                <th className="px-6 py-4 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {t('Reward Status')}
                      <span title={t('Auto-assigned by quality score — ≥80 instant, 50–79 held 24h, <50 invalidated')} className="inline-flex cursor-help">
                        <Info className="w-3.5 h-3.5 text-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-colors" />
                      </span>
                    </span>
                  </th>
                <th className="px-6 py-4 font-medium">{t('Submitted')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {allResponses.slice(0, 6).map((r) => {
                const rs = rewardStatusDisplay(r.rewardStatus);
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-white transition-colors cursor-pointer"
                    onClick={() => setSelectedResponse(r)}
                  >
                    <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{r.respondent}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${qualityBadge(r.quality)}`}>
                        {t(r.quality)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${rs.className}`}>
                        {rs.icon}
                        {t(rs.label)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{t(r.submittedLabel)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>)}

      {activeTab === 'responses' && (
        <div>
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={t('Search by respondent...')}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
              />
            </div>

            <BrandSelect
              value={qualityFilter}
              onValueChange={(v) => { setQualityFilter(v as QualityTier | 'All'); setCurrentPage(1); }}
              leftIcon={<List />}
              className="sm:w-auto"
              options={[
                { value: 'All',    label: t('All Quality') },
                { value: 'High',   label: t('High') },
                { value: 'Medium', label: t('Medium') },
                { value: 'Low',    label: t('Low') },
              ]}
            />

            <BrandSelect
              value={rewardFilter}
              onValueChange={(v) => { setRewardFilter(v as RewardStatus | 'All'); setCurrentPage(1); }}
              leftIcon={<CheckCircle />}
              className="sm:w-auto"
              options={[
                { value: 'All',         label: t('All Reward Statuses') },
                { value: 'Earned',      label: t('Earned') },
                { value: 'Pending',     label: t('Pending') },
                { value: 'Invalidated', label: t('Invalidated') },
              ]}
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

            <div className="ml-auto">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors bg-white shadow-none cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t('Export CSV')}
              </button>
            </div>
          </div>

          {/* Full table */}
          <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium">
                    <th className="px-6 py-4 font-medium">{t('Respondent')}</th>
                    <th className="px-6 py-4 font-medium">{t('Quality')}</th>
                    <th className="px-6 py-4 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {t('Reward Status')}
                      <span title={t('Auto-assigned by quality score — ≥80 instant, 50–79 held 24h, <50 invalidated')} className="inline-flex cursor-help">
                        <Info className="w-3.5 h-3.5 text-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-colors" />
                      </span>
                    </span>
                  </th>
                    <th className="px-6 py-4 font-medium">{t('Submitted')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-subtle)]">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                        {t('No responses match these filters.')}
                      </td>
                    </tr>
                  ) : pageRows.map((r) => {
                    const rs = rewardStatusDisplay(r.rewardStatus);
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-white transition-colors cursor-pointer"
                        onClick={() => setSelectedResponse(r)}
                      >
                        <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{r.respondent}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${qualityBadge(r.quality)}`}>
                            {t(r.quality)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${rs.className}`}>
                            {rs.icon}
                            {t(rs.label)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">{t(r.submittedLabel)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
              <span className="text-sm text-[var(--text-secondary)]">
                {t('Showing')} {filteredResponses.length === 0 ? 0 : pageStart + 1} {t('to')} {Math.min(pageStart + pageSize, filteredResponses.length)} {t('of')} {filteredResponses.length} {t('responses')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('Previous')}
                </button>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-1 text-sm text-[var(--text-secondary)]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm border rounded-md tabular-nums transition-colors ${
                        p === page
                          ? 'font-medium border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white cursor-default'
                          : 'font-normal border-[var(--border-default)] bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] cursor-pointer'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Detail side sheet */}
      <Portal>
      <AnimatePresence>
        {selectedResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--text-primary)]/30 z-50 flex justify-end"
            onClick={() => setSelectedResponse(null)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-full max-w-md bg-white h-full overflow-y-auto border-l border-[var(--border-default)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Response Detail')}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{selectedResponse.respondent}</p>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Quality Score */}
                {(() => {
                  const score = qualityScoreFor(selectedResponse.quality);
                  const mult = multiplierFor(score);
                  const baseReward = 5_000;
                  const earned = Math.round(baseReward * mult);
                  const totalSec = QUESTIONS.reduce((acc, q) => acc + q.timeSec, 0);
                  return (
                    <div className="bg-white rounded-md border border-[var(--border-default)] p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Quality Score')}</h3>
                        <span className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums leading-none">{score}</span>
                      </div>
                      <div className="h-2 bg-[var(--surface-subtle)] rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${score >= 80 ? 'bg-[var(--success)]' : score >= 50 ? 'bg-[var(--warning)]' : 'bg-[var(--danger-strong)]'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <StatTile icon={<Clock className="w-4 h-4" />} tone="neutral" value={formatDuration(totalSec)} label={t('Time taken')} />
                        <StatTile icon={<BarChart3 className="w-4 h-4" />} tone="brand"   value={`×${mult.toFixed(1)}`} label={t('Multiplier')} />
                        <StatTile icon={<DollarSign className="w-4 h-4" />} tone="amber" value={`${earned.toLocaleString()}`} label={t('Reward')} />
                      </div>
                    </div>
                  );
                })()}

                {/* Quality Factors */}
                <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[var(--surface-subtle)] bg-white">
                    <h3 className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      {t('Quality Factors')}
                    </h3>
                  </div>
                  {QUALITY_FACTORS.map((f, i) => (
                    <div
                      key={f.label}
                      className={`flex items-start gap-3 px-5 py-4 ${i < QUALITY_FACTORS.length - 1 ? 'border-b border-[var(--surface-subtle)]' : ''}`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" strokeWidth={1.75} />
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{t(f.label)}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t(f.detail)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Answers */}
                <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden">
                  <button
                    onClick={() => setIsAnswersOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-5 py-3 border-b border-[var(--surface-subtle)] bg-white cursor-pointer"
                  >
                    <h3 className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      {t('Answers')} ({QUESTIONS.length} {t('Questions')})
                    </h3>
                    {isAnswersOpen
                      ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                      : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                  </button>
                  {isAnswersOpen && (
                    <div>
                      {QUESTIONS.map((q, i) => {
                        const answer = selectedResponse.answers[q.id] ?? '';
                        return (
                          <div
                            key={q.id}
                            className={`p-5 ${i < QUESTIONS.length - 1 ? 'border-b border-[var(--surface-subtle)]' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[var(--surface-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-[var(--text-primary)] mb-2 leading-relaxed">{t(q.text)}</div>
                                <div className="flex items-start gap-2 text-sm text-[var(--text-tertiary)]">
                                  <MessageSquare className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                                  <span>{answer || <span className="italic text-[var(--text-secondary)]">{t('(no answer)')}</span>}</span>
                                </div>
                                <div className="text-[11px] text-[var(--text-secondary)] mt-1 tabular-nums">{q.timeSec}s</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>

      {/* Delete Confirmation Modal */}
      <Portal>
      <AnimatePresence>
        {isDeleteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
            onClick={() => setIsDeleteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
                <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Ban className="w-5 h-5 text-[var(--danger-strong)]" />
                  {t('Reject survey?')}
                </h2>
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-white">
                <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
                  {t('The survey will be marked as rejected and removed from respondent feeds. The company will be notified.')}
                </p>
                <div className="mt-3 p-3 bg-white border border-[var(--border-default)] rounded-md">
                  <div className="font-medium text-[var(--text-primary)] text-sm">{t(survey.title)}</div>
                  <div className="text-[var(--text-secondary)] text-xs mt-1">
                    {survey.companyName} · {t(survey.category)} · {survey.responsesCurrent}/{survey.responsesTarget} {t('responses')}
                  </div>
                </div>
                <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {t('You can reinstate this later from the Rejected tab.')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)] bg-white shrink-0">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--danger-strong)] rounded-md hover:bg-[var(--danger)] transition-colors shadow-none cursor-pointer"
                >
                  {t('Reject survey')}
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

interface KpiCardProps {
  icon: React.ReactNode;
  iconTone: 'brand' | 'green' | 'amber' | 'blue';
  label: string;
  value: string;
}

function KpiCard({ icon, iconTone, label, value }: KpiCardProps) {
  const tones: Record<KpiCardProps['iconTone'], string> = {
    brand: 'bg-[var(--surface-subtle)] text-[var(--text-primary)]',
    green: 'bg-[var(--success-tint)] text-[var(--success)]',
    amber: 'bg-[var(--warning-tint)] text-[var(--warning)]',
    blue:  'bg-[var(--brand-tint)] text-[var(--brand-primary-hover)]',
  };
  return (
    <div className="bg-white rounded-md border border-[var(--border-default)] p-5">
      <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${tones[iconTone]}`}>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-1 tabular-nums">{value}</div>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

interface QuestionSummaryRowProps {
  question: QuestionDef;
  index: number;
  aggregation: Aggregation;
  isLast: boolean;
}

function QuestionSummaryRow({ question, index, aggregation, isLast }: QuestionSummaryRowProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textSearch, setTextSearch] = useState('');
  const qTypeLabel =
    question.type === 'rating' ? 'Rating' : question.type === 'text' ? 'Short Text' : 'Single Choice';

  const allTexts = aggregation.texts ?? [];
  const filteredTexts = textSearch
    ? allTexts.filter((txt) => txt.toLowerCase().includes(textSearch.toLowerCase()))
    : allTexts;

  return (
    <div className={!isLast ? 'border-b border-[var(--surface-subtle)]' : ''}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 text-left hover:bg-white transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[var(--surface-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[var(--text-secondary)] mb-0.5">{t(qTypeLabel)}</div>
            <div className="font-medium text-[var(--text-primary)]">{t(question.text)}</div>
          </div>
          {isOpen
            ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-1" />
            : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-1" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 ml-9">
              {aggregation.type === 'rating' && (
                <>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-semibold text-[var(--text-primary)] tabular-nums leading-none">
                      {aggregation.avg?.toFixed(1) ?? '—'}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">/ 5 {t('average')}</span>
                  </div>
                  <div className="space-y-2">
                    {aggregation.distribution.map((item) => (
                      <DistributionRow
                        key={item.value}
                        label={`${item.value} ★`}
                        count={item.count}
                        pct={item.pct}
                      />
                    ))}
                  </div>
                </>
              )}

              {aggregation.type === 'single' && (
                <div className="space-y-2">
                  {aggregation.distribution.map((item) => (
                    <DistributionRow
                      key={item.value}
                      label={item.value}
                      count={item.count}
                      pct={item.pct}
                    />
                  ))}
                </div>
              )}

              {aggregation.type === 'text' && (
                <div className="space-y-2">
                  {allTexts.slice(0, 3).map((text, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[var(--surface-subtle)] rounded-md px-3 py-2 text-sm text-[var(--text-tertiary)] italic"
                    >
                      “{text}”
                    </div>
                  ))}
                  {allTexts.length > 3 && (
                    <button
                      onClick={() => setIsTextModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)] hover:text-[var(--color-base-sand-90)] transition-colors cursor-pointer"
                    >
                      + {allTexts.length - 3} {t('more written responses')}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {allTexts.length === 0 && (
                    <div className="text-xs text-[var(--text-secondary)]">{t('No written responses yet.')}</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All text responses modal */}
      <Portal>
      <AnimatePresence>
        {isTextModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
            onClick={() => setIsTextModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-md w-full max-w-2xl border border-[var(--surface-subtle)] flex flex-col max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs text-[var(--text-secondary)]">
                    <span>{t(qTypeLabel)}</span>
                    <span className="text-[var(--border-strong)]">·</span>
                    <span className="tabular-nums">{allTexts.length} {t('responses')}</span>
                  </div>
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">{t(question.text)}</h2>
                </div>
                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-3 border-b border-[var(--surface-subtle)] shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                    placeholder={t('Search within answers...')}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {filteredTexts.length === 0 ? (
                  <div className="text-sm text-[var(--text-secondary)] text-center py-8">
                    {t('No answers match your search.')}
                  </div>
                ) : (
                  filteredTexts.map((text, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[var(--surface-subtle)] rounded-md px-3 py-2 text-sm text-[var(--text-tertiary)] italic"
                    >
                      “{text}”
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-3 border-t border-[var(--surface-subtle)] bg-white shrink-0 flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                  {textSearch
                    ? `${filteredTexts.length} ${t('of')} ${allTexts.length}`
                    : `${allTexts.length} ${t('total responses')}`}
                </span>
                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer"
                >
                  {t('Close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
}

interface DistributionRowProps {
  label: string;
  count: number;
  pct: number;
}

function DistributionRow({ label, count, pct }: DistributionRowProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1 gap-4">
        <span className="text-sm text-[var(--text-primary)] min-w-0 truncate">{label}</span>
        <span className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
          {count} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-1.5 bg-[var(--surface-subtle)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--brand-primary)] rounded-full transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface StatTileProps {
  icon: React.ReactNode;
  tone: 'neutral' | 'brand' | 'amber';
  value: string;
  label: string;
}

function StatTile({ icon, tone, value, label }: StatTileProps) {
  const tones: Record<StatTileProps['tone'], string> = {
    neutral: 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]',
    brand:   'bg-[var(--surface-subtle)] text-[var(--text-primary)]',
    amber:   'bg-[var(--warning-tint)] text-[var(--warning)]',
  };
  return (
    <div className="flex flex-col items-center justify-center p-3 border border-[var(--surface-subtle)] rounded-md text-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${tones[tone]}`}>
        {icon}
      </div>
      <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{value}</div>
      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{label}</div>
    </div>
  );
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-[var(--text-primary)] font-medium text-right">{value}</dd>
    </div>
  );
}
