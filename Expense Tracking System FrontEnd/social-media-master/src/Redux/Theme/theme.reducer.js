import { TOGGLE_THEME, SET_THEME } from "./theme.actionTypes";

// Get initial theme - do NOT use localStorage to avoid showing previous user's theme
// Wait for backend to provide the theme after authentication
const getInitialTheme = () => {
  // Only use localStorage if user is logged in (has jwt token)
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  }
  // Default theme for non-authenticated users
  return "dark";
};

const initialState = {
  mode: getInitialTheme(), // 'dark' or 'light'
};

export const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_THEME:
      const newMode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newMode);
      return {
        ...state,
        mode: newMode,
      };

    case SET_THEME:
      localStorage.setItem("theme", action.payload);
      return {
        ...state,
        mode: action.payload,
      };

    default:
      return state;
  }
};
