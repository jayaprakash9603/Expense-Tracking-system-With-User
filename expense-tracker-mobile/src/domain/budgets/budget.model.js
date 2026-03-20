export const BUDGET_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"];

export const BUDGET_DEFAULTS = {
  name: "",
  description: "",
  amount: "",
  period: "MONTHLY",
  category: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  isGlobal: false,
  alertThreshold: 80,
};

export function createBudget(overrides = {}) {
  return { ...BUDGET_DEFAULTS, ...overrides };
}
