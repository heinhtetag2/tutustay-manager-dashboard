import type { Property } from '@/pages/hotel/hotel-data';

export interface SetupStepDef {
  step: number;
  key: string;
  title: string;
  desc: string;
  /** Completion check from the live property. */
  done: (p: Property) => boolean;
  /** Whether this step is optional (can be skipped during setup). */
  optional?: boolean;
}

/** The onboarding steps, mirroring the hotel setup wizard, with completion rules. */
export const SETUP_STEPS: SetupStepDef[] = [
  {
    step: 0,
    key: 'basics',
    title: 'Property basics',
    desc: 'Name, photo, star rating, guest rooms, and contact details.',
    done: (p) => !!p.name.trim() && p.starRating > 0,
  },
  {
    step: 1,
    key: 'type',
    title: 'Property type',
    desc: 'The category that best describes your place.',
    done: (p) => !!p.accommodationType,
  },
  {
    step: 2,
    key: 'address',
    title: 'Address & map',
    desc: 'Where guests find you, pinned on the map.',
    done: (p) =>
      !!p.country.trim() && !!p.state.trim() && !!p.district.trim() && !!p.township.trim() && !!p.address.trim() && p.latitude != null && p.longitude != null,
  },
  {
    step: 3,
    key: 'policies',
    title: 'Policies & amenities',
    desc: 'Check-in/out times, guest policies, and amenities.',
    done: (p) => !!p.checkInTime.trim() && !!p.checkOutTime.trim() && p.mainAmenities.length > 0,
  },
  {
    step: 4,
    key: 'owner',
    title: 'Owner & business',
    desc: 'Legal entity, verification document, and contract terms.',
    done: (p) => !!p.representativeName.trim() && !!p.companyName.trim(),
  },
  {
    step: 6,
    key: 'banking',
    title: 'Settlement',
    desc: 'How bookings are settled and your payout bank.',
    optional: true,
    done: (p) => !!p.settlementBank,
  },
];

/** Overall onboarding completion for a property. */
export function setupProgress(p: Property) {
  const steps = SETUP_STEPS.map((s) => ({ ...s, complete: s.done(p) }));
  const completed = steps.filter((s) => s.complete).length;
  const total = steps.length;
  const required = steps.filter((s) => !s.optional);
  const requiredDone = required.filter((s) => s.complete).length;
  return {
    steps,
    completed,
    total,
    pct: Math.round((completed / total) * 100),
    allDone: completed === total,
    /** Every non-optional step is complete — the gate for submitting for review. */
    allRequiredDone: requiredDone === required.length,
    /** How many required steps still need filling in. */
    requiredRemaining: required.length - requiredDone,
  };
}
