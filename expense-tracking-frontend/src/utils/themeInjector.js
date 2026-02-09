/**
 * Theme Injector Utility
 * 
 * Handles injection of CSS custom properties (variables) into the document root.
 * Provides smooth theme transitions and system preference detection.
 */

import { generateThemeTokens, tokensToCssVars } from "../config/themeTokens";

// CSS transition for smooth theme changes
const TRANSITION_STYLES = `
  *, *::before, *::after {
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
  }
`;

// Transition complete cleanup timeout
const TRANSITION_DURATION = 200;

/**
 * Inject theme CSS variables into document root
 * @param {string} paletteId - Palette ID (e.g., "teal", "blue")
 * @param {string} mode - Theme mode ("dark" or "light")
 * @param {boolean} animate - Whether to animate the transition
 */
export const injectTheme = (paletteId, mode, animate = true) => {
  const tokens = generateThemeTokens(paletteId, mode);
  const cssVars = tokensToCssVars(tokens);
  const root = document.documentElement;
  
  // Add transition styles for smooth change
  if (animate) {
    const styleId = "theme-transition-styles";
    let transitionStyle = document.getElementById(styleId);
    
    if (!transitionStyle) {
      transitionStyle = document.createElement("style");
      transitionStyle.id = styleId;
      transitionStyle.textContent = TRANSITION_STYLES;
      document.head.appendChild(transitionStyle);
    }
    
    // Remove transition styles after animation completes
    setTimeout(() => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    }, TRANSITION_DURATION);
  }
  
  // Apply CSS variables to root
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Set data attributes for CSS selectors
  root.setAttribute("data-theme-mode", mode);
  root.setAttribute("data-theme-palette", paletteId);
  
  // Update color-scheme for native elements
  root.style.colorScheme = mode;
  
  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(tokens.primary_bg);
};

/**
 * Update the meta theme-color tag for mobile browsers
 * @param {string} color - Theme color hex
 */
const updateMetaThemeColor = (color) => {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.name = "theme-color";
    document.head.appendChild(metaThemeColor);
  }
  
  metaThemeColor.content = color;
};

/**
 * Get user's system color scheme preference
 * @returns {string} "dark" or "light"
 */
export const getSystemPreference = () => {
  if (typeof window === "undefined") return "dark";
  
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Set up listener for system color scheme changes
 * @param {Function} callback - Callback function receiving new mode
 * @returns {Function} Cleanup function to remove listener
 */
export const watchSystemPreference = (callback) => {
  if (typeof window === "undefined") return () => {};
  
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  const handler = (e) => {
    callback(e.matches ? "dark" : "light");
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }
  
  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
};

/**
 * Generate style element with all CSS variables for SSR or static export
 * @param {string} paletteId - Palette ID
 * @param {string} mode - Theme mode
 * @returns {string} Style tag string
 */
export const getThemeStyleTag = (paletteId, mode) => {
  const tokens = generateThemeTokens(paletteId, mode);
  const cssVars = tokensToCssVars(tokens);
  
  const cssString = Object.entries(cssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  
  return `<style id="theme-variables">
:root {
${cssString}
  color-scheme: ${mode};
}
</style>`;
};

/**
 * Remove all theme CSS variables from root
 */
export const clearTheme = () => {
  const root = document.documentElement;
  
  // Get all custom properties and remove theme-related ones
  const computedStyle = getComputedStyle(root);
  const properties = Array.from(computedStyle).filter(
    (prop) => prop.startsWith("--color-")
  );
  
  properties.forEach((prop) => {
    root.style.removeProperty(prop);
  });
  
  root.removeAttribute("data-theme-mode");
  root.removeAttribute("data-theme-palette");
};

/**
 * Get current theme from document attributes
 * @returns {{ palette: string, mode: string } | null}
 */
export const getCurrentTheme = () => {
  const root = document.documentElement;
  const mode = root.getAttribute("data-theme-mode");
  const palette = root.getAttribute("data-theme-palette");
  
  if (!mode || !palette) return null;
  
  return { palette, mode };
};

/**
 * Check if CSS custom properties are supported
 * @returns {boolean}
 */
export const supportsCustomProperties = () => {
  return (
    typeof window !== "undefined" &&
    window.CSS &&
    window.CSS.supports &&
    window.CSS.supports("color", "var(--test)")
  );
};

/**
 * Inject base styles for theme system
 * Should be called once at app initialization
 */
export const injectBaseThemeStyles = () => {
  const styleId = "theme-base-styles";
  
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    /* Theme base styles */
    :root {
      color-scheme: dark;
    }
    
    /* Scrollbar styling using theme variables */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: var(--color-scrollbar-track, #2a2a2a);
    }
    
    ::-webkit-scrollbar-thumb {
      background: var(--color-scrollbar-thumb, #555555);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-scrollbar-hover, #777777);
    }
    
    /* Selection color */
    ::selection {
      background: var(--color-selection-bg, rgba(20, 184, 166, 0.3));
      color: var(--color-selection-text, #ffffff);
    }
    
    /* Focus visible outline */
    :focus-visible {
      outline: 2px solid var(--color-focus-visible, #14b8a6);
      outline-offset: 2px;
    }
    
    /* Body base colors */
    body {
      background-color: var(--color-secondary-bg, #121212);
      color: var(--color-primary-text, #ffffff);
    }
  `;
  
  document.head.appendChild(style);
};

export default {
  injectTheme,
  getSystemPreference,
  watchSystemPreference,
  getThemeStyleTag,
  clearTheme,
  getCurrentTheme,
  supportsCustomProperties,
  injectBaseThemeStyles,
};
