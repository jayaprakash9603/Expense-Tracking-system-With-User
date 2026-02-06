/**
 * Color Utility Functions
 * 
 * Provides functions for color manipulation including:
 * - Hex to RGB/HSL conversion
 * - Lighten/Darken colors
 * - Generate color shades
 * - Contrast ratio calculation
 * - Alpha channel manipulation
 */

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string (e.g., "#14b8a6")
 * @returns {{ r: number, g: number, b: number }}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    console.warn(`Invalid hex color: ${hex}`);
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * Convert RGB to hex color
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
export const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert hex to HSL
 * @param {string} hex - Hex color string
 * @returns {{ h: number, s: number, l: number }}
 */
export const hexToHsl = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Convert HSL to hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return rgbToHex(r, g, b);
};

/**
 * Lighten a color by a percentage
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export const lighten = (hex, percent) => {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.min(100, l + percent);
  return hslToHex(h, s, newL);
};

/**
 * Darken a color by a percentage
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
export const darken = (hex, percent) => {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.max(0, l - percent);
  return hslToHex(h, s, newL);
};

/**
 * Adjust color saturation
 * @param {string} hex - Hex color string
 * @param {number} percent - Percentage to adjust (-100 to 100)
 * @returns {string} Adjusted hex color
 */
export const saturate = (hex, percent) => {
  const { h, s, l } = hexToHsl(hex);
  const newS = Math.max(0, Math.min(100, s + percent));
  return hslToHex(h, newS, l);
};

/**
 * Add alpha channel to hex color
 * @param {string} hex - Hex color string
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export const alpha = (hex, alphaValue) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
};

/**
 * Calculate relative luminance of a color
 * @param {string} hex - Hex color string
 * @returns {number} Relative luminance (0-1)
 */
export const getLuminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number} Contrast ratio (1 to 21)
 */
export const getContrastRatio = (hex1, hex2) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get appropriate contrast text color (black or white)
 * @param {string} bgHex - Background hex color
 * @returns {string} "#ffffff" or "#000000"
 */
export const getContrastText = (bgHex) => {
  const luminance = getLuminance(bgHex);
  return luminance > 0.179 ? "#000000" : "#ffffff";
};

/**
 * Generate a complete shade palette from a base color
 * Produces shades: 50, 100, 200, 300, 400, 500 (base), 600, 700, 800, 900
 * @param {string} baseHex - Base hex color (used as 500)
 * @returns {Object} Shade palette object
 */
export const generateShades = (baseHex) => {
  const { h, s } = hexToHsl(baseHex);
  
  return {
    50: hslToHex(h, Math.max(s - 30, 10), 97),
    100: hslToHex(h, Math.max(s - 20, 15), 92),
    200: hslToHex(h, Math.max(s - 10, 20), 82),
    300: hslToHex(h, s, 70),
    400: hslToHex(h, s, 58),
    500: baseHex, // Base color
    600: hslToHex(h, Math.min(s + 5, 100), 42),
    700: hslToHex(h, Math.min(s + 10, 100), 35),
    800: hslToHex(h, Math.min(s + 15, 100), 27),
    900: hslToHex(h, Math.min(s + 20, 100), 20),
  };
};

/**
 * Generate MUI-style color object with main, light, dark, contrastText
 * @param {string} mainHex - Main hex color
 * @returns {Object} MUI color object
 */
export const generateMuiColor = (mainHex) => {
  return {
    main: mainHex,
    light: lighten(mainHex, 15),
    dark: darken(mainHex, 15),
    contrastText: getContrastText(mainHex),
  };
};

/**
 * Mix two colors together
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @param {number} weight - Weight of first color (0-1, default 0.5)
 * @returns {string} Mixed hex color
 */
export const mix = (hex1, hex2, weight = 0.5) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
  const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
  const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));
  
  return rgbToHex(r, g, b);
};

/**
 * Check if a color meets WCAG AA contrast requirements
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {string} size - "normal" or "large" text
 * @returns {boolean} Whether contrast is sufficient
 */
export const meetsContrastAA = (foreground, background, size = "normal") => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = size === "large" ? 3 : 4.5;
  return ratio >= threshold;
};

/**
 * Check if a color meets WCAG AAA contrast requirements
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {string} size - "normal" or "large" text
 * @returns {boolean} Whether contrast is sufficient
 */
export const meetsContrastAAA = (foreground, background, size = "normal") => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = size === "large" ? 4.5 : 7;
  return ratio >= threshold;
};

export default {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  lighten,
  darken,
  saturate,
  alpha,
  getLuminance,
  getContrastRatio,
  getContrastText,
  generateShades,
  generateMuiColor,
  mix,
  meetsContrastAA,
  meetsContrastAAA,
};
