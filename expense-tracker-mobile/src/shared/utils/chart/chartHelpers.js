const CHART_COLORS = [
  "#00b8a0", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
  "#a855f7", "#e11d48", "#0ea5e9", "#10b981", "#d946ef",
];

export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function assignChartColors(data) {
  return data.map((item, i) => ({ ...item, fill: getChartColor(i) }));
}

export function toPieChartData(items, nameKey, valueKey) {
  return items.map((item, i) => ({
    name: item[nameKey],
    value: Number(item[valueKey] || 0),
    fill: getChartColor(i),
  }));
}

export function toBarChartData(items, labelKey, valueKey) {
  return items.map((item) => ({
    label: item[labelKey],
    value: Number(item[valueKey] || 0),
  }));
}

export function toLineChartData(items, xKey, yKey) {
  return items
    .map((item) => ({ x: item[xKey], y: Number(item[yKey] || 0) }))
    .sort((a, b) => (a.x > b.x ? 1 : -1));
}

export function calculatePercentages(data, valueKey = "value") {
  const total = data.reduce((sum, item) => sum + Number(item[valueKey] || 0), 0);
  if (!total) return data.map((item) => ({ ...item, percentage: 0 }));
  return data.map((item) => ({
    ...item,
    percentage: Math.round((Number(item[valueKey] || 0) / total) * 100 * 10) / 10,
  }));
}

export { CHART_COLORS };
