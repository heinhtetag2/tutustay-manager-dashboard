import { create } from 'zustand';
import { DEMO_COUPONS, type Coupon } from './coupons-data';

let idSeq = 0;

interface CouponsState {
  coupons: Coupon[];
  /** Add a new coupon to the top of the list. */
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => void;
  /** Patch an existing coupon's editable fields. */
  updateCoupon: (id: string, patch: Partial<Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>>) => void;
  /** Flip the enabled switch. */
  toggleCoupon: (id: string) => void;
  removeCoupon: (id: string) => void;
}

export const useCoupons = create<CouponsState>((set) => ({
  coupons: DEMO_COUPONS,
  addCoupon: (coupon) =>
    set((s) => ({
      coupons: [
        {
          ...coupon,
          id: `new-${++idSeq}`,
          usedCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...s.coupons,
      ],
    })),
  updateCoupon: (id, patch) =>
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  toggleCoupon: (id) =>
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)) })),
  removeCoupon: (id) => set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),
}));
