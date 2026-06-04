import { create } from 'zustand';
import {
  DEMO_PROPERTY,
  DEMO_ROOM_TYPES,
  DEMO_ROOMS,
  type Property,
  type RoomType,
  type Room,
} from './hotel-data';

interface HotelState {
  property: Property;
  roomTypes: RoomType[];
  rooms: Room[];
  updateProperty: (patch: Partial<Property>) => void;
  upsertRoomType: (rt: RoomType) => void;
  removeRoomType: (id: string) => void;
  upsertRoom: (r: Room) => void;
  removeRoom: (id: string) => void;
}

/** Shared hotel store: property profile, room types and rooms. */
export const useHotel = create<HotelState>((set) => ({
  property: DEMO_PROPERTY,
  roomTypes: DEMO_ROOM_TYPES,
  rooms: DEMO_ROOMS,
  updateProperty: (patch) =>
    set((s) => {
      // While editing a live listing, any real data change (not a review/control flag)
      // marks the property dirty so "Resubmit for review" can appear.
      const controlKeys = ['reviewStatus', 'submittedAt', 'reviewNote', 'live', 'editing', 'pendingEdits'] as const;
      const isDataChange = Object.keys(patch).some((k) => !controlKeys.includes(k as (typeof controlKeys)[number]));
      const markDirty = s.property.editing && isDataChange;
      return { property: { ...s.property, ...patch, ...(markDirty ? { pendingEdits: true } : {}) } };
    }),
  upsertRoomType: (rt) =>
    set((s) => ({
      roomTypes: s.roomTypes.some((x) => x.id === rt.id)
        ? s.roomTypes.map((x) => (x.id === rt.id ? rt : x))
        : [rt, ...s.roomTypes],
    })),
  removeRoomType: (id) => set((s) => ({ roomTypes: s.roomTypes.filter((x) => x.id !== id) })),
  upsertRoom: (r) =>
    set((s) => ({
      rooms: s.rooms.some((x) => x.id === r.id) ? s.rooms.map((x) => (x.id === r.id ? r : x)) : [r, ...s.rooms],
    })),
  removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter((x) => x.id !== id) })),
}));
