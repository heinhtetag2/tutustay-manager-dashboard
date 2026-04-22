export type HelpIconKey =
  | 'rocket'
  | 'feed'
  | 'clipboard'
  | 'wallet'
  | 'trophy'
  | 'shield';

export interface HelpCategoryMeta {
  slug: string;
  title: string;
  description: string;
  iconKey: HelpIconKey;
}

export const HELP_CATEGORIES: HelpCategoryMeta[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'How iDap works, your dashboard, and earning your first reward.',
    iconKey: 'rocket',
  },
  {
    slug: 'survey-feed',
    title: 'Survey Feed & Matching',
    description: 'How surveys are matched to you, filters, categories, and trust gating.',
    iconKey: 'feed',
  },
  {
    slug: 'taking-surveys',
    title: 'Taking Surveys',
    description: 'Screener questions, saving progress, disqualifications, and quality tips.',
    iconKey: 'clipboard',
  },
  {
    slug: 'rewards-wallet',
    title: 'Rewards & Wallet',
    description: 'The 24-hour hold, bonuses, balance, and paying out via QPay, Bonum, or Social Pay.',
    iconKey: 'wallet',
  },
  {
    slug: 'trust-quality',
    title: 'Trust Level & Quality',
    description: 'Levels L1–L5, how your quality score moves, and unlocking higher-paying surveys.',
    iconKey: 'trophy',
  },
  {
    slug: 'account-privacy',
    title: 'Account, Privacy & Settings',
    description: 'Your demographics, notifications, privacy, sessions, and deleting your account.',
    iconKey: 'shield',
  },
];

export interface HelpArticleMeta {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  readTime: string;
  updatedAt: string;
}

