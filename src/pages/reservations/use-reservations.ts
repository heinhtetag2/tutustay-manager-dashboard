import { create } from 'zustand';
import { DEMO_RESERVATIONS, type Reservation, type ReservationStatus } from './reservations-data';

interface ReservationsState {
  reservations: Reservation[];
  setStatus: (id: string, status: ReservationStatus) => void;
  removeReservation: (id: string) => void;
}

export const useReservations = create<ReservationsState>((set) => ({
  reservations: DEMO_RESERVATIONS,
  setStatus: (id, status) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)) })),
  removeReservation: (id) =>
    set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) })),
}));
