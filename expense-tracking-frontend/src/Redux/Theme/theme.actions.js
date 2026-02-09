import { 
  TOGGLE_THEME, 
  SET_THEME, 
  SET_PALETTE, 
  SET_THEME_FULL, 
  SET_SYSTEM_PREFERENCE,
  RESET_THEME 
} from "./theme.actionTypes";

// Toggle between dark and light mode
export const toggleTheme = () => ({
  type: TOGGLE_THEME,
});

// Set specific theme mode (dark/light)
export const setTheme = (mode) => ({
  type: SET_THEME,
  payload: mode,
});

// Set color palette
export const setPalette = (paletteId) => ({
  type: SET_PALETTE,
  payload: paletteId,
});

// Set both mode and palette at once
export const setThemeFull = (mode, paletteId) => ({
  type: SET_THEME_FULL,
  payload: { mode, palette: paletteId },
});

// Enable/disable system preference matching
export const setSystemPreference = (useSystem) => ({
  type: SET_SYSTEM_PREFERENCE,
  payload: useSystem,
});

// Reset theme to defaults
export const resetTheme = () => ({
  type: RESET_THEME,
});
