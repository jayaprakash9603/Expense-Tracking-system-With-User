/**
 * Theme tokens — derived from the unified MUI theme builder.
 */

import buildAppTheme from "../shared/theme/buildAppTheme";
import { legacyColorsFromTheme } from "../shared/theme/legacyColorMap";

export const generateThemeTokens = (paletteId = "teal", mode = "dark") => {
  const theme = buildAppTheme(mode, paletteId);
  return legacyColorsFromTheme(theme);
};

export const tokensToCssVars = (tokens) => {
  const cssVars = {};

  Object.entries(tokens).forEach(([key, value]) => {
    if (key.startsWith("_")) return;
    if (value == null || typeof value === "object") return;
    const cssKey = `--color-${key.replace(/_/g, "-")}`;
    cssVars[cssKey] = value;
  });

  return cssVars;
};

export const tokensToCssString = (tokens) => {
  const cssVars = tokensToCssVars(tokens);

  return Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");
};

export const getThemeId = (paletteId, mode) => `${paletteId}-${mode}`;

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
