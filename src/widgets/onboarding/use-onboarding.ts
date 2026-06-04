import { create } from 'zustand';

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

  /** Coach-mark product tour. */
  tourActive: boolean;
  tourStep: number;
  startTour: () => void;
  endTour: () => void;
  setTourStep: (step: number) => void;

  /** Quick-start checklist (collapsed to a pill). */
  checklistCollapsed: boolean;
  toggleChecklist: () => void;

  /** Sample-data ribbon. */
  ribbonDismissed: boolean;
  dismissRibbon: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  welcomeOpen: true,
  openWelcome: () => set({ welcomeOpen: true }),
  closeWelcome: () => set({ welcomeOpen: false }),

  tourActive: false,
  tourStep: 0,
  startTour: () => set({ tourActive: true, tourStep: 0, welcomeOpen: false }),
  endTour: () => set({ tourActive: false, tourStep: 0 }),
  setTourStep: (step) => set({ tourStep: step }),

  checklistCollapsed: false,
  toggleChecklist: () => set((s) => ({ checklistCollapsed: !s.checklistCollapsed })),

  ribbonDismissed: false,
  dismissRibbon: () => set({ ribbonDismissed: true }),
}));
