import React, { useEffect, useSyncExternalStore } from "react";
import { store } from "@/redux/store";
import { injectTheme, applyUserSettingsEnhancements } from "@/shared/utils/theme/themeInjector";

function selectThemeAndSettings(state) {
  return {
    mode: state.theme?.mode || "dark",
    palette: state.theme?.palette || "teal",
    userSettings: state.userSettings?.settings,
  };
}

function snapshotsEqual(a, b) {
  if (a === b) return true;
  return (
    a.mode === b.mode &&
    a.palette === b.palette &&
    a.userSettings === b.userSettings
  );
}

let themeSnapshotCache = null;

function getThemeSnapshot() {
  const fresh = selectThemeAndSettings(store.getState());
  if (themeSnapshotCache && snapshotsEqual(themeSnapshotCache, fresh)) {
    return themeSnapshotCache;
  }
  themeSnapshotCache = {
    mode: fresh.mode,
    palette: fresh.palette,
    userSettings: fresh.userSettings,
  };
  return themeSnapshotCache;
}

function subscribeTheme(onChange) {
  return store.subscribe(() => {
    const fresh = selectThemeAndSettings(store.getState());
    const prev = themeSnapshotCache;
    if (!prev || !snapshotsEqual(prev, fresh)) {
      onChange();
    }
  });
}

export function ThemeProvider({ children }) {
  const { mode, palette, userSettings } = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeSnapshot,
  );

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
