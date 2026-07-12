export const EXPENSE_TYPES = ["NEED", "WANT", "INVESTMENT", "SAVINGS"];

export const PAYMENT_METHODS = [
  "CASH", "CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING",
  "WALLET", "CHECK", "OTHER",
];

export const EXPENSE_DEFAULTS = {
  name: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  category: "",
  type: "NEED",
  paymentMethod: "UPI",
  comments: "",
  isRecurring: false,
  recurringFrequency: null,
  tags: [],
};

export function createExpense(overrides = {}) {
  return { ...EXPENSE_DEFAULTS, ...overrides };
}

export function getExpenseDisplayName(expense) {
  return expense?.name || expense?.category || "Unnamed Expense";
}
