import { useNavigate, useSearchParams } from 'react-router';
import { HotelSetupWizard } from './HotelSetupWizard';
import { useOnboarding } from '@/widgets/onboarding';

/** Full-page hotel setup flow. Supports deep-linking to a step via `?step=N`,
 *  and returning to a custom page via `?from=/path` (defaults to Room Management). */
export default function HotelSetupPage() {
  const navigate = useNavigate();
  const openWelcome = useOnboarding((s) => s.openWelcome);
  const [params] = useSearchParams();
  const stepParam = Number(params.get('step'));
  const initialStep = Number.isFinite(stepParam) ? stepParam : 0;
  const from = params.get('from') || '/hotel/rooms';
  const handleClose = () => {
    // First-run finish: returning to the dashboard greets the manager with the
    // welcome intro + product tour. (Explicit so it shows even on in-app nav.)
    if (from === '/') openWelcome();
    navigate(from);
  };
  return <HotelSetupWizard initialStep={initialStep} onClose={handleClose} />;
}
