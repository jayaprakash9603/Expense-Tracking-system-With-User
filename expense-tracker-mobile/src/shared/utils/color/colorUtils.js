function parseHex(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

export function hexToHsl(hex) {
  const { r, g, b } = parseHex(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `${h} ${s}% ${l}%`;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function lighten(hex, percent) {
  const { r, g, b } = parseHex(hex);
  const amount = Math.round(2.55 * percent);
  const nr = clamp(r + amount, 0, 255);
  const ng = clamp(g + amount, 0, 255);
  const nb = clamp(b + amount, 0, 255);
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

export function darken(hex, percent) {
  return lighten(hex, -percent);
}

export function alpha(hex, opacity) {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastText(hex) {
  const { r, g, b } = parseHex(hex);
  return getLuminance(r, g, b) > 0.179 ? "#000000" : "#ffffff";
}
