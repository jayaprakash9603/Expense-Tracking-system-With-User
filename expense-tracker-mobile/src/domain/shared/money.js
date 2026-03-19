const CURRENCY_MAP = {
  USD: { symbol: "$", code: "USD", locale: "en-US" },
  EUR: { symbol: "€", code: "EUR", locale: "de-DE" },
  GBP: { symbol: "£", code: "GBP", locale: "en-GB" },
  INR: { symbol: "₹", code: "INR", locale: "en-IN" },
  JPY: { symbol: "¥", code: "JPY", locale: "ja-JP" },
};

export function formatMoney(amount, currencyCode = "INR", options = {}) {
  const currency = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;
  const { compact = false, showSign = false } = options;

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : showSign ? "+" : "";

  if (compact && absAmount >= 1_000_000) {
    return `${sign}${currency.symbol}${(absAmount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && absAmount >= 1_000) {
    return `${sign}${currency.symbol}${(absAmount / 1_000).toFixed(1)}K`;
  }

  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currencyCode === "JPY" ? 0 : 2,
      maximumFractionDigits: currencyCode === "JPY" ? 0 : 2,
    }).format(absAmount);
    return `${sign}${formatted}`;
  } catch {
    return `${sign}${currency.symbol}${absAmount.toFixed(2)}`;
  }
}

export function sumAmounts(items, field = "amount") {
  return items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
}

export function calculatePercentage(part, total) {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100 * 100) / 100;
}

export function splitAmount(amount, parts) {
  if (!parts || parts <= 0) return [];
  const perPart = Math.floor((amount * 100) / parts) / 100;
  const remainder = Math.round((amount - perPart * parts) * 100) / 100;
  return Array.from({ length: parts }, (_, i) =>
    i === 0 ? perPart + remainder : perPart
  );
}

export { CURRENCY_MAP };
