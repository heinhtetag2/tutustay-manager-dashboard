export type RequestStatus = 'Pending' | 'Approved' | 'Declined';
/** Which pricing applied to this booking — affects the amount. */
export type RateType = 'Regular' | 'Session' | 'Weekend';

export interface BookingRequest {
  id: string;
  /** Links to a Customer record when the guest is a known customer. */
  customerId?: string;
  guestName: string;
  guestEmail: string;
  roomType: string;
  /** Pricing basis applied to the amount (regular nightly / hourly session / weekend). */
  rateType: RateType;
  /** ISO dates. */
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  /** Total amount for the stay. */
  amount: number;
  /** ISO datetime the request came in. */
  requestedAt: string;
  status: RequestStatus;
  note?: string;
}

export function formatAmount(value: number): string {
  return value.toLocaleString('en-US');
}

export const DEMO_REQUESTS: BookingRequest[] = [
  {
    id: 'br1',
    customerId: 'c2',
    guestName: 'Grace Park',
    guestEmail: 'grace.park@example.com',
    roomType: 'Superior',
    rateType: 'Weekend',
    checkIn: '2026-06-04',
    checkOut: '2026-06-07',
    nights: 3,
    guests: 1,
    amount: 270000,
    requestedAt: '2026-06-01T08:10:00',
    status: 'Pending',
    note: 'Late arrival, around 11 PM.',
  },
  {
    id: 'br2',
    customerId: 'c1',
    guestName: 'Daniel Foster',
    guestEmail: 'daniel.foster@example.com',
    roomType: 'Deluxe',
    rateType: 'Regular',
    checkIn: '2026-06-02',
    checkOut: '2026-06-04',
    nights: 2,
    guests: 2,
    amount: 160000,
    requestedAt: '2026-06-01T07:30:00',
    status: 'Pending',
  },
  {
    id: 'br3',
    guestName: 'Liam Brooks',
    guestEmail: 'liam.brooks@example.com',
    roomType: 'Superior',
    rateType: 'Regular',
    checkIn: '2026-06-10',
    checkOut: '2026-06-12',
    nights: 2,
    guests: 2,
    amount: 180000,
    requestedAt: '2026-05-31T19:45:00',
    status: 'Pending',
    note: 'Requesting a twin-bed setup.',
  },
  {
    id: 'br4',
    customerId: 'c4',
    guestName: 'Sofia Marin',
    guestEmail: 'sofia.marin@example.com',
    roomType: 'Deluxe',
    rateType: 'Weekend',
    checkIn: '2026-06-07',
    checkOut: '2026-06-11',
    nights: 4,
    guests: 3,
    amount: 320000,
    requestedAt: '2026-05-31T14:20:00',
    status: 'Approved',
  },
  {
    id: 'br5',
    customerId: 'c3',
    guestName: 'Marcus Lee',
    guestEmail: 'marcus.lee@example.com',
    roomType: 'Deluxe',
    rateType: 'Session',
    checkIn: '2026-06-01',
    checkOut: '2026-06-02',
    nights: 1,
    guests: 2,
    amount: 90000,
    requestedAt: '2026-05-30T22:05:00',
    status: 'Declined',
    note: 'No availability for the requested dates.',
  },
  {
    id: 'br6',
    guestName: 'Hannah Schmidt',
    guestEmail: 'hannah.schmidt@example.com',
    roomType: 'Superior',
    rateType: 'Regular',
    checkIn: '2026-06-15',
    checkOut: '2026-06-18',
    nights: 3,
    guests: 2,
    amount: 270000,
    requestedAt: '2026-05-30T10:00:00',
    status: 'Pending',
  },
];
