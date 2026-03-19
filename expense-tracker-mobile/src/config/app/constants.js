export const APP_NAME = "Expensio Finance";
export const DEFAULT_THEME_MODE = "dark";
export const DEFAULT_PALETTE = "teal";
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";

export const STORAGE_KEYS = {
  JWT: "jwt",
  THEME_MODE: "theme",
  THEME_PALETTE: "themePalette",
  THEME_USE_SYSTEM: "themeUseSystem",
  LANGUAGE: "language",
  DATE_FORMAT: "dateFormat",
  SIDEBAR_COLLAPSED: "sidebarCollapsed",
};

export const DATE_FORMATS = [
  { id: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { id: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { id: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { id: "DD-MMM-YYYY", label: "DD-MMM-YYYY" },
];

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
};

export const SIDEBAR_WIDTH = {
  EXPANDED: 260,
  COLLAPSED: 72,
};
