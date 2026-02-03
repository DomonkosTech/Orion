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

i18n
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
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ['public', 'user', 'company', 'components'],
    defaultNS: 'public',

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
