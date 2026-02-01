/**
 * i18n Configuration - React Native Web Compatible
 * 
 * Unterstützt 19 Sprachen wie im Original
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import de from './locales/de.json';
import en from './locales/en.json';

// Get device language (fallback to 'de')
// Web-compatible: use navigator.language instead of react-native-localize
const getDeviceLanguage = (): string => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0];
  }
  return 'de';
};

const deviceLanguage = getDeviceLanguage();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      de: { translation: de },
      en: { translation: en },
      // Weitere Sprachen werden später hinzugefügt
    },
    lng: deviceLanguage,
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
  })
  .catch((error: Error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
