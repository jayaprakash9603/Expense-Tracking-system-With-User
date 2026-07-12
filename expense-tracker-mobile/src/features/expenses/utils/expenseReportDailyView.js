const DAILY_POINT_THRESHOLD_FOR_MONTHLY_THIS_YEAR = 32;

function rowHasSpend(row, flowKind) {
  if (flowKind === "all") {
    const ex = Math.abs(Number(row.expense ?? 0));
    const inc = Math.abs(Number(row.income ?? 0));
    if (ex > 0 || inc > 0) return true;
    return Array.isArray(row.expenses) && row.expenses.length > 0;
  }
  if (Math.abs(Number(row.expense ?? 0)) > 0) return true;
  return Array.isArray(row.expenses) && row.expenses.length > 0;
}

function filterMeaningfulRows(data, flowKind) {
  if (!data?.length) return [];
  return data.filter((row) => rowHasSpend(row, flowKind));
}

function distinctMonthKeys(rows) {
  const keys = new Set();
  rows.forEach((row) => {
    const d = String(row.date || "").split("T")[0];
    if (d.length >= 7) keys.add(d.slice(0, 7));
  });
  return keys.size;
}

function shouldAggregateToMonthly(timeframe, rowCount, monthCount) {
  if (!rowCount) return false;
  if (timeframe === "all_time" || timeframe === "last_year") return true;
  if (timeframe === "this_year" || timeframe === "quarter") {
    return rowCount >= DAILY_POINT_THRESHOLD_FOR_MONTHLY_THIS_YEAR || monthCount > 1;
  }
  return false;
}

function aggregateMonthly(rows, dataKeys, labelWithYear) {
  const map = {};
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  rows.forEach((row) => {
    const dateStr = String(row.date || "").split("T")[0];
    if (dateStr.length < 7) return;
    const monthKey = dateStr.slice(0, 7);
    if (!map[monthKey]) {
      const d = new Date(`${monthKey}-01T00:00:00`);
      const monthLabel = !Number.isNaN(d.getTime())
        ? labelWithYear
          ? `${monthFormatter.format(d)} ${d.getFullYear()}`
          : monthFormatter.format(d)
        : monthKey;
      map[monthKey] = { date: monthLabel, _sortKey: monthKey, expenses: [] };
      dataKeys.forEach((k) => {
        map[monthKey][k] = 0;
      });
    }
    dataKeys.forEach((k) => {
      map[monthKey][k] = (map[monthKey][k] || 0) + Math.abs(Number(row[k] ?? 0));
    });
    if (Array.isArray(row.expenses)) {
      map[monthKey].expenses.push(...row.expenses);
    }
  });
  return Object.values(map)
    .sort((a, b) => a._sortKey.localeCompare(b._sortKey))
    .map(({ _sortKey, ...rest }) => rest);
}

export function applyExpenseReportDailyView(areaModel, timeframe, flowKind) {
  if (!areaModel?.data?.length) {
    return areaModel;
  }
  const dataKeys = areaModel.dataKeys?.length ? areaModel.dataKeys : ["expense"];
  const filtered = filterMeaningfulRows(areaModel.data, flowKind);
  if (!filtered.length) {
    return { ...areaModel, data: [] };
  }
  const months = distinctMonthKeys(filtered);
  const useMonthly = shouldAggregateToMonthly(timeframe, filtered.length, months);
  if (!useMonthly) {
    return { ...areaModel, data: filtered };
  }
  const labelWithYear = timeframe === "all_time" || timeframe === "last_year";
  const aggregated = aggregateMonthly(filtered, dataKeys, labelWithYear);
  return { ...areaModel, data: aggregated };
}
