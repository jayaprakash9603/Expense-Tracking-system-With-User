import { extractExpenseDetails } from "@/shared/utils/expense/expenseDisplayUtils";
import { getChartColor } from "./chartHelpers";
import { buildStackedBuckets } from "./entityFlowStackedBuckets";

const VIBRANT_PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#a855f7", "#d946ef", "#0ea5e9", "#10b981", "#f59e0b",
];

function toSafeKey(name) {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}

export function extractEntityMap(rawData) {
  if (!rawData || typeof rawData !== "object") return {};
  if (Array.isArray(rawData)) return {};

  const entityKeys = Object.keys(rawData).filter((k) => k !== "summary");
  const map = {};

  entityKeys.forEach((key) => {
    const block = rawData[key];
    if (!block || typeof block !== "object") return;
    map[key] = block;
  });

  return map;
}

export function normalizeEntityFlowData(rawData, activeRange = "month", offset = 0, labelResolver = (k) => k) {
  const entityMap = extractEntityMap(rawData);
  const entityNames = Object.keys(entityMap);

  if (!entityNames.length) {
    return { chartData: [], cardData: [], totals: { income: 0, expense: 0 }, chartConfig: {} };
  }

  const chartConfig = {};
  const cardData = [];
  const keyMap = {};
  let totalIncome = 0;
  let totalExpense = 0;

  entityNames.forEach((name, idx) => {
    const block = entityMap[name];
    const friendlyName = labelResolver(name);
    const safeKey = toSafeKey(friendlyName);
    const color = block.color || VIBRANT_PALETTE[idx % VIBRANT_PALETTE.length] || getChartColor(idx);
    const expenses = Array.isArray(block.expenses) ? block.expenses : [];
    const totalAmount = Math.abs(Number(block.totalAmount ?? block.total ?? 0));

    keyMap[name] = safeKey;

    let entityIncome = 0;
    let entityExpense = 0;

    expenses.forEach((e) => {
      if (!e) return;
      const details = extractExpenseDetails(e);
      const amt = Math.abs(Number(details.amount ?? details.netAmount ?? e.amount ?? 0));
      const type = (details.type || e.type || "").toLowerCase();
      if (["gain", "income", "inflow"].includes(type)) entityIncome += amt;
      else entityExpense += amt;
    });

    totalIncome += entityIncome;
    totalExpense += entityExpense;

    chartConfig[safeKey] = { label: friendlyName, color };

    cardData.push({
      id: block.id ?? name,
      name: friendlyName,
      amount: totalAmount || entityIncome + entityExpense,
      count: block.expenseCount ?? expenses.length,
      color,
      icon: block.icon || null,
      entityType: name,
    });
  });

  cardData.sort((a, b) => b.amount - a.amount);

  const chartBuckets = buildStackedBuckets(rawData, entityNames, activeRange, offset, keyMap);

  return {
    chartData: chartBuckets,
    cardData,
    totals: { income: totalIncome, expense: totalExpense },
    chartConfig,
  };
}
