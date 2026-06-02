import type { ElementType } from 'react';
import {
  Rocket,
  CalendarCheck,
  Inbox,
  BedDouble,
  TicketPercent,
  Landmark,
} from 'lucide-react';
import type { HelpIconKey } from './help-data';

export const HELP_ICONS: Record<HelpIconKey, ElementType> = {
  rocket: Rocket,
  calendar: CalendarCheck,
  inbox: Inbox,
  bed: BedDouble,
  ticket: TicketPercent,
  bank: Landmark,
};
