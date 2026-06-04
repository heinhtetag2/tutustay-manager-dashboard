import { useMemo } from 'react';
import {
  Home,
  Tag,
  MapPin,
  ClipboardList,
  Building2,
  Landmark,
  BedDouble,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { useHotel } from '@/pages/hotel/use-hotel';
import { useBookingRequests } from '@/pages/booking-requests/use-booking-requests';
import { setupProgress } from '@/pages/setup-hub/setup-progress';

export interface ChecklistItem {
  key: string;
  title: string;
  desc: string;
  done: boolean;
  optional?: boolean;
  href: string;
  Icon: LucideIcon;
}

export interface NextStep {
  title: string;
  body: string;
  cta: string;
  href: string;
  /** true once there's nothing left to recommend. */
  done: boolean;
}

const STEP_ICONS: Record<string, LucideIcon> = {
  basics: Home,
  type: Tag,
  address: MapPin,
  policies: ClipboardList,
  owner: Building2,
  banking: Landmark,
};

/**
 * The first-run checklist + the single recommended next step, derived live from
 * the property profile, room types, and booking requests. Reuses the real setup
 * steps so the checklist and the sidebar progress ring always agree.
 */
export function useOnboardingProgress() {
  const property = useHotel((s) => s.property);
  const roomTypes = useHotel((s) => s.roomTypes);
  const requests = useBookingRequests((s) => s.requests);

  return useMemo(() => {
    const setup = setupProgress(property);

    const setupItems: ChecklistItem[] = setup.steps.map((s) => ({
      key: s.key,
      title: s.title,
      desc: s.desc,
      done: s.complete,
      optional: s.optional,
      href: '/setup',
      Icon: STEP_ICONS[s.key] ?? Home,
    }));

    const hasRoomType = roomTypes.length > 0;
    const reviewedRequest = requests.some((r) => r.status !== 'Pending');
    const pendingCount = requests.filter((r) => r.status === 'Pending').length;

    const actionItems: ChecklistItem[] = [
      {
        key: 'first-room-type',
        title: 'Create your first room type',
        desc: 'Set pricing, beds, and amenities — then add rooms of that type.',
        done: hasRoomType,
        href: '/hotel/rooms',
        Icon: BedDouble,
      },
      {
        key: 'review-request',
        title: 'Review a booking request',
        desc: 'Approve or decline an incoming request to see how it works.',
        done: reviewedRequest,
        href: '/booking-requests',
        Icon: Inbox,
      },
    ];

    const items = [...setupItems, ...actionItems];
    const completed = items.filter((i) => i.done).length;
    const total = items.length;

    // Recommended next step — highest-value incomplete action, in priority order.
    let nextStep: NextStep;
    if (!setup.allDone) {
      nextStep = {
        title: 'Finish your property setup',
        body: `${setup.completed}/${setup.total} steps done — complete setup so you can go live and take bookings.`,
        cta: 'Continue setup',
        href: '/setup',
        done: false,
      };
    } else if (!hasRoomType) {
      nextStep = {
        title: 'Add your first room type',
        body: 'Create a room type to start pricing your rooms.',
        cta: 'Add room type',
        href: '/hotel/rooms',
        done: false,
      };
    } else if (pendingCount > 0) {
      nextStep = {
        title:
          pendingCount === 1
            ? 'You have 1 booking request waiting'
            : `You have ${pendingCount} booking requests waiting`,
        body: 'Approve or decline to keep your calendar moving.',
        cta: 'Review requests',
        href: '/booking-requests',
        done: false,
      };
    } else {
      nextStep = {
        title: 'You’re all set 🎉',
        body: 'Explore your dashboard, or create a coupon to drive more bookings.',
        cta: 'Create a coupon',
        href: '/coupons',
        done: true,
      };
    }

    return { items, completed, total, allDone: completed === total, nextStep };
  }, [property, roomTypes, requests]);
}
