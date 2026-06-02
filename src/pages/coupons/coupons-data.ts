import { formatAmount } from '@/pages/reservations/reservations-data';

export type DiscountType = 'Percentage' | 'Fixed';
/** Super-admin review state for a coupon submitted by the hotel. */
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
/** Derived display status — not stored. Reflects approval first, then the lifecycle. */
export type CouponStatus = 'Active' | 'Pending review' | 'Scheduled' | 'Rejected' | 'Expired' | 'Disabled';

/** Statuses offered in the filter dropdown. */
export const COUPON_STATUSES: CouponStatus[] = ['Active', 'Pending review', 'Scheduled', 'Rejected', 'Expired', 'Disabled'];

/** Room types a coupon can be scoped to. An empty scope means it applies to all. */
export const ROOM_TYPES = ['Standard', 'Superior', 'Deluxe', 'Family', 'Suite'] as const;

export interface Coupon {
  id: string;
  /** Uppercase redemption code, e.g. SUMMER25. */
  code: string;
  description: string;
  discountType: DiscountType;
  /** Percent (e.g. 15) when Percentage, or a fixed amount (e.g. 50000) when Fixed. */
  value: number;
  /** Minimum booking amount to qualify; 0 = no minimum. */
  minSpend: number;
  /** ISO dates. */
  startsAt: string;
  expiresAt: string;
  /** Room types this coupon applies to; empty = all room types. */
  roomTypes: string[];
  /** Max redemptions; 0 = unlimited. */
  usageLimit: number;
  usedCount: number;
  /** Manager on/off switch, independent of the date window (only meaningful once approved). */
  enabled: boolean;
  /** Super-admin review state. A coupon only goes live once Approved. */
  approval: ApprovalStatus;
  /** When the hotel last submitted this coupon for review. */
  submittedAt?: string;
  /** Super-admin note, e.g. the reason for a rejection. */
  reviewNote?: string;
  createdAt: string;
}

/** Human-readable discount, e.g. "25% off" or "50,000 off". */
export function formatDiscount(c: Coupon): string {
  return c.discountType === 'Percentage' ? `${c.value}% off` : `${formatAmount(c.value)} off`;
}

/** Human-readable scope, e.g. "All room types" or "Deluxe, Suite". */
export function formatScope(c: Coupon): string {
  return c.roomTypes.length === 0 ? 'All room types' : c.roomTypes.join(', ');
}

/** Whether the coupon has hit its redemption cap. */
export function isFullyRedeemed(c: Coupon): boolean {
  return c.usageLimit > 0 && c.usedCount >= c.usageLimit;
}

/** Status pill classes, shared across the coupon list and detail pages. */
export function couponStatusClass(status: CouponStatus): string {
  switch (status) {
    case 'Active': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Pending review': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
    case 'Scheduled': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Rejected': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    case 'Expired': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Disabled': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
  }
}

/** Derive the display status — approval gates the live lifecycle. */
export function couponStatus(c: Coupon, now: Date): CouponStatus {
  if (c.approval === 'Pending') return 'Pending review';
  if (c.approval === 'Rejected') return 'Rejected';
  if (!c.enabled) return 'Disabled';
  if (new Date(c.startsAt) > now) return 'Scheduled';
  if (new Date(c.expiresAt) < now || isFullyRedeemed(c)) return 'Expired';
  return 'Active';
}

