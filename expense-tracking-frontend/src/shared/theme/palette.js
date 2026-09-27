import {
  getExpandedPalette,
  getSurfaceColors,
  SEMANTIC_COLORS,
} from "../../config/colorPalettes";
import { alpha as alphaUtil } from "../../utils/theme/colorUtils";
import { buildCustomPaletteTokens } from "./customTokens";

export const createThemePalette = (mode = "dark", paletteId = "teal") => {
  const isDark = mode === "dark";
  const palette = getExpandedPalette(paletteId);
  const surfaces = getSurfaceColors(palette, mode);
  const accentColor = palette.primaryShades[500] || palette.primary;
  const accentLight = palette.primaryShades[400] || palette.primary;
  const accentDark = palette.primaryShades[600] || palette.primary;

  const custom = buildCustomPaletteTokens({
    palette,
    surfaces,
    mode,
    paletteId,
    accentColor,
  });

  return {
    mode,
    primary: {
      main: accentColor,
      light: accentLight,
      dark: accentDark,
      contrastText: custom.contrastOnPrimary,
    },
    secondary: {
      main: palette.secondary,
      light: palette.primaryShades[300] || palette.secondary,
      dark: palette.primaryShades[700] || palette.secondary,
    },
    background: {
      default: surfaces.background.default,
      paper: surfaces.background.paper,
    },
    text: {
      primary: surfaces.text.primary,
      secondary: surfaces.text.secondary,
      disabled: surfaces.text.disabled,
    },
    divider: surfaces.divider,
    action: surfaces.action,
    error: { ...SEMANTIC_COLORS.error },
    warning: { ...SEMANTIC_COLORS.warning },
    info: { ...SEMANTIC_COLORS.info },
    success: { ...SEMANTIC_COLORS.success },
    custom,
    _meta: {
      isDark,
      surfaces,
      palette,
      accentColor,
      accentLight,
      accentDark,
      accentHover: alphaUtil(accentColor, 0.1),
    },
  };
};

export default createThemePalette;
