import { api } from "@/config/api";
import { setTheme } from "@/redux/theme/theme.actions";

const preloadThemePreference = async (dispatch) => {
  try {
    const { data } = await api.get("/api/settings");
    if (data?.themeMode) {
      localStorage.setItem("theme", data.themeMode);
      dispatch(setTheme(data.themeMode));
    }
    if (data?.language) {
      localStorage.setItem("language", data.language);
    }
    return data;
  } catch {
    return null;
  }
};

export const preloadUserPreferences = async (dispatch) => {
  await preloadThemePreference(dispatch);
};
