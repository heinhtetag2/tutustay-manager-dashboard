export type HelpIconKey =
  | 'rocket'
  | 'calendar'
  | 'inbox'
  | 'bed'
  | 'ticket'
  | 'bank';

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
    description: 'How the TutuStay manager dashboard works and finding your way around.',
    iconKey: 'rocket',
  },
  {
    slug: 'reservations',
    title: 'Reservations & Calendar',
    description: 'Managing reservations, statuses, check-in/out, and the Sales Calendar.',
    iconKey: 'calendar',
  },
  {
    slug: 'booking-requests',
    title: 'Booking Requests',
    description: 'Reviewing incoming requests, approving or declining, and rate types.',
    iconKey: 'inbox',
  },
  {
    slug: 'rooms',
    title: 'Rooms & Pricing',
    description: 'Room types, individual rooms, pricing tiers, amenities, and availability.',
    iconKey: 'bed',
  },
  {
    slug: 'coupons',
    title: 'Coupons & Promotions',
    description: 'Creating discount coupons, super-admin approval, and room-type scoping.',
    iconKey: 'ticket',
  },
  {
    slug: 'settlement',
    title: 'Settlement & Payouts',
    description: 'Payout periods, gross, commission and net, statuses, and exports.',
    iconKey: 'bank',
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
  { slug: 'how-it-works', categorySlug: 'getting-started', title: 'How the TutuStay dashboard works', description: 'The manager dashboard for running your property end to end.', readTime: '3 min', updatedAt: 'Jun 1, 2026' },
  { slug: 'dashboard-overview', categorySlug: 'getting-started', title: 'Reading your dashboard', description: 'Revenue, arrivals and departures, status mix, and recent activity at a glance.', readTime: '4 min', updatedAt: 'Jun 1, 2026' },
  { slug: 'navigation', categorySlug: 'getting-started', title: 'Finding your way around', description: 'What each section in the sidebar does, from Reservations to Settlement.', readTime: '3 min', updatedAt: 'May 28, 2026' },
  { slug: 'daily-routine', categorySlug: 'getting-started', title: 'A good daily routine', description: "Check today's arrivals, clear pending requests, and reply to reviews.", readTime: '3 min', updatedAt: 'May 25, 2026' },

  // Reservations & Calendar
  { slug: 'reservation-statuses', categorySlug: 'reservations', title: 'Reservation statuses explained', description: 'Confirmed, Checked-in, Checked-out, Cancelled, No-show, and Overdue.', readTime: '4 min', updatedAt: 'Jun 2, 2026' },
  { slug: 'check-in-out', categorySlug: 'reservations', title: 'Checking guests in and out', description: 'Marking arrivals and departures and what each action changes.', readTime: '3 min', updatedAt: 'May 30, 2026' },
  { slug: 'sales-calendar', categorySlug: 'reservations', title: 'Using the Sales Calendar', description: 'See bookings by day, revenue per period, and a day detail panel.', readTime: '4 min', updatedAt: 'May 27, 2026' },
  { slug: 'filtering-reservations', categorySlug: 'reservations', title: 'Searching and filtering reservations', description: 'Filter by status, room type, nights, and check-in date range.', readTime: '3 min', updatedAt: 'May 22, 2026' },

  // Booking Requests
  { slug: 'review-requests', categorySlug: 'booking-requests', title: 'Reviewing booking requests', description: 'Where new requests appear and the guest details you get to decide.', readTime: '3 min', updatedAt: 'Jun 2, 2026' },
  { slug: 'approve-decline', categorySlug: 'booking-requests', title: 'Approving or declining a request', description: 'How a decision creates a reservation or releases the dates.', readTime: '3 min', updatedAt: 'May 31, 2026' },
  { slug: 'rate-types', categorySlug: 'booking-requests', title: 'Rate types: Regular, Session, Weekend', description: 'What each rate means and how it affects the amount.', readTime: '3 min', updatedAt: 'May 26, 2026' },
  { slug: 'request-notifications', categorySlug: 'booking-requests', title: 'New booking notifications', description: 'Live toasts for incoming bookings and where they link to.', readTime: '2 min', updatedAt: 'May 20, 2026' },

  // Rooms & Pricing
  { slug: 'room-types-vs-rooms', categorySlug: 'rooms', title: 'Room types vs individual rooms', description: 'How pricing tiers (room types) relate to the rooms you sell.', readTime: '4 min', updatedAt: 'Jun 1, 2026' },
  { slug: 'pricing-tiers', categorySlug: 'rooms', title: 'Setting prices: regular, session, weekend', description: 'Configure nightly, hourly session, and weekend pricing.', readTime: '4 min', updatedAt: 'May 29, 2026' },
  { slug: 'amenities', categorySlug: 'rooms', title: 'Managing amenities', description: 'Add amenities to room types and filter rooms by them.', readTime: '3 min', updatedAt: 'May 24, 2026' },
  { slug: 'room-status', categorySlug: 'rooms', title: 'Active vs inactive rooms', description: 'How a room status affects whether it is bookable.', readTime: '2 min', updatedAt: 'May 19, 2026' },

  // Coupons & Promotions
  { slug: 'create-coupon', categorySlug: 'coupons', title: 'Creating a discount coupon', description: 'Code, discount type, validity, usage limit, and minimum spend.', readTime: '4 min', updatedAt: 'Jun 2, 2026' },
  { slug: 'approval-flow', categorySlug: 'coupons', title: 'Coupon approval by the super-admin', description: 'Why new and edited coupons go to review before going live.', readTime: '3 min', updatedAt: 'Jun 1, 2026' },
  { slug: 'coupon-scope', categorySlug: 'coupons', title: 'Scoping a coupon to room types', description: 'Apply a coupon to all rooms or only selected room types.', readTime: '3 min', updatedAt: 'May 28, 2026' },
  { slug: 'coupon-statuses', categorySlug: 'coupons', title: 'Coupon statuses explained', description: 'Pending review, Active, Scheduled, Rejected, Expired, and Disabled.', readTime: '3 min', updatedAt: 'May 23, 2026' },

  // Settlement & Payouts
  { slug: 'how-settlement-works', categorySlug: 'settlement', title: 'How settlement works', description: 'Bi-weekly payouts of your booking revenue, period by period.', readTime: '4 min', updatedAt: 'Jun 2, 2026' },
  { slug: 'payout-breakdown', categorySlug: 'settlement', title: 'Gross, commission, and net payout', description: 'How the platform fee and adjustments produce your net payout.', readTime: '3 min', updatedAt: 'May 30, 2026' },
  { slug: 'settlement-statuses', categorySlug: 'settlement', title: 'Settlement statuses', description: 'Paid, Processing, Pending, and On hold — and what they mean.', readTime: '3 min', updatedAt: 'May 27, 2026' },
  { slug: 'export-settlements', categorySlug: 'settlement', title: 'Exporting settlement records', description: 'Download the filtered settlements as a CSV for your records.', readTime: '2 min', updatedAt: 'May 21, 2026' },
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
  'reservation-statuses',
  'approve-decline',
  'create-coupon',
  'how-settlement-works',
  'dashboard-overview',
];
