import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import publicHu from './locales/hu/public.json';
import userHu from './locales/hu/user.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      hu: {
        public: publicHu,
        user: userHu
      }
    },
    lng: 'hu',
    fallbackLng: 'hu',
    ns: ['public', 'user'],
    defaultNS: 'public',

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;