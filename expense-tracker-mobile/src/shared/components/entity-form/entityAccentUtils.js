export function parseHexRgb(input) {
  if (!input || typeof input !== "string") return null;
  const s = input.trim().replace("#", "");
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b };
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b };
  }
  return null;
}

export function pickForegroundForBackground(hex) {
  const rgb = parseHexRgb(hex);
  if (!rgb) return "hsl(var(--foreground))";
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq > 186 ? "#0a0a0a" : "#fafafa";
}

export function hexWithAlpha(hex, alpha01) {
  const rgb = parseHexRgb(hex);
  if (!rgb) return `rgba(0,0,0,${alpha01})`;
  const a = Math.min(1, Math.max(0, alpha01));
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}
