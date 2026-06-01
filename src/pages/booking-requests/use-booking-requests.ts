import { create } from 'zustand';
import { DEMO_REQUESTS, type BookingRequest, type RequestStatus } from './booking-requests-data';

interface RequestsState {
  requests: BookingRequest[];
  setStatus: (id: string, status: RequestStatus) => void;
}

export const useBookingRequests = create<RequestsState>((set) => ({
  requests: DEMO_REQUESTS,
  setStatus: (id, status) =>
    set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
}));
