import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enPublic from './locales/en/public.json';
import enUser from './locales/en/user.json';
import enCompany from './locales/en/company.json';
import enComponents from './locales/en/components.json';

import dePublic from './locales/de/public.json';
import deUser from './locales/de/user.json';
import deCompany from './locales/de/company.json';
import deComponents from './locales/de/components.json';

import huPublic from './locales/hu/public.json';
import huUser from './locales/hu/user.json';
import huCompany from './locales/hu/company.json';
import huComponents from './locales/hu/components.json';

// Custom language detector
const languageDetector = {
  type: 'languageDetector',
  async: false,
  detect: () => {
    return localStorage.getItem('i18nextLng') || 'hu';
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('i18nextLng', lng);
  }
};

i18n
  .use(languageDetector as any) // Cast to any to avoid type issues with custom detector without proper types
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        public: enPublic,
        user: enUser,
        company: enCompany,
        components: enComponents
      },
      de: {
        public: dePublic,
        user: deUser,
        company: deCompany,
        components: deComponents
      },
      hu: {
        public: huPublic,
        user: huUser,
        company: huCompany,
        components: huComponents
      }
    },
    fallbackLng: 'hu', // Set fallback to Hungarian
    ns: ['public', 'user', 'company', 'components'],
    defaultNS: 'public',

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
