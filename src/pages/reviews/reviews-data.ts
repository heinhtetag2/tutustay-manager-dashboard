export interface Review {
  id: string;
  /** Links to a Customer record (customers store) for cross-navigation. */
  customerId?: string;
  customerName: string;
  avatarUrl?: string;
  /** 1–5 stars. */
  rating: number;
  comment: string;
  roomType: string;
  /** ISO date of the stay. */
  stayDate: string;
  /** ISO datetime the review was posted. */
  createdAt: string;
  /** Manager reply, if any. */
  reply?: string;
  replyAt?: string;
  /** Hidden by an admin — kept in the dashboard but not shown publicly. */
  hidden?: boolean;
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
}

/** Count of reviews per star value (1–5). */
export function ratingCounts(reviews: Review[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });
  return counts;
}

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'rv1',
    customerId: 'c1',
    customerName: 'Daniel Foster',
    rating: 5,
    comment: 'Outstanding stay. The room was spotless, the staff went above and beyond, and breakfast was excellent. Will definitely return.',
    roomType: 'Deluxe',
    stayDate: '2026-05-27',
    createdAt: '2026-05-29T20:30:00',
    reply: 'Thank you so much, Daniel! We look forward to welcoming you back.',
    replyAt: '2026-05-30T09:15:00',
  },
  {
    id: 'rv2',
    customerId: 'c2',
    customerName: 'Grace Park',
    rating: 4,
    comment: 'Lovely room with a great view. Check-in was a little slow during peak hours, but the team was friendly throughout.',
    roomType: 'Superior',
    stayDate: '2026-05-20',
    createdAt: '2026-05-22T15:10:00',
  },
  {
    id: 'rv3',
    customerId: 'c3',
    customerName: 'Marcus Lee',
    rating: 5,
    comment: 'Perfect location and very comfortable beds. The spa was a highlight of the trip.',
    roomType: 'Superior',
    stayDate: '2026-05-16',
    createdAt: '2026-05-18T09:45:00',
    reply: 'We appreciate the kind words, Marcus — glad you enjoyed the spa!',
    replyAt: '2026-05-18T18:40:00',
  },
  {
    id: 'rv4',
    customerId: 'c4',
    customerName: 'Sofia Marin',
    rating: 3,
    comment: 'Decent stay overall. The room was a bit smaller than expected and the AC was noisy at night.',
    roomType: 'Superior',
    stayDate: '2026-04-28',
    createdAt: '2026-04-30T18:00:00',
  },
  {
    id: 'rv5',
    customerId: 'c5',
    customerName: 'Aiko Tanaka',
    rating: 2,
    comment: 'Service was slow and my room was not ready at check-in. The location is good, but I expected more for the price.',
    roomType: 'Deluxe',
    stayDate: '2026-03-10',
    createdAt: '2026-03-12T11:25:00',
  },
  {
    id: 'rv6',
    customerId: 'c6',
    customerName: 'Omar Haddad',
    rating: 5,
    comment: 'Fantastic value and a warm welcome. The front desk helped arrange airport pickup without any hassle.',
    roomType: 'Superior',
    stayDate: '2025-12-18',
    createdAt: '2025-12-20T22:05:00',
    reply: 'Thank you, Omar! Safe travels and see you next time.',
    replyAt: '2025-12-21T08:00:00',
  },
];
