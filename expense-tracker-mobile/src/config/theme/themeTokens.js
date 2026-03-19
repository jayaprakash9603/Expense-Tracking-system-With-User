import { COLOR_PALETTES, SEMANTIC_COLORS } from "./colorPalettes";
import { hexToHsl, lighten, darken, getContrastText } from "@/shared/utils/colorUtils";

const DARK_SURFACES = {
  background: "#121212",
  card: "#1b1b1b",
  popover: "#1b1b1b",
  muted: "#282828",
  accent: "#282828",
  border: "#333333",
  input: "#333333",
  foreground: "#f8fafc",
  mutedForeground: "#94a3b8",
};

const LIGHT_SURFACES = {
  background: "#ffffff",
  card: "#ffffff",
  popover: "#ffffff",
  muted: "#f1f5f9",
  accent: "#f1f5f9",
  border: "#e2e8f0",
  input: "#e2e8f0",
  foreground: "#0f172a",
  mutedForeground: "#64748b",
};

export function generateShadcnVars(paletteId = "teal", mode = "dark") {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.teal;
  const isDark = mode === "dark";
  const surfaces = isDark ? DARK_SURFACES : LIGHT_SURFACES;

  const primaryHsl = hexToHsl(palette.primary);
  const secondaryHsl = isDark
    ? hexToHsl(lighten(palette.primary, 10))
    : hexToHsl(darken(palette.primary, 10));
  const primaryFg = hexToHsl(getContrastText(palette.primary));
  const destructiveHsl = hexToHsl(SEMANTIC_COLORS.error.main);

  const themeSecondaryHsl = hexToHsl(palette.secondary);
  const themeAccentHsl = hexToHsl(palette.accent);
  const primarySoftHsl = isDark
    ? hexToHsl(lighten(palette.primary, 15))
    : hexToHsl(darken(palette.primary, 5));

  return {
    "--background": hexToHsl(surfaces.background),
    "--foreground": hexToHsl(surfaces.foreground),
    "--card": hexToHsl(surfaces.card),
    "--card-foreground": hexToHsl(surfaces.foreground),
    "--popover": hexToHsl(surfaces.popover),
    "--popover-foreground": hexToHsl(surfaces.foreground),
    "--primary": primaryHsl,
    "--primary-foreground": primaryFg,
    "--secondary": hexToHsl(surfaces.muted),
    "--secondary-foreground": hexToHsl(surfaces.foreground),
    "--muted": hexToHsl(surfaces.muted),
    "--muted-foreground": hexToHsl(surfaces.mutedForeground),
    "--accent": hexToHsl(surfaces.accent),
    "--accent-foreground": hexToHsl(surfaces.foreground),
    "--destructive": destructiveHsl,
    "--destructive-foreground": hexToHsl("#ffffff"),
    "--border": hexToHsl(surfaces.border),
    "--input": hexToHsl(surfaces.input),
    "--ring": primaryHsl,

    "--theme-secondary": themeSecondaryHsl,
    "--theme-accent": themeAccentHsl,
    "--theme-primary-soft": primarySoftHsl,

    "--icon-primary": primaryHsl,
    "--icon-secondary": themeSecondaryHsl,
    "--icon-accent": themeAccentHsl,
    "--icon-soft": primarySoftHsl,
    "--icon-muted": hexToHsl(surfaces.mutedForeground),
    "--icon-foreground": hexToHsl(surfaces.foreground),
    "--icon-success": hexToHsl(SEMANTIC_COLORS.success.main),
    "--icon-warning": hexToHsl(SEMANTIC_COLORS.warning.main),
    "--icon-error": hexToHsl(SEMANTIC_COLORS.error.main),
    "--icon-info": hexToHsl(SEMANTIC_COLORS.info.main),

    "--chart-1": primaryHsl,
    "--chart-2": themeSecondaryHsl,
    "--chart-3": hexToHsl(SEMANTIC_COLORS.warning.main),
    "--chart-4": hexToHsl(SEMANTIC_COLORS.error.main),
    "--chart-5": hexToHsl("#8b5cf6"),
    "--chart-6": hexToHsl("#ec4899"),
    "--chart-7": hexToHsl(SEMANTIC_COLORS.success.main),
    "--chart-8": hexToHsl("#f97316"),
    "--chart-9": hexToHsl(SEMANTIC_COLORS.info.main),
    "--chart-10": hexToHsl("#84cc16"),
  };
}

export function generateLegacyTokens(paletteId = "teal", mode = "dark") {
  const palette = COLOR_PALETTES[paletteId] || COLOR_PALETTES.teal;
  const isDark = mode === "dark";
  const surfaces = isDark ? DARK_SURFACES : LIGHT_SURFACES;

  return {
    primary_bg: surfaces.card,
    secondary_bg: surfaces.background,
    tertiary_bg: isDark ? "#0b0b0b" : "#f1f5f9",
    card_bg: surfaces.card,
    input_bg: isDark ? "#222222" : "#f1f5f9",
    primary_text: surfaces.foreground,
    secondary_text: isDark ? "#ffffff" : "#2a2a2a",
    placeholder_text: "#9ca3af",
    active_text: palette.accent,
    brand_text: palette.primary,
    primary_accent: palette.primary,
    secondary_accent: isDark ? lighten(palette.primary, 10) : darken(palette.primary, 10),
    tertiary_accent: isDark ? darken(palette.primary, 10) : darken(palette.primary, 20),
    accent: palette.primary,
    border_color: surfaces.border,
    border_light: isDark ? "#28282a" : "#eef2f7",
    icon_default: surfaces.foreground,
    icon_active: palette.accent,
    button_bg: palette.accent,
    button_text: getContrastText(palette.accent),
    modal_bg: surfaces.card,
    success: SEMANTIC_COLORS.success.main,
    warning: SEMANTIC_COLORS.warning.main,
    error: SEMANTIC_COLORS.error.main,
    info: SEMANTIC_COLORS.info.main,
    gradient_bg: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
    shadow_color: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)",
    _palette: paletteId,
    _mode: mode,
  };
}
