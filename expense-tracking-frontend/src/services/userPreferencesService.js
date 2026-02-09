import { api } from "../config/api";
import { setTheme } from "../Redux/Theme/theme.actions";

/**
 * Service responsible for preloading user preferences
 * Handles dashboard layout, theme, and language preferences
 */

/**
 * Preloads dashboard preferences from backend
 */
const preloadDashboardPreferences = async () => {
  try {
    const { data } = await api.get("/api/user/dashboard-preferences");
    if (data?.layoutConfig) {
      localStorage.setItem("dashboard_layout_config", data.layoutConfig);
      console.log("Dashboard preferences preloaded");
      return true;
    }
  } catch (error) {
    console.log("Could not preload dashboard preferences:", error.message);
    return false;
  }
};

/**
 * Preloads theme preference from backend
 */
const preloadThemePreference = async (dispatch) => {
  try {
    const { data } = await api.get("/api/settings");
    if (data?.themeMode) {
      // Set theme immediately in localStorage before components render
      localStorage.setItem("theme", data.themeMode);
      dispatch(setTheme(data.themeMode));
      console.log("Theme preloaded:", data.themeMode);
      return true;
    }
  } catch (error) {
    console.log("Could not preload theme:", error.message);
    return false;
  }
};

/**
 * Preloads language preference from backend
 */
const preloadLanguagePreference = async () => {
  try {
    const { data } = await api.get("/api/settings");
    if (data?.language) {
      // Store language in localStorage for LanguageContext to pick up
      localStorage.setItem("language", data.language);
      console.log("Language preloaded:", data.language);
      return true;
    }
  } catch (error) {
    console.log("Could not preload language:", error.message);
    return false;
  }
};

/**
 * Preloads all user preferences (dashboard layout, theme, and language)
 * This runs before the app fully initializes to prevent UI flashing
 */
export const preloadUserPreferences = async (dispatch) => {
  await Promise.all([
    preloadDashboardPreferences(),
    preloadThemePreference(dispatch),
    preloadLanguagePreference(),
  ]);
};
