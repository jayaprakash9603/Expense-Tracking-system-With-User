function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6) return null;

  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

export function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  const a = clamp(alpha, 0, 1);
  if (!rgb) return `rgba(0,0,0,${a})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

/**
 * Heatmap background builder.
 *
 * Supports both spending + income on the same day via a diagonal split.
 * Normalization is per-month (caller passes max values).
 */
export function buildHeatmapBackground({
  baseBg,
  accentColor,
  isWeekend,
  weekendAlpha,
  weekendTint,
  themeMode = "dark",
  spending,
  income,
  maxSpending,
  maxIncome,
  spendingColor,
  incomeColor,
  emphasizeBothSplit = false,
}) {
  const safeSpending = Number.isFinite(Number(spending)) ? Number(spending) : 0;
  const safeIncome = Number.isFinite(Number(income)) ? Number(income) : 0;

  const spendingIntensity =
    maxSpending > 0 ? clamp(safeSpending / maxSpending, 0, 1) : 0;
  const incomeIntensity =
    maxIncome > 0 ? clamp(safeIncome / maxIncome, 0, 1) : 0;

  const isLight = themeMode === "light";
  const spendCap = isLight ? 0.36 : 0.4;
  const incomeCap = isLight ? 0.32 : 0.36;
  const bothDampen = emphasizeBothSplit ? 0.82 : 1;

  const spendingAlpha = spendingIntensity * spendCap * bothDampen;
  const incomeAlpha = incomeIntensity * incomeCap * bothDampen;

  const weekendColor =
    weekendTint ||
    accentColor ||
    (isLight ? "#64748b" : "#94a3b8");
  const resolvedWeekendAlpha =
    weekendAlpha ?? (isLight ? 0.07 : 0.085);

  const weekendOverlay = isWeekend
    ? `linear-gradient(${hexToRgba(weekendColor, resolvedWeekendAlpha)}, ${hexToRgba(
        weekendColor,
        resolvedWeekendAlpha,
      )}),`
    : "";

  if (safeSpending > 0 && safeIncome > 0) {
    const spend = hexToRgba(spendingColor, spendingAlpha);
    const inc = hexToRgba(incomeColor, incomeAlpha);
    const seamStart = emphasizeBothSplit ? "48%" : "50%";
    const seamEnd = emphasizeBothSplit ? "52%" : "50%";
    return `linear-gradient(135deg, ${spend} 0%, ${spend} ${seamStart}, ${inc} ${seamEnd}, ${inc} 100%), ${weekendOverlay} ${baseBg}`;
  }

  if (safeSpending > 0) {
    const spend = hexToRgba(spendingColor, spendingAlpha);
    return `linear-gradient(${spend}, ${spend}), ${weekendOverlay} ${baseBg}`;
  }

  if (safeIncome > 0) {
    const inc = hexToRgba(incomeColor, incomeAlpha);
    return `linear-gradient(${inc}, ${inc}), ${weekendOverlay} ${baseBg}`;
  }

  return `${weekendOverlay} ${baseBg}`.trim();
}
