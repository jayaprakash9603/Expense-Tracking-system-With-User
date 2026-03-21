export const SKELETON_VARIANTS = ["blue", "purple", "amber", "rose"];

export const EMPTY_CARDS = {
  totalSpending: {
    rawAmount: 0,
    percentage: "+0.0%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
  topExpense: {
    value: "—",
    percentage: "0.00%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
  avgTransaction: {
    rawAmount: 0,
    percentage: "+0.0%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
  totalTransactions: {
    value: "0",
    percentage: "+0.0%",
    trendDirection: "up",
    sparklineData: [0, 0],
  },
};

export const CONTROL_TF_CLASS = "h-8 w-[min(100%,9.5rem)] min-w-0 text-xs sm:w-[110px]";
export const REPORT_AREA_MARGIN = { top: 28, right: 8, left: 0, bottom: 28 };

export function reportFlowToLossGain(flow) {
  if (flow === "outflow") return "loss";
  if (flow === "inflow") return "gain";
  return null;
}
