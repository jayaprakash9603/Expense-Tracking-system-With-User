/**
 * CSS custom properties for PaymentMethodAccordion / GenericAccordionGroup.
 * Keeps .pm-* classes theme-aware in light and dark mode.
 */
export const buildPaymentMethodThemeVars = (colors, mode = "dark") => {
  const isDark = mode === "dark";
  return {
    "--pm-bg-primary": isDark ? colors.secondary_bg : colors.primary_bg,
    "--pm-bg-secondary": isDark ? colors.tertiary_bg : colors.input_bg,
    "--pm-bg-tertiary": isDark ? colors.card_bg : colors.hover_bg,
    "--pm-border-color": colors.border_color,
    "--pm-text-primary": colors.primary_text,
    "--pm-text-secondary": colors.secondary_text,
    "--pm-text-tertiary": colors.placeholder_text,
    "--pm-accent-color": colors.primary_accent,
    "--pm-scrollbar-thumb": colors.scrollbar_thumb,
    "--pm-scrollbar-track": colors.scrollbar_track,
  };
};

export default buildPaymentMethodThemeVars;
