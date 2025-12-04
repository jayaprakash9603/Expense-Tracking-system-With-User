/**
 * Language Context
 * Provides language state and translation functions throughout the app
 */
import React, { createContext, useState, useEffect, useCallback } from "react";
import { translations } from "./translations";
import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  getBrowserLanguage,
  getLanguageDirection,
} from "./config";

export const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: () => {},
  direction: "ltr",
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [direction, setDirection] = useState("ltr");

  // Initialize language from localStorage or browser
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    const initialLanguage = storedLanguage || getBrowserLanguage();

    if (translations[initialLanguage]) {
      setLanguageState(initialLanguage);
      setDirection(getLanguageDirection(initialLanguage));

      // Set HTML dir attribute for RTL support
      document.documentElement.dir = getLanguageDirection(initialLanguage);
      document.documentElement.lang = initialLanguage;
    }
  }, []);

  // Translation function with fallback
  const t = useCallback(
    (key) => {
      // Split key by dots for nested access (e.g., "dashboard.title")
      const keys = key.split(".");

      // Try to get translation from current language
      let translation = translations[language];
      for (const k of keys) {
        translation = translation?.[k];
      }

      // If translation found, return it
      if (translation) {
        return translation;
      }

      // Fallback to English
      let fallbackTranslation = translations[FALLBACK_LANGUAGE];
      for (const k of keys) {
        fallbackTranslation = fallbackTranslation?.[k];
      }

      // Return fallback or the key itself if nothing found
      return fallbackTranslation || key;
    },
    [language]
  );

  // Set language with side effects
  const setLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      localStorage.setItem("language", newLanguage);

      const newDirection = getLanguageDirection(newLanguage);
      setDirection(newDirection);

      // Update HTML attributes
      document.documentElement.dir = newDirection;
      document.documentElement.lang = newLanguage;
    }
  }, []);

  const value = {
    language,
    setLanguage,
    t,
    direction,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
