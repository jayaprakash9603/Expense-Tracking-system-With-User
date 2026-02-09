/**
 * Color Palettes Configuration
 * 
 * Defines preset color palettes for the application theme system.
 * Each palette includes primary, secondary, and semantic colors.
 * Inspired by Material UI's theming approach.
 */

import { generateShades, generateMuiColor, lighten, darken } from "../utils/colorUtils";

/**
 * Preset Color Palettes
 * Each palette defines the accent colors that drive the entire theme.
 */
export const COLOR_PALETTES = {
  teal: {
    id: "teal",
    name: "Teal",
    description: "Default theme - calm and professional",
    primary: "#14b8a6",
    secondary: "#06b6d4",
    accent: "#00DAC6",
    // CSS filters to colorize white icons to this palette's accent color
    iconFilter: {
      dark: "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)",
      light: "invert(61%) sepia(55%) saturate(654%) hue-rotate(130deg) brightness(91%) contrast(90%)",
    },
  },
  blue: {
    id: "blue",
    name: "Blue",
    description: "Trust and reliability",
    primary: "#2196f3",
    secondary: "#1976d2",
    accent: "#64b5f6",
    iconFilter: {
      dark: "invert(55%) sepia(65%) saturate(2000%) hue-rotate(196deg) brightness(103%) contrast(96%)",
      light: "invert(45%) sepia(98%) saturate(2000%) hue-rotate(196deg) brightness(95%) contrast(96%)",
    },
  },
  purple: {
    id: "purple",
    name: "Purple",
    description: "Creative and premium",
    primary: "#9c27b0",
    secondary: "#7b1fa2",
    accent: "#ce93d8",
    iconFilter: {
      dark: "invert(60%) sepia(30%) saturate(1500%) hue-rotate(250deg) brightness(95%) contrast(90%)",
      light: "invert(20%) sepia(70%) saturate(4000%) hue-rotate(278deg) brightness(88%) contrast(120%)",
    },
  },
  indigo: {
    id: "indigo",
    name: "Indigo",
    description: "Deep and sophisticated",
    primary: "#5b7fff",
    secondary: "#3f51b5",
    accent: "#7986cb",
    iconFilter: {
      dark: "invert(52%) sepia(81%) saturate(3600%) hue-rotate(218deg) brightness(98%) contrast(101%)",
      light: "invert(30%) sepia(80%) saturate(3000%) hue-rotate(225deg) brightness(85%) contrast(100%)",
    },
  },
  orange: {
    id: "orange",
    name: "Orange",
    description: "Energy and warmth",
    primary: "#ff9800",
    secondary: "#f57c00",
    accent: "#ffb74d",
    iconFilter: {
      dark: "invert(62%) sepia(60%) saturate(1900%) hue-rotate(2deg) brightness(103%) contrast(105%)",
      light: "invert(55%) sepia(90%) saturate(2000%) hue-rotate(10deg) brightness(95%) contrast(100%)",
    },
  },
  pink: {
    id: "pink",
    name: "Pink",
    description: "Modern and bold",
    primary: "#e91e63",
    secondary: "#c2185b",
    accent: "#f48fb1",
    iconFilter: {
      dark: "invert(70%) sepia(30%) saturate(1500%) hue-rotate(300deg) brightness(100%) contrast(95%)",
      light: "invert(21%) sepia(98%) saturate(4566%) hue-rotate(329deg) brightness(96%) contrast(94%)",
    },
  },
  green: {
    id: "green",
    name: "Green",
    description: "Growth and finance",
    primary: "#4caf50",
    secondary: "#388e3c",
    accent: "#81c784",
    iconFilter: {
      dark: "invert(68%) sepia(53%) saturate(532%) hue-rotate(79deg) brightness(93%) contrast(88%)",
      light: "invert(50%) sepia(50%) saturate(600%) hue-rotate(80deg) brightness(90%) contrast(90%)",
    },
  },
  red: {
    id: "red",
    name: "Red",
    description: "Bold and energetic",
    primary: "#f44336",
    secondary: "#d32f2f",
    accent: "#ef5350",
    iconFilter: {
      dark: "invert(43%) sepia(95%) saturate(2800%) hue-rotate(346deg) brightness(103%) contrast(93%)",
      light: "invert(30%) sepia(95%) saturate(3000%) hue-rotate(350deg) brightness(95%) contrast(95%)",
    },
  },
  amber: {
    id: "amber",
    name: "Amber",
    description: "Warm and inviting",
    primary: "#ffc107",
    secondary: "#ffa000",
    accent: "#ffd54f",
    iconFilter: {
      dark: "invert(85%) sepia(97%) saturate(1300%) hue-rotate(350deg) brightness(103%) contrast(101%)",
      light: "invert(70%) sepia(90%) saturate(1500%) hue-rotate(355deg) brightness(95%) contrast(100%)",
    },
  },
  cyan: {
    id: "cyan",
    name: "Cyan",
    description: "Fresh and clean",
    primary: "#00bcd4",
    secondary: "#0097a7",
    accent: "#4dd0e1",
    iconFilter: {
      dark: "invert(66%) sepia(91%) saturate(2400%) hue-rotate(148deg) brightness(90%) contrast(102%)",
      light: "invert(55%) sepia(80%) saturate(2000%) hue-rotate(150deg) brightness(85%) contrast(100%)",
    },
  },
};

