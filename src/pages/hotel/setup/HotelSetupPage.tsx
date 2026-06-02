import { useNavigate } from 'react-router';
import { HotelSetupWizard } from './HotelSetupWizard';

/** Full-page hotel setup flow. Closing returns to Room Management. */
export default function HotelSetupPage() {
  const navigate = useNavigate();
  return <HotelSetupWizard onClose={() => navigate('/hotel/rooms')} />;
}
