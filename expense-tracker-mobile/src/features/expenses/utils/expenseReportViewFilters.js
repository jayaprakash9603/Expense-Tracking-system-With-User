import { assignChartColorVars, buildPieChartConfig } from "@/shared/utils/chart/chartColors";

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

export function mapRawDataToGroups(rawData) {
  if (!rawData || typeof rawData !== "object") return [];
  
  const summary = rawData.summary || {};
  const grandTotal = Number(summary.totalAmount || 0);

  return Object.entries(rawData)
    .filter(([k]) => k !== "summary" && k !== "metadata")
    .map(([methodName, block]) => {
      const total = Number(block?.totalAmount || block?.total || 0);
      const rawItems = Array.isArray(block?.expenses) ? block.expenses : Array.isArray(block?.items) ? block.items : [];
      
      const items = [...rawItems].sort((a, b) => {
        const detA = a?.details || a?.expense || a || {};
        const detB = b?.details || b?.expense || b || {};
        const aAmt = Number(detA?.amount ?? detA?.netAmount ?? 0);
        const bAmt = Number(detB?.amount ?? detB?.netAmount ?? 0);
        return bAmt - aAmt;
      });
      
      const count = Number(block?.expenseCount || block?.count || items.length);
      const percentage = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(2) : "0.00";
      const avgPerTransaction = count > 0 ? (total / count).toFixed(2) : "0.00";
      
      const creditDueTotal = items.reduce((sum, row) => {
        const details = row?.details || row?.expense || row || {};
        return sum + Number(details?.creditDue || 0);
      }, 0);

      return {
        key: methodName,
        label: methodName,
        totalAmount: total,
        count,
        items,
        percentage,
        avgPerTransaction,
        creditDueTotal,
      };
    })
    .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount));
}
