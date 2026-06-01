export type ReservationStatus = 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled' | 'No-show';

export const RESERVATION_STATUSES: ReservationStatus[] = ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'];

export interface Reservation {
  id: string;
  /** Business-facing reservation code shown in the table. */
  code: string;
  /** Links to a Customer record when the guest is registered. */
  customerId?: string;
  guestName: string;
  guestEmail: string;
  roomType: string;
  roomNo: string;
  /** ISO dates. */
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  /** Total amount for the stay. */
  amount: number;
  status: ReservationStatus;
  /** ISO datetime the reservation was created. */
  createdAt: string;
}

export function formatAmount(value: number): string {
  return value.toLocaleString('en-US');
}

/** Amounts that count toward revenue (exclude cancellations / no-shows). */
export function countsAsRevenue(status: ReservationStatus): boolean {
  return status === 'Confirmed' || status === 'Checked-in' || status === 'Checked-out';
}

export const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'rsv1', code: 'RSV-1042', customerId: 'c1', guestName: 'Daniel Foster', guestEmail: 'daniel.foster@example.com',
    roomType: 'Deluxe', roomNo: '305', checkIn: '2026-05-29', checkOut: '2026-05-31', nights: 2, guests: 2, amount: 160000,
    status: 'Checked-in', createdAt: '2026-05-20T10:15:00',
  },
  {
    id: 'rsv2', code: 'RSV-1051', customerId: 'c2', guestName: 'Grace Park', guestEmail: 'grace.park@example.com',
    roomType: 'Superior', roomNo: '210', checkIn: '2026-06-04', checkOut: '2026-06-07', nights: 3, guests: 1, amount: 270000,
    status: 'Confirmed', createdAt: '2026-06-01T08:10:00',
  },
  {
    id: 'rsv3', code: 'RSV-1048', customerId: 'c3', guestName: 'Marcus Lee', guestEmail: 'marcus.lee@example.com',
    roomType: 'Deluxe', roomNo: '402', checkIn: '2026-06-01', checkOut: '2026-06-02', nights: 1, guests: 2, amount: 90000,
    status: 'Checked-in', createdAt: '2026-05-30T22:05:00',
  },
  {
    id: 'rsv4', code: 'RSV-1053', customerId: 'c4', guestName: 'Sofia Marin', guestEmail: 'sofia.marin@example.com',
    roomType: 'Deluxe', roomNo: '308', checkIn: '2026-06-07', checkOut: '2026-06-11', nights: 4, guests: 3, amount: 320000,
    status: 'Confirmed', createdAt: '2026-05-31T14:20:00',
  },
  {
    id: 'rsv5', code: 'RSV-1009', customerId: 'c5', guestName: 'Aiko Tanaka', guestEmail: 'aiko.tanaka@example.com',
    roomType: 'Deluxe', roomNo: '301', checkIn: '2026-05-12', checkOut: '2026-05-15', nights: 3, guests: 2, amount: 240000,
    status: 'Checked-out', createdAt: '2026-05-02T09:40:00',
  },
  {
    id: 'rsv6', code: 'RSV-1021', customerId: 'c6', guestName: 'Omar Haddad', guestEmail: 'omar.haddad@example.com',
    roomType: 'Superior', roomNo: '215', checkIn: '2026-05-20', checkOut: '2026-05-21', nights: 1, guests: 1, amount: 90000,
    status: 'Cancelled', createdAt: '2026-05-15T18:00:00',
  },
  {
    id: 'rsv7', code: 'RSV-1055', guestName: 'Liam Brooks', guestEmail: 'liam.brooks@example.com',
    roomType: 'Superior', roomNo: '220', checkIn: '2026-06-10', checkOut: '2026-06-12', nights: 2, guests: 2, amount: 180000,
    status: 'Confirmed', createdAt: '2026-05-31T19:45:00',
  },
  {
    id: 'rsv8', code: 'RSV-1037', guestName: 'Hannah Schmidt', guestEmail: 'hannah.schmidt@example.com',
    roomType: 'Superior', roomNo: '218', checkIn: '2026-05-25', checkOut: '2026-05-28', nights: 3, guests: 2, amount: 270000,
    status: 'No-show', createdAt: '2026-05-22T11:30:00',
  },
];
