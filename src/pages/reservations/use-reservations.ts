import { create } from 'zustand';
import { DEMO_RESERVATIONS, type Reservation, type ReservationStatus, type RateType } from './reservations-data';

interface ReservationsState {
  reservations: Reservation[];
  setStatus: (id: string, status: ReservationStatus) => void;
  /** Move a reservation to a different room (type + number), optionally repricing. */
  changeRoom: (id: string, roomType: string, roomNo: string, amount?: number) => void;
  /** Save (or clear) the internal manager note for a reservation. */
  setManagerNote: (id: string, note: string, at?: string) => void;
  /** Extend a stay: new check-out date, new night count, and repriced total.
   *  Pass `rateType` to also switch the booking type (e.g. converting a
   *  day-use session into an overnight stay). */
  extendStay: (id: string, checkOut: string, nights: number, amount: number, rateType?: RateType) => void;
  /** Mark a reservation as paid (e.g. a walk-in settling at the counter). */
  setPaid: (id: string) => void;
  /** Link a reservation to a customer record (e.g. after creating a profile for an unregistered guest). */
  linkCustomer: (id: string, customerId: string) => void;
  removeReservation: (id: string) => void;
}

export const useReservations = create<ReservationsState>((set) => ({
  reservations: DEMO_RESERVATIONS,
  setStatus: (id, status) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)) })),
  changeRoom: (id, roomType, roomNo, amount) =>
    set((s) => ({
      reservations: s.reservations.map((r) =>
        r.id === id ? { ...r, roomType, roomNo, ...(amount != null ? { amount } : {}) } : r,
      ),
    })),
  setManagerNote: (id, note, at) =>
    set((s) => ({
      reservations: s.reservations.map((r) =>
        r.id === id ? { ...r, managerNote: note || undefined, managerNoteAt: note ? (at ?? r.managerNoteAt) : undefined } : r,
      ),
    })),
  extendStay: (id, checkOut, nights, amount, rateType) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, checkOut, nights, amount, ...(rateType ? { rateType } : {}) } : r)) })),
  setPaid: (id) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, paymentStatus: 'Paid' } : r)) })),
  linkCustomer: (id, customerId) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, customerId } : r)) })),
  removeReservation: (id) =>
    set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) })),
}));
