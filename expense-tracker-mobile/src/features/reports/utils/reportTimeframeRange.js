import { getTimeframeDateRange } from "@/shared/utils/chart/timeframeResolver";

function formatLocalDate(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDateRangeForReportTimeframe(timeframe) {
  const { start, end } = getTimeframeDateRange(timeframe);
  return {
    fromDate: formatLocalDate(start),
    toDate: formatLocalDate(end),
  };
}
