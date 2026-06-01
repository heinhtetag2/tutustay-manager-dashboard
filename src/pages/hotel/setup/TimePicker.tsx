import * as Popover from '@radix-ui/react-popover';
import { Clock } from 'lucide-react';
import { setupInput } from './setup-fields';

/**
 * Design-system time picker — replaces the native <input type="time"> whose
 * dropdown can't be themed. Displays 12-hour time with AM/PM, stores 24-hour
 * 'HH:mm' so it stays compatible with the rest of the hotel profile.
 */

const HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'] as const;

type Parts = { h12: string; m: string; period: 'AM' | 'PM' };

function parse(value: string): Parts | null {
  if (!value) return null;
  const [hStr, mStr = '00'] = value.split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return null;
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h % 12) || 12).toString().padStart(2, '0');
  return { h12, m: mStr.padStart(2, '0'), period };
}

function build({ h12, m, period }: Parts): string {
  let h = parseInt(h12, 10) % 12;
  if (period === 'PM') h += 12;
  return `${h.toString().padStart(2, '0')}:${m}`;
}

function Column({ items, selected, onSelect }: { items: readonly string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-0.5 w-16 max-h-56 overflow-y-auto px-1 py-1">
      {items.map((it) => {
        const on = it === selected;
        return (
          <button
            key={it}
            type="button"
            onClick={() => onSelect(it)}
            className={`shrink-0 px-2 py-1.5 rounded-md text-sm font-medium text-center transition-colors cursor-pointer tabular-nums ${
              on
                ? 'bg-[var(--brand-primary)] text-white'
                : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
            }`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  ariaLabel,
  placeholder = 'Select time',
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}) {
  const cur: Parts = parse(value) ?? { h12: '12', m: '00', period: 'AM' };
  const commit = (patch: Partial<Parts>) => onChange(build({ ...cur, ...patch }));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" aria-label={ariaLabel} className={`${setupInput} flex items-center justify-between text-left cursor-pointer`}>
          <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
            {value ? `${cur.h12}:${cur.m} ${cur.period}` : placeholder}
          </span>
          <Clock className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[60] bg-white border border-[var(--border-default)] rounded-md shadow-[0_8px_28px_rgba(44,38,39,0.12)] flex divide-x divide-[var(--border-default)]"
        >
          <Column items={HOURS} selected={cur.h12} onSelect={(h12) => commit({ h12 })} />
          <Column items={MINUTES} selected={cur.m} onSelect={(m) => commit({ m })} />
          <Column items={PERIODS} selected={cur.period} onSelect={(period) => commit({ period: period as 'AM' | 'PM' })} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