export const HELP_ARTICLES: HelpArticleMeta[] = [
  // Getting Started
  { slug: 'how-idap-works', categorySlug: 'getting-started', title: 'How iDap works', description: 'The three-step flow: match, answer, get paid.', readTime: '3 min', updatedAt: 'Apr 18, 2026' },
  { slug: 'dashboard-tour', categorySlug: 'getting-started', title: 'Reading your dashboard', description: 'Earnings, trust level, streak, and recent activity at a glance.', readTime: '4 min', updatedAt: 'Apr 15, 2026' },
  { slug: 'first-survey', categorySlug: 'getting-started', title: 'Completing your first survey', description: 'Tips to qualify, avoid disqualification, and get paid quickly.', readTime: '4 min', updatedAt: 'Apr 10, 2026' },
  { slug: 'daily-routine', categorySlug: 'getting-started', title: 'A good daily routine on iDap', description: 'When to check the feed, how to protect your trust level, and cashing out.', readTime: '3 min', updatedAt: 'Apr 08, 2026' },

  // Survey Feed & Matching
  { slug: 'how-matching-works', categorySlug: 'survey-feed', title: 'How surveys are matched to you', description: 'Demographics, categories, and what your match % means.', readTime: '4 min', updatedAt: 'Apr 20, 2026' },
  { slug: 'feed-filters', categorySlug: 'survey-feed', title: 'Filtering the Survey Feed', description: 'Category, recommended, reward, and duration filters.', readTime: '3 min', updatedAt: 'Apr 16, 2026' },
  { slug: 'trust-gating', categorySlug: 'survey-feed', title: 'Why some surveys are locked', description: 'Level-gated surveys and how to unlock them.', readTime: '3 min', updatedAt: 'Apr 12, 2026' },
  { slug: 'spots-left', categorySlug: 'survey-feed', title: 'Spots left and first-come-first-served', description: 'How survey capacity works and why speed matters.', readTime: '3 min', updatedAt: 'Apr 05, 2026' },

  // Taking Surveys
  { slug: 'screener-questions', categorySlug: 'taking-surveys', title: 'Screener questions explained', description: 'Why they exist and what disqualification means.', readTime: '3 min', updatedAt: 'Apr 19, 2026' },
  { slug: 'saving-progress', categorySlug: 'taking-surveys', title: 'Saving progress and coming back later', description: 'When it works, when it does not, and how long you have.', readTime: '3 min', updatedAt: 'Apr 14, 2026' },
  { slug: 'quality-tips', categorySlug: 'taking-surveys', title: 'Tips for high-quality responses', description: 'Read fully, avoid straight-lining, and pass attention checks.', readTime: '4 min', updatedAt: 'Apr 11, 2026' },
  { slug: 'disqualification-reasons', categorySlug: 'taking-surveys', title: 'Why you were disqualified', description: 'Common reasons and what they mean for your rewards.', readTime: '3 min', updatedAt: 'Apr 07, 2026' },

  // Rewards & Wallet
  { slug: '24h-hold', categorySlug: 'rewards-wallet', title: 'The 24-hour hold explained', description: 'Why rewards sit in held balance before paying out.', readTime: '3 min', updatedAt: 'Apr 21, 2026' },
  { slug: 'reward-statuses', categorySlug: 'rewards-wallet', title: 'Reward statuses: held, paid, rejected', description: 'What each status means and when it changes.', readTime: '3 min', updatedAt: 'Apr 17, 2026' },
  { slug: 'withdrawal-methods', categorySlug: 'rewards-wallet', title: 'Withdrawal methods: QPay, Bonum, Social Pay, Bank Transfer', description: 'Processing times, minimums, and fees for each gateway.', readTime: '4 min', updatedAt: 'Apr 13, 2026' },
  { slug: 'payout-missing', categorySlug: 'rewards-wallet', title: 'What to do if a payout has not arrived', description: 'Checking status, retry windows, and when to contact support.', readTime: '3 min', updatedAt: 'Apr 09, 2026' },

  // Trust Level & Quality
  { slug: 'trust-levels-explained', categorySlug: 'trust-quality', title: 'Trust Levels L1–L5 explained', description: 'How iDap computes trust and what each level unlocks.', readTime: '5 min', updatedAt: 'Apr 20, 2026' },
  { slug: 'quality-score', categorySlug: 'trust-quality', title: 'Your quality score', description: 'How it is measured and how to protect it.', readTime: '4 min', updatedAt: 'Apr 16, 2026' },
  { slug: 'streaks-bonuses', categorySlug: 'trust-quality', title: 'Streaks and bonuses', description: 'How daily streaks earn extra rewards on top of surveys.', readTime: '3 min', updatedAt: 'Apr 12, 2026' },
  { slug: 'regaining-trust', categorySlug: 'trust-quality', title: 'Regaining a lowered trust level', description: 'What triggers a drop and how to recover to your previous level.', readTime: '4 min', updatedAt: 'Apr 06, 2026' },

  // Account, Privacy & Settings
  { slug: 'demographics', categorySlug: 'account-privacy', title: 'Why your demographics matter', description: 'They decide which surveys match you — keep them accurate.', readTime: '3 min', updatedAt: 'Apr 18, 2026' },
  { slug: 'notifications', categorySlug: 'account-privacy', title: 'Customizing notifications', description: 'Push, email, in-app, and setting quiet hours.', readTime: '2 min', updatedAt: 'Apr 14, 2026' },
  { slug: 'privacy-data', categorySlug: 'account-privacy', title: 'Privacy and your data', description: 'What is shared with companies and how to export or delete it.', readTime: '4 min', updatedAt: 'Apr 10, 2026' },
  { slug: 'referrals', categorySlug: 'account-privacy', title: 'Inviting friends and earning bonuses', description: 'How the referral program works — ₮5,000 each per qualified friend.', readTime: '2 min', updatedAt: 'Apr 04, 2026' },
];

export function getCategoryBySlug(slug: string | undefined): HelpCategoryMeta | undefined {
  if (!slug) return undefined;
  return HELP_CATEGORIES.find((c) => c.slug === slug);
}

export function getArticleBySlug(slug: string | undefined): HelpArticleMeta | undefined {
  if (!slug) return undefined;
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesInCategory(slug: string | undefined): HelpArticleMeta[] {
  if (!slug) return [];
  return HELP_ARTICLES.filter((a) => a.categorySlug === slug);
}

export const POPULAR_ARTICLE_SLUGS = [
  'how-matching-works',
  '24h-hold',
  'trust-levels-explained',
  'withdrawal-methods',
  'quality-score',
];
