import { normalizePaymentMethod } from "@/features/expenses/utils/expensePaymentMethodUtils";
import { normalizeExpenseDateForForm } from "@/domain/expenses/expense.transformers";
import { computeBillExpensesTotal, resolveExpensesFromApi } from "./billExpenseLineUtils";

function normalizeBudgetIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object" && raw instanceof Set) return [...raw];
  return [];
}

export function fromApiResponse(raw, fallbackDate = "") {
  const amountRaw = raw.amount ?? 0;
  const expenses = resolveExpensesFromApi(raw);
  const totalFromLines = computeBillExpensesTotal(expenses);
  const amountStr =
    expenses.length > 0 ? String(totalFromLines) : amountRaw === "" ? "" : String(amountRaw);
  const dateValue = normalizeExpenseDateForForm(raw.date, fallbackDate);
  return {
    id: raw.id,
    name: raw.name || raw.billName || raw.title || "",
    description: raw.description || "",
    amount: amountStr,
    date: dateValue,
    type: String(raw.type || "loss").toLowerCase(),
    paymentMethod: normalizePaymentMethod(raw.paymentMethod || "cash"),
    categoryId: raw.categoryId != null && raw.categoryId !== 0 ? String(raw.categoryId) : "",
    expenses,
    budgetIds: normalizeBudgetIds(raw.budgetIds),
  };
}

export function toListItem(raw) {
  const bill = fromApiResponse(raw);
  const dateStr = bill.date || "";
  const dueDate = dateStr;
  const status = raw.status || "PENDING";
  const isPaid = status === "PAID";
  const overdue =
    !isPaid &&
    dateStr &&
    (() => {
      const d = new Date(dateStr);
      return !Number.isNaN(d.getTime()) && d < new Date(new Date().toDateString());
    })();
  return {
    id: bill.id,
    title: bill.name,
    subtitle: bill.description || bill.type || "",
    amount: Number(bill.amount) || 0,
    dueDate,
    date: dateStr,
    status: isPaid ? "PAID" : overdue ? "OVERDUE" : "PENDING",
    isOverdue: overdue,
  };
}
