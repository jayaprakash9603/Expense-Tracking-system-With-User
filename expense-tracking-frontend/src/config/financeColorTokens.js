/**
 * Centralized finance color tokens.
 *
 * Why: Calendar summary + heatmap needs consistent, reusable colors.
 * Keeping these in one place avoids hardcoding scattered values.
 */
export const FINANCE_COLOR_TOKENS = {
  calendar: {
    // High-contrast red/green tuned for both themes.
    // Dark uses brighter hues; Light uses deeper hues to avoid wash-out.
    dark: {
      spending: {
        base: "#ff4d4f",
        icon: "#ff8a8c",
        text: "#ffd1d2",
      },
      income: {
        base: "#06d6a0",
        icon: "#7ff3d8",
        text: "#c9fff3",
      },
    },
    light: {
      spending: {
        base: "#d32f2f",
        icon: "#ef9a9a",
        text: "#7f1d1d",
      },
      income: {
        base: "#2e7d32",
        icon: "#a5d6a7",
        text: "#14532d",
      },
    },
  },
};

export function getFinanceCalendarColors(mode = "dark") {
  const key = mode === "light" ? "light" : "dark";
  return FINANCE_COLOR_TOKENS.calendar[key];
}

export default FINANCE_COLOR_TOKENS;
