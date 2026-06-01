import { create } from 'zustand';
import { DEMO_RESERVATIONS, type Reservation, type ReservationStatus } from './reservations-data';

interface ReservationsState {
  reservations: Reservation[];
  setStatus: (id: string, status: ReservationStatus) => void;
}

export const useReservations = create<ReservationsState>((set) => ({
  reservations: DEMO_RESERVATIONS,
  setStatus: (id, status) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)) })),
}));
