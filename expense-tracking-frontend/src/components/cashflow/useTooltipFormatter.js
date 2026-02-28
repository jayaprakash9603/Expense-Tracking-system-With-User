import { useCallback } from "react";
import dayjs from "dayjs";

/**
 * Returns a stable function to format tooltip labels based on activeRange and offset.
 */
export default function useTooltipFormatter(
  activeRange,
  offset,
  yearMonths,
  weekDays
) {
  return useCallback(
    (label, payload) => {
      try {
        if (!Array.isArray(payload) || payload.length === 0) return label;
        if (activeRange === "year") {
          const monthIdx = yearMonths.indexOf(String(label));
          if (monthIdx >= 0) {
            const baseYear = dayjs().startOf("year").add(offset, "year");
            const monthStart = baseYear.month(monthIdx).startOf("month");
            const monthEnd = monthStart.endOf("month");
            return `${monthStart.format("MMM")} (${monthStart.format(
              "D MMM"
            )} - ${monthEnd.format("D MMM")})`;
          }
        } else if (activeRange === "month") {
          const dayNum = parseInt(String(label), 10);
          if (!isNaN(dayNum)) {
            const baseMonth = dayjs().startOf("month").add(offset, "month");
            const date = baseMonth.date(dayNum);
            return date.format("D MMM");
          }
        } else if (activeRange === "week") {
          const idx = weekDays.indexOf(String(label));
          if (idx >= 0) {
            const today = dayjs();
            const daysSinceMonday = (today.day() + 6) % 7;
            const currentMonday = today.subtract(daysSinceMonday, "day");
            const monday = currentMonday.add(offset, "week");
            const date = monday.add(idx, "day");
            return `${date.format("ddd")}, ${date.format("D MMM")}`;
          }
        }
      } catch (_) {}
      return label;
    },
    [activeRange, offset, yearMonths, weekDays]
  );
}
