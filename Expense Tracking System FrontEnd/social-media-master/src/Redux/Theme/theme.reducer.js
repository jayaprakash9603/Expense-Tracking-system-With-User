import { TOGGLE_THEME, SET_THEME } from "./theme.actionTypes";

// Get initial theme from localStorage or default to 'dark'
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme || "dark";
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
