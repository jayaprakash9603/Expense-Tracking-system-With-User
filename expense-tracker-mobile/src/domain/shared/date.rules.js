export function isCurrentMonth(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function isCurrentWeek(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

export function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function groupByMonth(items, dateField = "date") {
  const groups = {};
  items.forEach((item) => {
    const d = new Date(item[dateField]);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export function groupByDay(items, dateField = "date") {
  const groups = {};
  items.forEach((item) => {
    const d = new Date(item[dateField]);
    const key = d.toISOString().split("T")[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export function sortByDate(items, dateField = "date", order = "desc") {
  return [...items].sort((a, b) => {
    const diff = new Date(a[dateField]) - new Date(b[dateField]);
    return order === "desc" ? -diff : diff;
  });
}
