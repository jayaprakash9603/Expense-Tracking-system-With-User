export function formatAmount(value, { currencySymbol = "₹", fractionDigits = 2 } = {}) {
  const num = Number(value);
  if (isNaN(num)) return `${currencySymbol}0.${"0".repeat(fractionDigits)}`;
  return `${currencySymbol}${num.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export default formatAmount;
