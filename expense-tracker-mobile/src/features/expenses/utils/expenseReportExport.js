import dayjs from "dayjs";
import { toast } from "sonner";
import { getTimeframeDateRange } from "@/shared/utils/chart/timeframeResolver";
import { expenseApi } from "@/infrastructure/api";
import { downloadBlobFile } from "@/shared/utils/file/downloadFile";

function toYmd(value) {
  return dayjs(value).format("YYYY-MM-DD");
}

export async function runExpenseReportExport({
  fromDate,
  toDate,
  isCustomRange,
  dailyTimeframe,
  dailyFlowType,
  errorMessage,
}) {
  let from = fromDate;
  let to = toDate;
  if (!isCustomRange) {
    const { start, end } = getTimeframeDateRange(dailyTimeframe);
    from = toYmd(start);
    to = toYmd(end);
  }
  const params = { fromDate: from, toDate: to };
  if (dailyFlowType === "outflow") {
    params.flowType = "outflow";
    params.type = "loss";
  } else if (dailyFlowType === "inflow") {
    params.flowType = "inflow";
    params.type = "gain";
  }
  const { data, error: exportErr } = await expenseApi.exportData(params);
  if (exportErr) {
    toast.error(exportErr.message || errorMessage);
    return;
  }
  if (data) {
    downloadBlobFile(data, `expenses-${from}-${to}.csv`);
  }
}
