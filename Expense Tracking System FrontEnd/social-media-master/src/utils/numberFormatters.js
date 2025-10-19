export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + "B";
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + "k";
  return value % 1 === 0
    ? `${sign}${Math.round(abs)}`
    : `${sign}${abs.toFixed(2)}`;
};
export const formatCurrencyCompact = (value) => formatCompactNumber(value);
export const formatNumberFull = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
