import type { AppliedCoupon } from '@/shared/ui/coupon-badge';

export type ReservationStatus = 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled' | 'No-show';

/** Whether the stay has been paid for yet. Online bookings are paid up-front;
 *  walk-ins are billed at the property and stay 'Unpaid' until settled. */
export type PaymentStatus = 'Paid' | 'Unpaid';
/** How the booking came in / how it's billed. */
export type PaymentMethod = 'Online' | 'Walk-in';

export const RESERVATION_STATUSES: ReservationStatus[] = ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'];

/** How the stay is priced/booked: per-night (Regular), short day-use block
 *  (Session), or a weekend rate. Defaults to Regular when unset. */
export type RateType = 'Regular' | 'Session' | 'Weekend';

/** Whether a booking is a short day-use (session) booking rather than an overnight stay. */
export function isDayUse(rateType: RateType | undefined): boolean {
  return rateType === 'Session';
}

/** Short human label for the booking type. */
export function rateLabel(rateType: RateType | undefined): string {
  if (rateType === 'Session') return 'Day use';
  if (rateType === 'Weekend') return 'Weekend';
  return 'Per night';
}

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
  /** Number of nights; 0 for day-use (Session) bookings. */
  nights: number;
  guests: number;
  /** Total amount for the stay (final price, after any coupon). */
  amount: number;
  /** Coupon redeemed on this booking, if any. */
  coupon?: AppliedCoupon;
  /** Booking/pricing type. Omitted = Regular (per night). */
  rateType?: RateType;
  /** Payment state. Omitted = 'Paid' (online bookings are paid up-front). */
  paymentStatus?: PaymentStatus;
  /** Booking channel / billing method. Omitted = 'Online'. */
  paymentMethod?: PaymentMethod;
  status: ReservationStatus;
  /** ISO datetime the reservation was created. */
  createdAt: string;
  /** A request/note the guest left at booking (special requests, arrival time, etc.). */
  guestNote?: string;
  /** Internal manager note for this reservation (not shown to the guest). */
  managerNote?: string;
  /** ISO datetime the manager note was last saved. */
  managerNoteAt?: string;
}

export function formatAmount(value: number): string {
  return value.toLocaleString('en-US');
}

/** Paid unless explicitly marked 'Unpaid' (walk-ins awaiting payment). */
export function isPaid(r: { paymentStatus?: PaymentStatus }): boolean {
  return r.paymentStatus !== 'Unpaid';
}

/** Display label for how the booking is billed. */
export function paymentMethodLabel(r: { paymentMethod?: PaymentMethod }): string {
  return r.paymentMethod === 'Walk-in' ? 'Walk-in' : 'Online';
}

/** Amounts that count toward revenue (exclude cancellations / no-shows). */
export function countsAsRevenue(status: ReservationStatus): boolean {
  return status === 'Confirmed' || status === 'Checked-in' || status === 'Checked-out';
}

