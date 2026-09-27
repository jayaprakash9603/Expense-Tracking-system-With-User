import { getContrastText } from "../../utils/theme/colorUtils";
import { SEMANTIC_COLORS } from "../../config/colorPalettes";

/**
 * Maps MUI theme → legacy `useTheme().colors` keys for gradual migration.
 */
export const legacyColorsFromTheme = (theme) => {
  const palette = theme.palette;
  const custom = palette.custom || {};
  const legacy = custom.legacy || {};

  const accent = palette.primary.main;
  const paper = palette.background.paper;
  const defaultBg = palette.background.default;

  return {
    primary_bg: paper,
    secondary_bg: defaultBg,
    tertiary_bg: legacy.tertiaryBg ?? custom.surfaceMuted,
    card_bg: paper,
    input_bg: custom.inputBackground,

    active_bg: legacy.activeBg,
    hover_bg: palette.action?.hover,
    overlay_bg: paper,

    primary_text: palette.text.primary,
    secondary_text: legacy.secondaryText ?? palette.text.secondary,
    placeholder_text: legacy.placeholderText ?? palette.text.disabled,
    active_text: custom.chart?.accent ?? accent,
    brand_text: accent,

    primary_accent: legacy.primaryAccent ?? accent,
    secondary_accent: legacy.secondaryAccent ?? accent,
    tertiary_accent: legacy.tertiaryAccent ?? accent,
    accent,

    border_color: custom.borderStrong ?? palette.divider,
    border_light: custom.borderLight ?? palette.divider,
    border: custom.borderStrong ?? palette.divider,

    icon_default: palette.text.primary,
    icon_active: custom.chart?.accent ?? accent,
    icon_muted: legacy.iconMuted,

    button_inactive: legacy.buttonInactive,
    button_bg: custom.chart?.accent ?? accent,
    button_text: custom.contrastOnPrimary ?? getContrastText(accent),
    button_hover: legacy.tertiaryAccent ?? accent,

    avatar_bg: accent,
    avatar_text: custom.contrastOnPrimary ?? getContrastText(accent),

    modal_bg: paper,
    modal_overlay: custom.overlay,

    success: SEMANTIC_COLORS.success.main,
    success_light: SEMANTIC_COLORS.success.light,
    success_dark: SEMANTIC_COLORS.success.dark,
    warning: SEMANTIC_COLORS.warning.main,
    warning_light: SEMANTIC_COLORS.warning.light,
    warning_dark: SEMANTIC_COLORS.warning.dark,
    error: SEMANTIC_COLORS.error.main,
    error_light: SEMANTIC_COLORS.error.light,
    error_dark: SEMANTIC_COLORS.error.dark,
    info: SEMANTIC_COLORS.info.main,
    info_light: SEMANTIC_COLORS.info.light,
    info_dark: SEMANTIC_COLORS.info.dark,

    chart_primary: custom.chart?.primary,
    chart_secondary: custom.chart?.secondary,
    chart_accent: custom.chart?.accent,
    chart_grid: custom.chart?.grid,
    chart_tooltip_bg: custom.chart?.tooltipBg,
    chart_tooltip_text: custom.chart?.tooltipText,

    gradient_start: custom.chart?.primary,
    gradient_end: custom.chart?.secondary,
    gradient_bg: `linear-gradient(135deg, ${custom.chart?.primary} 0%, ${custom.chart?.secondary} 100%)`,

    shadow_color: legacy.shadowColor,
    shadow_colored: legacy.shadowColored,

    focus_ring: legacy.focusRing,
    focus_visible: accent,

    selection_bg: legacy.selectionBg,
    selection_text: palette.text.primary,

    scrollbar_thumb: custom.scrollbar?.thumb,
    scrollbar_track: custom.scrollbar?.track,
    scrollbar_hover: custom.scrollbar?.hover,

    skeleton_base: custom.skeleton?.base,
    skeleton_highlight: custom.skeleton?.highlight,

    _palette: custom.paletteId,
    _mode: custom.mode,
  };
};

export default legacyColorsFromTheme;
