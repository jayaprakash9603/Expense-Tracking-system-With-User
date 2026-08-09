/**
 * Non-color design tokens — spacing, radius, typography, elevation, z-index, motion.
 * Color tokens remain in config/themeTokens.js + config/colorPalettes.js and are
 * reconciled here via SEMANTIC_COLORS (single error/success source of truth).
 */

export const SPACING = Object.freeze({
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
});

export const RADIUS = Object.freeze({
  none: "0px",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
});

export const TYPOGRAPHY = Object.freeze({
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontFamilyMono: '"Roboto Mono", "Courier New", monospace',
  size: {
    xs: "12px",
    sm: "13px",
    md: "14px",
    lg: "16px",
    xl: "18px",
    "2xl": "20px",
    "3xl": "24px",
    "4xl": "32px",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
});

export const ELEVATION = Object.freeze({
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.2)",
  md: "0 4px 12px rgba(0,0,0,0.25)",
  lg: "0 8px 24px rgba(0,0,0,0.3)",
  xl: "0 16px 48px rgba(0,0,0,0.35)",
});

export const Z_INDEX = Object.freeze({
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
});

export const MOTION = Object.freeze({
  fast: "120ms",
  normal: "200ms",
  slow: "320ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
});

/** Canonical semantic colors — prefer these over ad-hoc hex. */
export const SEMANTIC = Object.freeze({
  success: "#22c55e",
  successLight: "#4ade80",
  successDark: "#16a34a",
  warning: "#f59e0b",
  warningLight: "#fbbf24",
  warningDark: "#d97706",
  error: "#ef4444",
  errorLight: "#f87171",
  errorDark: "#dc2626",
  info: "#3b82f6",
  infoLight: "#60a5fa",
  infoDark: "#2563eb",
});

export const DENSITY = Object.freeze({
  compact: {
    controlHeight: 32,
    fontSize: TYPOGRAPHY.size.sm,
    radius: RADIUS.sm,
    paddingX: SPACING[3],
  },
  small: {
    controlHeight: 36,
    fontSize: TYPOGRAPHY.size.sm,
    radius: RADIUS.sm,
    paddingX: SPACING[3],
  },
  medium: {
    controlHeight: 40,
    fontSize: TYPOGRAPHY.size.md,
    radius: RADIUS.sm,
    paddingX: SPACING[4],
  },
  large: {
    controlHeight: 48,
    fontSize: TYPOGRAPHY.size.lg,
    radius: RADIUS.md,
    paddingX: SPACING[5],
  },
});

const tokens = Object.freeze({
  spacing: SPACING,
  radius: RADIUS,
  typography: TYPOGRAPHY,
  elevation: ELEVATION,
  zIndex: Z_INDEX,
  motion: MOTION,
  semantic: SEMANTIC,
  density: DENSITY,
});

export default tokens;