export const DEMO_COUPONS: Coupon[] = [
  {
    id: 'cp1', code: 'SUMMER25', description: 'Summer season — 25% off any stay.',
    discountType: 'Percentage', value: 25, minSpend: 0,
    startsAt: '2026-06-01', expiresAt: '2026-08-31', roomTypes: [],
    usageLimit: 200, usedCount: 47, enabled: true, approval: 'Approved',
    submittedAt: '2026-05-20T09:00:00', createdAt: '2026-05-20T09:00:00',
  },
  {
    id: 'cp2', code: 'WELCOME10', description: 'First booking discount for new guests.',
    discountType: 'Percentage', value: 10, minSpend: 0,
    startsAt: '2026-01-01', expiresAt: '2026-12-31', roomTypes: [],
    usageLimit: 0, usedCount: 312, enabled: true, approval: 'Approved',
    submittedAt: '2026-01-02T08:00:00', createdAt: '2026-01-02T08:00:00',
  },
  {
    id: 'cp3', code: 'STAY50K', description: '50,000 off bookings over 300,000.',
    discountType: 'Fixed', value: 50000, minSpend: 300000,
    startsAt: '2026-05-15', expiresAt: '2026-06-30', roomTypes: ['Deluxe', 'Suite'],
    usageLimit: 100, usedCount: 88, enabled: true, approval: 'Approved',
    submittedAt: '2026-05-10T11:30:00', createdAt: '2026-05-10T11:30:00',
  },
  {
    id: 'cp4', code: 'WEEKEND15', description: 'Weekend getaway — 15% off Fri–Sun stays.',
    discountType: 'Percentage', value: 15, minSpend: 0,
    startsAt: '2026-06-20', expiresAt: '2026-09-30', roomTypes: ['Superior', 'Deluxe'],
    usageLimit: 150, usedCount: 0, enabled: true, approval: 'Pending',
    submittedAt: '2026-06-01T14:00:00', createdAt: '2026-06-01T14:00:00',
  },
  {
    id: 'cp5', code: 'SPRING20', description: 'Spring promotion — 20% off.',
    discountType: 'Percentage', value: 20, minSpend: 0,
    startsAt: '2026-03-01', expiresAt: '2026-05-31', roomTypes: [],
    usageLimit: 100, usedCount: 64, enabled: true, approval: 'Approved',
    submittedAt: '2026-02-20T10:00:00', createdAt: '2026-02-20T10:00:00',
  },
  {
    id: 'cp6', code: 'VIP100K', description: '100,000 off for VIP guests, bookings over 500,000.',
    discountType: 'Fixed', value: 100000, minSpend: 500000,
    startsAt: '2026-05-01', expiresAt: '2026-06-15', roomTypes: ['Suite'],
    usageLimit: 20, usedCount: 20, enabled: true, approval: 'Approved',
    submittedAt: '2026-04-25T16:20:00', createdAt: '2026-04-25T16:20:00',
  },
  {
    id: 'cp7', code: 'FLASH30', description: 'Flash sale — 30% off, limited window.',
    discountType: 'Percentage', value: 30, minSpend: 0,
    startsAt: '2026-06-01', expiresAt: '2026-06-10', roomTypes: ['Standard', 'Superior'],
    usageLimit: 50, usedCount: 12, enabled: false, approval: 'Approved',
    submittedAt: '2026-05-29T09:00:00', createdAt: '2026-05-29T09:00:00',
  },
  {
    id: 'cp8', code: 'LOYALTY5', description: 'Returning-guest reward — 5% off, always on.',
    discountType: 'Percentage', value: 5, minSpend: 0,
    startsAt: '2026-01-01', expiresAt: '2026-12-31', roomTypes: [],
    usageLimit: 0, usedCount: 540, enabled: true, approval: 'Approved',
    submittedAt: '2026-01-02T08:05:00', createdAt: '2026-01-02T08:05:00',
  },
  {
    id: 'cp9', code: 'EARLYBIRD12', description: 'Book early — 12% off stays over 150,000.',
    discountType: 'Percentage', value: 12, minSpend: 150000,
    startsAt: '2026-06-02', expiresAt: '2026-07-15', roomTypes: ['Family', 'Suite'],
    usageLimit: 300, usedCount: 5, enabled: true, approval: 'Rejected',
    submittedAt: '2026-06-01T07:40:00',
    reviewNote: 'Minimum spend is too low for a 12% discount — please raise it to 200,000 and resubmit.',
    createdAt: '2026-06-01T07:40:00',
  },
];
