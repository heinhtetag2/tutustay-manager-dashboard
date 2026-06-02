import { formatAmount } from '@/pages/reservations/reservations-data';

export type SettlementStatus = 'Paid' | 'Processing' | 'Pending' | 'On hold';

export const SETTLEMENT_STATUSES: SettlementStatus[] = ['Paid', 'Processing', 'Pending', 'On hold'];

export interface Settlement {
  id: string;
  /** Business-facing settlement reference shown in the table. */
  reference: string;
  /** ISO dates for the settlement period (the bookings it covers). */
  periodStart: string;
  periodEnd: string;
  /** Number of bookings included in this settlement. */
  bookingsCount: number;
  /** Gross booking revenue for the period. */
  grossAmount: number;
  /** Platform commission rate applied (e.g. 0.12 = 12%). */
  commissionRate: number;
  /** Refunds / cancellations deducted from the payout. */
  adjustments: number;
  status: SettlementStatus;
  /** Payout destination. */
  payoutMethod: string;
  /** ISO datetime the payout was made (Paid), or is scheduled for (otherwise). */
  settledAt?: string;
  scheduledFor?: string;
  createdAt: string;
}

export { formatAmount };

/** Platform commission amount for the period. */
export function commissionAmount(s: Settlement): number {
  return Math.round(s.grossAmount * s.commissionRate);
}

/** Net payout = gross − commission − adjustments. */
export function netAmount(s: Settlement): number {
  return s.grossAmount - commissionAmount(s) - s.adjustments;
}

/** Status pill classes, shared by the list and detail pages. */
export function settlementStatusClass(status: SettlementStatus): string {
  switch (status) {
    case 'Paid': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Processing': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Pending': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
    case 'On hold': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
  }
}

export const DEMO_SETTLEMENTS: Settlement[] = [
  {
    id: 'st1', reference: 'STL-2042', periodStart: '2026-06-01', periodEnd: '2026-06-15',
    bookingsCount: 18, grossAmount: 3_120_000, commissionRate: 0.12, adjustments: 90_000,
    status: 'Processing', payoutMethod: 'Bank transfer · KB ••3921', scheduledFor: '2026-06-18T00:00:00',
    createdAt: '2026-06-16T02:00:00',
  },
  {
    id: 'st2', reference: 'STL-2041', periodStart: '2026-05-16', periodEnd: '2026-05-31',
    bookingsCount: 22, grossAmount: 3_780_000, commissionRate: 0.12, adjustments: 0,
    status: 'Paid', payoutMethod: 'Bank transfer · KB ••3921', settledAt: '2026-06-02T09:30:00',
    createdAt: '2026-06-01T02:00:00',
  },
  {
    id: 'st3', reference: 'STL-2040', periodStart: '2026-05-01', periodEnd: '2026-05-15',
    bookingsCount: 19, grossAmount: 2_950_000, commissionRate: 0.12, adjustments: 140_000,
    status: 'Paid', payoutMethod: 'Bank transfer · KB ••3921', settledAt: '2026-05-18T09:30:00',
    createdAt: '2026-05-16T02:00:00',
  },
  {
    id: 'st4', reference: 'STL-2039', periodStart: '2026-04-16', periodEnd: '2026-04-30',
    bookingsCount: 16, grossAmount: 2_540_000, commissionRate: 0.12, adjustments: 0,
    status: 'Paid', payoutMethod: 'Bank transfer · KB ••3921', settledAt: '2026-05-02T09:30:00',
    createdAt: '2026-05-01T02:00:00',
  },
  {
    id: 'st5', reference: 'STL-2038', periodStart: '2026-04-01', periodEnd: '2026-04-15',
    bookingsCount: 21, grossAmount: 3_310_000, commissionRate: 0.12, adjustments: 60_000,
    status: 'Paid', payoutMethod: 'Bank transfer · KB ••3921', settledAt: '2026-04-18T09:30:00',
    createdAt: '2026-04-16T02:00:00',
  },
  {
    id: 'st6', reference: 'STL-2037', periodStart: '2026-03-16', periodEnd: '2026-03-31',
    bookingsCount: 14, grossAmount: 2_180_000, commissionRate: 0.12, adjustments: 0,
    status: 'Paid', payoutMethod: 'Bank transfer · KB ••3921', settledAt: '2026-04-02T09:30:00',
    createdAt: '2026-04-01T02:00:00',
  },
  {
    id: 'st7', reference: 'STL-2036', periodStart: '2026-03-01', periodEnd: '2026-03-15',
    bookingsCount: 12, grossAmount: 1_860_000, commissionRate: 0.12, adjustments: 220_000,
    status: 'On hold', payoutMethod: 'Bank transfer · KB ••3921', scheduledFor: '2026-03-18T00:00:00',
    createdAt: '2026-03-16T02:00:00',
  },
  {
    id: 'st8', reference: 'STL-2043', periodStart: '2026-06-16', periodEnd: '2026-06-30',
    bookingsCount: 9, grossAmount: 1_440_000, commissionRate: 0.12, adjustments: 0,
    status: 'Pending', payoutMethod: 'Bank transfer · KB ••3921', scheduledFor: '2026-07-02T00:00:00',
    createdAt: '2026-06-16T02:00:00',
  },
];
