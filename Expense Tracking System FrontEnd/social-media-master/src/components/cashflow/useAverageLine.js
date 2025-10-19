import { useMemo } from "react";
import dayjs from "dayjs";

/**
 * Compute average line y-value and visible count based on activeRange and offset.
 * Returns { avg } and uses only the portion of the current period when offset === 0.
 */
export default function useAverageLine(chartData, activeRange, offset) {
  return useMemo(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) {
      return { avg: 0 };
    }
    let visibleCount = chartData.length;
    if (offset === 0) {
      if (activeRange === "year") {
        visibleCount = Math.min(chartData.length, dayjs().month() + 1);
      } else if (activeRange === "month") {
        visibleCount = Math.min(chartData.length, dayjs().date());
      } else if (activeRange === "week") {
        const todayIdx = (dayjs().day() + 6) % 7;
        visibleCount = Math.min(chartData.length, todayIdx + 1);
      }
    }
    const total = chartData
      .slice(0, visibleCount)
      .reduce((s, item) => s + (item.amount || 0), 0);
    const avg = visibleCount ? total / visibleCount : 0;
    return { avg };
  }, [chartData, activeRange, offset]);
}
