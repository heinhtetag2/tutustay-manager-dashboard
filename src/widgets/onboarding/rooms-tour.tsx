import { useEffect, useRef, useState } from 'react';
import { Spotlight, type Placement } from './spotlight';

export type PriceTab = 'regular' | 'session' | 'weekend';

/** Hooks the tour gives back to the Rooms page so a step can drive real UI. */
export interface RoomsTourActions {
  openTypeEditor: () => void;
  closeTypeEditor: () => void;
  openRoomEditor: () => void;
  closeRoomEditor: () => void;
  showRoomsTab: () => void;
  showTypesTab: () => void;
  setPriceTab: (t: PriceTab | null) => void;
}

interface Step {
  target: string;
  title: string;
  body: string;
  placement?: Placement;
  nextLabel?: string;
  /** Fully declares the UI state this step needs (so Back also restores it). */
  enter?: (a: RoomsTourActions) => void;
}

const STEPS: Step[] = [
  {
    target: '[data-tour="rooms-add"]',
    title: 'Start by creating a room type',
    body: 'Everything begins with a Room Type — a reusable template for price, beds and amenities. Let’s make one.',
    placement: 'bottom',
    nextLabel: 'Create one',
    enter: (a) => { a.showTypesTab(); a.closeTypeEditor(); a.closeRoomEditor(); },
  },
  {
    target: '[data-tour="rt-price"]',
    title: '1. Set the Regular rate',
    body: 'Your standard price per night. This is the only price you must set — Session and Weekend are optional.',
    placement: 'left',
    enter: (a) => { a.showTypesTab(); a.openTypeEditor(); a.closeRoomEditor(); a.setPriceTab('regular'); },
  },
  {
    target: '[data-tour="rt-price"]',
    title: '2. Add a Session rate',
    body: 'Optional. Sell the room for a few hours (day-use) instead of a full overnight stay.',
    placement: 'left',
    enter: (a) => { a.openTypeEditor(); a.setPriceTab('session'); },
  },
  {
    target: '[data-tour="rt-price"]',
    title: '3. Add a Weekend uplift',
    body: 'Optional. Bump the night and session rates up on the weekend days you choose.',
    placement: 'left',
    enter: (a) => { a.openTypeEditor(); a.setPriceTab('weekend'); },
  },
  {
    target: '[data-tour="rt-save"]',
    title: 'Save your room type',
    body: 'When the details look right, save it. Then we’ll add a real room of this type.',
    placement: 'top',
    nextLabel: 'Got it — next',
    enter: (a) => { a.openTypeEditor(); a.setPriceTab('regular'); },
  },
  {
    target: '[data-tour="rooms-add-room"]',
    title: 'Now add a room',
    body: 'Each room type has its own “Add room” button. Add a physical room (e.g. Room 201) to the type you just created — it lives right under that type.',
    placement: 'left',
    nextLabel: 'Add a room',
    enter: (a) => { a.closeTypeEditor(); a.closeRoomEditor(); },
  },
  {
    target: '[data-tour="room-type-field"]',
    title: 'Connect it to a room type',
    body: 'Pick the room type here — the room automatically inherits its price, beds and amenities. That’s it!',
    placement: 'left',
    nextLabel: 'Finish',
    enter: (a) => { a.openRoomEditor(); },
  },
];

/**
 * End-to-end guided flow for the Rooms page: create a room type (with the three
 * price modes), then add a room and connect it to that type. Each step drives
 * the real page UI via the supplied actions.
 */
export function useRoomsTour(actions: RoomsTourActions) {
  const [step, setStep] = useState<number | null>(null);
  const ref = useRef(actions);
  ref.current = actions;

  // Apply each step's required UI state when it becomes active.
  useEffect(() => {
    if (step == null) return;
    STEPS[step].enter?.(ref.current);
  }, [step]);

  const end = () => {
    setStep(null);
    ref.current.closeTypeEditor();
    ref.current.closeRoomEditor();
    ref.current.setPriceTab(null);
  };
  const start = () => setStep(0);
  const next = () => {
    if (step == null) return;
    if (step >= STEPS.length - 1) end();
    else setStep(step + 1);
  };
  const back = () => {
    if (step != null && step > 0) setStep(step - 1);
  };

  const current = step == null ? null : STEPS[step];
  const node = current && step != null ? (
    <Spotlight
      target={current.target}
      title={current.title}
      body={current.body}
      placement={current.placement}
      index={step}
      count={STEPS.length}
      nextLabel={current.nextLabel}
      onNext={next}
      onBack={step > 0 ? back : undefined}
      onSkip={end}
    />
  ) : null;

  return { active: step != null, start, node };
}
