import { normalizePaymentMethod } from "@/domain/shared/paymentMethod.utils";
import { computeBillExpensesTotal, filterValidBillExpenses } from "./billExpenseLineUtils";

export function computeBillCreditDue(type, paymentMethod, totalAmount) {
  const normalized = normalizePaymentMethod(paymentMethod);
  return type === "loss" && normalized === "creditNeedToPaid" ? totalAmount : 0;
}

export function buildBillApiPayload(formData, entityId = null) {
  const valid = filterValidBillExpenses(formData.expenses || []);
  const totalAmount = computeBillExpensesTotal(valid);
  const normalizedMethod = normalizePaymentMethod(formData.paymentMethod);
  const budgetIds = formData.budgetIds || [];
  const categoryIdNum = formData.categoryId ? Number(formData.categoryId) : 0;
  const base = {
    name: String(formData.name || "").trim(),
    description: String(formData.description || "").trim(),
    amount: totalAmount,
    netAmount: totalAmount,
    paymentMethod: normalizedMethod,
    type: formData.type,
    date: formData.date,
    categoryId: Number.isFinite(categoryIdNum) ? categoryIdNum : 0,
    creditDue: computeBillCreditDue(formData.type, formData.paymentMethod, totalAmount),
    includeInBudget: budgetIds.length > 0,
    budgetIds,
    expenses: valid.map((e) => ({
      itemName: e.itemName.trim(),
      quantity: parseFloat(e.quantity),
      unitPrice: parseFloat(e.unitPrice),
      totalPrice: e.totalPrice,
      comments: e.comments?.trim() || "",
    })),
  };
  if (entityId != null && entityId !== "") {
    const idNum = Number(entityId);
    return Number.isFinite(idNum) ? { ...base, id: idNum } : base;
  }
  return base;
}
