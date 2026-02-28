import { 
  TOGGLE_THEME, 
  SET_THEME, 
  SET_PALETTE, 
  SET_THEME_FULL, 
  SET_SYSTEM_PREFERENCE,
  RESET_THEME 
} from "./theme.actionTypes";
import { getSystemPreference } from "../../utils/themeInjector";
import { COLOR_PALETTES } from "../../config/colorPalettes";

// Default values
const DEFAULT_MODE = "dark";
const DEFAULT_PALETTE = "teal";

// Local storage keys
const STORAGE_KEY_MODE = "theme";
const STORAGE_KEY_PALETTE = "themePalette";
const STORAGE_KEY_USE_SYSTEM = "themeUseSystem";

// Get initial theme state
const getInitialState = () => {
  // Only use localStorage if user is logged in (has jwt token)
  const jwt = localStorage.getItem("jwt");
  
  if (jwt) {
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
    const savedPalette = localStorage.getItem(STORAGE_KEY_PALETTE);
    const savedUseSystem = localStorage.getItem(STORAGE_KEY_USE_SYSTEM);
    
    const useSystem = savedUseSystem === "true";
    const mode = useSystem 
      ? getSystemPreference() 
      : (savedMode || DEFAULT_MODE);
    const palette = savedPalette && COLOR_PALETTES[savedPalette] 
      ? savedPalette 
      : DEFAULT_PALETTE;
    
    return {
      mode,
      palette,
      useSystemPreference: useSystem,
    };
  }
  
  // Default state for non-authenticated users
  return {
    mode: DEFAULT_MODE,
    palette: DEFAULT_PALETTE,
    useSystemPreference: false,
  };
};

const initialState = getInitialState();

// Helper to persist theme state
const persistTheme = (mode, palette, useSystem) => {
  localStorage.setItem(STORAGE_KEY_MODE, mode);
  localStorage.setItem(STORAGE_KEY_PALETTE, palette);
  localStorage.setItem(STORAGE_KEY_USE_SYSTEM, String(useSystem));
};

export const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_THEME: {
      const newMode = state.mode === "dark" ? "light" : "dark";
      persistTheme(newMode, state.palette, false);
      return {
        ...state,
        mode: newMode,
        useSystemPreference: false, // Disable system preference when manually toggling
      };
    }

    case SET_THEME: {
      const newMode = action.payload === "light" ? "light" : "dark";
      persistTheme(newMode, state.palette, false);
      return {
        ...state,
        mode: newMode,
        useSystemPreference: false,
      };
    }

    case SET_PALETTE: {
      const newPalette = COLOR_PALETTES[action.payload] 
        ? action.payload 
        : DEFAULT_PALETTE;
      persistTheme(state.mode, newPalette, state.useSystemPreference);
      return {
        ...state,
        palette: newPalette,
      };
    }

    case SET_THEME_FULL: {
      const { mode, palette } = action.payload;
      const newMode = mode === "light" ? "light" : "dark";
      const newPalette = COLOR_PALETTES[palette] ? palette : DEFAULT_PALETTE;
      persistTheme(newMode, newPalette, false);
      return {
        ...state,
        mode: newMode,
        palette: newPalette,
        useSystemPreference: false,
      };
    }

    case SET_SYSTEM_PREFERENCE: {
      const useSystem = Boolean(action.payload);
      const newMode = useSystem ? getSystemPreference() : state.mode;
      persistTheme(newMode, state.palette, useSystem);
      return {
        ...state,
        mode: newMode,
        useSystemPreference: useSystem,
      };
    }

    case RESET_THEME: {
      persistTheme(DEFAULT_MODE, DEFAULT_PALETTE, false);
      return {
        mode: DEFAULT_MODE,
        palette: DEFAULT_PALETTE,
        useSystemPreference: false,
      };
    }

    default:
      return state;
  }
};
