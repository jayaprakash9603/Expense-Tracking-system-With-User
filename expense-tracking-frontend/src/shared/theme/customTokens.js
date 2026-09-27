import FINANCE_COLOR_TOKENS from "../../config/financeColorTokens";
import { alpha, lighten, darken, getContrastText } from "../../utils/theme/colorUtils";
import { SEMANTIC_COLORS } from "../../config/colorPalettes";

export const buildCustomPaletteTokens = ({
  palette,
  surfaces,
  mode,
  paletteId,
  accentColor,
}) => {
  const isDark = mode === "dark";
  const primaryAccent = palette.primary;
  const secondaryAccent = isDark
    ? lighten(palette.primary, 10)
    : darken(palette.primary, 10);
  const tertiaryAccent = isDark
    ? darken(palette.primary, 10)
    : darken(palette.primary, 20);

  const financeKey = isDark ? "dark" : "light";

  return {
    paletteId,
    mode,
    surfaceMuted: surfaces.surface.level2,
    surfaceElevated: surfaces.background.elevated,
    inputBackground: surfaces.surface.level2,
    borderStrong: surfaces.border.default,
    borderLight: surfaces.border.light,
    overlay: isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.5)",
    contrastOnPrimary: getContrastText(accentColor),
    chart: {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      grid: isDark ? "#333333" : surfaces.surface.level3,
      tooltipBg: isDark ? "#2a2a2a" : surfaces.background.paper,
      tooltipText: surfaces.text.primary,
    },
    finance: FINANCE_COLOR_TOKENS.calendar[financeKey],
    financeWeekend: FINANCE_COLOR_TOKENS.calendar.weekend[financeKey],
    scrollbar: {
      thumb: isDark ? "#555555" : "#c0c0c0",
      track: isDark ? "#2a2a2a" : surfaces.surface.hover,
      hover: isDark ? "#777777" : "#a0a0a0",
    },
    skeleton: {
      base: isDark ? "#2a2a2a" : surfaces.surface.level3,
      highlight: isDark ? "#3a3a3a" : surfaces.surface.hover,
    },
    semantic: {
      success: SEMANTIC_COLORS.success.main,
      warning: SEMANTIC_COLORS.warning.main,
      error: SEMANTIC_COLORS.error.main,
      info: SEMANTIC_COLORS.info.main,
    },
    legacy: {
      primaryAccent,
      secondaryAccent,
      tertiaryAccent,
      activeBg: isDark
        ? alpha(palette.primary, 0.15)
        : alpha(palette.primary, 0.12),
      tertiaryBg: isDark ? "#0b0b0b" : surfaces.surface.level2,
      secondaryText: isDark ? "#ffffff" : "#2a2a2a",
      placeholderText: "#9ca3af",
      iconMuted: isDark ? "#666666" : "#2a2a2a",
      buttonInactive: isDark ? "#28282a" : surfaces.border.light,
      shadowColor: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.15)",
      shadowColored: alpha(palette.primary, isDark ? 0.3 : 0.2),
      focusRing: alpha(palette.primary, 0.5),
      selectionBg: alpha(palette.primary, isDark ? 0.3 : 0.2),
    },
  };
};

export default buildCustomPaletteTokens;
