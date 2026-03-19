const PAYMENT_METHOD_LABELS = {
  creditNeedToPaid: "Credit (Due)",
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  creditCard: "Credit Card",
  debitCard: "Debit Card",
  netBanking: "Net Banking",
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  NET_BANKING: "Net Banking",
};

export function toFriendlyLabel(key) {
  return (
    PAYMENT_METHOD_LABELS[key] ||
    key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  );
}

export function normalizeCategoryDistribution(rawData) {
  if (!rawData) return [];

  if (rawData.summary?.categoryTotals) {
    const totals = rawData.summary.categoryTotals;
    return Object.entries(totals)
      .filter(([, val]) => Number(val) > 0)
      .map(([name, value]) => ({ name, value: Math.abs(Number(value)) }));
  }

  if (Array.isArray(rawData)) {
    return rawData
      .filter((d) => Number(d.value ?? d.amount ?? d.total ?? 0) > 0)
      .map((d) => ({
        name: d.name || d.category || d.label || "Unknown",
        value: Math.abs(Number(d.value ?? d.amount ?? d.total ?? 0)),
      }));
  }

  const keys = Object.keys(rawData).filter((k) => k !== "summary");
  const hasBlocks = keys.some(
    (k) => rawData[k] && (rawData[k].totalAmount != null || rawData[k].total != null)
  );

  if (hasBlocks) {
    return keys
      .map((k) => {
        const block = rawData[k] || {};
        const val = Math.abs(Number(block.totalAmount ?? block.total ?? 0));
        return { name: k, value: val };
      })
      .filter((d) => d.value > 0);
  }

  return keys
    .map((k) => ({ name: k, value: Math.abs(Number(rawData[k] ?? 0)) }))
    .filter((d) => d.value > 0);
}

export function normalizePaymentMethodDistribution(rawData) {
  if (!rawData) return [];

  if (rawData.summary?.paymentMethodTotals) {
    const totals = rawData.summary.paymentMethodTotals;
    return Object.entries(totals)
      .filter(([, val]) => Number(val) > 0)
      .map(([name, value]) => ({
        name: toFriendlyLabel(name),
        value: Math.abs(Number(value)),
      }));
  }

  if (Array.isArray(rawData)) {
    return rawData
      .filter((d) => Number(d.value ?? d.amount ?? d.total ?? 0) > 0)
      .map((d) => ({
        name: toFriendlyLabel(d.label || d.name || d.method || "Unknown"),
        value: Math.abs(Number(d.value ?? d.amount ?? d.total ?? 0)),
      }));
  }

  const keys = Object.keys(rawData).filter((k) => k !== "summary");
  const hasBlocks = keys.some(
    (k) => rawData[k] && (rawData[k].totalAmount != null || rawData[k].total != null)
  );

  if (hasBlocks) {
    return keys
      .map((k) => {
        const block = rawData[k] || {};
        const val = Math.abs(Number(block.totalAmount ?? block.total ?? 0));
        return { name: toFriendlyLabel(k), value: val };
      })
      .filter((d) => d.value > 0);
  }

  return keys
    .map((k) => ({ name: toFriendlyLabel(k), value: Math.abs(Number(rawData[k] ?? 0)) }))
    .filter((d) => d.value > 0);
}

export function buildDateRangeParams(timeframe, flowType) {
  const now = new Date();
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const params = {};

  switch (timeframe) {
    case "this_week": {
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      params.fromDate = fmt(start);
      params.toDate = fmt(now);
      break;
    }
    case "last_week": {
      const dayOfWeek = now.getDay();
      const end = new Date(now);
      end.setDate(now.getDate() - dayOfWeek - 1);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
      break;
    }
    case "this_month":
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      params.fromDate = fmt(start);
      params.toDate = fmt(now);
      break;
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
      break;
    }
    case "last_3_months":
    case "last_3": {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      params.fromDate = fmt(start);
      params.toDate = fmt(now);
      break;
    }
    case "this_year":
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      params.fromDate = fmt(start);
      params.toDate = fmt(now);
      break;
    }
    case "last_year": {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      params.fromDate = fmt(start);
      params.toDate = fmt(end);
      break;
    }
    case "all_time": {
      params.fromDate = "2002-01-15";
      params.toDate = fmt(now);
      break;
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      params.fromDate = fmt(start);
      params.toDate = fmt(now);
    }
  }

  if (flowType === "gain") {
    params.flowType = "inflow";
    params.type = "gain";
  } else if (flowType === "loss") {
    params.flowType = "outflow";
    params.type = "loss";
  }

  return params;
}
