import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarCheck, X, ArrowRight } from 'lucide-react';

export interface BookingToast {
  id: number;
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
                  <CalendarCheck className="w-4 h-4" />
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
                      onClick={() => { dismiss(toast.id); navigate('/'); }}
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

/* ---- Demo: simulate incoming bookings so the toast is visible in the mock app ---- */

const SAMPLE_BOOKINGS: Omit<BookingToast, 'id'>[] = [
  { guest: 'Daniel Foster', initial: 'D', roomType: 'Deluxe', nights: 2, guests: 2, checkIn: 'Jun 2', amount: '₩160,000' },
  { guest: 'Grace Park', initial: 'G', roomType: 'Superior', nights: 3, guests: 1, checkIn: 'Jun 4', amount: '₩270,000' },
  { guest: 'Marcus Lee', initial: 'M', roomType: 'Deluxe', nights: 1, guests: 2, checkIn: 'Jun 1', amount: '₩90,000' },
  { guest: 'Sofia Marin', initial: 'S', roomType: 'Deluxe', nights: 4, guests: 3, checkIn: 'Jun 7', amount: '₩320,000' },
];

/** Fires a few demo bookings after load + on a gentle interval. Mounts once. */
export function useBookingSimulator() {
  const push = useBookingToasts((s) => s.push);
  const i = useRef(0);
  useEffect(() => {
    const first = setTimeout(() => push(SAMPLE_BOOKINGS[i.current++ % SAMPLE_BOOKINGS.length]), 3500);
    const interval = setInterval(() => push(SAMPLE_BOOKINGS[i.current++ % SAMPLE_BOOKINGS.length]), 45000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [push]);
}
