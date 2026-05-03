import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enAquarium from './locales/en/aquarium.json';
import enNav from './locales/en/nav.json';
import enProfile from './locales/en/profile.json';

import deCommon from './locales/de/common.json';
import deAuth from './locales/de/auth.json';
import deDashboard from './locales/de/dashboard.json';
import deAquarium from './locales/de/aquarium.json';
import deNav from './locales/de/nav.json';
import deProfile from './locales/de/profile.json';

import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esDashboard from './locales/es/dashboard.json';
import esAquarium from './locales/es/aquarium.json';
import esNav from './locales/es/nav.json';
import esProfile from './locales/es/profile.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'es'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'aquarium', 'nav', 'profile'],
    detection: {
      // Orden: localStorage → navigator → fallback
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'thalassa_locale',
    },
    resources: {
      en: { common: enCommon, auth: enAuth, dashboard: enDashboard, aquarium: enAquarium, nav: enNav, profile: enProfile },
      de: { common: deCommon, auth: deAuth, dashboard: deDashboard, aquarium: deAquarium, nav: deNav, profile: deProfile },
      es: { common: esCommon, auth: esAuth, dashboard: esDashboard, aquarium: esAquarium, nav: esNav, profile: esProfile },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
