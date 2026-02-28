/**
 * formatAmount(value, { currencySymbol, minimumFractionDigits, maximumFractionDigits })
 * Lightweight reusable amount formatter.
 * Note: Default currencySymbol can be overridden by passing from user settings.
 */
export function formatAmount(
  value,
  {
    currencySymbol = "₹",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = {}
) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return `${currencySymbol}${safe.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}
