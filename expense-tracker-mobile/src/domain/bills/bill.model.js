export const BILL_FREQUENCIES = ["ONCE", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];
export const BILL_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
export const BILL_TYPE_OPTIONS = ["gain", "loss"];

export const BILL_DEFAULTS = {
  name: "",
  description: "",
  date: "",
  type: "loss",
  paymentMethod: "cash",
  categoryId: "",
  amount: "",
  expenses: [],
  budgetIds: [],
};

export function createBill(overrides = {}) {
  return { ...BILL_DEFAULTS, ...overrides };
}
