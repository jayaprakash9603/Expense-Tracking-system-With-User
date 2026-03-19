import React, { useState, useEffect, useCallback } from "react";
import { translations } from "./translations";
import { LanguageContext } from "./context";
import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  getBrowserLanguage,
  getLanguageDirection,
} from "./config";
import { STORAGE_KEYS } from "@/config/constants";

const resolveTranslationPath = (languagePack, key) => {
  if (!languagePack || !key) return undefined;
  return key.split(".").reduce((acc, k) => acc?.[k], languagePack);
};

const interpolateVariables = (template, variables = {}) => {
  if (typeof template !== "string") return template;
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, varName) => {
    if (Object.prototype.hasOwnProperty.call(variables, varName) && variables[varName] != null) {
      return variables[varName];
    }
    return match;
  });
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [direction, setDirection] = useState("ltr");

  useEffect(() => {
    const storedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    const initialLanguage = storedLanguage || getBrowserLanguage();

    if (translations[initialLanguage]) {
      setLanguageState(initialLanguage);
      setDirection(getLanguageDirection(initialLanguage));
      document.documentElement.dir = getLanguageDirection(initialLanguage);
      document.documentElement.lang = initialLanguage;
    }
  }, []);

  const t = useCallback(
    (key, variables = {}) => {
      const translation = resolveTranslationPath(translations[language], key);
      if (translation != null) return interpolateVariables(translation, variables);

      const fallback = resolveTranslationPath(translations[FALLBACK_LANGUAGE], key);
      if (fallback != null) return interpolateVariables(fallback, variables);

      return key;
    },
    [language]
  );

  const setLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);

      const newDirection = getLanguageDirection(newLanguage);
      setDirection(newDirection);
      document.documentElement.dir = newDirection;
      document.documentElement.lang = newLanguage;
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction }}>
      {children}
    </LanguageContext.Provider>
  );
};
