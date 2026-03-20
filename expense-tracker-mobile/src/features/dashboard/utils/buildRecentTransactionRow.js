function transactionVariantFromType(typeRaw) {
  const normalized = String(typeRaw || "").toLowerCase();
  if (
    normalized === "gain" ||
    normalized === "inflow" ||
    normalized === "income" ||
    typeRaw === "INCOME" ||
    typeRaw === "GAIN"
  ) {
    return "gain";
  }
  return "loss";
}

export function buildRecentTransactionRow(transaction) {
  const expense = transaction?.expense || transaction;
  const id = transaction?.id ?? expense?.id;
  const typeRaw = expense?.type ?? transaction?.type ?? "";
  const variant = transactionVariantFromType(typeRaw);
  const name =
    expense?.expenseName ??
    expense?.name ??
    transaction?.name ??
    transaction?.itemName ??
    transaction?.expenseName ??
    transaction?.title ??
    "";
  const amount = Number(expense?.amount ?? transaction?.amount ?? transaction?.expenseAmount ?? 0);
  const categoryName =
    transaction?.categoryName ??
    expense?.categoryName ??
    transaction?.category ??
    "";
  const categoryId = transaction?.categoryId ?? expense?.categoryId ?? null;
  const dateRaw = transaction?.date ?? expense?.date ?? expense?.expenseDate ?? "";
  let dateLabel = "";
  if (dateRaw) {
    const parsed = new Date(dateRaw);
    dateLabel = Number.isNaN(parsed.getTime()) ? String(dateRaw) : parsed.toLocaleDateString();
  }
  return { id, variant, name, amount, categoryName, categoryId, dateLabel };
}
