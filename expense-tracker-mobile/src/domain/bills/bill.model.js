export const BILL_FREQUENCIES = ["ONCE", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];
export const BILL_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];

export const BILL_DEFAULTS = {
  name: "",
  amount: "",
  dueDate: "",
  frequency: "MONTHLY",
  category: "",
  status: "PENDING",
  autoPay: false,
  reminderDays: 3,
  notes: "",
};

export function createBill(overrides = {}) {
  return { ...BILL_DEFAULTS, ...overrides };
}
