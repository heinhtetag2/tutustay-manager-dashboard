import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  /** Shown on the trigger when nothing is selected. */
  placeholder: string;
  leftIcon?: React.ReactNode;
  searchPlaceholder?: string;
  className?: string;
}

/** Searchable multi-select dropdown, design-system styled. */
export function MultiSelect({ values, onChange, options, placeholder, leftIcon, searchPlaceholder = 'Search', className }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()));
  const toggle = (o: string) => onChange(values.includes(o) ? values.filter((x) => x !== o) : [...values, o]);
  const label = values.length === 0 ? placeholder : values.length === 1 ? values[0] : `${values.length} ${'selected'}`;

  return (
    <Popover.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(''); }}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'relative flex items-center justify-between gap-2 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm font-normal text-[var(--text-primary)]',
            'hover:bg-white focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]',
            'cursor-pointer text-left',
            leftIcon ? 'pl-9 pr-3' : 'px-3',
            values.length === 0 && 'text-[var(--text-secondary)]',
            className,
          )}
        >
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none [&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span>
          )}
          <span className="truncate">{label}</span>
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[230px] overflow-hidden rounded-md border border-[var(--border-default)] bg-white shadow-[0_4px_16px_rgba(44,38,39,0.08)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="p-2 border-b border-[var(--surface-subtle)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-2 py-1.5 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-[var(--text-secondary)]">{'No results'}</div>
            ) : (
              filtered.map((o) => {
                const on = values.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => toggle(o)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-2.5 py-2 text-sm rounded-md cursor-pointer text-left transition-colors',
                      on ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] font-medium' : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]',
                    )}
                  >
                    <span className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', on ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white' : 'border-[var(--border-strong)]')}>
                      {on && <Check className="w-3 h-3" />}
                    </span>
                    <span className="truncate">{o}</span>
                  </button>
                );
              })
            )}
          </div>
          {values.length > 0 && (
            <div className="p-1 border-t border-[var(--surface-subtle)]">
              <button type="button" onClick={() => onChange([])} className="w-full px-2.5 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors text-left cursor-pointer">
                Clear selection
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
