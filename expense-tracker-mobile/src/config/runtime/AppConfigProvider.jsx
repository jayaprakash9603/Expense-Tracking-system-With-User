import React, { createContext, useMemo } from "react";
import { getAppConfig } from "@/config/runtime/parseAppConfig";

export const AppConfigContext = createContext(null);

export function AppConfigProvider({ children }) {
  const value = useMemo(() => getAppConfig(), []);
  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export default AppConfigProvider;
