import { create } from 'zustand';
import { DEMO_SETTLEMENTS, type Settlement } from './settlements-data';

interface SettlementsState {
  settlements: Settlement[];
  /** Mark a settlement as paid (records the settle time, clears the schedule). */
  markPaid: (id: string, settledAt: string) => void;
}

export const useSettlements = create<SettlementsState>((set) => ({
  settlements: DEMO_SETTLEMENTS,
  markPaid: (id, settledAt) =>
    set((s) => ({
      settlements: s.settlements.map((x) =>
        x.id === id ? { ...x, status: 'Paid', settledAt, scheduledFor: undefined } : x,
      ),
    })),
}));
