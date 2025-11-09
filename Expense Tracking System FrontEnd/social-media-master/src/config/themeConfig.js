/**
 * Theme Configuration for Expensio Finance Application
 *
 * This file contains all color configurations for both dark and light themes.
 * Use the getThemeColors() function to get theme-aware colors in your components.
 *
 * Primary Color: #14b8a6 (Teal/Cyan)
 */

export const THEME_COLORS = {
  dark: {
    // Main backgrounds
    primary_bg: "#1b1b1b", // Main sidebar/container background
    secondary_bg: "#121212", // Darker background for contrast
    tertiary_bg: "#0b0b0b", // Even darker for headers

    // Active/Hover states
    active_bg: "#29282b", // Active menu item background
    hover_bg: "#28282a", // Hover state background
    overlay_bg: "#1b1b1b", // Modal overlay background

    // Text colors
    primary_text: "#ffffff", // Main text color
    secondary_text: "#ffffff", // Muted text, disabled states (changed to white for better readability)
    placeholder_text: "#9ca3af", // Placeholder text color (light gray)
    active_text: "#00DAC6", // Active menu item text (primary teal)
    brand_text: "#14b8a6", // Brand color text

    // Accent colors
    primary_accent: "#14b8a6", // Primary brand color (teal)
    secondary_accent: "#00DAC6", // Lighter teal for highlights
    tertiary_accent: "#00b8a9", // Darker teal for hover

    // Border colors
    border_color: "#333333", // Default border
    border_light: "#28282a", // Light border

    // Icon colors
    icon_default: "#ffffff", // Default icon color (will use filter)
    icon_active: "#00DAC6", // Active icon color (will use filter)
    icon_muted: "#666666", // Muted icon color

    // Button colors
    button_inactive: "#28282a", // Light gray for inactive buttons
    button_bg: "#00DAC6", // Primary button background
    button_text: "#1b1b1b", // Primary button text
    button_hover: "#00b8a9", // Primary button hover

    // Avatar colors
    avatar_bg: "#14b8a6", // Avatar background
    avatar_text: "#1b1b1b", // Avatar text

    // Modal/Dialog
    modal_bg: "#1b1b1b", // Modal background
    modal_overlay: "rgba(0, 0, 0, 0.95)", // Modal backdrop (thicker/darker)
  },

  light: {
    // Main backgrounds
    primary_bg: "#ffffff", // Main sidebar/container background (white)
    secondary_bg: "#f5f5f5", // Light gray for contrast
    tertiary_bg: "#e8e8e8", // Lighter gray for headers

    // Active/Hover states
    active_bg: "#e0f7f5", // Light teal background for active items
    hover_bg: "#f0f0f0", // Light hover state
    overlay_bg: "#ffffff", // Modal overlay background

    // Text colors
    primary_text: "#1a1a1a", // Main text color (dark gray/black)
    secondary_text: "#2a2a2a", // Muted text, chart axis labels (very dark for high visibility)
    placeholder_text: "#9ca3af", // Placeholder text color (medium gray)
    active_text: "#14b8a6", // Active menu item text (primary teal)
    brand_text: "#14b8a6", // Brand color text

    // Accent colors
    primary_accent: "#14b8a6", // Primary brand color (teal)
    secondary_accent: "#0d9488", // Darker teal for contrast
    tertiary_accent: "#0f766e", // Even darker teal for hover

    // Border colors
    border_color: "#d0d0d0", // Default border (darker for better visibility)
    border_light: "#e8e8e8", // Light border

    // Icon colors
    icon_default: "#1a1a1a", // Default icon color (will use filter)
    icon_active: "#14b8a6", // Active icon color (will use filter)
    icon_muted: "#2a2a2a", // Muted icon color (very dark for visibility)

    // Button colors
    button_inactive: "#e8e8e8", // Light gray for inactive buttons
    button_bg: "#14b8a6", // Primary button background
    button_text: "#ffffff", // Primary button text
    button_hover: "#0d9488", // Primary button hover

    // Avatar colors
    avatar_bg: "#14b8a6", // Avatar background
    avatar_text: "#ffffff", // Avatar text

    // Modal/Dialog
    modal_bg: "#ffffff", // Modal background
    modal_overlay: "rgba(0, 0, 0, 0.6)", // Modal backdrop (thicker/darker)
  },
};

/**
 * Get theme-aware colors based on current theme mode
 * @param {string} mode - Current theme mode ('dark' or 'light')
 * @returns {object} Theme colors object
 */
export const getThemeColors = (mode = "dark") => {
  return THEME_COLORS[mode] || THEME_COLORS.dark;
};

/**
 * CSS Filter values for icon color transformations
 * These filters transform white icons to the desired color
 */
export const ICON_FILTERS = {
  dark: {
    default: "invert(100%)", // White icons
    active:
      "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)", // Teal #00DAC6
    muted:
      "invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(96%) contrast(92%)", // Gray #666666
  },
  light: {
    default:
      "invert(7%) sepia(6%) saturate(266%) hue-rotate(202deg) brightness(96%) contrast(93%)", // Dark gray #1a1a1a
    active:
      "invert(61%) sepia(55%) saturate(654%) hue-rotate(130deg) brightness(91%) contrast(90%)", // Teal #14b8a6
    muted:
      "invert(48%) sepia(8%) saturate(256%) hue-rotate(202deg) brightness(92%) contrast(87%)", // Gray #737373
  },
};

/**
 * Get icon filter based on theme mode and state
 * @param {string} mode - Current theme mode ('dark' or 'light')
 * @param {boolean} isActive - Whether the icon is in active state
 * @returns {string} CSS filter value
 */
export const getIconFilter = (mode = "dark", isActive = false) => {
  const filters = ICON_FILTERS[mode] || ICON_FILTERS.dark;
  return isActive ? filters.active : filters.default;
};

/**
 * Gradient text colors for brand name "Expensio Finance"
 * These remain the same for both themes as they're brand identity
 */
export const BRAND_GRADIENT_COLORS = {
  0: { color: "#d8fffb", fontSize: "22px" }, // Ex
  1: { color: "rgb(146, 233, 220)", fontSize: "22px" }, // p
  2: { color: "rgb(0, 218, 196)", fontSize: "22px" }, // en
  3: { color: "rgb(0, 199, 171)", fontSize: "22px" }, // s
  4: { color: "rgb(0, 168, 133)", fontSize: "22px" }, // i
  5: { color: "rgb(0, 137, 102)", fontSize: "22px" }, // o
  6: { color: "#14b8a6", fontSize: "22px" }, // Finance
};

export default {
  THEME_COLORS,
  getThemeColors,
  ICON_FILTERS,
  getIconFilter,
  BRAND_GRADIENT_COLORS,
};
