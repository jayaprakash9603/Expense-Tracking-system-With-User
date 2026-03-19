import { getChartColor } from "./chartHelpers";
import { weekDays, yearMonths } from "./timeframeResolver";

function extractEntityMap(rawData) {
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
  let totalIncome = 0;
  let totalExpense = 0;

  entityNames.forEach((name, idx) => {
    const block = entityMap[name];
    const friendlyName = labelResolver(name);
    const color = block.color || getChartColor(idx);
    const expenses = Array.isArray(block.expenses) ? block.expenses : [];
    const totalAmount = Math.abs(Number(block.totalAmount ?? block.total ?? 0));

    let entityIncome = 0;
    let entityExpense = 0;

    expenses.forEach((e) => {
      if (!e) return;
      const details = e.expense || e.details || e;
      const amt = Math.abs(Number(details.amount ?? details.netAmount ?? e.amount ?? 0));
      const type = (details.type || e.type || "").toLowerCase();
      if (["gain", "income", "inflow"].includes(type)) entityIncome += amt;
      else entityExpense += amt;
    });

    totalIncome += entityIncome;
    totalExpense += entityExpense;

    chartConfig[friendlyName] = { label: friendlyName, color };

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

  const chartBuckets = buildStackedBuckets(rawData, entityNames, activeRange, offset, labelResolver);

  return {
    chartData: chartBuckets,
    cardData,
    totals: { income: totalIncome, expense: totalExpense },
    chartConfig,
  };
}

function getStartOfIsoWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function buildStackedBuckets(rawData, entityNames, activeRange, offset, labelResolver) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let baseStart;
  let bucketCount;
  let labels;

  if (activeRange === "week") {
    baseStart = getStartOfIsoWeek(now);
    baseStart.setDate(baseStart.getDate() + offset * 7);
    bucketCount = 7;
    labels = weekDays;
  } else if (activeRange === "month") {
    baseStart = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    bucketCount = new Date(baseStart.getFullYear(), baseStart.getMonth() + 1, 0).getDate();
    labels = Array.from({ length: bucketCount }, (_, i) => `${i + 1}`);
  } else {
    baseStart = new Date(now.getFullYear() + offset, 0, 1);
    bucketCount = 12;
    labels = yearMonths;
  }

  const data = Array.from({ length: bucketCount }, (_, i) => ({
    label: labels[i],
  }));

  entityNames.forEach((entityName) => {
    const block = rawData[entityName];
    const expenses = Array.isArray(block?.expenses) ? block.expenses : [];
    const friendlyName = labelResolver(entityName);

    expenses.forEach((e) => {
      if (!e) return;
      const details = e.expense || e.details || e;
      const dateStr = details.date || e.date || "";
      if (!dateStr) return;

      const d = new Date(dateStr);
      let idx = -1;

      if (activeRange === "week") {
        const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const baseDate = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate());
        const diffTime = dDate.getTime() - baseDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          idx = diffDays;
        }
      } else if (activeRange === "month") {
        if (d.getFullYear() === baseStart.getFullYear() && d.getMonth() === baseStart.getMonth()) {
          idx = d.getDate() - 1;
        }
      } else {
        if (d.getFullYear() === baseStart.getFullYear()) {
          idx = d.getMonth();
        }
      }

      if (idx >= 0 && idx < bucketCount) {
        const amt = Math.abs(Number(details.amount ?? details.netAmount ?? e.amount ?? 0));
        data[idx][friendlyName] = (data[idx][friendlyName] || 0) + amt;
      }
    });
  });

  // Ensure zeros for absent stacks
  data.forEach((row) => {
    entityNames.forEach((name) => {
      const friendlyName = labelResolver(name);
      if (row[friendlyName] === undefined) row[friendlyName] = 0;
    });
  });

  return data;
}
