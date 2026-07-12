import { createContext } from "react";
import { DEFAULT_LANGUAGE } from "./config";

export const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: () => {},
  direction: "ltr",
});
