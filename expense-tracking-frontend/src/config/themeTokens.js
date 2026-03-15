/**
 * Theme Tokens Generator
 * 
 * Generates semantic design tokens from a color palette and mode.
 * All values derive from colorPalettes.js surfaces -- no hardcoded hex.
 */

import { 
  COLOR_PALETTES, 
  getSurfaceColors, 
  SEMANTIC_COLORS 
} from "./colorPalettes";
import { 
  alpha, 
  lighten, 
  darken, 
  getContrastText 
} from "../utils/colorUtils";

export const generateThemeTokens = (paletteId = "teal", mode = "dark") => {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.teal;
  const surfaces = getSurfaceColors(palette, mode);
  const isDark = mode === "dark";

  const primaryAccent = palette.primary;
  const secondaryAccent = isDark 
    ? lighten(palette.primary, 10) 
    : darken(palette.primary, 10);
  const tertiaryAccent = isDark 
    ? darken(palette.primary, 10) 
    : darken(palette.primary, 20);

  return {
    primary_bg: surfaces.background.paper,
    secondary_bg: surfaces.background.default,
    tertiary_bg: isDark ? "#0b0b0b" : surfaces.surface.level2,
    card_bg: surfaces.background.paper,
    input_bg: surfaces.surface.level2,

    active_bg: isDark 
      ? alpha(palette.primary, 0.15) 
      : alpha(palette.primary, 0.12),
    hover_bg: surfaces.action.hover,
    overlay_bg: surfaces.background.paper,

    primary_text: surfaces.text.primary,
    secondary_text: isDark ? "#ffffff" : "#2a2a2a",
    placeholder_text: "#9ca3af",
    active_text: palette.accent,
    brand_text: palette.primary,

    primary_accent: primaryAccent,
    secondary_accent: secondaryAccent,
    tertiary_accent: tertiaryAccent,
    accent: primaryAccent,

    border_color: surfaces.border.default,
    border_light: surfaces.border.light,
    border: surfaces.border.default,

    icon_default: surfaces.text.primary,
    icon_active: palette.accent,
    icon_muted: isDark ? "#666666" : "#2a2a2a",

    button_inactive: isDark ? "#28282a" : surfaces.border.light,
    button_bg: palette.accent,
    button_text: getContrastText(palette.accent),
    button_hover: tertiaryAccent,

    avatar_bg: palette.primary,
    avatar_text: getContrastText(palette.primary),

    modal_bg: surfaces.background.paper,
    modal_overlay: isDark 
      ? "rgba(0, 0, 0, 0.95)" 
      : "rgba(0, 0, 0, 0.5)",

    success: SEMANTIC_COLORS.success.main,
    success_light: SEMANTIC_COLORS.success.light,
    success_dark: SEMANTIC_COLORS.success.dark,
    warning: SEMANTIC_COLORS.warning.main,
    warning_light: SEMANTIC_COLORS.warning.light,
    warning_dark: SEMANTIC_COLORS.warning.dark,
    error: SEMANTIC_COLORS.error.main,
    error_light: SEMANTIC_COLORS.error.light,
    error_dark: SEMANTIC_COLORS.error.dark,
    info: SEMANTIC_COLORS.info.main,
    info_light: SEMANTIC_COLORS.info.light,
    info_dark: SEMANTIC_COLORS.info.dark,

    chart_primary: palette.primary,
    chart_secondary: palette.secondary,
    chart_accent: palette.accent,
    chart_grid: isDark ? "#333333" : surfaces.surface.level3,
    chart_tooltip_bg: isDark ? "#2a2a2a" : "#ffffff",
    chart_tooltip_text: surfaces.text.primary,

    gradient_start: palette.primary,
    gradient_end: palette.secondary,
    gradient_bg: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,

    shadow_color: isDark 
      ? "rgba(0, 0, 0, 0.5)" 
      : "rgba(0, 0, 0, 0.15)",
    shadow_colored: alpha(palette.primary, isDark ? 0.3 : 0.2),

    focus_ring: alpha(palette.primary, 0.5),
    focus_visible: palette.primary,

    selection_bg: alpha(palette.primary, isDark ? 0.3 : 0.2),
    selection_text: surfaces.text.primary,

    scrollbar_thumb: isDark ? "#555555" : "#c0c0c0",
    scrollbar_track: isDark ? "#2a2a2a" : surfaces.surface.hover,
    scrollbar_hover: isDark ? "#777777" : "#a0a0a0",

    skeleton_base: isDark ? "#2a2a2a" : surfaces.surface.level3,
    skeleton_highlight: isDark ? "#3a3a3a" : surfaces.surface.hover,

    _palette: paletteId,
    _mode: mode,
  };
};

/**
 * Generate CSS custom properties object from theme tokens
 * @param {Object} tokens - Theme tokens object
 * @returns {Object} CSS custom properties with --prefix
 */
export const tokensToCssVars = (tokens) => {
  const cssVars = {};
  
  Object.entries(tokens).forEach(([key, value]) => {
    // Skip metadata keys
    if (key.startsWith("_")) return;
    
    // Convert snake_case to kebab-case and add prefix
    const cssKey = `--color-${key.replace(/_/g, "-")}`;
    cssVars[cssKey] = value;
  });
  
  return cssVars;
};

/**
 * Generate CSS variable string for injection
 * @param {Object} tokens - Theme tokens object
 * @returns {string} CSS variable declarations
 */
export const tokensToCssString = (tokens) => {
  const cssVars = tokensToCssVars(tokens);
  
  return Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
};

/**
 * Get theme ID string from palette and mode
 * @param {string} paletteId - Palette ID
 * @param {string} mode - Theme mode
 * @returns {string} Theme ID (e.g., "teal-dark")
 */
export const getThemeId = (paletteId, mode) => `${paletteId}-${mode}`;

/**
 * Parse theme ID into palette and mode
 * @param {string} themeId - Theme ID (e.g., "teal-dark")
 * @returns {{ palette: string, mode: string }}
 */
export const parseThemeId = (themeId) => {
  const parts = themeId.split("-");
  const mode = parts.pop();
  const palette = parts.join("-");
  
  return {
    palette: palette || "teal",
    mode: mode === "light" || mode === "dark" ? mode : "dark",
  };
};

export default {
  generateThemeTokens,
  tokensToCssVars,
  tokensToCssString,
  getThemeId,
  parseThemeId,
};
