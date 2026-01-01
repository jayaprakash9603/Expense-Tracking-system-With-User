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

const resolveTranslationPath = (languagePack, key) => {
  if (!languagePack || !key) return undefined;
  return key
    .split(".")
    .reduce((acc, currentKey) => acc?.[currentKey], languagePack);
};

const interpolateVariables = (template, variables = {}) => {
  if (typeof template !== "string") {
    return template;
  }

  return template.replace(/{{\s*(\w+)\s*}}/g, (match, variableName) => {
    if (
      Object.prototype.hasOwnProperty.call(variables, variableName) &&
      variables[variableName] !== undefined &&
      variables[variableName] !== null
    ) {
      return variables[variableName];
    }
    return match;
  });
};

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
    (key, variables = {}) => {
      const translation = resolveTranslationPath(translations[language], key);

      if (translation !== undefined && translation !== null) {
        return interpolateVariables(translation, variables);
      }

      const fallbackTranslation = resolveTranslationPath(
        translations[FALLBACK_LANGUAGE],
        key
      );

      if (fallbackTranslation !== undefined && fallbackTranslation !== null) {
        return interpolateVariables(fallbackTranslation, variables);
      }

      return key;
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
