import { api } from "../config/api";
import { setTheme } from "../Redux/Theme/theme.actions";

const preloadDashboardPreferences = async () => {
  try {
    const { data } = await api.get("/api/user/report-preferences/dashboard");
    if (data?.layoutConfig) {
      localStorage.setItem("dashboard_layout_config", data.layoutConfig);
      return true;
    }
  } catch {
    return false;
  }
  return false;
};

const fetchUserSettings = async () => {
  try {
    const { data } = await api.get("/api/settings");
    return data || null;
  } catch {
    return null;
  }
};

const applySettingsPreferences = (dispatch, settings, themeLocked = false) => {
  if (themeLocked) {
    dispatch(setTheme("dark"));
    return;
  }
  if (settings?.themeMode) {
    localStorage.setItem("theme", settings.themeMode);
    dispatch(setTheme(settings.themeMode));
  }
  if (settings?.language) {
    localStorage.setItem("language", settings.language);
  }
};

/**
 * Preloads dashboard layout, theme, and language in parallel (single /api/settings call).
 */
export const preloadUserPreferences = async (dispatch, themeLocked = false) => {
  const [, settings] = await Promise.all([
    preloadDashboardPreferences(),
    fetchUserSettings(),
  ]);
  applySettingsPreferences(dispatch, settings, themeLocked);
  return settings;
};