export const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'rsv1', code: 'RSV-1042', customerId: 'c1', guestName: 'Daniel Foster', guestEmail: 'daniel.foster@example.com',
    roomType: 'Deluxe', roomNo: '305', checkIn: '2026-05-29T14:00:00', checkOut: '2026-05-31T12:00:00', nights: 2, guests: 2, amount: 160000,
    status: 'Checked-in', createdAt: '2026-05-20T10:15:00',
    guestNote: 'High-floor room if possible, away from the elevator. Arriving around 9 PM.',
    managerNote: 'Repeat corporate guest — upgrade when availability allows.',
    managerNoteAt: '2026-05-21T09:30:00',
  },
  {
    id: 'rsv2', code: 'RSV-1051', customerId: 'c2', guestName: 'Grace Park', guestEmail: 'grace.park@example.com',
    roomType: 'Superior', roomNo: '210', checkIn: '2026-06-04T14:00:00', checkOut: '2026-06-07T12:00:00', nights: 3, guests: 1, amount: 270000,
    guestNote: 'Celebrating an anniversary — would appreciate a quiet room with a view.',
    rateType: 'Weekend', status: 'Confirmed', createdAt: '2026-06-01T08:10:00',
  },
  {
    id: 'rsv3', code: 'RSV-1048', customerId: 'c3', guestName: 'Marcus Lee', guestEmail: 'marcus.lee@example.com',
    roomType: 'Deluxe', roomNo: '402', checkIn: '2026-06-01T13:00:00', checkOut: '2026-06-01T18:00:00', nights: 0, guests: 2, amount: 45000,
    rateType: 'Session', status: 'Checked-in', createdAt: '2026-05-30T22:05:00',
  },
  {
    id: 'rsv4', code: 'RSV-1053', customerId: 'c4', guestName: 'Sofia Marin', guestEmail: 'sofia.marin@example.com',
    roomType: 'Deluxe', roomNo: '308', checkIn: '2026-06-07T14:00:00', checkOut: '2026-06-11T12:00:00', nights: 4, guests: 3, amount: 320000,
    rateType: 'Weekend', status: 'Confirmed', createdAt: '2026-05-31T14:20:00',
  },
  {
    id: 'rsv5', code: 'RSV-1009', customerId: 'c5', guestName: 'Aiko Tanaka', guestEmail: 'aiko.tanaka@example.com',
    roomType: 'Deluxe', roomNo: '301', checkIn: '2026-05-12T14:00:00', checkOut: '2026-05-15T12:00:00', nights: 3, guests: 2, amount: 240000,
    coupon: { code: 'WELCOME10', discountType: 'Percentage', value: 10, amountSaved: 26000 },
    status: 'Checked-out', createdAt: '2026-05-02T09:40:00',
  },
  {
    id: 'rsv6', code: 'RSV-1021', customerId: 'c6', guestName: 'Omar Haddad', guestEmail: 'omar.haddad@example.com',
    roomType: 'Superior', roomNo: '215', checkIn: '2026-05-20T14:00:00', checkOut: '2026-05-21T12:00:00', nights: 1, guests: 1, amount: 90000,
    status: 'Cancelled', createdAt: '2026-05-15T18:00:00',
  },
  {
    id: 'rsv7', code: 'RSV-1055', guestName: 'Liam Brooks', guestEmail: 'liam.brooks@example.com',
    roomType: 'Superior', roomNo: '220', checkIn: '2026-06-10T14:00:00', checkOut: '2026-06-12T12:00:00', nights: 2, guests: 2, amount: 180000,
    status: 'Confirmed', createdAt: '2026-05-31T19:45:00',
  },
  {
    id: 'rsv8', code: 'RSV-1037', guestName: 'Hannah Schmidt', guestEmail: 'hannah.schmidt@example.com',
    roomType: 'Superior', roomNo: '218', checkIn: '2026-05-25T14:00:00', checkOut: '2026-05-28T12:00:00', nights: 3, guests: 2, amount: 270000,
    status: 'No-show', createdAt: '2026-05-22T11:30:00',
  },

  // ── Additional June 2026 demo bookings (spread across the month) ──
  {
    id: 'rsv9', code: 'RSV-1056', customerId: 'c7', guestName: 'Elena Rossi', guestEmail: 'elena.rossi@example.com',
    roomType: 'Suite', roomNo: '501', checkIn: '2026-06-02T14:00:00', checkOut: '2026-06-05T12:00:00', nights: 3, guests: 2, amount: 540000,
    coupon: { code: 'FLASH30', discountType: 'Percentage', value: 30, amountSaved: 180000 },
    status: 'Confirmed', createdAt: '2026-05-28T13:00:00',
  },
  {
    id: 'rsv10', code: 'RSV-1057', guestName: 'Noah Williams', guestEmail: 'noah.williams@example.com',
    roomType: 'Standard', roomNo: '112', checkIn: '2026-06-03T10:00:00', checkOut: '2026-06-03T15:00:00', nights: 0, guests: 1, amount: 35000,
    rateType: 'Session', status: 'Confirmed', createdAt: '2026-05-29T09:20:00',
  },
  {
    id: 'rsv11', code: 'RSV-1058', customerId: 'c8', guestName: 'Yuki Sato', guestEmail: 'yuki.sato@example.com',
    roomType: 'Deluxe', roomNo: '309', checkIn: '2026-06-03T14:00:00', checkOut: '2026-06-06T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-05-29T15:45:00',
  },
  {
    id: 'rsv12', code: 'RSV-1059', guestName: 'Carlos Mendez', guestEmail: 'carlos.mendez@example.com',
    roomType: 'Superior', roomNo: '212', checkIn: '2026-06-05T14:00:00', checkOut: '2026-06-08T12:00:00', nights: 3, guests: 2, amount: 270000,
    status: 'Confirmed', createdAt: '2026-05-30T11:10:00',
  },
  {
    id: 'rsv13', code: 'RSV-1060', guestName: 'Priya Nair', guestEmail: 'priya.nair@example.com',
    roomType: 'Family', roomNo: '410', checkIn: '2026-06-05T14:00:00', checkOut: '2026-06-09T12:00:00', nights: 4, guests: 4, amount: 560000,
    status: 'Confirmed', createdAt: '2026-05-30T17:30:00',
  },
  {
    id: 'rsv14', code: 'RSV-1061', guestName: 'Thomas Berg', guestEmail: 'thomas.berg@example.com',
    roomType: 'Standard', roomNo: '108', checkIn: '2026-06-06T14:00:00', checkOut: '2026-06-07T12:00:00', nights: 1, guests: 1, amount: 70000,
    status: 'Cancelled', createdAt: '2026-05-31T08:00:00',
  },
  {
    id: 'rsv15', code: 'RSV-1062', customerId: 'c9', guestName: 'Isabella Cruz', guestEmail: 'isabella.cruz@example.com',
    roomType: 'Deluxe', roomNo: '303', checkIn: '2026-06-08T14:00:00', checkOut: '2026-06-10T12:00:00', nights: 2, guests: 2, amount: 170000,
    status: 'Confirmed', createdAt: '2026-05-31T10:25:00',
  },
  {
    id: 'rsv16', code: 'RSV-1063', guestName: 'Mohammed Ali', guestEmail: 'mohammed.ali@example.com',
    roomType: 'Superior', roomNo: '216', checkIn: '2026-06-08T14:00:00', checkOut: '2026-06-12T12:00:00', nights: 4, guests: 2, amount: 360000,
    status: 'Confirmed', createdAt: '2026-05-31T12:15:00',
  },
  {
    id: 'rsv17', code: 'RSV-1064', guestName: 'Chloe Dubois', guestEmail: 'chloe.dubois@example.com',
    roomType: 'Standard', roomNo: '115', checkIn: '2026-06-08T14:00:00', checkOut: '2026-06-09T12:00:00', nights: 1, guests: 1, amount: 75000,
    status: 'Confirmed', createdAt: '2026-06-01T07:40:00',
  },
  {
    id: 'rsv18', code: 'RSV-1065', guestName: 'James O’Connor', guestEmail: 'james.oconnor@example.com',
    roomType: 'Suite', roomNo: '502', checkIn: '2026-06-09T14:00:00', checkOut: '2026-06-13T12:00:00', nights: 4, guests: 2, amount: 720000,
    status: 'Confirmed', createdAt: '2026-06-01T09:55:00',
  },
  {
    id: 'rsv19', code: 'RSV-1066', guestName: 'Amara Okafor', guestEmail: 'amara.okafor@example.com',
    roomType: 'Deluxe', roomNo: '306', checkIn: '2026-06-11T14:00:00', checkOut: '2026-06-14T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-06-01T14:05:00',
  },
  {
    id: 'rsv20', code: 'RSV-1067', guestName: 'Lars Nilsson', guestEmail: 'lars.nilsson@example.com',
    roomType: 'Superior', roomNo: '214', checkIn: '2026-06-11T14:00:00', checkOut: '2026-06-12T12:00:00', nights: 1, guests: 1, amount: 90000,
    status: 'Confirmed', createdAt: '2026-06-01T16:20:00',
  },
  {
    id: 'rsv21', code: 'RSV-1068', guestName: 'Sophie Turner', guestEmail: 'sophie.turner@example.com',
    roomType: 'Standard', roomNo: '110', checkIn: '2026-06-12T14:00:00', checkOut: '2026-06-15T12:00:00', nights: 3, guests: 2, amount: 210000,
    status: 'Confirmed', createdAt: '2026-06-02T08:30:00',
  },
  {
    id: 'rsv22', code: 'RSV-1069', guestName: 'Diego Silva', guestEmail: 'diego.silva@example.com',
    roomType: 'Deluxe', roomNo: '304', checkIn: '2026-06-13T14:00:00', checkOut: '2026-06-16T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-06-02T10:00:00',
  },
  {
    id: 'rsv23', code: 'RSV-1070', guestName: 'Mei Chen', guestEmail: 'mei.chen@example.com',
    roomType: 'Superior', roomNo: '219', checkIn: '2026-06-13T14:00:00', checkOut: '2026-06-14T12:00:00', nights: 1, guests: 1, amount: 90000,
    status: 'Confirmed', createdAt: '2026-06-02T11:45:00',
  },
  {
    id: 'rsv24', code: 'RSV-1071', guestName: 'Felix Wagner', guestEmail: 'felix.wagner@example.com',
    roomType: 'Standard', roomNo: '107', checkIn: '2026-06-13T14:00:00', checkOut: '2026-06-15T12:00:00', nights: 2, guests: 2, amount: 140000,
    status: 'Cancelled', createdAt: '2026-06-02T13:10:00',
  },
  {
    id: 'rsv25', code: 'RSV-1072', guestName: 'Olivia Bennett', guestEmail: 'olivia.bennett@example.com',
    roomType: 'Family', roomNo: '412', checkIn: '2026-06-13T14:00:00', checkOut: '2026-06-17T12:00:00', nights: 4, guests: 4, amount: 560000,
    status: 'Confirmed', createdAt: '2026-06-02T15:25:00',
  },
  {
    id: 'rsv26', code: 'RSV-1073', guestName: 'Henrik Larsen', guestEmail: 'henrik.larsen@example.com',
    roomType: 'Deluxe', roomNo: '307', checkIn: '2026-06-15T14:00:00', checkOut: '2026-06-18T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-06-03T09:00:00',
  },
  {
    id: 'rsv27', code: 'RSV-1074', guestName: 'Valentina Romano', guestEmail: 'valentina.romano@example.com',
    roomType: 'Suite', roomNo: '503', checkIn: '2026-06-15T14:00:00', checkOut: '2026-06-19T12:00:00', nights: 4, guests: 2, amount: 720000,
    status: 'Confirmed', createdAt: '2026-06-03T10:40:00',
  },
  {
    id: 'rsv28', code: 'RSV-1075', guestName: 'Ethan Walker', guestEmail: 'ethan.walker@example.com',
    roomType: 'Standard', roomNo: '113', checkIn: '2026-06-17T14:00:00', checkOut: '2026-06-19T12:00:00', nights: 2, guests: 1, amount: 140000,
    status: 'No-show', createdAt: '2026-06-04T08:15:00',
  },
  {
    id: 'rsv29', code: 'RSV-1076', guestName: 'Fatima Zahra', guestEmail: 'fatima.zahra@example.com',
    roomType: 'Deluxe', roomNo: '302', checkIn: '2026-06-18T14:00:00', checkOut: '2026-06-21T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-06-04T12:30:00',
  },
  {
    id: 'rsv30', code: 'RSV-1077', guestName: 'Daniel Kim', guestEmail: 'daniel.kim@example.com',
    roomType: 'Superior', roomNo: '217', checkIn: '2026-06-18T14:00:00', checkOut: '2026-06-20T12:00:00', nights: 2, guests: 2, amount: 180000,
    status: 'Confirmed', createdAt: '2026-06-04T14:50:00',
  },
  {
    id: 'rsv31', code: 'RSV-1078', guestName: 'Grace Mwangi', guestEmail: 'grace.mwangi@example.com',
    roomType: 'Standard', roomNo: '109', checkIn: '2026-06-20T14:00:00', checkOut: '2026-06-22T12:00:00', nights: 2, guests: 1, amount: 140000,
    status: 'Confirmed', createdAt: '2026-06-05T09:10:00',
  },
  {
    id: 'rsv32', code: 'RSV-1079', guestName: 'Lucas Moreau', guestEmail: 'lucas.moreau@example.com',
    roomType: 'Deluxe', roomNo: '310', checkIn: '2026-06-20T14:00:00', checkOut: '2026-06-23T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-06-05T11:35:00',
  },
  {
    id: 'rsv33', code: 'RSV-1080', guestName: 'Anika Sharma', guestEmail: 'anika.sharma@example.com',
    roomType: 'Family', roomNo: '411', checkIn: '2026-06-22T14:00:00', checkOut: '2026-06-26T12:00:00', nights: 4, guests: 4, amount: 560000,
    status: 'Confirmed', createdAt: '2026-06-06T08:45:00',
  },
  {
    id: 'rsv34', code: 'RSV-1081', guestName: 'Robert Hayes', guestEmail: 'robert.hayes@example.com',
    roomType: 'Superior', roomNo: '213', checkIn: '2026-06-23T14:00:00', checkOut: '2026-06-25T12:00:00', nights: 2, guests: 2, amount: 180000,
    paymentMethod: 'Walk-in', paymentStatus: 'Unpaid',
    status: 'Confirmed', createdAt: '2026-06-06T13:20:00',
    guestNote: 'Travelling with a toddler — an extra bed or crib would be appreciated.',
  },
  {
    id: 'rsv35', code: 'RSV-1082', guestName: 'Nadia Petrova', guestEmail: 'nadia.petrova@example.com',
    roomType: 'Deluxe', roomNo: '311', checkIn: '2026-06-24T14:00:00', checkOut: '2026-06-27T12:00:00', nights: 3, guests: 2, amount: 255000,
    status: 'Confirmed', createdAt: '2026-06-07T09:30:00',
  },
  {
    id: 'rsv36', code: 'RSV-1083', guestName: 'Samuel Adeyemi', guestEmail: 'samuel.adeyemi@example.com',
    roomType: 'Standard', roomNo: '114', checkIn: '2026-06-24T14:00:00', checkOut: '2026-06-25T12:00:00', nights: 1, guests: 1, amount: 70000,
    status: 'Confirmed', createdAt: '2026-06-07T11:00:00',
  },
  {
    id: 'rsv37', code: 'RSV-1084', guestName: 'Clara Hoffmann', guestEmail: 'clara.hoffmann@example.com',
    roomType: 'Suite', roomNo: '504', checkIn: '2026-06-26T14:00:00', checkOut: '2026-06-29T12:00:00', nights: 3, guests: 2, amount: 540000,
    coupon: { code: 'VIP100K', discountType: 'Fixed', value: 100000, amountSaved: 100000 },
    status: 'Confirmed', createdAt: '2026-06-08T10:15:00',
  },
  {
    id: 'rsv38', code: 'RSV-1085', guestName: 'Victor Nguyen', guestEmail: 'victor.nguyen@example.com',
    roomType: 'Deluxe', roomNo: '305', checkIn: '2026-06-26T14:00:00', checkOut: '2026-06-28T12:00:00', nights: 2, guests: 2, amount: 170000,
    coupon: { code: 'WEEKEND15', discountType: 'Percentage', value: 15, amountSaved: 30000 },
    status: 'Confirmed', createdAt: '2026-06-08T12:40:00',
  },
  {
    id: 'rsv39', code: 'RSV-1086', guestName: 'Leila Haddad', guestEmail: 'leila.haddad@example.com', customerId: 'c7',
    roomType: 'Superior', roomNo: '211', checkIn: '2026-06-26T14:00:00', checkOut: '2026-06-27T12:00:00', nights: 1, guests: 1, amount: 90000,
    status: 'Cancelled', createdAt: '2026-06-08T14:05:00',
  },
  {
    id: 'rsv40', code: 'RSV-1087', guestName: 'Patrick Murphy', guestEmail: 'patrick.murphy@example.com',
    roomType: 'Standard', roomNo: '111', checkIn: '2026-06-28T14:00:00', checkOut: '2026-06-30T12:00:00', nights: 2, guests: 2, amount: 140000,
    status: 'Confirmed', createdAt: '2026-06-09T08:20:00',
  },
  {
    id: 'rsv41', code: 'RSV-1088', guestName: 'Sara Lindqvist', guestEmail: 'sara.lindqvist@example.com',
    roomType: 'Deluxe', roomNo: '308', checkIn: '2026-06-29T14:00:00', checkOut: '2026-07-02T12:00:00', nights: 3, guests: 2, amount: 255000,
    coupon: { code: 'STAY50K', discountType: 'Fixed', value: 50000, amountSaved: 50000 },
    status: 'Confirmed', createdAt: '2026-06-09T10:50:00',
  },
  {
    id: 'rsv42', code: 'RSV-1089', guestName: 'Tariq Aziz', guestEmail: 'tariq.aziz@example.com',
    roomType: 'Superior', roomNo: '220', checkIn: '2026-06-29T14:00:00', checkOut: '2026-06-30T12:00:00', nights: 1, guests: 1, amount: 90000,
    paymentMethod: 'Walk-in', paymentStatus: 'Unpaid',
    status: 'Confirmed', createdAt: '2026-06-09T13:15:00',
    guestNote: 'Late check-in expected, around 11 PM. Please hold the room.',
  },
  {
    id: 'rsv43', code: 'RSV-1090', guestName: 'Beatrice Conti', guestEmail: 'beatrice.conti@example.com',
    roomType: 'Family', roomNo: '413', checkIn: '2026-06-30T14:00:00', checkOut: '2026-07-03T12:00:00', nights: 3, guests: 4, amount: 420000,
    coupon: { code: 'SUMMER25', discountType: 'Percentage', value: 25, amountSaved: 140000 },
    status: 'Confirmed', createdAt: '2026-06-10T09:00:00',
  },
];
