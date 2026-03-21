export const EMPTY_BILL_EXPENSE_ROW = {
  itemName: "",
  quantity: 1,
  unitPrice: "",
  totalPrice: 0,
  comments: "",
};

export function isBillExpenseRowComplete(expense) {
  if (!expense) return false;
  const nameOk = expense.itemName && String(expense.itemName).trim() !== "";
  const price = parseFloat(expense.unitPrice);
  const qty = parseFloat(expense.quantity);
  const priceOk =
    expense.unitPrice !== "" &&
    !Number.isNaN(price) &&
    price > 0 &&
    !String(expense.unitPrice).includes("-");
  const qtyOk =
    expense.quantity !== "" &&
    !Number.isNaN(qty) &&
    qty > 0 &&
    !String(expense.quantity).includes("-");
  return nameOk && priceOk && qtyOk;
}

export function filterValidBillExpenses(rows) {
  return (rows || []).filter((exp) => isBillExpenseRowComplete(exp));
}

export function computeBillExpensesTotal(rows) {
  return filterValidBillExpenses(rows).reduce((sum, exp) => sum + (exp.totalPrice || 0), 0);
}

export function mapApiExpensesToForm(rawList) {
  if (!rawList?.length) return [];
  return rawList.map((exp) => ({
    itemName: exp.itemName || exp.expenseName || "",
    quantity: exp.quantity ?? 1,
    unitPrice:
      exp.unitPrice !== undefined && exp.unitPrice !== null
        ? String(exp.unitPrice)
        : String(exp.amount ?? ""),
    totalPrice: exp.totalPrice ?? exp.amount ?? 0,
    comments: exp.comments || "",
  }));
}

export function buildLegacyLineItemsFromAmount(name, amountRaw) {
  const n = Number(amountRaw);
  if (!name || Number.isNaN(n) || n <= 0) return [];
  return [
    {
      itemName: name,
      quantity: 1,
      unitPrice: String(n),
      totalPrice: n,
      comments: "",
    },
  ];
}

export function resolveExpensesFromApi(raw) {
  const mapped = mapApiExpensesToForm(raw.expenses);
  if (mapped.length) return mapped;
  return buildLegacyLineItemsFromAmount(
    raw.name || raw.billName || raw.title || "Bill",
    raw.amount,
  );
}
