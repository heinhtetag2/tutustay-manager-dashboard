import { create } from 'zustand';
import { DEMO_REVIEWS, type Review } from './reviews-data';

interface ReviewsState {
  reviews: Review[];
  /** Add or update the manager reply for a review. */
  setReply: (id: string, reply: string, replyAt: string) => void;
  removeReply: (id: string) => void;
  setHidden: (id: string, hidden: boolean) => void;
  removeReview: (id: string) => void;
}

export const useReviews = create<ReviewsState>((set) => ({
  reviews: DEMO_REVIEWS,
  setReply: (id, reply, replyAt) =>
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, reply, replyAt } : r)) })),
  removeReply: (id) =>
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, reply: undefined, replyAt: undefined } : r)) })),
  setHidden: (id, hidden) =>
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, hidden } : r)) })),
  removeReview: (id) => set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })),
}));
