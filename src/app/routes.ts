import { createBrowserRouter } from 'react-router';
import Layout from './Layout';
import Dashboard from '@/pages/dashboard';
import Companies from '@/pages/companies';
import CompanyDetail from '@/pages/company-detail';
import Respondents from '@/pages/respondents';
import RespondentDetail from '@/pages/respondent-detail';
import Agents from '@/pages/agents';
import AgentDetail from '@/pages/agents/AgentDetail';
import Customers from '@/pages/customers';
import CustomerDetail from '@/pages/customers/CustomerDetail';
import Reviews from '@/pages/reviews';
import BookingRequests from '@/pages/booking-requests';
import BookingRequestDetail from '@/pages/booking-requests/BookingRequestDetail';
import Reservations from '@/pages/reservations';
import ReservationDetail from '@/pages/reservations/ReservationDetail';
import SalesCalendar from '@/pages/sales-calendar';
import Coupons from '@/pages/coupons';
import CouponDetail from '@/pages/coupons/CouponDetail';
import Settlements from '@/pages/settlements';
import SettlementDetail from '@/pages/settlements/SettlementDetail';
import Rooms from '@/pages/hotel/Rooms';
import RoomDetail from '@/pages/hotel/RoomDetail';
import RoomTypeDetail from '@/pages/hotel/RoomTypeDetail';
import Help from '@/pages/help';
import Settings from '@/pages/settings';
import HotelSetupPage from '@/pages/hotel/setup/HotelSetupPage';
import SetupHub from '@/pages/setup-hub/SetupHub';
import DesignSystemPage from '@/pages/design-system/DesignSystemPage';
import NotFound from '@/pages/not-found';

export const router = createBrowserRouter([
  // Full-page hotel setup flow — outside the app shell (no sidebar).
  { path: '/hotel/setup', Component: HotelSetupPage },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'dashboard', Component: Dashboard },
      { path: 'setup', Component: SetupHub },
      { path: 'companies', Component: Companies },
      { path: 'companies/:id', Component: CompanyDetail },
      { path: 'respondents', Component: Respondents },
      { path: 'respondents/:id', Component: RespondentDetail },
      { path: 'agents', Component: Agents },
      { path: 'agents/:id', Component: AgentDetail },
      { path: 'customers', Component: Customers },
      { path: 'customers/:id', Component: CustomerDetail },
      { path: 'reviews', Component: Reviews },
      { path: 'booking-requests', Component: BookingRequests },
      { path: 'booking-requests/:id', Component: BookingRequestDetail },
      { path: 'reservations', Component: Reservations },
      { path: 'reservations/:id', Component: ReservationDetail },
      { path: 'sales-calendar', Component: SalesCalendar },
      { path: 'coupons', Component: Coupons },
      { path: 'coupons/:id', Component: CouponDetail },
      { path: 'settlements', Component: Settlements },
      { path: 'settlements/:id', Component: SettlementDetail },
      { path: 'hotel/rooms', Component: Rooms },
      { path: 'hotel/rooms/:id', Component: RoomDetail },
      { path: 'hotel/room-types/:id', Component: RoomTypeDetail },
      { path: 'help', Component: Help },
      { path: 'design-system', Component: DesignSystemPage },
      { path: 'settings', Component: Settings },
      { path: '*', Component: NotFound },
    ],
  },
]);
