import { generateShadcnVars } from "@/config/themeTokens";

const FONT_SIZE_MAP = {
  small: "14px",
  medium: "16px",
  large: "18px",
  "extra-large": "20px",
};

const FONT_FAMILY_MAP = {
  inter: "Inter",
  poppins: "Poppins",
  nunito: "Nunito",
  roboto: "Roboto",
  "open-sans": "Open Sans",
  lato: "Lato",
  raleway: "Raleway",
  montserrat: "Montserrat",
  "source-sans": "Source Sans 3",
};

export function injectTheme(paletteId, mode) {
  const vars = generateShadcnVars(paletteId, mode);
  const root = document.documentElement;

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export function injectFontSize(fontSize) {
  const root = document.documentElement;
  const size = FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.medium;
  root.style.setProperty("--app-font-size", size);
}

export function injectFontFamily(fontFamily) {
  const root = document.documentElement;
  const family = FONT_FAMILY_MAP[fontFamily] || FONT_FAMILY_MAP.inter;
  root.style.setProperty("--app-font-family", `"${family}"`);
}

export function injectCompactMode(enabled) {
  const root = document.documentElement;
  root.style.setProperty("--app-spacing", enabled ? "0.75" : "1");
  root.classList.toggle("compact", Boolean(enabled));
}

export function injectReduceMotion(enabled) {
  document.documentElement.classList.toggle("reduce-motion", Boolean(enabled));
}

export function injectHighContrast(enabled) {
  document.documentElement.classList.toggle("high-contrast", Boolean(enabled));
}

export function injectAnimations(enabled) {
  document.documentElement.classList.toggle("no-animations", !enabled);
}

export function injectEnhancedFocus(enabled) {
  document.documentElement.classList.toggle("enhanced-focus", Boolean(enabled));
}

export function injectScreenReader(enabled) {
  const root = document.documentElement;
  if (enabled) {
    root.setAttribute("role", "application");
    root.setAttribute("aria-live", "polite");
  } else {
    root.removeAttribute("role");
    root.removeAttribute("aria-live");
  }
}

export function applyUserSettingsEnhancements(settings) {
  if (!settings) return;
  injectFontSize(settings.fontSize);
  injectFontFamily(settings.fontFamily);
  injectCompactMode(settings.compactMode);
  injectReduceMotion(settings.reduceMotion);
  injectHighContrast(settings.highContrastMode);
  injectAnimations(settings.enableAnimations);
  injectEnhancedFocus(settings.enhancedFocusIndicators);
  injectScreenReader(settings.screenReaderSupport);
}

export function getSystemPreference() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function watchSystemPreference(callback) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e) => callback(e.matches ? "dark" : "light");
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}
