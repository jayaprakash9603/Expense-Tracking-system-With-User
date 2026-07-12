import {
  TOGGLE_THEME,
  SET_THEME,
  SET_PALETTE,
  SET_THEME_FULL,
  SET_SYSTEM_PREFERENCE,
  RESET_THEME,
} from "./theme.actionTypes";

export const toggleTheme = () => ({ type: TOGGLE_THEME });

export const setTheme = (mode) => ({ type: SET_THEME, payload: mode });

export const setPalette = (paletteId) => ({ type: SET_PALETTE, payload: paletteId });

export const setThemeFull = (mode, palette) => ({
  type: SET_THEME_FULL,
  payload: { mode, palette },
});

export const setSystemPreference = (useSystem) => ({
  type: SET_SYSTEM_PREFERENCE,
  payload: useSystem,
});

export const resetTheme = () => ({ type: RESET_THEME });
