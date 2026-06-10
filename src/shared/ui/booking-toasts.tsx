import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { CalendarPlus, X } from 'lucide-react';
import { useBookingRequests } from '@/pages/booking-requests/use-booking-requests';

export interface BookingToast {
  id: number;
  /** The Booking Request this toast represents (for "View booking"). */
  requestId: string;
  guest: string;
  initial: string;
  roomType: string;
  nights: number;
  guests: number;
  checkIn: string;
  amount: string;
}

interface ToastState {
  toasts: BookingToast[];
  push: (b: Omit<BookingToast, 'id'>) => void;
  dismiss: (id: number) => void;
  dismissAll: () => void;
}

const AUTO_DISMISS_MS = 9000;

let seq = 1;
export const useBookingToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (b) => {
    const id = seq++;
    set((s) => ({ toasts: [{ ...b, id }, ...s.toasts].slice(0, 3) }));
    // Auto-dismiss after a while — no visible loading bar on the toast.
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), AUTO_DISMISS_MS);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),
}));

export function BookingToastHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toasts = useBookingToasts((s) => s.toasts);
  const dismiss = useBookingToasts((s) => s.dismiss);
  const dismissAll = useBookingToasts((s) => s.dismissAll);

  // Collapsed = a deck: newest in front, older ones peek behind it. Hovering the
  // stack fans them out into a readable column. Heights are measured per toast
  // so the expanded layout stacks them exactly with no overlap.
  const [expanded, setExpanded] = useState(false);
  const heights = useRef<Map<number, number>>(new Map());
  const [, forceRender] = useState(0);
  const measure = (id: number) => (el: HTMLDivElement | null) => {
    if (!el) return;
    const h = el.offsetHeight;
    if (heights.current.get(id) !== h) {
      heights.current.set(id, h);
      forceRender((n) => n + 1);
    }
  };

  const GAP = 12; // gap between cards when fanned out
  const PEEK = 14; // how far each card behind peeks up when collapsed
  const h = (id: number) => heights.current.get(id) ?? 132;
  // Vertical offset (upward) for the card at index i (0 = newest/front).
  const offsetFor = (i: number) => {
    if (expanded) {
      let off = 0;
      for (let j = 0; j < i; j++) off += h(toasts[j].id) + GAP;
      return off;
    }
    return i * PEEK;
  };
  // Total height of the stack — the front card plus either the peeks (collapsed)
  // or every card + gaps (fanned out). Drives the hover hit-area height.
  const frontH = toasts.length ? h(toasts[0].id) : 0;
  // Always-visible "Clear all" row sits above the deck; reserve space for it so
  // the deck (and the button) never shift when the stack expands on hover.
  const HEADER_H = toasts.length >= 2 ? 40 : 0;
  const deckHeight = expanded
    ? toasts.reduce((sum, tt) => sum + h(tt.id), 0) + Math.max(0, toasts.length - 1) * GAP
    : frontH + Math.max(0, toasts.length - 1) * PEEK;
  const stackHeight = deckHeight + HEADER_H;

  return (
    <>
      {/* Soft radial glow behind incoming booking toasts */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <motion.div
            key="toast-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 right-0 z-[79] w-[520px] h-[520px] max-w-[100vw] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 70% at 100% 0%, rgba(44,38,39,0.13), rgba(44,38,39,0.05) 42%, transparent 72%)',
            }}
          />
        )}
      </AnimatePresence>

      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{ height: toasts.length === 0 ? 0 : stackHeight }}
        className="fixed top-5 right-5 z-[80] w-[360px] max-w-[calc(100vw-2.5rem)]"
      >
      <AnimatePresence>
        {toasts.map((toast, i) => (
          <motion.div
            key={toast.id}
            ref={measure(toast.id)}
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{
              opacity: 1,
              x: 0,
              y: offsetFor(i) + HEADER_H,
              // Cards behind shrink slightly when collapsed; full size when fanned.
              scale: expanded ? 1 : 1 - i * 0.04,
            }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            style={{ zIndex: toasts.length - i }}
            onClick={() => { dismiss(toast.id); navigate(`/booking-requests/${toast.requestId}`); }}
            className="pointer-events-auto absolute top-0 right-0 left-0 origin-top bg-white border border-[var(--border-default)] rounded-2xl shadow-[0_8px_28px_rgba(44,38,39,0.14)] overflow-hidden cursor-pointer"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{t('New booking')}</span>
                    <button onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer -mr-1 -mt-0.5 p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mt-0.5 leading-snug">
                    <span className="font-medium">{toast.guest}</span> {t('booked a')} <span className="font-medium">{toast.roomType}</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">
                    {toast.checkIn} · {toast.nights} {toast.nights === 1 ? t('night') : t('nights')} · {toast.guests} {t('guests')} · {toast.amount}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* One-click clear — pinned to a stable row above the deck so it never
          moves (and stays clickable) when the stack expands on hover. */}
      <AnimatePresence>
        {toasts.length >= 2 && (
          <motion.button
            key="clear-all"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissAll()}
            className="pointer-events-auto absolute top-0 right-0 inline-flex items-center gap-1.5 rounded-full bg-white border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-[0_4px_16px_rgba(44,38,39,0.10)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            {t('Clear all')} · {toasts.length}
          </motion.button>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

/* ---- Demo: simulate incoming bookings → each becomes a pending Booking Request ---- */

interface IncomingBooking {
  guest: string;
  initial: string;
  guestEmail: string;
  customerId?: string;
  roomType: string;
  rateType: 'Regular' | 'Session' | 'Weekend';
  checkIn: string; // ISO
  checkOut: string; // ISO
  nights: number;
  guests: number;
  amount: number;
}

const INCOMING: IncomingBooking[] = [
  { guest: 'Daniel Foster', initial: 'D', guestEmail: 'daniel.foster@example.com', customerId: 'c1', roomType: 'Deluxe', rateType: 'Regular', checkIn: '2026-06-12', checkOut: '2026-06-14', nights: 2, guests: 2, amount: 160000 },
  { guest: 'Grace Park', initial: 'G', guestEmail: 'grace.park@example.com', customerId: 'c2', roomType: 'Superior', rateType: 'Weekend', checkIn: '2026-06-13', checkOut: '2026-06-15', nights: 2, guests: 1, amount: 180000 },
  { guest: 'Marcus Lee', initial: 'M', guestEmail: 'marcus.lee@example.com', customerId: 'c3', roomType: 'Deluxe', rateType: 'Regular', checkIn: '2026-06-09', checkOut: '2026-06-10', nights: 1, guests: 2, amount: 90000 },
  { guest: 'Sofia Marin', initial: 'S', guestEmail: 'sofia.marin@example.com', customerId: 'c4', roomType: 'Deluxe', rateType: 'Weekend', checkIn: '2026-06-20', checkOut: '2026-06-24', nights: 4, guests: 3, amount: 320000 },
];

let liveSeq = 1;

/**
 * Fires demo bookings after load + on a gentle interval. Each incoming booking
 * is added to the Booking Requests store as a pending request, and the toast's
 * "View booking" links straight to that request.
 */
export function useBookingSimulator() {
  const push = useBookingToasts((s) => s.push);
  const addRequest = useBookingRequests((s) => s.addRequest);
  const i = useRef(0);
  useEffect(() => {
    const fire = () => {
      const b = INCOMING[i.current++ % INCOMING.length];
      const requestId = `br-live-${liveSeq++}`;
      addRequest({
        id: requestId,
        customerId: b.customerId,
        guestName: b.guest,
        guestEmail: b.guestEmail,
        roomType: b.roomType,
        rateType: b.rateType,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        nights: b.nights,
        guests: b.guests,
        amount: b.amount,
        requestedAt: new Date().toISOString(),
        status: 'Pending',
      });
      push({
        requestId,
        guest: b.guest,
        initial: b.initial,
        roomType: b.roomType,
        nights: b.nights,
        guests: b.guests,
        checkIn: format(new Date(b.checkIn), 'MMM d'),
        amount: `${b.amount.toLocaleString('en-US')}`,
      });
    };
    // Hold off incoming-booking toasts for the first ~2 minutes after the
    // dashboard loads — let the manager settle in. Then a quick burst makes the
    // stacked deck visible, followed by a gentle drip every 45s.
    const HOLD_MS = 120_000; // ~2 minutes
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | undefined;
    timeouts.push(
      setTimeout(() => {
        fire();
        timeouts.push(setTimeout(fire, 800));
        timeouts.push(setTimeout(fire, 1600));
        interval = setInterval(fire, 45000);
      }, HOLD_MS),
    );
    return () => { timeouts.forEach(clearTimeout); if (interval) clearInterval(interval); };
  }, [push, addRequest]);
}
