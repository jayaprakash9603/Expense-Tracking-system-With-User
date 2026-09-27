import { legacyColorsFromTheme } from "./legacyColorMap";

export const themeToCssVars = (theme) => {
  const tokens = legacyColorsFromTheme(theme);
  const cssVars = {};

  Object.entries(tokens).forEach(([key, value]) => {
    if (key.startsWith("_")) return;
    if (value == null || typeof value === "object") return;
    const cssKey = `--color-${key.replace(/_/g, "-")}`;
    cssVars[cssKey] = value;
  });

  return cssVars;
};

export const applyThemeCssVars = (theme) => {
  const cssVars = themeToCssVars(theme);
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  const custom = theme.palette?.custom;
  if (custom?.mode) {
    root.setAttribute("data-theme-mode", custom.mode);
  }
  if (custom?.paletteId) {
    root.setAttribute("data-theme-palette", custom.paletteId);
  }
  root.style.colorScheme = custom?.mode === "light" ? "light" : "dark";
};

export default themeToCssVars;
