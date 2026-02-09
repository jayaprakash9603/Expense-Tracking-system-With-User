import dayjs from "dayjs";

/**
 * Salary date used across the app.
 * Existing behavior (also used by ExpenseFormLogic): last working day of the month.
 */
export function getSalaryDateLastWorkingDay(year, monthIndex) {
  let lastDay = dayjs(`${year}-${monthIndex + 1}-01`).endOf("month");
  const dayOfWeek = lastDay.day();

  if (dayOfWeek === 6) return lastDay.subtract(1, "day"); // Sat -> Fri
  if (dayOfWeek === 0) return lastDay.subtract(2, "day"); // Sun -> Fri
  return lastDay;
}

export function getDaysArray(year, monthIndex) {
  const numDays = dayjs(`${year}-${monthIndex + 1}-01`).daysInMonth();
  return Array.from({ length: numDays }, (_, i) => i + 1);
}

/**
 * Payday distance: negative => salary upcoming, positive => salary passed.
 */
export function getPaydayDistanceText(dayDate, salaryDate) {
  if (!dayDate || !salaryDate) return "";
  const distance = dayDate.diff(salaryDate, "day");
  if (distance === 0) return "Salary day";

  if (distance < 0) {
    return `−${Math.abs(distance)} day${
      Math.abs(distance) === 1 ? "" : "s"
    } to salary`;
  }

  return `+${distance} day${distance === 1 ? "" : "s"} since salary`;
}
