import { DEMO_RESERVATIONS, countsAsRevenue, formatAmount } from '@/pages/reservations/reservations-data';

export type SettlementStatus = 'Paid' | 'Processing' | 'Pending' | 'On hold';

export const SETTLEMENT_STATUSES: SettlementStatus[] = ['Paid', 'Processing', 'Pending', 'On hold'];

/** Platform commission rate and payout cadence — tweak these to change the model. */
export const COMMISSION_RATE = 0.12;
/** Refund rate applied to a cancelled booking's amount, booked as an adjustment. */
export const CANCELLATION_REFUND_RATE = 0.5;
/** Days after a period closes that the payout is made. */
export const PAYOUT_DELAY_DAYS = 2;

const PAYOUT_METHOD = 'Bank transfer · KB ••3921';
/** The app's "today" — settlements derive their status relative to this. */
export const SETTLEMENT_NOW = new Date('2026-06-02T10:00:00');

/** One booking included in a settlement (snapshotted from a reservation). */
export interface SettlementBooking {
  id: string;
  code: string;
  guestName: string;
  roomType: string;
  checkOut: string;
  amount: number;
}

export interface Settlement {
  id: string;
  reference: string;
  periodStart: string;
  periodEnd: string;
  bookingsCount: number;
  grossAmount: number;
  commissionRate: number;
  adjustments: number;
  status: SettlementStatus;
  payoutMethod: string;
  settledAt?: string;
  scheduledFor?: string;
  createdAt: string;
  /** The actual reservations this payout covers. */
  bookings: SettlementBooking[];
}

export { formatAmount };

export function commissionAmount(s: Settlement): number {
  return Math.round(s.grossAmount * s.commissionRate);
}

/** Net payout = gross − commission − adjustments. */
export function netAmount(s: Settlement): number {
  return s.grossAmount - commissionAmount(s) - s.adjustments;
}

export function settlementStatusClass(status: SettlementStatus): string {
  switch (status) {
    case 'Paid': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Processing': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Pending': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
    case 'On hold': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
  }
}

const pad = (n: number) => String(n).padStart(2, '0');
const lastDayOfMonth = (year: number, month1: number) => new Date(year, month1, 0).getDate();
const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

/** Bi-weekly period key (1st–15th, 16th–end) for an ISO datetime. */
function periodKey(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${y}-${pad(m)}-${d <= 15 ? 1 : 2}`;
}

interface Bucket {
  periodStart: string;
  periodEnd: string;
  bookings: SettlementBooking[];
  adjustments: number;
  grossOverride?: number;
  countOverride?: number;
}

function bucketBounds(iso: string): { start: string; end: string } {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (d <= 15) return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-15` };
  return { start: `${y}-${pad(m)}-16`, end: `${y}-${pad(m)}-${pad(lastDayOfMonth(y, m))}` };
}

/** Deterministic pseudo figures for an archived (synthetic) period. */
function synthFigures(i: number): { gross: number; count: number; adjustments: number } {
  return {
    gross: 1_700_000 + ((i * 53) % 9) * 210_000 + ((i * 29) % 5) * 160_000,
    count: 11 + ((i * 7) % 11),
    adjustments: i % 4 === 0 ? 60_000 + ((i * 17) % 4) * 30_000 : 0,
  };
}

/**
 * Build settlements: recent periods come from real reservations (grouped into
 * bi-weekly payout periods by check-out, with cancellation refund adjustments);
 * a short synthetic archive (Sep 2025 → Apr 2026) gives enough history to page.
 * Status is derived from the payout date relative to `now`.
 */
export function buildSettlements(now: Date = SETTLEMENT_NOW): Settlement[] {
  const buckets = new Map<string, Bucket>();

  // Synthetic archive: bi-weekly periods from Sep 2025 → Apr 2026.
  let si = 0;
  const archive: Array<[number, number]> = [
    [2025, 9], [2025, 10], [2025, 11], [2025, 12], [2026, 1], [2026, 2], [2026, 3], [2026, 4],
  ];
  archive.forEach(([y, m]) => {
    for (const half of [1, 2] as const) {
      const start = half === 1 ? `${y}-${pad(m)}-01` : `${y}-${pad(m)}-16`;
      const end = half === 1 ? `${y}-${pad(m)}-15` : `${y}-${pad(m)}-${pad(lastDayOfMonth(y, m))}`;
      const f = synthFigures(si++);
      buckets.set(`${y}-${pad(m)}-${half}`, { periodStart: start, periodEnd: end, bookings: [], adjustments: f.adjustments, grossOverride: f.gross, countOverride: f.count });
    }
  });

  // Real revenue bookings → period buckets (May 2026 onward).
  DEMO_RESERVATIONS.forEach((r) => {
    if (!countsAsRevenue(r.status)) return;
    const key = periodKey(r.checkOut);
    let b = buckets.get(key);
    if (!b || b.grossOverride !== undefined) {
      const { start, end } = bucketBounds(r.checkOut);
      b = { periodStart: start, periodEnd: end, bookings: [], adjustments: 0 };
      buckets.set(key, b);
    }
    b.bookings.push({ id: r.id, code: r.code, guestName: r.guestName, roomType: r.roomType, checkOut: r.checkOut, amount: r.amount });
  });

  // Cancellations → refund adjustments on a real period.
  DEMO_RESERVATIONS.forEach((r) => {
    if (r.status !== 'Cancelled') return;
    const b = buckets.get(periodKey(r.checkOut));
    if (b && b.grossOverride === undefined) b.adjustments += Math.round(r.amount * CANCELLATION_REFUND_RATE);
  });

  return [...buckets.values()]
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
    .map((b, i) => {
      const grossAmount = b.bookings.length ? b.bookings.reduce((n, x) => n + x.amount, 0) : b.grossOverride ?? 0;
      const payoutDate = addDays(new Date(`${b.periodEnd}T23:59:59`), PAYOUT_DELAY_DAYS);
      const periodStarted = new Date(`${b.periodStart}T00:00:00`) <= now;

      let status: SettlementStatus;
      let settledAt: string | undefined;
      let scheduledFor: string | undefined;
      if (payoutDate <= now) {
        status = 'Paid';
        settledAt = payoutDate.toISOString();
      } else if (periodStarted) {
        status = 'Processing';
        scheduledFor = payoutDate.toISOString();
      } else {
        status = 'Pending';
        scheduledFor = payoutDate.toISOString();
      }

      return {
        id: `st${i + 1}`,
        reference: `STL-${2020 + i}`,
        periodStart: b.periodStart,
        periodEnd: b.periodEnd,
        bookingsCount: b.bookings.length || b.countOverride || 0,
        grossAmount,
        commissionRate: COMMISSION_RATE,
        adjustments: b.adjustments,
        status,
        payoutMethod: PAYOUT_METHOD,
        settledAt,
        scheduledFor,
        createdAt: addDays(new Date(`${b.periodEnd}T23:59:59`), 1).toISOString(),
        bookings: b.bookings.sort((x, y) => x.checkOut.localeCompare(y.checkOut)),
      };
    });
}

export const DEMO_SETTLEMENTS: Settlement[] = buildSettlements();
