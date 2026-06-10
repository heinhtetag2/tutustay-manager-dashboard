import { create } from 'zustand';

/**
 * Demo session state.
 *
 * Intentionally in-memory only (no localStorage): a full page refresh resets
 * the store, so the manager always lands back on Login → Onboarding → Dashboard.
 * In-app navigation keeps the session, so you only walk the flow once per load.
 */
interface SessionState {
  loggedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

export const useSession = create<SessionState>((set) => ({
  loggedIn: false,
  signIn: () => set({ loggedIn: true }),
  signOut: () => set({ loggedIn: false }),
}));
