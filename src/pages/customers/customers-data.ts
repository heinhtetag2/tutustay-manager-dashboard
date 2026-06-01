export type CustomerStatus = 'Active' | 'Inactive';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Customer {
  /** Stable internal id (used in the detail route). */
  id: string;
  /** Business-facing user identifier shown in the table. */
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  /** ISO datetime of the most recent booking, or '' when none. */
  lastBookingDate: string;
  totalBookings: number;
  /** Lifetime payment. */
  totalPayment: number;
  /** Free-text staff note. */
  notes: string;
  status: CustomerStatus;
  /** ISO date the customer joined. */
  joinedDate: string;
  avatarUrl?: string;

  // --- Extended profile (Customer Details panel) ---
  gender?: Gender;
  /** ISO date; age is derived from this. */
  dateOfBirth?: string;
  nationality?: string;
  /** National / resident registration number (masked in the UI). */
  residentId?: string;
  // Stay details
  reservationNumber?: string;
  reservationDate?: string;
  roomType?: string;
  lastRoomType?: string;
  // Feedback
  rating?: number; // 0–5
}

/** Mask a resident-registration number, keeping the first segment visible. */
export function maskResidentId(id?: string): string {
  if (!id) return '—';
  const head = id.slice(0, 4);
  return head + '*'.repeat(Math.max(0, id.length - 4));
}

/** Comma-grouped amount (no currency symbol). */
export function formatMoney(value: number): string {
  return value.toLocaleString('en-US');
}

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    userId: '1001',
    fullName: 'Daniel Foster',
    email: 'daniel.foster@example.com',
    phone: '+1 415 555 0142',
    lastBookingDate: '2026-05-29T20:30:00',
    totalBookings: 12,
    totalPayment: 1440000,
    notes: 'Prefers high-floor rooms. Repeat corporate guest.',
    status: 'Active',
    joinedDate: '2024-08-14',
    gender: 'Male',
    dateOfBirth: '1989-03-22',
    nationality: 'United States',
    residentId: '',
    reservationNumber: 'RSV-20260529-1001',
    reservationDate: '2026-05-29T16:48:00',
    roomType: 'Deluxe',
    lastRoomType: 'Deluxe',
    rating: 5,
  },
  {
    id: 'c2',
    userId: '1002',
    fullName: 'Grace Park',
    email: 'grace.park@example.com',
    phone: '+82 2 5550 0420',
    lastBookingDate: '2026-05-22T15:10:00',
    totalBookings: 6,
    totalPayment: 720000,
    notes: '',
    status: 'Active',
    joinedDate: '2025-01-09',
    gender: 'Female',
    dateOfBirth: '1992-06-03',
    nationality: 'South Korea',
    residentId: '',
    reservationNumber: 'RSV-20260522-1002',
    reservationDate: '2026-05-22T15:10:00',
    roomType: 'Superior',
    lastRoomType: 'Deluxe',
    rating: 4,
  },
  {
    id: 'c3',
    userId: '1003',
    fullName: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    phone: '+65 6555 0173',
    lastBookingDate: '2026-05-18T09:45:00',
    totalBookings: 3,
    totalPayment: 360000,
    notes: 'Late check-out requested last stay.',
    status: 'Active',
    joinedDate: '2025-07-21',
    gender: 'Male',
    dateOfBirth: '1990-11-12',
    nationality: 'Singapore',
    residentId: '',
    reservationNumber: 'RSV-20260518-1003',
    reservationDate: '2026-05-18T09:45:00',
    roomType: 'Superior',
    lastRoomType: 'Superior',
    rating: 5,
  },
  {
    id: 'c4',
    userId: '1004',
    fullName: 'Sofia Marin',
    email: 'sofia.marin@example.com',
    phone: '+34 91 555 0291',
    lastBookingDate: '2026-04-30T18:00:00',
    totalBookings: 2,
    totalPayment: 240000,
    notes: '',
    status: 'Active',
    joinedDate: '2025-11-02',
    gender: 'Female',
    dateOfBirth: '1994-02-08',
    nationality: 'Spain',
    residentId: '',
    reservationNumber: 'RSV-20260430-1004',
    reservationDate: '2026-04-30T18:00:00',
    roomType: 'Superior',
    lastRoomType: 'Superior',
    rating: 3,
  },
  {
    id: 'c5',
    userId: '1005',
    fullName: 'Aiko Tanaka',
    email: 'aiko.tanaka@example.com',
    phone: '+81 3 5550 0188',
    lastBookingDate: '2026-03-12T11:25:00',
    totalBookings: 8,
    totalPayment: 960000,
    notes: 'VIP — complimentary breakfast on file.',
    status: 'Active',
    joinedDate: '2024-05-30',
    gender: 'Female',
    dateOfBirth: '1991-09-19',
    nationality: 'Japan',
    residentId: '',
    reservationNumber: 'RSV-20260312-1005',
    reservationDate: '2026-03-12T11:25:00',
    roomType: 'Deluxe',
    lastRoomType: 'Deluxe',
    rating: 2,
  },
  {
    id: 'c6',
    userId: '1006',
    fullName: 'Omar Haddad',
    email: 'omar.haddad@example.com',
    phone: '+971 4 555 0420',
    lastBookingDate: '2025-12-20T22:05:00',
    totalBookings: 1,
    totalPayment: 90000,
    notes: '',
    status: 'Inactive',
    joinedDate: '2025-12-18',
    gender: 'Male',
    dateOfBirth: '1996-04-27',
    nationality: 'United Arab Emirates',
    residentId: '',
    reservationNumber: 'RSV-20251220-1006',
    reservationDate: '2025-12-20T22:05:00',
    roomType: 'Superior',
    lastRoomType: 'Superior',
    rating: 5,
  },
];
