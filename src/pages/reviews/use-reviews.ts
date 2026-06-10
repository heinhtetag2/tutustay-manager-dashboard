import { create } from 'zustand';
import { DEMO_REVIEWS, type Review, type HideStatus } from './reviews-data';

interface ReviewsState {
  reviews: Review[];
  /** Add or update the manager reply for a review. */
  setReply: (id: string, reply: string, replyAt: string) => void;
  removeReply: (id: string) => void;
  /** Move a review through the hide-from-public moderation flow.
   *  'pending' records the request time + the manager's reason; 'none' clears both. */
  setHideStatus: (id: string, status: HideStatus, at?: string, reason?: string) => void;
  removeReview: (id: string) => void;
}

export const useReviews = create<ReviewsState>((set) => ({
  reviews: DEMO_REVIEWS,
  setReply: (id, reply, replyAt) =>
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, reply, replyAt } : r)) })),
  removeReply: (id) =>
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, reply: undefined, replyAt: undefined } : r)) })),
  setHideStatus: (id, status, at, reason) =>
    set((s) => ({
      reviews: s.reviews.map((r) =>
        r.id === id
          ? {
              ...r,
              hideStatus: status,
              hideRequestedAt: status === 'none' ? undefined : (at ?? r.hideRequestedAt),
              hideReason: status === 'none' ? undefined : (reason ?? r.hideReason),
            }
          : r,
      ),
    })),
  removeReview: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
}));
