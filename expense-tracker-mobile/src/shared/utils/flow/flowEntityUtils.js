import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { extractExpenseDetails } from "@/shared/utils/expense/expenseDisplayUtils";

dayjs.extend(isoWeek);

function expenseDateValue(ex) {
  if (!ex) return null;
  const details = extractExpenseDetails(ex);
  const raw = details.date || ex.date;
  if (!raw) return null;
  const t = dayjs(raw).valueOf();
  return Number.isFinite(t) ? t : null;
}

export function getEntityExpenses(entity, expensesMap) {
  if (!entity) return [];
  const key = entity.entityType ?? entity.categoryName ?? entity.name;
  if (expensesMap && key && expensesMap[key] && Array.isArray(expensesMap[key].expenses)) {
    return expensesMap[key].expenses.filter(Boolean);
  }
  if (Array.isArray(entity.expenses)) return entity.expenses.filter(Boolean);
  return [];
}

export function filterExpensesForRangeBucket({
  expensesAll = [],
  activeRange,
  offset = 0,
  bucketIdx,
}) {
  if (bucketIdx == null || bucketIdx < 0) return [];
  const baseNow = dayjs();
  let start;
  let end;
  if (activeRange === "week") {
    const baseStart = baseNow.startOf("isoWeek").add(offset, "week");
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
  const s = start.valueOf();
  const e = end.valueOf();
  return expensesAll.filter((ex) => {
    const t = expenseDateValue(ex);
    return t != null && t >= s && t <= e;
  });
}
