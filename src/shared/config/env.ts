const raw = import.meta.env;

export const env = {
  appName: 'iDap',
  mode: raw.MODE,
  isDev: raw.DEV,
  isProd: raw.PROD,
  apiUrl: raw.VITE_API_URL ?? 'https://api.idap.mn',
  filesUrl: raw.VITE_FILES_URL ?? 'https://files.idap.mn',
  useMockApi: (raw.VITE_USE_MOCK_API ?? 'true') === 'true',
  defaultLocale: raw.VITE_DEFAULT_LOCALE ?? 'en',
} as const;
