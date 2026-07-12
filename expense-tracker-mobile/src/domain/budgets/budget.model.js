export const BUDGET_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"];

export const DEFAULT_BUDGET_ALERT_THRESHOLD_PERCENT = 80;

export const BUDGET_DEFAULTS = {
  name: "",
  description: "",
  amount: "",
  period: "MONTHLY",
  category: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  isGlobal: false,
  alertThreshold: DEFAULT_BUDGET_ALERT_THRESHOLD_PERCENT,
};

export function createBudget(overrides = {}) {
  return { ...BUDGET_DEFAULTS, ...overrides };
}
