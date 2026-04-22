import type { FeedSurvey, QuestionType } from '@/pages/survey-feed/survey-feed-data';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  helper?: string;
  required?: boolean;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'Scale';
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'Single Choice' | 'Multi Choice';
  options: string[];
}

export interface DateQuestion extends BaseQuestion {
  type: 'Date';
}

export interface MatrixQuestion extends BaseQuestion {
  type: 'Matrix';
  rows: string[];
  columns: string[];
}

export interface TextQuestion extends BaseQuestion {
  type: 'Short Text' | 'Long Text';
  placeholder?: string;
}

export interface RankingQuestion extends BaseQuestion {
  type: 'Ranking';
  options: string[];
}

export type Question =
  | ScaleQuestion
  | ChoiceQuestion
  | DateQuestion
  | MatrixQuestion
  | TextQuestion
  | RankingQuestion;

type Answer =
  | number
  | string
  | string[]
  | Record<string, string>
  | Date
  | undefined;

export type AnswerMap = Record<string, Answer>;

const SCALE_TEMPLATES = [
  'How satisfied are you with the overall experience?',
  'How likely are you to recommend this to a colleague?',
  'How clearly was the value communicated to you?',
  'How well does this fit your daily needs?',
];

const SINGLE_CHOICE_TEMPLATES: { prompt: string; options: string[] }[] = [
  {
    prompt: 'Which option best describes your current role?',
    options: ['Individual contributor', 'Team lead', 'Manager', 'Executive'],
  },
  {
    prompt: 'How often do you interact with this product?',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
  },
  {
    prompt: 'What matters most to you in this category?',
    options: ['Price', 'Quality', 'Convenience', 'Support'],
  },
];

const MULTI_CHOICE_TEMPLATES: { prompt: string; options: string[] }[] = [
  {
    prompt: 'Which of the following apply to you? (Select all that apply)',
    options: [
      'I use this weekly',
      'I have recommended it before',
      'I subscribe to updates',
      'I am an active community member',
    ],
  },
  {
    prompt: 'Which channels do you use to stay informed?',
    options: ['Email', 'Social media', 'News apps', 'Word of mouth'],
  },
];

const MATRIX_TEMPLATES: {
  prompt: string;
  rows: string[];
  columns: string[];
}[] = [
  {
    prompt: 'Rate each statement below.',
    rows: [
      'The service is reliable.',
      'Support is responsive.',
      'Pricing feels fair.',
    ],
    columns: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
  },
  {
    prompt: 'How would you rate the following aspects?',
    rows: ['Ease of use', 'Value for money', 'Design'],
    columns: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
  },
];

const TEXT_TEMPLATES: { prompt: string; placeholder: string }[] = [
  {
    prompt: 'In one sentence, what stood out most?',
    placeholder: 'Type your answer',
  },
  {
    prompt: 'What would you change if you could?',
    placeholder: 'Type your answer',
  },
];

const LONG_TEXT_TEMPLATES: { prompt: string; placeholder: string }[] = [
  {
    prompt: 'Tell us more about your experience.',
    placeholder: 'Share as much detail as you like',
  },
  {
    prompt: 'Describe a recent moment that shaped your opinion.',
    placeholder: 'Share as much detail as you like',
  },
];

const DATE_TEMPLATES = [
  'When did you last interact with this product?',
  'When do you expect to make a decision?',
  'When did you first hear about us?',
];

const RANKING_TEMPLATES: { prompt: string; options: string[] }[] = [
  {
    prompt: 'Rank the following items by importance',
    options: [
      'Speed / Convenience',
      'Price / Affordability',
      'Brand reputation',
      'Customer service',
    ],
  },
  {
    prompt: 'Order these channels from most to least useful',
    options: ['Email', 'SMS', 'Mobile push', 'In-app message'],
  },
  {
    prompt: 'Rank these features by how often you use them',
    options: [
      'Search',
      'Saved items',
      'Notifications',
      'Account settings',
    ],
  },
];

function pick<T>(list: T[], i: number): T {
  return list[i % list.length];
}

export function buildQuestions(survey: FeedSurvey): Question[] {
  const out: Question[] = [];
  let scaleI = 0;
  let singleI = 0;
  let multiI = 0;
  let matrixI = 0;
  let textI = 0;
  let longI = 0;
  let dateI = 0;
  let rankingI = 0;

  for (const group of survey.breakdown) {
    for (let i = 0; i < group.count; i++) {
      const idx = out.length;
      const id = `q-${survey.id}-${idx + 1}`;
      switch (group.type) {
        case 'Scale': {
          const prompt = pick(SCALE_TEMPLATES, scaleI++);
          out.push({
            id,
            type: 'Scale',
            prompt,
            helper: '1 = Not at all, 5 = Very much',
            min: 1,
            max: 5,
            minLabel: 'Not at all',
            maxLabel: 'Very much',
          });
          break;
        }
        case 'Single Choice': {
          const tpl = pick(SINGLE_CHOICE_TEMPLATES, singleI++);
          out.push({
            id,
            type: 'Single Choice',
            prompt: tpl.prompt,
            options: tpl.options,
          });
          break;
        }
        case 'Multi Choice': {
          const tpl = pick(MULTI_CHOICE_TEMPLATES, multiI++);
          out.push({
            id,
            type: 'Multi Choice',
            prompt: tpl.prompt,
            options: tpl.options,
          });
          break;
        }
        case 'Matrix': {
          const tpl = pick(MATRIX_TEMPLATES, matrixI++);
          out.push({
            id,
            type: 'Matrix',
            prompt: tpl.prompt,
            rows: tpl.rows,
            columns: tpl.columns,
          });
          break;
        }
        case 'Short Text': {
          const tpl = pick(TEXT_TEMPLATES, textI++);
          out.push({
            id,
            type: 'Short Text',
            prompt: tpl.prompt,
            placeholder: tpl.placeholder,
          });
          break;
        }
        case 'Long Text': {
          const tpl = pick(LONG_TEXT_TEMPLATES, longI++);
          out.push({
            id,
            type: 'Long Text',
            prompt: tpl.prompt,
            placeholder: tpl.placeholder,
          });
          break;
        }
        case 'Date': {
          out.push({
            id,
            type: 'Date',
            prompt: pick(DATE_TEMPLATES, dateI++),
          });
          break;
        }
        case 'Ranking': {
          const tpl = pick(RANKING_TEMPLATES, rankingI++);
          out.push({
            id,
            type: 'Ranking',
            prompt: tpl.prompt,
            helper: 'Drag to reorder by preference',
            options: tpl.options,
          });
          break;
        }
      }
    }
  }

  return out;
}

export function isAnswered(q: Question, value: Answer): boolean {
  if (value === undefined || value === null) return false;
  switch (q.type) {
    case 'Multi Choice':
      return Array.isArray(value) && value.length > 0;
    case 'Matrix': {
      if (typeof value !== 'object' || value instanceof Date) return false;
      const map = value as Record<string, string>;
      return q.rows.every((r) => !!map[r]);
    }
    case 'Short Text':
    case 'Long Text':
      return typeof value === 'string' && value.trim().length > 0;
    case 'Date':
      return value instanceof Date;
    case 'Scale':
      return typeof value === 'number';
    case 'Single Choice':
      return typeof value === 'string' && value.length > 0;
    case 'Ranking':
      return Array.isArray(value) && value.length === q.options.length;
  }
}
