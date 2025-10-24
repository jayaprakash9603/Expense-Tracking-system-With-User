import { TOGGLE_THEME, SET_THEME } from "./theme.actionTypes";

// Toggle between dark and light mode
export const toggleTheme = () => ({
  type: TOGGLE_THEME,
});

// Set specific theme
export const setTheme = (theme) => ({
  type: SET_THEME,
  payload: theme,
});
