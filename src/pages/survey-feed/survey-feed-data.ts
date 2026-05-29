export type SurveyCategory = 'Social' | 'Other' | 'Product' | 'HR' | 'Brand' | 'Finance';

export type QuestionType =
  | 'Scale'
  | 'Multi Choice'
  | 'Single Choice'
  | 'Date'
  | 'Matrix'
  | 'Short Text'
  | 'Long Text'
  | 'Ranking';

export interface QuestionBreakdown {
  type: QuestionType;
  count: number;
}

export interface FeedSurvey {
  id: string;
  companyName: string;
  companyInitials: string;
  companyColor: string;
  title: string;
  description: string;
  matchPercent: number;
  rewardMnt: number;
  durationMin: number;
  spotsLeft: number;
  spotsTotal: number;
  category: SurveyCategory;
  requiredTrustLevel: number;
  breakdown: QuestionBreakdown[];
}

export const USER_TRUST_LEVEL = 2;

export function totalQuestions(s: FeedSurvey): number {
  return s.breakdown.reduce((sum, b) => sum + b.count, 0);
}

export const DEMO_FEED_SURVEYS: FeedSurvey[] = [
  {
    id: 'fd-001',
    companyName: 'MCS Group',
    companyInitials: 'MC',
    companyColor: 'var(--success)',
    title: 'Social Responsibility Survey',
    description:
      'This survey aims to understand your opinions on corporate social responsibility. All responses are kept confidential.',
    matchPercent: 100,
    rewardMnt: 15_000,
    durationMin: 12,
    spotsLeft: 47,
    spotsTotal: 100,
    category: 'Social',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Scale', count: 1 },
      { type: 'Single Choice', count: 1 },
      { type: 'Ranking', count: 1 },
      { type: 'Multi Choice', count: 1 },
      { type: 'Date', count: 2 },
      { type: 'Matrix', count: 1 },
    ],
  },
  {
    id: 'fd-002',
    companyName: 'Mongolia Telecom',
    companyInitials: 'MT',
    companyColor: 'var(--brand-primary-hover)',
    title: 'Digital Transformation Survey',
    description:
      'Help us understand how digital services shape your daily life. Your input guides product direction across the country.',
    matchPercent: 96,
    rewardMnt: 1_000,
    durationMin: 13,
    spotsLeft: 56,
    spotsTotal: 60,
    category: 'Other',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 3 },
      { type: 'Short Text', count: 2 },
    ],
  },
  {
    id: 'fd-003',
    companyName: 'Khan Bank',
    companyInitials: 'KB',
    companyColor: 'var(--warning)',
    title: 'Brand Awareness Survey',
    description:
      'Share how you perceive our brand and how it compares to others in the market. All responses are anonymous.',
    matchPercent: 95,
    rewardMnt: 15_000,
    durationMin: 17,
    spotsLeft: 101,
    spotsTotal: 200,
    category: 'Brand',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 3 },
      { type: 'Multi Choice', count: 2 },
      { type: 'Single Choice', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-004',
    companyName: 'Golomt Bank',
    companyInitials: 'GB',
    companyColor: 'var(--danger)',
    title: 'New Product Feedback Survey',
    description:
      'Tell us about your experience with our newest product. Your feedback directly shapes the next iteration.',
    matchPercent: 94,
    rewardMnt: 15_000,
    durationMin: 6,
    spotsLeft: 13,
    spotsTotal: 150,
    category: 'HR',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 2 },
      { type: 'Long Text', count: 1 },
    ],
  },
  {
    id: 'fd-005',
    companyName: 'Tenger Insurance',
    companyInitials: 'TI',
    companyColor: 'var(--accent-violet)',
    title: 'Organizational Culture Survey',
    description:
      'This survey collects perspectives on workplace culture and values. All answers are kept strictly confidential.',
    matchPercent: 89,
    rewardMnt: 10_000,
    durationMin: 16,
    spotsLeft: 74,
    spotsTotal: 120,
    category: 'Brand',
    requiredTrustLevel: 3,
    breakdown: [
      { type: 'Scale', count: 4 },
      { type: 'Matrix', count: 2 },
      { type: 'Long Text', count: 1 },
    ],
  },
  {
    id: 'fd-006',
    companyName: 'Tenger Insurance',
    companyInitials: 'TI',
    companyColor: 'var(--accent-violet)',
    title: 'Service Quality Assessment',
    description:
      'Rate your recent experience with our services. Your feedback helps us improve across every touchpoint.',
    matchPercent: 87,
    rewardMnt: 10_000,
    durationMin: 14,
    spotsLeft: 210,
    spotsTotal: 250,
    category: 'Other',
    requiredTrustLevel: 3,
    breakdown: [
      { type: 'Scale', count: 3 },
      { type: 'Single Choice', count: 3 },
      { type: 'Short Text', count: 2 },
    ],
  },
  {
    id: 'fd-007',
    companyName: 'Golomt Bank',
    companyInitials: 'GB',
    companyColor: 'var(--danger)',
    title: 'Service Quality Assessment',
    description:
      'A short pulse on how we are serving you. Your honest input lets us fix issues quickly.',
    matchPercent: 86,
    rewardMnt: 2_000,
    durationMin: 10,
    spotsLeft: 48,
    spotsTotal: 80,
    category: 'Other',
    requiredTrustLevel: 3,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-008',
    companyName: 'MCS Group',
    companyInitials: 'MC',
    companyColor: 'var(--success)',
    title: 'Employee Satisfaction Survey',
    description:
      'Share how you feel about your work environment, management, and growth opportunities. Responses are anonymous.',
    matchPercent: 85,
    rewardMnt: 15_000,
    durationMin: 18,
    spotsLeft: 96,
    spotsTotal: 100,
    category: 'HR',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 4 },
      { type: 'Matrix', count: 2 },
      { type: 'Multi Choice', count: 1 },
      { type: 'Long Text', count: 1 },
    ],
  },
  {
    id: 'fd-009',
    companyName: 'Mongolia Telecom',
    companyInitials: 'MT',
    companyColor: 'var(--brand-primary-hover)',
    title: 'Service Quality Assessment',
    description:
      'A brief check-in on the quality of your connection and support experiences.',
    matchPercent: 83,
    rewardMnt: 3_000,
    durationMin: 18,
    spotsLeft: 228,
    spotsTotal: 250,
    category: 'Brand',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 3 },
      { type: 'Single Choice', count: 3 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-010',
    companyName: 'Khan Bank',
    companyInitials: 'KB',
    companyColor: 'var(--warning)',
    title: 'Customer Loyalty Pulse',
    description:
      'Measure of how likely you are to continue banking with us and what factors drive that decision.',
    matchPercent: 78,
    rewardMnt: 8_000,
    durationMin: 9,
    spotsLeft: 34,
    spotsTotal: 80,
    category: 'Finance',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-011',
    companyName: 'Golomt Bank',
    companyInitials: 'GB',
    companyColor: 'var(--danger)',
    title: 'Mobile App Usability Study',
    description:
      'Walk us through how you use the mobile app and what works (or doesn\'t) in your day-to-day flow.',
    matchPercent: 72,
    rewardMnt: 5_000,
    durationMin: 8,
    spotsLeft: 62,
    spotsTotal: 120,
    category: 'Product',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Ranking', count: 1 },
      { type: 'Multi Choice', count: 1 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-012',
    companyName: 'MCS Group',
    companyInitials: 'MC',
    companyColor: 'var(--success)',
    title: 'Retail Experience Survey',
    description:
      'Share what worked and what didn\'t during your most recent visit to one of our retail locations.',
    matchPercent: 68,
    rewardMnt: 4_500,
    durationMin: 11,
    spotsLeft: 85,
    spotsTotal: 100,
    category: 'Product',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-013',
    companyName: 'Ard Financial',
    companyInitials: 'AF',
    companyColor: 'var(--accent-teal)',
    title: 'Investment Habits Study',
    description:
      'Help us understand how Mongolians save, invest, and think about long-term financial planning.',
    matchPercent: 92,
    rewardMnt: 12_000,
    durationMin: 15,
    spotsLeft: 58,
    spotsTotal: 150,
    category: 'Finance',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 3 },
      { type: 'Multi Choice', count: 2 },
      { type: 'Ranking', count: 1 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-014',
    companyName: 'Unitel',
    companyInitials: 'UN',
    companyColor: 'var(--warning-strong)',
    title: '5G Rollout Feedback',
    description:
      'If you live in a 5G coverage area, share your experience with speed, reliability, and pricing.',
    matchPercent: 90,
    rewardMnt: 7_500,
    durationMin: 10,
    spotsLeft: 41,
    spotsTotal: 200,
    category: 'Product',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Scale', count: 3 },
      { type: 'Single Choice', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-015',
    companyName: 'Shangri-La UB',
    companyInitials: 'SL',
    companyColor: 'var(--accent-teal-strong)',
    title: 'Hospitality Experience Review',
    description:
      'Recent guests only — tell us how your stay went and what would bring you back.',
    matchPercent: 88,
    rewardMnt: 20_000,
    durationMin: 14,
    spotsLeft: 12,
    spotsTotal: 50,
    category: 'Brand',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 4 },
      { type: 'Matrix', count: 1 },
      { type: 'Long Text', count: 1 },
    ],
  },
  {
    id: 'fd-016',
    companyName: 'APU Company',
    companyInitials: 'AP',
    companyColor: 'var(--danger)',
    title: 'Beverage Preference Study',
    description:
      'Quick study on what you drink, when, and why. No prior knowledge of our brand needed.',
    matchPercent: 87,
    rewardMnt: 3_000,
    durationMin: 5,
    spotsLeft: 142,
    spotsTotal: 300,
    category: 'Product',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Single Choice', count: 4 },
      { type: 'Multi Choice', count: 2 },
      { type: 'Ranking', count: 1 },
    ],
  },
  {
    id: 'fd-017',
    companyName: 'Trade & Development Bank',
    companyInitials: 'TD',
    companyColor: 'var(--brand-primary-hover)',
    title: 'Mortgage Application Experience',
    description:
      'For anyone who has applied for a home loan in the last 24 months — walk us through the process.',
    matchPercent: 84,
    rewardMnt: 18_000,
    durationMin: 20,
    spotsLeft: 27,
    spotsTotal: 80,
    category: 'Finance',
    requiredTrustLevel: 3,
    breakdown: [
      { type: 'Scale', count: 4 },
      { type: 'Single Choice', count: 3 },
      { type: 'Long Text', count: 2 },
      { type: 'Date', count: 1 },
    ],
  },
  {
    id: 'fd-018',
    companyName: 'Gobi Cashmere',
    companyInitials: 'GC',
    companyColor: 'var(--warning-deep)',
    title: 'Export Brand Perception',
    description:
      'How do international buyers perceive Mongolian cashmere? Help shape our global positioning.',
    matchPercent: 82,
    rewardMnt: 9_500,
    durationMin: 12,
    spotsLeft: 65,
    spotsTotal: 100,
    category: 'Brand',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 3 },
      { type: 'Multi Choice', count: 2 },
      { type: 'Short Text', count: 2 },
    ],
  },
  {
    id: 'fd-019',
    companyName: 'State Bank',
    companyInitials: 'SB',
    companyColor: 'var(--text-tertiary)',
    title: 'Branch vs. Digital Preference',
    description:
      'How do you choose between visiting a branch and using the mobile app? Short scenario-based survey.',
    matchPercent: 80,
    rewardMnt: 6_000,
    durationMin: 7,
    spotsLeft: 91,
    spotsTotal: 150,
    category: 'Finance',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 3 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-020',
    companyName: 'Mobicom',
    companyInitials: 'MB',
    companyColor: 'var(--success)',
    title: 'Family Data Plan Study',
    description:
      'For households with 2+ mobile lines — tell us how you split data and manage plans across family members.',
    matchPercent: 77,
    rewardMnt: 5_500,
    durationMin: 9,
    spotsLeft: 183,
    spotsTotal: 250,
    category: 'Other',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Single Choice', count: 3 },
      { type: 'Multi Choice', count: 2 },
      { type: 'Scale', count: 1 },
    ],
  },
  {
    id: 'fd-021',
    companyName: 'Nomin Holding',
    companyInitials: 'NH',
    companyColor: 'var(--accent-violet)',
    title: 'Grocery Shopping Habits',
    description:
      'Where do you shop, how often, and what drives brand loyalty in your weekly grocery routine?',
    matchPercent: 75,
    rewardMnt: 4_000,
    durationMin: 8,
    spotsLeft: 118,
    spotsTotal: 200,
    category: 'Product',
    requiredTrustLevel: 1,
    breakdown: [
      { type: 'Single Choice', count: 3 },
      { type: 'Multi Choice', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-022',
    companyName: 'Tavan Bogd Group',
    companyInitials: 'TB',
    companyColor: 'var(--accent-teal)',
    title: 'Workplace Wellness Pulse',
    description:
      'Quick pulse on how supported you feel at work — from health benefits to flexible schedules.',
    matchPercent: 73,
    rewardMnt: 11_000,
    durationMin: 13,
    spotsLeft: 44,
    spotsTotal: 120,
    category: 'HR',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 4 },
      { type: 'Matrix', count: 1 },
      { type: 'Long Text', count: 1 },
    ],
  },
  {
    id: 'fd-023',
    companyName: 'Xac Bank',
    companyInitials: 'XB',
    companyColor: 'var(--accent-teal-strong)',
    title: 'Green Finance Awareness',
    description:
      'Short study on awareness of sustainable banking products and what would move you to adopt one.',
    matchPercent: 70,
    rewardMnt: 6_500,
    durationMin: 10,
    spotsLeft: 76,
    spotsTotal: 150,
    category: 'Social',
    requiredTrustLevel: 2,
    breakdown: [
      { type: 'Scale', count: 2 },
      { type: 'Single Choice', count: 2 },
      { type: 'Multi Choice', count: 1 },
      { type: 'Short Text', count: 1 },
    ],
  },
  {
    id: 'fd-024',
    companyName: 'Erdenet Mining',
    companyInitials: 'EM',
    companyColor: 'var(--warning-deep)',
    title: 'Community Impact Study',
    description:
      'Residents near operations only — share your perspective on local economic, environmental, and social impact.',
    matchPercent: 65,
    rewardMnt: 14_000,
    durationMin: 22,
    spotsLeft: 31,
    spotsTotal: 80,
    category: 'Social',
    requiredTrustLevel: 3,
    breakdown: [
      { type: 'Scale', count: 4 },
      { type: 'Matrix', count: 2 },
      { type: 'Long Text', count: 2 },
      { type: 'Short Text', count: 1 },
    ],
  },
];
