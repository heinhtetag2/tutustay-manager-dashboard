export type CurrencyCode = 'KRW' | 'USD' | 'JPY' | 'EUR';

export interface CurrencyDef {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  KRW: { code: 'KRW', symbol: '',   label: 'Korean Won',    locale: 'ko-KR', decimals: 0 },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar',     locale: 'en-US', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', label: 'Japanese Yen',  locale: 'ja-JP', decimals: 0 },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro',          locale: 'en-IE', decimals: 2 },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'KRW';
export const CURRENCY_STORAGE_KEY = 'idap.currency';

export function isCurrencyCode(v: string | null | undefined): v is CurrencyCode {
  return !!v && v in CURRENCIES;
}

export function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return isCurrencyCode(saved) ? saved : DEFAULT_CURRENCY;
}

// Symbol-only formatter for demo display: keeps the numeric value as-is and
// swaps the symbol. Use this when amounts are mocked/marketing copy and we
// just want the active currency badge to render.
export function formatMoney(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const def = CURRENCIES[currency];
  try {
    const n = new Intl.NumberFormat(def.locale, {
      minimumFractionDigits: def.decimals,
      maximumFractionDigits: def.decimals,
    }).format(amount);
    return `${def.symbol}${n}`;
  } catch {
    return `${def.symbol}${amount}`;
  }
}
