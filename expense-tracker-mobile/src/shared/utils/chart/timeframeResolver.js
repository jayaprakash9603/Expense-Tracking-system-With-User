export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const yearMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EARLIEST_SUPPORTED_DATE = new Date(2002, 0, 15);

function formatDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function resolveTimeframeParams(timeframe) {
  const now = new Date();

  switch (timeframe) {
    case "this_week":
      return { range: "week", offset: 0 };

    case "last_week":
      return { range: "week", offset: -1 };

    case "this_month":
      return { range: "month", offset: 0 };

    case "last_month":
      return { range: "month", offset: -1 };

    case "quarter": {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return {
        startDate: formatDateString(qStart),
        endDate: formatDateString(now),
      };
    }

    case "last_3_months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return {
        startDate: formatDateString(start),
        endDate: formatDateString(now),
      };
    }

    case "last_6_months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return {
        startDate: formatDateString(start),
        endDate: formatDateString(now),
      };
    }

    case "this_year": {
      const isFirstQuarter = now.getMonth() <= 2;
      if (isFirstQuarter) {
        return {
          startDate: formatDateString(new Date(now.getFullYear(), 0, 1)),
          endDate: formatDateString(now),
        };
      }
      return { range: "year", offset: 0 };
    }

    case "last_year": {
      return {
        startDate: formatDateString(new Date(now.getFullYear() - 1, 0, 1)),
        endDate: formatDateString(new Date(now.getFullYear() - 1, 11, 31)),
      };
    }

    case "all_time":
      return {
        startDate: formatDateString(EARLIEST_SUPPORTED_DATE),
        endDate: formatDateString(now),
      };

    default:
      return { range: "month", offset: 0 };
  }
}

export function mapFlowType(type) {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower === "gain" || lower === "inflow") return "inflow";
  if (lower === "loss" || lower === "outflow") return "outflow";
  return null;
}

export function getTimeframeDateRange(timeframe) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeframe) {
    case "this_week": {
      const dayOfWeek = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek);
      return { start, end: today };
    }
    case "last_week": {
      const dayOfWeek = today.getDay();
      const end = new Date(today);
      end.setDate(today.getDate() - dayOfWeek - 1);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start, end };
    }
    case "this_month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: today };
    case "last_month":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    case "quarter": {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return { start: qStart, end: today };
    }
    case "this_year":
      return { start: new Date(now.getFullYear(), 0, 1), end: today };
    case "last_year":
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31),
      };
    case "last_3_months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return { start, end: today };
    }
    case "last_6_months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return { start, end: today };
    }
    case "all_time":
      return { start: EARLIEST_SUPPORTED_DATE, end: today };
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: today };
  }
}

export function filterExpensesByFlowType(expenses, flowType) {
  if (!flowType || flowType === "all") return expenses;
  if (flowType === "inflow") return expenses.filter((e) => e.type === "GAIN");
  if (flowType === "outflow") return expenses.filter((e) => e.type === "LOSS");
  return expenses;
}

export function filterExpensesByDateStrings(expenses, fromStr, toStr) {
  if (!fromStr || !toStr) return expenses;
  return expenses.filter((e) => {
    const dateStr = (e.date || "").split("T")[0];
    if (!dateStr) return false;
    return dateStr >= fromStr && dateStr <= toStr;
  });
}

export function filterExpensesByTimeframe(expenses, timeframe) {
  if (!timeframe || timeframe === "all_time") return expenses;
  const { start, end } = getTimeframeDateRange(timeframe);
  const startStr = formatDateString(start);
  const endStr = formatDateString(end);

  return expenses.filter((e) => {
    const dateStr = (e.date || "").split("T")[0];
    if (!dateStr) return false;
    return dateStr >= startStr && dateStr <= endStr;
  });
}
