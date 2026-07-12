import React from "react";
import { LanguageProvider } from "@/i18n/LanguageContext";

export function LanguageProviderWrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

export default LanguageProviderWrapper;
