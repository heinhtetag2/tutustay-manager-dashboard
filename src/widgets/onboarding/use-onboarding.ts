import { create } from 'zustand';

/** Named coach-mark tours. */
export type TourId = 'dashboard' | 'rooms';

/**
 * First-run onboarding state.
 *
 * Intentionally in-memory only (no localStorage): this is a demo environment,
 * so a full page refresh resets the store and the welcome experience re-appears
 * every time — while in-app navigation keeps it dismissed.
 */
interface OnboardingState {
  /** Welcome modal — opens on first mount (i.e. every refresh). */
  welcomeOpen: boolean;
  openWelcome: () => void;
  closeWelcome: () => void;

  /** Active coach-mark tour (null when none is running). */
  tourId: TourId | null;
  tourStep: number;
  startTour: (id: TourId) => void;
  endTour: () => void;
  setTourStep: (step: number) => void;

  /** Quick-start checklist (collapsed to a pill). */
  checklistCollapsed: boolean;
  toggleChecklist: () => void;

  /** Sample-data ribbon. */
  ribbonDismissed: boolean;
  dismissRibbon: () => void;

  /** Rooms-page guided card (re-shows each refresh). */
  roomsGuideDismissed: boolean;
  dismissRoomsGuide: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  welcomeOpen: true,
  openWelcome: () => set({ welcomeOpen: true }),
  closeWelcome: () => set({ welcomeOpen: false }),

  tourId: null,
  tourStep: 0,
  startTour: (id) => set({ tourId: id, tourStep: 0, welcomeOpen: false }),
  endTour: () => set({ tourId: null, tourStep: 0 }),
  setTourStep: (step) => set({ tourStep: step }),

  checklistCollapsed: false,
  toggleChecklist: () => set((s) => ({ checklistCollapsed: !s.checklistCollapsed })),

  ribbonDismissed: false,
  dismissRibbon: () => set({ ribbonDismissed: true }),

  roomsGuideDismissed: false,
  dismissRoomsGuide: () => set({ roomsGuideDismissed: true }),
}));
