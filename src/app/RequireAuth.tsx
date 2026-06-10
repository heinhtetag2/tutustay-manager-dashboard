import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from '@/shared/state/use-session';

/** Route guard — sends signed-out visitors to Login. On refresh the in-memory
 *  session resets, so the manager always starts the Login → Onboarding flow. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const loggedIn = useSession((s) => s.loggedIn);
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
