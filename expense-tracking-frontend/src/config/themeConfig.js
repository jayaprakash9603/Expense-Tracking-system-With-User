/**
 * Theme Configuration for Expensio Finance Application
 *
 * Brand identity constants and icon filter utilities.
 * For dynamic theme colors, use generateThemeTokens() from themeTokens.js
 * or the useTheme() hook.
 */

export const ICON_FILTERS = {
  dark: {
    default: "invert(100%)",
    active:
      "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)",
    muted:
      "invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(96%) contrast(92%)",
  },
  light: {
    default:
      "invert(7%) sepia(6%) saturate(266%) hue-rotate(202deg) brightness(96%) contrast(93%)",
    active:
      "invert(61%) sepia(55%) saturate(654%) hue-rotate(130deg) brightness(91%) contrast(90%)",
    muted:
      "invert(48%) sepia(8%) saturate(256%) hue-rotate(202deg) brightness(92%) contrast(87%)",
  },
};

export const getIconFilter = (mode = "dark", isActive = false) => {
  const filters = ICON_FILTERS[mode] || ICON_FILTERS.dark;
  return isActive ? filters.active : filters.default;
};

export const BRAND_GRADIENT_COLORS = {
  0: { color: "#d8fffb", fontSize: "22px" },
  1: { color: "rgb(146, 233, 220)", fontSize: "22px" },
  2: { color: "rgb(0, 218, 196)", fontSize: "22px" },
  3: { color: "rgb(0, 199, 171)", fontSize: "22px" },
  4: { color: "rgb(0, 168, 133)", fontSize: "22px" },
  5: { color: "rgb(0, 137, 102)", fontSize: "22px" },
  6: { color: "#14b8a6", fontSize: "22px" },
  story_ring_start: "#f09433",
  story_ring_middle: "#e6683c",
  story_ring_end: "#dc2743",
  story_ring_purple: "#bc1888",
  story_teal_start: "#00DAC6",
  story_teal_end: "#14b8a6",
};

export default {
  ICON_FILTERS,
  getIconFilter,
  BRAND_GRADIENT_COLORS,
};
