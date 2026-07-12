export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "hi", name: "Hindi", nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "te", name: "Telugu", nativeName: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", flag: "\u{1F1EE}\u{1F1F3}" },
];

export const DEFAULT_LANGUAGE = "en";
export const FALLBACK_LANGUAGE = "en";

export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split("-")[0];
  const isSupported = SUPPORTED_LANGUAGES.some((lang) => lang.code === langCode);
  return isSupported ? langCode : DEFAULT_LANGUAGE;
};

export const getLanguageDirection = (langCode) => {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === langCode);
  return language?.rtl ? "rtl" : "ltr";
};
