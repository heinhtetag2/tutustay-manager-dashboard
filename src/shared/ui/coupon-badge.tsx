import { TicketPercent } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/** A coupon redeemed on a booking. The booking's `amount` is the final price
 *  after the discount; `amountSaved` is what came off the original total. */
export interface AppliedCoupon {
  /** Redemption code, e.g. "SUMMER25". */
  code: string;
  /** Percentage or fixed-amount discount. */
  discountType: 'Percentage' | 'Fixed';
  /** Percent (e.g. 25) when Percentage, or a fixed amount when Fixed. */
  value: number;
  /** Actual amount taken off the stay total. */
  amountSaved: number;
}

/** Human-readable discount, e.g. "25% off" or "50,000 off". */
export function discountLabel(c: AppliedCoupon): string {
  return c.discountType === 'Percentage'
    ? `${c.value}% off`
    : `${c.amountSaved.toLocaleString('en-US')} off`;
}

/** Original price before the coupon was applied. */
export function originalAmount(amount: number, c: AppliedCoupon): number {
  return amount + c.amountSaved;
}

/** Compact pill shown beside an amount when a coupon was redeemed. */
export function CouponBadge({
  coupon,
  className,
}: {
  coupon: AppliedCoupon;
  className?: string;
}) {
  return (
    <span
      title={`Coupon ${coupon.code} · ${coupon.amountSaved.toLocaleString('en-US')} off`}
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] text-[10px] font-medium max-w-full align-middle',
        className,
      )}
    >
      <TicketPercent className="w-3 h-3 shrink-0" />
      <span className="truncate tabular-nums">{coupon.code}</span>
    </span>
  );
}
