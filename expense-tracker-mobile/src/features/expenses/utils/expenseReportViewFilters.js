import { assignChartColorVars, buildPieChartConfig } from "@/shared/utils/chart/chartColors";
import { mapRawDataToGroups } from "@/shared/utils/report/mapRawDataToGroups";

export { mapRawDataToGroups };

function mergeRowsByName(rows) {
  const map = {};
  rows.forEach((r) => {
    const name = String(r.name ?? "");
    map[name] = (map[name] || 0) + Math.abs(Number(r.value ?? 0));
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function refinePieChartModel(pieModel, { topMode = "all", groupBelowPercent = 0, otherLabel = "Other" }) {
  if (!pieModel?.data?.length) return pieModel;
  const rows = pieModel.data
    .map((r) => ({
      name: String(r.name ?? ""),
      value: Math.abs(Number(r.value ?? 0)),
    }))
    .filter((r) => r.value > 0);
  if (!rows.length) return pieModel;

  const total = rows.reduce((s, r) => s + r.value, 0);
  let working = mergeRowsByName(rows);

  if (groupBelowPercent > 0 && total > 0) {
    const threshold = (total * groupBelowPercent) / 100;
    const big = [];
    let smallSum = 0;
    working.forEach((r) => {
      if (r.value < threshold) smallSum += r.value;
      else big.push(r);
    });
    working = smallSum > 0 ? mergeRowsByName([...big, { name: otherLabel, value: smallSum }]) : big;
  }

  const topN = topMode === "all" ? null : Number(topMode);
  if (topN && working.length > topN) {
    const head = working.slice(0, topN);
    const rest = working.slice(topN);
    const restSum = rest.reduce((s, r) => s + r.value, 0);
    working = restSum > 0 ? mergeRowsByName([...head, { name: otherLabel, value: restSum }]) : head;
  }

  working = mergeRowsByName(working);
  const data = assignChartColorVars(working);
  const config = buildPieChartConfig(data);
  return { data, config };
}

function rowMagnitude(row, keys) {
  return keys.reduce((s, k) => s + Math.abs(Number(row[k] ?? 0)), 0);
}

export function refineAreaChartModel(areaModel, { minDailyAmount = 0 }) {
  if (!minDailyAmount || minDailyAmount <= 0) return areaModel;
  const keys = areaModel.dataKeys?.length ? areaModel.dataKeys : ["expense"];
  const data = (areaModel.data || []).filter((row) => rowMagnitude(row, keys) >= minDailyAmount);
  return { ...areaModel, data };
}
