export type ContractStatus = 'Pending' | 'Approved' | 'Rejected';
export type RoomStatus = 'Active' | 'Inactive';

export const AMENITIES = [
  'WiFi',
  'Breakfast',
  'Parking',
  'Swimming Pool',
  'Fitness Centre/Gym',
  'SPA & Wellness Centre',
  'Currency Exchange & ATM',
  'Airport Pickup',
  'Cafe',
] as const;

export const ACCOMMODATION_TYPES = [
  'Hotel',
  'Resort',
  'Guesthouse',
  'Motel',
] as const;

export interface Property {
  name: string;
  address: string;
  accommodationType: string;
  starRating: number;
  // Location (detailed address)
  country: string;
  state: string;
  district: string;
  township: string;
  latitude?: number;
  longitude?: number;
  checkInTime: string;
  checkOutTime: string;
  mainAmenities: string[];
  frontDeskNumber: string;
  frontDeskEmail: string;
  // Seller (owner)
  representativeName: string;
  businessRegNumber: string;
  contractStatus: ContractStatus;
  contractStart: string;
  contractEnd: string;
  companyName: string;
  managerContact: string;
  photoUrl?: string;
  // Settlement / payouts
  settlementBank: string;
}

/** A blank property used to start a fresh hotel setup. */
export function emptyProperty(): Property {
  return {
    name: '',
    address: '',
    accommodationType: 'Hotel',
    starRating: 0,
    country: 'Myanmar',
    state: '',
    district: '',
    township: '',
    latitude: undefined,
    longitude: undefined,
    checkInTime: '',
    checkOutTime: '',
    mainAmenities: [],
    frontDeskNumber: '',
    frontDeskEmail: '',
    representativeName: '',
    businessRegNumber: '',
    contractStatus: 'Pending',
    contractStart: '',
    contractEnd: '',
    companyName: '',
    managerContact: '',
    settlementBank: '',
  };
}

export type BedType = 'Single' | 'Double' | 'Queen' | 'King' | 'Twin' | 'Bunk';
export type SizeUnit = 'm²' | 'ft²';

export const BED_TYPES: BedType[] = ['Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk'];
export const WEEKEND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export interface BedConfig {
  type: BedType;
  count: number;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  amenities: string[];
  /** Max occupancy. */
  occupancy: number;
  // Pricing
  regularPrice: number;
  sessionEnabled: boolean;
  sessionPrice: number;
  sessionHours: number;
  weekendEnabled: boolean;
  /** Effective absolute weekend rate (derived from the mode + surcharge). */
  weekendPrice: number;
  /** How the weekend rate is set: % over regular, fixed amount over regular, or an absolute price. */
  weekendMode?: WeekendMode;
  /** The surcharge value (percent or amount), or the absolute price when mode is 'fixed'. */
  weekendSurcharge?: number;
  weekendDays: string[];
  // Layout & occupancy
  beds: BedConfig[];
  roomSize?: number;
  sizeUnit: SizeUnit;
  // Photos (data URLs); first is the cover.
  photos: string[];
}

/** Total bed count across all bed configs. */
export function totalBeds(rt: RoomType): number {
  return rt.beds.reduce((n, b) => n + b.count, 0);
}

/** Weekend pricing can be a % uplift over regular, a flat amount over regular, or an absolute price. */
export type WeekendMode = 'percent' | 'amount' | 'fixed';

/** Resolve the absolute weekend rate from the chosen mode and surcharge value. */
export function computeWeekendPrice(regularPrice: number, mode: WeekendMode, surcharge: number): number {
  if (mode === 'percent') return Math.round(regularPrice * (1 + surcharge / 100));
  if (mode === 'amount') return regularPrice + surcharge;
  return surcharge; // 'fixed' — surcharge holds the absolute price
}

