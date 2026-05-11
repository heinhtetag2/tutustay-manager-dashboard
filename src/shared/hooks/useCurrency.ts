import { useCallback, useEffect, useState } from 'react';
import {
  CURRENCIES,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  formatMoney,
  isCurrencyCode,
  readStoredCurrency,
  type CurrencyCode,
} from '../lib/currency';

const EVENT = 'idap:currency-change';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readStoredCurrency);

  useEffect(() => {
    function onChange(e: Event) {
      const next = (e as CustomEvent<CurrencyCode>).detail;
      if (isCurrencyCode(next)) setCurrencyState(next);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === CURRENCY_STORAGE_KEY && isCurrencyCode(e.newValue)) {
        setCurrencyState(e.newValue);
      }
    }
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    if (!isCurrencyCode(next)) return;
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent<CurrencyCode>(EVENT, { detail: next }));
    setCurrencyState(next);
  }, []);

  const format = useCallback((amount: number) => formatMoney(amount, currency), [currency]);

  return {
    currency,
    setCurrency,
    format,
    symbol: CURRENCIES[currency].symbol,
    def: CURRENCIES[currency],
    DEFAULT: DEFAULT_CURRENCY,
  };
}
