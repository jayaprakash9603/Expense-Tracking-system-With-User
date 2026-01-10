import dayjs from "dayjs";

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Computes month totals + normalization values used by the calendar.
 *
 * Design decision: average is per calendar day in the month (not only active days)
 * because it supports quick month-level baseline comparisons.
 */
export function computeMonthCalendarStats({
  data,
  monthDate,
  spendingKey = "spending",
  incomeKey = "income",
}) {
  const start = dayjs(monthDate).startOf("month");
  const end = dayjs(monthDate).endOf("month");
  const daysInMonth = start.daysInMonth();

  let totalSpending = 0;
  let totalIncome = 0;
  let maxSpending = 0;
  let maxIncome = 0;

  // Iterate known data keys and only include entries in the target month.
  Object.entries(data || {}).forEach(([dateStr, dayData]) => {
    const date = dayjs(dateStr);
    if (!date.isValid() || !date.isBetween(start, end, "day", "[]")) return;

    const spending = safeNumber(dayData?.[spendingKey]);
    const income = safeNumber(dayData?.[incomeKey]);

    totalSpending += spending;
    totalIncome += income;

    if (spending > maxSpending) maxSpending = spending;
    if (income > maxIncome) maxIncome = income;
  });

  const avgDailySpend = daysInMonth > 0 ? totalSpending / daysInMonth : 0;

  return {
    start,
    end,
    daysInMonth,
    totalSpending,
    totalIncome,
    avgDailySpend,
    maxSpending,
    maxIncome,
  };
}

function sumSpendingInRange({ data, start, end, spendingKey, monthDate }) {
  let total = 0;
  Object.entries(data || {}).forEach(([dateStr, dayData]) => {
    const date = dayjs(dateStr);
    if (!date.isValid()) return;
    if (!date.isBetween(start, end, "day", "[]")) return;

    // We only have month-aggregated data available, so clamp to the visible month.
    if (monthDate && !date.isSame(monthDate, "month")) return;

    total += safeNumber(dayData?.[spendingKey]);
  });
  return total;
}

/**
 * Week-over-week spending velocity.
 *
 * Returns percentChange comparing current week vs previous week.
 * - If previous week total is 0, we return null unless current is also 0.
 */
export function computeWeekOverWeekSpendingVelocity({
  data,
  monthDate,
  spendingKey = "spending",
  anchorDate,
}) {
  const anchor = dayjs(anchorDate || monthDate);
  if (!anchor.isValid()) {
    return { percentChange: null, currentWeekTotal: 0, previousWeekTotal: 0 };
  }

  const weekStart = anchor.startOf("week");
  const weekEnd = anchor.endOf("week");
  const prevWeekStart = weekStart.subtract(7, "day");
  const prevWeekEnd = weekEnd.subtract(7, "day");

  const currentWeekTotal = sumSpendingInRange({
    data,
    start: weekStart,
    end: weekEnd,
    spendingKey,
    monthDate,
  });

  const previousWeekTotal = sumSpendingInRange({
    data,
    start: prevWeekStart,
    end: prevWeekEnd,
    spendingKey,
    monthDate,
  });

  if (previousWeekTotal === 0) {
    if (currentWeekTotal === 0) {
      return { percentChange: 0, currentWeekTotal, previousWeekTotal };
    }
    return { percentChange: null, currentWeekTotal, previousWeekTotal };
  }

  const percentChange =
    ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;

  return { percentChange, currentWeekTotal, previousWeekTotal };
}
