import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { injectTheme, applyUserSettingsEnhancements } from "@/shared/utils/themeInjector";

export function ThemeProvider({ children }) {
  const mode = useSelector((state) => state.theme?.mode || "dark");
  const palette = useSelector((state) => state.theme?.palette || "teal");
  const userSettings = useSelector((state) => state.userSettings?.settings);

  useEffect(() => {
    injectTheme(palette, mode);
  }, [palette, mode]);

  useEffect(() => {
    if (userSettings) {
      applyUserSettingsEnhancements(userSettings);
    }
  }, [
    userSettings?.fontFamily,
    userSettings?.fontSize,
    userSettings?.compactMode,
    userSettings?.reduceMotion,
    userSettings?.highContrastMode,
    userSettings?.enableAnimations,
    userSettings?.enhancedFocusIndicators,
    userSettings?.screenReaderSupport,
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("expensio_user_settings");
      if (stored) {
        applyUserSettingsEnhancements(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;
