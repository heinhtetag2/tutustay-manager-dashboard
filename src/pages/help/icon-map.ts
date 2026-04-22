import type { ElementType } from 'react';
import {
  Rocket,
  Newspaper,
  ClipboardCheck,
  Wallet,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import type { HelpIconKey } from './help-data';

export const HELP_ICONS: Record<HelpIconKey, ElementType> = {
  rocket: Rocket,
  feed: Newspaper,
  clipboard: ClipboardCheck,
  wallet: Wallet,
  trophy: Trophy,
  shield: ShieldCheck,
};
