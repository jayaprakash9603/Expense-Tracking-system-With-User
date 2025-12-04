/**
 * i18n Configuration
 * Centralized internationalization setup
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
];

export const DEFAULT_LANGUAGE = "en";

export const FALLBACK_LANGUAGE = "en";

// Get browser language
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0];

  // Check if browser language is supported
  const isSupported = SUPPORTED_LANGUAGES.some(
    (lang) => lang.code === langCode
  );
  return isSupported ? langCode : DEFAULT_LANGUAGE;
};

// Get language direction (RTL or LTR)
export const getLanguageDirection = (langCode) => {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);
  return language?.rtl ? "rtl" : "ltr";
};
