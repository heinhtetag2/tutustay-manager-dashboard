import { useNavigate, useSearchParams } from 'react-router';
import { HotelSetupWizard } from './HotelSetupWizard';

/** Full-page hotel setup flow. Supports deep-linking to a step via `?step=N`,
 *  and returning to a custom page via `?from=/path` (defaults to Room Management). */
export default function HotelSetupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const stepParam = Number(params.get('step'));
  const initialStep = Number.isFinite(stepParam) ? stepParam : 0;
  const from = params.get('from') || '/hotel/rooms';
  return <HotelSetupWizard initialStep={initialStep} onClose={() => navigate(from)} />;
}