/**
 * Get icon filter for a specific palette and mode
 * @param {string} paletteId - Palette ID
 * @param {string} mode - 'dark' or 'light'
 * @param {boolean} isActive - Whether icon is in active state
 * @returns {string} CSS filter value
 */
export const getIconFilterForPalette = (paletteId, mode, isActive = false) => {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.teal;
  
  if (!isActive) {
    // Default/inactive: white for dark mode, dark gray for light mode
    return mode === "dark" 
      ? "invert(100%)" 
      : "invert(7%) sepia(6%) saturate(266%) hue-rotate(202deg) brightness(96%) contrast(93%)";
  }
  
  // Active: use palette-specific accent filter
  return palette.iconFilter?.[mode] || palette.iconFilter?.dark || COLOR_PALETTES.teal.iconFilter.dark;
};

/**
 * Semantic Colors (consistent across all palettes)
 * These colors have fixed meaning and don't change with palette selection.
 */
export const SEMANTIC_COLORS = {
  success: {
    main: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    contrastText: "#000000",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
    contrastText: "#ffffff",
  },
  info: {
    main: "#3b82f6",
    light: "#60a5fa",
    dark: "#2563eb",
    contrastText: "#ffffff",
  },
};

/**
 * Generate a complete palette with all shades and variants
 * @param {string} paletteId - Palette ID from COLOR_PALETTES
 * @returns {Object} Complete palette with shades
 */
export const getExpandedPalette = (paletteId) => {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.teal;
  
  return {
    ...palette,
    primaryShades: generateShades(palette.primary),
    secondaryShades: generateShades(palette.secondary),
    primaryMui: generateMuiColor(palette.primary),
    secondaryMui: generateMuiColor(palette.secondary),
    ...SEMANTIC_COLORS,
  };
};

/**
 * Dark mode surface colors generator
 * These are calculated based on the palette's primary color
 * @param {Object} palette - Color palette object
 * @returns {Object} Dark mode surface colors
 */
export const getDarkSurfaces = (palette) => {
  const primary = palette.primary;
  
  return {
    // Backgrounds - pure dark with subtle hints of primary
    background: {
      default: "#121212",
      paper: "#1b1b1b",
      elevated: "#242424",
    },
    // Surfaces with increasing elevation
    surface: {
      level0: "#121212",
      level1: "#1b1b1b",
      level2: "#222222",
      level3: "#282828",
      level4: "#2e2e2e",
    },
    // Text colors
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
      hint: "rgba(255, 255, 255, 0.5)",
    },
    // Dividers and borders
    divider: "rgba(255, 255, 255, 0.12)",
    border: {
      default: "#333333",
      light: "#28282a",
      focus: palette.primary,
    },
    // Action colors
    action: {
      active: "rgba(255, 255, 255, 0.56)",
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(255, 255, 255, 0.16)",
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      focus: "rgba(255, 255, 255, 0.12)",
    },
  };
};

/**
 * Light mode surface colors generator
 * @param {Object} palette - Color palette object
 * @returns {Object} Light mode surface colors
 */
export const getLightSurfaces = (palette) => {
  const primaryLight = lighten(palette.primary, 45);
  
  return {
    // Backgrounds
    background: {
      default: "#ffffff",
      paper: "#f5f5f5",
      elevated: "#fafafa",
    },
    // Surfaces with increasing elevation
    surface: {
      level0: "#ffffff",
      level1: "#f5f5f5",
      level2: "#eeeeee",
      level3: "#e0e0e0",
      level4: "#d6d6d6",
    },
    // Text colors
    text: {
      primary: "#1a1a1a",
      secondary: "rgba(0, 0, 0, 0.6)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)",
    },
    // Dividers and borders
    divider: "rgba(0, 0, 0, 0.12)",
    border: {
      default: "#d0d0d0",
      light: "#e8e8e8",
      focus: palette.primary,
    },
    // Action colors
    action: {
      active: "rgba(0, 0, 0, 0.54)",
      hover: "rgba(0, 0, 0, 0.04)",
      selected: "rgba(0, 0, 0, 0.08)",
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      focus: "rgba(0, 0, 0, 0.12)",
    },
  };
};

/**
 * Get surface colors based on mode
 * @param {Object} palette - Color palette object
 * @param {string} mode - "dark" or "light"
 * @returns {Object} Surface colors for the mode
 */
export const getSurfaceColors = (palette, mode) => {
  return mode === "dark" ? getDarkSurfaces(palette) : getLightSurfaces(palette);
};

/**
 * Get list of available palette IDs
 * @returns {string[]} Array of palette IDs
 */
export const getAvailablePalettes = () => Object.keys(COLOR_PALETTES);

/**
 * Get palette metadata for UI display
 * @returns {Array} Array of palette info objects
 */
export const getPaletteOptions = () => {
  return Object.values(COLOR_PALETTES).map((palette) => ({
    id: palette.id,
    name: palette.name,
    description: palette.description,
    primary: palette.primary,
    secondary: palette.secondary,
  }));
};

export default {
  COLOR_PALETTES,
  SEMANTIC_COLORS,
  getExpandedPalette,
  getDarkSurfaces,
  getLightSurfaces,
  getSurfaceColors,
  getAvailablePalettes,
  getPaletteOptions,
};
