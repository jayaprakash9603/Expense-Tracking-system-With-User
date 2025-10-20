import dayjs from "dayjs";
import { yearMonths, weekDays } from "./flowDateUtils"; // assumes these exports exist

// Deterministic pseudo-random color generator based on string input.
export function deterministicColor(str) {
  const themeColors = [
    "#5b7fff",
    "#00dac6",
    "#bb86fc",
    "#ff7597",
    "#ffb74d",
    "#ff5252",
    "#69f0ae",
    "#ff4081",
    "#64b5f6",
    "#ffd54f",
    "#b0bec5",
    "#e040fb",
    "#00e676",
    "#ffab40",
    "#4fc3f7",
    "#7986cb",
    "#9575cd",
    "#4db6ac",
    "#81c784",
    "#dce775",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return themeColors[Math.abs(hash) % themeColors.length];
}

// Build stacked chart data from entity expense map.
// entityExpenses: object keyed by entity name -> { expenses: [], totalAmount, ... }
// keyPrefix: e.g. 'cat' or 'pm'
export function buildStackedChartData({
  entityExpenses,
  activeRange,
  offset,
  keyPrefix,
  colorAccessor = (name, entity) => entity?.color || deterministicColor(name),
}) {
  const segments = [];
  if (!entityExpenses) {
    return { barSegments: segments, stackedChartData: [], xAxisKey: "slot" };
  }
  // Collect segment meta
  Object.keys(entityExpenses)
    .filter((k) => k !== "summary")
    .forEach((name) => {
      const key = `${keyPrefix}_${name.replace(/[^a-zA-Z0-9_]/g, "_")}`;
      const entity = entityExpenses[name];
      segments.push({ label: name, key, color: colorAccessor(name, entity) });
    });

  const baseNow = dayjs();
  let baseStart,
    bucketCount,
    labels,
    xKey = "slot";
  if (activeRange === "week") {
    baseStart = baseNow.startOf("week").add(offset, "week");
    bucketCount = 7;
    labels = weekDays;
  } else if (activeRange === "month") {
    baseStart = baseNow.startOf("month").add(offset, "month");
    bucketCount = baseStart.daysInMonth();
    labels = Array.from({ length: bucketCount }, (_, i) => `${i + 1}`);
  } else {
    baseStart = baseNow.startOf("year").add(offset, "year");
    bucketCount = 12;
    labels = yearMonths;
  }

  const data = Array.from({ length: bucketCount }, (_, i) => ({
    [xKey]: labels[i],
  }));
  const addAmt = (idx, key, amt) => {
    if (idx < 0 || idx >= data.length) return;
    data[idx][key] = (data[idx][key] || 0) + (Number(amt) || 0);
  };

  Object.keys(entityExpenses)
    .filter((k) => k !== "summary")
    .forEach((name) => {
      const entity = entityExpenses[name];
      const key = `${keyPrefix}_${name.replace(/[^a-zA-Z0-9_]/g, "_")}`;
      const expenses = Array.isArray(entity?.expenses) ? entity.expenses : [];
      expenses.forEach((e) => {
        if (!e) return;
        const d = dayjs(e.date);
        let idx = -1;
        if (activeRange === "week") {
          idx = d.startOf("day").diff(baseStart.startOf("day"), "day");
        } else if (activeRange === "month") {
          if (d.year() === baseStart.year() && d.month() === baseStart.month())
            idx = d.date() - 1;
        } else {
          if (d.year() === baseStart.year()) idx = d.month();
        }
        if (idx >= 0 && idx < bucketCount) {
          const amt = (e.details && e.details.amount) || e.amount || 0;
          addAmt(idx, key, amt);
        }
      });
    });

  // Ensure zeros for absent stacks
  data.forEach((row) => {
    segments.forEach((s) => {
      if (row[s.key] === undefined) row[s.key] = 0;
    });
  });

  return { barSegments: segments, stackedChartData: data, xAxisKey: xKey };
}

// Filter expenses by bucket (day index / month index) for click actions.
export function filterExpensesForBucket({
  expensesAll,
  activeRange,
  offset,
  bucketIdx,
}) {
  const baseNow = dayjs();
  let start, end;
  if (activeRange === "week") {
    const baseStart = baseNow.startOf("week").add(offset, "week");
    start = baseStart.add(bucketIdx, "day").startOf("day");
    end = start.endOf("day");
  } else if (activeRange === "month") {
    const baseStart = baseNow.startOf("month").add(offset, "month");
    const dayOfMonth = bucketIdx + 1;
    start = baseStart.date(dayOfMonth).startOf("day");
    end = baseStart.date(dayOfMonth).endOf("day");
  } else {
    const baseStart = baseNow.startOf("year").add(offset, "year");
    start = baseStart.month(bucketIdx).startOf("month");
    end = baseStart.month(bucketIdx).endOf("month");
  }
  const sMs = start.valueOf();
  const eMs = end.valueOf();
  return (expensesAll || []).filter((e) => {
    if (!e || !e.date) return false;
    const t = dayjs(e.date).valueOf();
    return t >= sMs && t <= eMs;
  });
}
