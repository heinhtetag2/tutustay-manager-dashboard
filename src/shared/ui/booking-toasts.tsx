import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { CalendarPlus, X, ArrowRight } from 'lucide-react';
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
}

let seq = 1;
export const useBookingToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (b) => set((s) => ({ toasts: [{ ...b, id: seq++ }, ...s.toasts].slice(0, 3) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const AUTO_DISMISS_MS = 9000;

export function BookingToastHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toasts = useBookingToasts((s) => s.toasts);
  const dismiss = useBookingToasts((s) => s.dismiss);

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-2.5rem)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="pointer-events-auto bg-white border border-[var(--border-default)] rounded-md shadow-[0_8px_28px_rgba(44,38,39,0.14)] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{t('New booking')}</span>
                    <button onClick={() => dismiss(toast.id)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer -mr-1 -mt-0.5 p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mt-0.5 leading-snug">
                    <span className="font-medium">{toast.guest}</span> {t('booked a')} <span className="font-medium">{toast.roomType}</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">
                    {toast.checkIn} · {toast.nights} {toast.nights === 1 ? t('night') : t('nights')} · {toast.guests} {t('guests')} · {toast.amount}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => { dismiss(toast.id); navigate(`/booking-requests/${toast.requestId}`); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                    >
                      {t('View booking')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => dismiss(toast.id)}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
                    >
                      {t('Dismiss')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* auto-dismiss progress */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              onAnimationComplete={() => dismiss(toast.id)}
              style={{ transformOrigin: 'left' }}
              className="h-0.5 bg-[var(--brand-primary)]"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
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
    const first = setTimeout(fire, 3500);
    const interval = setInterval(fire, 45000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [push, addRequest]);
}
