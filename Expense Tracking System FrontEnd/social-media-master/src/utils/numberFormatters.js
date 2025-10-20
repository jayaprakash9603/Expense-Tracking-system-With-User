// Generic number formatting utilities shared across flow components.
// Compact formatter (supports k, M, B) with sign preservation.
export function formatCompactNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e4) return `${sign}${(abs / 1e3).toFixed(1)}k`; // 10k+ use one decimal
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}k`; // 1k - <10k no decimal
  return abs % 1 === 0
    ? `${sign}${Math.round(abs)}`
    : `${sign}${abs.toFixed(2)}`;
}

// Full number format with locale separators and up to 2 decimals.
export function formatNumberFull(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  const num = Number(value);
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Currency compact (prefix currency symbol) - default Indian Rupee.
export function formatCurrencyCompact(value, currencySymbol = "₹") {
  return `${currencySymbol}${formatCompactNumber(value)}`;
}

// Derive percent (0-100) with fixed decimals.
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${Number(value).toFixed(decimals)}%`;
}
