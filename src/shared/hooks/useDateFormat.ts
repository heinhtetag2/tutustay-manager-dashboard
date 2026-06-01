import { useCallback, useEffect, useState } from 'react';
import {
  DATE_FORMAT_STORAGE_KEY,
  DEFAULT_DATE_FORMAT,
  formatDate as fmtDate,
  formatDateTime as fmtDateTime,
  formatDateLong as fmtDateLong,
  formatDateTimeLong as fmtDateTimeLong,
  isDateFormat,
  readStoredDateFormat,
} from '../lib/date-format';

const EVENT = 'idap:date-format-change';

/**
 * App-wide date-format preference, persisted to localStorage and synced across
 * tabs/components (mirrors useCurrency). Returns formatters bound to the choice.
 */
export function useDateFormat() {
  const [dateFormat, setState] = useState<string>(readStoredDateFormat);

  useEffect(() => {
    function onChange(e: Event) {
      const next = (e as CustomEvent<string>).detail;
      if (isDateFormat(next)) setState(next);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === DATE_FORMAT_STORAGE_KEY && isDateFormat(e.newValue)) setState(e.newValue);
    }
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setDateFormat = useCallback((next: string) => {
    if (!isDateFormat(next)) return;
    window.localStorage.setItem(DATE_FORMAT_STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: next }));
    setState(next);
  }, []);

  const formatDate = useCallback((v: Date | string | number | null | undefined) => fmtDate(v, dateFormat), [dateFormat]);
  const formatDateTime = useCallback((v: Date | string | number | null | undefined) => fmtDateTime(v, dateFormat), [dateFormat]);
  const formatDateLong = useCallback((v: Date | string | number | null | undefined) => fmtDateLong(v, dateFormat), [dateFormat]);
  const formatDateTimeLong = useCallback((v: Date | string | number | null | undefined) => fmtDateTimeLong(v, dateFormat), [dateFormat]);

  return { dateFormat, setDateFormat, formatDate, formatDateTime, formatDateLong, formatDateTimeLong, DEFAULT: DEFAULT_DATE_FORMAT };
}
