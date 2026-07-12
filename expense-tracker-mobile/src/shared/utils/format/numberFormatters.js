export function formatCompactNumber(num) {
  const absNum = Math.abs(Number(num));
  if (absNum >= 1e7) return `${(num / 1e7).toFixed(1)}Cr`;
  if (absNum >= 1e5) return `${(num / 1e5).toFixed(1)}L`;
  if (absNum >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return String(num);
}

export function formatNumberFull(num, locale = "en-IN") {
  return Number(num).toLocaleString(locale);
}

export function formatCurrencyCompact(num, currencySymbol = "₹") {
  return `${currencySymbol}${formatCompactNumber(num)}`;
}

export function formatPercent(value, fractionDigits = 1) {
  const num = Number(value);
  if (isNaN(num)) return "0%";
  return `${num.toFixed(fractionDigits)}%`;
}
