import dayjs from "dayjs";

// Range types used for navigation between week/month/year views
export const rangeTypes = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

// Cycle for flow type toggling (All -> Inflow -> Outflow) generic labels
export const flowTypeCycleDefault = [
  { label: "Money In & Out", value: "all", color: "bg-[#5b7fff] text-white" },
  { label: "Money In", value: "inflow", color: "bg-[#06D6A0] text-black" },
  { label: "Money Out", value: "outflow", color: "bg-[#FF6B6B] text-white" },
];

// Alternative cycles for specific flows (if wording differs)
export const flowTypeCyclePaymentMethod = [
  { label: "All Expenses", value: "all", color: "bg-[#5b7fff] text-white" },
  { label: "Income", value: "inflow", color: "bg-[#06D6A0] text-black" },
  { label: "Expenses", value: "outflow", color: "bg-[#FF6B6B] text-white" },
];

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const monthDays = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
export const yearMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * getRangeLabel
 * mode: controls prefix text ("This Month" wording). Accepts: 'cashflow' | 'category' | 'paymentMethod' | 'generic'
 */
export function getRangeLabel(range, offset, mode = "generic") {
  const base = dayjs();
  const prefixMap = {
    cashflow: { week: "This Week", month: "This Month", year: "This Year" },
    category: {
      week: "Categories this week",
      month: "Categories this month",
      year: "Categories this year",
    },
    paymentMethod: {
      week: "Payment Methods this week",
      month: "Payment Methods this month",
      year: "Payment Methods this year",
    },
    generic: { week: "This Week", month: "This Month", year: "This Year" },
  };
  const prefix = prefixMap[mode] || prefixMap.generic;

  if (range === "month") {
    const start = base.startOf("month").add(offset, "month");
    const end = base.endOf("month").add(offset, "month");
    if (offset === 0) return `${prefix.month} (${base.format("MMM YY")})`;
    return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
  }
  if (range === "week") {
    const start = base.startOf("week").add(offset, "week");
    const end = base.endOf("week").add(offset, "week");
    if (start.year() === end.year())
      return `${start.format("D MMM")} - ${end.format("D MMM YYYY")}`;
    return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
  }
  if (range === "year") {
    const year = base.startOf("year").add(offset, "year").year();
    if (offset === 0) return prefix.year;
    return `${year}`;
  }
  return "";
}

export default {
  rangeTypes,
  flowTypeCycleDefault,
  flowTypeCyclePaymentMethod,
  weekDays,
  monthDays,
  yearMonths,
  getRangeLabel,
};
