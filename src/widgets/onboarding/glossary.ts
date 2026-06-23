/**
 * Plain-language definitions for the hotel / revenue / finance jargon used
 * across the dashboard. Surfaced inline via the `(i)` InfoTooltip and the
 * `<Term>` helper so a first-time user never meets a bare metric or status.
 */
export const GLOSSARY: Record<string, string> = {
  ADR: 'Average Daily Rate: room revenue ÷ number of room-nights sold. The average you earn per occupied room, per night.',
  RevPAR:
    'Revenue Per Available Room: total room revenue ÷ every room you could have sold. Unlike ADR, empty rooms drag it down — so it reflects both your price and how full you are.',
  Occupancy: 'The share of your bookable rooms that are filled tonight (occupied ÷ active rooms).',
  'In-house guests': 'Guests staying with you tonight — already checked in and not yet checked out.',
  'Room-nights': 'Rooms sold × nights stayed. A 2-room, 3-night booking = 6 room-nights.',
  'Day use': 'A short, same-day booking sold in blocks of hours — no overnight stay. Also called a "session".',
  Session: 'A short, same-day booking sold in blocks of hours — no overnight stay. Also shown as "Day use".',
  'Weekend uplift':
    'An extra amount or % added on top of your nightly and session rates on the days you choose.',
  Overdue:
    "The checkout date has passed but the guest hasn't been checked out. Open the reservation and Check out to close it.",
  'Gross revenue': 'Total booking revenue before any fees are taken out.',
  Commission: "TutuStay's platform fee, currently 12% of gross revenue.",
  'Platform fees': "TutuStay's platform fee, currently 12% of gross revenue.",
  Adjustments: 'Refunds and cancellations deducted from this payout.',
  'Net payout': 'What actually lands in your bank: gross revenue − commission − adjustments.',
  'Repeat guest': 'A customer with more than one completed booking.',
  'Repeat customers': 'Customers who have booked with you more than once.',
  'Paid out': 'Total payouts already settled to your bank account.',
  'Pending payout': 'Money owed to you that hasn’t been paid out yet — still processing or scheduled.',
  'This month gross': 'Total booking revenue earned this month, before commission and adjustments.',
  'Response rate': 'The share of guest reviews you have replied to (replies ÷ total reviews). Replying publicly builds trust with future guests.',
  'Pending value': 'The combined revenue of all pending requests — what you would earn if every one were approved.',
  Redemptions: 'The total number of times your coupons have been used by guests.',
};

export type GlossaryTerm = keyof typeof GLOSSARY;
