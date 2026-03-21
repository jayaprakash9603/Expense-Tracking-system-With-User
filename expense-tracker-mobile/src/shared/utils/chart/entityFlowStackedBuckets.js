import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { weekDays, yearMonths } from "./timeframeResolver";

export function getStartOfIsoWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function buildStackedBuckets(rawData, entityNames, activeRange, offset, keyMap) {
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

  const safeKeys = entityNames.map((n) => keyMap[n]);

  const data = Array.from({ length: bucketCount }, (_, i) => {
    const row = { label: labels[i] };
    safeKeys.forEach((sk) => {
      row[sk] = 0;
    });
    return row;
  });

  entityNames.forEach((entityName) => {
    const block = rawData[entityName];
    const expenses = Array.isArray(block?.expenses) ? block.expenses : [];
    const safeKey = keyMap[entityName];

    expenses.forEach((e) => {
      if (!e) return;
      const details = extractExpenseDetails(e);
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
      } else if (d.getFullYear() === baseStart.getFullYear()) {
        idx = d.getMonth();
      }

      if (idx >= 0 && idx < bucketCount) {
        const amt = Math.abs(Number(details.amount ?? details.netAmount ?? e.amount ?? 0));
        data[idx][safeKey] = (data[idx][safeKey] || 0) + amt;
      }
    });
  });

  return data;
}
