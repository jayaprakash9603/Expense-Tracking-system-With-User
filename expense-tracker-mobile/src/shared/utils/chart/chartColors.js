const CHART_VAR_COUNT = 10;

export const CHART_COLOR_VARS = Array.from(
  { length: CHART_VAR_COUNT },
  (_, i) => `hsl(var(--chart-${i + 1}))`
);

export function getChartColorVar(index) {
  return CHART_COLOR_VARS[index % CHART_VAR_COUNT];
}

export function buildChartConfig(keys, labels = []) {
  return keys.reduce((cfg, key, i) => {
    cfg[key] = {
      label: labels[i] || key,
      color: `hsl(var(--chart-${(i % CHART_VAR_COUNT) + 1}))`,
    };
    return cfg;
  }, {});
}

export function buildPieChartConfig(data, nameKey = "name") {
  return data.reduce((cfg, item, i) => {
    const key = item[nameKey] || `item-${i}`;
    cfg[key] = {
      label: key,
      color: `hsl(var(--chart-${(i % CHART_VAR_COUNT) + 1}))`,
    };
    return cfg;
  }, {});
}

export function assignChartColorVars(data) {
  return data.map((item, i) => ({
    ...item,
    fill: `hsl(var(--chart-${(i % CHART_VAR_COUNT) + 1}))`,
  }));
}
