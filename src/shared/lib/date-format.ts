import { format } from 'date-fns';

/** A selectable date pattern (the id IS the date-fns pattern). */
export interface DateFormatDef {
  pattern: string;
  /** A live example rendered in the picker. */
  example: string;
}

export const DATE_FORMATS: DateFormatDef[] = [
  { pattern: 'MMM d, yyyy', example: 'Jan 5, 2026' },
  { pattern: 'd MMM yyyy', example: '5 Jan 2026' },
  { pattern: 'dd/MM/yyyy', example: '05/01/2026' },
  { pattern: 'MM/dd/yyyy', example: '01/05/2026' },
  { pattern: 'yyyy-MM-dd', example: '2026-01-05' },
];

export const DEFAULT_DATE_FORMAT = 'MMM d, yyyy';
export const DATE_FORMAT_STORAGE_KEY = 'idap.dateFormat';

const PATTERNS = DATE_FORMATS.map((d) => d.pattern);

export function isDateFormat(v: string | null | undefined): v is string {
  return !!v && PATTERNS.includes(v);
}

export function readStoredDateFormat(): string {
  if (typeof window === 'undefined') return DEFAULT_DATE_FORMAT;
  const saved = window.localStorage.getItem(DATE_FORMAT_STORAGE_KEY);
  return isDateFormat(saved) ? saved : DEFAULT_DATE_FORMAT;
}

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format a date with the given (or stored) pattern. Returns '' for invalid input. */
export function formatDate(value: Date | string | number | null | undefined, pattern = readStoredDateFormat()): string {
  const d = toDate(value);
  return d ? format(d, pattern) : '';
}

/** Format a date + time. Time portion is fixed (12-hour) and appended to the pattern. */
export function formatDateTime(value: Date | string | number | null | undefined, pattern = readStoredDateFormat()): string {
  const d = toDate(value);
  return d ? format(d, `${pattern}, hh:mm a`) : '';
}

/** Date with the weekday name prefixed, e.g. "Friday, Jan 5, 2026". */
export function formatDateLong(value: Date | string | number | null | undefined, pattern = readStoredDateFormat()): string {
  const d = toDate(value);
  return d ? `${format(d, 'EEEE')}, ${format(d, pattern)}` : '';
}

/** Date + weekday + time, e.g. "Friday, Jan 5, 2026, 03:35 PM". */
export function formatDateTimeLong(value: Date | string | number | null | undefined, pattern = readStoredDateFormat()): string {
  const d = toDate(value);
  return d ? `${format(d, 'EEEE')}, ${format(d, `${pattern}, hh:mm a`)}` : '';
}
