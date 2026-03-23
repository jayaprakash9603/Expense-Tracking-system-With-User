function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildDetailedBudgetRequestParams(timeFrame, flowType, customRange, targetId) {
  const rangeType = String(timeFrame || "month").toLowerCase();
  const offset = 0;
  let fromDate = null;
  let toDate = null;
  const now = new Date();

  if (String(timeFrame).toLowerCase() !== "all") {
    toDate = formatLocalDate(now);
    switch (String(timeFrame).toLowerCase()) {
      case "day":
      case "today":
        fromDate = toDate;
        break;
      case "week": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        fromDate = formatLocalDate(startOfWeek);
        break;
      }
      case "month": {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        fromDate = formatLocalDate(startOfMonth);
        break;
      }
      case "quarter": {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        fromDate = formatLocalDate(startOfQuarter);
        break;
      }
      case "year": {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        fromDate = formatLocalDate(startOfYear);
        break;
      }
      case "budget":
        fromDate = null;
        toDate = null;
        break;
      default:
        fromDate = null;
        toDate = null;
    }
  }

  if (customRange?.fromDate && customRange?.toDate) {
    fromDate = customRange.fromDate.slice(0, 10);
    toDate = customRange.toDate.slice(0, 10);
  }

  const params = { targetId: targetId || "" };

  if (fromDate && toDate) {
    params.fromDate = fromDate;
    params.toDate = toDate;
  } else {
    params.rangeType = rangeType;
    params.offset = offset;
  }

  if (flowType && flowType !== "all") {
    params.flowType = flowType;
  }

  return params;
}