export function emptyRoomType(): RoomType {
  return {
    id: '',
    name: '',
    description: '',
    amenities: [],
    occupancy: 2,
    regularPrice: 0,
    sessionEnabled: false,
    sessionPrice: 0,
    sessionHours: 3,
    weekendEnabled: false,
    weekendPrice: 0,
    weekendMode: 'percent',
    weekendSurcharge: 20,
    weekendDays: ['Sat', 'Sun'],
    beds: [{ type: 'Single', count: 1 }],
    roomSize: undefined,
    sizeUnit: 'm²',
    photos: [],
  };
}

export interface Room {
  id: string;
  floor: number;
  number: string;
  typeName: string;
  beds: number;
  occupancy: number;
  amenities: string[];
  price: number;
  status: RoomStatus;
}

export const DEMO_PROPERTY: Property = {
  name: 'Aurora Grand Hotel',
  address: '128 Riverside Avenue',
  accommodationType: 'Hotel',
  starRating: 5,
  country: 'Singapore',
  state: 'Central Region',
  district: 'Downtown Core',
  township: 'Marina Bay',
  latitude: 1.2834,
  longitude: 103.8607,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  mainAmenities: ['SPA & Wellness Centre', 'Fitness Centre/Gym', 'Swimming Pool', 'Currency Exchange & ATM'],
  frontDeskNumber: '+65 6555 0100',
  frontDeskEmail: 'frontdesk@aurorahotel.com',
  representativeName: 'Helen Carter',
  businessRegNumber: 'BRN-2024-558013',
  contractStatus: 'Approved',
  contractStart: '2025-01-01',
  contractEnd: '2026-12-31',
  companyName: 'Aurora Hospitality Group',
  managerContact: 'manager@aurorahotel.com',
  settlementBank: '',
};

export const DEMO_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt1',
    name: 'Deluxe',
    description: 'Spacious room with city view, king bed and a private balcony.',
    amenities: ['Cafe', 'WiFi'],
    occupancy: 2,
    regularPrice: 80000,
    sessionEnabled: true,
    sessionPrice: 40000,
    sessionHours: 3,
    weekendEnabled: false,
    weekendPrice: 96000,
    weekendMode: 'percent',
    weekendSurcharge: 20,
    weekendDays: ['Sat', 'Sun'],
    beds: [{ type: 'King', count: 1 }],
    roomSize: 32,
    sizeUnit: 'm²',
    photos: [],
  },
  {
    id: 'rt2',
    name: 'Superior',
    description: 'Comfortable room with twin beds, ideal for friends or colleagues.',
    amenities: ['Cafe', 'WiFi', 'Breakfast'],
    occupancy: 2,
    regularPrice: 80000,
    sessionEnabled: false,
    sessionPrice: 40000,
    sessionHours: 3,
    weekendEnabled: true,
    weekendPrice: 90000,
    weekendMode: 'amount',
    weekendSurcharge: 10000,
    weekendDays: ['Sat', 'Sun'],
    beds: [{ type: 'Twin', count: 2 }],
    roomSize: 26,
    sizeUnit: 'm²',
    photos: [],
  },
];

export const DEMO_ROOMS: Room[] = [
  { id: 'r1', floor: 2, number: '200', typeName: 'Deluxe', beds: 1, occupancy: 2, amenities: ['Cafe'], price: 80000, status: 'Active' },
  { id: 'r2', floor: 2, number: '201', typeName: 'Superior', beds: 1, occupancy: 2, amenities: ['Cafe'], price: 80000, status: 'Active' },
  { id: 'r3', floor: 2, number: '203', typeName: 'Superior', beds: 1, occupancy: 2, amenities: ['Cafe'], price: 80000, status: 'Active' },
  { id: 'r4', floor: 3, number: '301', typeName: 'Superior', beds: 1, occupancy: 2, amenities: ['Cafe', 'WiFi'], price: 90000, status: 'Active' },
  { id: 'r5', floor: 3, number: '302', typeName: 'Superior', beds: 2, occupancy: 3, amenities: ['Cafe', 'WiFi'], price: 90000, status: 'Inactive' },
];

export function formatPrice(value: number): string {
  return value.toLocaleString('en-US');
}
