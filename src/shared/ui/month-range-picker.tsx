import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface MonthRange {
  /** Start of the first selected month. */
  from: Date;
  /** End of the last selected month. */
  to: Date;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A comparable key for a year+month so range checks ignore the day. */
const monthKey = (year: number, month: number) => year * 12 + month;

/**
 * Month-granularity range picker — a year-navigable 4×3 grid where you click a
 * start month then an end month. Used where data is bucketed by month/period
 * (e.g. settlements) rather than by day, so a day calendar would imply a
 * precision the data doesn't have.
 *
 * Emits `{ from: startOfMonth, to: endOfMonth }` so it drops straight into
 * existing date-range overlap filters.
 */
export function MonthRangePicker({
  value,
  onChange,
  defaultYear,
  t = (s) => s,
}: {
  value?: MonthRange;
  onChange: (range: MonthRange) => void;
  /** Year shown when nothing is selected yet. */
  defaultYear: number;
  t?: (key: string) => string;
}) {
  const [viewYear, setViewYear] = useState(value?.from.getFullYear() ?? defaultYear);
  // The first-clicked month while a range is mid-selection; null once a range is complete.
  const [anchor, setAnchor] = useState<{ year: number; month: number } | null>(null);

  const fromKey = value ? monthKey(value.from.getFullYear(), value.from.getMonth()) : null;
  const toKey = value ? monthKey(value.to.getFullYear(), value.to.getMonth()) : null;

  const selectMonth = (month: number) => {
    const clicked = { year: viewYear, month };
    if (!anchor) {
      // Begin a new selection — show just this month for now.
      setAnchor(clicked);
      const d = new Date(viewYear, month, 1);
      onChange({ from: startOfMonth(d), to: endOfMonth(d) });
    } else {
      // Close the range, ordering the two ends.
      const a = monthKey(anchor.year, anchor.month);
      const b = monthKey(clicked.year, clicked.month);
      const lo = a <= b ? anchor : clicked;
      const hi = a <= b ? clicked : anchor;
      onChange({
        from: startOfMonth(new Date(lo.year, lo.month, 1)),
        to: endOfMonth(new Date(hi.year, hi.month, 1)),
      });
      setAnchor(null);
    }
  };

  return (
    <div className="w-64 select-none">
      {/* Year navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewYear((y) => y - 1)}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label={t('Previous year')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{viewYear}</span>
        <button
          type="button"
          onClick={() => setViewYear((y) => y + 1)}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label={t('Next year')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1">
        {MONTH_LABELS.map((label, idx) => {
          const key = monthKey(viewYear, idx);
          const isStart = key === fromKey;
          const isEnd = key === toKey;
          const isEndpoint = isStart || isEnd;
          const inRange = fromKey !== null && toKey !== null && key >= fromKey && key <= toKey;
          return (
            <button
              key={label}
              type="button"
              onClick={() => selectMonth(idx)}
              className={`py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isEndpoint
                  ? 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]'
                  : inRange
                    ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {t(label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
