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

  if (compact) {
    const isIndian = currency.code === "INR";

    if (isIndian) {
      if (absAmount >= 1_00_00_000) {
        const val = absAmount / 1_00_00_000;
        return `${sign}${currency.symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}Cr`;
      }
      if (absAmount >= 1_00_000) {
        const val = absAmount / 1_00_000;
        return `${sign}${currency.symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}L`;
      }
      if (absAmount >= 1_000) {
        const val = absAmount / 1_000;
        return `${sign}${currency.symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
      }
    } else {
      if (absAmount >= 1_000_000) {
        const val = absAmount / 1_000_000;
        return `${sign}${currency.symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
      }
      if (absAmount >= 1_000) {
        const val = absAmount / 1_000;
        return `${sign}${currency.symbol}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
      }
    }
  }

  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absAmount);
    return `${sign}${formatted}`;
  } catch {
    return `${sign}${currency.symbol}${Math.round(absAmount)}`;
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
  return Array.from({ length: parts }, (_, i) => (i === 0 ? perPart + remainder : perPart));
}

export { CURRENCY_MAP };
