import { computeBillExpensesTotal, filterValidBillExpenses } from "./billExpenseLineUtils";

export function validateBillForm(data) {
  const errors = {};
  if (!String(data.name || "").trim()) errors.name = "validation.nameRequired";
  if (!data.date) errors.date = "validation.dateRequired";
  if (!data.type) errors.type = "validation.billTypeRequired";
  const validLines = filterValidBillExpenses(data.expenses || []);
  if (validLines.length === 0) {
    errors.amount = "validation.billLinesRequired";
  } else {
    const total = computeBillExpensesTotal(validLines);
    if (total <= 0) errors.amount = "validation.amountInvalid";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
