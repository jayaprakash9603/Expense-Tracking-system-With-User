import dayjs from "dayjs";

/**
 * Safely extract an entity's expenses from either the expenses map or the entity object itself.
 * Normalizes away null/undefined entries.
 */
export function getEntityExpenses(entity, expensesMap) {
  if (!entity) return [];
  const name = entity.categoryName;
  let expenses = [];
  if (
    expensesMap &&
    name &&
    expensesMap[name] &&
    Array.isArray(expensesMap[name].expenses)
  ) {
    expenses = expensesMap[name].expenses;
  } else if (Array.isArray(entity.expenses)) {
    expenses = entity.expenses;
  }
  return expenses.filter((e) => e != null);
}

/**
 * Filter a set of expenses for a stacked chart bucket.
 * Delegates to date logic similar to PaymentMethodFlow/CategoryFlow implementations.
 */
export function filterExpensesForRangeBucket({
  expensesAll = [],
  activeRange,
  offset = 0,
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
  const s = start.valueOf();
  const e = end.valueOf();
  return expensesAll.filter((ex) => {
    if (!ex || !ex.date) return false;
    const t = dayjs(ex.date).valueOf();
    return t >= s && t <= e;
  });
}
