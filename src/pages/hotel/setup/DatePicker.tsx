import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Portal } from '@/shared/ui/portal';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';

/** 'yyyy-MM-dd' → local Date (no timezone shift). */
function parseLocalDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/**
 * Design-system date picker — replaces the native <input type="date">.
 * Renders a button (matching the setup inputs) + a portal-positioned brand
 * Calendar popover. Stores 'yyyy-MM-dd'. Wrap in a SetupField for the label.
 */
export function DatePicker({
  value,
  onChange,
  ariaLabel,
  placeholder = 'Select date',
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = parseLocalDate(value);
  const POPOVER_H = 360;
  const POPOVER_W = 300;

  const openPicker = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const openUp = r.bottom + 4 + POPOVER_H > window.innerHeight && r.top - POPOVER_H > 0;
    const left = Math.min(r.left, window.innerWidth - POPOVER_W - 8);
    setPos({ top: openUp ? r.top - POPOVER_H - 4 : r.bottom + 4, left: Math.max(8, left) });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-md text-sm transition-colors cursor-pointer ${
          open ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'
        }`}
      >
        <span className={value && selected ? 'text-[var(--text-primary)] tabular-nums' : 'text-[var(--text-muted)]'}>
          {value && selected ? format(selected, 'MMM d, yyyy') : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>
      {open && pos && (
        <Portal>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[61] bg-white border border-[var(--border-default)] rounded-md p-2 shadow-[0_8px_28px_rgba(44,38,39,0.16)]"
            style={{ top: pos.top, left: pos.left, '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarUI
              mode="single"
              defaultMonth={selected}
              selected={selected}
              onSelect={(d) => { onChange(d ? format(d, 'yyyy-MM-dd') : ''); setOpen(false); }}
              className="p-0"
            />
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--surface-subtle)]">
              <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="px-2.5 py-1 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer">
                {t('Clear')}
              </button>
              <button type="button" onClick={() => { onChange(format(new Date(), 'yyyy-MM-dd')); setOpen(false); }} className="px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-tint)] rounded-md transition-colors cursor-pointer">
                {t('Today')}
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
