export function normalizeExpenseTransactionType(typeValue) {
  const normalized = String(typeValue || "").toLowerCase();
  if (normalized === "gain" || normalized === "inflow" || normalized === "income") {
    return "gain";
  }
  return "loss";
}
