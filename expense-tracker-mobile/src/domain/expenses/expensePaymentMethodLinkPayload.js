import { extractExpenseDetails } from "@/domain/expenses/expense.utils";
import { normalizeExpenseDateForForm } from "@/domain/expenses/expense.transformers";
import { normalizePaymentMethod } from "@/domain/shared/paymentMethod.utils";
import { normalizeExpenseTransactionType } from "@/domain/expenses/expenseTransaction.utils";

function mapDetailedExpenseToFormFields(rawExpense, fallbackDate) {
  const details = extractExpenseDetails(rawExpense);
  const resolvedAmount = details.amount ?? rawExpense.amount ?? "";
  const resolvedDate = normalizeExpenseDateForForm(
    rawExpense.date ?? details.date,
    fallbackDate,
  );
  return {
    expenseName:
      details.expenseName ||
      details.name ||
      rawExpense.expenseName ||
      rawExpense.name ||
      "",
    amount: resolvedAmount === "" ? "" : String(resolvedAmount),
    netAmount:
      details.netAmount != null
        ? String(details.netAmount)
        : resolvedAmount === ""
          ? ""
          : String(resolvedAmount),
    transactionType: normalizeExpenseTransactionType(details.type || rawExpense.type || "loss"),
    comments: details.comments || rawExpense.comments || "",
    date: resolvedDate,
    categoryId: rawExpense.categoryId || details.categoryId || "",
    creditDue:
      details.creditDue != null
        ? String(details.creditDue)
        : rawExpense.creditDue != null
          ? String(rawExpense.creditDue)
          : "",
  };
}

export function buildExpenseUpdatePayloadForPaymentMethod(rawExpense, newPaymentMethodName) {
  const fd = mapDetailedExpenseToFormFields(rawExpense, "");
  const amount = Number(fd.amount) || 0;
  const normalizedPaymentMethod = normalizePaymentMethod(newPaymentMethodName);
  const budgetIds = Array.isArray(rawExpense.budgetIds) ? rawExpense.budgetIds : [];
  const netAmount = Number(fd.netAmount) || amount;
  return {
    date: fd.date,
    budgetIds,
    categoryId: String(fd.categoryId ?? ""),
    expense: {
      expenseName: String(fd.expenseName || "").trim(),
      amount,
      netAmount,
      paymentMethod: normalizedPaymentMethod,
      type: normalizeExpenseTransactionType(fd.transactionType),
      comments: fd.comments || "",
      creditDue: normalizedPaymentMethod === "creditNeedToPaid" ? amount : Number(fd.creditDue) || 0,
    },
  };
}
