import { create } from 'zustand';
import { DEMO_REQUESTS, type BookingRequest, type RequestStatus } from './booking-requests-data';

interface RequestsState {
  requests: BookingRequest[];
  setStatus: (id: string, status: RequestStatus) => void;
  /** Add a new incoming request to the top of the list. */
  addRequest: (request: BookingRequest) => void;
}

export const useBookingRequests = create<RequestsState>((set) => ({
  requests: DEMO_REQUESTS,
  setStatus: (id, status) =>
    set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
  addRequest: (request) =>
    set((s) => (s.requests.some((r) => r.id === request.id) ? s : { requests: [request, ...s.requests] })),
}));
