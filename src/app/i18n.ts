import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';

const STORAGE_KEY = 'idap.lang';
const SUPPORTED = ['en', 'ko'] as const;
type Lang = (typeof SUPPORTED)[number];

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return (SUPPORTED as readonly string[]).includes(saved ?? '') ? (saved as Lang) : 'en';
}

// English uses key-as-value (i18next falls back to the key when no resource matches),
// so we don't need to enumerate every English string here.
const resources = {
  en: { translation: {} },
  ko: { translation: ko as Record<string, string> },
};

i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLang(),
  fallbackLng: 'en',
  supportedLngs: SUPPORTED as unknown as string[],
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    if ((SUPPORTED as readonly string[]).includes(lng)) {
      window.localStorage.setItem(STORAGE_KEY, lng);
    }
  });
}

export default i18n;
